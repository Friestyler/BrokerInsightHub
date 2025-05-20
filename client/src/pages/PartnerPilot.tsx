import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { 
  MessageSquare, 
  Search, 
  BarChart2, 
  Send, 
  Clock, 
  Users, 
  Eye, 
  Share2,
  BriefcaseBusiness,
  Globe,
  FileText,
  Bell,
  CheckSquare
} from "lucide-react";

export default function PartnerPilot() {
  const { environment } = useEnvironment();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Quick action options
  const quickActions = [
    {
      title: "Opportunities per partner by industry",
      icon: <BriefcaseBusiness className="h-5 w-5 text-indigo-500" />,
      action: () => {}
    },
    {
      title: "Find my top brokers in region per vertical or something else",
      icon: <Globe className="h-5 w-5 text-indigo-500" />,
      action: () => {}
    },
    {
      title: "Another potential prompt to fill in",
      icon: <FileText className="h-5 w-5 text-indigo-500" />,
      action: () => {}
    }
  ];

  // Notification types for the inbox
  const notificationTypes = [
    { id: 'shared_update', name: 'Shared update', icon: <Share2 className="h-4 w-4 mr-2" /> },
    { id: 'mention', name: 'Mention', icon: <Bell className="h-4 w-4 mr-2" /> },
    { id: 'invited', name: 'Invited', icon: <Users className="h-4 w-4 mr-2" /> },
    { id: 'updated', name: 'Updated...', icon: <Clock className="h-4 w-4 mr-2" /> },
    { id: 'shared_campaigns', name: 'Shared Campaigns...', icon: <Send className="h-4 w-4 mr-2" /> }
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
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center space-x-2 mb-8">
        <Button variant="outline" className="mb-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
          <MessageSquare className="h-4 w-4 mr-2" />
          Partner pilot
        </Button>
        <Button variant="outline" className="mb-2">
          <Search className="h-4 w-4 mr-2" />
          Explore
        </Button>
        <Button variant="outline" className="mb-2">
          <BarChart2 className="h-4 w-4 mr-2" />
          Predict
        </Button>
        <Button variant="outline" className="mb-2">
          <FileText className="h-4 w-4 mr-2" />
          Reports
        </Button>
        <Button variant="outline" className="mb-2">
          <Eye className="h-4 w-4 mr-2" />
          Presentations
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* AI Assistant */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start mb-4">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-md font-medium text-indigo-600">How can I help you?</h3>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Ask me about opportunities, partners, users..."
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading ? 
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> :
                    <Send className="h-4 w-4" />
                  }
                </Button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto py-3 px-4 justify-start"
                  onClick={action.action}
                >
                  <div className="flex flex-col items-start text-left">
                    <div className="flex items-center mb-1">
                      {action.icon}
                    </div>
                    <span className="text-sm font-normal">{action.title}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications Inbox */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="my_inbox">
              <TabsList className="mb-4 w-full grid grid-cols-3">
                <TabsTrigger value="my_inbox">My Inbox</TabsTrigger>
                <TabsTrigger value="shared_updates">Shared Updates</TabsTrigger>
                <TabsTrigger value="to_dos">To DO's</TabsTrigger>
              </TabsList>
              
              <TabsContent value="my_inbox" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Notifications</h3>
                  <Button variant="outline" size="sm">
                    <Clock className="h-4 w-4 mr-2" />
                    Type
                  </Button>
                </div>
                <div className="space-y-2">
                  {notificationTypes.map(notification => (
                    <div 
                      key={notification.id} 
                      className="p-3 border rounded-md flex items-center text-sm hover:bg-gray-50 cursor-pointer"
                    >
                      {notification.icon}
                      {notification.name}
                    </div>
                  ))}
                  
                  {/* Empty state when no notifications */}
                  {notificationTypes.length === 0 && (
                    <div className="text-center py-8">
                      <Bell className="mx-auto h-12 w-12 text-gray-300" />
                      <p className="mt-2 text-gray-500">No notifications yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="shared_updates">
                <div className="text-center py-8">
                  <Share2 className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-gray-500">No shared updates</p>
                </div>
              </TabsContent>
              
              <TabsContent value="to_dos">
                <div className="text-center py-8">
                  <CheckSquare className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-gray-500">No to-dos</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}