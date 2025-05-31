import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["brand", "creator"] }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Creators table with profile information
export const creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  username: varchar("username").notNull().unique(),
  displayName: varchar("display_name").notNull(),
  bio: text("bio"),
  niche: varchar("niche").notNull(),
  followersCount: integer("followers_count").notNull(),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }).notNull(),
  averageRate: decimal("average_rate", { precision: 10, scale: 2 }).notNull(),
  location: varchar("location"),
  profileImageUrl: varchar("profile_image_url"),
  tags: text("tags").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Brands table
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  companyName: varchar("company_name").notNull(),
  industry: varchar("industry"),
  description: text("description"),
  website: varchar("website"),
  logoUrl: varchar("logo_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Campaigns table
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").references(() => brands.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  objective: varchar("objective").notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { enum: ["draft", "active", "completed", "cancelled"] }).default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Offers table
export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  creatorId: integer("creator_id").references(() => creators.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  message: text("message"),
  status: varchar("status", { enum: ["pending", "accepted", "rejected", "countered"] }).default("pending"),
  counterAmount: decimal("counter_amount", { precision: 10, scale: 2 }),
  counterMessage: text("counter_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contracts table
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  offerId: integer("offer_id").references(() => offers.id).notNull(),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
  terms: text("terms"),
  creatorSigned: boolean("creator_signed").default(false),
  brandSigned: boolean("brand_signed").default(false),
  creatorSignedAt: timestamp("creator_signed_at"),
  brandSignedAt: timestamp("brand_signed_at"),
  pdfUrl: varchar("pdf_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").references(() => contracts.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { enum: ["pending", "paid", "failed"] }).default("pending"),
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Performance reports table
export const performanceReports = pgTable("performance_reports", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").references(() => contracts.id).notNull(),
  reach: integer("reach"),
  impressions: integer("impressions"),
  engagement: integer("engagement"),
  clicks: integer("clicks"),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }),
  roi: decimal("roi", { precision: 5, scale: 2 }),
  generatedAt: timestamp("generated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  creator: one(creators, { fields: [users.id], references: [creators.userId] }),
  brand: one(brands, { fields: [users.id], references: [brands.userId] }),
}));

export const creatorsRelations = relations(creators, ({ one, many }) => ({
  user: one(users, { fields: [creators.userId], references: [users.id] }),
  offers: many(offers),
}));

export const brandsRelations = relations(brands, ({ one, many }) => ({
  user: one(users, { fields: [brands.userId], references: [users.id] }),
  campaigns: many(campaigns),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  brand: one(brands, { fields: [campaigns.brandId], references: [brands.id] }),
  offers: many(offers),
}));

export const offersRelations = relations(offers, ({ one }) => ({
  campaign: one(campaigns, { fields: [offers.campaignId], references: [campaigns.id] }),
  creator: one(creators, { fields: [offers.creatorId], references: [creators.id] }),
  contract: one(contracts, { fields: [offers.id], references: [contracts.offerId] }),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  offer: one(offers, { fields: [contracts.offerId], references: [offers.id] }),
  payment: one(payments, { fields: [contracts.id], references: [payments.contractId] }),
  performanceReport: one(performanceReports, { fields: [contracts.id], references: [performanceReports.contractId] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  contract: one(contracts, { fields: [payments.contractId], references: [contracts.id] }),
}));

export const performanceReportsRelations = relations(performanceReports, ({ one }) => ({
  contract: one(contracts, { fields: [performanceReports.contractId], references: [contracts.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
export const insertCreatorSchema = createInsertSchema(creators).omit({ id: true, createdAt: true });
export const insertBrandSchema = createInsertSchema(brands).omit({ id: true, createdAt: true });
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOfferSchema = createInsertSchema(offers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContractSchema = createInsertSchema(contracts).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertPerformanceReportSchema = createInsertSchema(performanceReports).omit({ id: true, generatedAt: true });

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Creator = typeof creators.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Offer = typeof offers.$inferSelect;
export type Contract = typeof contracts.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type PerformanceReport = typeof performanceReports.$inferSelect;
export type InsertCreator = z.infer<typeof insertCreatorSchema>;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertPerformanceReport = z.infer<typeof insertPerformanceReportSchema>;
