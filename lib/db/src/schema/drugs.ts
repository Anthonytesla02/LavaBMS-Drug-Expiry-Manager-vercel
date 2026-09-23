import { date, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const drugsTable = pgTable("drugs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  alternativeNames: text("alternative_names").array().notNull().default([]),
  brandNames: text("brand_names").array().notNull().default([]),
  expiryDate: date("expiry_date", { mode: "string" }).notNull(),
  batchNumber: text("batch_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertDrugSchema = createInsertSchema(drugsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDrug = z.infer<typeof insertDrugSchema>;
export type Drug = typeof drugsTable.$inferSelect;