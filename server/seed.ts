import { storage } from './storage';
import { initializeSchemas } from './initDatabase';
import { seedEntitySystem } from './seedEntitySystem';

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // Initialize database schemas
    await initializeSchemas();
    
    // Seed entity definitions, attributes, and relationships
    await seedEntitySystem();
    
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
    
    // Create sample customers
    const customerNames = ['Van Damme BVBA', 'Maertens Finance', 'Green Tech SA'];
    const customerDescriptions = [
      'Leading construction company in Flanders', 
      'Financial services firm based in Brussels', 
      'Renewable energy solutions provider'
    ];
    
    const createdCustomers = [];
    for (let i = 0; i < 3; i++) {
      const customer = await storage.createCustomer({
        name: customerNames[i],
        description: customerDescriptions[i],
        ownerId: user.id,
        createdById: user.id,
        lastModifiedById: user.id
      });
      createdCustomers.push(customer);
      console.log(`Created customer: ${customer.name}`);
      
      // Add the user as a team member for each customer
      await storage.addCustomerTeamMember({
        customerId: customer.id,
        userId: user.id
      });
    }
    
    // Create sample partners
    const partnerNames = ['Allianz Belgium', 'AXA Insurance', 'AG Insurance'];
    const partnerDescriptions = [
      'Leading insurance provider in Belgium', 
      'Global insurance company with strong Belgian presence', 
      'Belgian insurance company specializing in life and non-life products'
    ];
    
    const createdPartners = [];
    for (let i = 0; i < 3; i++) {
      const partner = await storage.createPartner({
        name: partnerNames[i],
        description: partnerDescriptions[i],
        ownerId: user.id,
        createdById: user.id,
        lastModifiedById: user.id
      });
      createdPartners.push(partner);
      console.log(`Created partner: ${partner.name}`);
      
      // Add the user as a team member for each partner
      await storage.addPartnerTeamMember({
        partnerId: partner.id,
        userId: user.id
      });
    }
    
    // Create customer-partner relationships
    await storage.addCustomerPartner({ 
      customerId: createdCustomers[0].id, 
      partnerId: createdPartners[0].id 
    });
    await storage.addCustomerPartner({ 
      customerId: createdCustomers[0].id, 
      partnerId: createdPartners[1].id 
    });
    await storage.addCustomerPartner({ 
      customerId: createdCustomers[1].id, 
      partnerId: createdPartners[2].id 
    });
    console.log('Created customer-partner relationships');
    
    // Create sample opportunities
    const opportunityNames = [
      'Van Damme Cyber Security Policy', 
      'Maertens Professional Liability', 
      'Green Tech Property Insurance'
    ];
    const opportunityDescriptions = [
      'Cyber security insurance for construction company',
      'Professional liability coverage for financial services',
      'Comprehensive property insurance for office buildings'
    ];
    const stages = ['Closed-Won', 'Proposal', 'Discovery'];
    const amounts = ['12500.00', '8750.00', '22000.00'];
    const probabilities = [100, 75, 50];
    
    const createdOpportunities = [];
    for (let i = 0; i < 3; i++) {
      const opportunity = await storage.createOpportunity({
        name: opportunityNames[i],
        description: opportunityDescriptions[i],
        ownerId: user.id,
        amount: amounts[i],
        stage: stages[i],
        probability: probabilities[i],
        createdById: user.id,
        lastModifiedById: user.id
      });
      createdOpportunities.push(opportunity);
      console.log(`Created opportunity: ${opportunity.name}`);
      
      // Add the user as a team member for each opportunity
      await storage.addOpportunityTeamMember({
        opportunityId: opportunity.id,
        userId: user.id
      });
      
      // Connect opportunity to a customer
      await storage.addOpportunityCustomer({
        opportunityId: opportunity.id,
        customerId: createdCustomers[i].id
      });
      
      // Connect opportunity to a partner
      await storage.addOpportunityPartner({
        opportunityId: opportunity.id,
        partnerId: createdPartners[i].id
      });
    }
    
    // Create sample contacts
    const contactNames = ['John Doe', 'Jane Smith', 'Bob Johnson'];
    const contactEmails = ['john.doe@vandamme.be', 'jane.smith@maertens.be', 'bob.j@greentech.be'];
    const contactPhones = ['+32 470 123 456', '+32 471 987 654', '+32 472 456 789'];
    
    for (let i = 0; i < 3; i++) {
      const contact = await storage.createContact({
        name: contactNames[i],
        description: `Contact at ${customerNames[i]}`,
        email: contactEmails[i],
        phone: contactPhones[i],
        ownerId: user.id,
        createdById: user.id,
        lastModifiedById: user.id
      });
      console.log(`Created contact: ${contact.name}`);
      
      // Connect contact to a customer
      await storage.addContactCustomer({
        contactId: contact.id,
        customerId: createdCustomers[i].id
      });
    }
    
    console.log('Created sample entities with relationships');
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();