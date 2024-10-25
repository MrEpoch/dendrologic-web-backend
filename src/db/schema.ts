import { InferSelectModel, sql, SQL } from "drizzle-orm";
import {
  pgTable,
  varchar,
  uuid,
  timestamp,
  geometry,
  json,
  text,
  boolean,
  uniqueIndex,
  AnyPgColumn,
  customType,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

const bytea = customType<{ data: Uint8Array }>({
  dataType() {
    return "bytea";
  },
  toDriver(value: Uint8Array | string): string {
    // Convert Uint8Array to a base64 string for storage in PostgreSQL
    if (value instanceof Uint8Array) {
      return Buffer.from(value).toString("base64");
    }
    return value;
  },
  fromDriver(value: string): Uint8Array {
    // Convert the base64 string back to a Uint8Array when reading from the database
    return Buffer.from(value, "base64");
  },
});

export const geoRequestTable = pgTable("geo_request", {
  id: uuid("id").defaultRandom().primaryKey().unique(),
  name: varchar({ length: 255 }).notNull().unique(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  location: geometry("location", {
    type: "point",
    mode: "xy",
    srid: 4326,
  }).notNull(),
  geojson: json("geojson").notNull(),
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
    emailVerified: boolean("email_verified").notNull().default(false),
  },
  (table) => ({
    emailUniqueIndex: uniqueIndex("email").on(lower(table.email)),
  }),
);

export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}

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

export const passwordResetSessionTable = pgTable("password_reset_session", {
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

const insertUserSchema = createInsertSchema(userTable, {
  id: (schema) => schema.id.uuid(),
  email: (schema) => schema.email.email(),
  username: (schema) => schema.username,
  emailVerified: (schema) => schema.emailVerified,
  passwordHash: (schema) => schema.passwordHash,
  recoveryCode: (schema) => schema.recoveryCode,
});

const insertGeoRequestSchema = createInsertSchema(geoRequestTable, {
  id: (schema) => schema.id.uuid(),
  name: (schema) => schema.name,
  created_at: (schema) => schema.created_at,
  updated_at: (schema) => schema.updated_at,
  location: (schema) => schema.location,
  geojson: z.object({
    type: z.literal("FeatureCollection"),
    features: z.array(
      z.object({
        type: z.literal("Feature"),
        properties: z.object({
          name: z.string(),
          id: z.string(),
          hasImage: z.boolean(),
        }),
        geometry: z.object({
          type: z.literal("Polygon"),
          coordinates: z.array(z.array(z.number())),
        }),
      }),
    ),
  }),
});

export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
