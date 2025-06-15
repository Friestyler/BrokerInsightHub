import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Mail, Users, TrendingUp, Calendar, Eye, Edit2, Trash2, Copy, BarChart3 } from "lucide-react";

interface CampaignsTableProps {
  campaigns: unknown;
  selectedCampaigns: number[];
  onSelectionChange: (selectedIds: number[]) => void;
}

// Sortable table header component
interface SortableTableHeadProps {
  sortKey: string;
  currentSortKey: string;
  currentDirection: 'asc' | 'desc';
  onSort: (key: string) => void;
  children: React.ReactNode;
  className?: string;
}

const SortableTableHead = ({ 
  sortKey, 
  currentSortKey, 
  currentDirection, 
  onSort, 
  children, 
  className = "" 
}: SortableTableHeadProps) => {
  const isActive = currentSortKey === sortKey;
  
  return (
    <th 
      scope="col" 
      className={`px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 bg-white ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center text-[14px] font-medium text-[#696C8C]">
        {children}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`ml-1 transition-transform ${
            isActive 
              ? (currentDirection === 'desc' ? 'rotate-180' : '') 
              : 'opacity-50'
          }`}
        >
          <path d="M8 9l4-4 4 4"></path>
          <path d="M16 15l-4 4-4-4"></path>
        </svg>
      </div>
    </th>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'sent':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getEntityColor = (entityType: string) => {
  switch (entityType) {
    case 'partners':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'customers':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'opportunities':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'internal':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function CampaignsTable({ campaigns, selectedCampaigns, onSelectionChange }: CampaignsTableProps) {
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleSelectCampaign = (campaignId: number) => {
    if (selectedCampaigns.includes(campaignId)) {
      onSelectionChange(selectedCampaigns.filter(id => id !== campaignId));
    } else {
      onSelectionChange([...selectedCampaigns, campaignId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedCampaigns.length === campaignsArray.length && campaignsArray.length > 0) {
      onSelectionChange([]);
    } else {
      onSelectionChange(campaignsArray.map((campaign: any) => campaign.id));
    }
  };

  // Type guard to ensure campaigns is an array
  const campaignsArray = Array.isArray(campaigns) ? campaigns : [];

  const sortedCampaigns = [...campaignsArray].sort((a: any, b: any) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const calculateEngagementRate = (engagement: any) => {
    if (!engagement) return 0;
    
    let totalSent = 0;
    let totalOpens = 0;
    
    Object.values(engagement).forEach((metrics: any) => {
      totalSent += metrics.sent || 0;
      totalOpens += metrics.opens || 0;
    });
    
    return totalSent > 0 ? (totalOpens / totalSent * 100) : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white overflow-x-auto rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-white">
          <tr>
            <th scope="col" className="relative px-3 py-3.5 w-10 bg-white group">
              <input
                type="checkbox"
                className={`absolute h-4 w-4 rounded border-gray-300 ${
                  selectedCampaigns.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'
                }`}
                checked={selectedCampaigns.length === campaignsArray.length && campaignsArray.length > 0}
                onChange={toggleSelectAll}
              />
            </th>
            <SortableTableHead 
              sortKey="name" 
              currentSortKey={sortField} 
              currentDirection={sortDirection} 
              onSort={handleSort} 
              className="w-[250px]"
            >
              Campaign Name
            </SortableTableHead>
            <SortableTableHead 
              sortKey="status" 
              currentSortKey={sortField} 
              currentDirection={sortDirection} 
              onSort={handleSort} 
              className="w-[120px]"
            >
              Status
            </SortableTableHead>
            <SortableTableHead 
              sortKey="target_entity_type" 
              currentSortKey={sortField} 
              currentDirection={sortDirection} 
              onSort={handleSort} 
              className="w-[120px]"
            >
              Target Type
            </SortableTableHead>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[140px] bg-white">
              <div className="flex items-center text-[#696C8C] text-[14px] font-medium">
                Engagement Rate
              </div>
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[100px] bg-white">
              <div className="flex items-center text-[#696C8C] text-[14px] font-medium">
                Recipients
              </div>
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[100px] bg-white">
              <div className="flex items-center text-[#696C8C] text-[14px] font-medium">
                Emails
              </div>
            </th>
            <SortableTableHead 
              sortKey="created_by_name" 
              currentSortKey={sortField} 
              currentDirection={sortDirection} 
              onSort={handleSort} 
              className="w-[120px]"
            >
              Created By
            </SortableTableHead>
            <SortableTableHead 
              sortKey="created_at" 
              currentSortKey={sortField} 
              currentDirection={sortDirection} 
              onSort={handleSort} 
              className="w-[120px]"
            >
              Created Date
            </SortableTableHead>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[200px] bg-white">
              <div className="flex items-center text-[#696C8C] text-[14px] font-medium">
                Objective
              </div>
            </th>
            <th scope="col" className="relative px-3 py-3.5 w-10 bg-white">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedCampaigns.map((campaign: any) => {
            const engagementRate = calculateEngagementRate(campaign.engagement_summary);
            
            return (
              <tr 
                key={campaign.id}
                className={`hover:bg-gray-50 cursor-pointer group ${
                  selectedCampaigns.includes(campaign.id) ? 'bg-blue-50' : ''
                }`}
                onClick={(e) => {
                  // Don't trigger when clicking on checkbox or actions
                  if (!(e.target as any).type || (e.target as any).type !== 'checkbox') {
                    // Navigate to campaign detail view
                    console.log('Navigate to campaign:', campaign.id);
                  }
                }}
              >
                <td className="relative px-3 py-4 w-10">
                  <input
                    type="checkbox"
                    className={`absolute h-4 w-4 rounded border-gray-300 ${
                      selectedCampaigns.includes(campaign.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'
                    }`}
                    checked={selectedCampaigns.includes(campaign.id)}
                    onChange={() => toggleSelectCampaign(campaign.id)}
                  />
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 w-[250px]">
                  <div className="max-w-[230px]">
                    <div className="font-medium text-gray-900 truncate">
                      {campaign.name}
                    </div>
                    <div className="text-gray-500 text-xs truncate">
                      {campaign.description}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-sm w-[120px]">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-3 py-4 text-sm w-[120px]">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEntityColor(campaign.target_entity_type)}`}>
                    {campaign.target_entity_type}
                  </span>
                </td>
                <td className="px-3 py-4 text-sm w-[140px]">
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={engagementRate}
                      className="h-2 flex-1"
                    />
                    <span className="text-xs text-gray-600 min-w-[40px]">
                      {engagementRate.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 w-[100px]">
                  {campaign.recipients?.length || 0}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 w-[100px]">
                  {campaign.emails?.length || 0}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 w-[120px] truncate">
                  {campaign.created_by_name}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 w-[120px]">
                  {formatDate(campaign.created_at)}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 w-[200px]">
                  <div className="truncate" title={campaign.objective}>
                    {campaign.objective || '-'}
                  </div>
                </td>
                <td className="px-3 py-4 text-sm w-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Edit2 className="w-4 h-4" />
                        Edit Campaign
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        View Analytics
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="flex items-center gap-2 text-red-600 focus:text-red-600">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {campaignsArray.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            No campaigns found matching your criteria.
          </div>
        </div>
      )}
    </div>
  );
}