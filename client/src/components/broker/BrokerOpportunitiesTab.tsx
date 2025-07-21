import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Search, Bot, Copy, Users, Trash2, MoreHorizontal, MoreVertical, MessageSquare, MessageCircle, 
  CheckCircle, XCircle, Eye, Edit, Filter, Package, Target, Crown, ChevronDown, ChevronRight, 
  Share2, X, Bookmark, Columns3, Send, AlertTriangle, Plus, Mail, Calendar, Clock, Play, Pause, AlertCircle 
} from "lucide-react";
import { FieldsSelector } from "@/components/shared/FieldsSelector";

interface BrokerOpportunitiesTabProps {
  partnerId: string;
  environment: string;
}

export default function BrokerOpportunitiesTab({ partnerId, environment }: BrokerOpportunitiesTabProps) {
  const { toast } = useToast();
  
  // Core state management
  const [activeTab, setActiveTab] = useState("opportunities");
  const [selectedOpportunities, setSelectedOpportunities] = useState<number[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    stage: 'All',
    priority: 'All',
    assessment: 'All'
  });
  
  // Saved lists and views state
  const [showSavedListsDropdown, setShowSavedListsDropdown] = useState(false);
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);
  const [activeList, setActiveList] = useState<any>(null);
  const [activeView, setActiveView] = useState<any>(null);
  const [isEditingList, setIsEditingList] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  
  // Fields visibility
  const [visibleFields, setVisibleFields] = useState({
    opportunity: true,
    customer: true,
    stage: true,
    priority: true,
    value: true,
    assessment: true,
    comments: true,
    lastActivity: true,
    actions: true
  });
  
  // Assessment and comments
  const [showWithholdModal, setShowWithholdModal] = useState(false);
  const [selectedOpportunityForAssessment, setSelectedOpportunityForAssessment] = useState<any>(null);
  const [selectedOpportunityForHistory, setSelectedOpportunityForHistory] = useState<any>(null);
  const [isCommentsHistoryDialogOpen, setIsCommentsHistoryDialogOpen] = useState(false);
  const [withholdReasons, setWithholdReasons] = useState<{ [key: string]: boolean }>({});
  const [withholdComment, setWithholdComment] = useState("");
  
  // Change detection for views
  const [originalFilters, setOriginalFilters] = useState<any>(null);
  const [originalVisibleFields, setOriginalVisibleFields] = useState<any>(null);

  // Fields configuration for FieldsSelector
  const opportunityFields = [
    { key: 'opportunity', label: 'Opportunity', required: true },
    { key: 'customer', label: 'Customer', required: true },
    { key: 'stage', label: 'Stage' },
    { key: 'priority', label: 'Priority' },
    { key: 'value', label: 'Value' },
    { key: 'assessment', label: 'Assessment' },
    { key: 'comments', label: 'Comments' },
    { key: 'lastActivity', label: 'Last Activity' },
    { key: 'actions', label: 'Actions', required: true }
  ];
  
  // Data fetching
  const { data: allOpportunities, isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['/api/opportunities', environment, partnerId],
    staleTime: 5 * 60 * 1000
  });
  
  const { data: savedLists } = useQuery({
    queryKey: ['/api/saved-lists', environment],
    staleTime: 5 * 60 * 1000
  });
  
  const { data: savedViews } = useQuery({
    queryKey: ['/api/saved-views', environment],
    staleTime: 5 * 60 * 1000
  });
  
  const { data: withholdReasonsData } = useQuery({
    queryKey: ['/api/withhold-reasons', environment],
    staleTime: 10 * 60 * 1000
  });
  
  const { data: commentsHistoryData } = useQuery({
    queryKey: ['/api/opportunity-comments', selectedOpportunityForHistory?.id, environment],
    enabled: !!selectedOpportunityForHistory?.id,
    staleTime: 1 * 60 * 1000
  });
  
  // Mutations
  const assessmentMutation = useMutation({
    mutationFn: async ({ opportunityId, assessment, reasons, comment }: any) => {
      return apiRequest(`/api/${environment}/opportunities/${opportunityId}/assessment`, {
        method: 'POST',
        body: { assessment, reasons, comment }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      toast({ title: "Assessment updated successfully" });
    }
  });
  
  // Helper functions
  const hasChanges = () => {
    if (!originalFilters || !originalVisibleFields) return false;
    return JSON.stringify(filters) !== JSON.stringify(originalFilters) ||
           JSON.stringify(visibleFields) !== JSON.stringify(originalVisibleFields);
  };
  
  const filteredOpportunities = allOpportunities?.filter((opp: any) => {
    const matchesSearch = !searchText || 
      opp.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      opp.customer_name?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStage = filters.stage === 'All' || opp.stage === filters.stage;
    const matchesPriority = filters.priority === 'All' || opp.priority === filters.priority;
    const matchesAssessment = filters.assessment === 'All' || opp.assessment_status === filters.assessment;
    
    return matchesSearch && matchesStage && matchesPriority && matchesAssessment;
  });
  
  const handleAssessment = (opportunity: any, assessment: string) => {
    if (assessment === 'withhold') {
      setSelectedOpportunityForAssessment(opportunity);
      setShowWithholdModal(true);
    } else {
      assessmentMutation.mutate({
        opportunityId: opportunity.id,
        assessment,
        reasons: {},
        comment: ""
      });
    }
  };
  
  const handleWithholdSubmit = () => {
    if (!selectedOpportunityForAssessment) return;
    
    assessmentMutation.mutate({
      opportunityId: selectedOpportunityForAssessment.id,
      assessment: 'withhold',
      reasons: withholdReasons,
      comment: withholdComment
    });
    
    setShowWithholdModal(false);
    setWithholdReasons({});
    setWithholdComment("");
    setSelectedOpportunityForAssessment(null);
  };
  
  return (
    <div className="space-y-4">
      {/* Enhanced saved lists section */}
      <div className="bg-white rounded-lg">
        <div className="space-y-0">
          {/* Save/Update/Clear View Buttons - Show when any changes detected */}
          {hasChanges() && (
            <div className="flex justify-end items-center gap-2 px-4 py-1">
              <button
                onClick={() => {
                  if (originalFilters) setFilters(originalFilters);
                  if (originalVisibleFields) setVisibleFields(originalVisibleFields);
                  setOriginalFilters(null);
                  setOriginalVisibleFields(null);
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
              <button
                onClick={() => setShowSaveViewModal(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
              >
                <Bookmark className="w-3 h-3" />
                Save as segment view
              </button>
            </div>
          )}

          {/* Statistics overview cards */}
          <div className="grid grid-cols-4 gap-6 p-6 pb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{filteredOpportunities?.length || 0}</div>
              <div className="text-sm text-gray-500">Total Opportunities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {filteredOpportunities?.filter((opp: any) => opp.stage === 'active').length || 0}
              </div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                €{filteredOpportunities?.reduce((sum: number, opp: any) => sum + (parseFloat(opp.estimated_value) || 0), 0).toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-500">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                €{filteredOpportunities?.reduce((sum: number, opp: any) => {
                  const value = parseFloat(opp.estimated_value) || 0;
                  const probability = parseFloat(opp.probability) || 0;
                  return sum + (value * probability / 100);
                }, 0).toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-500">Weighted Value</div>
            </div>
          </div>

          {/* Enhanced unified toolbar */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex flex-col gap-4">
              {/* Top row with saved lists and views */}
              <div className="flex flex-wrap items-center justify-between">
                {/* Saved Lists Dropdown */}
                <div className="relative">
                  <button 
                    className="flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                    onClick={() => setShowSavedListsDropdown(!showSavedListsDropdown)}
                  >
                    <Package className="w-4 h-4 text-indigo-600" />
                    <span className="text-gray-700">{activeList ? activeList.name : "Opportunity Lists"}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                
                {/* Right-side action buttons */}
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowShareModal(true)}
                    disabled={!activeList}
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                  <FieldsSelector
                    fields={opportunityFields}
                    visibleFields={Object.keys(visibleFields).filter(key => visibleFields[key as keyof typeof visibleFields])}
                    onFieldsChange={(fieldKeys) => {
                      const newVisibleFields = { ...visibleFields };
                      Object.keys(visibleFields).forEach(key => {
                        newVisibleFields[key as keyof typeof visibleFields] = fieldKeys.includes(key);
                      });
                      setVisibleFields(newVisibleFields);
                    }}
                  />
                </div>
              </div>
              
              {/* Bottom row with search, views, and filters */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 flex-grow">
                  {/* Search field */}
                  <div className="relative w-60">
                    <Input
                      type="text"
                      placeholder="Search opportunities..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  
                  {/* Saved Views Dropdown */}
                  <div className="relative">
                    <button 
                      className="flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                      onClick={() => setShowViewsDropdown(!showViewsDropdown)}
                    >
                      <Bookmark className="w-4 h-4 text-indigo-600" />
                      <span className="text-gray-700">{activeView ? activeView.name : "Select a view"}</span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  
                  {/* Filter dropdowns */}
                  <Select value={filters.stage} onValueChange={(value) => setFilters({...filters, stage: value})}>
                    <SelectTrigger className="w-32">
                      <Filter className="w-4 h-4 mr-1" />
                      <SelectValue placeholder="Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Stages</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="closed_won">Closed Won</SelectItem>
                      <SelectItem value="closed_lost">Closed Lost</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filters.assessment} onValueChange={(value) => setFilters({...filters, assessment: value})}>
                    <SelectTrigger className="w-32">
                      <Target className="w-4 h-4 mr-1" />
                      <SelectValue placeholder="Assessment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="withheld">Withheld</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk actions bar */}
          {selectedOpportunities.length > 0 && (
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-indigo-700 font-medium mr-2">
                  {selectedOpportunities.length} {selectedOpportunities.length === 1 ? 'opportunity' : 'opportunities'} selected
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-600"
                  onClick={() => setSelectedOpportunities([])}
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear selection
                </Button>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" className="text-indigo-600">
                  <Mail className="w-4 h-4 mr-1" />
                  Add to campaign
                </Button>
                <Button variant="outline" size="sm" className="text-indigo-600">
                  <Share2 className="w-4 h-4 mr-1" />
                  Export Selected
                </Button>
              </div>
            </div>
          )}

          {/* Opportunities Table */}
          {opportunitiesLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading opportunities...</div>
            </div>
          ) : (
            <div className="p-6 pt-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedOpportunities.length === filteredOpportunities?.length && filteredOpportunities?.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedOpportunities(filteredOpportunities?.map((opp: any) => opp.id) || []);
                          } else {
                            setSelectedOpportunities([]);
                          }
                        }}
                      />
                    </TableHead>
                    {visibleFields.opportunity && <TableHead className="font-semibold text-gray-900">Opportunity</TableHead>}
                    {visibleFields.customer && <TableHead className="font-semibold text-gray-900">Customer</TableHead>}
                    {visibleFields.stage && <TableHead className="font-semibold text-gray-900">Stage</TableHead>}
                    {visibleFields.value && <TableHead className="font-semibold text-gray-900">Value</TableHead>}
                    {visibleFields.assessment && <TableHead className="font-semibold text-gray-900">Assessment</TableHead>}
                    {visibleFields.comments && <TableHead className="font-semibold text-gray-900">Comments</TableHead>}
                    {visibleFields.actions && <TableHead className="font-semibold text-gray-900">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOpportunities?.map((opportunity: any) => (
                    <TableRow key={opportunity.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedOpportunities.includes(opportunity.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedOpportunities([...selectedOpportunities, opportunity.id]);
                            } else {
                              setSelectedOpportunities(selectedOpportunities.filter(id => id !== opportunity.id));
                            }
                          }}
                        />
                      </TableCell>
                      {visibleFields.opportunity && (
                        <TableCell className="font-medium">
                          <div>
                            <div className="text-gray-900">{opportunity.title}</div>
                            <div className="text-sm text-gray-500">{opportunity.description}</div>
                          </div>
                        </TableCell>
                      )}
                      {visibleFields.customer && (
                        <TableCell>
                          <div className="text-gray-900">{opportunity.customer_name}</div>
                        </TableCell>
                      )}
                      {visibleFields.stage && (
                        <TableCell>
                          <Badge variant={opportunity.stage === 'active' ? 'default' : 'secondary'}>
                            {opportunity.stage}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleFields.value && (
                        <TableCell>
                          <div className="text-gray-900">€{parseInt(opportunity.estimated_value || 0).toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{opportunity.probability}% probability</div>
                        </TableCell>
                      )}
                      {visibleFields.assessment && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {opportunity.assessment_status === 'pending' ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                  onClick={() => handleAssessment(opportunity, 'accept')}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                  onClick={() => handleAssessment(opportunity, 'withhold')}
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Withhold
                                </Button>
                              </>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={opportunity.assessment_status === 'accepted' ? 'default' : 'destructive'}
                                  className={opportunity.assessment_status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                                >
                                  {opportunity.assessment_status === 'accepted' ? 'Accepted' : 'Withheld'}
                                </Badge>
                                {opportunity.assessment_status === 'withheld' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 hover:bg-green-100"
                                    onClick={() => handleAssessment(opportunity, 'accept')}
                                  >
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                  </Button>
                                )}
                                {opportunity.assessment_status === 'accepted' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 hover:bg-red-100"
                                    onClick={() => handleAssessment(opportunity, 'withhold')}
                                  >
                                    <XCircle className="w-3 h-3 text-red-600" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      )}
                      {visibleFields.comments && (
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:bg-gray-100"
                            onClick={() => {
                              setSelectedOpportunityForHistory(opportunity);
                              setIsCommentsHistoryDialogOpen(true);
                            }}
                          >
                            <MessageCircle className="w-4 h-4 text-gray-500" />
                          </Button>
                        </TableCell>
                      )}
                      {visibleFields.actions && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Withhold Modal */}
      <Dialog open={showWithholdModal} onOpenChange={setShowWithholdModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Withhold Opportunity</DialogTitle>
            <DialogDescription>
              Please select the reasons for withholding this opportunity.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {withholdReasonsData?.map((reason: any) => (
                <div key={reason.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={reason.id}
                    checked={withholdReasons[reason.id] || false}
                    onCheckedChange={(checked) => 
                      setWithholdReasons({...withholdReasons, [reason.id]: checked as boolean})
                    }
                  />
                  <Label htmlFor={reason.id} className="text-sm">{reason.reason}</Label>
                </div>
              ))}
            </div>
            <div>
              <Label htmlFor="comment">Additional Comments</Label>
              <Textarea
                id="comment"
                value={withholdComment}
                onChange={(e) => setWithholdComment(e.target.value)}
                placeholder="Optional comments..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithholdModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleWithholdSubmit}
              disabled={Object.keys(withholdReasons).length === 0}
            >
              Withhold Opportunity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comments History Dialog */}
      <Dialog open={isCommentsHistoryDialogOpen} onOpenChange={setIsCommentsHistoryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Comments History - {selectedOpportunityForHistory?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {commentsHistoryData?.comments?.map((comment: any, index: number) => (
              <div key={index} className="border-b pb-3 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-sm">{comment.author_name || 'Unknown'}</div>
                  <div className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</div>
                </div>
                <div className="text-sm text-gray-700">{comment.content}</div>
                {comment.type === 'withhold' && comment.reasons && (
                  <div className="mt-2 text-xs text-red-600">
                    Withhold reasons: {Object.keys(comment.reasons).join(', ')}
                  </div>
                )}
              </div>
            ))}
            {(!commentsHistoryData?.comments || commentsHistoryData.comments.length === 0) && (
              <div className="text-center text-gray-500 py-8">No comments yet</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}