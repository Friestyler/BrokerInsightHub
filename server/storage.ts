import { 
  // Users and media
  users, type User, type InsertUser,
  newsArticles, type NewsArticle, type InsertNewsArticle,
  documents, type Document, type InsertDocument,
  fileComparisons, type FileComparison, type InsertFileComparison,
  
  // Core entities
  customers, type Customer, type InsertCustomer,
  partners, type Partner, type InsertPartner,
  opportunities, type Opportunity, type InsertOpportunity,
  projects, type Project, type InsertProject,
  contacts, type Contact, type InsertContact,
  
  // Team members
  customerTeamMembers, type CustomerTeamMember, type InsertCustomerTeamMember,
  partnerTeamMembers, type PartnerTeamMember, type InsertPartnerTeamMember,
  opportunityTeamMembers, type OpportunityTeamMember, type InsertOpportunityTeamMember,
  projectTeamMembers, type ProjectTeamMember, type InsertProjectTeamMember,
  
  // Relationships
  customerPartners, type CustomerPartner, type InsertCustomerPartner,
  opportunityCustomers, type OpportunityCustomer, type InsertOpportunityCustomer,
  opportunityPartners, type OpportunityPartner, type InsertOpportunityPartner,
  projectCustomers, type ProjectCustomer, type InsertProjectCustomer,
  projectPartners, type ProjectPartner, type InsertProjectPartner,
  contactCustomers, type ContactCustomer, type InsertContactCustomer,
  
  // Attribute system
  entityDefinitions, type EntityDefinition, type InsertEntityDefinition,
  entityAttributes, type EntityAttribute, type InsertEntityAttribute,
  relationshipAttributes, type RelationshipAttribute, type InsertRelationshipAttribute,
  entityAttributeValues, type EntityAttributeValue, type InsertEntityAttributeValue
} from "@shared/schema";
import { db, getEnvironmentDb } from './db';
import { eq, and, desc } from 'drizzle-orm';

// Interface for entities with related opportunities
export interface CustomerWithOpportunities extends Customer {
  opportunities: Opportunity[];
}

export interface PartnerWithOpportunities extends Partner {
  opportunities: Opportunity[];
}

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // News operations
  getAllNewsArticles(): Promise<NewsArticle[]>;
  getNewsArticle(id: number): Promise<NewsArticle | undefined>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  
  // Document operations
  getAllDocuments(userId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  
  // File comparison operations
  getFileComparisons(userId: number): Promise<FileComparison[]>;
  getFileComparison(id: number): Promise<FileComparison | undefined>;
  createFileComparison(comparison: InsertFileComparison): Promise<FileComparison>;
  
  // Customer operations
  getAllCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  
  // Partner operations
  getAllPartners(): Promise<Partner[]>;
  getPartner(id: number): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  
  // Opportunity operations
  getAllOpportunities(): Promise<Opportunity[]>;
  getOpportunity(id: number): Promise<Opportunity | undefined>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  
  // Project operations
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  
  // Contact operations
  getAllContacts(): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  
  // Team member operations
  getCustomerTeamMembers(customerId: number): Promise<CustomerTeamMember[]>;
  addCustomerTeamMember(data: InsertCustomerTeamMember): Promise<CustomerTeamMember>;
  getPartnerTeamMembers(partnerId: number): Promise<PartnerTeamMember[]>;
  addPartnerTeamMember(data: InsertPartnerTeamMember): Promise<PartnerTeamMember>;
  getOpportunityTeamMembers(opportunityId: number): Promise<OpportunityTeamMember[]>;
  addOpportunityTeamMember(data: InsertOpportunityTeamMember): Promise<OpportunityTeamMember>;
  getProjectTeamMembers(projectId: number): Promise<ProjectTeamMember[]>;
  addProjectTeamMember(data: InsertProjectTeamMember): Promise<ProjectTeamMember>;
  
  // Relationship operations
  getCustomerPartners(customerId: number): Promise<CustomerPartner[]>;
  addCustomerPartner(data: InsertCustomerPartner): Promise<CustomerPartner>;
  getOpportunityCustomers(opportunityId: number): Promise<OpportunityCustomer[]>;
  addOpportunityCustomer(data: InsertOpportunityCustomer): Promise<OpportunityCustomer>;
  getOpportunityPartners(opportunityId: number): Promise<OpportunityPartner[]>;
  addOpportunityPartner(data: InsertOpportunityPartner): Promise<OpportunityPartner>;
  getProjectCustomers(projectId: number): Promise<ProjectCustomer[]>;
  addProjectCustomer(data: InsertProjectCustomer): Promise<ProjectCustomer>;
  getProjectPartners(projectId: number): Promise<ProjectPartner[]>;
  addProjectPartner(data: InsertProjectPartner): Promise<ProjectPartner>;
  getContactCustomers(contactId: number): Promise<ContactCustomer[]>;
  addContactCustomer(data: InsertContactCustomer): Promise<ContactCustomer>;
  
  // Entity definitions and attributes
  getEntityDefinitions(environment: string): Promise<EntityDefinition[]>;
  getEntityDefinition(id: number): Promise<EntityDefinition | undefined>;
  createEntityDefinition(definition: InsertEntityDefinition): Promise<EntityDefinition>;
  
  getEntityAttributes(entityDefinitionId: number): Promise<EntityAttribute[]>;
  getEntityAttribute(id: number): Promise<EntityAttribute | undefined>;
  createEntityAttribute(attribute: InsertEntityAttribute): Promise<EntityAttribute>;
  
  getRelationshipAttributes(environment: string): Promise<RelationshipAttribute[]>;
  getRelationshipAttribute(id: number): Promise<RelationshipAttribute | undefined>;
  createRelationshipAttribute(relationship: InsertRelationshipAttribute): Promise<RelationshipAttribute>;
  
  // Entity attribute values
  getEntityAttributeValues(entityId: number, entityType: string): Promise<EntityAttributeValue[]>;
  getEntityAttributeValue(attributeId: number, entityId: number): Promise<EntityAttributeValue | undefined>;
  createEntityAttributeValue(value: InsertEntityAttributeValue): Promise<EntityAttributeValue>;
  updateEntityAttributeValue(id: number, value: string): Promise<EntityAttributeValue | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // News operations
  async getAllNewsArticles(): Promise<NewsArticle[]> {
    return await db.select().from(newsArticles).orderBy(desc(newsArticles.publishedDate));
  }
  
  async getNewsArticle(id: number): Promise<NewsArticle | undefined> {
    const [article] = await db.select().from(newsArticles).where(eq(newsArticles.id, id));
    return article;
  }
  
  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const [newsArticle] = await db.insert(newsArticles).values(article).returning();
    return newsArticle;
  }
  
  // Document operations
  async getAllDocuments(userId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId));
  }
  
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }
  
  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }
  
  // File comparison operations
  async getFileComparisons(userId: number): Promise<FileComparison[]> {
    return await db.select().from(fileComparisons).where(eq(fileComparisons.userId, userId));
  }
  
  async getFileComparison(id: number): Promise<FileComparison | undefined> {
    const [comparison] = await db.select().from(fileComparisons).where(eq(fileComparisons.id, id));
    return comparison;
  }
  
  async createFileComparison(comparison: InsertFileComparison): Promise<FileComparison> {
    const [newComparison] = await db.insert(fileComparisons).values(comparison).returning();
    return newComparison;
  }
  
  // Customer operations
  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }
  
  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }
  
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const now = new Date();
    const [newCustomer] = await db.insert(customers).values({
      ...customer,
      createdAt: now,
      updatedAt: now
    }).returning();
    return newCustomer;
  }
  
  // Partner operations
  async getAllPartners(): Promise<Partner[]> {
    return await db.select().from(partners);
  }
  
  async getPartner(id: number): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner;
  }
  
  async createPartner(partner: InsertPartner): Promise<Partner> {
    const now = new Date();
    const [newPartner] = await db.insert(partners).values({
      ...partner,
      createdAt: now,
      updatedAt: now
    }).returning();
    return newPartner;
  }
  
  // Opportunity operations
  async getAllOpportunities(): Promise<Opportunity[]> {
    return await db.select().from(opportunities);
  }
  
  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    const [opportunity] = await db.select().from(opportunities).where(eq(opportunities.id, id));
    return opportunity;
  }
  
  async createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity> {
    const now = new Date();
    const [newOpportunity] = await db.insert(opportunities).values({
      ...opportunity,
      createdAt: now,
      updatedAt: now
    }).returning();
    return newOpportunity;
  }
  
  // Project operations
  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    const now = new Date();
    const [newProject] = await db.insert(projects).values({
      ...project,
      createdAt: now,
      updatedAt: now
    }).returning();
    return newProject;
  }
  
  // Contact operations
  async getAllContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }
  
  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }
  
  async createContact(contact: InsertContact): Promise<Contact> {
    const now = new Date();
    const [newContact] = await db.insert(contacts).values({
      ...contact,
      createdAt: now,
      updatedAt: now
    }).returning();
    return newContact;
  }
  
  // Team member operations
  async getCustomerTeamMembers(customerId: number): Promise<CustomerTeamMember[]> {
    return await db.select().from(customerTeamMembers).where(eq(customerTeamMembers.customerId, customerId));
  }
  
  async addCustomerTeamMember(data: InsertCustomerTeamMember): Promise<CustomerTeamMember> {
    const [teamMember] = await db.insert(customerTeamMembers).values(data).returning();
    return teamMember;
  }
  
  async getPartnerTeamMembers(partnerId: number): Promise<PartnerTeamMember[]> {
    return await db.select().from(partnerTeamMembers).where(eq(partnerTeamMembers.partnerId, partnerId));
  }
  
  async addPartnerTeamMember(data: InsertPartnerTeamMember): Promise<PartnerTeamMember> {
    const [teamMember] = await db.insert(partnerTeamMembers).values(data).returning();
    return teamMember;
  }
  
  async getOpportunityTeamMembers(opportunityId: number): Promise<OpportunityTeamMember[]> {
    return await db.select().from(opportunityTeamMembers).where(eq(opportunityTeamMembers.opportunityId, opportunityId));
  }
  
  async addOpportunityTeamMember(data: InsertOpportunityTeamMember): Promise<OpportunityTeamMember> {
    const [teamMember] = await db.insert(opportunityTeamMembers).values(data).returning();
    return teamMember;
  }
  
  async getProjectTeamMembers(projectId: number): Promise<ProjectTeamMember[]> {
    return await db.select().from(projectTeamMembers).where(eq(projectTeamMembers.projectId, projectId));
  }
  
  async addProjectTeamMember(data: InsertProjectTeamMember): Promise<ProjectTeamMember> {
    const [teamMember] = await db.insert(projectTeamMembers).values(data).returning();
    return teamMember;
  }
  
  // Relationship operations
  async getCustomerPartners(customerId: number): Promise<CustomerPartner[]> {
    return await db.select().from(customerPartners).where(eq(customerPartners.customerId, customerId));
  }
  
  async addCustomerPartner(data: InsertCustomerPartner): Promise<CustomerPartner> {
    const [relationship] = await db.insert(customerPartners).values(data).returning();
    return relationship;
  }
  
  async getOpportunityCustomers(opportunityId: number): Promise<OpportunityCustomer[]> {
    return await db.select().from(opportunityCustomers).where(eq(opportunityCustomers.opportunityId, opportunityId));
  }
  
  async addOpportunityCustomer(data: InsertOpportunityCustomer): Promise<OpportunityCustomer> {
    const [relationship] = await db.insert(opportunityCustomers).values(data).returning();
    return relationship;
  }
  
  async getOpportunityPartners(opportunityId: number): Promise<OpportunityPartner[]> {
    return await db.select().from(opportunityPartners).where(eq(opportunityPartners.opportunityId, opportunityId));
  }
  
  async addOpportunityPartner(data: InsertOpportunityPartner): Promise<OpportunityPartner> {
    const [relationship] = await db.insert(opportunityPartners).values(data).returning();
    return relationship;
  }
  
  async getProjectCustomers(projectId: number): Promise<ProjectCustomer[]> {
    return await db.select().from(projectCustomers).where(eq(projectCustomers.projectId, projectId));
  }
  
  async addProjectCustomer(data: InsertProjectCustomer): Promise<ProjectCustomer> {
    const [relationship] = await db.insert(projectCustomers).values(data).returning();
    return relationship;
  }
  
  async getProjectPartners(projectId: number): Promise<ProjectPartner[]> {
    return await db.select().from(projectPartners).where(eq(projectPartners.projectId, projectId));
  }
  
  async addProjectPartner(data: InsertProjectPartner): Promise<ProjectPartner> {
    const [relationship] = await db.insert(projectPartners).values(data).returning();
    return relationship;
  }
  
  async getContactCustomers(contactId: number): Promise<ContactCustomer[]> {
    return await db.select().from(contactCustomers).where(eq(contactCustomers.contactId, contactId));
  }
  
  async addContactCustomer(data: InsertContactCustomer): Promise<ContactCustomer> {
    const [relationship] = await db.insert(contactCustomers).values(data).returning();
    return relationship;
  }
  
  // Entity definitions and attributes
  async getEntityDefinitions(environment: string): Promise<EntityDefinition[]> {
    return await db.select().from(entityDefinitions).where(eq(entityDefinitions.environment, environment));
  }
  
  async getEntityDefinition(id: number): Promise<EntityDefinition | undefined> {
    const [definition] = await db.select().from(entityDefinitions).where(eq(entityDefinitions.id, id));
    return definition;
  }
  
  async createEntityDefinition(definition: InsertEntityDefinition): Promise<EntityDefinition> {
    const now = new Date();
    const [newDefinition] = await db.insert(entityDefinitions).values({
      ...definition,
      createdAt: now,
      updatedAt: now
    }).returning();
    return newDefinition;
  }
  
  async getEntityAttributes(entityDefinitionId: number): Promise<EntityAttribute[]> {
    return await db.select()
      .from(entityAttributes)
      .where(eq(entityAttributes.entityDefinitionId, entityDefinitionId))
      .orderBy(entityAttributes.orderIndex);
  }
  
  async getEntityAttribute(id: number): Promise<EntityAttribute | undefined> {
    const [attribute] = await db.select().from(entityAttributes).where(eq(entityAttributes.id, id));
    return attribute;
  }
  
  async createEntityAttribute(attribute: InsertEntityAttribute): Promise<EntityAttribute> {
    const now = new Date();
    const [newAttribute] = await db.insert(entityAttributes).values({
      ...attribute,
      createdAt: now,
      updatedAt: now
    }).returning();
    return newAttribute;
  }
  
  async getRelationshipAttributes(environment: string): Promise<RelationshipAttribute[]> {
    return await db.select().from(relationshipAttributes).where(eq(relationshipAttributes.environment, environment));
  }
  
  async getRelationshipAttribute(id: number): Promise<RelationshipAttribute | undefined> {
    const [relationship] = await db.select().from(relationshipAttributes).where(eq(relationshipAttributes.id, id));
    return relationship;
  }
  
  async createRelationshipAttribute(relationship: InsertRelationshipAttribute): Promise<RelationshipAttribute> {
    const now = new Date();
    const [newRelationship] = await db.insert(relationshipAttributes).values({
      ...relationship,
      createdAt: now,
      updatedAt: now
    }).returning();
    return newRelationship;
  }
  
  // Entity attribute values
  async getEntityAttributeValues(entityId: number, entityType: string): Promise<EntityAttributeValue[]> {
    return await db.select()
      .from(entityAttributeValues)
      .where(
        and(
          eq(entityAttributeValues.entityId, entityId),
          eq(entityAttributeValues.entityType, entityType)
        )
      );
  }
  
  async getEntityAttributeValue(attributeId: number, entityId: number): Promise<EntityAttributeValue | undefined> {
    const [value] = await db.select()
      .from(entityAttributeValues)
      .where(
        and(
          eq(entityAttributeValues.attributeId, attributeId),
          eq(entityAttributeValues.entityId, entityId)
        )
      );
    return value;
  }
  
  async createEntityAttributeValue(value: InsertEntityAttributeValue): Promise<EntityAttributeValue> {
    const now = new Date();
    const [newValue] = await db.insert(entityAttributeValues).values({
      ...value,
      createdAt: now,
      updatedAt: now
    }).returning();
    return newValue;
  }
  
  async updateEntityAttributeValue(id: number, value: string): Promise<EntityAttributeValue | undefined> {
    const now = new Date();
    const [updatedValue] = await db.update(entityAttributeValues)
      .set({ 
        value: value,
        updatedAt: now
      })
      .where(eq(entityAttributeValues.id, id))
      .returning();
    return updatedValue;
  }
}

export const storage = new DatabaseStorage();