import { db } from "@/db";
import { encryptString } from "./encryption";
import { hashPassword } from "./password";
import { generateRandomRecoveryCode } from "./recovery";
import { User, userTable } from "@/db/schema";

export async function createUser(
  email: string,
  username: string,
  password: string,
): Promise<User> {
  const passwordHash = await hashPassword(password);
  const recoveryCode = generateRandomRecoveryCode();
  const encryptedRecoveryCode = encryptString(recoveryCode);

  const user = await db.insert(userTable).values({
    email,
    emailVerified: false,
    username,
    passwordHash,
    recoveryCode: encryptedRecoveryCode,
  });

  if (!user) {
    throw new Error("Failed to create user");
  }

  return user;
}
