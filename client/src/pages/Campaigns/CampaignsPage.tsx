import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEnvironment } from "@/contexts/EnvironmentContext";


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
  const [activeFilter, setActiveFilter] = useState("popular");


  // Fetch campaigns
  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
    enabled: true,
  });

  // Filter campaigns based on ownership and sharing
  const myCampaigns = campaigns?.filter(c => !c.isTemplate && !c.isShared) || [];
  const sharedCampaigns = campaigns?.filter(c => !c.isTemplate && c.isShared) || [];
  const campaignTemplates = campaigns?.filter(c => c.isTemplate) || [];

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
      <Tabs defaultValue="new" className="space-y-6">
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

          {isLoadingCampaigns ? (
            <div className="text-center py-12">Loading templates...</div>
          ) : campaignTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaignTemplates.map(template => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium flex justify-between">
                      {template.name}
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-purple-100 text-purple-700"
                      >
                        Template
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">{template.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-600">
                      {template.type === "cross_sell" ? "Cross-Sell" : template.type === "upsell" ? "Upsell" : "Custom"}
                    </p>
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-0 flex-1"
                      onClick={() => startNewCampaign(template.id.toString())}
                    >
                      Use Template
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 p-0 flex-1"
                      onClick={() => setLocation(`/campaigns/${template.id}?mode=edit`)}
                    >
                      Edit
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No templates</h3>
              <p className="mt-1 text-sm text-gray-500">Create your first campaign template to reuse in future campaigns.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Do what works and try out some of our predesigned campaigns</h2>
            
            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
              <Badge
                variant={activeFilter === "popular" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setActiveFilter("popular")}
              >
                Most Popular
              </Badge>
              <Badge
                variant={activeFilter === "mortgages" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setActiveFilter("mortgages")}
              >
                Mortgages
              </Badge>
              <Badge
                variant={activeFilter === "partner" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setActiveFilter("partner")}
              >
                By Partner
              </Badge>
              <Badge
                variant={activeFilter === "cross-sell" ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setActiveFilter("cross-sell")}
              >
                Cross-Sell
              </Badge>
              <Badge
                variant={activeFilter === "upsell" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setActiveFilter("upsell")}
              >
                Upsell
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {getFilteredTemplates().map(template => (
                <Card 
                  key={template.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => startNewCampaign(template.id)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      {template.icon}
                      {template.isSponsored && (
                        <Badge 
                          variant="outline" 
                          className={template.sponsor === "Rabobank" || template.sponsor === "Arag"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }
                        >
                          {template.sponsor === "Rabobank" || template.sponsor === "Arag" ? "Created for you" : "Sponsored"}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-2">{template.name}</CardTitle>
                    <CardDescription>
                      {template.isSponsored ? `By ${template.sponsor}` : template.category}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    >
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <Button 
                size="lg"
                variant="outline" 
                className="border-2 border-dashed border-gray-300 hover:border-indigo-300 hover:bg-indigo-50"
                onClick={() => startNewCampaign()}
              >
                <Plus className="h-5 w-5 mr-2" />
                Start from Scratch
              </Button>
              <Button 
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => startFromTemplate()}
              >
                <FileText className="h-5 w-5 mr-2" />
                Start from Template
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Import your data to create targeted campaigns</h2>
            <p className="text-gray-600 mb-6">Choose your data source to get started with intelligent campaign creation</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card 
                className="hover:shadow-md transition-shadow cursor-pointer border-2 border-indigo-100"
                onClick={() => setLocation("/campaigns/upload/brio/step1")}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <FileUp className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">Upload from Brio</CardTitle>
                  <CardDescription>
                    Import your customer data directly from Brio
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    Start Import
                  </Button>
                </CardFooter>
              </Card>
              
              <Card 
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardHeader>
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
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-200"
                  >
                    Connect
                  </Button>
                </CardFooter>
              </Card>
              
              <Card 
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardHeader>
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
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-200"
                  >
                    Select Source
                  </Button>
                </CardFooter>
              </Card>
              
              <Card 
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardHeader>
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
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-200"
                  >
                    Set Up Sync
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}