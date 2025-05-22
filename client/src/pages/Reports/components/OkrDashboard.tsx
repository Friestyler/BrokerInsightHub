import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronRight, Star } from 'lucide-react';

interface OkrDashboardProps {
  timeFrame: string;
  region: string;
}

// OKR data structure
interface Metric {
  id: number;
  name: string;
  value: number;
  target: number;
  unit: string;
  progress: number;
  period: string;
  status?: 'green' | 'orange' | 'red' | 'gray';
  completion?: string;
  realized?: string | number;
  target_display?: string | number;
}

interface Plan {
  id: number;
  name: string;
  tag: string;
  color: string;
  isExpanded: boolean;
  metrics: Metric[];
}

const OkrDashboard: React.FC<OkrDashboardProps> = ({ timeFrame, region }) => {
  const [selectedPartner, setSelectedPartner] = useState<string>('all');
  const [activeView, setActiveView] = useState<string>('plans');
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: 1,
      name: 'Commerciële Groei Top Segment',
      tag: 'CG',
      color: 'bg-yellow-500',
      isExpanded: true,
      metrics: [
        { 
          id: 1, 
          name: 'Focus nieuwe klanten', 
          value: 2, 
          target: 4, 
          unit: 'milestones', 
          progress: 50, 
          period: '2025',
          status: 'orange' 
        },
        { 
          id: 2, 
          name: 'Lead generatiecampagne', 
          value: 1, 
          target: 3, 
          unit: 'milestones', 
          progress: 33, 
          period: 'Unique',
          status: 'orange' 
        },
        { 
          id: 3, 
          name: 'Regio-actie "Hypotheekchecks bij je lokale intermediair"', 
          value: 3, 
          target: 4, 
          unit: 'milestones', 
          progress: 75, 
          period: 'Unique',
          status: 'green' 
        }
      ],
    },
    {
      id: 2,
      name: 'Focus bestaande klanten',
      tag: '',
      color: 'bg-gray-500',
      isExpanded: false,
      metrics: [
        { 
          id: 4, 
          name: 'Klantretentie verhogen', 
          value: 1, 
          target: 4, 
          unit: 'milestones', 
          progress: 25, 
          period: '2025',
          status: 'red' 
        }
      ],
    },
    {
      id: 3,
      name: 'Focus klanten behouden',
      tag: '',
      color: 'bg-gray-500',
      isExpanded: false,
      metrics: [
        { 
          id: 5, 
          name: 'Klanttevredenheid verhogen', 
          value: 3, 
          target: 4, 
          unit: 'milestones', 
          progress: 75, 
          period: '2025',
          status: 'green' 
        }
      ],
    },
    {
      id: 4,
      name: 'Performance (KPIs)',
      tag: 'P',
      color: 'bg-blue-500',
      isExpanded: true,
      metrics: [
        { 
          id: 6, 
          name: 'Aantal hypotheekaanvragen', 
          value: 211, 
          target: 285, 
          unit: '#', 
          progress: 74, 
          period: 'May',
          realized: '211 #',
          target_display: '285 #',
          status: 'orange' 
        },
        { 
          id: 7, 
          name: 'Hypotheek volume', 
          value: 47500000, 
          target: 60000000, 
          unit: '€', 
          progress: 79, 
          period: 'May',
          realized: '47.500.000 €',
          target_display: '60.000.000 €',
          status: 'orange' 
        },
        { 
          id: 8, 
          name: '10% turnover increase in product X', 
          value: 58311, 
          target: 75000, 
          unit: '€', 
          progress: 78, 
          period: 'May',
          realized: '58.311 €',
          target_display: '75.000 €',
          status: 'orange' 
        }
      ],
    },
    {
      id: 5,
      name: 'Become preferred partner for XYZ...',
      tag: '',
      color: 'bg-gray-500',
      isExpanded: false,
      metrics: [
        { 
          id: 9, 
          name: 'Partner satisfaction score', 
          value: 4, 
          target: 5, 
          unit: 'points', 
          progress: 80, 
          period: 'Unique',
          status: 'green' 
        }
      ],
    },
    {
      id: 6,
      name: 'Increase ratio Production / Operational load',
      tag: '',
      color: 'bg-gray-500',
      isExpanded: false,
      metrics: [
        { 
          id: 10, 
          name: 'Production efficiency', 
          value: 12, 
          target: 15, 
          unit: '%', 
          progress: 80, 
          period: 'May',
          realized: '12 %',
          target_display: '15 %',
          status: 'green' 
        }
      ],
    },
    {
      id: 7,
      name: 'Intern Actieplan',
      tag: 'IA',
      color: 'bg-green-500',
      isExpanded: true,
      metrics: [
        { 
          id: 11, 
          name: 'Kwaliteitsgesprekken met top-intermediairs', 
          value: 0, 
          target: 8, 
          unit: 'completed', 
          progress: 0, 
          period: 'Q2',
          completion: '0 / 8 completed',
          status: 'red' 
        },
        { 
          id: 12, 
          name: 'Openstaande offertes - aanvragen bespreken', 
          value: 0, 
          target: 96, 
          unit: 'completed', 
          progress: 0, 
          period: 'May',
          completion: '0 / 96 completed',
          status: 'red' 
        }
      ],
    }
  ]);

  // Toggle plan expansion
  const togglePlanExpansion = (planId: number) => {
    setPlans(plans.map(plan => 
      plan.id === planId 
        ? { ...plan, isExpanded: !plan.isExpanded } 
        : plan
    ));
  };

  // Filter metrics based on time frame and region
  const filterMetrics = () => {
    // In a real application, this would filter based on the props
    console.log(`Filtering metrics for timeFrame: ${timeFrame}, region: ${region}`);
  };

  // Update filters when props change
  useEffect(() => {
    filterMetrics();
  }, [timeFrame, region]);

  // Status color mapping
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'green': return 'bg-green-500';
      case 'orange': return 'bg-orange-400';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  // Milestone progress rendering
  const renderMilestoneProgress = (value: number, max: number) => {
    const milestones = [];
    for (let i = 1; i <= max; i++) {
      const isFilled = i <= value;
      milestones.push(
        <div 
          key={i} 
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
            isFilled ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >
          {i}
        </div>
      );
    }
    return (
      <div className="flex space-x-1">
        {milestones}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="plans">Plans View</TabsTrigger>
            <TabsTrigger value="partners">Partners View</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={selectedPartner} onValueChange={setSelectedPartner}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Partner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Partners</SelectItem>
            <SelectItem value="jeroen">Jeroen Hypotheek Advies</SelectItem>
            <SelectItem value="abc">ABC Insurance Brokers</SelectItem>
            <SelectItem value="global">Global Assurance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TabsContent value="plans" className="mt-0">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <div className="text-xs text-muted-foreground">5 active, 2 completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">62%</div>
              <Progress value={62} className="h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Metrics Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                  <span className="text-xs">5</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-400 mr-1"></div>
                  <span className="text-xs">4</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                  <span className="text-xs">3</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-[auto_120px_120px_1fr] gap-4 px-4 py-2 bg-gray-100 rounded-md text-sm font-medium">
            <div>Plan / Metric</div>
            <div className="text-center">Fiscal Year 2025</div>
            <div className="text-center">Milestone Progress</div>
            <div className="text-center">Overall Progress</div>
          </div>

          {plans.map(plan => (
            <div key={plan.id} className="border rounded-md">
              <div 
                className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => togglePlanExpansion(plan.id)}
              >
                <div className="mr-2">
                  {plan.isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
                <div className="flex items-center">
                  {plan.tag && (
                    <div className={`w-6 h-6 rounded-full ${plan.color} text-white flex items-center justify-center text-xs font-bold mr-2`}>
                      {plan.tag}
                    </div>
                  )}
                  <Star className={`w-4 h-4 ${plan.id < 3 ? 'text-yellow-500' : 'text-gray-300'} mr-2`} />
                  <span className="font-medium">{plan.name}</span>
                </div>
              </div>

              {plan.isExpanded && (
                <div className="border-t">
                  {plan.metrics.map(metric => (
                    <div 
                      key={metric.id} 
                      className="grid grid-cols-[auto_120px_120px_1fr] gap-4 px-4 py-3 border-b last:border-b-0 items-center"
                    >
                      <div className="ml-8">{metric.name}</div>
                      <div className="text-center text-sm">{metric.period}</div>
                      <div className="flex justify-center">
                        {metric.unit === 'milestones' ? (
                          renderMilestoneProgress(metric.value, metric.target)
                        ) : (
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(metric.status)} mr-2`}></div>
                            <span className="text-sm">{metric.completion || 
                              (metric.realized && metric.target_display ? 
                                `${metric.realized} / ${metric.target_display}` : 
                                `${metric.value} / ${metric.target} ${metric.unit}`
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <Progress 
                          value={metric.progress} 
                          className={`h-2 ${
                            metric.progress >= 70 ? 'bg-green-100' : 
                            metric.progress >= 40 ? 'bg-orange-100' : 'bg-red-100'
                          }`} 
                          // Remove indicatorClassName and use custom styling
                          style={{
                            "--progress-background": getStatusColor(metric.status)
                          } as React.CSSProperties}
                        />
                        <div className="text-right text-xs mt-1">{metric.progress}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="partners" className="mt-0">
        <div className="border rounded-md p-6 text-center">
          <h3 className="text-lg font-medium mb-2">Partner Performance View</h3>
          <p className="text-gray-500">Switch to this view to see metrics organized by partner instead of by plan.</p>
          <p className="text-sm mt-4">This view will be implemented in the next phase.</p>
        </div>
      </TabsContent>
    </div>
  );
};

export default OkrDashboard;