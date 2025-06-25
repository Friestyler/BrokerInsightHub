import { pgTable, text, varchar, serial, integer, boolean, timestamp, json, numeric, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced User model with comprehensive user management
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatarInitials: text("avatar_initials").notNull(),
  role: text("role").notNull().default("user"), // admin, manager, user, viewer
  department: text("department"),
  jobTitle: text("job_title"),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Contact model - can be linked to any entity
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  jobTitle: text("job_title"),
  department: text("department"),
  company: text("company"),
  linkedEntityType: text("linked_entity_type"), // partner, customer, vendor, opportunity
  linkedEntityId: integer("linked_entity_id"),
  isPrimary: boolean("is_primary").notNull().default(false),
  notes: text("notes"),
  tags: text("tags").array(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Activity Tasks model
export const activityTasks = pgTable("activity_tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, cancelled
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  assignedToId: integer("assigned_to_id").references(() => users.id),
  assignedById: integer("assigned_by_id").references(() => users.id),
  entityType: text("entity_type").notNull(), // partner, customer, opportunity, okr
  entityId: integer("entity_id").notNull(),
  relatedEntityType: text("related_entity_type"), // For cross-entity relationships
  relatedEntityId: integer("related_entity_id"), // ID of related entity
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Activity Comments model
export const activityComments = pgTable("activity_comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull().references(() => users.id),
  entityType: text("entity_type").notNull(), // partner, customer, opportunity, okr, task
  entityId: integer("entity_id").notNull(),
  assignedToId: integer("assigned_to_id").references(() => users.id), // optional assignment
  parentCommentId: integer("parent_comment_id"), // for replies - removed self-reference
  relatedEntityType: text("related_entity_type"), // For cross-entity relationships
  relatedEntityId: integer("related_entity_id"), // ID of related entity
  isInternal: boolean("is_internal").notNull().default(false), // internal vs partner-visible
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Activity Attachments model
export const activityAttachments = pgTable("activity_attachments", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path"),
  url: text("url"), // for external links
  uploadedById: integer("uploaded_by_id").notNull().references(() => users.id),
  entityType: text("entity_type").notNull(), // partner, customer, opportunity, okr, task, comment
  entityId: integer("entity_id").notNull(),
  relatedEntityType: text("related_entity_type"), // For cross-entity relationships
  relatedEntityId: integer("related_entity_id"), // ID of related entity
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Activity Reactions model
export const activityReactions = pgTable("activity_reactions", {
  id: serial("id").primaryKey(),
  activityType: text("activity_type").notNull(), // 'task', 'comment', 'attachment'
  activityId: integer("activity_id").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  emoji: text("emoji").notNull(), // '✅', '👍', '⭐'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// AI Next Best Actions model
export const nextBestActions = pgTable("next_best_actions", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull(),
  actionType: text("action_type").notNull(), // follow_up, schedule_meeting, review_okr, etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  confidence: numeric("confidence", { precision: 3, scale: 2 }), // AI confidence score 0-1
  reasoning: text("reasoning"), // AI explanation for the recommendation
  status: text("status").notNull().default("pending"), // pending, dismissed, completed, in_progress
  contextData: json("context_data"), // relevant data that led to this recommendation
  suggestedDate: timestamp("suggested_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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

// Opportunity model - matches actual database structure
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  productId: integer("product_id").notNull(),
  probability: integer("probability").notNull(),
  estimatedValue: integer("estimated_value").notNull(),
  title: text("title"),
  status: text("status"),
  stage: text("stage"),
  type: text("type"),
  description: text("description"),
  notes: text("notes"),
  insuranceDescription: text("insurance_description"),
  expectedCloseDate: timestamp("expected_close_date"),
  startDate: timestamp("start_date"),
  partnerId: integer("partner_id"),
  ownerId: integer("owner_id"),
  accountManagerId: integer("account_manager_id").references(() => users.id),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
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
  partnerId: integer("partner_id").notNull(),
});

// Products catalog for De Goudse environment
export const productCatalog = pgTable("product_catalog", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull(),
  colorCode: text("color_code").notNull().default("#3B82F6"),
  aiContext: text("ai_context").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relationships
export const opportunitiesRelations = relations(opportunities, ({ one }) => ({
  client: one(clients, {
    fields: [opportunities.clientId],
    references: [clients.id],
  }),
  product: one(insuranceProducts, {
    fields: [opportunities.productId],
    references: [insuranceProducts.id],
  }),
}));

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedCustomers: many(customers, { relationName: "customerOwner" }),
}));

// Contact relations
export const contactsRelations = relations(contacts, ({ many }) => ({
  campaignRecipients: many(campaignRecipients),
  okrComments: many(okrComments),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  owner: one(users, {
    fields: [customers.ownerId],
    references: [users.id],
    relationName: "customerOwner",
  }),
  teamMembers: many(customerTeamMembers),
  partners: many(customerPartners),
  partnerOpportunities: many(opportunities, { relationName: "opportunityPartner" }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
  firstName: true,
  lastName: true,
  avatarInitials: true,
  role: true,
  department: true,
  jobTitle: true,
  phone: true,
  isActive: true,
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  firstName: true,
  lastName: true,
  fullName: true,
  email: true,
  phone: true,
  jobTitle: true,
  department: true,
  company: true,
  linkedEntityType: true,
  linkedEntityId: true,
  isPrimary: true,
  notes: true,
  tags: true,
  isActive: true,
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
  title: true,
  clientId: true,
  productId: true,
  status: true,
  stage: true,
  type: true,
  probability: true,
  estimatedValue: true,
  ownerId: true,
  partnerId: true,
  accountManagerId: true,
  description: true,
  notes: true,
  insuranceDescription: true,
  expectedCloseDate: true,
  startDate: true,
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

export const insertProductCatalogSchema = createInsertSchema(productCatalog).pick({
  name: true,
  description: true,
  category: true,
  colorCode: true,
  aiContext: true,
});

// Saved Lists table - for storing user-created lists of entities
export const savedLists = pgTable("saved_lists", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'selection' or 'filter'
  entity_type: text("entity_type").notNull(), // 'partners', 'customers', 'opportunities'
  members: integer("members").array().default([]), // Array of entity IDs for selection-based lists
  filters: json("filters").notNull(), // Stored filter criteria for filter-based lists
  is_shared: boolean("is_shared").default(false),
  is_default: boolean("is_default").default(false),
  created_by: integer("created_by").notNull().references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// List Collaborators table - for managing list-specific access permissions
export const listCollaborators = pgTable("list_collaborators", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull().references(() => savedLists.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  email: text("email"), // For external collaborators not yet in the system
  name: text("name"), // Display name for external collaborators
  accessLevel: text("access_level").notNull().default("viewer"), // 'viewer', 'commenter', 'editor'
  invitedById: integer("invited_by_id").notNull().references(() => users.id),
  invitedAt: timestamp("invited_at").notNull().defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  isActive: boolean("is_active").notNull().default(true),
});

// Saved Views table - for storing user-created filter views
export const savedViews = pgTable("saved_views", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  entity_type: text("entity_type").notNull(), // 'partners', 'customers', 'opportunities'
  filters: json("filters").notNull(), // Stored filter criteria
  is_shared: boolean("is_shared").default(false),
  is_default: boolean("is_default").default(false),
  created_by: integer("created_by").notNull().references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Define relationships for saved lists and views
export const savedListsRelations = relations(savedLists, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [savedLists.created_by],
    references: [users.id],
  }),
  collaborators: many(listCollaborators),
}));

export const listCollaboratorsRelations = relations(listCollaborators, ({ one }) => ({
  list: one(savedLists, {
    fields: [listCollaborators.listId],
    references: [savedLists.id],
  }),
  user: one(users, {
    fields: [listCollaborators.userId],
    references: [users.id],
  }),
  invitedBy: one(users, {
    fields: [listCollaborators.invitedById],
    references: [users.id],
  }),
}));

export const savedViewsRelations = relations(savedViews, ({ one }) => ({
  createdBy: one(users, {
    fields: [savedViews.created_by],
    references: [users.id],
  }),
}));

// Campaign Templates table
export const campaignTemplates = pgTable("campaign_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  objective: text("objective"),
  entity: text("entity").notNull(), // 'partners', 'customers', 'opportunities'
  icon: text("icon"),
  status: text("status").notNull().default("draft"), // 'draft', 'published'
  attachments: json("attachments").$type<Array<{id: string, name: string, type: string, size: number}>>().default([]),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Campaign Emails table (templates can have multiple emails)
export const campaignEmails = pgTable("campaign_emails", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull().references(() => campaignTemplates.id, { onDelete: 'cascade' }),
  subject: text("subject").notNull(),
  followUpDays: integer("follow_up_days").notNull().default(0),
  leftLogo: text("left_logo"),
  rightLogo: text("right_logo"),
  emailOrder: integer("email_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Email Blocks table (each email can have multiple blocks)
export const emailBlocks = pgTable("email_blocks", {
  id: serial("id").primaryKey(),
  emailId: integer("email_id").notNull().references(() => campaignEmails.id, { onDelete: 'cascade' }),
  type: text("type").notNull(), // 'text', 'heading', 'quote', 'divider', 'image', 'button', 'spacer', 'ai'
  content: text("content").notNull(),
  properties: json("properties").$type<{
    alignment?: 'left' | 'center' | 'right';
    fontSize?: 'small' | 'medium' | 'large';
    color?: string;
    backgroundColor?: string;
    url?: string;
    buttonText?: string;
    imageUrl?: string;
    imageAlt?: string;
    spacerHeight?: number;
    aiType?: string;
  }>(),
  blockOrder: integer("block_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Removed duplicate schemas - using the ones defined later in the file

// Campaign template relations
export const campaignTemplatesRelations = relations(campaignTemplates, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [campaignTemplates.createdBy],
    references: [users.id],
  }),
  emails: many(campaignEmails),
}));

export const campaignEmailsRelations = relations(campaignEmails, ({ one, many }) => ({
  template: one(campaignTemplates, {
    fields: [campaignEmails.templateId],
    references: [campaignTemplates.id],
  }),
  blocks: many(emailBlocks),
}));

export const emailBlocksRelations = relations(emailBlocks, ({ one }) => ({
  email: one(campaignEmails, {
    fields: [emailBlocks.emailId],
    references: [campaignEmails.id],
  }),
}));



// Insert schemas for saved lists and views
export const insertSavedListSchema = createInsertSchema(savedLists).pick({
  name: true,
  description: true,
  type: true,
  entity_type: true,
  members: true,
  filters: true,
  is_shared: true,
  is_default: true,
  created_by: true,
});

export const insertSavedViewSchema = createInsertSchema(savedViews).pick({
  name: true,
  description: true,
  entity_type: true,
  filters: true,
  is_shared: true,
  is_default: true,
  created_by: true,
});

// Campaign template insert schemas
export const insertCampaignTemplateSchema = createInsertSchema(campaignTemplates).pick({
  name: true,
  description: true,
  objective: true,
  entity: true,
  icon: true,
  status: true,
  attachments: true,
  createdBy: true,
});

export const insertCampaignEmailSchema = createInsertSchema(campaignEmails).pick({
  templateId: true,
  subject: true,
  followUpDays: true,
  leftLogo: true,
  rightLogo: true,
  emailOrder: true,
});

// Template schemas defined later in file to avoid duplicates

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

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

export type InsertProductCatalog = z.infer<typeof insertProductCatalogSchema>;
export type ProductCatalog = typeof productCatalog.$inferSelect;

export type InsertSavedList = z.infer<typeof insertSavedListSchema>;
export type SavedList = typeof savedLists.$inferSelect;

export type InsertSavedView = z.infer<typeof insertSavedViewSchema>;
export type SavedView = typeof savedViews.$inferSelect;

// Partners model - broker and distribution partners
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  location: text("location"),
  contactEmail: text("contact_email"),
  primaryContact: text("primary_contact"),
  partnerType: text("partner_type"),
  region: text("region"),
  assignedUserIds: integer("assigned_user_ids").array(),
  linkedOpportunityIds: integer("linked_opportunity_ids").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Vendor model - aligned with customers schema
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  initials: text("initials"),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Product Categories model - supports nested hierarchy
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  parentId: integer("parent_id"),
  status: text("status").notNull().default("active"), // active, inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Will define relations later after all tables are declared

// Product model - comprehensive insurance product management
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  productId: text("product_id").notNull().unique(), // Unique product identifier
  name: text("name").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => productCategories.id),
  category: text("category"), // Legacy field - will be phased out
  
  // Provider information - can be vendor, broker/partner, or other
  providerId: integer("provider_id"), // References vendors.id, partners.id, or other entities
  providerType: text("provider_type"), // 'vendor', 'partner', 'other'
  providerName: text("provider_name"), // Direct provider name storage
  
  // Contract information
  contractStartDate: date("contract_start_date"),
  contractEndDate: date("contract_end_date"),
  
  // Financial information
  totalValue: numeric("total_value", { precision: 12, scale: 2 }),
  premiumValue: numeric("premium_value", { precision: 12, scale: 2 }),
  premiumPercentage: numeric("premium_percentage", { precision: 5, scale: 2 }), // e.g., 15.25%
  discount: numeric("discount", { precision: 12, scale: 2 }),
  discountPercentage: numeric("discount_percentage", { precision: 5, scale: 2 }),
  
  // Legacy fields for backward compatibility
  vendorId: integer("vendor_id").references(() => vendors.id),
  
  // Linking fields
  customerId: integer("customer_id"), // Link to customer
  opportunityId: integer("opportunity_id"), // Link to opportunity
  partnerId: integer("partner_id"), // Link to partner (broker/intermediary)
  
  // Metadata
  isActive: boolean("is_active").notNull().default(true),
  status: text("status").notNull().default("active"), // active, inactive, expired
  notes: text("notes"),
  tags: text("tags").array(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relationships
export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  owner: one(users, {
    fields: [vendors.ownerId],
    references: [users.id],
    relationName: "vendorOwner",
  }),
  products: many(products),
}));

// Duplicate removed - keeping only the first definition

export const productsRelations = relations(products, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [products.vendorId],
    references: [vendors.id],
  }),
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
  customer: one(customers, {
    fields: [products.customerId],
    references: [customers.id],
  }),
  opportunity: one(opportunities, {
    fields: [products.opportunityId],
    references: [opportunities.id],
  }),
  partner: one(partners, {
    fields: [products.partnerId],
    references: [partners.id],
  }),
  catalogueProducts: many(catalogueProducts),
}));



// Insert schemas
export const insertVendorSchema = createInsertSchema(vendors).pick({
  name: true,
  description: true,
  initials: true,
  contactName: true,
  contactEmail: true,
  contactPhone: true,
  ownerId: true,
});

export const insertProductCategorySchema = createInsertSchema(productCategories).pick({
  name: true,
  description: true,
  parentId: true,
  status: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  productId: true,
  name: true,
  description: true,
  categoryId: true,
  category: true,
  providerId: true,
  providerType: true,
  providerName: true,
  contractStartDate: true,
  contractEndDate: true,
  totalValue: true,
  premiumValue: true,
  premiumPercentage: true,
  discount: true,
  discountPercentage: true,
  customerId: true,
  opportunityId: true,
  partnerId: true,
  vendorId: true,
  isActive: true,
  status: true,
  notes: true,
  tags: true,
});

// Product Catalogues - master catalogues that can contain products
export const productCatalogues = pgTable("product_catalogues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("active"),
  effectiveFrom: date("effective_from"),
  effectiveTo: date("effective_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Catalogue Products - join table connecting products to catalogues with optional overrides
export const catalogueProducts = pgTable("catalogue_products", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  catalogueId: integer("catalogue_id").references(() => productCatalogues.id).notNull(),
  categoryId: integer("category_id").references(() => productCategories.id),
  visible: boolean("visible").default(true),
  nameOverride: text("name_override"),
  priceOverride: integer("price_override"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Broker-Partner mapping table - links broker users to specific partners in environments
export const brokerPartnerMappings = pgTable("broker_partner_mappings", {
  id: serial("id").primaryKey(),
  brokerUserId: integer("broker_user_id").notNull().references(() => users.id),
  environmentId: text("environment_id").notNull(), // e.g., "degoudse", "myqollabi"
  partnerId: integer("partner_id").notNull(), // Partner ID in the specific environment
  brokerPartnerName: text("broker_partner_name").notNull(), // Display name in broker view
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Entity logos table - stores uploaded logos for partners, customers, etc.
export const entityLogos = pgTable("entity_logos", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // "partner", "customer", "vendor", "opportunity"
  entityId: integer("entity_id").notNull(), // ID of the entity in its respective table
  environmentId: text("environment_id").notNull(), // e.g., "degoudse", "myqollabi"
  logoData: text("logo_data").notNull(), // Base64 encoded image data
  mimeType: text("mime_type").notNull(), // image/png, image/jpeg, etc.
  originalFilename: text("original_filename"),
  fileSize: integer("file_size"), // in bytes
  uploadedBy: integer("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schemas for entity logos
export const insertEntityLogoSchema = createInsertSchema(entityLogos).pick({
  entityType: true,
  entityId: true,
  environmentId: true,
  logoData: true,
  mimeType: true,
  originalFilename: true,
  fileSize: true,
  uploadedBy: true,
});

export type InsertEntityLogo = z.infer<typeof insertEntityLogoSchema>;
export type EntityLogo = typeof entityLogos.$inferSelect;

// Activity Reactions types
export const insertActivityReactionSchema = createInsertSchema(activityReactions).pick({
  activityType: true,
  activityId: true,
  userId: true,
  emoji: true,
});

export type InsertActivityReaction = z.infer<typeof insertActivityReactionSchema>;
export type ActivityReaction = typeof activityReactions.$inferSelect;

// Partner types
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;

export const insertPartnerSchema = createInsertSchema(partners).pick({
  name: true,
  description: true,
  status: true,
  location: true,
  contactEmail: true,
  primaryContact: true,
  partnerType: true,
  region: true,
  assignedUserIds: true,
  linkedOpportunityIds: true,
});

export { opportunities as projects };
export type Project = Opportunity;
export type InsertProject = InsertOpportunity;

// Contact types already defined above

// OKR tags schema
export const okrTags = pgTable("okr_tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  color: varchar("color", { length: 20 }).notNull().default("#3B82F6"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// OKR Template Assignments table - tracks which templates are assigned to which entities
export const okrTemplateAssignments = pgTable("okr_template_assignments", {
  id: serial("id").primaryKey(),
  template_id: integer("template_id").notNull(),
  entity_type: text("entity_type").notNull(), // 'partner', 'customer', 'opportunity'
  entity_id: integer("entity_id").notNull(),
  assigned_at: timestamp("assigned_at").defaultNow(),
  assigned_by: integer("assigned_by").notNull().references(() => users.id),
  status: text("status").notNull().default("active"), // 'active', 'paused', 'completed'
  due_date: timestamp("due_date"),
  responsible_user_id: integer("responsible_user_id").references(() => users.id),
  notes: text("notes")
});

// OKR templates schema with comprehensive properties
export const okrMetrics = pgTable("okr_metrics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  
  // Value fields
  realized_value: text("realized_value").default("0"),
  target_value: text("target_value"),
  
  // Year-to-date and historical comparison fields
  ytd_value: text("ytd_value"), // Current Year-To-Date value (e.g., "742.301,32 €")
  last_year_value: text("last_year_value"), // Equivalent value for same period last year (e.g., "700.599 €")
  
  // Measure unit types
  measure_unit: text("measure_unit").notNull().default("number"), // currency, number, percent, checkbox, picklist_single, picklist_multiple, traffic_light, progress_bar, trend_chart
  currency_type: text("currency_type").default("USD"), // USD, EUR, etc.
  
  // Configuration for different measure types
  traffic_light_thresholds: json("traffic_light_thresholds"), // {red: {min: 0, max: 30}, yellow: {min: 31, max: 70}, green: {min: 71, max: 100}}
  progress_bar_thresholds: json("progress_bar_thresholds"), // similar structure for progress bar
  picklist_options: text("picklist_options").array().default([]), // options for picklist types
  
  // Responsibility
  responsible_user_id: integer("responsible_user_id").references(() => users.id),
  responsible_contact_ids: integer("responsible_contact_ids").array().default([]), // Array of contact IDs
  
  // Timeframe and frequency
  timeframe_start: timestamp("timeframe_start"),
  timeframe_end: timestamp("timeframe_end"),
  frequency: text("frequency").notNull().default("none"), // yearly, quarterly, monthly, weekly, none, custom
  
  // Additional properties
  attachment_url: text("attachment_url"),
  due_date: timestamp("due_date"),
  
  // Status and sharing
  is_muted: boolean("is_muted").default(false),
  is_archived: boolean("is_archived").default(false),
  is_shared: boolean("is_shared").default(true),
  
  // Hierarchy
  hierarchy: text("hierarchy").notNull().default("activity"), // objective, activity, subactivity
  parent_id: integer("parent_id"), // For hierarchical relationships - removed self-reference
  
  // Tags and categorization
  tags: text("tags").array().default([]),
  
  // Audit fields
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: integer("created_by").notNull(),
});

export const okrMetricsRelations = relations(okrMetrics, ({ one, many }) => ({
  responsibleUser: one(users, {
    fields: [okrMetrics.responsible_user_id],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [okrMetrics.created_by],
    references: [users.id],
  }),
  assignments: many(okrTemplateAssignments),
}));

export const okrTemplateAssignmentsRelations = relations(okrTemplateAssignments, ({ one }) => ({
  template: one(okrMetrics, {
    fields: [okrTemplateAssignments.template_id],
    references: [okrMetrics.id],
  }),
  assignedBy: one(users, {
    fields: [okrTemplateAssignments.assigned_by],
    references: [users.id],
  }),
  responsibleUser: one(users, {
    fields: [okrTemplateAssignments.responsible_user_id],
    references: [users.id],
  }),
}));

export const insertOkrTagSchema = createInsertSchema(okrTags).pick({
  name: true,
  color: true,
});

// OKR Comments table
export const okrComments = pgTable("okr_comments", {
  id: serial("id").primaryKey(),
  metric_id: integer("metric_id").notNull().references(() => okrMetrics.id),
  user_id: integer("user_id").notNull().references(() => users.id),
  contact_id: integer("contact_id"), // for external contacts
  partner_id: integer("partner_id"), // link to specific partner
  comment: text("comment").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const okrCommentsRelations = relations(okrComments, ({ one }) => ({
  metric: one(okrMetrics, {
    fields: [okrComments.metric_id],
    references: [okrMetrics.id],
  }),
  user: one(users, {
    fields: [okrComments.user_id],
    references: [users.id],
  }),
}));

// Campaigns table for active marketing campaigns
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().default("email"), // email, sms, mixed
  description: text("description"),
  template_id: integer("template_id"), // reference to campaign template if created from one
  target_entity_type: text("target_entity_type").notNull(), // partners, customers, opportunities, internal
  target_entity_id: integer("target_entity_id"), // specific entity if targeting single entity
  partner_id: integer("partner_id"), // ID of the partner this campaign is associated with
  environment_id: text("environment_id"), // environment this campaign belongs to (e.g., "degoudse")
  status: text("status").notNull().default("draft"), // draft, scheduled, in_progress, sent, archived
  created_by: integer("created_by").notNull().references(() => users.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  send_at: timestamp("send_at"), // scheduled datetime for sending
  shared_with: text("shared_with").array().default([]), // list of user or partner IDs
  is_ai_generated: boolean("is_ai_generated").notNull().default(false),
  engagement_summary: json("engagement_summary"), // aggregated stats object
  last_sent_at: timestamp("last_sent_at"), // timestamp of last email sent
  
  // Email tracking metrics
  emails_sent: integer("emails_sent").default(0), // total emails sent
  emails_opened: integer("emails_opened").default(0), // total unique opens
  open_rate: numeric("open_rate", { precision: 5, scale: 2 }).default("0.00"), // percentage of emails opened
  total_clicks: integer("total_clicks").default(0), // total number of clicks
  
  // Campaign content and configuration
  emails: json("emails").notNull(), // array of email objects with content
  recipients: json("recipients").notNull(), // array of selected recipients
  settings: json("settings").notNull(), // campaign settings like timing, tracking options
  
  // Additional metadata
  icon: text("icon").notNull().default("mail"),
  objective: text("objective"),
  attachments: json("attachments").default([]),
});



// Campaign insert schema and types
export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

// Activity tables relations
export const activityTasksRelations = relations(activityTasks, ({ one, many }) => ({
  assignedTo: one(users, {
    fields: [activityTasks.assignedToId],
    references: [users.id],
  }),
  assignedBy: one(users, {
    fields: [activityTasks.assignedById],
    references: [users.id],
  }),
  comments: many(activityComments),
  attachments: many(activityAttachments),
}));

export const activityCommentsRelations = relations(activityComments, ({ one, many }) => ({
  author: one(users, {
    fields: [activityComments.authorId],
    references: [users.id],
  }),
  assignedTo: one(users, {
    fields: [activityComments.assignedToId],
    references: [users.id],
  }),
  parentComment: one(activityComments, {
    fields: [activityComments.parentCommentId],
    references: [activityComments.id],
  }),
  replies: many(activityComments),
  attachments: many(activityAttachments),
}));

export const activityAttachmentsRelations = relations(activityAttachments, ({ one }) => ({
  uploadedBy: one(users, {
    fields: [activityAttachments.uploadedById],
    references: [users.id],
  }),
}));

export const nextBestActionsRelations = relations(nextBestActions, ({ one }) => ({
  partner: one(customers, {
    fields: [nextBestActions.partnerId],
    references: [customers.id],
  }),
}));

export const insertOkrMetricSchema = createInsertSchema(okrMetrics).pick({
  name: true,
  description: true,
  realized_value: true,
  target_value: true,
  measure_unit: true,
  currency_type: true,
  traffic_light_thresholds: true,
  progress_bar_thresholds: true,
  picklist_options: true,
  responsible_user_id: true,
  responsible_contact_ids: true,
  timeframe_start: true,
  timeframe_end: true,
  frequency: true,
  attachment_url: true,
  due_date: true,
  is_muted: true,
  is_archived: true,
  is_shared: true,
  hierarchy: true,
  parent_id: true,
  tags: true,
  created_by: true,
});

export const insertOkrCommentSchema = createInsertSchema(okrComments).pick({
  metric_id: true,
  user_id: true,
  contact_id: true,
  partner_id: true,
  comment: true,
});

export const insertOkrTemplateAssignmentSchema = createInsertSchema(okrTemplateAssignments).pick({
  template_id: true,
  entity_type: true,
  entity_id: true,
  assigned_by: true,
  status: true,
  due_date: true,
  responsible_user_id: true,
  notes: true,
});

export type InsertOkrTag = z.infer<typeof insertOkrTagSchema>;
export type OkrTag = typeof okrTags.$inferSelect;

export type InsertOkrMetric = z.infer<typeof insertOkrMetricSchema>;
export type OkrMetric = typeof okrMetrics.$inferSelect;

export type InsertOkrTemplateAssignment = z.infer<typeof insertOkrTemplateAssignmentSchema>;
export type OkrTemplateAssignment = typeof okrTemplateAssignments.$inferSelect;

// Campaign Recipients, Follow-ups, and Shares tables
export const campaignRecipients = pgTable("campaign_recipients", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  contactId: integer("contact_id").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull().default("pending"), // pending, sent, opened, clicked, responded
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const campaignFollowUps = pgTable("campaign_follow_ups", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  subject: text("subject").notNull(),
  emailBody: text("email_body").notNull(),
  delayDays: integer("delay_days").notNull(),
  status: text("status").notNull().default("pending"), // pending, sent, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const campaignShares = pgTable("campaign_shares", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  sharedWithType: text("shared_with_type").notNull(), // partner, contact, user
  sharedWithId: integer("shared_with_id").notNull(),
  accessLevel: text("access_level").notNull().default("view"), // view, comment, edit, admin
  shareMessage: text("share_message"),
  sharedById: integer("shared_by_id").references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relationships
export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [campaigns.created_by],
    references: [users.id],
  }),
  recipients: many(campaignRecipients),
  followUps: many(campaignFollowUps),
}));


export const campaignRecipientsRelations = relations(campaignRecipients, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignRecipients.campaignId],
    references: [campaigns.id],
  }),
}));

export const campaignFollowUpsRelations = relations(campaignFollowUps, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignFollowUps.campaignId],
    references: [campaigns.id],
  }),
}));

export const campaignSharesRelations = relations(campaignShares, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignShares.campaignId],
    references: [campaigns.id],
  }),
  sharedBy: one(users, {
    fields: [campaignShares.sharedById],
    references: [users.id],
  }),
}));

// Updated insert schemas
export const insertCampaignRecipientSchema = createInsertSchema(campaignRecipients).pick({
  campaignId: true,
  contactId: true,
  email: true,
  name: true,
  status: true,
});

export const insertCampaignFollowUpSchema = createInsertSchema(campaignFollowUps).pick({
  campaignId: true,
  subject: true,
  emailBody: true,
  delayDays: true,
  status: true,
});

export const insertCampaignShareSchema = createInsertSchema(campaignShares).pick({
  campaignId: true,
  sharedWithType: true,
  sharedWithId: true,
  accessLevel: true,
  shareMessage: true,
  sharedById: true,
  isActive: true,
});

export type InsertCampaignRecipient = z.infer<typeof insertCampaignRecipientSchema>;
export type CampaignRecipient = typeof campaignRecipients.$inferSelect;

export type InsertCampaignFollowUp = z.infer<typeof insertCampaignFollowUpSchema>;
export type CampaignFollowUp = typeof campaignFollowUps.$inferSelect;

// Campaign Share types
export type InsertCampaignShare = z.infer<typeof insertCampaignShareSchema>;
export type CampaignShare = typeof campaignShares.$inferSelect;

// Upload Settings Infrastructure - Phase 1

// Upload settings per entity and environment
export const uploadSettings = pgTable("upload_settings", {
  id: serial("id").primaryKey(),
  environmentId: text("environment_id").notNull(), // e.g., "degoudse", "acme"
  entityType: text("entity_type").notNull(), // e.g., "opportunities", "partners", "customers"
  attributeName: text("attribute_name").notNull(), // column name from the entity
  isMandatory: boolean("is_mandatory").notNull().default(false),
  dataType: text("data_type"), // inferred from schema: text, integer, boolean, timestamp, etc.
  validationRules: json("validation_rules"), // custom validation rules
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Transformation scripts for special formats
export const transformationScripts = pgTable("transformation_scripts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  entityType: text("entity_type").notNull(), // target entity type
  environmentId: text("environment_id").notNull(),
  scriptContent: text("script_content").notNull(), // Python code
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Upload templates for column mappings (enhanced version)
export const uploadTemplates = pgTable("upload_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  entityType: text("entity_type").notNull(),
  environmentId: text("environment_id").notNull(),
  columnMappings: json("column_mappings").notNull(), // mapping configuration
  isShared: boolean("is_shared").notNull().default(false),
  usageCount: integer("usage_count").notNull().default(0),
  lastUsedAt: timestamp("last_used_at"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Upload sessions for tracking upload progress
export const uploadSessions = pgTable("upload_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  entityType: text("entity_type").notNull(),
  environmentId: text("environment_id").notNull(),
  fileName: text("file_name").notNull(),
  status: text("status").notNull().default("uploading"), // uploading, mapping, processing, complete, error
  currentStep: integer("current_step").notNull().default(1), // 1-5 for progress tracking
  errorLog: json("error_log"), // detailed error information
  processedRows: integer("processed_rows").default(0),
  totalRows: integer("total_rows").default(0),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Error logs for upload processing
export const uploadErrors = pgTable("upload_errors", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => uploadSessions.sessionId),
  rowNumber: integer("row_number").notNull(),
  errorType: text("error_type").notNull(), // format, missing_data, type_mismatch, duplicate, etc.
  errorMessage: text("error_message").notNull(),
  problematicData: json("problematic_data"), // the actual data that caused the error
  resolutionAction: text("resolution_action"), // skip, replace, edit, etc.
  isResolved: boolean("is_resolved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relationships
export const uploadSettingsRelations = relations(uploadSettings, ({ one }) => ({}));

export const transformationScriptsRelations = relations(transformationScripts, ({ one }) => ({
  createdBy: one(users, {
    fields: [transformationScripts.createdBy],
    references: [users.id],
  }),
}));

export const uploadTemplatesRelations = relations(uploadTemplates, ({ one }) => ({
  createdBy: one(users, {
    fields: [uploadTemplates.createdBy],
    references: [users.id],
  }),
}));

export const uploadSessionsRelations = relations(uploadSessions, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [uploadSessions.createdBy],
    references: [users.id],
  }),
  errors: many(uploadErrors),
}));

export const uploadErrorsRelations = relations(uploadErrors, ({ one }) => ({
  session: one(uploadSessions, {
    fields: [uploadErrors.sessionId],
    references: [uploadSessions.sessionId],
  }),
}));

// Insert schemas
export const insertUploadSettingSchema = createInsertSchema(uploadSettings).pick({
  environmentId: true,
  entityType: true,
  attributeName: true,
  isMandatory: true,
  dataType: true,
  validationRules: true,
});

export const insertTransformationScriptSchema = createInsertSchema(transformationScripts).pick({
  name: true,
  description: true,
  entityType: true,
  environmentId: true,
  scriptContent: true,
  isActive: true,
  createdBy: true,
});

export const insertUploadTemplateSchema = createInsertSchema(uploadTemplates).omit({
  id: true,
  usageCount: true,
  lastUsedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUploadSessionSchema = createInsertSchema(uploadSessions).pick({
  sessionId: true,
  entityType: true,
  environmentId: true,
  fileName: true,
  status: true,
  currentStep: true,
  errorLog: true,
  processedRows: true,
  totalRows: true,
  createdBy: true,
});

export const insertUploadErrorSchema = createInsertSchema(uploadErrors).pick({
  sessionId: true,
  rowNumber: true,
  errorType: true,
  errorMessage: true,
  problematicData: true,
  resolutionAction: true,
  isResolved: true,
});

// Types
export type InsertUploadSetting = z.infer<typeof insertUploadSettingSchema>;
export type UploadSetting = typeof uploadSettings.$inferSelect;

export type InsertTransformationScript = z.infer<typeof insertTransformationScriptSchema>;
export type TransformationScript = typeof transformationScripts.$inferSelect;

export type InsertUploadTemplate = z.infer<typeof insertUploadTemplateSchema>;
export type UploadTemplate = typeof uploadTemplates.$inferSelect;

export type InsertUploadSession = z.infer<typeof insertUploadSessionSchema>;
export type UploadSession = typeof uploadSessions.$inferSelect;

export type InsertUploadError = z.infer<typeof insertUploadErrorSchema>;
export type UploadError = typeof uploadErrors.$inferSelect;

// Activity tables type exports
export const insertActivityTaskSchema = createInsertSchema(activityTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const insertActivityCommentSchema = createInsertSchema(activityComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityAttachmentSchema = createInsertSchema(activityAttachments).omit({
  id: true,
  createdAt: true,
});

export const insertNextBestActionSchema = createInsertSchema(nextBestActions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ActivityTask = typeof activityTasks.$inferSelect;
export type InsertActivityTask = z.infer<typeof insertActivityTaskSchema>;

export type ActivityComment = typeof activityComments.$inferSelect;
export type InsertActivityComment = z.infer<typeof insertActivityCommentSchema>;

export type ActivityAttachment = typeof activityAttachments.$inferSelect;
export type InsertActivityAttachment = z.infer<typeof insertActivityAttachmentSchema>;

export type NextBestAction = typeof nextBestActions.$inferSelect;
export type InsertNextBestAction = z.infer<typeof insertNextBestActionSchema>;

// Product and Category types
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;

export type ProductCategory = typeof productCategories.$inferSelect;
export type InsertProductCategory = z.infer<typeof insertProductCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// Product Catalogue insert schemas and types
export const insertProductCatalogueSchema = createInsertSchema(productCatalogues).pick({
  name: true,
  description: true,
  status: true,
  effectiveFrom: true,
  effectiveTo: true,
});

export const insertCatalogueProductSchema = createInsertSchema(catalogueProducts).pick({
  productId: true,
  catalogueId: true,
  categoryId: true,
  visible: true,
  nameOverride: true,
  priceOverride: true,
});

export type ProductCatalogue = typeof productCatalogues.$inferSelect;
export type InsertProductCatalogue = z.infer<typeof insertProductCatalogueSchema>;

export type CatalogueProduct = typeof catalogueProducts.$inferSelect;
export type InsertCatalogueProduct = z.infer<typeof insertCatalogueProductSchema>;

// Product Catalogues relationships
export const productCataloguesRelations = relations(productCatalogues, ({ many }) => ({
  catalogueProducts: many(catalogueProducts),
}));

// Catalogue Products relationships
export const catalogueProductsRelations = relations(catalogueProducts, ({ one }) => ({
  product: one(products, {
    fields: [catalogueProducts.productId],
    references: [products.id],
  }),
  catalogue: one(productCatalogues, {
    fields: [catalogueProducts.catalogueId],
    references: [productCatalogues.id],
  }),
  category: one(productCategories, {
    fields: [catalogueProducts.categoryId],
    references: [productCategories.id],
  }),
}));

export const insertBrokerPartnerMappingSchema = createInsertSchema(brokerPartnerMappings).pick({
  brokerUserId: true,
  environmentId: true,
  partnerId: true,
  brokerPartnerName: true,
  isActive: true,
});

export type BrokerPartnerMapping = typeof brokerPartnerMappings.$inferSelect;
export type InsertBrokerPartnerMapping = z.infer<typeof insertBrokerPartnerMappingSchema>;

