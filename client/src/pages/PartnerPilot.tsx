import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Timer
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

  // Sample activities data
  const activities: ActivityItem[] = [
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

  const nextBestActions = [
    {
      title: "Review High-Priority Partners",
      description: "3 partners need immediate attention",
      action: () => setLocation('/partners')
    },
    {
      title: "Update OKR Progress", 
      description: "2 metrics approaching deadlines",
      action: () => setLocation('/okr-metrics')
    },
    {
      title: "Opportunity Follow-up",
      description: "5 opportunities need updates",
      action: () => setLocation('/opportunities')
    }
  ];

  const filteredActivities = activeTab === 'all' ? activities : activities.filter(activity => activity.type === activeTab);

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
        <Button 
          variant="ghost"
          onClick={() => setLocation("/reports")}
        >
          <FileText className="h-4 w-4 mr-2" />
          Reports
        </Button>
        <Button 
          variant="ghost"
          onClick={() => setLocation("/data-upload")}
        >
          <Upload className="h-4 w-4 mr-2" />
          Data Upload
        </Button>
        <Button 
          variant="ghost"
          onClick={() => setLocation("/data-upload-2")}
        >
          <Upload className="h-4 w-4 mr-2" />
          Data Upload 2
        </Button>
        <Button 
          variant="ghost"
          onClick={() => setLocation("/data-upload-3")}
        >
          <Upload className="h-4 w-4 mr-2" />
          Data Upload 3
        </Button>
      </div>

      {/* ChatGPT-style Assistant Section */}
      <div className="mb-10 mx-auto text-center max-w-5xl">
        <div className="flex justify-center mb-6">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <MessageSquare className="h-6 w-6" />
          </div>
        </div>
        <h2 className="text-lg font-medium text-gray-900 mb-6">How can I help you?</h2>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Ask me about opportunities, partners, users..."
              className="pr-10 py-6 text-base"
            />
            <Button 
              type="submit" 
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-gray-100 p-1"
              disabled={isLoading}
            >
              {isLoading ? 
                <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> :
                <ArrowUpRight className="h-5 w-5 text-gray-500" />
              }
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nextBestActions.map((action, index) => (
            <Card 
              key={index} 
              className="hover:shadow-md transition-all cursor-pointer border-gray-200"
              onClick={action.action}
            >
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-1">{action.title}</h3>
                <p className="text-xs text-gray-500">{action.description}</p>
              </CardContent>
            </Card>
          ))}
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