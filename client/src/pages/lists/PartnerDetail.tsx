import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface PartnerData {
  id: number;
  name: string;
  description: string;
  segment: string;
  address: string;
  customers: number;
  opportunities: number;
  initials: string;
  owner: {
    id: number;
    name: string;
    initials: string;
    avatar: string;
  };
  team: Array<{
    id: number;
    name: string;
    initials: string;
    avatar: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Partner Overview Section Component
function PartnerOverviewSection({ partner }: { partner: PartnerData }) {
  return (
    <div className="space-y-6">
      {/* Partner Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Partner Information</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Segment</span>
              <p className="font-medium text-gray-900">{partner.segment}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Address</span>
              <p className="font-medium text-gray-900">{partner.address}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Description</span>
              <p className="font-medium text-gray-900">{partner.description}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Customers</span>
              <p className="text-2xl font-bold text-indigo-600">{partner.customers}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Opportunities</span>
              <p className="text-2xl font-bold text-green-600">{partner.opportunities}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500 block mb-2">Owner</span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {partner.owner.initials}
                </div>
                <span className="font-medium text-gray-900">{partner.owner.name}</span>
              </div>
            </div>
            {partner.team.length > 0 && (
              <div>
                <span className="text-sm text-gray-500 block mb-2">Team Members</span>
                <div className="flex -space-x-2">
                  {partner.team.slice(0, 3).map((member) => (
                    <div 
                      key={member.id}
                      className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium border-2 border-white"
                      title={member.name}
                    >
                      {member.initials}
                    </div>
                  ))}
                  {partner.team.length > 3 && (
                    <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white">
                      +{partner.team.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Partner Opportunities Section Component - simplified working version
function PartnerOpportunitiesSection({ partnerId }: { partnerId: string | undefined }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOpportunities, setSelectedOpportunities] = useState<number[]>([]);
  
  // Fetch opportunities for this specific partner
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['/api/opportunities', partnerId],
    queryFn: async () => {
      try {
        const response = await fetch('/api/opportunities');
        if (!response.ok) {
          throw new Error('Failed to fetch opportunities');
        }
        const allOpportunities = await response.json();
        // Filter opportunities for this partner
        return allOpportunities.filter((opp: any) => opp.partnerId === parseInt(partnerId || '0'));
      } catch (error) {
        console.error('Error fetching opportunities:', error);
        return [];
      }
    },
    enabled: !!partnerId
  });

  // Filter opportunities based on search
  const filteredOpportunities = opportunities.filter((opp: any) => {
    const matchesSearch = !searchTerm || 
      opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.customer?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Calculate statistics
  const stats = {
    totalOpportunities: filteredOpportunities.length,
    closedWon: filteredOpportunities.filter((opp: any) => opp.status === 'closed').length,
    totalValue: filteredOpportunities.reduce((sum: number, opp: any) => sum + (opp.value || 0), 0),
    weightedValue: filteredOpportunities.reduce((sum: number, opp: any) => {
      const value = opp.value || 0;
      const probability = opp.probability || 0;
      return sum + (value * (probability / 100));
    }, 0)
  };

  // Format currency function
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = (status: string) => {
      switch (status?.toLowerCase()) {
        case 'open':
          return 'bg-green-100 text-green-800';
        case 'closed':
          return 'bg-gray-100 text-gray-800';
        case 'on_hold':
          return 'bg-yellow-100 text-yellow-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
        {status?.replace('_', ' ') || 'Unknown'}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading opportunities...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and action bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-60">
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-2xl font-semibold text-[#282A3F] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {stats.totalOpportunities}
          </div>
          <div className="text-sm text-[#696C8C]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Total Opportunities
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-2xl font-semibold text-[#282A3F] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {stats.closedWon}
          </div>
          <div className="text-sm text-[#696C8C]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Closed Won
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-2xl font-semibold text-[#282A3F] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {formatCurrency(stats.totalValue)}
          </div>
          <div className="text-sm text-[#696C8C]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Total Value
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-2xl font-semibold text-[#282A3F] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {formatCurrency(stats.weightedValue)}
          </div>
          <div className="text-sm text-[#696C8C]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Weighted Value
          </div>
        </div>
      </div>

      {/* Opportunities table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox />
              </TableHead>
              <TableHead>Opportunity</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Probability</TableHead>
              <TableHead>Close Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOpportunities.map((opportunity: any) => (
              <TableRow key={opportunity.id}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="h-8 w-8 mr-3 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-medium text-xs">
                      {opportunity.title?.substring(0, 2).toUpperCase() || 'OP'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {opportunity.title || 'Untitled Opportunity'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {opportunity.description || 'No description'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-indigo-600">
                  {opportunity.customer || 'No customer assigned'}
                </TableCell>
                <TableCell>
                  <StatusBadge status={opportunity.status} />
                </TableCell>
                <TableCell>
                  <span className="text-gray-700">
                    {opportunity.type?.replace('_', ' ') || 'Unknown'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-gray-700">
                    {opportunity.stage?.charAt(0).toUpperCase() + opportunity.stage?.slice(1) || 'Unknown'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {formatCurrency(opportunity.value || 0)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-gray-700">
                    {opportunity.probability || 0}%
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-gray-700">
                    {opportunity.closeDate ? new Date(opportunity.closeDate).toLocaleDateString() : 'Not set'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredOpportunities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No opportunities match your search.' : 'No opportunities found for this partner.'}
          </div>
        )}
      </div>
    </div>
  );
}

// OKR Plans Section Component  
function PartnerOKRSection({ partnerId }: { partnerId: string | undefined }) {
  return (
    <div className="space-y-4">
      <div className="text-center py-8 text-gray-500">
        OKR Plans functionality will be implemented here.
      </div>
    </div>
  );
}

// Partner Detail Main Component
export default function PartnerDetail() {
  const params = useRoute('/partners/:id')[1];
  const partnerId = params?.id;
  
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch partner data
  const { data: partner, isLoading } = useQuery({
    queryKey: ['/api/partners', partnerId],
    enabled: !!partnerId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading partner details...</div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Partner not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-medium">
            {partner.initials || partner.name?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{partner.name}</h1>
            <p className="text-gray-500">{partner.segment}</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </Button>
          <Button>
            <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'opportunities', 'okr-plans'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'opportunities' && 'Opportunities'}
              {tab === 'okr-plans' && 'OKR Plans'}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <PartnerOverviewSection partner={partner} />}
      {activeTab === 'opportunities' && <PartnerOpportunitiesSection partnerId={partnerId} />}
      {activeTab === 'okr-plans' && <PartnerOKRSection partnerId={partnerId} />}
    </div>
  );
}