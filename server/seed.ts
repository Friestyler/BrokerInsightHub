import { storage } from './storage';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';

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
    
    // Create sample partner using the existing customer table structure
    const samplePartner = await storage.createCustomer({
      name: 'Jeroen Hypotheek Advies',
      description: 'Leading mortgage and insurance advisory firm specializing in comprehensive financial solutions'
    });
    console.log(`Created sample partner: ${samplePartner.name}`);

    // Create sample customer 
    const sampleCustomer = await storage.createCustomer({
      name: 'Van Damme BVBA',
      description: 'Manufacturing company specializing in precision metal components'
    });
    console.log(`Created sample customer: ${sampleCustomer.name}`);

    // Create additional clients for variety
    const clientNames = ['Laura Martens', 'Green Tech SA'];
    const clientTypes = ['Individual Client', 'Commercial Client'];
    const clientInitials = ['LM', 'GT'];
    
    const createdClients = [];
    for (let i = 0; i < clientNames.length; i++) {
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
    
    // Create sample opportunity that connects partner (ID 1) and customer (ID 2)
    const sampleOpportunity = await storage.createOpportunity({
      title: "Cyber Insurance for Van Damme BVBA",
      clientId: sampleCustomer.id,
      partnerId: samplePartner.id,
      productId: createdProducts[2].id,
      status: "open",
      stage: "proposal",
      type: "cross_sell",
      probability: 85,
      estimatedValue: 12500,
      ownerId: user.id,
      description: "Cyber insurance opportunity for manufacturing company brought by partner Jeroen Hypotheek Advies",
      notes: "Partner identified opportunity during client review. Client expressed interest after recent cyber attack news in manufacturing sector.",
      expectedCloseDate: new Date(2025, 6, 15)
    });
    console.log(`Created sample opportunity connecting partner "${samplePartner.name}" (ID: ${samplePartner.id}) and customer "${sampleCustomer.name}" (ID: ${sampleCustomer.id})`);

    // Create client product associations for the sample customer
    await storage.addClientProduct({ 
      clientId: sampleCustomer.id, 
      productId: createdProducts[0].id 
    }); // Van Damme has Property Insurance
    await storage.addClientProduct({ 
      clientId: sampleCustomer.id, 
      productId: createdProducts[1].id 
    }); // Van Damme has Liability Insurance

    // Create additional opportunities for variety
    const additionalOpportunities = [
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

    for (const opportunityData of additionalOpportunities) {
      await storage.createOpportunity(opportunityData);
      console.log(`Created opportunity: ${opportunityData.title}`);
    }

    // Create sample activity data using direct database access
    const db = drizzle(neon(process.env.DATABASE_URL!));
    
    // Create sample activity tasks using SQL
    console.log('Creating sample activity tasks...');
    await db.execute(sql`
      INSERT INTO activity_tasks (title, description, priority, entity_type, entity_id, assigned_to_id, assigned_by_id)
      VALUES 
        ('Review partnership agreement', 'Review and update the partnership agreement with Jeroen Hypotheek Advies', 'high', 'partner', ${samplePartner.id}, ${user.id}, ${user.id}),
        ('Follow up on cyber insurance proposal', 'Contact Van Damme BVBA regarding the cyber insurance proposal', 'medium', 'customer', ${sampleCustomer.id}, ${user.id}, ${user.id}),
        ('Prepare quarterly business review', 'Prepare materials for Q2 business review meeting', 'medium', 'partner', ${samplePartner.id}, ${user.id}, ${user.id})
    `);
    console.log('Created 3 activity tasks');

    // Create sample activity comments using SQL
    console.log('Creating sample activity comments...');
    await db.execute(sql`
      INSERT INTO activity_comments (content, author_id, entity_type, entity_id)
      VALUES 
        ('Initial meeting went very well. Client is interested in expanding coverage.', ${user.id}, 'customer', ${sampleCustomer.id}),
        ('Partner has been consistently delivering quality leads. Consider expanding relationship.', ${user.id}, 'partner', ${samplePartner.id}),
        ('Client requested additional information about cyber coverage limits.', ${user.id}, 'opportunity', ${sampleOpportunity.id}),
        ('Scheduled follow-up call for next week to discuss proposal details.', ${user.id}, 'partner', ${samplePartner.id})
    `);
    console.log('Created 4 activity comments');

    // Create sample activity reactions using SQL
    console.log('Creating sample activity reactions...');
    await db.execute(sql`
      INSERT INTO activity_reactions (activity_type, activity_id, user_id, emoji)
      VALUES 
        ('comment', 1, ${user.id}, '👍'),
        ('comment', 2, ${user.id}, '⭐'),
        ('comment', 3, ${user.id}, '✅')
    `);
    console.log('Created 3 activity reactions');
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();