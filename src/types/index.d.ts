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
  | "2FA_NOT_ENABLED"
  | "INTERNAL_SERVER_ERROR"
  | "ERROR_ADDING_GEO_IMAGE"
  | "FILE_ERROR"
  | "FILE_NAME_MISSING"
  | "DATABASE_ERROR"
  | "EXPIRED_CODE";

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

const cookieRoutes = [
  "/api/auth/login", // Creates normal session
  "/api/auth/register", // Creates normal session
  "/api/auth/reset-password", // Creates password-session
  "/api/auth/forgot-password", // Creates normal session
  "/api/auth/settings/update-password", // Creates normal session
  "/api/auth/resend/verify-email", // Creates email session
  "/api/auth/register", // Creates email session
  "/api/auth/settings/update-email", // Creates email session
];

export interface EmailVerificationRequest {
  id: string;
  userId: string;
  code: string;
  email: string;
  expiresAt: Date;
}
