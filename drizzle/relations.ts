import { relations } from "drizzle-orm/relations";
import {
  user,
  emailVerificationRequest,
  sessionPasswordReset,
  session,
  geoRequest,
} from "./schema";

export const emailVerificationRequestRelations = relations(
  emailVerificationRequest,
  ({ one }) => ({
    user: one(user, {
      fields: [emailVerificationRequest.userId],
      references: [user.id],
    }),
  }),
);

export const userRelations = relations(user, ({ many }) => ({
  emailVerificationRequests: many(emailVerificationRequest),
  sessionPasswordResets: many(sessionPasswordReset),
  sessions: many(session),
  geoRequests: many(geoRequest),
}));

export const sessionPasswordResetRelations = relations(
  sessionPasswordReset,
  ({ one }) => ({
    user: one(user, {
      fields: [sessionPasswordReset.userId],
      references: [user.id],
    }),
  }),
);

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const geoRequestRelations = relations(geoRequest, ({ one }) => ({
  user: one(user, {
    fields: [geoRequest.userId],
    references: [user.id],
  }),
}));
