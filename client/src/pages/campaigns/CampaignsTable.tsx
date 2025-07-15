import { useState } from 'react';
import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

const getStatusConfig = (campaign: any) => {
  // Calculate the actual status based on campaign data
  const status = campaign.status || 'draft';
  const emailsSent = campaign.emails_sent || 0;
  const recipientsCount = campaign.recipients?.length || 0;
  const hasNewContacts = campaign.new_contacts_added || false;
  const isPaused = campaign.is_paused || false;
  const isStopped = campaign.is_stopped || false;
  const isScheduled = campaign.scheduled_time && new Date(campaign.scheduled_time) > new Date();
  
  // Determine the actual status based on campaign state
  let actualStatus = status;
  let label = 'Draft';
  
  if (isStopped) {
    actualStatus = 'stopped';
    label = 'Stopped';
  } else if (isPaused) {
    actualStatus = 'paused';
    label = 'Paused';
  } else if (isScheduled) {
    actualStatus = 'scheduled';
    label = 'Scheduled';
  } else if (hasNewContacts) {
    actualStatus = 'new_contacts';
    label = 'New Contacts';
  } else if (emailsSent > 0 && emailsSent < recipientsCount) {
    actualStatus = 'partially_sent';
    label = 'Partially Sent';
  } else if (emailsSent > 0 && emailsSent >= recipientsCount) {
    actualStatus = 'sent';
    label = 'Sent';
  } else if (status === 'in_progress' || status === 'active') {
    actualStatus = 'running';
    label = 'Running';
  } else if (status === 'draft') {
    actualStatus = 'draft';
    label = 'Draft';
  }
  
  // Return color and icon based on actual status
  switch (actualStatus) {
    case 'draft':
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: Edit2,
        label: 'Draft'
      };
    case 'scheduled':
      return {
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        icon: Clock,
        label: 'Scheduled'
      };
    case 'running':
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: Play,
        label: 'Running'
      };
    case 'partially_sent':
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Send,
        label: 'Partially Sent'
      };
    case 'sent':
      return {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
        label: 'Sent'
      };
    case 'new_contacts':
      return {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Users,
        label: 'New Contacts'
      };
    case 'paused':
      return {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Pause,
        label: 'Paused'
      };
    case 'stopped':
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: Archive,
        label: 'Stopped'
      };
    default:
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: Edit2,
        label: label
      };
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

const getAllPossibleStatuses = () => {
  return [
    { value: 'draft', label: 'Draft', description: 'Campaign not yet sent' },
    { value: 'scheduled', label: 'Scheduled', description: 'Campaign scheduled to send' },
    { value: 'running', label: 'Running', description: 'Campaign is actively sending' },
    { value: 'partially_sent', label: 'Partially Sent', description: 'Some recipients received emails' },
    { value: 'sent', label: 'Sent', description: 'All recipients received emails' },
    { value: 'new_contacts', label: 'New Contacts', description: 'New contacts added after last send' },
    { value: 'paused', label: 'Paused', description: 'Campaign temporarily stopped' },
    { value: 'stopped', label: 'Stopped', description: 'Campaign permanently stopped' }
  ];
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
                <td className="px-3 py-4 text-sm w-[160px]">
                  {(() => {
                    const statusConfig = getStatusConfig(campaign);
                    const StatusIcon = statusConfig.icon;
                    const allStatuses = getAllPossibleStatuses();
                    
                    const statusBadge = (
                      <Badge
                        variant="outline"
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </Badge>
                    );
                    
                    // Show tooltip for draft campaigns with all possible statuses
                    if (statusConfig.label === 'Draft') {
                      return (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-block cursor-help">
                                {statusBadge}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-xs">
                              <div className="space-y-1">
                                <p className="font-medium">All possible statuses:</p>
                                {allStatuses.map(status => (
                                  <div key={status.value} className="flex items-center gap-2 text-xs">
                                    <span className="font-medium">{status.label}:</span>
                                    <span className="text-gray-600">{status.description}</span>
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    }
                    
                    return statusBadge;
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