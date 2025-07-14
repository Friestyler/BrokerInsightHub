import { useState } from 'react';
import { Link, useLocation } from "wouter";
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
import { MoreVertical, Mail, Users, TrendingUp, Calendar, Eye, Edit2, Trash2, Copy, BarChart3, Play, Pause, Archive, Send, CheckCircle, Clock, RefreshCw } from "lucide-react";

interface CampaignsTableProps {
  campaigns: unknown;
  selectedCampaigns: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  isPartnerView?: boolean;
  partnerId?: string;
  onCampaignClick?: (campaign: any) => void;
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

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'draft':
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: Edit2,
        label: 'Draft',
        description: 'Campaign is being prepared'
      };
    case 'sent_once':
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: Send,
        label: 'Sent Once',
        description: 'Campaign was sent and completed'
      };
    case 'sent_open':
      return {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: RefreshCw,
        label: 'Sent & Open',
        description: 'Campaign is sent and accepting new contacts'
      };
    case 'in_progress':
      return {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Play,
        label: 'In Progress',
        description: 'Campaign is actively running'
      };
    case 'stopped':
      return {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Pause,
        label: 'Stopped',
        description: 'Campaign has been paused'
      };
    case 'archived':
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Archive,
        label: 'Archived',
        description: 'Campaign is archived and inactive'
      };
    case 'scheduled':
      return {
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        icon: Clock,
        label: 'Scheduled',
        description: 'Campaign is scheduled to be sent'
      };
    default:
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: Edit2,
        label: status.replace('_', ' '),
        description: 'Campaign status'
      };
  }
};

const getAvailableStatusTransitions = (currentStatus: string) => {
  switch (currentStatus) {
    case 'draft':
      return [
        { value: 'scheduled', label: 'Schedule', icon: Clock, description: 'Schedule for later sending' },
        { value: 'in_progress', label: 'Start Now', icon: Play, description: 'Begin campaign immediately' }
      ];
    case 'scheduled':
      return [
        { value: 'in_progress', label: 'Start Now', icon: Play, description: 'Begin campaign immediately' },
        { value: 'draft', label: 'Back to Draft', icon: Edit2, description: 'Return to draft for editing' },
        { value: 'stopped', label: 'Cancel', icon: Pause, description: 'Cancel scheduled sending' }
      ];
    case 'in_progress':
      return [
        { value: 'sent_once', label: 'Complete', icon: CheckCircle, description: 'Mark as completed' },
        { value: 'sent_open', label: 'Keep Open', icon: RefreshCw, description: 'Keep accepting new contacts' },
        { value: 'stopped', label: 'Stop', icon: Pause, description: 'Pause campaign' }
      ];
    case 'sent_once':
      return [
        { value: 'sent_open', label: 'Reopen', icon: RefreshCw, description: 'Allow new contacts to be added' },
        { value: 'archived', label: 'Archive', icon: Archive, description: 'Move to archived' }
      ];
    case 'sent_open':
      return [
        { value: 'sent_once', label: 'Close', icon: CheckCircle, description: 'Close to new contacts' },
        { value: 'stopped', label: 'Stop', icon: Pause, description: 'Pause campaign' },
        { value: 'archived', label: 'Archive', icon: Archive, description: 'Move to archived' }
      ];
    case 'stopped':
      return [
        { value: 'in_progress', label: 'Resume', icon: Play, description: 'Resume campaign' },
        { value: 'archived', label: 'Archive', icon: Archive, description: 'Move to archived' },
        { value: 'draft', label: 'Back to Draft', icon: Edit2, description: 'Return to draft for editing' }
      ];
    case 'archived':
      return [
        { value: 'draft', label: 'Restore to Draft', icon: Edit2, description: 'Restore for editing' }
      ];
    default:
      return [];
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

export default function CampaignsTable({ campaigns, selectedCampaigns, onSelectionChange, isPartnerView, partnerId, onCampaignClick }: CampaignsTableProps) {
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [, setLocation] = useLocation();

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleStatusChange = (campaignId: number, newStatus: string) => {
    // TODO: Implement API call to update campaign status
    console.log('Updating campaign status:', { campaignId, newStatus });
    // This would trigger a mutation to update the status in the database
    // After successful update, the query cache would be invalidated to refetch data
  };

  const handleCampaignClick = async (campaign: any, e: React.MouseEvent) => {
    // Don't trigger when clicking on checkbox or actions
    if ((e.target as any).type === 'checkbox') {
      return;
    }

    console.log('Campaign click debug:', {
      campaignId: campaign.id,
      campaignName: campaign.name,
      campaignStatus: campaign.status,
      isPartnerView: isPartnerView,
      shouldUseDraftLogic: campaign.status === 'draft' && isPartnerView
    });

    // If we're in partner view and have a callback, use it instead of navigation
    if (isPartnerView && onCampaignClick) {
      onCampaignClick(campaign);
      return;
    }

    if (campaign.status === 'draft' && isPartnerView) {
      // For draft campaigns from partner view, open campaign builder with recipient step
      // Check if campaign has missing contacts for recipients
      let hasMissingContacts = false;

      if (campaign.recipients && campaign.recipients.length > 0) {
        try {
          if (campaign.target_entity_type === 'opportunities') {
            // Check opportunities for missing customer relationships and contacts
            const opportunityIds = campaign.recipients.map((r: any) => r.id);
            const opportunities = await fetch(`/api/opportunities`).then(res => res.json());
            const customersResponse = await fetch(`/api/customers`).then(res => res.json());
            const customers = customersResponse?.data || [];
            const contacts = await fetch(`/api/contacts`).then(res => res.json());
            
            for (const recipientId of opportunityIds) {
              const opportunity = opportunities.find((o: any) => o.id === recipientId);
              
              // Check if opportunity has no customer relationship
              if (!opportunity?.clientId) {
                hasMissingContacts = true;
                break;
              }
              
              // Check if customer has no contacts
              const customer = customers.find((c: any) => c.id === opportunity.clientId);
              const customerContacts = contacts.filter((contact: any) => contact.customer_id === customer?.id);
              
              if (customerContacts.length === 0) {
                hasMissingContacts = true;
                break;
              }
            }
          } else if (campaign.target_entity_type === 'partners') {
            // Check partners for missing contacts
            const partnerIds = campaign.recipients.map((r: any) => r.id);
            const contacts = await fetch(`/api/contacts`).then(res => res.json());
            
            for (const partnerId of partnerIds) {
              // Check if partner has contacts
              const partnerContacts = contacts.filter((contact: any) => 
                contact.linked_entity_type === 'partner' && contact.linked_entity_id === partnerId
              );
              
              if (partnerContacts.length === 0) {
                hasMissingContacts = true;
                break;
              }
            }
          } else if (campaign.target_entity_type === 'customers') {
            // Check customers for missing contacts
            const customerIds = campaign.recipients.map((r: any) => r.id);
            const contacts = await fetch(`/api/contacts`).then(res => res.json());
            
            for (const customerId of customerIds) {
              // Check if customer has contacts
              const customerContacts = contacts.filter((contact: any) => contact.customer_id === customerId);
              
              if (customerContacts.length === 0) {
                hasMissingContacts = true;
                break;
              }
            }
          }


        } catch (error) {
          console.error('Error checking for missing contacts:', error);
        }
      }
      
      // Build URL with partner context if available
      const partnerParam = partnerId ? `&from_partner=${partnerId}` : '';
      
      if (hasMissingContacts) {
        // Open on Missing Contacts tab
        setLocation(`/campaigns/edit/${campaign.id}?step=recipients&tab=missing-contacts${partnerParam}`);
      } else {
        // Open on Selected tab
        setLocation(`/campaigns/edit/${campaign.id}?step=recipients&tab=selected${partnerParam}`);
      }
    } else {
      // Normal behavior - navigate to campaign edit view
      const partnerParam = partnerId ? `?from_partner=${partnerId}` : '';
      setLocation(`/campaigns/edit/${campaign.id}${partnerParam}`);
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
              className="w-[160px] min-w-[160px]"
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
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[100px] bg-white">
              <div className="flex items-center text-[#696C8C] text-[14px] font-medium">
                Recipients
              </div>
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[100px] bg-white">
              <div className="flex items-center text-[#696C8C] text-[14px] font-medium">
                Opened (%)
              </div>
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[100px] bg-white">
              <div className="flex items-center text-[#696C8C] text-[14px] font-medium">
                Clicked (#)
              </div>
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[100px] bg-white">
              <div className="flex items-center text-[#696C8C] text-[14px] font-medium">
                Emails
              </div>
            </th>
            <SortableTableHead 
              sortKey="created_at" 
              currentSortKey={sortField} 
              currentDirection={sortDirection} 
              onSort={handleSort} 
              className="w-[120px]"
            >
              Created Date
            </SortableTableHead>
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
                onClick={(e) => handleCampaignClick(campaign, e)}
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
                <td className="px-3 py-4 text-sm w-[160px]" onClick={(e) => e.stopPropagation()}>
                  {(() => {
                    const statusConfig = getStatusConfig(campaign.status);
                    const StatusIcon = statusConfig.icon;
                    const availableTransitions = getAvailableStatusTransitions(campaign.status);
                    
                    return (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border hover:bg-opacity-80 transition-all cursor-pointer ${statusConfig.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          <div className="px-2 py-1.5 text-xs text-gray-500 border-b">
                            Change status for "{campaign.name}"
                          </div>
                          {availableTransitions.map((transition) => {
                            const TransitionIcon = transition.icon;
                            return (
                              <DropdownMenuItem
                                key={transition.value}
                                onClick={() => handleStatusChange(campaign.id, transition.value)}
                                className="flex items-center gap-3 py-2"
                              >
                                <TransitionIcon className="w-4 h-4 text-gray-500" />
                                <div>
                                  <div className="font-medium">{transition.label}</div>
                                  <div className="text-xs text-gray-500">{transition.description}</div>
                                </div>
                              </DropdownMenuItem>
                            );
                          })}
                          {availableTransitions.length === 0 && (
                            <DropdownMenuItem disabled className="text-gray-500 text-xs">
                              No status changes available
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    );
                  })()}
                </td>
                <td className="px-3 py-4 text-sm w-[120px]">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEntityColor(campaign.target_entity_type)}`}>
                    {campaign.target_entity_type}
                  </span>
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 w-[100px]">
                  {campaign.recipients?.length || 0}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 w-[100px]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {campaign.open_rate ? parseFloat(campaign.open_rate).toFixed(1) : '0.0'}%
                    </span>
                    {campaign.emails_sent > 0 && (
                      <span className="text-xs text-gray-500">
                        ({campaign.emails_opened || 0}/{campaign.emails_sent || 0})
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 w-[100px]">
                  <span className="font-medium">
                    {campaign.total_clicks || 0}
                  </span>
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 w-[100px]">
                  {campaign.emails_sent || 0}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 w-[120px]">
                  {formatDate(campaign.created_at)}
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
                      <DropdownMenuItem asChild>
                        <Link href={`/campaigns/edit/${campaign.id}`} className="flex items-center gap-2">
                          <Edit2 className="w-4 h-4" />
                          Edit Campaign
                        </Link>
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