import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Search, Calendar, MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface OKRMetric {
  id: number;
  name: string;
  description?: string;
  realized_value: number;
  target_value?: number;
  measure_unit: string;
  frequency: string;
  tags: string[];
  timeframe_start?: Date | null;
  timeframe_end?: Date | null;
}

export default function PartnerDetailNew() {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  // Fetch partner data
  const { data: partners, isLoading: partnersLoading } = useQuery({
    queryKey: ['/api/partners'],
  });

  // Fetch assigned OKR templates for this partner
  const { data: assignedTemplates, isLoading: templatesLoading } = useQuery({
    queryKey: [`/api/template-assignments/partner/${id}`],
    enabled: !!id,
  });

  // Fetch all OKR metrics to match with assigned templates
  const { data: allMetrics = [] } = useQuery({
    queryKey: ['/api/okr-metrics'],
  });

  // Fetch related customers and opportunities
  const { data: relatedCustomers } = useQuery({
    queryKey: [`/api/partners/${id}/customers`],
    enabled: !!id,
  });

  const { data: relatedOpportunities } = useQuery({
    queryKey: [`/api/partners/${id}/opportunities`],
    enabled: !!id,
  });

  if (partnersLoading || templatesLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading partner details...</p>
        </div>
      </div>
    );
  }

  const partner = partners?.find((p: any) => p.id === parseInt(id || '1'));
  
  if (!partner) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-600">Partner not found</p>
          <Link href="/partners">
            <Button variant="outline" className="mt-4">
              Back to Partners
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get assigned metrics for this partner
  const assignedMetrics = (allMetrics as OKRMetric[]).filter((metric: OKRMetric) => 
    assignedTemplates?.some((assignment: any) => assignment.template_id === metric.id)
  );

  // Filter metrics based on search and filters
  const filteredMetrics = assignedMetrics.filter((metric: OKRMetric) => {
    const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'all' || metric.tags.includes(selectedTag);
    const matchesUnit = selectedUnit === 'all' || metric.measure_unit === selectedUnit;
    const matchesTimeframe = selectedTimeframe === 'all' || 
      (selectedTimeframe === 'current' && metric.timeframe_start && metric.timeframe_end && 
       new Date() >= new Date(metric.timeframe_start) && new Date() <= new Date(metric.timeframe_end));
    
    return matchesSearch && matchesTag && matchesUnit && matchesTimeframe;
  });

  // Group metrics by tags
  const groupedMetrics = filteredMetrics.reduce((acc: any, metric: OKRMetric) => {
    if (metric.tags.length === 0) {
      if (!acc['No Tag']) acc['No Tag'] = [];
      acc['No Tag'].push(metric);
    } else {
      metric.tags.forEach((tag: string) => {
        if (!acc[tag]) acc[tag] = [];
        acc[tag].push(metric);
      });
    }
    return acc;
  }, {});

  const formatProgress = (realized: number, target?: number) => {
    if (!target) return '0%';
    return `${Math.round((realized / target) * 100)}%`;
  };

  const formatTarget = (value?: number, unit?: string) => {
    if (!value) return '—';
    if (unit === 'percent') return `${value}%`;
    if (unit === 'currency') return `${value}M`;
    return value.toString();
  };

  const formatDueDate = (endDate?: Date | null) => {
    if (!endDate) return '—';
    return new Date(endDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getTrafficLight = (realized: number, target?: number) => {
    if (!target) return 'bg-gray-400';
    const progress = (realized / target) * 100;
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/partners" className="text-gray-400 hover:text-gray-600">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">{partner.name}</h1>
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
              Details
            </Button>
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
              Partner
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Owner:</span>
              <span className="text-blue-600">NA</span>
            </div>
          </div>
          <p className="text-gray-600 mt-1 text-sm">
            {partner.description || 'Joint action & business plan to drive growth with insurance business'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <Tabs defaultValue="okr" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="okr" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              OKR plans
            </TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="okr" className="mt-6">
            {/* Create a quick action section */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">Create a quick action</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Describe objectives and activities to generate structured OKRs for this partner.
                  </p>
                  <Input 
                    placeholder="Example: Increase insurance sales by 25% with activities like digital marketing campaigns, client outreach, and product training."
                    className="mb-4"
                  />
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="default" className="bg-gray-400 hover:bg-gray-500">
                    Generate
                  </Button>
                  <Button variant="outline">
                    Templates
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search OKR templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tags</SelectItem>
                  <SelectItem value="Customer Success">Customer Success</SelectItem>
                  <SelectItem value="Market Expansion">Market Expansion</SelectItem>
                  <SelectItem value="Product Innovation">Product Innovation</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Measure unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All units</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="percent">Percentage</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All timeframes</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* OKR Metrics Table */}
            <div className="bg-white rounded-lg">
              {Object.entries(groupedMetrics).map(([tagName, tagMetrics]: [string, any]) => (
                <div key={tagName} className="mb-6">
                  {/* Tag Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge 
                      variant="secondary" 
                      className={`px-3 py-1 text-sm font-medium ${
                        tagName === 'Customer Success' ? 'bg-green-100 text-green-800' :
                        tagName === 'Market Expansion' ? 'bg-yellow-100 text-yellow-800' :
                        tagName === 'Product Innovation' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {tagName}
                    </Badge>
                  </div>

                  {/* Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Realized
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Target
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Current Milestone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Traffic Lights
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Progress
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tagMetrics.map((metric: OKRMetric) => (
                          <tr key={metric.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{metric.name}</div>
                              {metric.description && (
                                <div className="text-sm text-gray-500">{metric.description}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              —
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatTarget(metric.target_value, metric.measure_unit)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="outline" className="text-blue-600 border-blue-200">
                                {metric.frequency}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDueDate(metric.timeframe_end)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`w-3 h-3 rounded-full ${getTrafficLight(metric.realized_value, metric.target_value)}`}></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatProgress(metric.realized_value, metric.target_value)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {filteredMetrics.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No OKR templates assigned to this partner.</p>
                  <Button className="mt-4" onClick={() => window.location.href = '/templates/metrics'}>
                    Assign Templates
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="mt-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Opportunities ({relatedOpportunities?.length || 0})</h3>
              {relatedOpportunities?.length > 0 ? (
                <div className="space-y-4">
                  {relatedOpportunities.map((opportunity: any) => (
                    <div key={opportunity.id} className="border rounded-lg p-4">
                      <h4 className="font-medium">{opportunity.title}</h4>
                      <p className="text-gray-600 text-sm">{opportunity.description}</p>
                      <div className="mt-2 flex gap-4 text-sm text-gray-500">
                        <span>Value: €{opportunity.value?.toLocaleString() || 'N/A'}</span>
                        <span>Stage: {opportunity.stage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No opportunities found for this partner.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="customers" className="mt-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Customers ({relatedCustomers?.length || 0})</h3>
              {relatedCustomers?.length > 0 ? (
                <div className="space-y-4">
                  {relatedCustomers.map((customer: any) => (
                    <div key={customer.id} className="border rounded-lg p-4">
                      <h4 className="font-medium">{customer.name}</h4>
                      <p className="text-gray-600 text-sm">{customer.description}</p>
                      <div className="mt-2 flex gap-4 text-sm text-gray-500">
                        <span>Industry: {customer.industry || 'N/A'}</span>
                        <span>Size: {customer.size || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No customers found for this partner.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}