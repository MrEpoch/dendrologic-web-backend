import { pgTable, varchar, uuid, timestamp, geometry, json } from "drizzle-orm/pg-core";

export const geoRequestTable = pgTable("users", {
  id: uuid().defaultRandom().primaryKey().unique(),
  name: varchar({ length: 255 }).notNull().unique(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  location: geometry("location", { type: "point", mode: "xy", srid: 4326 }).notNull(),
  geojson: json().notNull(),
});
