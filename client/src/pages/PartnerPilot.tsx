import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

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
import DataUploadOptions from '@/pages/DataUpload/DataUploadOptions';
import DeGoudseUploadWizard from '@/pages/DataUpload/DeGoudseUploadWizard';
import ReportsPage from '@/pages/Reports/ReportsPage';

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
  Sparkles,
  FileSpreadsheet,
  Settings,
  Building,
  Package,
  Truck,
  Contact,
  Cloud,
  Database,
  Handshake,
  RefreshCw,
  UserCheck,
  Phone,
  Factory

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

  const [activeSection, setActiveSection] = useState<'copilot' | 'reports' | 'data-upload-3' | 'data-upload-3-degoudse' | 'settings'>('copilot');

  // Listen for navigation events from upload process pages
  useEffect(() => {
    const handleNavigateToSection = (event: CustomEvent) => {
      setActiveSection(event.detail);
    };

    window.addEventListener('navigate-to-section', handleNavigateToSection as EventListener);
    
    return () => {
      window.removeEventListener('navigate-to-section', handleNavigateToSection as EventListener);
    };
  }, []);

  // Fetch real data from the system
  const { data: opportunities } = useQuery({
    queryKey: ['/api/opportunities'],
    staleTime: 30000,
  });

  const { data: partners } = useQuery({
    queryKey: ['/api/partners'],
    staleTime: 30000,
  });

  const { data: customersResponse } = useQuery({
    queryKey: ['/api/customers'],
    staleTime: 30000,
  });
  const customers = customersResponse?.data || [];

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
        (opp.estimated_value || 0) > 50000 && opp.status === 'In Progress'
      );
      if (highValueOpps.length > 0) {
        actions.push({
          title: "Priority Insurance Opportunities",
          description: `${highValueOpps.length} high-value cross-sell opportunities worth €${highValueOpps.reduce((sum: number, opp: any) => sum + (opp.estimated_value || 0), 0).toLocaleString()}`,
          action: () => setLocation('/opportunities'),
          icon: <DollarSign className="h-5 w-5 text-green-600" />,
          priority: 'high' as const,
          data: `Portfolio expansion potential: €${highValueOpps.reduce((sum: number, opp: any) => sum + (opp.estimated_value || 0), 0).toLocaleString()}`
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
          title: "Activate Insurance Broker Network",
          description: `${partnersNeedingAttention.length} brokers ready for premium growth initiatives`,
          action: () => setLocation('/partners'),
          icon: <Users className="h-5 w-5 text-blue-600" />,
          priority: 'medium' as const,
          data: `${partnersNeedingAttention.reduce((sum: number, p: any) => sum + p.opportunityCount, 0)} cross-sell opportunities identified`
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
          title: "Insurance Portfolio Expansion",
          description: `${customersWithOpportunities.length} clients with untapped insurance needs`,
          action: () => setLocation('/customers'),
          icon: <TrendingUp className="h-5 w-5 text-purple-600" />,
          priority: 'medium' as const,
          data: `Multi-product upsell opportunities available`
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
      title: "Insurance Performance Analytics",
      description: "Review cross-sell success rates and premium growth metrics",
      action: () => setLocation('/reports'),
      icon: <BarChart2 className="h-5 w-5 text-indigo-600" />,
      priority: 'low' as const,
      data: `Week of ${currentDate.toLocaleDateString()}`
    });

    // Campaign optimization
    actions.push({
      title: "Insurance Campaign Optimization",
      description: "Enhance targeting for life, auto, and property insurance offers",
      action: () => setLocation('/campaigns'),
      icon: <Target className="h-5 w-5 text-red-600" />,
      priority: 'medium' as const,
      data: "Cross-sell campaign performance insights"
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
        <Button 
          variant="ghost" 
          className={activeSection === 'copilot' ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" : ""}
          onClick={() => setActiveSection('copilot')}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Insurance Copilot
        </Button>
        <Button 
          variant="ghost"
          className={activeSection === 'reports' ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" : ""}
          onClick={() => setActiveSection('reports')}
        >
          <FileText className="h-4 w-4 mr-2" />
          Reports
        </Button>

        <Button 
          variant="ghost"
          className={activeSection === 'data-upload-3' ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" : ""}
          onClick={() => setActiveSection('data-upload-3')}
        >
          <Upload className="h-4 w-4 mr-2" />
          Data Upload
        </Button>
      </div>

{activeSection === 'copilot' && (
  <>
    {/* Baloise Branding Header */}
    <div className="mb-8 mx-auto max-w-6xl">
      <div className="text-center">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
            <div className="text-white font-bold text-sm">B</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Broker Copilot</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your AI-powered assistant for maximizing insurance cross-sell and upsell opportunities across your broker network
        </p>
      </div>
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
          <h2 className="text-2xl font-semibold text-gray-900">Insurance Portfolio Growth Opportunities</h2>
        </div>
        <p className="text-gray-600 text-sm">AI-powered recommendations to maximize cross-sell and upsell potential across your insurance portfolio</p>
      </div>

      {/* Quick Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Opportunities</p>
                <p className="text-2xl font-bold text-blue-900">{opportunities?.length || 0}</p>
              </div>
              <div className="p-2 bg-blue-200 rounded-lg">
                <Target className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Active Partners</p>
                <p className="text-2xl font-bold text-green-900">{partners?.length || 0}</p>
              </div>
              <div className="p-2 bg-green-200 rounded-lg">
                <Building className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Customers</p>
                <p className="text-2xl font-bold text-purple-900">{customers?.length || 0}</p>
              </div>
              <div className="p-2 bg-purple-200 rounded-lg">
                <Users className="h-5 w-5 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Pipeline Value</p>
                <p className="text-2xl font-bold text-orange-900">
                  €{opportunities?.reduce((sum: number, opp: any) => sum + (opp.estimated_value || 0), 0).toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-2 bg-orange-200 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
        
        <div className="space-y-3">
          {sampleActivities.slice(0, 5).map((activity) => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        {activity.priority && (
                          <Badge variant={
                            activity.priority === 'high' ? 'destructive' :
                            activity.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            {activity.priority === 'high' ? 'Urgent' : 
                             activity.priority === 'medium' ? 'Important' : 'Later'}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">{activity.date}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    {activity.user && (
                      <div className="flex items-center mt-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{activity.user.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500 ml-2">{activity.user.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
          Insurance Opportunities
        </button>
        <button 
          onClick={() => window.location.href = '/partners'}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Broker Network
        </button>
        <button 
          onClick={() => window.location.href = '/campaigns'}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
        >
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          Cross-Sell Campaigns
        </button>
      </div>
    </div>
  </>
)}






      {activeSection === 'reports' && (
        <ReportsPage />
      )}

      {activeSection === 'data-upload-3' && (
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Data Upload</h1>
            <p className="text-gray-600">Upload your data using intelligent templates and entity mapping</p>
          </div>
          


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-emerald-100 flex flex-col" onClick={() => setLocation('/data-upload-3/process/entity-upload')}>
              <CardHeader className="flex-grow">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Upload className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
                <CardTitle className="text-lg mt-2">Upload Entity Data</CardTitle>
                <CardDescription>
                  General entity data upload with flexible mapping and validation
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Upload Entity Data
                </Button>
              </CardFooter>
            </Card>

            <Card 
              className="hover:shadow-md transition-shadow cursor-pointer border-2 border-blue-100 flex flex-col"
            >
              <CardHeader className="flex-grow">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Cloud className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-lg mt-2">Upload from Broker Cloud</CardTitle>
                <CardDescription>
                  Import data from your Broker Cloud account
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button 
                  variant="outline" 
                  className="w-full border-gray-200"
                >
                  Connect
                </Button>
              </CardFooter>
            </Card>

            <Card 
              className="hover:shadow-md transition-shadow cursor-pointer border-2 border-green-100 flex flex-col"
            >
              <CardHeader className="flex-grow">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Database className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-lg mt-2">Upload from other CRM or portal</CardTitle>
                <CardDescription>
                  Import from any other third-party system
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button 
                  variant="outline" 
                  className="w-full border-gray-200"
                >
                  Select Source
                </Button>
              </CardFooter>
            </Card>

            <Card 
              className="hover:shadow-md transition-shadow cursor-pointer border-2 border-purple-100 flex flex-col"
            >
              <CardHeader className="flex-grow">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-lg mt-2">Sync with your CRM</CardTitle>
                <CardDescription>
                  Set up automatic data synchronization
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button 
                  variant="outline" 
                  className="w-full border-gray-200"
                >
                  Set Up Sync
                </Button>
              </CardFooter>
            </Card>

            <Card 
              className="hover:shadow-md transition-shadow cursor-pointer border-2 border-blue-100 flex flex-col"
              onClick={() => setLocation('/data-upload-3/process/salesforce')}
            >
              <CardHeader className="flex-grow">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Cloud className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-lg mt-2">Salesforce Import</CardTitle>
                <CardDescription>
                  Specialized CSV import for Salesforce CRM data export formats
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Upload Salesforce File
                </Button>
              </CardFooter>
            </Card>

            <Card 
              className="hover:shadow-md transition-shadow cursor-pointer border-2 border-indigo-100 flex flex-col"
              onClick={() => setLocation('/data-upload-3/process/brio')}
            >
              <CardHeader className="flex-grow">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
                <CardTitle className="text-lg mt-2">Brio Format</CardTitle>
                <CardDescription>
                  Import data using Brio business intelligence export formats
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Upload Brio File
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {activeSection === 'data-upload-3-degoudse' && (
        <div className="w-full">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setActiveSection('data-upload-3')}
              className="mb-4"
            >
              ← Back to Data Upload 3
            </Button>
          </div>
          <DeGoudseUploadWizard />
        </div>
      )}


    </div>
  );
}