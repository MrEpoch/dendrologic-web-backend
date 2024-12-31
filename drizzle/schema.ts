import {
  pgTable,
  unique,
  uuid,
  text,
  timestamp,
  uniqueIndex,
  boolean,
  foreignKey,
  integer,
  json,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const geoImage = pgTable(
  "geo_image",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    kod: text().notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    images: text().array().default([""]).notNull(),
  },
  (table) => {
    return {
      geoImageKodUnique: unique("geo_image_kod_unique").on(table.kod),
    };
  },
);

export const user = pgTable(
  "user",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: text().notNull(),
    passwordHash: text("password_hash").notNull(),
    // TODO: failed to parse database type 'bytea'
    recoveryCode: unknown("recovery_code").notNull(),
    // TODO: failed to parse database type 'bytea'
    totpKey: unknown("totp_key"),
    username: text().notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    images: text().array().default([""]).notNull(),
  },
  (table) => {
    return {
      email: uniqueIndex("email").using("btree", sql`lower(email)`),
      userEmailUnique: unique("user_email_unique").on(table.email),
      userUsernameUnique: unique("user_username_unique").on(table.username),
    };
  },
);

export const emailVerificationRequest = pgTable(
  "email_verification_request",
  {
    id: text().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    code: text().notNull(),
    email: text().notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => {
    return {
      emailVerificationRequestUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "email_verification_request_user_id_user_id_fk",
      }),
    };
  },
);

export const sessionPasswordReset = pgTable(
  "session_password_reset",
  {
    id: text().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    email: text().notNull(),
    code: text().notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    twoFaEnabled: boolean("two_fa_enabled").default(false).notNull(),
    expiresAt: integer("expires_at").notNull(),
  },
  (table) => {
    return {
      sessionPasswordResetUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "session_password_reset_user_id_user_id_fk",
      }),
    };
  },
);

export const session = pgTable(
  "session",
  {
    id: text().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    twoFaVerified: boolean("two_fa_verified").default(false).notNull(),
  },
  (table) => {
    return {
      sessionUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "session_user_id_user_id_fk",
      }),
    };
  },
);

export const geoRequest = pgTable(
  "geo_request",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    geodata: json(),
    requestName: text("request_name").notNull(),
  },
  (table) => {
    return {
      geoRequestUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "geo_request_user_id_user_id_fk",
      }),
    };
  },
);
