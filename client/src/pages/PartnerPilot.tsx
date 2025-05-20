import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertCircle,
  Users,
  Timer,
  Archive
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
  const { environment } = useEnvironment();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Sample activity data
  const activities: ActivityItem[] = [
    {
      id: "1",
      type: "mention",
      title: "John mentioned you in a comment",
      description: "on Customer XYZ opportunity",
      date: "Just now",
      icon: <Bell className="h-4 w-4 text-blue-500" />,
      user: {
        name: "John Doe",
        initials: "JD"
      }
    },
    {
      id: "2",
      type: "update",
      title: "Partner profile update",
      description: "ABC Insurance updated their profile information",
      date: "2 hours ago",
      icon: <Users className="h-4 w-4 text-indigo-500" />,
    },
    {
      id: "3",
      type: "task",
      title: "Follow-up with potential client",
      description: "Need to schedule a meeting with GlobalTech Inc.",
      date: "Tomorrow",
      icon: <CheckSquare className="h-4 w-4 text-green-500" />,
      status: "pending",
      priority: "high"
    },
    {
      id: "4",
      type: "campaign",
      title: "Campaign performance update",
      description: "Car + Legal campaign is performing 15% above average",
      date: "Today",
      icon: <Send className="h-4 w-4 text-purple-500" />,
    },
    {
      id: "5",
      type: "okr",
      title: "OKR deadline approaching",
      description: "Q2 Goals review due in 3 days",
      date: "3 days",
      icon: <Timer className="h-4 w-4 text-orange-500" />,
      priority: "medium"
    },
    {
      id: "6",
      type: "collaboration",
      title: "New collaboration request",
      description: "Sarah wants to collaborate on Customer List",
      date: "Yesterday",
      icon: <Users className="h-4 w-4 text-teal-500" />,
      user: {
        name: "Sarah Johnson",
        initials: "SJ"
      }
    }
  ];

  // Filter activities based on active tab
  const filteredActivities = activeTab === "all" 
    ? activities 
    : activities.filter(a => a.type === activeTab);

  // Quick action options
  const quickActions = [
    {
      title: "Opportunities per partner by industry",
      description: "Analyze distribution of opportunities",
      action: () => {}
    },
    {
      title: "Find my top brokers in region per vertical",
      description: "Discover your best performing partners",
      action: () => {}
    },
    {
      title: "Another potential prompt to fill in",
      description: "Custom analysis based on your needs",
      action: () => {}
    }
  ];

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

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
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
        <Button variant="ghost">
          <FileText className="h-4 w-4 mr-2" />
          Reports
        </Button>
        <Button variant="ghost">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Presentations
        </Button>
      </div>

      {/* ChatGPT-style Assistant Section */}
      <div className="mb-10 max-w-3xl mx-auto text-center">
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
          {quickActions.map((action, index) => (
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

      {/* Activity Inbox Section */}
      <div className="max-w-3xl mx-auto">
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
    </div>
  );
}