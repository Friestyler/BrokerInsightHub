import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, Users, Target, Mail, Send, Settings, Edit, Sparkles, TrendingUp, Zap, Star, Heart, Gift, Megaphone, Coffee, Briefcase, Globe, Award, Rocket, Shield, Diamond, Plus, Type, Image, Quote, Minus, AlignLeft, Bold, Italic, Link, Eye, FileText, X, Heading2 as Heading, Share, DollarSign, Home, Car, Umbrella, Building, UserCheck, TrendingDown, Plane, Search, User, AlertCircle, Upload, Calendar, Clock, ChevronDown } from "lucide-react";
import { useLocation, useRoute, useParams } from 'wouter';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ImprovedEmailBuilder from './ImprovedEmailBuilder';
import RecipientSelector from '@/components/campaigns/RecipientSelector';
import CampaignSettingsWizard from '@/components/campaigns/CampaignSettingsWizard';
import ContactUploadModal from '@/components/campaigns/ContactUploadModal';
import SendScheduleButton from '@/components/campaigns/SendScheduleButton';

interface CampaignFromTemplateProps {
  params?: { templateId?: string; campaignId?: string };
}

interface AssignPartnersSectionProps {
  campaignData: any;
  onAssignComplete: () => void;
}

function AssignPartnersSection({ campaignData, onAssignComplete }: AssignPartnersSectionProps) {
  const [selectedPartnersForAssignment, setSelectedPartnersForAssignment] = useState<number[]>([]);
  const [showPartnerSelection, setShowPartnerSelection] = useState(false);
  const [itemsWithoutPartners, setItemsWithoutPartners] = useState<any[]>([]);
  const [partnersAttachedToItems, setPartnersAttachedToItems] = useState<any[]>([]);
  const { toast } = useToast();

  // Fetch all partners for selection
  const { data: allPartners = [] } = useQuery({
    queryKey: ['/api/partners'],
    enabled: showPartnerSelection
  });

  // Fetch saved partner lists
  const { data: savedPartnerLists = [] } = useQuery({
    queryKey: ['/api/saved-lists'],
    enabled: showPartnerSelection
  });

  // Analyze campaign recipients to categorize them
  useEffect(() => {
    const itemsWithPartners = [];
    const itemsWithoutPartners = [];

    campaignData.recipients.forEach((recipient: any) => {
      // Check for partner information in various fields
      const hasPartner = recipient.assigned_partner_id || 
                        recipient.partnerInfo || 
                        recipient.partnerId || 
                        recipient.partnerName ||
                        recipient.opportunityInfo?.partnerId;
      
      if (hasPartner) {
        itemsWithPartners.push(recipient);
      } else {
        itemsWithoutPartners.push(recipient);
      }
    });

    // Extract unique partners from items that have them
    const uniquePartners = new Map();
    itemsWithPartners.forEach(item => {
      // Get partner ID from various possible fields
      const partnerId = item.assigned_partner_id || 
                       item.partnerInfo?.id || 
                       item.partnerId || 
                       item.opportunityInfo?.partnerId;
      
      if (partnerId) {
        const partnerName = item.partnerName || 
                           item.partnerInfo?.name || 
                           item.opportunityInfo?.partnerName || 
                           'Unknown Partner';
        
        uniquePartners.set(partnerId, {
          id: partnerId,
          name: partnerName,
          itemCount: (uniquePartners.get(partnerId)?.itemCount || 0) + 1
        });
      }
    });

    setItemsWithoutPartners(itemsWithoutPartners);
    setPartnersAttachedToItems(Array.from(uniquePartners.values()));
  }, [campaignData.recipients]);

  const handleAssignSelected = () => {
    if (selectedPartnersForAssignment.length === 0) {
      toast({
        title: "No partners selected",
        description: "Please select at least one partner to assign the campaign to.",
        variant: "destructive"
      });
      return;
    }

    // Simulate assignment process
    toast({
      title: "Campaign assigned",
      description: `Campaign successfully assigned to ${selectedPartnersForAssignment.length} partner(s).`
    });
    
    onAssignComplete();
  };

  const totalRecipients = campaignData.recipients.length;
  const attachedRecipients = totalRecipients - itemsWithoutPartners.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Recipients</p>
              <p className="text-2xl font-bold text-gray-900">{totalRecipients}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Partners Attached</p>
              <p className="text-2xl font-bold text-green-600">{partnersAttachedToItems.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Need Assignment</p>
              <p className="text-2xl font-bold text-orange-600">{itemsWithoutPartners.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Campaign assignment area */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Share className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Assign Campaign to Partners</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Select partners to assign this campaign to. Partners will receive the campaign and can manage their own recipients.
          </p>
          
          <div className="pt-4">
            <Button 
              onClick={() => setShowPartnerSelection(true)}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Select Partners
            </Button>
          </div>
        </div>
      </div>

      {/* Partner Selection Modal */}
      <Dialog open={showPartnerSelection} onOpenChange={setShowPartnerSelection}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Partners for Campaign Assignment</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Choose partners who will receive this campaign and manage their own recipients.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Available Partners</h4>
              <div className="max-h-48 overflow-y-auto border rounded-lg p-2">
                {allPartners.map((partner: any) => (
                  <div key={partner.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                    <Checkbox
                      checked={selectedPartnersForAssignment.includes(partner.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPartnersForAssignment(prev => [...prev, partner.id]);
                        } else {
                          setSelectedPartnersForAssignment(prev => prev.filter(id => id !== partner.id));
                        }
                      }}
                    />
                    <div>
                      <p className="font-medium text-sm">{partner.name}</p>
                      <p className="text-xs text-gray-500">{partner.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline"
              onClick={() => setShowPartnerSelection(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssignSelected}
              disabled={selectedPartnersForAssignment.length === 0}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Assign Campaign ({selectedPartnersForAssignment.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CampaignFromTemplate({ params }: CampaignFromTemplateProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Extract route parameters from URL path directly using window.location
  const currentPath = window.location.pathname;
  const campaignId = currentPath.includes('/campaigns/edit/') 
    ? currentPath.split('/campaigns/edit/')[1].split('/')[0] // Handle any trailing slashes
    : currentPath.includes('/broker-view/campaigns/edit/')
    ? currentPath.split('/broker-view/campaigns/edit/')[1].split('/')[0] // Handle broker-view routes
    : params?.campaignId;
  const templateId = currentPath.includes('/campaigns/create-from-template/') 
    ? currentPath.split('/campaigns/create-from-template/')[1].split('/')[0] // Handle any trailing slashes
    : params?.templateId;
  
  // Parse URL query parameters for step and tab control
  const urlParams = new URLSearchParams(window.location.search);
  const stepParam = urlParams.get('step');
  const tabParam = urlParams.get('tab');
  
  // Map step names to step numbers
  const getStepNumber = (stepName: string | null) => {
    switch (stepName) {
      case 'recipients': return 4;
      case 'emails': return 3;
      case 'settings': return 5;
      default: return 1;
    }
  };

  const [currentStep, setCurrentStep] = useState(getStepNumber(stepParam));
  const [recipientSelectorTab, setRecipientSelectorTab] = useState<string | null>(null);
  const [showSettingsWizard, setShowSettingsWizard] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactData, setNewContactData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    customer_id: null
  });

  // Track if this is initial load to prevent URL conflicts with manual navigation
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeEmailIndex, setActiveEmailIndex] = useState(0);
  const [sharePartnersDialogOpen, setSharePartnersDialogOpen] = useState(false);
  const [selectedPartnersForSharing, setSelectedPartnersForSharing] = useState<number[]>([]);
  const [suggestionsCollapsed, setSuggestionsCollapsed] = useState(false);
  const [showContactUploadModal, setShowContactUploadModal] = useState(false);
  
  // Determine the mode: editing existing campaign, new campaign, or template-based campaign
  const isEditingCampaign = !!campaignId;
  const isNewCampaign = !templateId && !campaignId;
  const isFromTemplate = !!templateId && !campaignId;
  
  const [campaignData, setCampaignData] = useState({
    name: '',
    entity: '',
    description: '',
    objective: '',
    icon: 'target',
    color: '#3B82F6',
    emails: [{ 
      id: 'default', 
      subject: '', 
      body: '', 
      blocks: [] 
    }],
    recipients: [],
    settings: {
      sender_name: '',
      sender_email: '',
      reply_to: '',
      email_sending_type: 'default_email'
    },
    scheduled_date: null,
    attachment_type: 'individual',
    selected_partners: [],
    target_entity_type: 'opportunities',
    entity_mapped_to: 'opportunities'
  });

  // Step completion logic
  const isStepCompleted = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1: return campaignData.entity && campaignData.name;
      case 2: return campaignData.objective && campaignData.icon;
      case 3: return campaignData.emails.some(email => email.subject && email.body);
      case 4: return campaignData.recipients.length > 0;
      case 5: return campaignData.settings.sender_name && campaignData.settings.sender_email;
      case 6: return campaignData.recipients.some((r: any) => r.email);
      default: return false;
    }
  };

  const isStepAccessible = (stepNum: number): boolean => {
    // In edit mode or when using a template, make all steps accessible up to the current + 1
    if (isEditingCampaign || isFromTemplate) {
      // For editing campaigns and templates, allow navigation to all steps that are completed or within reasonable bounds
      if (stepNum === 1) return true;
      if (stepNum === 2) return isStepCompleted(1);
      if (stepNum === 3) return isStepCompleted(2);
      if (stepNum === 4) return isStepCompleted(3);
      if (stepNum === 5) return isStepCompleted(4);
      if (stepNum === 6) return isStepCompleted(5);
      if (stepNum === 7) return isStepCompleted(6);
      return false;
    }
    
    // For new campaigns, follow strict progression
    if (stepNum === 1) return true;
    if (stepNum === 2) return isStepCompleted(1);
    if (stepNum === 3) return isStepCompleted(2);
    if (stepNum === 4) return isStepCompleted(3);
    if (stepNum === 5) return isStepCompleted(4);
    if (stepNum === 6) return isStepCompleted(5);
    if (stepNum === 7) return isStepCompleted(6);
    return false;
  };

  const canSave = (): boolean => {
    return isStepCompleted(1) && isStepCompleted(2) && isStepCompleted(3) && isStepCompleted(4) && isStepCompleted(5);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Campaign Details</h2>
              <p className="text-gray-600">Set up your campaign name and target group</p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                <Input 
                  value={campaignData.name}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter campaign name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Group</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setCampaignData(prev => ({ ...prev, entity: 'opportunities' }))}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      campaignData.entity === 'opportunities' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Target className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-medium text-gray-900">Opportunities</h3>
                    <p className="text-sm text-gray-600">Target specific business opportunities</p>
                  </div>
                  
                  <div
                    onClick={() => setCampaignData(prev => ({ ...prev, entity: 'customers' }))}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      campaignData.entity === 'customers' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Users className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-medium text-gray-900">Customers</h3>
                    <p className="text-sm text-gray-600">Target existing customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Contact & Partner Attachment</h2>
              <p className="text-gray-600">Manage contact assignments to partners for effective campaign distribution</p>
            </div>

            <div className="max-w-7xl mx-auto">
              <ContactPartnerAttachmentInterface 
                campaignData={campaignData} 
                onAttachmentsChange={(updatedRecipients) => {
                  setCampaignData(prev => ({ ...prev, recipients: updatedRecipients }));
                }}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Step {currentStep} content not implemented yet</p>
          </div>
        );
    }
  };

  // Add this loading state while queries are pending
  const templateLoading = false;
  const campaignLoading = false;

  if (templateLoading || campaignLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {templateLoading ? "Loading template..." : "Loading campaign..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/campaigns')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Campaigns
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-semibold text-gray-900">
              {isEditingCampaign 
                ? `Edit Campaign: ${campaignData.name || 'Untitled'}` 
                : isFromTemplate 
                ? 'Create Campaign from Template' 
                : 'Create New Campaign'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Save button - only show when campaign can be saved */}
            {canSave() && (
              <Button variant="outline" size="sm">
                Save
              </Button>
            )}
            
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(Math.min(7, currentStep + 1))}
                disabled={currentStep === 7 || !isStepAccessible(currentStep + 1)}
                className="gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Step Progress */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {[
            { num: 1, title: 'Target Group', icon: Target },
            { num: 2, title: 'Campaign Details', icon: Edit },
            { num: 3, title: 'Email Builder', icon: Mail },
            { num: 4, title: 'Recipients', icon: Users },
            { num: 5, title: 'Settings', icon: Settings },
            { num: 6, title: 'Drafts & Send', icon: Send },
            { num: 7, title: 'Attachment', icon: Share }
          ].map((step, index) => {
            const isActive = currentStep === step.num;
            const isCompleted = isStepCompleted(step.num);
            const isAccessible = isStepAccessible(step.num);
            const StepIcon = step.icon;

            return (
              <div key={step.num} className="flex items-center">
                <button
                  onClick={() => isAccessible && setCurrentStep(step.num)}
                  disabled={!isAccessible}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : isCompleted 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : isAccessible 
                      ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : isCompleted 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {isCompleted ? <Check className="h-3 w-3" /> : <StepIcon className="h-3 w-3" />}
                  </div>
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
                {index < 6 && <div className="w-8 h-px bg-gray-300 mx-2" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        {renderStepContent()}
      </div>
    </div>
  );
}