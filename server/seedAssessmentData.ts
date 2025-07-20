import { db } from "./db";
import { opportunityWithholdReasons } from "@shared/schema";
import { eq } from "drizzle-orm";

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
  } catch (error) {
    console.error("Error seeding assessment data:", error);
    throw error;
  }
}