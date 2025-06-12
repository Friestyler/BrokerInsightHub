import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { 
  MessageSquare, 
  Search, 
  BarChart2, 
  FileText, 
  SlidersHorizontal, 
  Upload, 
  ArrowUpRight, 
  ListFilter, 
  Archive, 
  Bell,
  Send,
  CheckSquare,
  Users,
  Timer,
  TrendingUp,
  AlertTriangle,
  Target,
  Calendar,
  DollarSign,
  Clock,
  Plus,
  Sparkles
} from 'lucide-react';

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
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [customActions, setCustomActions] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newActionForm, setNewActionForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    targetPage: '/dashboard'
  });
  const { environment } = useEnvironment();

  // Fetch real data from the system
  const { data: opportunities } = useQuery({
    queryKey: ['/api/opportunities'],
    staleTime: 30000,
  });

  const { data: partners } = useQuery({
    queryKey: ['/api/partners'],
    staleTime: 30000,
  });

  const { data: customers } = useQuery({
    queryKey: ['/api/customers'],
    staleTime: 30000,
  });

  const { data: unifiedActivities } = useQuery({
    queryKey: ['/api/unified-activities'],
    staleTime: 30000,
  });

  // Sample activities data for display
  const sampleActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'mention',
      title: 'John mentioned you in a partner discussion',
      description: 'Updated the Q2 sales targets for Acme Corp partnership',
      date: '2 hours ago',
      icon: <MessageSquare className="h-4 w-4 text-indigo-500" />,
      priority: 'medium',
      user: {
        name: 'John Smith',
        initials: 'JS'
      }
    },
    {
      id: '2',
      type: 'task',
      title: 'Complete partner onboarding checklist',
      description: 'TechFlow Solutions requires final documentation review',
      date: '4 hours ago',
      icon: <CheckSquare className="h-4 w-4 text-green-500" />,
      priority: 'high',
      user: {
        name: 'Sarah Wilson',
        initials: 'SW'
      }
    },
    {
      id: '3',
      type: 'campaign',
      title: 'Q2 Partner Outreach Campaign launched',
      description: 'Successfully sent to 150 potential partners',
      date: '1 day ago',
      icon: <Send className="h-4 w-4 text-blue-500" />,
      priority: 'low'
    },
    {
      id: '4',
      type: 'okr',
      title: 'Partner Growth OKR updated',
      description: 'Current progress: 68% towards Q2 target',
      date: '2 days ago',
      icon: <BarChart2 className="h-4 w-4 text-purple-500" />,
      priority: 'medium'
    },
    {
      id: '5',
      type: 'collaboration',
      title: 'New collaboration proposal from GlobalTech',
      description: 'Joint venture opportunity for European market expansion',
      date: '3 days ago',
      icon: <Users className="h-4 w-4 text-orange-500" />,
      priority: 'high',
      user: {
        name: 'Mike Johnson',
        initials: 'MJ'
      }
    }
  ];

  // Generate intelligent next best actions based on real data
  const generateNextBestActions = () => {
    const actions = [];
    
    // High-value opportunities that need attention
    if (opportunities && Array.isArray(opportunities)) {
      const highValueOpps = opportunities.filter((opp: any) => 
        opp.value > 50000 && opp.status === 'In Progress'
      );
      if (highValueOpps.length > 0) {
        actions.push({
          title: "Review High-Value Opportunities",
          description: `${highValueOpps.length} opportunities worth €${highValueOpps.reduce((sum: number, opp: any) => sum + opp.value, 0).toLocaleString()}`,
          action: () => setLocation('/opportunities'),
          icon: <DollarSign className="h-5 w-5 text-green-600" />,
          priority: 'high' as const,
          data: `Total value: €${highValueOpps.reduce((sum: number, opp: any) => sum + opp.value, 0).toLocaleString()}`
        });
      }
    }

    // Partners needing engagement
    if (partners && Array.isArray(partners)) {
      const partnersNeedingAttention = partners.filter((partner: any) => 
        partner.opportunityCount > 0 && partner.customerCount > 2
      );
      if (partnersNeedingAttention.length > 0) {
        actions.push({
          title: "Engage Top-Performing Partners",
          description: `${partnersNeedingAttention.length} partners with active opportunities`,
          action: () => setLocation('/partners'),
          icon: <Users className="h-5 w-5 text-blue-600" />,
          priority: 'medium' as const,
          data: `${partnersNeedingAttention.reduce((sum: number, p: any) => sum + p.opportunityCount, 0)} active opportunities`
        });
      }
    }

    // Customer relationship opportunities
    if (customers && Array.isArray(customers)) {
      const customersWithOpportunities = customers.filter((customer: any) => 
        customer.opportunities && customer.opportunities.length > 0
      );
      if (customersWithOpportunities.length > 0) {
        actions.push({
          title: "Customer Relationship Review",
          description: `${customersWithOpportunities.length} customers with pending opportunities`,
          action: () => setLocation('/customers'),
          icon: <TrendingUp className="h-5 w-5 text-purple-600" />,
          priority: 'medium' as const,
          data: `Active customer relationships`
        });
      }
    }

    // Activity-based recommendations
    if (unifiedActivities && Array.isArray(unifiedActivities)) {
      const recentTasks = unifiedActivities.filter((activity: any) => 
        activity.type === 'task' && activity.status === 'pending'
      );
      if (recentTasks.length > 0) {
        actions.push({
          title: "Complete Pending Tasks",
          description: `${recentTasks.length} tasks require attention`,
          action: () => setLocation('/tasks'),
          icon: <CheckSquare className="h-5 w-5 text-orange-600" />,
          priority: 'high' as const,
          data: `${recentTasks.length} pending tasks`
        });
      }
    }

    // Time-sensitive actions
    const currentDate = new Date();
    actions.push({
      title: "Weekly Performance Review",
      description: "Review this week's partner and opportunity metrics",
      action: () => setLocation('/reports'),
      icon: <BarChart2 className="h-5 w-5 text-indigo-600" />,
      priority: 'low' as const,
      data: `Week of ${currentDate.toLocaleDateString()}`
    });

    // Campaign optimization
    actions.push({
      title: "Optimize Active Campaigns",
      description: "Review campaign performance and adjust targeting",
      action: () => setLocation('/campaigns'),
      icon: <Target className="h-5 w-5 text-red-600" />,
      priority: 'medium' as const,
      data: "Campaign performance insights"
    });

    return actions.slice(0, 6); // Limit to 6 actions
  };

  // Handle creating new custom actions
  const handleCreateAction = () => {
    if (!newActionForm.title.trim() || !newActionForm.description.trim()) return;

    const iconMap = {
      partners: <Users className="h-5 w-5 text-blue-600" />,
      opportunities: <DollarSign className="h-5 w-5 text-green-600" />,
      customers: <TrendingUp className="h-5 w-5 text-purple-600" />,
      campaigns: <Target className="h-5 w-5 text-red-600" />,
      reports: <BarChart2 className="h-5 w-5 text-indigo-600" />,
      tasks: <CheckSquare className="h-5 w-5 text-orange-600" />,
      general: <Sparkles className="h-5 w-5 text-gray-600" />
    };

    const newAction = {
      id: Date.now().toString(),
      title: newActionForm.title,
      description: newActionForm.description,
      action: () => setLocation(newActionForm.targetPage),
      icon: iconMap[newActionForm.category as keyof typeof iconMap] || iconMap.general,
      priority: newActionForm.priority as 'high' | 'medium' | 'low',
      data: `Custom action created ${new Date().toLocaleDateString()}`,
      isCustom: true
    };

    setCustomActions(prev => [newAction, ...prev]);
    setNewActionForm({
      title: '',
      description: '',
      priority: 'medium',
      category: 'general',
      targetPage: '/dashboard'
    });
    setIsDialogOpen(false);
  };

  const handleDeleteCustomAction = (actionId: string) => {
    setCustomActions(prev => prev.filter(action => action.id !== actionId));
  };

  // Combine system-generated and custom actions
  const systemActions = generateNextBestActions();
  const allActions = [...customActions, ...systemActions];
  
  const filteredActivities = activeTab === 'all' ? sampleActivities : sampleActivities.filter(activity => activity.type === activeTab);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setInputValue('');
      // Would normally process the query here
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-full">
      {/* Top Navigation */}
      <div className="flex space-x-1 mb-10">
        <Button variant="ghost" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
          <MessageSquare className="h-4 w-4 mr-2" />
          Partner copilot
        </Button>
        <Button variant="ghost">
          <Search className="h-4 w-4 mr-2" />
          Explore
        </Button>
        <Button variant="ghost">
          <BarChart2 className="h-4 w-4 mr-2" />
          Predict
        </Button>
        <Button 
          variant="ghost"
          onClick={() => setLocation("/reports")}
        >
          <FileText className="h-4 w-4 mr-2" />
          Reports
        </Button>
        <Button variant="ghost">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Presentations
        </Button>
        <Button 
          variant="ghost"
          onClick={() => setLocation("/data-upload")}
        >
          <Upload className="h-4 w-4 mr-2" />
          Data Upload
        </Button>
      </div>

      {/* Next Best Actions Section */}
      <div className="mb-10 mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 mb-4">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Next Best Actions</h2>
          </div>
          <p className="text-gray-600 text-sm">Smart recommendations based on your current activities and priorities</p>
        </div>

        {/* Smart Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {allActions.map((action, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer border-0 bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30 relative overflow-hidden"
              onClick={action.action}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-indigo-100 transition-colors duration-300">
                    {(action as any).icon || <ArrowUpRight className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />}
                  </div>
                  <div className="flex items-center gap-2">
                    {(action as any).priority && (
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (action as any).priority === 'high' ? 'bg-red-100 text-red-700' :
                        (action as any).priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {(action as any).priority === 'high' ? 'Urgent' : (action as any).priority === 'medium' ? 'Important' : 'Later'}
                      </div>
                    )}
                    {(action as any).isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomAction((action as any).id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 transition-all duration-200"
                        title="Delete custom action"
                      >
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-900 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">{action.description}</p>
                {(action as any).data && (
                  <div className="flex items-center text-xs text-gray-500">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                    {(action as any).data}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Access Bar */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button 
            onClick={() => window.location.href = '/opportunities'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            View All Opportunities
          </button>
          <button 
            onClick={() => window.location.href = '/partners'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Partner Overview
          </button>
          <button 
            onClick={() => window.location.href = '/campaigns'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Campaign Center
          </button>
        </div>
      </div>

      {/* Activity and Stats Section - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Activity Feed */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Activity</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <ListFilter className="h-3.5 w-3.5 mr-1" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Archive className="h-3.5 w-3.5 mr-1" />
                Archive
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-gray-100">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="mention" className="text-xs">Mentions</TabsTrigger>
              <TabsTrigger value="task" className="text-xs">Tasks</TabsTrigger>
              <TabsTrigger value="campaign" className="text-xs">Campaigns</TabsTrigger>
              <TabsTrigger value="okr" className="text-xs">OKRs</TabsTrigger>
              <TabsTrigger value="collaboration" className="text-xs">Collaborations</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-1">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="p-3 hover:bg-gray-50 rounded-md flex items-start justify-between cursor-pointer border border-gray-100"
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {activity.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {activity.priority && (
                      <Badge 
                        variant="outline" 
                        className={
                          activity.priority === 'high' ? "text-red-600 bg-red-50 border-red-200" :
                          activity.priority === 'medium' ? "text-amber-600 bg-amber-50 border-amber-200" :
                          "text-green-600 bg-green-50 border-green-200"
                        }
                      >
                        {activity.priority}
                      </Badge>
                    )}
                    {activity.user && (
                      <Avatar className="h-6 w-6">
                        {activity.user.avatar && <AvatarImage src={activity.user.avatar} alt={activity.user.name} />}
                        <AvatarFallback className="text-xs bg-indigo-100 text-indigo-600">{activity.user.initials}</AvatarFallback>
                      </Avatar>
                    )}
                    <span className="text-xs text-gray-500 whitespace-nowrap">{activity.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <Bell className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                <p className="text-gray-500">No activities to show</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Additional Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-medium mb-4">Quick Stats</h2>
              
              <div className="space-y-4">
                <div className="p-3 border rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Send className="h-4 w-4 text-indigo-500 mr-2" />
                      <h3 className="text-sm font-medium">Active Campaigns</h3>
                    </div>
                    <span className="font-medium text-lg">3</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    2 performing above average
                  </div>
                </div>
                
                <div className="p-3 border rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CheckSquare className="h-4 w-4 text-green-500 mr-2" />
                      <h3 className="text-sm font-medium">Pending Tasks</h3>
                    </div>
                    <span className="font-medium text-lg">7</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    2 high priority tasks due soon
                  </div>
                </div>
                
                <div className="p-3 border rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-blue-500 mr-2" />
                      <h3 className="text-sm font-medium">Partner Activity</h3>
                    </div>
                    <span className="font-medium text-lg">+12%</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Increased engagement this month
                  </div>
                </div>
                
                <div className="p-3 border rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
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