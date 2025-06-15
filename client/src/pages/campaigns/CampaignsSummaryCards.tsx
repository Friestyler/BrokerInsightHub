import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Users, Target, TrendingUp, Clock } from "lucide-react";

export default function CampaignsSummaryCards() {
  const { data: campaigns = [] } = useQuery({
    queryKey: ['/api/degoudse/campaigns'],
  });

  // Calculate summary statistics
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((c: any) => 
    c.status === 'in_progress' || c.status === 'scheduled' || c.status === 'sent'
  ).length;
  
  const totalRecipients = campaigns.reduce((acc: number, campaign: any) => 
    acc + (campaign.recipients?.length || 0), 0
  );
  
  const totalSent = campaigns.reduce((acc: number, campaign: any) => {
    const email1 = campaign.engagement_summary?.email1 || {};
    const email2 = campaign.engagement_summary?.email2 || {};
    return acc + (email1.sent || 0) + (email2.sent || 0);
  }, 0);
  
  const totalOpened = campaigns.reduce((acc: number, campaign: any) => {
    const email1 = campaign.engagement_summary?.email1 || {};
    const email2 = campaign.engagement_summary?.email2 || {};
    return acc + (email1.opened || 0) + (email2.opened || 0);
  }, 0);

  const overallEngagementRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

  const summaryData = [
    {
      title: "Total Campaigns",
      value: totalCampaigns,
      icon: Mail,
      color: "text-blue-600"
    },
    {
      title: "Active Campaigns",
      value: activeCampaigns,
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Total Recipients",
      value: totalRecipients,
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Emails Sent",
      value: totalSent,
      icon: Target,
      color: "text-orange-600"
    },
    {
      title: "Engagement Rate",
      value: `${overallEngagementRate}%`,
      icon: Clock,
      color: "text-indigo-600"
    }
  ];

  return (
    <div className="grid grid-cols-5 gap-6 mb-6">
      {summaryData.map((item) => (
        <Card key={item.title} className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                </p>
                <p className="text-sm text-gray-600 mt-1">{item.title}</p>
              </div>
              <item.icon className={`h-8 w-8 ${item.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}