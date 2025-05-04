import { 
  users, type User, type InsertUser,
  newsItems, type NewsItem, type InsertNewsItem,
  clients, type Client, type InsertClient,
  opportunities, type Opportunity, type InsertOpportunity
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // News operations
  getAllNews(): Promise<NewsItem[]>;
  getNewsByCategory(category: string): Promise<NewsItem[]>;
  addNewsItem(newsItem: InsertNewsItem): Promise<NewsItem>;

  // Client operations
  getAllClients(): Promise<Client[]>;
  getClientById(id: number): Promise<Client | undefined>;
  addClient(client: InsertClient): Promise<Client>;

  // Opportunity operations
  getOpportunitiesByClientId(clientId: number): Promise<Opportunity[]>;
  getAllOpportunities(): Promise<Opportunity[]>;
  addOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private newsItems: Map<number, NewsItem>;
  private clients: Map<number, Client>;
  private opportunities: Map<number, Opportunity>;
  
  private userCurrentId: number;
  private newsCurrentId: number;
  private clientCurrentId: number;
  private opportunityCurrentId: number;

  constructor() {
    this.users = new Map();
    this.newsItems = new Map();
    this.clients = new Map();
    this.opportunities = new Map();
    
    this.userCurrentId = 1;
    this.newsCurrentId = 1;
    this.clientCurrentId = 1;
    this.opportunityCurrentId = 1;

    // Initialize with some data
    this.initializeData();
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
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // News operations
  async getAllNews(): Promise<NewsItem[]> {
    return Array.from(this.newsItems.values())
      .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
  }

  async getNewsByCategory(category: string): Promise<NewsItem[]> {
    return Array.from(this.newsItems.values())
      .filter(news => news.category === category)
      .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
  }

  async addNewsItem(insertNewsItem: InsertNewsItem): Promise<NewsItem> {
    const id = this.newsCurrentId++;
    const newsItem: NewsItem = { ...insertNewsItem, id };
    this.newsItems.set(id, newsItem);
    return newsItem;
  }

  // Client operations
  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClientById(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async addClient(insertClient: InsertClient): Promise<Client> {
    const id = this.clientCurrentId++;
    const client: Client = { ...insertClient, id };
    this.clients.set(id, client);
    return client;
  }

  // Opportunity operations
  async getOpportunitiesByClientId(clientId: number): Promise<Opportunity[]> {
    return Array.from(this.opportunities.values())
      .filter(opp => opp.clientId === clientId);
  }

  async getAllOpportunities(): Promise<Opportunity[]> {
    return Array.from(this.opportunities.values());
  }

  async addOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    const id = this.opportunityCurrentId++;
    const opportunity: Opportunity = { ...insertOpportunity, id };
    this.opportunities.set(id, opportunity);
    return opportunity;
  }

  // Initialize example data for the application
  private initializeData() {
    // Add news items
    const newsItems: InsertNewsItem[] = [
      {
        title: "New Digital Insurance Law Approved by Belgian Parliament",
        content: "The Belgian Parliament has approved new legislation that modernizes digital insurance processes, enabling brokers to provide more seamless digital services to clients.",
        summary: "The Belgian Parliament has approved new legislation that modernizes digital insurance processes, enabling brokers to...",
        source: "L'Echo",
        imageUrl: "https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        publishedDate: new Date("2025-05-03"),
        category: "All News"
      },
      {
        title: "Climate Change Impact on Property Insurance Rates in Belgium",
        content: "Rising flood risks and extreme weather events are causing significant shifts in property insurance premiums across Belgium, with some regions seeing increases of up to 15%.",
        summary: "Rising flood risks and extreme weather events are causing significant shifts in property insurance premiums across Belgium...",
        source: "De Tijd",
        imageUrl: "https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        publishedDate: new Date("2025-05-02"),
        category: "All News"
      },
      {
        title: "AI Adoption in Belgian Insurance Sector Grows by 40%",
        content: "A new industry report reveals that AI implementation in the Belgian insurance sector has increased by 40% in the last year, with claims processing and risk assessment seeing the most automation.",
        summary: "A new industry report reveals that AI implementation in the Belgian insurance sector has increased by 40% in the last year...",
        source: "InsurTech Belgium",
        imageUrl: "https://images.unsplash.com/photo-1502945015378-0e284ca1a5be?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        publishedDate: new Date("2025-04-29"),
        category: "All News"
      }
    ];

    for (const item of newsItems) {
      this.addNewsItem(item);
    }

    // Add clients
    const clients: InsertClient[] = [
      {
        fullName: "Marc Vandenberg",
        type: "Business Owner",
        products: ["Home", "Auto"]
      },
      {
        fullName: "Sophie Dupont",
        type: "Family",
        products: ["Home"]
      },
      {
        fullName: "Jan Decker",
        type: "Retired",
        products: ["Health", "Life"]
      }
    ];

    let clientIds: number[] = [];
    for (const client of clients) {
      this.addClient(client).then(c => clientIds.push(c.id));
    }

    // Add opportunities (this will be executed after the clients are added due to async)
    setTimeout(() => {
      const opportunities: InsertOpportunity[] = [
        {
          clientId: 1,
          opportunityType: "Business Liability",
          probability: 85,
          potentialValue: "€1,200/year"
        },
        {
          clientId: 2,
          opportunityType: "Life Insurance",
          probability: 76,
          potentialValue: "€950/year"
        },
        {
          clientId: 3,
          opportunityType: "Travel Insurance",
          probability: 62,
          potentialValue: "€320/year"
        }
      ];

      for (const opportunity of opportunities) {
        this.addOpportunity(opportunity);
      }
    }, 100);
  }
}

export const storage = new MemStorage();
