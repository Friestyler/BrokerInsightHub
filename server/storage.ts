import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import {
  users, newsArticles, clients, insuranceProducts, clientProducts, opportunities,
  documents, fileComparisons, customers, customerTeamMembers, customerPartners,
  vendors, products, okrMetrics,
  type User, type InsertUser,
  type NewsArticle, type InsertNewsArticle,
  type Client, type InsertClient,
  type InsuranceProduct, type InsertInsuranceProduct,
  type ClientProduct, type InsertClientProduct,
  type Opportunity, type InsertOpportunity,
  type Document, type InsertDocument,
  type FileComparison, type InsertFileComparison,
  type Customer, type InsertCustomer,
  type CustomerTeamMember, type InsertCustomerTeamMember,
  type CustomerPartner, type InsertCustomerPartner,
  type Vendor, type InsertVendor,
  type Product, type InsertProduct,
  type OkrMetric, type InsertOkrMetric
} from '../shared/schema';

export interface ClientWithDetails extends Client {
  currentProducts: InsuranceProduct[];
  opportunity: InsuranceProduct;
  probability: number;
  estimatedValue: number;
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
  
  // Client operations
  getAllClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  
  // Insurance product operations
  getAllInsuranceProducts(): Promise<InsuranceProduct[]>;
  getInsuranceProduct(id: number): Promise<InsuranceProduct | undefined>;
  createInsuranceProduct(product: InsertInsuranceProduct): Promise<InsuranceProduct>;
  
  // Client product operations
  getClientProducts(clientId: number): Promise<InsuranceProduct[]>;
  addClientProduct(data: InsertClientProduct): Promise<ClientProduct>;
  
  // Opportunity operations
  getAllOpportunities(): Promise<Opportunity[]>;
  getOpportunity(id: number): Promise<Opportunity | undefined>;
  getOpportunitiesForClient(clientId: number): Promise<Opportunity[]>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  updateOpportunity(id: number, updates: Partial<InsertOpportunity>): Promise<Opportunity | undefined>;
  deleteOpportunity(id: number): Promise<boolean>;
  
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
  
  // Customer team members operations
  getCustomerTeamMembers(customerId: number): Promise<CustomerTeamMember[]>;
  addCustomerTeamMember(data: InsertCustomerTeamMember): Promise<CustomerTeamMember>;
  
  // Customer partners operations
  getCustomerPartners(customerId: number): Promise<CustomerPartner[]>;
  addCustomerPartner(data: InsertCustomerPartner): Promise<CustomerPartner>;
  
  // Vendor operations
  getAllVendors(): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  
  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  getVendorProducts(vendorId: number): Promise<Product[]>;
  
  // OKR Metrics operations
  getAllOkrMetrics(): Promise<OkrMetric[]>;
  getOkrMetric(id: number): Promise<OkrMetric | undefined>;
  createOkrMetric(metric: InsertOkrMetric): Promise<OkrMetric>;
  updateOkrMetric(id: number, updates: Partial<InsertOkrMetric>): Promise<OkrMetric | undefined>;
}

export class DatabaseStorage implements IStorage {
  private db: any = null;
  private currentSchema: string = 'degoudse';

  private getDb() {
    if (!this.db) {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error('DATABASE_URL is not set');
      }
      const sql = neon(connectionString);
      this.db = drizzle(sql, { 
        schema: { 
          users, newsArticles, clients, insuranceProducts, clientProducts, opportunities,
          documents, fileComparisons, customers, customerTeamMembers, customerPartners,
          vendors, products, okrMetrics
        }
      });
    }
    
    // Switch to the current environment schema
    try {
      this.db.execute(sql.raw(`SET search_path TO ${this.currentSchema}`));
    } catch (error) {
      console.log(`Using schema: ${this.currentSchema}`);
    }
    return this.db;
  }

  switchEnvironment(envId: string): DatabaseStorage {
    this.currentSchema = envId;
    return this;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await this.getDb().select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.getDb().select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.getDb().insert(users).values(insertUser).returning();
    return user;
  }

  // News operations
  async getAllNewsArticles(): Promise<NewsArticle[]> {
    return this.getDb().select().from(newsArticles);
  }

  async getNewsArticle(id: number): Promise<NewsArticle | undefined> {
    const [article] = await this.getDb().select().from(newsArticles).where(eq(newsArticles.id, id));
    return article;
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const [newArticle] = await this.getDb().insert(newsArticles).values(article).returning();
    return newArticle;
  }

  // Opportunity operations
  async getAllOpportunities(): Promise<Opportunity[]> {
    try {
      const result = await this.getDb().select().from(opportunities).orderBy(opportunities.createdAt);
      console.log(`Found ${result?.length || 0} opportunities in ${this.currentSchema} schema`);
      return result || [];
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      return [];
    }
  }

  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    const [opportunity] = await this.getDb().select().from(opportunities).where(eq(opportunities.id, id));
    return opportunity;
  }

  async createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity> {
    const [newOpportunity] = await this.getDb().insert(opportunities).values(opportunity).returning();
    return newOpportunity;
  }

  async updateOpportunity(id: number, updates: Partial<InsertOpportunity>): Promise<Opportunity | undefined> {
    const [updatedOpportunity] = await this.getDb()
      .update(opportunities)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(opportunities.id, id))
      .returning();
    return updatedOpportunity;
  }

  async deleteOpportunity(id: number): Promise<boolean> {
    const result = await this.getDb().delete(opportunities).where(eq(opportunities.id, id));
    return (result as any).rowCount > 0;
  }

  async getOpportunitiesForClient(clientId: number): Promise<Opportunity[]> {
    return this.getDb().select().from(opportunities).where(eq(opportunities.clientId, clientId));
  }

  // Client operations
  async getAllClients(): Promise<Client[]> {
    return this.getDb().select().from(clients);
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await this.getDb().select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await this.getDb().insert(clients).values(client).returning();
    return newClient;
  }

  // Insurance product operations
  async getAllInsuranceProducts(): Promise<InsuranceProduct[]> {
    return this.getDb().select().from(insuranceProducts);
  }

  async getInsuranceProduct(id: number): Promise<InsuranceProduct | undefined> {
    const [product] = await this.getDb().select().from(insuranceProducts).where(eq(insuranceProducts.id, id));
    return product;
  }

  async createInsuranceProduct(product: InsertInsuranceProduct): Promise<InsuranceProduct> {
    const [newProduct] = await this.getDb().insert(insuranceProducts).values(product).returning();
    return newProduct;
  }

  // Client product operations
  async getClientProducts(clientId: number): Promise<InsuranceProduct[]> {
    const clientProductRecords = await this.getDb()
      .select()
      .from(clientProducts)
      .where(eq(clientProducts.clientId, clientId));
    
    const productIds = clientProductRecords.map(cp => cp.productId);
    if (productIds.length === 0) return [];
    
    return this.getDb()
      .select()
      .from(insuranceProducts)
      .where(sql`${insuranceProducts.id} = ANY(${productIds})`);
  }

  async addClientProduct(data: InsertClientProduct): Promise<ClientProduct> {
    const [clientProduct] = await this.getDb().insert(clientProducts).values(data).returning();
    return clientProduct;
  }

  // Document operations
  async getAllDocuments(userId: number): Promise<Document[]> {
    return this.getDb().select().from(documents).where(eq(documents.userId, userId));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await this.getDb().select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await this.getDb().insert(documents).values(document).returning();
    return newDocument;
  }

  // Vendor operations
  async getAllVendors(): Promise<Vendor[]> {
    return this.getDb().select().from(vendors);
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await this.getDb().select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }

  async createVendor(vendorData: InsertVendor): Promise<Vendor> {
    const [vendor] = await this.getDb().insert(vendors).values(vendorData).returning();
    return vendor;
  }

  // Product operations
  async getAllProducts(): Promise<Product[]> {
    return this.getDb().select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await this.getDb().select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await this.getDb().insert(products).values(productData).returning();
    return product;
  }

  async getVendorProducts(vendorId: number): Promise<Product[]> {
    return this.getDb().select().from(products).where(eq(products.vendorId, vendorId));
  }

  // File comparison operations
  async getFileComparisons(userId: number): Promise<FileComparison[]> {
    return this.getDb().select().from(fileComparisons).where(eq(fileComparisons.userId, userId));
  }

  async getFileComparison(id: number): Promise<FileComparison | undefined> {
    const [comparison] = await this.getDb().select().from(fileComparisons).where(eq(fileComparisons.id, id));
    return comparison;
  }

  async createFileComparison(comparison: InsertFileComparison): Promise<FileComparison> {
    const [newComparison] = await this.getDb().insert(fileComparisons).values(comparison).returning();
    return newComparison;
  }

  // Customer operations
  async getAllCustomers(): Promise<Customer[]> {
    return this.getDb().select().from(customers);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await this.getDb().select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    const [customer] = await this.getDb().insert(customers).values(customerData).returning();
    return customer;
  }

  async getCustomerTeamMembers(customerId: number): Promise<CustomerTeamMember[]> {
    return this.getDb().select().from(customerTeamMembers).where(eq(customerTeamMembers.customerId, customerId));
  }

  async addCustomerTeamMember(data: InsertCustomerTeamMember): Promise<CustomerTeamMember> {
    const [teamMember] = await this.getDb().insert(customerTeamMembers).values(data).returning();
    return teamMember;
  }

  async getCustomerPartners(customerId: number): Promise<CustomerPartner[]> {
    return this.getDb().select().from(customerPartners).where(eq(customerPartners.customerId, customerId));
  }

  async addCustomerPartner(data: InsertCustomerPartner): Promise<CustomerPartner> {
    const [partner] = await this.getDb().insert(customerPartners).values(data).returning();
    return partner;
  }

  // OKR Template operations
  async getAllOkrTemplates(): Promise<OkrTemplate[]> {
    return this.getDb().select().from(okrTemplates);
  }

  async getOkrTemplate(id: number): Promise<OkrTemplate | undefined> {
    const [template] = await this.getDb().select().from(okrTemplates).where(eq(okrTemplates.id, id));
    return template;
  }

  async createOkrTemplate(template: InsertOkrTemplate): Promise<OkrTemplate> {
    const [newTemplate] = await this.getDb().insert(okrTemplates).values(template).returning();
    return newTemplate;
  }

  async getOkrTemplatesByTags(tags: string[]): Promise<OkrTemplate[]> {
    return this.getDb().select().from(okrTemplates).where(sql`${okrTemplates.tags} && ${tags}`);
  }

  // OKR Metric operations
  async getOkrMetrics(templateId: number): Promise<OkrMetric[]> {
    return this.getDb().select().from(okrMetrics).where(eq(okrMetrics.templateId, templateId));
  }

  async getOkrMetric(id: number): Promise<OkrMetric | undefined> {
    const [metric] = await this.getDb().select().from(okrMetrics).where(eq(okrMetrics.id, id));
    return metric;
  }

  async createOkrMetric(metric: InsertOkrMetric): Promise<OkrMetric> {
    const [newMetric] = await this.getDb().insert(okrMetrics).values(metric).returning();
    return newMetric;
  }

  async updateOkrMetric(id: number, updates: Partial<InsertOkrMetric>): Promise<OkrMetric | undefined> {
    const [updatedMetric] = await this.getDb()
      .update(okrMetrics)
      .set(updates)
      .where(eq(okrMetrics.id, id))
      .returning();
    return updatedMetric;
  }
}

export const storage = new DatabaseStorage();