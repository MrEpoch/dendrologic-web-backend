import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sessionTable, userTable } from "../db/schema";
import { db } from "@/db";
import { sha256 } from "@oslojs/crypto/sha2";
import { eq, sql } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { User } from "./user";

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  token: string,
  userId: string,
  flags: SessionFlags,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  // delete where there are more than 5 sessions for 1 user
  await db.execute(sql`
    WITH user_sessions AS (
      SELECT ${sessionTable.id}
      FROM ${sessionTable}
      WHERE ${sessionTable.userId} = ${userId}
      ORDER BY ${sessionTable.expiresAt} DESC
      LIMIT 5
    )
    DELETE FROM ${sessionTable}
    WHERE ${sessionTable.userId} = ${userId}
    AND ${sessionTable.id} NOT IN (SELECT ${sessionTable.id} FROM user_sessions);
  `);

  const session: Session = {
    id: sessionId,
    userId,
    twoFactorVerified: flags.twoFactorVerified,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await db.insert(sessionTable).values(session);
  return session;
}

export async function setSessionAs2FAVerified(
  sessionId: string,
): Promise<void> {
  await db
    .update(sessionTable)
    .set({ twoFaVerified: true })
    .where(eq(sessionTable.id, sessionId));
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await db
    .select({ user: userTable, session: sessionTable })
    .from(sessionTable)
    .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
    .where(eq(sessionTable.id, sessionId));
  if (result.length < 1) {
    return { session: null, user: null };
  }
  const { user, session } = result[0];
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessionTable)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessionTable.id, session.id));
  }

  const userV: User = {
    id: user.id,
    email: user.email,
    username: user.username,
    emailVerified: user.emailVerified,
    registered2FA: Boolean(user.totpKey),
  };

  return {
    session: {
      twoFactorVerified: session.twoFaVerified,
      ...session,
    },
    user: userV,
  };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export const sessionCookieConfig = (expiresAt?: Date) => {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: expiresAt ?? 0,
    path: "/",
  };
};

export function setSessionTokenCookie(token: string, expiresAt: Date): void {
  cookies().set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export function deleteSessionTokenCookie(): void {
  cookies().set("session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    let token = cookies().get("session")?.value;
    if (!token) {
      if (headers().get("Authorization-Session") !== null) {
        token = headers().get("Authorization-Session") ?? undefined;
        token?.length === 0 && (token = undefined);
      }
    }
    if (!token) {
      return { session: null, user: null };
    }
    const result = await validateSessionToken(token);
    return result;
  },
);

export async function invalidateUserSessions(userId: string): Promise<void> {
  await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
}

export interface SessionFlags {
  twoFactorVerified: boolean;
}

export interface Session extends SessionFlags {
  id: string;
  expiresAt: Date;
  userId: string;
}

type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
