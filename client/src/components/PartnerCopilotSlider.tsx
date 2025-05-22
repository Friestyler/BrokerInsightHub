import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  Send, 
  MessageCircle, 
  LightbulbIcon, 
  ListFilter, 
  Target, 
  PieChart, 
  Bell,
  FileSearch,
  BookOpen,
  LineChart,
  BarChart4,
  AtSign,
  Star,
  BadgeCheck,
  List,
  FileText,
  Upload,
  ChevronRight
} from 'lucide-react';
import { useEnvironment } from '@/contexts/EnvironmentContext';

interface PartnerCopilotSliderProps {
  variant?: 'default' | 'ghost';
}

type Suggestion = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  link?: string;
};

const PartnerCopilotSlider = ({ variant = 'default' }: PartnerCopilotSliderProps) => {
  const [location] = useLocation();
  const { environment } = useEnvironment();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [userInput, setUserInput] = useState('');
  const [activeTab, setActiveTab] = useState('suggestions');
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hello! I\'m your Partner Pilot assistant. How can I help you today?' }
  ]);

  // Determine page-specific suggestions based on current location
  useEffect(() => {
    const defaultSuggestions: Suggestion[] = [
      {
        id: 'tour',
        title: 'Take a tour',
        description: 'Get familiar with the key features of Partner Pilot',
        icon: <BookOpen className="h-5 w-5" />,
        action: 'start-tour'
      },
      {
        id: 'create-campaign',
        title: 'Create a new campaign',
        description: 'Set up a targeted campaign for your partners',
        icon: <AtSign className="h-5 w-5" />,
        link: '/campaigns/new'
      },
      {
        id: 'upload-data',
        title: 'Upload new data',
        description: 'Import customer or partner data from your systems',
        icon: <Upload className="h-5 w-5" />,
        link: '/data-upload'
      }
    ];

    // Reports page suggestions
    const reportSuggestions: Suggestion[] = [
      {
        id: 'create-view',
        title: 'Create a saved view',
        description: 'Save your current report configuration for future use',
        icon: <FileSearch className="h-5 w-5" />,
        action: 'save-current-view'
      },
      {
        id: 'export-report',
        title: 'Export this report',
        description: 'Download in Excel, CSV or PDF format',
        icon: <FileText className="h-5 w-5" />,
        action: 'export-report'
      },
      {
        id: 'top-performers',
        title: 'Show top performers',
        description: 'Filter to show only the highest performing partners',
        icon: <Star className="h-5 w-5" />,
        action: 'show-top-performers'
      },
      {
        id: 'metric-trends',
        title: 'View metric trends',
        description: 'See how metrics have changed over time',
        icon: <LineChart className="h-5 w-5" />,
        action: 'show-metric-trends'
      }
    ];

    // Campaigns page suggestions
    const campaignSuggestions: Suggestion[] = [
      {
        id: 'new-campaign',
        title: 'Create targeted campaign',
        description: 'Start a new campaign targeting specific partners',
        icon: <AtSign className="h-5 w-5" />,
        link: '/campaigns/new'
      },
      {
        id: 'optimize-campaign',
        title: 'Optimize existing campaigns',
        description: 'Get recommendations to improve engagement',
        icon: <BarChart4 className="h-5 w-5" />,
        action: 'optimize-campaigns'
      },
      {
        id: 'campaign-report',
        title: 'Generate campaign report',
        description: 'Create a summary of campaign performance',
        icon: <FileText className="h-5 w-5" />,
        action: 'campaign-report'
      }
    ];

    // Partner detail suggestions
    const partnerSuggestions: Suggestion[] = [
      {
        id: 'assign-template',
        title: 'Assign OKR template',
        description: 'Add a performance template to this partner',
        icon: <Target className="h-5 w-5" />,
        action: 'assign-template'
      },
      {
        id: 'opportunities',
        title: 'Find cross-sell opportunities',
        description: 'Identify new business opportunities with this partner',
        icon: <LightbulbIcon className="h-5 w-5" />,
        action: 'find-opportunities'
      },
      {
        id: 'add-to-campaign',
        title: 'Add to campaign',
        description: 'Include this partner in a new or existing campaign',
        icon: <AtSign className="h-5 w-5" />,
        action: 'add-to-campaign'
      }
    ];

    // Partner Copilot (home) suggestions
    const partnerCopilotSuggestions: Suggestion[] = [
      {
        id: 'smart-recommendations',
        title: 'Get smart recommendations',
        description: 'Receive AI-powered recommendations for your business',
        icon: <Sparkles className="h-5 w-5" />,
        action: 'get-recommendations'
      },
      {
        id: 'summarize-metrics',
        title: 'Summarize current metrics',
        description: 'Get a quick overview of key performance indicators',
        icon: <PieChart className="h-5 w-5" />,
        action: 'summarize-metrics'
      },
      {
        id: 'upcoming-tasks',
        title: 'Show upcoming tasks',
        description: 'See what tasks need your attention',
        icon: <Bell className="h-5 w-5" />,
        action: 'show-tasks'
      }
    ];

    // Templates page suggestions
    const templateSuggestions: Suggestion[] = [
      {
        id: 'create-template',
        title: 'Create new metric template',
        description: 'Design a custom OKR template for your partners',
        icon: <Target className="h-5 w-5" />,
        action: 'create-template'
      },
      {
        id: 'tag-metrics',
        title: 'Organize metrics with tags',
        description: 'Add tags to group related metrics together',
        icon: <List className="h-5 w-5" />,
        action: 'tag-metrics'
      },
      {
        id: 'batch-assign',
        title: 'Batch assign templates',
        description: 'Assign templates to multiple partners at once',
        icon: <BadgeCheck className="h-5 w-5" />,
        action: 'batch-assign'
      }
    ];

    // Data upload suggestions
    const dataUploadSuggestions: Suggestion[] = [
      {
        id: 'brio-upload',
        title: 'Start Brio upload',
        description: 'Upload and process data from Brio format',
        icon: <Upload className="h-5 w-5" />,
        link: '/data-upload/brio'
      },
      {
        id: 'data-mapping',
        title: 'Configure data mapping',
        description: 'Set up how your data fields map to our system',
        icon: <FileSearch className="h-5 w-5" />,
        action: 'configure-mapping'
      },
      {
        id: 'schedule-import',
        title: 'Schedule regular imports',
        description: 'Set up automated data imports on a schedule',
        icon: <Bell className="h-5 w-5" />,
        action: 'schedule-import'
      }
    ];

    // Lists page suggestions
    const listSuggestions: Suggestion[] = [
      {
        id: 'create-filter',
        title: 'Create a smart filter',
        description: 'Save a custom filter for this list view',
        icon: <ListFilter className="h-5 w-5" />,
        action: 'create-filter'
      },
      {
        id: 'export-list',
        title: 'Export list data',
        description: 'Download this data in your preferred format',
        icon: <FileText className="h-5 w-5" />,
        action: 'export-list'
      },
      {
        id: 'bulk-actions',
        title: 'Perform bulk actions',
        description: 'Apply changes to multiple items at once',
        icon: <List className="h-5 w-5" />,
        action: 'bulk-actions'
      }
    ];

    // Determine which suggestions to show based on current location
    if (location.startsWith('/reports')) {
      setSuggestions([...reportSuggestions, ...defaultSuggestions]);
    } else if (location.startsWith('/campaigns')) {
      setSuggestions([...campaignSuggestions, ...defaultSuggestions]);
    } else if (location.startsWith('/lists/partners/')) {
      setSuggestions([...partnerSuggestions, ...defaultSuggestions]);
    } else if (location === '/') {
      setSuggestions([...partnerCopilotSuggestions, ...defaultSuggestions]);
    } else if (location.startsWith('/templates')) {
      setSuggestions([...templateSuggestions, ...defaultSuggestions]);
    } else if (location.startsWith('/data-upload')) {
      setSuggestions([...dataUploadSuggestions, ...defaultSuggestions]);
    } else if (location.startsWith('/lists')) {
      setSuggestions([...listSuggestions, ...defaultSuggestions]);
    } else {
      setSuggestions(defaultSuggestions);
    }
  }, [location]);

  const handleSend = () => {
    if (!userInput.trim()) return;
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);
    
    // Simulate assistant response
    setTimeout(() => {
      let response = "I'll help you with that. What specifically would you like to know about this?";
      
      if (userInput.toLowerCase().includes('campaign')) {
        response = "I can help you create a new campaign or analyze your existing campaigns. What would you like to do?";
      } else if (userInput.toLowerCase().includes('report') || userInput.toLowerCase().includes('data')) {
        response = "I can help you generate reports or analyze your data. Would you like me to create a specific report for you?";
      } else if (userInput.toLowerCase().includes('partner')) {
        response = "I can help you find insights about your partners or suggest opportunities for collaboration. What information are you looking for?";
      } else if (userInput.toLowerCase().includes('metric') || userInput.toLowerCase().includes('performance')) {
        response = "I can help you track metrics and performance indicators. Would you like to see current performance or set up new metrics?";
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 1000);
    
    // Clear input field
    setUserInput('');
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.link) {
      window.location.href = suggestion.link;
      return;
    }
    
    // Handle action-based suggestions
    if (suggestion.action) {
      // Add user message based on the suggestion
      setMessages(prev => [...prev, { 
        role: 'user', 
        content: `I want to ${suggestion.title.toLowerCase()}`
      }]);
      
      // Switch to chat tab
      setActiveTab('chat');
      
      // Simulate assistant response based on the action
      setTimeout(() => {
        let response = "I'll help you with that. Let me guide you through the process.";
        
        switch (suggestion.action) {
          case 'save-current-view':
            response = "I'll help you save this view. What would you like to name it?";
            break;
          case 'export-report':
            response = "I can export this report for you. Would you prefer Excel, CSV, or PDF format?";
            break;
          case 'show-top-performers':
            response = "I'll filter the report to show your top performers. Would you like to see top performers by revenue, engagement, or growth?";
            break;
          case 'find-opportunities':
            response = "I'll analyze this partner's portfolio to find cross-sell opportunities. This might take a moment...";
            break;
          case 'assign-template':
            response = "I can help you assign an OKR template. Which template would you like to use for this partner?";
            break;
          case 'get-recommendations':
            response = "I'm analyzing your data to provide smart recommendations. This will help improve your partner relationships and business outcomes...";
            break;
          default:
            response = "I'll help you with that. What specifically would you like to know?";
        }
        
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      }, 1000);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant={variant === 'ghost' ? 'ghost' : 'default'} 
          size="sm"
          className={`rounded-full ${variant === 'ghost' ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
        >
          <Sparkles className="mr-1.5 h-4 w-4" />
          Ask partner copilot
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] p-0 border-l">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="flex items-center text-indigo-600">
              <Sparkles className="h-5 w-5 mr-2" />
              Partner Copilot
            </SheetTitle>
          </SheetHeader>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            <TabsList className="w-full flex bg-muted/50 p-0 h-auto justify-start rounded-none border-b">
              <TabsTrigger 
                value="suggestions" 
                className="flex-1 rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-indigo-600 h-12"
              >
                <LightbulbIcon className="h-4 w-4 mr-2" />
                Suggestions
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="flex-1 rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-indigo-600 h-12"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
            </TabsList>
            
            <ScrollArea className="flex-1 p-6">
              <TabsContent value="suggestions" className="mt-0 border-0 p-0">
                <div className="space-y-1 mb-6">
                  <h3 className="text-sm font-medium text-gray-500">Based on your current page</h3>
                </div>
                
                <div className="grid gap-3">
                  {suggestions.map((suggestion) => (
                    <div 
                      key={suggestion.id}
                      className="flex items-center border rounded-lg p-4 cursor-pointer hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4">
                        {suggestion.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                        <p className="text-sm text-gray-500">{suggestion.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="chat" className="mt-0 border-0 p-0 flex-1 flex flex-col">
                <div className="space-y-4 mb-4">
                  {messages.map((message, index) => (
                    <div 
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          message.role === 'user' 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </ScrollArea>
            
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  placeholder="Message Partner Copilot..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button 
                  size="icon" 
                  onClick={handleSend}
                  disabled={!userInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PartnerCopilotSlider;