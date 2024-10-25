import { db } from "@/db";
import { decrypt, decryptToString, encrypt, encryptString } from "./encryption";
import { hashPassword } from "./password";
import { generateRandomRecoveryCode } from "./recovery";
import { userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createUser(
  email: string,
  username: string,
  password: string,
): Promise<User> {
  const passwordHash = await hashPassword(password);
  const recoveryCode = generateRandomRecoveryCode();
  const encryptedRecoveryCode = encryptString(recoveryCode);

  const user = await db
    .insert(userTable)
    .values({
      email,
      emailVerified: false,
      username,
      passwordHash,
      recoveryCode: encryptedRecoveryCode,
    })
    .returning();

  if (!user || user.length < 1) {
    throw new Error("Failed to create user");
  }

  return {
    id: user[0].id,
    email,
    username,
    emailVerified: false,
    registered2FA: false,
  };
}

export async function updateUserPassword(
  userId: string,
  password: string,
): Promise<void> {
  const passwordHash = await hashPassword(password);
  await db
    .update(userTable)
    .set({ passwordHash })
    .where(eq(userTable.id, userId));
}

export async function updateUserEmailAndSetEmailAsVerified(
  userId: string,
  email: string,
): Promise<void> {
  await db
    .update(userTable)
    .set({ email, emailVerified: true })
    .where(eq(userTable.id, userId));
}

export async function setUserAsEmailVerifiedIfEmailMatches(
  userId: string,
  email: string,
): Promise<boolean> {
  const result = await db
    .update(userTable)
    .set({ emailVerified: true })
    .where(eq(userTable.id, userId) && eq(userTable.email, email))
    .returning();
  return result && result.length > 0;
}

export async function getUserPasswordHash(userId: string): Promise<string> {
  const user = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId));
  if (!user || user.length < 1) {
    throw new Error("User not found");
  }
  return user[0].passwordHash;
}

export async function getUserRecoveryCode(userId: string): Promise<string> {
  const user = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId));
  if (!user || user.length < 1) {
    throw new Error("User not found");
  }
  return decryptToString(user[0].recoveryCode);
}

export async function getUserTOTPKey(
  userId: string,
): Promise<Uint8Array | null> {
  const user = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId));
  if (!user || user.length < 1) {
    throw new Error("User not found");
  }

  if (user[0].totpKey === null) {
    return null;
  }

  return decrypt(user[0].totpKey);
}

export async function updateUserTOTPKey(
  userId: string,
  key: Uint8Array,
): Promise<void> {
  const encryptedKey = encrypt(key);
  await db
    .update(userTable)
    .set({ totpKey: encryptedKey })
    .where(eq(userTable.id, userId));
}

export async function resetUserRecoveryCode(userId: string): Promise<string> {
  const recoveryCode = generateRandomRecoveryCode();
  const encryptedRecoveryCode = encryptString(recoveryCode);
  await db
    .update(userTable)
    .set({ recoveryCode: encryptedRecoveryCode })
    .where(eq(userTable.id, userId));
  return recoveryCode;
}

export async function getUserFromEmail(email: string): Promise<User | null> {
  const user = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email));

  if (!user || user.length < 1) {
    return null;
  }
  return {
    id: user[0].id,
    email: user[0].email,
    username: user[0].username,
    emailVerified: user[0].emailVerified,
    registered2FA: Boolean(user[0].totpKey),
  };
}

export interface User {
  id: string;
  email: string;
  username: string;
  emailVerified: boolean;
  registered2FA: boolean;
}
