import { db } from './db';
import { okrMetrics } from '@shared/schema';

// Mock data from the frontend
const mockOKRTemplates = [
  {
    id: 1,
    title: "Increase Annual Revenue",
    type: "currency",
    target: 1000000,
    tag: "Revenue Growth",
    timeframe: "this-year",
    milestoneFrequency: "Monthly",
    isExpanded: false,
    nestedCount: 2,
    trafficLights: true,
    trafficLightStyle: 'system',
    progressBar: true,
    activities: [
      {
        id: 101,
        title: "Q1 Sales Campaign",
        type: "currency",
        target: 250000,
        tag: "Revenue Growth",
        timeframe: "Q1-2024",
        milestoneFrequency: "Monthly",
        trafficLights: true,
        trafficLightStyle: 'system',
        progressBar: true,
        parentId: 1
      },
      {
        id: 102,
        title: "Enterprise Client Outreach",
        type: "number",
        target: 15,
        tag: "Revenue Growth",
        timeframe: "this-quarter",
        milestoneFrequency: "Weekly",
        trafficLights: true,
        trafficLightStyle: 'manual',
        progressBar: true,
        parentId: 1
      }
    ]
  },
  {
    id: 2,
    title: "Improve Customer Satisfaction Score",
    type: "percent",
    target: 85,
    tag: "Customer Experience",
    timeframe: "this-quarter",
    milestoneFrequency: "Monthly",
    isExpanded: false,
    nestedCount: 0,
    trafficLights: true,
    trafficLightStyle: 'custom',
    progressBar: true
  },
  {
    id: 3,
    title: "Launch New Product Feature",
    type: "checkbox",
    target: null,
    tag: "Product Innovation",
    timeframe: "next-quarter",
    milestoneFrequency: "Weekly",
    isExpanded: false,
    nestedCount: 3,
    trafficLights: true,
    trafficLightStyle: 'manual',
    progressBar: false,
    activities: [
      {
        id: 301,
        title: "User Research & Requirements",
        type: "checkbox",
        target: null,
        tag: "Product Innovation",
        timeframe: "this-month",
        milestoneFrequency: "Weekly",
        trafficLights: true,
        trafficLightStyle: 'manual',
        progressBar: false,
        parentId: 3
      },
      {
        id: 302,
        title: "Development Sprint Planning",
        type: "number",
        target: 5,
        tag: "Product Innovation",
        timeframe: "next-month",
        milestoneFrequency: "Weekly",
        trafficLights: true,
        trafficLightStyle: 'system',
        progressBar: true,
        parentId: 3
      },
      {
        id: 303,
        title: "Beta Testing Program",
        type: "percent",
        target: 95,
        tag: "Product Innovation",
        timeframe: "Q2-2024",
        milestoneFrequency: "Weekly",
        trafficLights: true,
        trafficLightStyle: 'system',
        progressBar: true,
        parentId: 3
      }
    ]
  },
  {
    id: 4,
    title: "Expand Market Reach",
    type: "number",
    target: 50,
    tag: "Market Expansion",
    timeframe: "last-6-months",
    milestoneFrequency: "Quarterly",
    isExpanded: false,
    nestedCount: 1,
    trafficLights: false,
    trafficLightStyle: 'disabled',
    progressBar: true,
    activities: [
      {
        id: 401,
        title: "Regional Market Analysis",
        type: "percent",
        target: 100,
        tag: "Market Expansion",
        timeframe: "this-quarter",
        milestoneFrequency: "Monthly",
        trafficLights: true,
        trafficLightStyle: 'system',
        progressBar: true,
        parentId: 4
      }
    ]
  },
  {
    id: 5,
    title: "Team Development Program",
    type: "percent",
    target: 90,
    tag: "Team Development",
    timeframe: "this-month",
    milestoneFrequency: "Weekly",
    isExpanded: false,
    nestedCount: 0,
    trafficLights: true,
    trafficLightStyle: 'system',
    progressBar: false
  },
  {
    id: 6,
    title: "Customer Onboarding Optimization",
    type: "number",
    target: 25,
    tag: "Operational Excellence",
    timeframe: "last-30-days",
    milestoneFrequency: "Weekly",
    isExpanded: false,
    nestedCount: 1,
    trafficLights: false,
    trafficLightStyle: 'disabled',
    progressBar: false
  }
];

export async function seedOkrData() {
  try {
    console.log('Starting OKR data seeding...');
    
    // Clear existing data
    await db.delete(okrMetrics);
    
    // Insert all OKR metrics (both parent and child)
    const allMetrics: any[] = [];
    
    mockOKRTemplates.forEach(template => {
      // Add parent metric
      allMetrics.push({
        id: template.id,
        title: template.title,
        type: template.type,
        target: template.target,
        tag: template.tag,
        timeframe: template.timeframe,
        milestoneFrequency: template.milestoneFrequency,
        isExpanded: template.isExpanded,
        nestedCount: template.nestedCount,
        trafficLights: template.trafficLights,
        trafficLightStyle: template.trafficLightStyle,
        progressBar: template.progressBar,
        unit: template.type,
        targetValue: template.target,
        hierarchy: 'objective',
        status: 'on_track',
        frequency: template.milestoneFrequency?.toLowerCase() || 'once'
      });
      
      // Add activities if they exist
      if (template.activities) {
        template.activities.forEach(activity => {
          allMetrics.push({
            id: activity.id,
            title: activity.title,
            type: activity.type,
            target: activity.target,
            tag: activity.tag,
            timeframe: activity.timeframe,
            milestoneFrequency: activity.milestoneFrequency,
            trafficLights: activity.trafficLights,
            trafficLightStyle: activity.trafficLightStyle,
            progressBar: activity.progressBar,
            parentId: activity.parentId,
            unit: activity.type,
            targetValue: activity.target,
            hierarchy: 'activity',
            status: 'on_track',
            frequency: activity.milestoneFrequency?.toLowerCase() || 'once',
            isExpanded: false,
            nestedCount: 0
          });
        });
      }
    });
    
    // Insert all metrics
    for (const metric of allMetrics) {
      await db.insert(okrMetrics).values(metric);
    }
    
    console.log(`Successfully seeded ${allMetrics.length} OKR metrics`);
    
    // Verify the data
    const insertedMetrics = await db.select().from(okrMetrics);
    console.log(`Verification: ${insertedMetrics.length} metrics found in database`);
    
  } catch (error) {
    console.error('Error seeding OKR data:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  seedOkrData()
    .then(() => {
      console.log('OKR data seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('OKR data seeding failed:', error);
      process.exit(1);
    });
}