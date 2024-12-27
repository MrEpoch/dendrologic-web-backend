import { ExpiringTokenBucket } from "./rate-limit";

export const sendVerificationEmailBucket = new ExpiringTokenBucket<string>(
  5,
  60 * 10,
);
