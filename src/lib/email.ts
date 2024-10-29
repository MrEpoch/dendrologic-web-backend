import { db } from "@/db";
import { emailVerificationRequestTable, userTable } from "@/db/schema";
import { encodeBase32 } from "@oslojs/encoding";
import { eq } from "drizzle-orm";
import { generateRandomOTP } from "./recovery";
import { sendMail } from "./nodemailer";
import { cookies, headers } from "next/headers";
import { getCurrentSession } from "./sessionTokens";
import { ExpiringTokenBucket } from "./rate-limit";

export async function getEmailVerificationRequestFromUserId(
  userId: string,
): Promise<EmailVerificationRequest | null> {
  const emailRequest = await db
    .select()
    .from(emailVerificationRequestTable)
    .where(eq(emailVerificationRequestTable.userId, userId));
  if (!emailRequest || emailRequest.length < 1) {
    return null;
  }
  return {
    id: emailRequest[0].id,
    userId: emailRequest[0].userId,
    code: emailRequest[0].code,
    email: emailRequest[0].email,
    expiresAt: emailRequest[0].expiresAt,
  };
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
  const emailDb = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email));

  return emailDb && emailDb.length === 0;
}

export async function getUserEmailVerificationRequest(
  userId: string,
  id: string,
): Promise<EmailVerificationRequest | null> {
  const emailRequest = await db
    .select()
    .from(emailVerificationRequestTable)
    .where(
      eq(emailVerificationRequestTable.userId, userId) &&
        eq(emailVerificationRequestTable.id, id),
    );
  if (!emailRequest || emailRequest.length < 1) {
    return null;
  }
  return {
    id: emailRequest[0].id,
    userId: emailRequest[0].userId,
    code: emailRequest[0].code,
    email: emailRequest[0].email,
    expiresAt: emailRequest[0].expiresAt,
  };
}

export async function createEmailVerificationRequest(
  userId: string,
  email: string,
): Promise<EmailVerificationRequest> {
  deleteUserVerificationRequest(userId);
  const idBytes = new Uint8Array(20);

  crypto.getRandomValues(idBytes);
  const id = encodeBase32(idBytes).toLowerCase();

  const code = generateRandomOTP();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10);

  await db.insert(emailVerificationRequestTable).values({
    id,
    userId,
    code,
    email,
    expiresAt,
  });

  return {
    id,
    userId,
    code,
    email,
    expiresAt,
  };
}

export async function deleteUserVerificationRequest(
  userId: string,
): Promise<void> {
  await db
    .delete(emailVerificationRequestTable)
    .where(eq(emailVerificationRequestTable.userId, userId));
}

export async function sendVerificationEmail(
  email: string,
  code: string,
): Promise<void> {
  await sendMail({
    from: process.env.MAIL_FROM ?? "",
    to: email,
    subject: "Verify email",
    text: `Your verification code is ${code}`,
    html: `<p>Your verification code is ${code}</p>`,
  });
  console.log("sendVerificationEmail", email, code);
}

export function setEmailRequestCookie(request: EmailVerificationRequest): void {
  cookies().set("email_verification", request.id, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: request.expiresAt,
  });
}

export function deleteEmailRequestCookie(): void {
  cookies().set("email_verification", "", {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });
}

export async function getUserEmailVerificationFromRequest(): Promise<EmailVerificationRequest | null> {
  const { user } = await getCurrentSession();
  if (user === null) {
    return null;
  }

  let id = cookies().get("email_verification")?.value;
  if (!id) {
    if (headers().get("Authorization-Email") !== null) {
      id = headers().get("Authorization-Email") ?? undefined;
      id?.length === 0 && (id = undefined);
    }
  }
  if (!id) {
    return null;
  }

  const request = await getUserEmailVerificationRequest(user.id, id);
  if (!request) {
    return null;
  }
  return request;
}

export const sendVerificationEmailBucket = new ExpiringTokenBucket<string>(
  5,
  60 * 10,
);

export interface EmailVerificationRequest {
  id: string;
  userId: string;
  code: string;
  email: string;
  expiresAt: Date;
}
