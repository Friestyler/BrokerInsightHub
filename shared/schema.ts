import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  avatarInitials: text("avatar_initials").notNull(),
});

// News article model
export const newsArticles = pgTable("news_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  publishedDate: timestamp("published_date").notNull(),
});

// Client model
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // Individual or Commercial
  initials: text("initials").notNull(),
});

// Insurance product model
export const insuranceProducts = pgTable("insurance_products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
});

// Client insurance products
export const clientProducts = pgTable("client_products", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  productId: integer("product_id").notNull(),
});

// Opportunity model
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  productId: integer("product_id").notNull(),
  probability: integer("probability").notNull(),
  estimatedValue: integer("estimated_value").notNull(),
});

// Document model for file comparison
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  filename: text("filename").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  content: text("content").notNull(),
  filePath: text("file_path"),  // Path to the file on disk (for PDFs)
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
  tags: text("tags").array(),
});

// File comparison history
export const fileComparisons = pgTable("file_comparisons", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  document1Id: integer("document1_id").notNull(),
  document2Id: integer("document2_id").notNull(),
  comparisonDate: timestamp("comparison_date").defaultNow().notNull(),
  differencesSummary: text("differences_summary").notNull(),
  differences: json("differences").notNull(),
});

// Customers entity
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Customer-User relationship (Team members)
export const customerTeamMembers = pgTable("customer_team_members", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  userId: integer("user_id").notNull().references(() => users.id),
});

// Customer-Partner relationship
export const customerPartners = pgTable("customer_partners", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  partnerId: integer("partner_id").notNull().references(() => clients.id),
});

// Define relationships
export const customersRelations = relations(customers, ({ one, many }) => ({
  owner: one(users, {
    fields: [customers.ownerId],
    references: [users.id],
    relationName: "customerOwner",
  }),
  teamMembers: many(customerTeamMembers),
  partners: many(customerPartners),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  avatarInitials: true,
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).pick({
  title: true,
  content: true,
  summary: true,
  category: true,
  imageUrl: true,
  publishedDate: true,
});

export const insertClientSchema = createInsertSchema(clients).pick({
  name: true,
  type: true,
  initials: true,
});

export const insertInsuranceProductSchema = createInsertSchema(insuranceProducts).pick({
  name: true,
  category: true,
});

export const insertClientProductSchema = createInsertSchema(clientProducts).pick({
  clientId: true,
  productId: true,
});

export const insertOpportunitySchema = createInsertSchema(opportunities).pick({
  clientId: true,
  productId: true,
  probability: true,
  estimatedValue: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  userId: true,
  filename: true,
  fileType: true,
  fileSize: true,
  content: true,
  filePath: true,
  tags: true,
});

export const insertFileComparisonSchema = createInsertSchema(fileComparisons).pick({
  userId: true,
  document1Id: true,
  document2Id: true,
  differencesSummary: true,
  differences: true,
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  name: true,
  description: true,
  ownerId: true,
});

export const insertCustomerTeamMemberSchema = createInsertSchema(customerTeamMembers).pick({
  customerId: true,
  userId: true,
});

export const insertCustomerPartnerSchema = createInsertSchema(customerPartners).pick({
  customerId: true,
  partnerId: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type NewsArticle = typeof newsArticles.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertInsuranceProduct = z.infer<typeof insertInsuranceProductSchema>;
export type InsuranceProduct = typeof insuranceProducts.$inferSelect;

export type InsertClientProduct = z.infer<typeof insertClientProductSchema>;
export type ClientProduct = typeof clientProducts.$inferSelect;

export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Opportunity = typeof opportunities.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertFileComparison = z.infer<typeof insertFileComparisonSchema>;
export type FileComparison = typeof fileComparisons.$inferSelect;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export type InsertCustomerTeamMember = z.infer<typeof insertCustomerTeamMemberSchema>;
export type CustomerTeamMember = typeof customerTeamMembers.$inferSelect;

export type InsertCustomerPartner = z.infer<typeof insertCustomerPartnerSchema>;
export type CustomerPartner = typeof customerPartners.$inferSelect;

// For compatibility - new UI using mock data doesn't need these in the database yet
export { customers as partners };
export type Partner = Customer;
export type InsertPartner = InsertCustomer;

export { opportunities as projects };
export type Project = Opportunity;
export type InsertProject = InsertOpportunity;

export { customerTeamMembers as contacts };
export type Contact = CustomerTeamMember;
export type InsertContact = InsertCustomerTeamMember;

// OKR templates schema
export const okrTemplates = pgTable("okr_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const okrMetrics = pgTable("okr_metrics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  templateId: integer("template_id").references(() => okrTemplates.id),
  targetValue: integer("target_value"),
  realizedValue: integer("realized_value"),
  unit: text("unit").default("number"), // currency, number, percentage, boolean
  progress: integer("progress"),
  status: text("status").default("on_track"), // on_track, at_risk, off_track
  responsibleId: integer("responsible_id").references(() => users.id),
  dueDate: timestamp("due_date"),
  timeframe: text("timeframe"),
  frequency: text("frequency").default("once"), // monthly, quarterly, once
  parentId: integer("parent_id"),
  hierarchy: text("hierarchy").default("activity"), // objective, activity, subactivity
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const okrTemplatesRelations = relations(okrTemplates, ({ one, many }) => ({
  metrics: many(okrMetrics),
  createdBy: one(users, {
    fields: [okrTemplates.createdBy],
    references: [users.id],
  }),
}));

export const okrMetricsRelations = relations(okrMetrics, ({ one, many }) => ({
  template: one(okrTemplates, {
    fields: [okrMetrics.templateId],
    references: [okrTemplates.id],
  }),
  responsible: one(users, {
    fields: [okrMetrics.responsibleId],
    references: [users.id],
  }),
}));

export const insertOkrTemplateSchema = createInsertSchema(okrTemplates).pick({
  name: true,
  description: true,
  tags: true,
  createdBy: true,
});

export const insertOkrMetricSchema = createInsertSchema(okrMetrics).pick({
  title: true,
  description: true,
  templateId: true,
  targetValue: true,
  realizedValue: true,
  unit: true,
  status: true,
  responsibleId: true,
  dueDate: true,
  timeframe: true,
  frequency: true,
  parentId: true,
  hierarchy: true,
  tags: true,
});

export type InsertOkrTemplate = z.infer<typeof insertOkrTemplateSchema>;
export type OkrTemplate = typeof okrTemplates.$inferSelect;

export type InsertOkrMetric = z.infer<typeof insertOkrMetricSchema>;
export type OkrMetric = typeof okrMetrics.$inferSelect;
