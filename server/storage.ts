import { 
  users, type User, type InsertUser,
  newsArticles, type NewsArticle, type InsertNewsArticle,
  // Using the legacy clients/products tables during transition
  clients, type Client, type InsertClient,
  insuranceProducts, type InsuranceProduct, type InsertInsuranceProduct,
  clientProducts, type ClientProduct, type InsertClientProduct,
  // Original tables still in use
  opportunities, type Opportunity, type InsertOpportunity,
  documents, type Document, type InsertDocument,
  fileComparisons, type FileComparison, type InsertFileComparison,
  customers, type Customer, type InsertCustomer,
  customerTeamMembers, type CustomerTeamMember, type InsertCustomerTeamMember,
  customerPartners, type CustomerPartner, type InsertCustomerPartner,
  // New entity tables
  vendors, type Vendor, type InsertVendor,
  products, type Product, type InsertProduct,
  // OKR templates and metrics
  okrTemplates, type OkrTemplate, type InsertOkrTemplate,
  okrMetrics, type OkrMetric, type InsertOkrMetric
} from "@shared/schema";
import { db, getEnvironmentDb } from './db';
import { eq, and } from 'drizzle-orm';

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
  getAllOpportunities(): Promise<ClientWithDetails[]>;
  getOpportunitiesForClient(clientId: number): Promise<Opportunity[]>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  
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
  
  // OKR Templates operations
  getAllOkrTemplates(): Promise<OkrTemplate[]>;
  getOkrTemplate(id: number): Promise<OkrTemplate | undefined>;
  createOkrTemplate(template: InsertOkrTemplate): Promise<OkrTemplate>;
  getOkrTemplatesByTags(tags: string[]): Promise<OkrTemplate[]>;
  
  // OKR Metrics operations
  getOkrMetrics(templateId: number): Promise<OkrMetric[]>;
  getOkrMetric(id: number): Promise<OkrMetric | undefined>;
  createOkrMetric(metric: InsertOkrMetric): Promise<OkrMetric>;
  updateOkrMetric(id: number, updates: Partial<InsertOkrMetric>): Promise<OkrMetric | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private newsArticles: Map<number, NewsArticle>;
  private clients: Map<number, Client>;
  private insuranceProducts: Map<number, InsuranceProduct>;
  private clientProducts: Map<number, ClientProduct>;
  private opportunities: Map<number, Opportunity>;
  private documents: Map<number, Document>;
  private fileComparisons: Map<number, FileComparison>;
  private customers: Map<number, Customer>;
  private customerTeamMembers: Map<number, CustomerTeamMember>;
  private customerPartners: Map<number, CustomerPartner>;
  private vendors: Map<number, Vendor>;
  private products: Map<number, Product>;
  private okrTemplates: Map<number, any>;
  private okrMetrics: Map<number, any>;
  
  currentUserId: number;
  currentNewsArticleId: number;
  currentClientId: number;
  currentInsuranceProductId: number;
  currentClientProductId: number;
  currentOpportunityId: number;
  currentDocumentId: number;
  currentFileComparisonId: number;
  currentCustomerId: number;
  currentCustomerTeamMemberId: number;
  currentCustomerPartnerId: number;
  currentVendorId: number;
  currentProductId: number;
  currentOkrTemplateId: number;
  currentOkrMetricId: number;

  constructor() {
    this.users = new Map();
    this.newsArticles = new Map();
    this.clients = new Map();
    this.insuranceProducts = new Map();
    this.clientProducts = new Map();
    this.opportunities = new Map();
    this.documents = new Map();
    this.fileComparisons = new Map();
    this.customers = new Map();
    this.customerTeamMembers = new Map();
    this.customerPartners = new Map();
    this.vendors = new Map();
    this.products = new Map();
    this.okrTemplates = new Map();
    this.okrMetrics = new Map();
    
    this.currentUserId = 1;
    this.currentNewsArticleId = 1;
    this.currentClientId = 1;
    this.currentInsuranceProductId = 1;
    this.currentClientProductId = 1;
    this.currentOpportunityId = 1;
    this.currentDocumentId = 1;
    this.currentFileComparisonId = 1;
    this.currentCustomerId = 1;
    this.currentCustomerTeamMemberId = 1;
    this.currentCustomerPartnerId = 1;
    this.currentVendorId = 1;
    this.currentProductId = 1;
    this.currentOkrTemplateId = 1;
    this.currentOkrMetricId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // News operations
  async getAllNewsArticles(): Promise<NewsArticle[]> {
    return Array.from(this.newsArticles.values());
  }
  
  async getNewsArticle(id: number): Promise<NewsArticle | undefined> {
    return this.newsArticles.get(id);
  }
  
  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const id = this.currentNewsArticleId++;
    const newsArticle: NewsArticle = { ...article, id };
    this.newsArticles.set(id, newsArticle);
    return newsArticle;
  }
  
  // Client operations
  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }
  
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }
  
  async createClient(client: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const newClient: Client = { ...client, id };
    this.clients.set(id, newClient);
    return newClient;
  }
  
  // Insurance product operations
  async getAllInsuranceProducts(): Promise<InsuranceProduct[]> {
    return Array.from(this.insuranceProducts.values());
  }
  
  async getInsuranceProduct(id: number): Promise<InsuranceProduct | undefined> {
    return this.insuranceProducts.get(id);
  }
  
  async createInsuranceProduct(product: InsertInsuranceProduct): Promise<InsuranceProduct> {
    const id = this.currentInsuranceProductId++;
    const newProduct: InsuranceProduct = { ...product, id };
    this.insuranceProducts.set(id, newProduct);
    return newProduct;
  }
  
  // Client product operations
  async getClientProducts(clientId: number): Promise<InsuranceProduct[]> {
    const clientProductEntries = Array.from(this.clientProducts.values())
      .filter(cp => cp.clientId === clientId);
    
    const products: InsuranceProduct[] = [];
    for (const entry of clientProductEntries) {
      const product = await this.getInsuranceProduct(entry.productId);
      if (product) {
        products.push(product);
      }
    }
    
    return products;
  }
  
  async addClientProduct(data: InsertClientProduct): Promise<ClientProduct> {
    const id = this.currentClientProductId++;
    const clientProduct: ClientProduct = { ...data, id };
    this.clientProducts.set(id, clientProduct);
    return clientProduct;
  }
  
  // Opportunity operations
  async getAllOpportunities(): Promise<ClientWithDetails[]> {
    const clientOpportunities: ClientWithDetails[] = [];
    
    for (const opportunity of this.opportunities.values()) {
      const client = await this.getClient(opportunity.clientId);
      const product = await this.getInsuranceProduct(opportunity.productId);
      
      if (client && product) {
        const currentProducts = await this.getClientProducts(client.id);
        
        clientOpportunities.push({
          ...client,
          currentProducts,
          opportunity: product,
          probability: opportunity.probability,
          estimatedValue: opportunity.estimatedValue
        });
      }
    }
    
    return clientOpportunities;
  }
  
  async getOpportunitiesForClient(clientId: number): Promise<Opportunity[]> {
    return Array.from(this.opportunities.values())
      .filter(o => o.clientId === clientId);
  }
  
  async createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity> {
    const id = this.currentOpportunityId++;
    const newOpportunity: Opportunity = { ...opportunity, id };
    this.opportunities.set(id, newOpportunity);
    return newOpportunity;
  }
  
  // Document operations
  async getAllDocuments(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(doc => doc.userId === userId);
  }
  
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    // Ensure tags is always at least null if undefined
    const documentData = { 
      ...document, 
      id,
      uploadDate: new Date(),
      tags: document.tags || null,
      filePath: document.filePath || null
    };
    this.documents.set(id, documentData);
    return documentData;
  }
  
  // File comparison operations
  async getFileComparisons(userId: number): Promise<FileComparison[]> {
    return Array.from(this.fileComparisons.values())
      .filter(comp => comp.userId === userId);
  }
  
  async getFileComparison(id: number): Promise<FileComparison | undefined> {
    return this.fileComparisons.get(id);
  }
  
  async createFileComparison(comparison: InsertFileComparison): Promise<FileComparison> {
    const id = this.currentFileComparisonId++;
    const newComparison: FileComparison = { 
      ...comparison, 
      id,
      comparisonDate: new Date()
    };
    this.fileComparisons.set(id, newComparison);
    return newComparison;
  }
  
  // Customer operations
  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }
  
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }
  
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const newCustomer: Customer = { 
      ...customer, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }
  
  // Customer team member operations
  async getCustomerTeamMembers(customerId: number): Promise<CustomerTeamMember[]> {
    return Array.from(this.customerTeamMembers.values())
      .filter(member => member.customerId === customerId);
  }
  
  async addCustomerTeamMember(data: InsertCustomerTeamMember): Promise<CustomerTeamMember> {
    const id = this.currentCustomerTeamMemberId++;
    const teamMember: CustomerTeamMember = { ...data, id };
    this.customerTeamMembers.set(id, teamMember);
    return teamMember;
  }
  
  // Customer partner operations
  async getCustomerPartners(customerId: number): Promise<CustomerPartner[]> {
    return Array.from(this.customerPartners.values())
      .filter(partner => partner.customerId === customerId);
  }
  
  async addCustomerPartner(data: InsertCustomerPartner): Promise<CustomerPartner> {
    const id = this.currentCustomerPartnerId++;
    const partner: CustomerPartner = { ...data, id };
    this.customerPartners.set(id, partner);
    return partner;
  }
  
  // Vendor operations
  async getAllVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }
  
  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }
  
  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const id = this.currentVendorId++;
    const newVendor: Vendor = { 
      ...vendor, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.vendors.set(id, newVendor);
    return newVendor;
  }
  
  // Product operations
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct: Product = { 
      ...product, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async getVendorProducts(vendorId: number): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.vendorId === vendorId);
  }
  
  // Initialize sample data
  private async initializeSampleData() {
    // Create sample user
    await this.createUser({
      username: 'johnsmith',
      password: 'password123',
      fullName: 'John Smith',
      avatarInitials: 'JS'
    });
    
    // Create sample news articles
    const articleCategories = ['Regulation', 'Industry', 'Commercial', 'Technology'];
    const articleTitles = [
      'New Insurance Regulations Coming Into Effect',
      'Major Belgian Insurers Announce Merger',
      'Commercial Insurance Premiums Show 15% Rise',
      'Digital Transformation In The Belgian Insurance Sector'
    ];
    const articleSummaries = [
      'The Belgian Financial Services and Markets Authority (FSMA) has announced new regulations affecting brokers, set to take effect in Q3 2025.',
      'Two of Belgium\'s largest insurance providers have announced plans to merge, creating a new market leader with implications for brokers.',
      'A new market study indicates commercial insurance premiums have increased by 15% in the first quarter, particularly affecting SME businesses.',
      'A new report highlights the acceleration of digital transformation among Belgian insurers, with implications for broker distribution channels.'
    ];
    const articleImages = [
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    ];
    
    for (let i = 0; i < 4; i++) {
      await this.createNewsArticle({
        title: articleTitles[i],
        content: `This is the full content of the article about ${articleTitles[i].toLowerCase()}.`,
        summary: articleSummaries[i],
        category: articleCategories[i],
        imageUrl: articleImages[i],
        publishedDate: new Date(2025, 4, 4 - i)
      });
    }
    
    // Create sample clients
    const clientNames = ['Van Damme BVBA', 'Laura Martens', 'Green Tech SA'];
    const clientTypes = ['Commercial Client', 'Individual Client', 'Commercial Client'];
    const clientInitials = ['VD', 'LM', 'GT'];
    
    for (let i = 0; i < 3; i++) {
      await this.createClient({
        name: clientNames[i],
        type: clientTypes[i],
        initials: clientInitials[i]
      });
    }
    
    // Create sample insurance products
    const productNames = ['Property', 'Liability', 'Cyber Insurance', 'Auto', 'Home', 'Life Insurance', 'Business Interruption'];
    const productCategories = ['Commercial', 'Commercial', 'Commercial', 'Personal', 'Personal', 'Personal', 'Commercial'];
    
    for (let i = 0; i < productNames.length; i++) {
      await this.createInsuranceProduct({
        name: productNames[i],
        category: productCategories[i]
      });
    }
    
    // Create sample client products
    await this.addClientProduct({ clientId: 1, productId: 1 }); // Van Damme has Property
    await this.addClientProduct({ clientId: 1, productId: 2 }); // Van Damme has Liability
    await this.addClientProduct({ clientId: 2, productId: 4 }); // Laura has Auto
    await this.addClientProduct({ clientId: 2, productId: 5 }); // Laura has Home
    await this.addClientProduct({ clientId: 3, productId: 1 }); // Green Tech has Property
    
    // Create sample opportunities
    await this.createOpportunity({ clientId: 1, productId: 3, probability: 85, estimatedValue: 2450 }); // Van Damme - Cyber Insurance
    await this.createOpportunity({ clientId: 2, productId: 6, probability: 65, estimatedValue: 890 });  // Laura - Life Insurance
    await this.createOpportunity({ clientId: 3, productId: 7, probability: 90, estimatedValue: 3200 }); // Green Tech - Business Interruption
    
    // Create sample customers
    const customerNames = [
      'Acme Corporation', 
      'Globex Industries', 
      'Stark Enterprises', 
      'Wayne Industries', 
      'Umbrella Corporation'
    ];
    
    const customerDescriptions = [
      'Leading manufacturer of cartoon props and gadgets',
      'Global leader in innovative technologies',
      'Cutting-edge tech and defense systems',
      'Multinational conglomerate with diverse portfolio',
      'Pharmaceutical company focused on medical innovations'
    ];
    
    for (let i = 0; i < customerNames.length; i++) {
      // Create customer with user 1 as owner
      const customer = await this.createCustomer({
        name: customerNames[i],
        description: customerDescriptions[i],
        ownerId: 1
      });
      
      // Add the owner as a team member
      await this.addCustomerTeamMember({
        customerId: customer.id,
        userId: 1
      });
      
      // Add partners (clients) to some customers
      if (i % 2 === 0) {
        await this.addCustomerPartner({
          customerId: customer.id,
          partnerId: (i % 3) + 1 // Link to one of our clients
        });
      }
    }
  }
}

export class DatabaseStorage implements IStorage {
  // Get the database connection for the current request
  private getDb() {
    // Get environment from the current request if available
    const req = this.getCurrentRequest();
    if (req && (req as any).environmentId) {
      return getEnvironmentDb((req as any).environmentId);
    }
    // Fallback to default database
    return db;
  }
  
  // Get the current request object (if available)
  private getCurrentRequest() {
    // Use the global requestStorage
    if (global.requestStorage) {
      return global.requestStorage.getStore();
    }
    return null;
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.getDb().select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.getDb().select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.getDb().insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // News operations
  async getAllNewsArticles(): Promise<NewsArticle[]> {
    return this.getDb().select().from(newsArticles).orderBy(newsArticles.publishedDate);
  }
  
  async getNewsArticle(id: number): Promise<NewsArticle | undefined> {
    const result = await this.getDb().select().from(newsArticles).where(eq(newsArticles.id, id));
    return result[0];
  }
  
  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const result = await this.getDb().insert(newsArticles).values(article).returning();
    return result[0];
  }
  
  // Client operations
  async getAllClients(): Promise<Client[]> {
    return this.getDb().select().from(clients);
  }
  
  async getClient(id: number): Promise<Client | undefined> {
    const result = await this.getDb().select().from(clients).where(eq(clients.id, id));
    return result[0];
  }
  
  async createClient(client: InsertClient): Promise<Client> {
    const result = await this.getDb().insert(clients).values(client).returning();
    return result[0];
  }
  
  // Insurance product operations
  async getAllInsuranceProducts(): Promise<InsuranceProduct[]> {
    return this.getDb().select().from(insuranceProducts);
  }
  
  async getInsuranceProduct(id: number): Promise<InsuranceProduct | undefined> {
    const result = await this.getDb().select().from(insuranceProducts).where(eq(insuranceProducts.id, id));
    return result[0];
  }
  
  async createInsuranceProduct(product: InsertInsuranceProduct): Promise<InsuranceProduct> {
    const result = await this.getDb().insert(insuranceProducts).values(product).returning();
    return result[0];
  }
  
  // Client product operations
  async getClientProducts(clientId: number): Promise<InsuranceProduct[]> {
    const clientProductsResult = await this.getDb()
      .select()
      .from(clientProducts)
      .where(eq(clientProducts.clientId, clientId));
    
    const products: InsuranceProduct[] = [];
    for (const cp of clientProductsResult) {
      const product = await this.getInsuranceProduct(cp.productId);
      if (product) {
        products.push(product);
      }
    }
    
    return products;
  }
  
  async addClientProduct(data: InsertClientProduct): Promise<ClientProduct> {
    const result = await this.getDb().insert(clientProducts).values(data).returning();
    return result[0];
  }
  
  // Opportunity operations
  async getAllOpportunities(): Promise<ClientWithDetails[]> {
    const allOpportunities = await this.getDb().select().from(opportunities);
    const clientOpportunities: ClientWithDetails[] = [];
    
    for (const opportunity of allOpportunities) {
      const client = await this.getClient(opportunity.clientId);
      const product = await this.getInsuranceProduct(opportunity.productId);
      
      if (client && product) {
        const currentProducts = await this.getClientProducts(client.id);
        
        clientOpportunities.push({
          ...client,
          currentProducts,
          opportunity: product,
          probability: opportunity.probability,
          estimatedValue: opportunity.estimatedValue
        });
      }
    }
    
    return clientOpportunities;
  }
  
  async getOpportunitiesForClient(clientId: number): Promise<Opportunity[]> {
    return this.getDb()
      .select()
      .from(opportunities)
      .where(eq(opportunities.clientId, clientId));
  }
  
  async createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity> {
    const result = await this.getDb().insert(opportunities).values(opportunity).returning();
    return result[0];
  }
  
  // Document operations
  async getAllDocuments(userId: number): Promise<Document[]> {
    return this.getDb()
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(documents.uploadDate);
  }
  
  async getDocument(id: number): Promise<Document | undefined> {
    const result = await this.getDb().select().from(documents).where(eq(documents.id, id));
    return result[0];
  }
  
  async createDocument(document: InsertDocument): Promise<Document> {
    const result = await this.getDb().insert(documents).values(document).returning();
    return result[0];
  }
  
  // File comparison operations
  async getFileComparisons(userId: number): Promise<FileComparison[]> {
    return this.getDb()
      .select()
      .from(fileComparisons)
      .where(eq(fileComparisons.userId, userId))
      .orderBy(fileComparisons.comparisonDate);
  }
  
  async getFileComparison(id: number): Promise<FileComparison | undefined> {
    const result = await this.getDb().select().from(fileComparisons).where(eq(fileComparisons.id, id));
    return result[0];
  }
  
  async createFileComparison(comparison: InsertFileComparison): Promise<FileComparison> {
    const result = await this.getDb().insert(fileComparisons).values(comparison).returning();
    return result[0];
  }
  
  // Customer operations
  async getAllCustomers(): Promise<Customer[]> {
    return this.getDb().select().from(customers);
  }
  
  async getCustomer(id: number): Promise<Customer | undefined> {
    const result = await this.getDb().select().from(customers).where(eq(customers.id, id));
    return result[0];
  }
  
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const result = await this.getDb().insert(customers).values({
      ...customer,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return result[0];
  }
  
  // Customer team members operations
  async getCustomerTeamMembers(customerId: number): Promise<CustomerTeamMember[]> {
    return this.getDb()
      .select()
      .from(customerTeamMembers)
      .where(eq(customerTeamMembers.customerId, customerId));
  }
  
  async addCustomerTeamMember(data: InsertCustomerTeamMember): Promise<CustomerTeamMember> {
    const result = await this.getDb().insert(customerTeamMembers).values(data).returning();
    return result[0];
  }
  
  // Customer partners operations
  async getCustomerPartners(customerId: number): Promise<CustomerPartner[]> {
    return this.getDb()
      .select()
      .from(customerPartners)
      .where(eq(customerPartners.customerId, customerId));
  }
  
  async addCustomerPartner(data: InsertCustomerPartner): Promise<CustomerPartner> {
    const result = await this.getDb().insert(customerPartners).values(data).returning();
    return result[0];
  }
}

// Use the database storage implementation
export const storage = new MemStorage();
