import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Search, Users, Copy, Trash2, MoreHorizontal, MessageSquare, UserPlus } from "lucide-react";
import PartnerActivityHub from "@/components/activity/PartnerActivityHub";

export default function PartnerDetailClean() {
  const { id } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("okr-plans");
  
  // OKR metrics state management
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [selectedRange, setSelectedRange] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [groupBy, setGroupBy] = useState("tag");

  // Comment state management
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [selectedMetricForComment, setSelectedMetricForComment] = useState<any | null>(null);
  const [commentText, setCommentText] = useState('');
  const [visibleToPartner, setVisibleToPartner] = useState(true);
  const [assignedTo, setAssignedTo] = useState<string>('');

  // Fetch partner data from database
  const { data: partners, isLoading: partnersLoading } = useQuery({
    queryKey: ['/api/partners'],
  });

  // Fetch related customers for this partner
  const { data: relatedCustomers, isLoading: customersLoading } = useQuery({
    queryKey: [`/api/partners/${id}/customers`],
    enabled: !!id,
  });

  // Fetch related opportunities for this partner
  const { data: relatedOpportunities, isLoading: opportunitiesLoading } = useQuery({
    queryKey: [`/api/partners/${id}/opportunities`],
    enabled: !!id,
  });

  // Fetch template assignments for this partner
  const { data: templateAssignments } = useQuery({
    queryKey: [`/api/template-assignments/partner`],
    enabled: !!id,
  });

  // Fetch all OKR metrics to match with assignments
  const { data: allMetrics } = useQuery({
    queryKey: ['/api/okr-metrics'],
  });

  // Fetch OKR tags for filtering
  const { data: tags } = useQuery({
    queryKey: ['/api/okr-tags'],
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (data: { content: string; visible_to_partner: boolean; entityType: string; entityId: number; assignedTo?: string; metricId?: number }) => {
      const envId = localStorage.getItem('selectedEnvironment') || 'degoudse';
      
      // Use OKR comment endpoint if a metric is selected
      if (data.metricId) {
        const response = await fetch(`/api/${envId}/okr/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metricId: data.metricId,
            partnerId: data.entityId,
            comment: data.content,
            userId: 1, // Default user ID
          }),
        });
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to create OKR comment: ${errorData}`);
        }
        return response.json();
      }
      
      // Use regular comment endpoint for non-OKR comments
      const response = await fetch(`/api/${envId}/activity/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: data.content,
          entityType: data.entityType,
          entityId: data.entityId,
          authorId: 1, // Default user ID
          assignedToId: data.assignedTo && data.assignedTo !== "none" ? 1 : null, // Convert email to user ID (simplified for demo)
          isInternal: !data.visible_to_partner, // Convert visible_to_partner to is_internal
          visibleToPartner: data.visible_to_partner,
        }),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to create comment: ${errorData}`);
      }
      return response.json();
    },
    onSuccess: () => {
      const envId = localStorage.getItem('selectedEnvironment') || 'degoudse';
      // Invalidate activities query to refresh the partner activity hub
      queryClient.invalidateQueries({ queryKey: [`/api/${envId}/partners/${id}/activities`] });
      setIsCommentDialogOpen(false);
      setCommentText('');
      setVisibleToPartner(true);
      setAssignedTo('');
      setSelectedMetricForComment(null);
      toast({ title: "Success", description: "Comment added successfully!" });
    },
    onError: (error) => {
      console.error('Comment creation error:', error);
      toast({ title: "Error", description: error.message || "Failed to add comment", variant: "destructive" });
    },
  });

  const handleAddComment = (metric: any) => {
    setSelectedMetricForComment(metric);
    setIsCommentDialogOpen(true);
  };

  const handleSubmitComment = () => {
    if (!selectedMetricForComment || !commentText.trim()) return;
    
    createCommentMutation.mutate({
      content: commentText,
      visible_to_partner: visibleToPartner,
      entityType: 'partner',
      entityId: parseInt(id!),
      assignedTo: assignedTo || undefined,
      metricId: selectedMetricForComment.id, // Pass the metric ID for OKR comments
    });
  };

  if (partnersLoading || customersLoading || opportunitiesLoading) {
    return <div className="p-4">Loading...</div>;
  }

  const partner = partners?.find((p: any) => p.id === parseInt(id || '1'));
  
  if (!partner) {
    return <div className="p-4">Partner not found</div>;
  }

  // Get attached metrics for this partner
  const partnerAssignments = templateAssignments?.filter((assignment: any) => 
    assignment.entity_type === 'partner' && assignment.entity_id === parseInt(id || '0')
  ) || [];
  const attachedMetricIds = partnerAssignments.map((assignment: any) => assignment.template_id) || [];
  const attachedMetrics = allMetrics?.filter((metric: any) => attachedMetricIds.includes(metric.id)) || [];

  // Filter and search logic for OKR metrics (same as template page)
  const filteredMetrics = attachedMetrics.filter((metric: any) => {
    const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         metric.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === "all" || metric.tags?.includes(selectedTag);
    const matchesUnit = selectedUnit === "all" || metric.measure_unit === selectedUnit;
    const matchesTimeframe = selectedTimeframe === "all"; // Add timeframe logic if needed
    
    let matchesRange = true;
    if (selectedRange !== "all" && metric.target_value) {
      const target = Number(metric.target_value);
      if (selectedRange === "0-50") matchesRange = target >= 0 && target <= 50;
      else if (selectedRange === "50-100") matchesRange = target > 50 && target <= 100;
      else if (selectedRange === "100+") matchesRange = target > 100;
    }
    
    return matchesSearch && matchesTag && matchesUnit && matchesTimeframe && matchesRange;
  });

  // Group metrics by tag (same logic as template page)
  const groupedMetrics = groupBy === 'tag' 
    ? filteredMetrics.reduce((acc: any, metric: any) => {
        const tagName = metric.tags?.[0] || 'Untagged';
        if (!acc[tagName]) acc[tagName] = [];
        acc[tagName].push(metric);
        return acc;
      }, {})
    : { 'All Metrics': filteredMetrics };



  // Selection handlers
  const handleMetricSelect = (metricId: number, checked: boolean) => {
    if (checked) {
      setSelectedMetrics([...selectedMetrics, metricId]);
    } else {
      setSelectedMetrics(selectedMetrics.filter(id => id !== metricId));
    }
  };

  const handleSelectAll = () => {
    if (selectedMetrics.length === filteredMetrics.length) {
      setSelectedMetrics([]);
    } else {
      setSelectedMetrics(filteredMetrics.map((metric: any) => metric.id));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header section */}
      <div className="px-6 py-4">
        <div className="flex items-center mb-4">
          <Link href="/partners">
            <Button variant="ghost" size="sm" className="mr-4 p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{partner.name}</h1>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-gray-600">{partner.description}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">Details</span>
                <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">Partner</span>
                <span className="text-sm text-gray-500">Owner: <span className="text-blue-600">NA</span></span>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">Joint action & business plan to drive growth with insurance business</p>

        {/* Activity Hub - positioned at the top for maximum visibility */}
        <PartnerActivityHub partnerId={parseInt(id!)} partnerName={partner.name} />

        {/* Custom tab styling to match design */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button 
              onClick={() => setActiveTab("okr-plans")}
              className={`py-2 px-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "okr-plans" 
                  ? "bg-blue-100 text-blue-700 border-blue-600" 
                  : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
              }`}
            >
              OKR plans
            </button>
            <button 
              onClick={() => setActiveTab("opportunities")}
              className={`py-2 px-1 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "opportunities" 
                  ? "bg-blue-100 text-blue-700 border-blue-600" 
                  : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
              }`}
            >
              Opportunities ({relatedOpportunities?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab("customers")}
              className={`py-2 px-1 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "customers" 
                  ? "bg-blue-100 text-blue-700 border-blue-600" 
                  : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
              }`}
            >
              Customers ({relatedCustomers?.length || 0})
            </button>
          </nav>
        </div>
      </div>

      {/* Content area */}
      <div className="px-6 py-6">
        {activeTab === "okr-plans" && (
          <div className="space-y-6">
            {/* Filters Section - Exact same as template page */}
            <div className="flex items-center space-x-4 bg-white p-4 rounded-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search metrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {tags?.map((tag: any) => (
                    <SelectItem key={tag.id} value={tag.name}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedRange} onValueChange={setSelectedRange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Target range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ranges</SelectItem>
                  <SelectItem value="0-50">0-50</SelectItem>
                  <SelectItem value="50-100">50-100</SelectItem>
                  <SelectItem value="100+">100+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions Bar */}
            {selectedMetrics.length > 0 && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                <span className="text-sm text-blue-700">
                  {selectedMetrics.length} metric{selectedMetrics.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Assign to Team
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            )}

            {/* Metrics Table - Exact same structure as template page */}
            {attachedMetrics.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No OKR metrics attached to this partner</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg">
                {Object.entries(groupedMetrics).map(([tagName, tagMetrics]: [string, any]) => (
                  <div key={tagName} className="mb-8">
                    {/* Tag Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span 
                          className="inline-block px-3 py-1 text-sm font-medium rounded-full text-white"
                          style={{ 
                            backgroundColor: tags?.find((tag: any) => tag.name === tagName)?.color || '#6B7280'
                          }}
                        >
                          {tagName}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({tagMetrics.length} metric{tagMetrics.length > 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>

                    {/* Metrics Table */}
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-gray-200">
                          <TableHead className="w-12">
                            <Checkbox
                              checked={tagMetrics.every((metric: any) => selectedMetrics.includes(metric.id))}
                              onCheckedChange={(checked) => {
                                const tagMetricIds = tagMetrics.map((metric: any) => metric.id);
                                if (checked) {
                                  setSelectedMetrics([...selectedMetrics, ...tagMetricIds.filter((id: number) => !selectedMetrics.includes(id))]);
                                } else {
                                  setSelectedMetrics(selectedMetrics.filter((id: number) => !tagMetricIds.includes(id)));
                                }
                              }}
                            />
                          </TableHead>
                          <TableHead className="text-left font-medium text-gray-900">Name</TableHead>
                          <TableHead className="text-left font-medium text-gray-900">Timeframe</TableHead>
                          <TableHead className="text-left font-medium text-gray-900">Milestone Frequency</TableHead>
                          <TableHead className="text-left font-medium text-gray-900">Target</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tagMetrics.map((metric: any) => (
                          <TableRow key={metric.id} className="group border-b border-gray-100 hover:bg-gray-50">
                            <TableCell>
                              <div className={`transition-opacity ${selectedMetrics.includes(metric.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <Checkbox
                                  checked={selectedMetrics.includes(metric.id)}
                                  onCheckedChange={(checked) => handleMetricSelect(metric.id, checked as boolean)}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900">{metric.name}</div>
                                <div className="text-sm text-gray-500">{metric.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-gray-700">{metric.timeframe || 'Not set'}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-gray-700">{metric.milestone_frequency || 'Not set'}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-900">
                                  {metric.target_value || '0'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {metric.measure_unit || ''}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleAddComment(metric)}>
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Add Comment
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Edit metric</DropdownMenuItem>
                                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    Remove from partner
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "opportunities" && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox /></TableHead>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Close Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedOpportunities?.map((opportunity: any) => (
                  <TableRow key={opportunity.id}>
                    <TableCell><Checkbox /></TableCell>
                    <TableCell>
                      <Link href={`/lists/opportunities/${opportunity.id}`}>
                        <span className="font-medium text-indigo-600 hover:underline cursor-pointer">
                          {opportunity.title}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">
                        {opportunity.clientName || 'Unknown Customer'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {opportunity.stage}
                      </span>
                    </TableCell>
                    <TableCell>
                      €{opportunity.estimated_value ? Number(opportunity.estimated_value).toLocaleString() : '0'}
                    </TableCell>
                    <TableCell>
                      {opportunity.expected_close_date ? new Date(opportunity.expected_close_date).toLocaleDateString() : 'Not set'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === "customers" && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox /></TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Opportunities</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedCustomers?.map((customer: any) => {
                  const customerOpportunities = relatedOpportunities?.filter((o: any) => o.clientName === customer.name) || [];
                  return (
                    <TableRow key={customer.id}>
                      <TableCell><Checkbox /></TableCell>
                      <TableCell>
                        <Link href={`/lists/customers/${customer.id}`}>
                          <span className="font-medium text-indigo-600 hover:underline cursor-pointer">
                            {customer.name}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>{customer.contact_name || 'Not set'}</TableCell>
                      <TableCell>{customer.contact_email || 'Not set'}</TableCell>
                      <TableCell>{customer.contact_phone || 'Not set'}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {customerOpportunities.length} opportunities
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Comment to OKR Metric</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedMetricForComment && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm">{selectedMetricForComment.name}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Current: {selectedMetricForComment.realized_value} {selectedMetricForComment.measure_unit}
                  {selectedMetricForComment.target_value && (
                    <span> / Target: {selectedMetricForComment.target_value} {selectedMetricForComment.measure_unit}</span>
                  )}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="comment-text">Comment</Label>
              <Textarea
                id="comment-text"
                placeholder="Add your comment about this metric..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assign-to">Assign to (optional)</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member to assign..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No assignment</SelectItem>
                  <SelectItem value="john.smith@company.com">
                    <div className="flex items-center space-x-2">
                      <UserPlus className="w-4 h-4" />
                      <span>John Smith</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="sarah.jones@company.com">
                    <div className="flex items-center space-x-2">
                      <UserPlus className="w-4 h-4" />
                      <span>Sarah Jones</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="mike.wilson@company.com">
                    <div className="flex items-center space-x-2">
                      <UserPlus className="w-4 h-4" />
                      <span>Mike Wilson</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={visibleToPartner}
                onCheckedChange={setVisibleToPartner}
              />
              <Label className="text-sm">Visible to partner</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCommentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || createCommentMutation.isPending}
              >
                {createCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}