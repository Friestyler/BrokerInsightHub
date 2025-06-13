import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { useQuery } from "@tanstack/react-query";
import { 
  Send, 
  Users, 
  Sparkles, 
  Plus, 
  Home as HomeIcon, 
  PlusCircle as PlusCircleIcon, 
  Heart as HeartIcon,
  FileUp,
  Cloud,
  Database,
  RefreshCw,
  X,
  FileText,
  Share2,
  Check,
  Mail
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { useToast } from "@/hooks/use-toast";


type Campaign = {
  id: number;
  name: string;
  type: string;
  category: string;
  status: string;
  createdById: number | null;
  isShared: boolean;
  isTemplate: boolean;
  tags: string[];
  sponsorId: number | null;
  createdAt: string;
};

type TemplateCard = {
  id: string;
  name: string;
  category: string;
  description?: string;
  isSponsored: boolean;
  sponsor?: string;
  icon: React.ReactNode;
};

export default function CampaignsPage() {
  const [, setLocation] = useLocation();
  const { environment } = useEnvironment();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState("popular");
  const [activeTab, setActiveTab] = useState("new");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Campaign | null>(null);
  const [shareMode, setShareMode] = useState<'internal' | 'external'>('internal');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);

  // Read tab from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['my', 'shared', 'templates', 'new'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);


  // Fetch campaigns
  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
    enabled: true,
  });

  // Fetch campaign templates separately
  const { data: userTemplates, isLoading: isLoadingTemplates } = useQuery<Campaign[]>({
    queryKey: ['/api/campaign-templates'],
    enabled: true,
  });

  // Fetch users for both internal and external sharing (partner users appear in external)
  const { data: users } = useQuery<any[]>({
    queryKey: ['/api/users'],
    enabled: shareDialogOpen,
  });

  // Fetch contacts for external sharing
  const { data: contacts } = useQuery<any[]>({
    queryKey: ['/api/contacts'],
    enabled: shareDialogOpen && shareMode === 'external',
  });

  // Fetch customers for external sharing
  const { data: customers } = useQuery<any[]>({
    queryKey: ['/api/customers'],
    enabled: shareDialogOpen && shareMode === 'external',
  });

  // Fetch partners for external sharing
  const { data: partners } = useQuery<any[]>({
    queryKey: ['/api/partners'],
    enabled: shareDialogOpen && shareMode === 'external',
  });

  // Fetch existing shares for the template
  const { data: existingShares, refetch: refetchShares } = useQuery<any[]>({
    queryKey: ['/api/campaign-templates', selectedTemplate?.id, 'shares'],
    queryFn: async () => {
      if (!selectedTemplate?.id) return [];
      const envId = environment?.id || environment || 'degoudse';
      const response = await fetch(`/api/${envId}/campaign-templates/${selectedTemplate.id}/shares`);
      if (!response.ok) throw new Error('Failed to fetch shares');
      return response.json();
    },
    enabled: shareDialogOpen && !!selectedTemplate?.id,
  });

  // Filter campaigns based on ownership and sharing
  const myCampaigns = campaigns?.filter(c => !c.isTemplate && !c.isShared) || [];
  const sharedCampaigns = campaigns?.filter(c => !c.isTemplate && c.isShared) || [];
  const campaignTemplates = userTemplates || [];

  // Demo campaign templates
  const templates: TemplateCard[] = [
    // Mortgage Campaigns
    {
      id: "hvl-mortgage",
      name: "HVL – Hypotheek & Verduurzamingslening",
      description: "Voor campagnes waarbij een verduurzamingslening of energiebespaarlening gekoppeld wordt aan een (nieuwe of bestaande) hypotheek.",
      category: "Mortgages",
      isSponsored: true,
      sponsor: "Rabobank",
      icon: <HomeIcon className="h-8 w-8 text-green-500" />
    },
    {
      id: "hvl24-mortgage",
      name: "HVL24 – Hypotheek & Verduurzaming Lening, 2025-actie",
      category: "Mortgages",
      isSponsored: false,
      icon: <HomeIcon className="h-8 w-8 text-indigo-500" />
    },
    {
      id: "xsell-mortgage",
      name: "XSELL+ – Cross- en Upsell Aanvullende Producten",
      category: "Mortgages",
      isSponsored: true,
      sponsor: "Rabobank",
      icon: <PlusCircleIcon className="h-8 w-8 text-green-500" />
    },
    {
      id: "life360-mortgage",
      name: "LIFE360 – Levensmomenten Proactief Benaderingsplan",
      category: "Mortgages",
      isSponsored: false,
      icon: <HeartIcon className="h-8 w-8 text-indigo-500" />
    },
    // Regular Campaigns
    {
      id: "life-pension",
      name: "Life + Pension",
      category: "Cross-Sell",
      isSponsored: false,
      icon: <Send className="h-8 w-8 text-indigo-500" />
    },
    {
      id: "car-legal",
      name: "Car + Legal",
      category: "Cross-Sell",
      isSponsored: true,
      sponsor: "Arag",
      icon: <Send className="h-8 w-8 text-indigo-500" />
    },
    {
      id: "fire-theft",
      name: "Fire + Theft",
      category: "Cross-Sell",
      isSponsored: false,
      icon: <Send className="h-8 w-8 text-indigo-500" />
    },
    {
      id: "hospi-dental",
      name: "Hospi + Dental",
      category: "Cross-Sell",
      isSponsored: false,
      icon: <Send className="h-8 w-8 text-indigo-500" />
    },
    {
      id: "personal-liability-pets",
      name: "Personal Liability + Pets",
      category: "Cross-Sell",
      isSponsored: false,
      icon: <Send className="h-8 w-8 text-indigo-500" />
    },
    {
      id: "axa-life-pension",
      name: "AXA Life & Pension",
      category: "Cross-Sell",
      isSponsored: true,
      sponsor: "AXA",
      icon: <Sparkles className="h-8 w-8 text-yellow-500" />
    }
  ];

  // Filter templates
  const getFilteredTemplates = () => {
    switch (activeFilter) {
      case "popular":
        // Popular includes Mortgages that are sponsored and some cross-sell campaigns
        return templates.filter(t => 
          (t.category === "Mortgages" && t.isSponsored) || 
          (t.category === "Cross-Sell" && t.id !== "personal-liability-pets") || 
          t.id === "hvl-mortgage" || 
          t.id === "xsell-mortgage"
        );
      case "mortgages":
        return templates.filter(t => t.category === "Mortgages");
      case "partner":
        return templates.filter(t => t.isSponsored);
      case "cross-sell":
        return templates.filter(t => t.category === "Cross-Sell");
      case "upsell":
        return templates.filter(t => t.category === "Upsell");
      default:
        return templates;
    }
  };

  // Start new campaign
  const startNewCampaign = (templateId?: string) => {
    if (templateId) {
      setLocation(`/campaigns/create?template=${templateId}`);
    } else {
      setLocation("/campaigns/create");
    }
  };

  // Start from template - navigate to template selection
  const startFromTemplate = () => {
    setLocation("/campaigns/templates");
  };

  // Open share dialog
  const openShareDialog = (template: Campaign) => {
    setSelectedTemplate(template);
    setShareDialogOpen(true);
    setSelectedUsers([]);
    setSelectedContacts([]);
  };

  // Handle share submission
  const handleShare = async () => {
    if (!selectedTemplate) return;
    
    try {
      const shareData = {
        templateId: selectedTemplate.id,
        shareMode,
        userIds: shareMode === 'internal' ? selectedUsers : [],
        contactIds: shareMode === 'external' ? selectedContacts : []
      };
      
      const envId = environment?.id || environment || 'degoudse';
      const response = await fetch(`/api/${envId}/campaign-templates/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to share template');
      }
      
      const recipientCount = shareMode === 'internal' ? selectedUsers.length : selectedContacts.length;
      const recipientType = shareMode === 'internal' ? 'team member' : 'external party';
      const recipientText = recipientCount === 1 ? recipientType : `${recipientType.replace('party', 'parties')}s`;
      
      toast({
        title: "Template Shared Successfully",
        description: `"${selectedTemplate.name}" has been shared with ${recipientCount} ${recipientText}.`,
        duration: 4000,
      });
      
      // Refresh the shares list
      refetchShares();
      
      setShareDialogOpen(false);
      setSelectedTemplate(null);
      setSelectedUsers([]);
      setSelectedContacts([]);
    } catch (error) {
      toast({
        title: "Sharing Failed",
        description: "Unable to share the template. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  // Handle unshare
  const handleUnshare = async (shareId: number) => {
    if (!selectedTemplate) return;
    
    try {
      const envId = environment?.id || environment || 'degoudse';
      const response = await fetch(`/api/${envId}/campaign-templates/${selectedTemplate.id}/shares/${shareId}`, {
        method: 'DELETE',
        headers: {
          'x-environment-id': envId.toString(),
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove share');
      }
      
      toast({
        title: "Access Removed",
        description: "Share has been successfully removed.",
        duration: 4000,
      });
      
      // Refresh the shares list
      refetchShares();
    } catch (error) {
      console.error('Error removing share:', error);
      toast({
        title: "Failed to Remove Access",
        description: "Unable to remove the share. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  // Group external parties - only contacts, users, and guests with partner relationships
  const getGroupedContacts = () => {
    const grouped: { [key: string]: any[] } = {};
    
    // Only show partners and their related contacts/users/guests
    if (partners) {
      const partnerList = partners
        .filter(p => p.name)
        .map(partner => ({
          ...partner,
          type: 'partner',
          hasRelatedParties: (
            contacts?.some(contact => contact.partner_id === partner.id) ||
            users?.some(user => user.partnerId === partner.id)
          )
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      partnerList.forEach(partner => {
        const relatedParties = [];
        
        // Add partner contacts
        const partnerContacts = contacts
          ?.filter(contact => contact.partner_id === partner.id)
          ?.map(contact => ({
            ...contact,
            name: contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
            type: 'contact',
            parentType: 'partner',
            parentId: partner.id,
            parentName: partner.name
          }))
          ?.filter(contact => contact.name)
          ?.sort((a, b) => a.name.localeCompare(b.name));
          
        if (partnerContacts && partnerContacts.length > 0) {
          relatedParties.push(...partnerContacts);
        }
        
        // Add partner users (guests)
        const partnerUsers = users
          ?.filter(user => user.partnerId === partner.id)
          ?.map(user => ({
            ...user,
            name: user.name || user.username,
            type: 'user',
            parentType: 'partner',
            parentId: partner.id,
            parentName: partner.name
          }))
          ?.filter(user => user.name)
          ?.sort((a, b) => a.name.localeCompare(b.name));
          
        if (partnerUsers && partnerUsers.length > 0) {
          relatedParties.push(...partnerUsers);
        }
        
        // Only add partner section if it has related parties
        if (relatedParties.length > 0) {
          grouped[`${partner.name} - External Parties`] = relatedParties;
        }
      });
    }
    
    return grouped;
  };

  const renderCampaignCard = (campaign: Campaign) => (
    <Card key={campaign.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium flex justify-between">
          {campaign.name}
          <Badge
            variant={campaign.status === "active" ? "default" : "secondary"}
            className="ml-2"
          >
            {campaign.status}
          </Badge>
        </CardTitle>
        <CardDescription className="text-xs">{campaign.category}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-600">
          {campaign.type === "cross_sell" ? "Cross-Sell" : campaign.type === "upsell" ? "Upsell" : "Custom"}
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-0"
          onClick={() => setLocation(`/campaigns/${campaign.id}`)}
        >
          View details
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Campaigns</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my">My Campaigns</TabsTrigger>
          <TabsTrigger value="shared">Shared Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="new">New Campaign</TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Campaigns</h2>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700" 
              onClick={() => startNewCampaign()}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>

          {isLoadingCampaigns ? (
            <div className="text-center py-12">Loading campaigns...</div>
          ) : myCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCampaigns.map(campaign => renderCampaignCard(campaign))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <Send className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new campaign.</p>
              <div className="mt-6">
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700" 
                  onClick={() => startNewCampaign()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Shared Campaigns</h2>
          </div>

          {isLoadingCampaigns ? (
            <div className="text-center py-12">Loading shared campaigns...</div>
          ) : sharedCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sharedCampaigns.map(campaign => renderCampaignCard(campaign))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No shared campaigns</h3>
              <p className="mt-1 text-sm text-gray-500">Campaigns shared with you will appear here.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Campaign Templates</h2>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setLocation("/campaigns/template/create")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-6">Creating templates helps your brokers send campaigns faster and more effectively. With ready-made content that's compliant and on-brand, brokers can focus on reaching their clients instead of writing from scratch.</p>

          {isLoadingTemplates ? (
            <Card className="text-center py-12">
              <CardContent>
                Loading templates...
              </CardContent>
            </Card>
          ) : campaignTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaignTemplates.map(template => (
                <Card key={template.id} className="group hover:shadow-xl hover:shadow-black/5 transition-all duration-300 border border-gray-200/40 bg-white/80 backdrop-blur-sm hover:-translate-y-1 hover:border-indigo-200/60">
                  <CardHeader className="pb-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {template.name}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border-purple-200/50 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        Template
                      </Badge>
                    </div>
                    <CardDescription className="text-sm text-gray-500 leading-relaxed">{template.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                      <p className="text-sm font-medium text-gray-700">
                        {template.type === "cross_sell" ? "Cross-Sell" : template.type === "upsell" ? "Upsell" : "Custom"}
                      </p>
                    </div>
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs px-2 py-1 rounded-md border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs px-2 py-1 rounded-md border-gray-200 text-gray-600">
                            +{template.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 border-t border-gray-100/50 bg-gray-50/30 rounded-b-lg flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg font-medium flex-1 transition-all duration-200"
                      onClick={() => startNewCampaign(template.id.toString())}
                    >
                      Use Template
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium flex-1 transition-all duration-200"
                      onClick={() => setLocation(`/campaigns/template-builder?template=${template.id}`)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg font-medium transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        openShareDialog(template);
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-16 border border-gray-200/40 bg-gradient-to-br from-gray-50/50 to-white backdrop-blur-sm">
              <CardContent className="pt-6 space-y-6">
                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-indigo-400" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-xl font-semibold text-gray-900">No templates yet</CardTitle>
                  <CardDescription className="text-base text-gray-500 max-w-md mx-auto leading-relaxed">
                    Create your first campaign template to streamline future campaigns and maintain brand consistency.
                  </CardDescription>
                </div>
                <Button 
                  className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => setLocation("/campaigns/template-builder")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <div>
            <Card className="p-8 border border-gray-200/40 bg-gradient-to-br from-gray-50/50 to-white backdrop-blur-sm mb-6">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button 
                    size="lg"
                    variant="outline" 
                    className="border-2 border-dashed border-gray-200 hover:border-[#5567E5] hover:bg-[#5567E5]/10 text-gray-600 hover:text-[#5567E5] px-8 py-3 rounded-xl font-medium transition-all duration-200 min-w-[200px]"
                    onClick={() => startNewCampaign()}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Start from Scratch
                  </Button>
                  <Button 
                    size="lg"
                    className="bg-[#5567E5] hover:bg-[#4456D4] text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 min-w-[200px]"
                    onClick={() => startFromTemplate()}
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Start from Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-xl font-semibold mb-4">Do what works and try out some of our predesigned campaigns</h2>
            
            <Card className="p-4 mb-6 border border-gray-200/40 bg-white/60 backdrop-blur-sm shadow-sm">
              <CardContent className="p-0">
                <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
                  <Badge
                    variant={activeFilter === "popular" ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap ${
                      activeFilter === "popular" 
                        ? "bg-[#5567E5] hover:bg-[#4456D4] text-white shadow-lg hover:shadow-xl" 
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveFilter("popular")}
                  >
                    Most Popular
                  </Badge>
                  <Badge
                    variant={activeFilter === "mortgages" ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap ${
                      activeFilter === "mortgages" 
                        ? "bg-[#5567E5] hover:bg-[#4456D4] text-white shadow-lg hover:shadow-xl" 
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveFilter("mortgages")}
                  >
                    Mortgages
                  </Badge>
                  <Badge
                    variant={activeFilter === "partner" ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap ${
                      activeFilter === "partner" 
                        ? "bg-[#5567E5] hover:bg-[#4456D4] text-white shadow-lg hover:shadow-xl" 
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveFilter("partner")}
                  >
                    By Partner
                  </Badge>
                  <Badge
                    variant={activeFilter === "cross-sell" ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap ${
                      activeFilter === "cross-sell" 
                        ? "bg-[#5567E5] hover:bg-[#4456D4] text-white shadow-lg hover:shadow-xl" 
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveFilter("cross-sell")}
                  >
                    Cross-Sell
                  </Badge>
                  <Badge
                    variant={activeFilter === "upsell" ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap ${
                      activeFilter === "upsell" 
                        ? "bg-[#5567E5] hover:bg-[#4456D4] text-white shadow-lg hover:shadow-xl" 
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveFilter("upsell")}
                  >
                    Upsell
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {getFilteredTemplates().map(template => (
                <Card 
                  key={template.id} 
                  className="group hover:shadow-xl hover:shadow-black/5 transition-all duration-300 cursor-pointer border border-gray-200/40 bg-white/80 backdrop-blur-sm hover:-translate-y-1 hover:border-indigo-200/60"
                  onClick={() => startNewCampaign(template.id)}
                >
                  <CardHeader className="pb-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 group-hover:from-indigo-100 group-hover:to-purple-100 transition-colors">
                        {template.icon}
                      </div>
                      {template.isSponsored && (
                        <Badge 
                          variant="outline" 
                          className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${
                            template.sponsor === "Rabobank" || template.sponsor === "Arag"
                              ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700"
                              : "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700"
                          }`}
                        >
                          {template.sponsor === "Rabobank" || template.sponsor === "Arag" ? "Created for you" : "Sponsored"}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {template.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500 leading-relaxed">
                        {template.isSponsored ? `By ${template.sponsor}` : template.category}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full border-0 bg-[#5567E5]/10 text-[#5567E5] hover:bg-[#5567E5]/20 hover:text-[#4456D4] font-medium py-2.5 rounded-lg transition-all duration-200"
                    >
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>


          </div>
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-6">
          <Card className="p-8 border border-gray-200/40 bg-gradient-to-br from-gray-50/30 to-white backdrop-blur-sm">
            <CardHeader className="px-0 pt-0 pb-6">
              <CardTitle className="text-2xl font-semibold text-gray-900">Import your data to create targeted campaigns</CardTitle>
              <CardDescription className="text-base text-gray-600 leading-relaxed">
                Choose your data source to get started with intelligent campaign creation
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card 
                  className="group hover:shadow-xl hover:shadow-black/5 transition-all duration-300 cursor-pointer border border-gray-200/40 bg-white/80 backdrop-blur-sm hover:-translate-y-1 hover:border-indigo-200/60"
                  onClick={() => setLocation("/campaigns/upload/brio/step1")}
                >
                  <CardHeader className="pb-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center group-hover:from-indigo-100 group-hover:to-indigo-200 transition-colors">
                        <FileUp className="h-7 w-7 text-indigo-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">Upload from Brio</CardTitle>
                      <CardDescription className="text-sm text-gray-500 leading-relaxed">
                        Import your customer data directly from Brio
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <Button 
                      className="w-full bg-[#5567E5] hover:bg-[#4456D4] text-white py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Start Import
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card 
                  className="group hover:shadow-xl hover:shadow-black/5 transition-all duration-300 cursor-pointer border border-gray-200/40 bg-white/80 backdrop-blur-sm hover:-translate-y-1 hover:border-blue-200/60"
                >
                  <CardHeader className="pb-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                        <Cloud className="h-7 w-7 text-blue-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Upload from Broker Cloud</CardTitle>
                      <CardDescription className="text-sm text-gray-500 leading-relaxed">
                        Import data from your Broker Cloud account
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full border-0 bg-[#5567E5]/10 text-[#5567E5] hover:bg-[#5567E5]/20 hover:text-[#4456D4] py-2.5 rounded-lg font-medium transition-all duration-200"
                    >
                      Connect
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card 
                  className="group hover:shadow-xl hover:shadow-black/5 transition-all duration-300 cursor-pointer border border-gray-200/40 bg-white/80 backdrop-blur-sm hover:-translate-y-1 hover:border-green-200/60"
                >
                  <CardHeader className="pb-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center group-hover:from-green-100 group-hover:to-green-200 transition-colors">
                        <Database className="h-7 w-7 text-green-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Upload from other CRM or portal</CardTitle>
                      <CardDescription className="text-sm text-gray-500 leading-relaxed">
                        Import from any other third-party system
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full border-0 bg-[#5567E5]/10 text-[#5567E5] hover:bg-[#5567E5]/20 hover:text-[#4456D4] py-2.5 rounded-lg font-medium transition-all duration-200"
                    >
                      Select Source
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card 
                  className="group hover:shadow-xl hover:shadow-black/5 transition-all duration-300 cursor-pointer border border-gray-200/40 bg-white/80 backdrop-blur-sm hover:-translate-y-1 hover:border-purple-200/60"
                >
                  <CardHeader className="pb-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center group-hover:from-purple-100 group-hover:to-purple-200 transition-colors">
                        <RefreshCw className="h-7 w-7 text-purple-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Sync with your CRM</CardTitle>
                      <CardDescription className="text-sm text-gray-500 leading-relaxed">
                        Set up automatic data synchronization
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full border-0 bg-[#5567E5]/10 text-[#5567E5] hover:bg-[#5567E5]/20 hover:text-[#4456D4] py-2.5 rounded-lg font-medium transition-all duration-200"
                    >
                      Set Up Sync
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Share Template Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#282A3F]">Share Template: {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Existing Shares Section - Google Docs Style */}
            {existingShares && existingShares.length > 0 && (
              <>
                <div className="space-y-3">
                  <Label className="text-[#282A3F] font-medium">People with access</Label>
                  <div className="space-y-2">
                    {existingShares.map((share) => (
                      <div key={share.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {share.contactName?.charAt(0).toUpperCase() || share.userName?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#282A3F]">
                              {share.contactName || share.userName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {share.contactEmail || share.userEmail} • {share.shareType === 'external' ? 'External' : 'Internal'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Can view
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnshare(share.id)}
                            className="text-gray-400 hover:text-red-500 h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Share Mode Selection */}
            <div className="space-y-3">
              <Label className="text-[#282A3F] font-medium">Add people</Label>
              <RadioGroup value={shareMode} onValueChange={(value: 'internal' | 'external') => setShareMode(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="internal" id="internal" />
                  <Label htmlFor="internal" className="text-sm font-medium text-[#282A3F] cursor-pointer">
                    Internal Team Members
                  </Label>
                </div>
                <p className="text-xs text-gray-500 ml-6">Platform users who are not guests or partners</p>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="external" id="external" />
                  <Label htmlFor="external" className="text-sm font-medium text-[#282A3F] cursor-pointer">
                    External Parties
                  </Label>
                </div>
                <p className="text-xs text-gray-500 ml-6">Partner-related contacts, users, and guests only</p>
              </RadioGroup>
            </div>

            <Separator />

            {/* Internal Users Selection */}
            {shareMode === 'internal' && (
              <div className="space-y-3">
                <Label className="text-[#282A3F] font-medium">Select Team Members:</Label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {users?.map((user) => (
                    <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                      />
                      <span className="text-sm text-[#282A3F]">{user.name || user.username}</span>
                      <span className="text-xs text-gray-500">({user.email})</span>
                    </label>
                  ))}
                  {!users || users.length === 0 && (
                    <p className="text-sm text-gray-500">No team members found</p>
                  )}
                </div>
              </div>
            )}

            {/* External Contacts Selection */}
            {shareMode === 'external' && (
              <div className="space-y-3">
                <Label className="text-[#282A3F] font-medium">Select Recipients:</Label>
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {Object.entries(getGroupedContacts()).map(([groupName, groupItems]) => (
                    <div key={groupName} className="space-y-2">
                      <h4 className="text-sm font-medium text-[#282A3F] border-b pb-1">
                        {groupName}
                      </h4>
                      {groupItems.map((item) => (
                        <label key={`${groupName}-${item.type}-${item.id}`} className="flex items-start space-x-2 cursor-pointer ml-4">
                          <Checkbox
                            checked={selectedContacts.includes(item.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedContacts([...selectedContacts, item.id]);
                              } else {
                                setSelectedContacts(selectedContacts.filter(id => id !== item.id));
                              }
                            }}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#282A3F]">{item.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                item.type === 'contact' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : item.type === 'user'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {item.type === 'contact' ? 'Contact' : item.type === 'user' ? 'User/Guest' : item.type}
                              </span>
                            </div>
                            {item.email && (
                              <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                <Mail className="h-3 w-3 mr-1" />
                                {item.email}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  ))}
                  {Object.keys(getGroupedContacts()).length === 0 && (
                    <p className="text-sm text-gray-500">No partner-related external parties found</p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleShare}
                disabled={
                  (shareMode === 'internal' && selectedUsers.length === 0) ||
                  (shareMode === 'external' && selectedContacts.length === 0)
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}