import { pgTable, text, serial, integer, boolean, timestamp, json, pgEnum, date, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Entity relationship types enum
export const relationshipTypeEnum = pgEnum('relationship_type', ['one_to_many', 'many_to_one', 'many_to_many']);

// Attribute types enum
export const attributeTypeEnum = pgEnum('attribute_type', [
  'text', 
  'long_text', 
  'number', 
  'date', 
  'datetime', 
  'boolean', 
  'single_select', 
  'multi_select', 
  'user_single', 
  'user_multi', 
  'currency', 
  'percent',
  'relationship'
]);

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

//==== ENTITY DEFINITIONS ====//

// Customers entity
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdById: integer("created_by_id").references(() => users.id),
  lastModifiedById: integer("last_modified_by_id").references(() => users.id),
});

// Partners entity
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdById: integer("created_by_id").references(() => users.id),
  lastModifiedById: integer("last_modified_by_id").references(() => users.id),
});

// Opportunities entity
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: integer("owner_id").references(() => users.id),
  amount: decimal("amount", { precision: 15, scale: 2 }),
  stage: text("stage"),
  probability: integer("probability"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdById: integer("created_by_id").references(() => users.id),
  lastModifiedById: integer("last_modified_by_id").references(() => users.id),
});

// Projects entity
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdById: integer("created_by_id").references(() => users.id),
  lastModifiedById: integer("last_modified_by_id").references(() => users.id),
});

// Contacts entity
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  email: text("email"),
  phone: text("phone"),
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdById: integer("created_by_id").references(() => users.id),
  lastModifiedById: integer("last_modified_by_id").references(() => users.id),
});

//==== ENTITY ATTRIBUTES ====//

// Entity definition table
export const entityDefinitions = pgTable("entity_definitions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  tableName: text("table_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  environment: text("environment").notNull(), // 'acme', 'myqollabi', etc.
});

// Entity attributes definition table
export const entityAttributes = pgTable("entity_attributes", {
  id: serial("id").primaryKey(),
  entityDefinitionId: integer("entity_definition_id").notNull().references(() => entityDefinitions.id),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  type: attributeTypeEnum("type").notNull(),
  isRequired: boolean("is_required").default(false).notNull(),
  isSystemAttribute: boolean("is_system_attribute").default(false).notNull(),
  defaultValue: text("default_value"),
  options: json("options"), // For select attributes, store possible values
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  orderIndex: integer("order_index").notNull(), // For UI ordering
  environment: text("environment").notNull(), // 'acme', 'myqollabi', etc.
});

// Relationship attribute definitions
export const relationshipAttributes = pgTable("relationship_attributes", {
  id: serial("id").primaryKey(),
  sourceEntityId: integer("source_entity_id").notNull().references(() => entityDefinitions.id),
  targetEntityId: integer("target_entity_id").notNull().references(() => entityDefinitions.id),
  sourceAttributeId: integer("source_attribute_id").notNull().references(() => entityAttributes.id),
  targetAttributeId: integer("target_attribute_id").notNull().references(() => entityAttributes.id),
  relationshipType: relationshipTypeEnum("relationship_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  environment: text("environment").notNull(), // 'acme', 'myqollabi', etc.
});

//==== RELATIONSHIP TABLES ====//

// Customer-User relationship (Team members)
export const customerTeamMembers = pgTable("customer_team_members", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  userId: integer("user_id").notNull().references(() => users.id),
});

// Partner-User relationship (Team members)
export const partnerTeamMembers = pgTable("partner_team_members", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partners.id),
  userId: integer("user_id").notNull().references(() => users.id),
});

// Opportunity-User relationship (Team members)
export const opportunityTeamMembers = pgTable("opportunity_team_members", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id").notNull().references(() => opportunities.id),
  userId: integer("user_id").notNull().references(() => users.id),
});

// Project-User relationship (Team members)
export const projectTeamMembers = pgTable("project_team_members", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  userId: integer("user_id").notNull().references(() => users.id),
});

// Many-to-many relationships
export const customerPartners = pgTable("customer_partners", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  partnerId: integer("partner_id").notNull().references(() => partners.id),
});

export const opportunityCustomers = pgTable("opportunity_customers", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id").notNull().references(() => opportunities.id),
  customerId: integer("customer_id").notNull().references(() => customers.id),
});

export const opportunityPartners = pgTable("opportunity_partners", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id").notNull().references(() => opportunities.id),
  partnerId: integer("partner_id").notNull().references(() => partners.id),
});

export const projectPartners = pgTable("project_partners", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  partnerId: integer("partner_id").notNull().references(() => partners.id),
});

export const projectCustomers = pgTable("project_customers", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  customerId: integer("customer_id").notNull().references(() => customers.id),
});

export const contactCustomers = pgTable("contact_customers", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull().references(() => contacts.id),
  customerId: integer("customer_id").notNull().references(() => customers.id),
});

//==== ENTITY VALUE STORAGE ====//

// Custom attribute values storage (for dynamic attributes)
export const entityAttributeValues = pgTable("entity_attribute_values", {
  id: serial("id").primaryKey(),
  entityId: integer("entity_id").notNull(), // ID of the entity instance
  entityType: text("entity_type").notNull(), // 'customer', 'partner', etc.
  attributeId: integer("attribute_id").notNull().references(() => entityAttributes.id),
  value: text("value"), // Store as text, convert based on attribute type
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  environment: text("environment").notNull(), // 'acme', 'myqollabi', etc.
});

//==== DOCUMENT MANAGEMENT ====//

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

//==== RELATIONS DEFINITIONS ====//

// Customers relations
export const customersRelations = relations(customers, ({ one, many }) => ({
  owner: one(users, {
    fields: [customers.ownerId],
    references: [users.id],
    relationName: "customerOwner",
  }),
  createdBy: one(users, {
    fields: [customers.createdById],
    references: [users.id],
    relationName: "customerCreatedBy",
  }),
  lastModifiedBy: one(users, {
    fields: [customers.lastModifiedById],
    references: [users.id],
    relationName: "customerLastModifiedBy",
  }),
  teamMembers: many(customerTeamMembers),
  partners: many(customerPartners),
  opportunities: many(opportunityCustomers),
  projects: many(projectCustomers),
  contacts: many(contactCustomers),
}));

// Partners relations
export const partnersRelations = relations(partners, ({ one, many }) => ({
  owner: one(users, {
    fields: [partners.ownerId],
    references: [users.id],
    relationName: "partnerOwner",
  }),
  createdBy: one(users, {
    fields: [partners.createdById],
    references: [users.id],
    relationName: "partnerCreatedBy",
  }),
  lastModifiedBy: one(users, {
    fields: [partners.lastModifiedById],
    references: [users.id],
    relationName: "partnerLastModifiedBy",
  }),
  teamMembers: many(partnerTeamMembers),
  customers: many(customerPartners),
  opportunities: many(opportunityPartners),
  projects: many(projectPartners),
}));

// Opportunities relations
export const opportunitiesRelations = relations(opportunities, ({ one, many }) => ({
  owner: one(users, {
    fields: [opportunities.ownerId],
    references: [users.id],
    relationName: "opportunityOwner",
  }),
  createdBy: one(users, {
    fields: [opportunities.createdById],
    references: [users.id],
    relationName: "opportunityCreatedBy",
  }),
  lastModifiedBy: one(users, {
    fields: [opportunities.lastModifiedById],
    references: [users.id],
    relationName: "opportunityLastModifiedBy",
  }),
  teamMembers: many(opportunityTeamMembers),
  customers: many(opportunityCustomers),
  partners: many(opportunityPartners),
}));

// Projects relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
    relationName: "projectOwner",
  }),
  createdBy: one(users, {
    fields: [projects.createdById],
    references: [users.id],
    relationName: "projectCreatedBy",
  }),
  lastModifiedBy: one(users, {
    fields: [projects.lastModifiedById],
    references: [users.id],
    relationName: "projectLastModifiedBy",
  }),
  teamMembers: many(projectTeamMembers),
  customers: many(projectCustomers),
  partners: many(projectPartners),
}));

// Contacts relations
export const contactsRelations = relations(contacts, ({ one, many }) => ({
  owner: one(users, {
    fields: [contacts.ownerId],
    references: [users.id],
    relationName: "contactOwner",
  }),
  createdBy: one(users, {
    fields: [contacts.createdById],
    references: [users.id],
    relationName: "contactCreatedBy",
  }),
  lastModifiedBy: one(users, {
    fields: [contacts.lastModifiedById],
    references: [users.id],
    relationName: "contactLastModifiedBy",
  }),
  customers: many(contactCustomers),
}));

// Entity definitions relations
export const entityDefinitionsRelations = relations(entityDefinitions, ({ many }) => ({
  attributes: many(entityAttributes),
}));

// Entity attributes relations
export const entityAttributesRelations = relations(entityAttributes, ({ one, many }) => ({
  entityDefinition: one(entityDefinitions, {
    fields: [entityAttributes.entityDefinitionId],
    references: [entityDefinitions.id],
  }),
  attributeValues: many(entityAttributeValues),
}));

//==== INSERT SCHEMAS ====//

// User
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  avatarInitials: true,
});

// News Articles
export const insertNewsArticleSchema = createInsertSchema(newsArticles).pick({
  title: true,
  content: true,
  summary: true,
  category: true,
  imageUrl: true,
  publishedDate: true,
});

// Documents and File Comparisons
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

// Core Entities
export const insertCustomerSchema = createInsertSchema(customers).pick({
  name: true,
  description: true,
  ownerId: true,
  createdById: true,
  lastModifiedById: true,
});

export const insertPartnerSchema = createInsertSchema(partners).pick({
  name: true,
  description: true,
  ownerId: true,
  createdById: true,
  lastModifiedById: true,
});

export const insertOpportunitySchema = createInsertSchema(opportunities).pick({
  name: true,
  description: true,
  ownerId: true,
  amount: true,
  stage: true,
  probability: true,
  createdById: true,
  lastModifiedById: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  ownerId: true,
  createdById: true,
  lastModifiedById: true,
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  name: true,
  description: true,
  email: true,
  phone: true,
  ownerId: true,
  createdById: true,
  lastModifiedById: true,
});

// Team Members
export const insertCustomerTeamMemberSchema = createInsertSchema(customerTeamMembers).pick({
  customerId: true,
  userId: true,
});

export const insertPartnerTeamMemberSchema = createInsertSchema(partnerTeamMembers).pick({
  partnerId: true,
  userId: true,
});

export const insertOpportunityTeamMemberSchema = createInsertSchema(opportunityTeamMembers).pick({
  opportunityId: true,
  userId: true,
});

export const insertProjectTeamMemberSchema = createInsertSchema(projectTeamMembers).pick({
  projectId: true,
  userId: true,
});

// Relationships
export const insertCustomerPartnerSchema = createInsertSchema(customerPartners).pick({
  customerId: true,
  partnerId: true,
});

export const insertOpportunityCustomerSchema = createInsertSchema(opportunityCustomers).pick({
  opportunityId: true,
  customerId: true,
});

export const insertOpportunityPartnerSchema = createInsertSchema(opportunityPartners).pick({
  opportunityId: true,
  partnerId: true,
});

export const insertProjectCustomerSchema = createInsertSchema(projectCustomers).pick({
  projectId: true,
  customerId: true,
});

export const insertProjectPartnerSchema = createInsertSchema(projectPartners).pick({
  projectId: true,
  partnerId: true,
});

export const insertContactCustomerSchema = createInsertSchema(contactCustomers).pick({
  contactId: true,
  customerId: true,
});

// Attribute System
export const insertEntityDefinitionSchema = createInsertSchema(entityDefinitions).pick({
  name: true,
  displayName: true,
  description: true,
  tableName: true,
  environment: true,
});

export const insertEntityAttributeSchema = createInsertSchema(entityAttributes).pick({
  entityDefinitionId: true,
  name: true,
  displayName: true,
  description: true,
  type: true,
  isRequired: true,
  isSystemAttribute: true,
  defaultValue: true,
  options: true,
  orderIndex: true,
  environment: true,
});

export const insertRelationshipAttributeSchema = createInsertSchema(relationshipAttributes).pick({
  sourceEntityId: true,
  targetEntityId: true,
  sourceAttributeId: true,
  targetAttributeId: true,
  relationshipType: true,
  environment: true,
});

export const insertEntityAttributeValueSchema = createInsertSchema(entityAttributeValues).pick({
  entityId: true,
  entityType: true,
  attributeId: true,
  value: true,
  environment: true,
});

//==== TYPES ====//

// Users and Media
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type NewsArticle = typeof newsArticles.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertFileComparison = z.infer<typeof insertFileComparisonSchema>;
export type FileComparison = typeof fileComparisons.$inferSelect;

// Core Entities
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;

export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Opportunity = typeof opportunities.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Team Members
export type InsertCustomerTeamMember = z.infer<typeof insertCustomerTeamMemberSchema>;
export type CustomerTeamMember = typeof customerTeamMembers.$inferSelect;

export type InsertPartnerTeamMember = z.infer<typeof insertPartnerTeamMemberSchema>;
export type PartnerTeamMember = typeof partnerTeamMembers.$inferSelect;

export type InsertOpportunityTeamMember = z.infer<typeof insertOpportunityTeamMemberSchema>;
export type OpportunityTeamMember = typeof opportunityTeamMembers.$inferSelect;

export type InsertProjectTeamMember = z.infer<typeof insertProjectTeamMemberSchema>;
export type ProjectTeamMember = typeof projectTeamMembers.$inferSelect;

// Relationships
export type InsertCustomerPartner = z.infer<typeof insertCustomerPartnerSchema>;
export type CustomerPartner = typeof customerPartners.$inferSelect;

export type InsertOpportunityCustomer = z.infer<typeof insertOpportunityCustomerSchema>;
export type OpportunityCustomer = typeof opportunityCustomers.$inferSelect;

export type InsertOpportunityPartner = z.infer<typeof insertOpportunityPartnerSchema>;
export type OpportunityPartner = typeof opportunityPartners.$inferSelect;

export type InsertProjectCustomer = z.infer<typeof insertProjectCustomerSchema>;
export type ProjectCustomer = typeof projectCustomers.$inferSelect;

export type InsertProjectPartner = z.infer<typeof insertProjectPartnerSchema>;
export type ProjectPartner = typeof projectPartners.$inferSelect;

export type InsertContactCustomer = z.infer<typeof insertContactCustomerSchema>;
export type ContactCustomer = typeof contactCustomers.$inferSelect;

// Attribute System
export type InsertEntityDefinition = z.infer<typeof insertEntityDefinitionSchema>;
export type EntityDefinition = typeof entityDefinitions.$inferSelect;

export type InsertEntityAttribute = z.infer<typeof insertEntityAttributeSchema>;
export type EntityAttribute = typeof entityAttributes.$inferSelect;

export type InsertRelationshipAttribute = z.infer<typeof insertRelationshipAttributeSchema>;
export type RelationshipAttribute = typeof relationshipAttributes.$inferSelect;

export type InsertEntityAttributeValue = z.infer<typeof insertEntityAttributeValueSchema>;
export type EntityAttributeValue = typeof entityAttributeValues.$inferSelect;

// Enums
export type RelationshipType = "one_to_many" | "many_to_one" | "many_to_many";
export type AttributeType = 
  | "text" 
  | "long_text" 
  | "number" 
  | "date" 
  | "datetime" 
  | "boolean" 
  | "single_select" 
  | "multi_select" 
  | "user_single" 
  | "user_multi" 
  | "currency" 
  | "percent"
  | "relationship";
