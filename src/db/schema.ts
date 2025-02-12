import { InferSelectModel, sql, SQL } from "drizzle-orm";
import {
  pgTable,
  uuid,
  timestamp,
  text,
  boolean,
  uniqueIndex,
  AnyPgColumn,
  customType,
  integer,
  json,
  geometry,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

const bytea = customType<{ data: Uint8Array }>({
  dataType() {
    return "bytea";
  },
  toDriver(value: Uint8Array): Uint8Array {
    // Convert Uint8Array to a base64 string for storage in PostgreSQL
    return value;
  },
  fromDriver(value: Uint8Array): Uint8Array {
    // Convert the base64 string back to a Uint8Array when reading from the database
    return new Uint8Array(value);
  },
});

export const userTable = pgTable(
  "user",
  {
    id: uuid("id").defaultRandom().primaryKey().unique(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    recoveryCode: bytea("recovery_code", {
      notNull: false,
      default: false,
    }).notNull(),
    totpKey: bytea("totp_key", {
      notNull: false,
      default: false,
    }),
    username: text("username").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    images: text("images").array().default([]).notNull(),
  },
  (table) => ({
    emailUniqueIndex: uniqueIndex("email").on(lower(table.email)),
  }),
);

export const feature = pgTable("feature", {
  id: uuid("id").defaultRandom().primaryKey().unique(),

  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),

  geometry_type: text("geometry_type").notNull(),
  geometry_coordinates: geometry("geometry_coordinates", {
    type: "point",
    mode: "xy",
    srid: 4326,
  }).notNull(),
  nazev: text("nazev").notNull(),
  pocet: integer("pocet").notNull(),
  images: text("images").array().default([]).notNull(),
});

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  twoFaVerified: boolean("two_fa_verified").notNull().default(false),
});

export const emailVerificationRequestTable = pgTable(
  "email_verification_request",
  {
    id: text("id").primaryKey().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userTable.id),
    code: text("code").notNull(),
    email: text("email").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
);

export const passwordResetSessionTable = pgTable("session_password_reset", {
  id: text("id").primaryKey().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  email: text("email").notNull(),
  code: text("code").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  twoFaEnabled: boolean("two_fa_enabled").notNull().default(false),
  expiresAt: integer("expires_at").notNull(),
});

export const geoRequestTable = pgTable("geo_request", {
  id: uuid("id").defaultRandom().primaryKey().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  geodata: json(),
  requestName: text("request_name").notNull(),
});

export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}

export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
