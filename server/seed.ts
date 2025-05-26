import { storage } from './storage';

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // Create sample user
    const user = await storage.createUser({
      username: 'johnsmith',
      password: 'password123',
      fullName: 'John Smith',
      avatarInitials: 'JS'
    });
    console.log(`Created user: ${user.fullName}`);
    
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
      const article = await storage.createNewsArticle({
        title: articleTitles[i],
        content: `This is the full content of the article about ${articleTitles[i].toLowerCase()}.`,
        summary: articleSummaries[i],
        category: articleCategories[i],
        imageUrl: articleImages[i],
        publishedDate: new Date(2025, 4, 4 - i)
      });
      console.log(`Created news article: ${article.title}`);
    }
    
    // Create sample clients
    const clientNames = ['Van Damme BVBA', 'Laura Martens', 'Green Tech SA'];
    const clientTypes = ['Commercial Client', 'Individual Client', 'Commercial Client'];
    const clientInitials = ['VD', 'LM', 'GT'];
    
    const createdClients = [];
    for (let i = 0; i < 3; i++) {
      const client = await storage.createClient({
        name: clientNames[i],
        type: clientTypes[i],
        initials: clientInitials[i]
      });
      createdClients.push(client);
      console.log(`Created client: ${client.name}`);
    }
    
    // Create sample insurance products
    const productNames = ['Property', 'Liability', 'Cyber Insurance', 'Auto', 'Home', 'Life Insurance', 'Business Interruption'];
    const productCategories = ['Commercial', 'Commercial', 'Commercial', 'Personal', 'Personal', 'Personal', 'Commercial'];
    
    const createdProducts = [];
    for (let i = 0; i < productNames.length; i++) {
      const product = await storage.createInsuranceProduct({
        name: productNames[i],
        category: productCategories[i]
      });
      createdProducts.push(product);
      console.log(`Created insurance product: ${product.name}`);
    }
    
    // Create sample client products
    await storage.addClientProduct({ clientId: createdClients[0].id, productId: createdProducts[0].id }); // Van Damme has Property
    await storage.addClientProduct({ clientId: createdClients[0].id, productId: createdProducts[1].id }); // Van Damme has Liability
    await storage.addClientProduct({ clientId: createdClients[1].id, productId: createdProducts[3].id }); // Laura has Auto
    await storage.addClientProduct({ clientId: createdClients[1].id, productId: createdProducts[4].id }); // Laura has Home
    await storage.addClientProduct({ clientId: createdClients[2].id, productId: createdProducts[0].id }); // Green Tech has Property
    console.log('Created client products associations');
    
    // Create sample opportunities with rich data
    const opportunities = [
      {
        title: "Cyber Insurance for Van Damme BVBA",
        clientId: createdClients[0].id,
        productId: createdProducts[2].id,
        status: "open",
        stage: "proposal",
        type: "cross_sell",
        probability: 85,
        estimatedValue: 2450,
        ownerId: user.id,
        description: "Cyber insurance opportunity for manufacturing company",
        notes: "Client expressed interest after recent cyber attack news",
        expectedCloseDate: new Date(2025, 6, 15)
      },
      {
        title: "Life Insurance for Laura Martens",
        clientId: createdClients[1].id,
        productId: createdProducts[5].id,
        status: "open",
        stage: "discovery",
        type: "new_business",
        probability: 65,
        estimatedValue: 890,
        ownerId: user.id,
        description: "Individual life insurance policy",
        notes: "Client recently married, looking for coverage",
        expectedCloseDate: new Date(2025, 5, 30)
      },
      {
        title: "Business Interruption for Green Tech SA",
        clientId: createdClients[2].id,
        productId: createdProducts[6].id,
        status: "open",
        stage: "negotiation",
        type: "upsell",
        probability: 90,
        estimatedValue: 3200,
        ownerId: user.id,
        description: "Business interruption insurance for tech company",
        notes: "Client needs coverage for potential supply chain disruptions",
        expectedCloseDate: new Date(2025, 5, 20)
      },
      {
        title: "Property Insurance Extension for Van Damme BVBA",
        clientId: createdClients[0].id,
        productId: createdProducts[0].id,
        status: "on_hold",
        stage: "proposal",
        type: "renewal",
        probability: 70,
        estimatedValue: 1800,
        ownerId: user.id,
        description: "Extension of existing property coverage",
        notes: "Waiting for building valuation report",
        expectedCloseDate: new Date(2025, 7, 1)
      },
      {
        title: "Auto Insurance for Laura Martens",
        clientId: createdClients[1].id,
        productId: createdProducts[3].id,
        status: "closed",
        stage: "closed",
        type: "new_business",
        probability: 100,
        estimatedValue: 650,
        ownerId: user.id,
        description: "New vehicle insurance policy",
        notes: "Successfully closed - client purchased new car",
        expectedCloseDate: new Date(2025, 4, 10)
      }
    ];

    for (const opportunityData of opportunities) {
      await storage.createOpportunity(opportunityData);
      console.log(`Created opportunity: ${opportunityData.title}`);
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();