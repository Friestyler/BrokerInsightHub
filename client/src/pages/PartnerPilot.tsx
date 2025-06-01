import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Brain, 
  Sparkles, 
  Send, 
  Users, 
  TrendingUp, 
  Target, 
  Activity, 
  ChevronRight, 
  Clock,
  AlertCircle,
  Zap,
  Star
} from 'lucide-react';

export default function PartnerPilot() {
  const [, setLocation] = useLocation();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  // Fetch real data from APIs
  const { data: partnersData, isLoading: partnersLoading } = useQuery({
    queryKey: ['/api/partners'],
  });

  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['/api/partner-activities/overview'],
  });

  const { data: okrData, isLoading: okrLoading } = useQuery({
    queryKey: ['/api/okr-metrics'],
  });

  // Transform activities data
  const activities = Array.isArray(activitiesData?.activities) ? activitiesData.activities : [];

  // Next Best Actions based on real data patterns
  const nextBestActions = [
    {
      title: "Review High-Priority Partners",
      description: "3 partners need immediate attention based on recent activity",
      icon: <AlertCircle className="h-4 w-4" />,
      priority: "urgent",
      action: () => setLocation('/partners')
    },
    {
      title: "Update OKR Progress",
      description: "2 metrics are approaching their quarterly deadlines",
      icon: <Target className="h-4 w-4" />,
      priority: "high",
      action: () => setLocation('/okr-metrics')
    },
    {
      title: "Opportunity Follow-up",
      description: "5 opportunities haven't been updated in 7 days",
      icon: <Zap className="h-4 w-4" />,
      priority: "medium",
      action: () => setLocation('/opportunities')
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    // Simulate processing
    setTimeout(() => {
      setIsLoading(false);
      setInputValue('');
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
                    activities.slice(0, 5).map((activity: any) => (
                      <div 
                        key={activity.id} 
                        className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="mt-0.5">
                          <Activity className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title || 'Activity Update'}</p>
                          <p className="text-sm text-gray-600">{activity.description || 'Recent partner activity'}</p>
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">{activity.date || 'Today'}</span>
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
  );
}