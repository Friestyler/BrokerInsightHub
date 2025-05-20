import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Send, Users, Sparkles, Plus } from "lucide-react";
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

  // Demo campaign templates
  const templates: TemplateCard[] = [
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
      isSponsored: false,
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
      isSponsored: true,
      sponsor: "Arag",
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
        return templates;
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
      setLocation(`/campaigns/new?template=${templateId}`);
    } else {
      setLocation("/campaigns/new");
    }
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my">My Campaigns</TabsTrigger>
          <TabsTrigger value="shared">Shared Campaigns</TabsTrigger>
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
                          className={template.sponsor === "Arag" 
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }
                        >
                          {template.sponsor === "Arag" ? "Created for you" : "Sponsored"}
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

            <div className="flex justify-center">
              <Button 
                size="lg"
                variant="outline" 
                className="border-2 border-dashed border-gray-300 hover:border-indigo-300 hover:bg-indigo-50"
                onClick={() => startNewCampaign()}
              >
                <Plus className="h-5 w-5 mr-2" />
                Start from Scratch
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}