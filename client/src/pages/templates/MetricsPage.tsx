import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Info, Calendar, Users, Target, ChevronDown, ChevronRight, Eye } from "lucide-react";
import type { Tag, InsertTag, OKRTemplate, InsertOKRTemplate } from "@shared/schema";

// Mock data for development
const mockOKRTemplates: OKRTemplate[] = [
  {
    id: 1,
    name: "Revenue Growth",
    description: "Track quarterly revenue targets",
    okrType: "currency",
    category: "Sales",
    tags: ["revenue", "growth"],
    target: 100000,
    targetLabel: "Revenue Target",
    realizedLabel: "Current Revenue",
    enableProgressBar: true,
    enableTrafficLights: true,
    trafficLightStyle: "system",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    name: "Customer Satisfaction",
    description: "Monitor customer satisfaction scores",
    okrType: "percent",
    category: "Support",
    tags: ["satisfaction", "customers"],
    target: 85,
    targetLabel: "Satisfaction Target",
    realizedLabel: "Current Score",
    enableProgressBar: true,
    enableTrafficLights: true,
    trafficLightStyle: "system",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function MetricsPageFixed() {
  const [isCreateOKROpen, setIsCreateOKROpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    okrType: '',
    category: '',
    tags: [] as string[],
    target: 0,
    targetLabel: 'Target',
    realizedLabel: 'Realized',
    enableProgressBar: true,
    enableTrafficLights: false,
    trafficLightStyle: 'system',
    showAdvancedSettings: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tags from API
  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ['/api/tags'],
    queryFn: () => fetch('/api/tags').then(res => res.json()),
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      okrType: '',
      category: '',
      tags: [],
      target: 0,
      targetLabel: 'Target',
      realizedLabel: 'Realized',
      enableProgressBar: true,
      enableTrafficLights: false,
      trafficLightStyle: 'system',
      showAdvancedSettings: false
    });
    setIsCreateOKROpen(false);
  };

  const handleCreateOKR = async () => {
    if (!formData.name || !formData.okrType) {
      toast({
        title: "Missing required fields",
        description: "Please fill in the name and OKR type",
        variant: "destructive",
      });
      return;
    }

    // For now, just show success message
    toast({
      title: "OKR Template Created",
      description: `${formData.name} has been created successfully`,
    });
    
    resetForm();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">OKR Templates</h1>
          <p className="text-gray-600 mt-1">Manage and create OKR templates for your organization</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsCreateOKROpen(true)}
        >
          Create OKR Template
        </Button>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {mockOKRTemplates.map((template) => (
          <div key={template.id} className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                <p className="text-gray-600 text-sm">{template.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{template.okrType}</Badge>
                  <Badge variant="outline">{template.category}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create OKR Dialog */}
      <Dialog open={isCreateOKROpen} onOpenChange={setIsCreateOKROpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create OKR Template</DialogTitle>
            <DialogDescription>
              Create a new OKR template that can be assigned to partners, opportunities, and customers
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* OKR Type Selection */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-900">
                OKR Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { value: 'currency', icon: '💰', title: 'Currency', example: '€1,000' },
                  { value: 'percent', icon: '📊', title: 'Percentage', example: '75%' },
                  { value: 'number', icon: '🔢', title: 'Number', example: '50#' },
                  { value: 'checkbox', icon: '✅', title: 'Checkbox', example: 'Done/Not Done' },
                  { value: 'traffic-light', icon: '🚦', title: 'Traffic Light', example: 'Red/Green' }
                ].map((type) => (
                  <div 
                    key={type.value}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.okrType === type.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({
                      ...prev, 
                      okrType: type.value,
                      enableTrafficLights: type.value === 'traffic-light',
                      trafficLightStyle: type.value === 'traffic-light' ? 'manual' : 'system'
                    }))}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="text-sm font-medium">{type.title}</div>
                    <div className="text-xs text-gray-500">{type.example}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="text-sm font-medium text-gray-900">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input 
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder="e.g., Increase Annual Revenue"
                  className="mt-1"
                />
              </div>

              <div>
                <label htmlFor="description" className="text-sm font-medium text-gray-900">
                  Description
                </label>
                <Input 
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Brief description of this OKR template"
                  className="mt-1"
                />
              </div>

              <div>
                <label htmlFor="category" className="text-sm font-medium text-gray-900">
                  Category
                </label>
                <Input 
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                  placeholder="e.g., Sales, Marketing, Operations"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Target Configuration - Only for non-traffic-light types */}
            {formData.okrType && formData.okrType !== 'traffic-light' && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900">Target Configuration</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="target" className="text-sm font-medium text-gray-700">
                      Default Target
                    </label>
                    <Input 
                      id="target"
                      type="number"
                      value={formData.target}
                      onChange={(e) => setFormData(prev => ({...prev, target: parseFloat(e.target.value) || 0}))}
                      placeholder="Optional"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label htmlFor="targetLabel" className="text-sm font-medium text-gray-700">
                      Target Label
                    </label>
                    <Input 
                      id="targetLabel"
                      value={formData.targetLabel}
                      onChange={(e) => setFormData(prev => ({...prev, targetLabel: e.target.value}))}
                      placeholder="Target"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Progress Visualization */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900">Progress Visualization</h4>
              
              {/* Progress Bar Toggle */}
              {formData.okrType !== 'traffic-light' && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Progress Bar</div>
                    <div className="text-xs text-gray-500">Visual progress indicator</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.enableProgressBar}
                    onChange={(e) => setFormData(prev => ({...prev, enableProgressBar: e.target.checked}))}
                    className="h-4 w-4 text-blue-600"
                  />
                </div>
              )}

              {/* Traffic Lights */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Traffic Light Status</div>
                  <div className="text-xs text-gray-500">
                    {formData.okrType === 'traffic-light' 
                      ? 'Automatically enabled with manual control for qualitative tracking'
                      : 'Color-coded status indicators'
                    }
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enableTrafficLights}
                  disabled={formData.okrType === 'traffic-light'}
                  onChange={(e) => setFormData(prev => ({...prev, enableTrafficLights: e.target.checked}))}
                  className="h-4 w-4 text-blue-600"
                />
              </div>

              {/* Traffic Light Configuration */}
              {formData.enableTrafficLights && formData.okrType !== 'traffic-light' && (
                <div className="ml-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="traffic-system"
                      name="trafficLightStyle"
                      value="system"
                      checked={formData.trafficLightStyle === 'system'}
                      onChange={() => setFormData(prev => ({...prev, trafficLightStyle: 'system'}))}
                      className="h-3 w-3 text-blue-600"
                    />
                    <label htmlFor="traffic-system" className="text-xs">
                      System thresholds (Red &lt;50%, Yellow 50-74%, Green ≥75%)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="traffic-manual"
                      name="trafficLightStyle"
                      value="manual"
                      checked={formData.trafficLightStyle === 'manual'}
                      onChange={() => setFormData(prev => ({...prev, trafficLightStyle: 'manual'}))}
                      className="h-3 w-3 text-blue-600"
                    />
                    <label htmlFor="traffic-manual" className="text-xs">
                      Manual control (Users set status manually)
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-6 border-t">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleCreateOKR} className="bg-blue-600 hover:bg-blue-700">
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}