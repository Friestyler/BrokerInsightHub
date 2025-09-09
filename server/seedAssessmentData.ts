import { db } from "./db";
import { opportunityWithholdReasons, users } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export async function seedAssessmentData() {
  console.log("Seeding opportunity assessment data...");
  
  const withholdReasonsData = [
    {
      category: "not_in_target_market",
      displayName: "Not in target market",
      description: "Opportunity falls outside our target market segment",
      sortOrder: 1
    },
    {
      category: "budget_doesnt_align", 
      displayName: "Budget doesn't align",
      description: "Client budget does not match our pricing requirements",
      sortOrder: 2
    },
    {
      category: "poor_timing",
      displayName: "Poor timing",
      description: "Timing is not suitable for this opportunity",
      sortOrder: 3
    },
    {
      category: "strong_competition",
      displayName: "Strong competition", 
      description: "High competitive pressure affecting win probability",
      sortOrder: 4
    },
    {
      category: "resource_constraints",
      displayName: "Resource constraints",
      description: "Insufficient internal resources to pursue effectively",
      sortOrder: 5
    },
    {
      category: "existing_client_relationship_conflicts",
      displayName: "Existing client relationship conflicts",
      description: "Conflicts with existing client relationships",
      sortOrder: 6
    },
    {
      category: "product_service_doesnt_fit",
      displayName: "Product/service doesn't fit",
      description: "Our products/services don't align with client needs",
      sortOrder: 7
    },
    {
      category: "other",
      displayName: "Other",
      description: "Other reasons not covered above",
      sortOrder: 8
    }
  ];

  try {
    // Insert withhold reasons if they don't exist
    for (const reason of withholdReasonsData) {
      const existing = await db
        .select()
        .from(opportunityWithholdReasons)
        .where(eq(opportunityWithholdReasons.category, reason.category))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(opportunityWithholdReasons).values(reason);
        console.log(`Added withhold reason: ${reason.displayName}`);
      }
    }

    console.log("Assessment data seeding completed successfully");
    
    // Seed activity data if it doesn't exist
    await seedActivityData();
  } catch (error) {
    console.error("Error seeding assessment data:", error);
    throw error;
  }
}

async function seedActivityData() {
  try {
    console.log("Checking and seeding activity hub data...");
    
    // Check if activity data already exists
    const existingTasks = await db.execute(sql`SELECT COUNT(*) as count FROM activity_tasks`);
    const taskCount = parseInt((existingTasks.rows[0] as any)?.count || '0');
    
    if (taskCount > 0) {
      console.log(`Activity data already exists (${taskCount} tasks found), skipping activity seeding`);
      return;
    }
    
    // Get the first user for seeding
    const firstUser = await db.select().from(users).limit(1);
    if (firstUser.length === 0) {
      console.log("No users found, skipping activity seeding");
      return;
    }
    
    const userId = firstUser[0].id;
    console.log(`Seeding activity data with user ID: ${userId}`);
    
    // Create sample activity tasks
    await db.execute(sql`
      INSERT INTO activity_tasks (title, description, priority, entity_type, entity_id, assigned_to_id, assigned_by_id)
      VALUES 
        ('Review partnership agreements', 'Review and update partnership agreements with key partners', 'high', 'partner', 1, ${userId}, ${userId}),
        ('Follow up on insurance proposals', 'Contact clients regarding pending insurance proposals', 'medium', 'customer', 1, ${userId}, ${userId}),
        ('Prepare quarterly business review', 'Prepare materials for Q2 business review meeting', 'medium', 'partner', 1, ${userId}, ${userId}),
        ('Update client portfolio analysis', 'Review and update portfolio analysis for key clients', 'low', 'customer', 2, ${userId}, ${userId})
    `);
    
    // Create sample activity comments
    await db.execute(sql`
      INSERT INTO activity_comments (content, author_id, entity_type, entity_id)
      VALUES 
        ('Initial meeting went very well. Client is interested in expanding coverage.', ${userId}, 'customer', 1),
        ('Partner has been consistently delivering quality leads. Consider expanding relationship.', ${userId}, 'partner', 1),
        ('Client requested additional information about cyber coverage limits.', ${userId}, 'opportunity', 1),
        ('Scheduled follow-up call for next week to discuss proposal details.', ${userId}, 'customer', 2),
        ('Great progress on this partnership. Looking forward to Q2 results.', ${userId}, 'partner', 1)
    `);
    
    // Create sample activity reactions
    await db.execute(sql`
      INSERT INTO activity_reactions (activity_type, activity_id, user_id, emoji)
      VALUES 
        ('comment', 1, ${userId}, '👍'),
        ('comment', 2, ${userId}, '⭐'),
        ('comment', 3, ${userId}, '✅'),
        ('task', 1, ${userId}, '🔥'),
        ('task', 2, ${userId}, '👍')
    `);
    
    console.log("Activity hub data seeded successfully!");
    
  } catch (error) {
    console.error("Error seeding activity data:", error);
    // Don't throw here, just log the error so the main app can still start
  }
}