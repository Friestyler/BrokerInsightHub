import { 
  users, type User, type InsertUser,
  newsArticles, type NewsArticle, type InsertNewsArticle,
  clients, type Client, type InsertClient,
  insuranceProducts, type InsuranceProduct, type InsertInsuranceProduct,
  clientProducts, type ClientProduct, type InsertClientProduct,
  opportunities, type Opportunity, type InsertOpportunity
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private newsArticles: Map<number, NewsArticle>;
  private clients: Map<number, Client>;
  private insuranceProducts: Map<number, InsuranceProduct>;
  private clientProducts: Map<number, ClientProduct>;
  private opportunities: Map<number, Opportunity>;
  
  currentUserId: number;
  currentNewsArticleId: number;
  currentClientId: number;
  currentInsuranceProductId: number;
  currentClientProductId: number;
  currentOpportunityId: number;

  constructor() {
    this.users = new Map();
    this.newsArticles = new Map();
    this.clients = new Map();
    this.insuranceProducts = new Map();
    this.clientProducts = new Map();
    this.opportunities = new Map();
    
    this.currentUserId = 1;
    this.currentNewsArticleId = 1;
    this.currentClientId = 1;
    this.currentInsuranceProductId = 1;
    this.currentClientProductId = 1;
    this.currentOpportunityId = 1;
    
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
        publishedDate: new Date(2025, 4, 4 - i).toISOString()
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
  }
}

export const storage = new MemStorage();
