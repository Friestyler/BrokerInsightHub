import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Send, 
  Clock, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  PauseCircle, 
  Edit, 
  Trash2 
} from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Campaign = {
  id: number;
  name: string;
  description: string;
  type: string;
  category: string;
  status: string;
  createdById: number | null;
  sponsorId: number | null;
  listId: number | null;
  subject: string;
  emailBody: string;
  emailLogo: string | null;
  fromName: string;
  fromEmail: string;
  scheduledTime: string | null;
  frequency: string;
  isShared: boolean;
  isTemplate: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

type Recipient = {
  id: number;
  campaignId: number;
  contactId: number;
  status: string;
  contact: {
    id: number;
    name: string;
    email: string;
  };
};

type FollowUp = {
  id: number;
  campaignId: number;
  subject: string;
  emailBody: string;
  delayDays: number;
  status: string;
  attachment: string | null;
};

export default function CampaignDetail() {
  const [, params] = useRoute("/campaigns/:id");
  const [, setLocation] = useLocation();
  const { environment } = useEnvironment();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const campaignId = params?.id ? parseInt(params.id) : 0;

  // Fetch campaign details
  const { data: campaign, isLoading } = useQuery<Campaign>({
    queryKey: [`/api/campaigns/${campaignId}`],
    enabled: campaignId > 0,
  });

  // Fetch campaign recipients
  const { data: recipients } = useQuery<Recipient[]>({
    queryKey: [`/api/campaigns/${campaignId}/recipients`],
    enabled: campaignId > 0,
  });

  // Fetch campaign follow-ups
  const { data: followUps } = useQuery<FollowUp[]>({
    queryKey: [`/api/campaigns/${campaignId}/follow-ups`],
    enabled: campaignId > 0,
  });

  // Update campaign status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ status }: { status: string }) => {
      return apiRequest('PATCH', `/api/campaigns/${campaignId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}`] });
      toast({
        title: "Campaign updated",
        description: "Campaign status has been updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to update campaign status. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: () => {
      return apiRequest('DELETE', `/api/campaigns/${campaignId}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      toast({
        title: "Campaign deleted",
        description: "Campaign has been deleted successfully",
      });
      setLocation("/campaigns");
    },
    onError: (error) => {
      console.error("Error deleting campaign:", error);
      toast({
        title: "Error",
        description: "Failed to delete campaign. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle status change
  const handleStatusChange = (status: string) => {
    updateStatusMutation.mutate({ status });
  };

  // Handle delete campaign
  const handleDeleteCampaign = () => {
    deleteCampaignMutation.mutate();
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "paused":
        return <Badge variant="secondary">Paused</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="pl-0 text-gray-500"
            onClick={() => setLocation("/campaigns")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Campaigns
          </Button>
        </div>
        <div className="text-center py-12">Loading campaign details...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="pl-0 text-gray-500"
            onClick={() => setLocation("/campaigns")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Campaigns
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Campaign not found</h2>
          <p className="text-gray-500">The campaign you're looking for doesn't exist or has been deleted.</p>
          <Button 
            className="mt-4 bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setLocation("/campaigns")}
          >
            Back to Campaigns
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button 
            variant="ghost" 
            className="pl-0 text-gray-500"
            onClick={() => setLocation("/campaigns")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Campaigns
          </Button>
          <div className="flex items-center mt-2">
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <div className="ml-3">{renderStatusBadge(campaign.status)}</div>
          </div>
          <p className="text-gray-500 mt-1">{campaign.description}</p>
        </div>
        <div className="flex space-x-2">
          {campaign.status === "draft" && (
            <Button
              onClick={() => handleStatusChange("active")}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-1" /> Send Campaign
            </Button>
          )}
          {campaign.status === "active" && (
            <Button
              onClick={() => handleStatusChange("paused")}
              variant="outline"
              className="border-amber-500 text-amber-600 hover:bg-amber-50"
            >
              <PauseCircle className="h-4 w-4 mr-1" /> Pause
            </Button>
          )}
          {campaign.status === "paused" && (
            <Button
              onClick={() => handleStatusChange("active")}
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Resume
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setLocation(`/campaigns/${campaignId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-normal">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium">
              {campaign.type === "cross_sell" ? "Cross-Sell" : 
               campaign.type === "upsell" ? "Upsell" : "Custom"}
              {campaign.category && ` - ${campaign.category}`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-normal">Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-indigo-500" />
              {campaign.scheduledTime ? 
                new Date(campaign.scheduledTime).toLocaleString() : 
                'Immediately upon activation'}
            </div>
            <div className="text-sm text-gray-500 flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1" /> {campaign.frequency === "one_time" ? "One-time" : campaign.frequency}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-normal">Sender</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium">{campaign.fromName}</div>
            <div className="text-sm text-gray-500">{campaign.fromEmail}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="recipients">
            Recipients {recipients?.length ? `(${recipients.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="follow-ups">
            Follow-ups {followUps?.length ? `(${followUps.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Email Content</CardTitle>
              <CardDescription>Subject: {campaign.subject}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-md p-6">
                {campaign.emailLogo && (
                  <div className="mb-4">
                    <img 
                      src={campaign.emailLogo} 
                      alt="Email logo" 
                      className="max-h-16 object-contain" 
                    />
                  </div>
                )}
                <div className="prose max-w-none">
                  {campaign.emailBody.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Recipients</CardTitle>
              <CardDescription>
                People who will receive this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recipients && recipients.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-white border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {recipients.map(recipient => (
                        <tr key={recipient.id}>
                          <td className="px-4 py-3 text-sm">{recipient.contact.name}</td>
                          <td className="px-4 py-3 text-sm">{recipient.contact.email}</td>
                          <td className="px-4 py-3 text-sm">
                            {recipient.status === "pending" && <Badge variant="outline">Pending</Badge>}
                            {recipient.status === "sent" && <Badge variant="secondary">Sent</Badge>}
                            {recipient.status === "opened" && <Badge className="bg-green-100 text-green-800 border-green-200">Opened</Badge>}
                            {recipient.status === "clicked" && <Badge className="bg-indigo-500">Clicked</Badge>}
                            {recipient.status === "responded" && <Badge className="bg-violet-500">Responded</Badge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recipients</h3>
                  <p className="mt-1 text-sm text-gray-500">No recipients have been added to this campaign yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="follow-ups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Follow-up Messages</CardTitle>
              <CardDescription>
                Automated follow-up emails after the initial campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              {followUps && followUps.length > 0 ? (
                <div className="space-y-4">
                  {followUps.map((followUp, index) => (
                    <div key={followUp.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">Follow-up #{index + 1}</h3>
                        <Badge variant="outline">
                          {followUp.delayDays} days after initial email
                        </Badge>
                      </div>
                      <p className="text-sm font-medium mb-1">Subject: {followUp.subject || campaign.subject}</p>
                      <div className="bg-gray-50 p-3 rounded-md text-sm">
                        {followUp.emailBody.split("\n").map((line, i) => (
                          <p key={i} className="mb-2">{line}</p>
                        ))}
                      </div>
                      {followUp.attachment && (
                        <div className="mt-2 flex items-center">
                          <span className="text-xs text-gray-500">Attachment: {followUp.attachment}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Send className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No follow-ups</h3>
                  <p className="mt-1 text-sm text-gray-500">No follow-up messages have been configured for this campaign.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Campaign Analytics</CardTitle>
              <CardDescription>
                Performance metrics for this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="border rounded-md p-4 text-center">
                  <h3 className="text-sm text-gray-500 mb-1">Sent</h3>
                  <div className="text-2xl font-semibold text-gray-800">
                    {recipients?.filter(r => r.status !== "pending").length || 0}
                  </div>
                </div>
                <div className="border rounded-md p-4 text-center">
                  <h3 className="text-sm text-gray-500 mb-1">Opened</h3>
                  <div className="text-2xl font-semibold text-indigo-600">
                    {recipients?.filter(r => ["opened", "clicked", "responded"].includes(r.status)).length || 0}
                  </div>
                </div>
                <div className="border rounded-md p-4 text-center">
                  <h3 className="text-sm text-gray-500 mb-1">Clicked</h3>
                  <div className="text-2xl font-semibold text-indigo-600">
                    {recipients?.filter(r => ["clicked", "responded"].includes(r.status)).length || 0}
                  </div>
                </div>
                <div className="border rounded-md p-4 text-center">
                  <h3 className="text-sm text-gray-500 mb-1">Responses</h3>
                  <div className="text-2xl font-semibold text-indigo-600">
                    {recipients?.filter(r => r.status === "responded").length || 0}
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center py-8">
                <p className="text-sm text-gray-500">Detailed analytics charts will be available when the campaign is active.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCampaign}
              disabled={deleteCampaignMutation.isPending}
            >
              {deleteCampaignMutation.isPending ? "Deleting..." : "Delete Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}