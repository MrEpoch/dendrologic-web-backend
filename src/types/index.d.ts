export type errorTypes =
  | "UNAUTHORIZED"
  | "UNKNOWN_GEO_REQUEST"
  | "FILE_UPLOAD_ERROR"
  | "BAD_REQUEST"
  | "TOO_MANY_REQUESTS"
  | "EMAIL_NOT_AVAILABLE"
  | "WEAK_PASSWORD"
  | "EMAIL_NOT_VERIFIED"
  | "FORBIDDEN"
  | "INVALID_KEY"
  | "INVALID_CODE"
  | "INVALID_RECOVERY_CODE"
  | "2FA_NOT_ENABLED";

const routes = [
  "/auth/login",
  "/auth/register",
  "/auth/email-verify",
  "/auth/2fa/setup",
  "/auth/2fa/reset",
  "/auth/2fa",
  "/auth/reset-password/2fa",
  "/auth/reset-password/2fa",
];
