import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, Users, TrendingUp, Shield, Calendar, Clock, Building, AlertCircle, MessageSquare, Filter, Search, BarChart3 } from "lucide-react";
import CustomersPageClean from "@/pages/lists/CustomersPage";

// AI Smart List Suggestions data
const smartListSuggestions = [
  {
    id: 1,
    title: "Retirement Prospects",
    description: "Find customers approaching retirement who need pension planning",
    priority: "High",
    customerCount: 23,
    value: 1240000,
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    criteria: [
      "Age 55-65",
      "No pension coverage",
      "Income >€50k"
    ]
  },
  {
    id: 2,
    title: "Contract Renewals",
    description: "Customers with contracts ending soon",
    priority: "High",
    customerCount: 18,
    value: 890000,
    icon: Calendar,
    color: "text-red-600",
    bgColor: "bg-red-50",
    criteria: [
      "Contract expires in 3-6 months",
      "Premium >€500",
      "No renewal discussion"
    ]
  },
  {
    id: 3,
    title: "SME Health Coverage Gap",
    description: "Small companies missing group health insurance",
    priority: "Medium",
    customerCount: 15,
    value: 2100000,
    icon: Building,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    criteria: [
      "SME with 5-25 employees",
      "No group health plan",
      "Annual revenue >€500k"
    ]
  },
  {
    id: 4,
    title: "Liability Cross-sell",
    description: "Property customers without liability insurance",
    priority: "Medium",
    customerCount: 12,
    value: 650000,
    icon: Shield,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    criteria: [
      "Has property insurance",
      "No liability coverage",
      "Business type: retail/service"
    ]
  }
];

interface SmartListPreviewProps {
  list: any;
  onPreview: (list: any) => void;
  onSave: (list: any) => void;
  isActive?: boolean;
  onCardClick?: (list: any) => void;
}

function SmartListCard({ list, onPreview, onSave, isActive = false, onCardClick }: SmartListPreviewProps) {
  const Icon = list.icon;
  
  return (
    <Card 
      className={`hover:shadow-md transition-shadow border-[#E6E7F1] cursor-pointer ${
        isActive ? 'ring-2 ring-[#5567E5] bg-blue-50' : ''
      }`}
      onClick={() => onCardClick && onCardClick(list)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${list.bgColor}`}>
            <Icon className={`h-6 w-6 ${list.color}`} />
          </div>
          <Badge 
            variant={list.priority === 'High' ? 'destructive' : 'secondary'}
            className="text-xs"
          >
            {list.priority}
          </Badge>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2">{list.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{list.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{list.customerCount} customers</span>
            <span className="font-semibold text-green-600">
              €{list.value.toLocaleString()}
            </span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mb-2"
          onClick={(e) => {
            e.stopPropagation();
            onPreview(list);
          }}
        >
          Save as List
        </Button>
      </CardContent>
    </Card>
  );
}

interface SmartListPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  list: any;
  onSave: (list: any) => void;
}

function SmartListPreviewDialog({ isOpen, onClose, list, onSave }: SmartListPreviewDialogProps) {
  const [listName, setListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (list) {
      setListName(list.title);
    }
  }, [list]);

  const handleSave = async () => {
    if (!listName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a list name",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Create the smart list
      await onSave({
        name: listName,
        description: list.description,
        criteria: list.criteria,
        customerCount: list.customerCount,
        value: list.value
      });
      
      toast({
        title: "Success",
        description: "Smart list created successfully",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create smart list",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (!list) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#282A3F] flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Smart List Preview: {list.title}
          </DialogTitle>
          <DialogDescription>
            {list.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Filter Criteria:</h4>
            <ul className="space-y-1">
              {list.criteria.map((criterion: string, index: number) => (
                <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  {criterion}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Customers</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{list.customerCount}</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Potential Value</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                €{list.value.toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              List Name
            </label>
            <Input
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Enter list name..."
              className="border-[#E6E7F1]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isCreating}
            className="bg-[#5567E5] hover:bg-[#4556D4]"
          >
            {isCreating ? 'Creating...' : 'Save as Smart List'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AIPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
}

function AIPromptDialog({ isOpen, onClose, onGenerate }: AIPromptDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      await onGenerate(prompt);
      onClose();
      setPrompt('');
    } catch (error) {
      console.error('Error generating AI list:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#282A3F] flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Create with AI Prompt
          </DialogTitle>
          <DialogDescription>
            Describe what you're looking for and AI will create a smart list for you.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Describe your customer segment
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Find customers over 50 with only basic insurance who could benefit from comprehensive coverage'"
              className="w-full h-24 p-3 border border-[#E6E7F1] rounded-lg resize-none"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {isGenerating ? 'Generating...' : 'Create with AI Prompt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SmartCustomerLists() {
  const { environment } = useEnvironment();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showAIPromptDialog, setShowAIPromptDialog] = useState(false);
  const [selectedList, setSelectedList] = useState<any>(null);
  const [showFullCustomerList, setShowFullCustomerList] = useState(false);
  const [activeSmartList, setActiveSmartList] = useState<any>(null);

  // Create smart list mutation
  const createSmartListMutation = useMutation({
    mutationFn: async (listData: any) => {
      return apiRequest('POST', '/api/saved-lists', {
        entity_type: 'customers',
        name: listData.name,
        description: listData.description,
        members: [], // Smart lists start with empty members array
        isShared: false,
        partner_id: null,
        context: {
          criteria: listData.criteria,
          customer_count: listData.customerCount,
          estimated_value: listData.value,
          smart_list_type: 'ai_generated'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
      toast({
        title: "Success",
        description: "Smart list created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create smart list",
        variant: "destructive",
      });
    }
  });

  const handlePreview = (list: any) => {
    setActiveSmartList(list);
    setSelectedList(list);
    setShowPreviewDialog(true);
  };

  const handleSave = async (listData: any) => {
    await createSmartListMutation.mutateAsync(listData);
  };

  const handleAIPrompt = async (prompt: string) => {
    // Here you would typically call an AI API to generate a smart list
    // For now, we'll create a mock response
    toast({
      title: "AI Analysis Complete",
      description: "AI-generated smart list has been created",
    });
  };

  if (showFullCustomerList) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => setShowFullCustomerList(false)}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            Back to Smart Lists
          </Button>
        </div>
        <CustomersPageClean smartListFilter={activeSmartList} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Lists</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowFullCustomerList(true)}
          >
            <BarChart3 className="h-4 w-4" />
            All Customers
          </Button>
          <Button className="flex items-center gap-2 bg-[#5567E5] hover:bg-[#4556D4]">
            <Users className="h-4 w-4" />
            Create new customer
          </Button>
        </div>
      </div>

      {/* AI Smart List Suggestions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  AI Smart List Suggestions
                  <Badge variant="secondary" className="text-xs">
                    New
                  </Badge>
                </h2>
                <p className="text-sm text-gray-600">
                  AI-powered customer segments based on your data. Click to preview, then save as a list.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {smartListSuggestions.map((list) => (
              <SmartListCard
                key={list.id}
                list={list}
                onPreview={handlePreview}
                onSave={handleSave}
                isActive={activeSmartList?.id === list.id}
                onCardClick={setActiveSmartList}
              />
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Or describe what you're looking for
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowAIPromptDialog(true)}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                <Brain className="h-4 w-4 mr-2" />
                Create with AI Prompt
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Smart List Indicator */}
      {activeSmartList && (
        <Card className="bg-green-50 border-green-200 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <activeSmartList.icon className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-green-900">
                    Filtered by: {activeSmartList.title}
                  </h3>
                  <p className="text-sm text-green-700">
                    Showing {activeSmartList.customerCount} customers matching smart list criteria
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSmartList(null)}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                Clear Filter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regular Customer List */}
      <CustomersPageClean smartListFilter={activeSmartList} />

      {/* Preview Dialog */}
      <SmartListPreviewDialog
        isOpen={showPreviewDialog}
        onClose={() => setShowPreviewDialog(false)}
        list={selectedList}
        onSave={handleSave}
      />

      {/* AI Prompt Dialog */}
      <AIPromptDialog
        isOpen={showAIPromptDialog}
        onClose={() => setShowAIPromptDialog(false)}
        onGenerate={handleAIPrompt}
      />
    </div>
  );
}