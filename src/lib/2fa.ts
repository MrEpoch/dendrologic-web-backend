import { sessionTable, userTable } from "@/db/schema";
import { decryptToString, encryptString } from "./encryption";
import { ExpiringTokenBucket } from "./rate-limit";
import { eq } from "drizzle-orm";
import { generateRandomRecoveryCode } from "./recovery";
import { db } from "@/db";

export const totpBucket = new ExpiringTokenBucket<string>(5, 60 * 30);
export const recoveryCodeBucket = new ExpiringTokenBucket<string>(3, 60 * 60);

export async function resetUser2FAWithRecoveryCode(
  userId: string,
  recoveryCode: string,
): Promise<boolean> {
  // Note: In Postgres and MySQL, these queries should be done in a transaction using SELECT FOR UPDATE
  const recoveryCodeDb = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId));
  if (recoveryCodeDb.length < 1) {
    return false;
  }

  const encryptedRecoveryCode = recoveryCodeDb[0].recoveryCode;
  const userRecoveryCode = decryptToString(encryptedRecoveryCode);
  if (recoveryCode !== userRecoveryCode) {
    return false;
  }

  const newRecoveryCode = generateRandomRecoveryCode();
  const encryptedNewRecoveryCode = encryptString(newRecoveryCode);
  await db
    .update(sessionTable)
    .set({ twoFaVerified: false })
    .where(eq(userTable.id, userId));
  // Compare old recovery code to ensure recovery code wasn't updated.
  //
  const result = await db
    .update(userTable)
    .set({ recoveryCode: encryptedNewRecoveryCode, totpKey: null })
    .where(
      eq(userTable.id, userId) &&
        eq(userTable.recoveryCode, encryptedRecoveryCode),
    );

  if (!result) {
    return false;
  }

  return true;
}
