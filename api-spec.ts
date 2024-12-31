import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import fs from "fs";

const required = {
  IP_ADDRESS: "IP_ADDRESS",
  JSON: "JSON",
  REQ_ORIGIN: "REQ_ORIGIN",
  SESSION: "SESSION",
  TWO_FACTOR: "TWO_FACTOR",
};

const Session = {
  twoFactorVerified: z.boolean(),
  id: z.string(),
  userId: z.string(),
  expiresAt: z.date(),
  twoFaVerified: z.boolean(),
};

const User = {
  id: z.string(),
  email: z.string().email().min(1),
  username: z.string().max(255).min(3),
  emailVerified: z.boolean(),
  registered2FA: z.boolean(),
};

export const POST_API_ROUTES = z.object({
  // Auth

  REGISTER: z.object({
    route: z.literal("/api/auth/register"),
    json_data: z.object({
      email: z.string().email().min(1),
      username: z.string().max(255).min(3),
      password: z.string().min(8).max(255),
    }),
    required: z.union([
      z.literal(required.IP_ADDRESS),
      z.literal(required.JSON),
      z.literal(required.REQ_ORIGIN),
    ]), // z.array([required.IP_ADDRESS, required.JSON, required.REQ_ORIGIN]),
    response_success: z.object({
      success: z.literal(true),
      error: z.literal(null),
      redirect: z.literal("/auth/verify-email"),
      emailRequestId: z.string(),
      sessionToken: z.string(),
    }),
  }),
  LOGIN: z.object({
    route: z.literal("/api/auth/login"),
    json_data: z.object({
      email: z.string().email().min(1),
      password: z.string().min(8).max(255),
    }),
    required: z.union([
      z.literal(required.IP_ADDRESS),
      z.literal(required.JSON),
      z.literal(required.REQ_ORIGIN),
    ]),
    response_success: z.object({
      success: z.literal(true),
      error: z.literal(null),
      redirect: z.literal("/auth/2fa"),
      sessionToken: z.string(),
    }),
  }),
  FORGOT_PASSWORD: z.object({
    route: z.literal("/api/auth/forgot-password"),
    json_data: z.object({
      email: z.string().email().min(1),
    }),
    required: z.union([
      z.literal(required.IP_ADDRESS),
      z.literal(required.JSON),
      z.literal(required.REQ_ORIGIN),
    ]),
    response_success: z.object({
      success: z.literal(true),
      error: z.literal(null),
      redirect: z.literal("/auth/reset-password/verify-email"),
      sessionToken: z.string(),
    }),
  }),
  VERIFY_EMAIL: z.object({
    route: z.literal("/api/auth/verify-email"),
    json_data: z.object({
      code: z.string().length(8),
    }),
    response_success: z.object({
      redirect: z.union([
        z.literal("/auth/settings"),
        z.literal("/auth/2fa/setup"),
      ]),
      success: z.literal(true),
    }),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.IP_ADDRESS),
      z.literal(required.SESSION),
    ]),
  }),
  VERIFY_EMAIL_RESEND: z.object({
    route: z.literal("/api/auth/verify-email/resend"),
    json_data: z.object({}),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.SESSION),
      z.literal(required.IP_ADDRESS),
      z.literal(required.TWO_FACTOR),
    ]),
    response_success: z.object({
      success: z.literal(true),
      message: z.string(),
      emailRequestId: z.string(),
    }),
  }),
  "2FA": z.object({
    route: z.literal("/api/auth/2fa"),
    json_data: z.object({
      code: z.string().length(6),
    }),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.SESSION),
      z.literal(required.IP_ADDRESS),
      z.literal(required.TWO_FACTOR),
    ]),
    response_success: z.object({
      success: z.literal(true),
      redirect: z.literal("/auth/settings"),
    }),
  }),
  "2FA-SETUP": z.object({
    route: z.literal("/api/auth/2fa/setup"),
    json_data: z.object({
      key: z.string().length(28),
      code: z.string().min(1),
    }),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.SESSION),
      z.literal(required.IP_ADDRESS),
    ]),
    response_success: z.object({
      success: z.literal(true),
      recoveryCode: z.string(),
    }),
  }),
  "2FA-RESET": z.object({
    route: z.literal("/api/auth/2fa/reset"),
    json_data: z.object({
      code: z.string().min(1),
    }),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.SESSION),
      z.literal(required.IP_ADDRESS),
    ]),
    response_success: z.object({
      success: z.literal(true),
      redirect: z.literal("/auth/2fa/setup"),
    }),
  }),
  SETTINGS_REGENERATE_RECOVERY_CODE: z.object({
    route: z.literal("/api/auth/settings/regenerate-recovery-code"),
    json_data: z.object({}),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.SESSION),
      z.literal(required.IP_ADDRESS),
    ]),
    response_success: z.object({
      success: z.literal(true),
      recoveryCode: z.string(),
    }),
  }),
  SETTINGS_UPDATE_PASSWORD: z.object({
    route: z.literal("/api/auth/settings/update-password"),
    json_data: z.object({
      password: z.string().min(8).max(255),
      newPassword: z.string().min(8).max(255),
    }),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.SESSION),
      z.literal(required.IP_ADDRESS),
    ]),
    response_success: z.object({
      success: z.literal(true),
      error: z.literal(null),
      sessionToken: z.string(),
    }),
  }),
  SETTINGS_UPDATE_EMAIL: z.object({
    route: z.literal("/api/auth/settings/update-email"),
    json_data: z.object({
      email: z.string().email().min(1),
    }),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.SESSION),
      z.literal(required.IP_ADDRESS),
    ]),
    response_success: z.object({
      success: z.literal(true),
      emailVerificationRequestId: z.string(),
      message: z.string(),
      redirect: z.literal("/auth/verify-email"),
    }),
  }),
  RESET_PASSWORD: z.object({
    route: z.literal("/api/auth/reset-password"),
    json_data: z.object({
      password: z.string().min(8).max(255),
    }),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.SESSION),
      z.literal(required.IP_ADDRESS),
    ]),
    response_success: z.object({
      success: z.literal(true),
      error: z.literal(null),
      sessionToken: z.string(),
    }),
  }),
  RESET_PASSWORD_VERIFY_EMAIL: z.object({
    route: z.literal("/api/auth/reset-password/verify-email"),
    json_data: z.object({
      code: z.string().min(1),
    }),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.SESSION),
      z.literal(required.IP_ADDRESS),
    ]),
    response_success: z.object({
      success: z.literal(true),
      redirect: z.literal("/auth/reset-password/2fa"),
    }),
  }),
  RESET_PASSWORD_2FA_WITH_RECOVERY_CODE: z.object({
    route: z.literal("/api/auth/reset-password/2fa/2fa-with-recovery-code"),
    json_data: z.object({
      code: z.string().min(1),
    }),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.SESSION),
      z.literal(required.IP_ADDRESS),
    ]),
    response_success: z.object({
      success: z.literal(true),
      redirect: z.literal("/auth/reset-password"),
    }),
  }),
  RESET_PASSWORD_2FA_TOTP_RESET: z.object({
    route: z.literal("/api/auth/reset-password/2fa/2fa-with-recovery-code"),
    json_data: z.object({
      code: z.string().min(1),
    }),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.SESSION),
      z.literal(required.IP_ADDRESS),
    ]),
    response_success: z.object({
      success: z.literal(true),
      redirect: z.literal("/auth/reset-password"),
    }),
  }),

  // Geo

  IMAGES: z.object({
    route: z.literal("/api/images"),
    json_data: z.object({
      image: z.string(),
      kod: z.string().min(1),
    }),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.SESSION),
      z.literal(required.IP_ADDRESS),
    ]),
    response_success: z.object({
      success: z.literal(true),
      images: z.object({
        kod: z.string(),
        id: z.string(),
        images: z.array(z.string()),
        created_at: z.date(),
        updated_at: z.date(),
      }),
    }),
  }),
});

export const GET_API_ROUTES = z.object({
  // Auth

  LOGOUT: z.object({
    route: z.literal("/api/auth/logout"),
    json_data: z.object({}),
    required: z.union([
      z.literal(required.IP_ADDRESS),
      z.literal(required.REQ_ORIGIN),
      z.literal(required.SESSION),
    ]),
    response_success: z.object({
      success: z.literal(true),
      redirect: z.literal("/"),
    }),
  }),
  VERIFY_EMAIL: z.object({
    route: z.literal("/api/auth/verify-email"),
    json_data: z.object({}),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.IP_ADDRESS),
      z.literal(required.SESSION),
    ]),
    response_success: z.object({
      success: z.literal(true),
      verificationRequest: z.object({
        id: z.string(),
        userId: z.string(),
        code: z.string(),
        email: z.string().email(),
        expiresAt: z.date(),
      }),
      user: z.object(User),
      emailRequestId: z.string(),
    }),
  }),
  SETTINGS: z.object({
    route: z.literal("/api/auth/settings"),
    json_data: z.object({
      success: z.literal(true),
      recoveryCode: z.string(),
      user: z.object(User),
      session: z.object(Session),
    }),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.SESSION),
      z.literal(required.IP_ADDRESS),
    ]),
    response_success: z.object({
      success: z.literal(true),
      redirect: z.literal("/auth/2fa/setup"),
    }),
  }),

  "2FA": z.object({
    route: z.literal("/api/auth/2fa"),
    json_data: z.object({}),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.SESSION),
      z.literal(required.IP_ADDRESS),
      z.literal(required.TWO_FACTOR),
    ]),
    response_success: z.object({
      success: z.literal(true),
    }),
  }),
  "2FA-SETUP": z.object({
    route: z.literal("/api/auth/2fa/setup"),
    json_data: z.object({}),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.SESSION),
      z.literal(required.IP_ADDRESS),
    ]),
    response_success: z.object({
      success: z.literal(true),
      keyURI: z.string(),
      qrCode: z.string(),
      encodedTOTPKey: z.string(),
    }),
  }),
  "2FA-RESET": z.object({
    route: z.literal("/api/auth/2fa/reset"),
    json_data: z.object({}),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.SESSION),
      z.literal(required.IP_ADDRESS),
    ]),
    response_success: z.object({
      success: z.literal(true),
    }),
  }),

  RESET_PASSWORD: z.object({
    route: z.literal("/api/auth/reset-password"),
    json_data: z.object({}),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.SESSION),
      z.literal(required.IP_ADDRESS),
    ]),
    response_success: z.object({
      success: z.literal(true),
    }),
  }),
  RESET_PASSWORD_VERIFY_EMAIL: z.object({
    route: z.literal("/api/auth/reset-password/verify-email"),
    json_data: z.object({}),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.SESSION),
      z.literal(required.IP_ADDRESS),
    ]),
    response_success: z.object({
      success: z.literal(true),
      session: z.object(Session),
    }),
  }),

  // Geo

  IMAGES_ID: z.object({
    route: z.literal("/api/images/:id"),
    json_data: z.object({}),
    required: z.union([
      z.literal(required.REQ_ORIGIN),
      z.literal(required.SESSION),
      z.literal(required.IP_ADDRESS),
    ]),
    response_success: z.object({
      success: z.literal(true),
      images: z.object({
        kod: z.string(),
        id: z.string(),
        images: z.array(z.string()),
        created_at: z.date(),
        updated_at: z.date(),
      }),
    }),
  }),
});

const api_routes_json = zodToJsonSchema(
  z.object({
    POST: POST_API_ROUTES,
    GET: GET_API_ROUTES,
  }),
  "API_ROUTES_SCHEMA",
);

fs.writeFileSync("api-spec.json", JSON.stringify(api_routes_json));
