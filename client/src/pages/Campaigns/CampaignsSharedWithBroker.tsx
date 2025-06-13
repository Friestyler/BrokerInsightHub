import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Search, Users, Calendar, Target } from 'lucide-react';
import { useEnvironment } from '@/contexts/EnvironmentContext';

type SharedCampaign = {
  id: number;
  name: string;
  description: string;
  type: string;
  category: string;
  status: string;
  sharedAt: string;
  sharedBy: string;
  accessLevel: string;
  isTemplate: boolean;
  sponsorName?: string;
  tags?: string[];
};

export default function CampaignsSharedWithBroker() {
  const { environment } = useEnvironment();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch campaigns shared with Regional Insurance Partners users
  const { data: sharedCampaigns, isLoading } = useQuery<SharedCampaign[]>({
    queryKey: ['/api/campaigns/shared-with-broker'],
    enabled: true,
  });

  // Filter campaigns based on search term
  const filteredCampaigns = sharedCampaigns?.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cross_sell':
        return <Target className="h-4 w-4" />;
      case 'retention':
        return <Users className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'template':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#282A3F] mb-2">
          Shared Campaigns
        </h1>
        <p className="text-gray-600">
          Campaigns shared with Regional Insurance Partners users
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shared</p>
                <p className="text-2xl font-bold text-[#282A3F]">{filteredCampaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-[#282A3F]">
                  {filteredCampaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Templates</p>
                <p className="text-2xl font-bold text-[#282A3F]">
                  {filteredCampaigns.filter(c => c.isTemplate).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Target className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#282A3F] mb-2">No Shared Campaigns</h3>
            <p className="text-gray-600 mb-4">
              No campaigns have been shared with Regional Insurance Partners users yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(campaign.category)}
                    <CardTitle className="text-lg font-semibold text-[#282A3F] group-hover:text-blue-600 transition-colors">
                      {campaign.name}
                    </CardTitle>
                  </div>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>
                <CardDescription className="text-gray-600 line-clamp-2">
                  {campaign.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Campaign Type */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Type:</span>
                    <Badge variant="outline" className="text-xs">
                      {campaign.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  {/* Shared Info */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Shared by:</span>
                    <span className="font-medium text-[#282A3F]">{campaign.sharedBy}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Shared on:</span>
                    <span className="text-[#282A3F]">
                      {new Date(campaign.sharedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Access Level */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Access:</span>
                    <Badge variant="secondary" className="text-xs">
                      {campaign.accessLevel}
                    </Badge>
                  </div>
                  
                  {/* Tags */}
                  {campaign.tags && campaign.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {campaign.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {campaign.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{campaign.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Action Button */}
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full group-hover:bg-blue-50 group-hover:border-blue-200"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Campaign
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}