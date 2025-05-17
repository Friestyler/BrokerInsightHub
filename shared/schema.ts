import { pgTable, text, serial, integer, boolean, timestamp, json, varchar, jsonb } from "drizzle-orm/pg-core";
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
  role: text("role").default("user").notNull(), // user, admin, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

// Partner model (replaces clients in our new structure)
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  segment: text("segment").notNull(), // e.g., "broker", "agent", "consultant"
  attributes: jsonb("attributes"), // Flexible attributes storage
  logo: text("logo"), // URL to partner logo
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  environmentId: text("environment_id").notNull(), // For multi-environment support
});

// Customer model (enhanced version of existing customers)
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  partnerId: integer("partner_id").references(() => partners.id).notNull(),
  address: text("address"),
  industry: text("industry"),
  size: text("size"), // small, medium, large, enterprise
  attributes: jsonb("attributes"), // Flexible attributes storage
  status: text("status").default("active").notNull(), // active, inactive, prospect
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  environmentId: text("environment_id").notNull(), // For multi-environment support
});

// Products model (replaces insurance products)
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  attributes: jsonb("attributes"), // Flexible attributes storage
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  environmentId: text("environment_id").notNull(), // For multi-environment support
});

// Customer products (enhanced client products)
export const customerProducts = pgTable("customer_products", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  productId: integer("product_id").notNull().references(() => products.id),
  status: text("status").default("active").notNull(), // active, pending, expired
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  value: integer("value"), // Annual premium or contract value
  attributes: jsonb("attributes"), // Flexible attributes storage
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  environmentId: text("environment_id").notNull(), // For multi-environment support
});

// Opportunity model (enhanced)
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  productId: integer("product_id").notNull().references(() => products.id),
  partnerId: integer("partner_id").notNull().references(() => partners.id),
  stage: text("stage").notNull(), // prospecting, qualification, proposal, negotiation, closed-won, closed-lost
  probability: integer("probability").notNull(), // 0-100
  estimatedValue: integer("estimated_value").notNull(),
  expectedCloseDate: timestamp("expected_close_date"),
  description: text("description"),
  attributes: jsonb("attributes"), // Flexible attributes storage
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  environmentId: text("environment_id").notNull(), // For multi-environment support
});

// Project model (new entity)
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  partnerId: integer("partner_id").notNull().references(() => partners.id),
  opportunityId: integer("opportunity_id").references(() => opportunities.id), // Optional link to opportunity
  status: text("status").notNull(), // not-started, in-progress, on-hold, completed, cancelled
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  budget: integer("budget"),
  attributes: jsonb("attributes"), // Flexible attributes storage
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  environmentId: text("environment_id").notNull(), // For multi-environment support
});

// Contact model (new entity)
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  title: text("title"),
  partnerId: integer("partner_id").references(() => partners.id),
  customerId: integer("customer_id").references(() => customers.id),
  isPrimary: boolean("is_primary").default(false).notNull(),
  attributes: jsonb("attributes"), // Flexible attributes storage
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  environmentId: text("environment_id").notNull(), // For multi-environment support
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
  environmentId: text("environment_id").notNull(), // For multi-environment support
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
  environmentId: text("environment_id").notNull(), // For multi-environment support
});

// Define relationships
export const partnersRelations = relations(partners, ({ many }) => ({
  customers: many(customers),
  opportunities: many(opportunities),
  projects: many(projects),
  contacts: many(contacts),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  partner: one(partners, {
    fields: [customers.partnerId],
    references: [partners.id],
    relationName: "customerPartner",
  }),
  products: many(customerProducts),
  opportunities: many(opportunities),
  projects: many(projects),
  contacts: many(contacts),
}));

export const productsRelations = relations(products, ({ many }) => ({
  customerProducts: many(customerProducts),
  opportunities: many(opportunities),
}));

export const customerProductsRelations = relations(customerProducts, ({ one }) => ({
  customer: one(customers, {
    fields: [customerProducts.customerId],
    references: [customers.id],
    relationName: "productCustomer",
  }),
  product: one(products, {
    fields: [customerProducts.productId],
    references: [products.id],
    relationName: "customerProduct",
  }),
}));

export const opportunitiesRelations = relations(opportunities, ({ one, many }) => ({
  customer: one(customers, {
    fields: [opportunities.customerId],
    references: [customers.id],
    relationName: "opportunityCustomer",
  }),
  product: one(products, {
    fields: [opportunities.productId],
    references: [products.id],
    relationName: "opportunityProduct",
  }),
  partner: one(partners, {
    fields: [opportunities.partnerId],
    references: [partners.id],
    relationName: "opportunityPartner",
  }),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  customer: one(customers, {
    fields: [projects.customerId],
    references: [customers.id],
    relationName: "projectCustomer",
  }),
  partner: one(partners, {
    fields: [projects.partnerId],
    references: [partners.id],
    relationName: "projectPartner",
  }),
  opportunity: one(opportunities, {
    fields: [projects.opportunityId],
    references: [opportunities.id],
    relationName: "projectOpportunity",
  }),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  partner: one(partners, {
    fields: [contacts.partnerId],
    references: [partners.id],
    relationName: "contactPartner",
  }),
  customer: one(customers, {
    fields: [contacts.customerId],
    references: [customers.id],
    relationName: "contactCustomer",
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  avatarInitials: true,
  role: true,
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).pick({
  title: true,
  content: true,
  summary: true,
  category: true,
  imageUrl: true,
  publishedDate: true,
});

export const insertPartnerSchema = createInsertSchema(partners).pick({
  name: true,
  address: true,
  segment: true,
  attributes: true,
  logo: true,
  environmentId: true,
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  name: true,
  partnerId: true,
  address: true,
  industry: true,
  size: true,
  attributes: true,
  status: true,
  environmentId: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  category: true,
  description: true,
  attributes: true,
  environmentId: true,
});

export const insertCustomerProductSchema = createInsertSchema(customerProducts).pick({
  customerId: true,
  productId: true,
  status: true,
  startDate: true,
  endDate: true,
  value: true,
  attributes: true,
  environmentId: true,
});

export const insertOpportunitySchema = createInsertSchema(opportunities).pick({
  name: true,
  customerId: true,
  productId: true,
  partnerId: true,
  stage: true,
  probability: true,
  estimatedValue: true,
  expectedCloseDate: true,
  description: true,
  attributes: true,
  environmentId: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  customerId: true,
  partnerId: true,
  opportunityId: true,
  status: true,
  startDate: true,
  endDate: true,
  budget: true,
  attributes: true,
  environmentId: true,
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  title: true,
  partnerId: true,
  customerId: true,
  isPrimary: true,
  attributes: true,
  environmentId: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  userId: true,
  filename: true,
  fileType: true,
  fileSize: true,
  content: true,
  filePath: true,
  tags: true,
  environmentId: true,
});

export const insertFileComparisonSchema = createInsertSchema(fileComparisons).pick({
  userId: true,
  document1Id: true,
  document2Id: true,
  differencesSummary: true,
  differences: true,
  environmentId: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type NewsArticle = typeof newsArticles.$inferSelect;

export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertCustomerProduct = z.infer<typeof insertCustomerProductSchema>;
export type CustomerProduct = typeof customerProducts.$inferSelect;

export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Opportunity = typeof opportunities.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertFileComparison = z.infer<typeof insertFileComparisonSchema>;
export type FileComparison = typeof fileComparisons.$inferSelect;
