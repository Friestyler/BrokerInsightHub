import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  role: text("role").default("broker"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  role: true,
});

// News schema
export const newsItems = pgTable("news_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  source: text("source").notNull(),
  imageUrl: text("image_url"),
  publishedDate: timestamp("published_date").notNull(),
  category: text("category").notNull(),
});

export const insertNewsItemSchema = createInsertSchema(newsItems).pick({
  title: true,
  content: true,
  summary: true,
  source: true,
  imageUrl: true,
  publishedDate: true,
  category: true,
});

// Client schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  type: text("type").notNull(), // e.g., Business Owner, Family, Retired
  products: text("products").array(), // Current products they have
});

export const insertClientSchema = createInsertSchema(clients).pick({
  fullName: true,
  type: true,
  products: true,
});

// Opportunity schema for cross/upsell predictions
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  opportunityType: text("opportunity_type").notNull(), // e.g., Business Liability, Life Insurance
  probability: integer("probability").notNull(), // 0-100
  potentialValue: text("potential_value").notNull(), // e.g., €1,200/year
});

export const insertOpportunitySchema = createInsertSchema(opportunities).pick({
  clientId: true,
  opportunityType: true,
  probability: true,
  potentialValue: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertNewsItem = z.infer<typeof insertNewsItemSchema>;
export type NewsItem = typeof newsItems.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Opportunity = typeof opportunities.$inferSelect;
