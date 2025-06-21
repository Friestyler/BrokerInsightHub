// Opportunity Health Scoring and Color System
export interface OpportunityHealthMetrics {
  overall: number; // 0-100 score
  value: number;
  probability: number;
  timeline: number;
  activity: number;
  stage: number;
}

export interface HealthColorScheme {
  primary: string;
  secondary: string;
  background: string;
  border: string;
  text: string;
  badge: string;
}

// Calculate comprehensive opportunity health score
export function calculateOpportunityHealth(opportunity: any): OpportunityHealthMetrics {
  const value = calculateValueScore(opportunity.estimated_value || 0);
  const probability = calculateProbabilityScore(opportunity.probability || 0);
  const timeline = calculateTimelineScore(opportunity);
  const activity = calculateActivityScore(opportunity);
  const stage = calculateStageScore(opportunity.stage);
  
  // Weighted overall score
  const overall = Math.round(
    (value * 0.3) + 
    (probability * 0.25) + 
    (timeline * 0.2) + 
    (activity * 0.15) + 
    (stage * 0.1)
  );
  
  return {
    overall,
    value,
    probability,
    timeline,
    activity,
    stage
  };
}

// Value scoring (0-100) based on opportunity value ranges
function calculateValueScore(value: number): number {
  if (value >= 100000) return 100;
  if (value >= 75000) return 85;
  if (value >= 50000) return 70;
  if (value >= 30000) return 55;
  if (value >= 15000) return 40;
  if (value >= 5000) return 25;
  return 10;
}

// Probability scoring (direct mapping)
function calculateProbabilityScore(probability: number): number {
  return Math.min(100, Math.max(0, probability));
}

// Timeline scoring based on expected close date
function calculateTimelineScore(opportunity: any): number {
  if (!opportunity.expectedCloseDate && !opportunity.closeDate) return 50; // Neutral
  
  const closeDate = new Date(opportunity.expectedCloseDate || opportunity.closeDate);
  const today = new Date();
  const daysUntilClose = Math.ceil((closeDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  
  if (daysUntilClose < 0) return 20; // Overdue
  if (daysUntilClose <= 7) return 95; // Closing soon - high urgency
  if (daysUntilClose <= 30) return 80; // Closing this month
  if (daysUntilClose <= 90) return 65; // Closing this quarter
  if (daysUntilClose <= 180) return 50; // Closing this half-year
  return 30; // Long term
}

// Activity scoring based on last activity
function calculateActivityScore(opportunity: any): number {
  if (!opportunity.lastActivityDate) return 20; // No recent activity
  
  const lastActivity = new Date(opportunity.lastActivityDate);
  const today = new Date();
  const daysSinceActivity = Math.ceil((today.getTime() - lastActivity.getTime()) / (1000 * 3600 * 24));
  
  if (daysSinceActivity <= 1) return 100; // Very recent
  if (daysSinceActivity <= 3) return 85; // Recent
  if (daysSinceActivity <= 7) return 70; // This week
  if (daysSinceActivity <= 14) return 50; // Last two weeks
  if (daysSinceActivity <= 30) return 30; // Last month
  return 10; // Stale
}

// Stage scoring based on sales pipeline position
function calculateStageScore(stage: string): number {
  const stageScores: { [key: string]: number } = {
    'Closed Won': 100,
    'Negotiation': 85,
    'Proposal Sent': 70,
    'Qualification': 55,
    'Initial Contact': 40,
    'Lead': 25,
    'Prospecting': 15,
    'Closed Lost': 0
  };
  
  return stageScores[stage] || 50; // Default neutral score
}

// Get color scheme based on health score
export function getHealthColorScheme(healthScore: number): HealthColorScheme {
  if (healthScore >= 80) {
    // Excellent health - Green theme
    return {
      primary: '#10B981', // emerald-500
      secondary: '#34D399', // emerald-400
      background: '#D1FAE5', // emerald-100
      border: '#6EE7B7', // emerald-300
      text: '#065F46', // emerald-800
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
  } else if (healthScore >= 60) {
    // Good health - Blue theme
    return {
      primary: '#3B82F6', // blue-500
      secondary: '#60A5FA', // blue-400
      background: '#DBEAFE', // blue-100
      border: '#93C5FD', // blue-300
      text: '#1E40AF', // blue-800
      badge: 'bg-blue-100 text-blue-800 border-blue-200'
    };
  } else if (healthScore >= 40) {
    // Moderate health - Yellow theme
    return {
      primary: '#F59E0B', // amber-500
      secondary: '#FBBF24', // amber-400
      background: '#FEF3C7', // amber-100
      border: '#FCD34D', // amber-300
      text: '#92400E', // amber-800
      badge: 'bg-amber-100 text-amber-800 border-amber-200'
    };
  } else if (healthScore >= 20) {
    // Poor health - Orange theme
    return {
      primary: '#F97316', // orange-500
      secondary: '#FB923C', // orange-400
      background: '#FED7AA', // orange-100
      border: '#FDBA74', // orange-300
      text: '#C2410C', // orange-800
      badge: 'bg-orange-100 text-orange-800 border-orange-200'
    };
  } else {
    // Critical health - Red theme
    return {
      primary: '#EF4444', // red-500
      secondary: '#F87171', // red-400
      background: '#FEE2E2', // red-100
      border: '#FCA5A5', // red-300
      text: '#B91C1C', // red-800
      badge: 'bg-red-100 text-red-800 border-red-200'
    };
  }
}

// Get health status label
export function getHealthStatusLabel(healthScore: number): string {
  if (healthScore >= 80) return 'Excellent';
  if (healthScore >= 60) return 'Good';
  if (healthScore >= 40) return 'Moderate';
  if (healthScore >= 20) return 'Poor';
  return 'Critical';
}

// Get health status icon
export function getHealthStatusIcon(healthScore: number): string {
  if (healthScore >= 80) return '🟢'; // Green circle
  if (healthScore >= 60) return '🔵'; // Blue circle
  if (healthScore >= 40) return '🟡'; // Yellow circle
  if (healthScore >= 20) return '🟠'; // Orange circle
  return '🔴'; // Red circle
}

// Calculate team/portfolio health metrics
export function calculatePortfolioHealth(opportunities: any[]): {
  averageHealth: number;
  healthDistribution: { [key: string]: number };
  totalValue: number;
  riskValue: number;
} {
  if (!opportunities || opportunities.length === 0) {
    return {
      averageHealth: 0,
      healthDistribution: {},
      totalValue: 0,
      riskValue: 0
    };
  }

  let totalHealth = 0;
  let totalValue = 0;
  let riskValue = 0;
  const healthCounts = {
    'Excellent': 0,
    'Good': 0,
    'Moderate': 0,
    'Poor': 0,
    'Critical': 0
  };

  opportunities.forEach(opp => {
    const health = calculateOpportunityHealth(opp);
    const value = opp.estimated_value || 0;
    
    totalHealth += health.overall;
    totalValue += value;
    
    // Calculate risk value (opportunities with health < 40)
    if (health.overall < 40) {
      riskValue += value;
    }
    
    // Count health distribution
    const label = getHealthStatusLabel(health.overall);
    healthCounts[label]++;
  });

  return {
    averageHealth: Math.round(totalHealth / opportunities.length),
    healthDistribution: healthCounts,
    totalValue,
    riskValue
  };
}