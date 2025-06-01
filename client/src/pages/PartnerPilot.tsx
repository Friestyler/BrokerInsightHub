import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { 
  MessageSquare, 
  Search, 
  BarChart2, 
  FileText, 
  SlidersHorizontal,
  ArrowUpRight,
  UserCircle, 
  Calendar,
  Send,
  Bell,
  CheckSquare,
  ListFilter,
  Upload,
  AlertCircle,
  Users,
  Timer,
  Archive,
  Target,
  TrendingUp,
  Brain,
  Sparkles,
  Activity,
  Clock,
  ChevronRight
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type ActivityItem = {
  id: string;
  type: 'mention' | 'update' | 'task' | 'campaign' | 'okr' | 'collaboration';
  title: string;
  description: string;
  date: string;
  icon: React.ReactNode;
  status?: string;
  priority?: 'low' | 'medium' | 'high';
  user?: {
    name: string;
    avatar?: string;
    initials: string;
  };
};

export default function PartnerPilot() {
  const [, setLocation] = useLocation();
  const { environment } = useEnvironment();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [copilotOpen, setCopilotOpen] = useState(false);

  // Fetch real data from API
  const { data: partnersData, isLoading: partnersLoading } = useQuery({
    queryKey: [`/api/partners`],
    enabled: !!environment
  });

  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: [`/api/partner-activities/overview`],
    enabled: !!environment
  });

  const { data: okrData, isLoading: okrLoading } = useQuery({
    queryKey: [`/api/okr-metrics`],
    enabled: !!environment
  });

  // Process real activity data into our format
  const activities: ActivityItem[] = activitiesData?.activities?.map((activity: any) => ({
    id: activity.id?.toString(),
    type: activity.type || 'update',
    title: activity.title || activity.content,
    description: activity.description || `Related to ${activity.partner_name || 'partner'}`,
    date: new Date(activity.created_at).toLocaleDateString(),
    icon: activity.type === 'okr_comment' ? 
      <Target className="h-4 w-4 text-purple-500" /> : 
      <MessageSquare className="h-4 w-4 text-blue-500" />,
    priority: activity.priority || 'medium',
    user: activity.user ? {
      name: activity.user.name || 'Unknown User',
      initials: activity.user.name?.split(' ').map((n: string) => n[0]).join('') || 'UN'
    } : undefined
  })) || [];

  // Filter activities based on active tab
  const filteredActivities = activeTab === "all" 
    ? activities 
    : activities.filter(a => a.type === activeTab);

  // Generate Next Best Actions based on real data
  const getNextBestActions = () => {
    const actions = [];
    
    if (partnersData && Array.isArray(partnersData)) {
      const partnersWithHighOpportunities = partnersData.filter((p: any) => p.opportunity_count > 5);
      if (partnersWithHighOpportunities.length > 0) {
        actions.push({
          title: "Review high-opportunity partners",
          description: `${partnersWithHighOpportunities.length} partners have 5+ opportunities`,
          action: () => setLocation('/partners'),
          icon: <TrendingUp className="h-4 w-4" />,
          priority: 'high'
        });
      }
    }

    if (okrData && Array.isArray(okrData)) {
      const overdueMetrics = okrData.filter((m: any) => 
        m.target_date && new Date(m.target_date) < new Date()
      );
      if (overdueMetrics.length > 0) {
        actions.push({
          title: "Address overdue OKR metrics",
          description: `${overdueMetrics.length} metrics past their target date`,
          action: () => setLocation('/okr-metrics'),
          icon: <Target className="h-4 w-4" />,
          priority: 'urgent'
        });
      }
    }

    if (activities.length > 0) {
      const urgentActivities = activities.filter(a => a.priority === 'high');
      if (urgentActivities.length > 0) {
        actions.push({
          title: "Handle urgent activities",
          description: `${urgentActivities.length} high-priority items need attention`,
          action: () => {},
          icon: <AlertCircle className="h-4 w-4" />,
          priority: 'high'
        });
      }
    }

    // Default actions if no specific insights
    if (actions.length === 0) {
      actions.push({
        title: "Review partner performance",
        description: "Analyze your partner relationships and opportunities",
        action: () => setLocation('/partners'),
        icon: <BarChart2 className="h-4 w-4" />,
        priority: 'medium'
      });
    }

    return actions;
  };

  const nextBestActions = getNextBestActions();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setIsLoading(false);
      // Would normally process the query here
    }, 1000);
  };

  if (partnersLoading || activitiesLoading || okrLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-full">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading partner intelligence...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate quick stats from real data
  const quickStats = {
    totalPartners: Array.isArray(partnersData) ? partnersData.length : 0,
    totalOpportunities: Array.isArray(partnersData) ? partnersData.reduce((acc: number, p: any) => acc + (p.opportunity_count || 0), 0) : 0,
    activeOKRs: Array.isArray(okrData) ? okrData.length : 0,
    recentActivities: activities.length
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Clean Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Partner Intelligence</h1>
            <p className="text-gray-600 mt-1">AI-powered insights and actions for your partner ecosystem</p>
          </div>
          
          <Sheet open={copilotOpen} onOpenChange={setCopilotOpen}>
            <SheetTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Brain className="h-4 w-4 mr-2" />
                Partner Copilot
              </Button>
            </SheetTrigger>
            <SheetContent className="w-96">
              <SheetHeader>
                <SheetTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-indigo-600" />
                  Partner Copilot
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Ask about your partners, opportunities, or OKRs..."
                    className="w-full"
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Ask Copilot
                  </Button>
                </form>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Partners</p>
                  <p className="text-2xl font-bold text-gray-900">{quickStats.totalPartners}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Opportunities</p>
                  <p className="text-2xl font-bold text-gray-900">{quickStats.totalOpportunities}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active OKRs</p>
                  <p className="text-2xl font-bold text-gray-900">{quickStats.activeOKRs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                  <p className="text-2xl font-bold text-gray-900">{quickStats.recentActivities}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Best Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Next Best Actions</h2>
            <Button variant="ghost" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nextBestActions.map((action, index) => (
              <Card 
                key={index} 
                className="hover:shadow-md transition-all cursor-pointer border-gray-200 group"
                onClick={action.action}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      action.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                      action.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Activity Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Activity</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation('/partners')}
                  >
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities.length > 0 ? (
                    activities.slice(0, 5).map((activity) => (
                      <div 
                        key={activity.id} 
                        className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="mt-0.5">
                          {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">{activity.date}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Partner Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(partnersData) && partnersData.slice(0, 3).map((partner: any) => (
                    <div 
                      key={partner.id} 
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setLocation(`/partners/${partner.id}`)}
                    >
                      <div>
                        <p className="font-medium text-gray-900">{partner.name}</p>
                        <p className="text-sm text-gray-600">{partner.opportunity_count || 0} opportunities</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => setLocation('/partners')}
                  >
                    View All Partners
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
                      <Timer className="h-4 w-4 text-orange-500 mr-2" />
                      <h3 className="text-sm font-medium">OKR Progress</h3>
                    </div>
                    <span className="font-medium text-lg">68%</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Q2 targets in progress
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}