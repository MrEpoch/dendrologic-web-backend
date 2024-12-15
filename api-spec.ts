import { z } from "zod";

enum required {
  IP_ADDRESS,
  JSON,
  REQ_ORIGIN,
  SESSION,
  TWO_FACTOR,
}

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

export const POST_API_ROUTES = {
  // Auth

  REGISTER: {
    route: "/api/auth/register",
    json_data: {
      email: z.string().email().min(1),
      username: z.string().max(255).min(3),
      password: z.string().min(8).max(255),
    },
    required: [required.IP_ADDRESS, required.JSON, required.REQ_ORIGIN],
    response_success: {
      success: true,
      error: null,
      redirect: "/auth/verify-email",
      emailRequestId: z.string(),
      sessionToken: z.string(),
    },
  },
  LOGIN: {
    route: "/api/auth/login",
    json_data: {
      email: z.string().email().min(1),
      password: z.string().min(8).max(255),
    },
    required: [required.IP_ADDRESS, required.JSON, required.REQ_ORIGIN],
    response_success: {
      success: true,
      error: null,
      redirect: "/auth/2fa",
      sessionToken: z.string(),
    },
  },
  FORGOT_PASSWORD: {
    route: "/api/auth/forgot-password",
    json_data: {
      email: z.string().email().min(1),
    },
    required: [required.IP_ADDRESS, required.JSON, required.REQ_ORIGIN],
    response_success: {
      success: true,
      error: null,
      redirect: "/auth/reset-password/verify-email",
      sessionToken: z.string(),
    },
  },
  VERIFY_EMAIL: {
    route: "/api/auth/verify-email",
    json_data: {
      code: z.string().length(8),
    },
    response_success: {
      redirect: ["/auth/settings", "/auth/2fa/setup"],
      success: true,
    },
    required: [required.REQ_ORIGIN, required.IP_ADDRESS, required.SESSION],
  },
  VERIFY_EMAIL_RESEND: {
    route: "/api/auth/verify-email/resend",
    json_data: {},
    required: [
      required.REQ_ORIGIN,
      required.SESSION,
      required.IP_ADDRESS,
      required.TWO_FACTOR,
    ],
    response_success: {
      success: true,
      message: z.string(),
      emailRequestId: z.string(),
    },
  },
  "2FA": {
    route: "/api/auth/2fa",
    json_data: {
      code: z.string().length(6),
    },
    required: [
      required.REQ_ORIGIN,
      required.SESSION,
      required.IP_ADDRESS,
      required.TWO_FACTOR,
    ],
    response_success: {
      success: true,
      redirect: "/auth/settings",
    },
  },
  "2FA-SETUP": {
    route: "/api/auth/2fa/setup",
    json_data: {
      key: z.string().length(28),
      code: z.string().min(1),
    },
    required: [required.REQ_ORIGIN, required.SESSION, required.IP_ADDRESS],
    response_success: {
      success: true,
      recoveryCode: z.string(),
    },
  },
  "2FA-RESET": {
    route: "/api/auth/2fa/reset",
    json_data: {
      code: z.string().min(1),
    },
    required: [required.REQ_ORIGIN, required.SESSION, required.IP_ADDRESS],
    response_success: {
      success: true,
      redirect: "/auth/2fa/setup",
    },
  },
  SETTINGS_REGENERATE_RECOVERY_CODE: {
    route: "/api/auth/settings/regenerate-recovery-code",
    json_data: {},
    required: [required.REQ_ORIGIN, required.SESSION, required.IP_ADDRESS],
    response_success: {
      success: true,
      recoveryCode: z.string(),
    },
  },
  SETTINGS_UPDATE_PASSWORD: {
    route: "/api/auth/settings/update-password",
    json_data: {
      password: z.string().min(8).max(255),
      newPassword: z.string().min(8).max(255),
    },
    required: [required.REQ_ORIGIN, required.SESSION, required.IP_ADDRESS],
    response_success: {
      success: true,
      error: null,
      sessionToken: z.string(),
    },
  },
  SETTINGS_UPDATE_EMAIL: {
    route: "/api/auth/settings/update-email",
    json_data: {
      email: z.string().email().min(1),
    },
    required: [required.REQ_ORIGIN, required.SESSION, required.IP_ADDRESS],
    response_success: {
      success: true,
      emailVerificationRequestId: z.string(),
      message: z.string(),
      redirect: "/auth/verify-email",
    },
  },
  RESET_PASSWORD: {
    route: "/api/auth/reset-password",
    json_data: {
      password: z.string().min(8).max(255),
    },
    required: [required.REQ_ORIGIN, required.SESSION, required.IP_ADDRESS],
    response_success: {
      success: true,
      error: null,
      sessionToken: z.string(),
    },
  },
  RESET_PASSWORD_VERIFY_EMAIL: {
    route: "/api/auth/reset-password/verify-email",
    json_data: {
      code: z.string().min(1),
    },
    required: [required.REQ_ORIGIN, required.SESSION, required.IP_ADDRESS],
    response_success: {
      success: true,
      redirect: "/auth/reset-password/2fa",
    },
  },
  RESET_PASSWORD_2FA_WITH_RECOVERY_CODE: {
    route: "/api/auth/reset-password/2fa/2fa-with-recovery-code",
    json_data: {
      code: z.string().min(1),
    },
    required: [required.REQ_ORIGIN, required.SESSION, required.IP_ADDRESS],
    response_success: {
      success: true,
      redirect: "/auth/reset-password",
    },
  },
  RESET_PASSWORD_2FA_TOTP_RESET: {
    route: "/api/auth/reset-password/2fa/2fa-with-recovery-code",
    json_data: {
      code: z.string().min(1),
    },
    required: [required.REQ_ORIGIN, required.SESSION, required.IP_ADDRESS],
    response_success: {
      success: true,
      redirect: "/auth/reset-password",
    },
  },

  // Geo

  IMAGES: {
    route: "/api/images",
    json_data: {
      image: z.string(),
      kod: z.string().min(1),
    },
    required: [required.REQ_ORIGIN, required.SESSION, required.IP_ADDRESS],
    response_success: {
      success: true,
      images: {
        kod: z.string(),
        id: z.string(),
        images: z.array(z.string()),
        created_at: z.date(),
        updated_at: z.date(),
      },
    },
  },
};

export const GET_API_ROUTES = {
  // Auth

  LOGOUT: {
    route: "/api/auth/logout",
    json_data: {},
    required: [required.IP_ADDRESS, required.REQ_ORIGIN, required.SESSION],
    response_success: {
      success: true,
      redirect: "/",
    },
  },
  VERIFY_EMAIL: {
    route: "/api/auth/verify-email",
    json_data: {},
    required: [required.REQ_ORIGIN, required.IP_ADDRESS, required.SESSION],
    response_success: {
      success: true,
      verificationRequest: {
        id: z.string(),
        userId: z.string(),
        code: z.string(),
        email: z.string().email(),
        expiresAt: z.date(),
      },
      user: User,
      emailRequestId: z.string(),
    },
  },
  SETTINGS: {
    route: "/api/auth/settings",
    json_data: {
      success: true,
      recoveryCode: z.string(),
      user: User,
      session: Session,
    },
    required: [required.REQ_ORIGIN, required.SESSION, required.IP_ADDRESS],
    response_success: {
      success: true,
      redirect: "/auth/2fa/setup",
    },
  },

  "2FA": {
    route: "/api/auth/2fa",
    json_data: {},
    required: [
      required.REQ_ORIGIN,
      required.SESSION,
      required.IP_ADDRESS,
      required.TWO_FACTOR,
    ],
    response_success: {
      success: true,
    },
  },
  "2FA-SETUP": {
    route: "/api/auth/2fa/setup",
    json_data: {},
    required: [required.REQ_ORIGIN, required.SESSION, required.IP_ADDRESS],
    response_success: {
      success: true,
      keyURI: z.string(),
      qrCode: z.string(),
      encodedTOTPKey: z.string(),
    },
  },
  "2FA-RESET": {
    route: "/api/auth/2fa/reset",
    json_data: {},
    required: [required.REQ_ORIGIN, required.SESSION, required.IP_ADDRESS],
    response_success: {
      success: true,
    },
  },

  RESET_PASSWORD: {
    route: "/api/auth/reset-password",
    json_data: {},
    required: [required.REQ_ORIGIN, required.SESSION, required.IP_ADDRESS],
    response_success: {
      success: true,
    },
  },
  RESET_PASSWORD_VERIFY_EMAIL: {
    route: "/api/auth/reset-password/verify-email",
    json_data: {},
    required: [required.REQ_ORIGIN, required.SESSION, required.IP_ADDRESS],
    response_success: {
      success: true,
      session: Session,
    },
  },

  // Geo

  IMAGES_ID: {
    route: "/api/images/:id",
    json_data: {},
    required: [required.REQ_ORIGIN, required.SESSION, required.IP_ADDRESS],
    response_success: {
      success: true,
      images: {
        kod: z.string(),
        id: z.string(),
        images: z.array(z.string()),
        created_at: z.date(),
        updated_at: z.date(),
      },
    },
  },
};
