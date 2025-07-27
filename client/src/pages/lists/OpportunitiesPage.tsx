import { useState, useEffect } from 'react';
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from '@/lib/queryClient';
import { useLocation, Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { FieldsSelector } from "@/components/shared/FieldsSelector";
import { 
  Search, 
  Plus, 
  X, 
  Bookmark, 
  BarChart3, 
  ChevronDown, 
  Filter,
  LayoutGrid,
  List,
  MessageSquare,
  Target,
  Columns3,
  MoreVertical,
  Download,
  Eye,
  Edit,
  Trash2,
  Users,
  Share2,
  Check,
  CheckSquare,
  MoreHorizontal
} from 'lucide-react';

// Type definitions
interface SavedList {
  id: number;
  name: string;
  description?: string;
  entity_type: string;
  members?: any[];
}

interface SavedView {
  id: number;
  name: string;
  entity_type: string;
  filters?: any;
  fields?: any;
}

export default function OpportunitiesPage() {
  const { environment } = useEnvironment();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  
  const currentEnvironment = environment?.id || 'degoudse';

  // Filtering state for opportunities - EXACT COPY from PartnerDetail.tsx
  const [opportunityFilters, setOpportunityFilters] = useState({
    status: 'All',
    stage: 'All',
    size: 'All',
    type: 'All'
  });

  // Visible fields for opportunities - EXACT COPY from PartnerDetail.tsx  
  const [opportunityVisibleFields, setOpportunityVisibleFields] = useState({
    title: true,
    customer: true,
    stage: true,
    value: true,
    lastActivity: true,
    type: true
  });

  // List and view management state
  const [activeList, setActiveList] = useState<any>(null);
  const [activeOpportunityView, setActiveOpportunityView] = useState<SavedView | null>(null);
  const [originalOpportunityFilters, setOriginalOpportunityFilters] = useState<any>(null);
  const [originalOpportunityVisibleFields, setOriginalOpportunityVisibleFields] = useState<any>(null);

  // Selection and UI state
  const [selectedOpportunities, setSelectedOpportunities] = useState<number[]>([]);
  const [filterText, setFilterText] = useState("");
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('list');

  // Modal states
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [showShareListModal, setShowShareListModal] = useState(false);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [showWithholdModal, setShowWithholdModal] = useState(false);
  const [selectedOpportunityForWithhold, setSelectedOpportunityForWithhold] = useState<any>(null);

  // Form states
  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [viewName, setViewName] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [withholdReasons, setWithholdReasons] = useState<string[]>([]);
  const [withholdComment, setWithholdComment] = useState("");

  // Fetch all opportunities (with optional list filtering)
  const { data: allOpportunities, isLoading: opportunitiesLoading } = useQuery({
    queryKey: [`/api/${currentEnvironment}/opportunities`, activeList?.id],
    queryFn: () => {
      const url = activeList?.id 
        ? `/api/${currentEnvironment}/opportunities?listId=${activeList.id}`
        : `/api/${currentEnvironment}/opportunities`;
      return apiRequest('GET', url);
    },
    staleTime: 0,
    gcTime: 0,
  });

  // Fetch saved lists
  const { data: savedListsData } = useQuery({
    queryKey: [`/api/${currentEnvironment}/saved-lists`, 'opportunities', 'all'],
    queryFn: () => apiRequest('GET', '/api/saved-lists?entity_type=opportunities'),
    staleTime: 0,
    gcTime: 0,
  });

  // Fetch saved views
  const { data: savedViewsData } = useQuery({
    queryKey: [`/api/${currentEnvironment}/saved-views`, 'opportunities'],
    queryFn: () => apiRequest('GET', '/api/saved-views?entity_type=opportunities'),
  });

  // Fetch withhold reasons
  const { data: withholdReasonsData } = useQuery({
    queryKey: [`/api/${currentEnvironment}/opportunity-withhold-reasons`],
    queryFn: () => apiRequest('GET', '/api/opportunity-withhold-reasons'),
  });

  const opportunities = Array.isArray(allOpportunities) ? allOpportunities : [];
  const savedLists = Array.isArray(savedListsData) ? savedListsData : [];
  const savedViews = Array.isArray(savedViewsData) ? savedViewsData : [];
  const availableWithholdReasons = Array.isArray(withholdReasonsData) ? withholdReasonsData : [];

  // Filter opportunities based on search and filters (list filtering is now handled in the query)
  const filteredOpportunities = opportunities.filter((opportunity: any) => {
    // Apply text search
    if (filterText) {
      const searchText = filterText.toLowerCase();
      if (!(
        opportunity.title?.toLowerCase().includes(searchText) ||
        opportunity.clientName?.toLowerCase().includes(searchText) ||
        opportunity.stage?.toLowerCase().includes(searchText)
      )) {
        return false;
      }
    }

    // Apply other filters
    if (opportunityFilters.status !== 'All' && opportunity.status !== opportunityFilters.status) {
      return false;
    }
    if (opportunityFilters.stage !== 'All' && opportunity.stage !== opportunityFilters.stage) {
      return false;
    }

    return true;
  });

  // Check if there are changes to save
  const hasOpportunityChanges = () => {
    if (!activeOpportunityView) return false;
    
    const filtersChanged = JSON.stringify(opportunityFilters) !== JSON.stringify(originalOpportunityFilters);
    const fieldsChanged = JSON.stringify(opportunityVisibleFields) !== JSON.stringify(originalOpportunityVisibleFields);
    
    return filtersChanged || fieldsChanged;
  };

  // Selection functions
  const isOpportunitySelected = (id: number) => selectedOpportunities.includes(id);
  
  const toggleSelectOpportunity = (id: number) => {
    setSelectedOpportunities(prev => 
      prev.includes(id) 
        ? prev.filter(oppId => oppId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOpportunities.length === filteredOpportunities.length) {
      setSelectedOpportunities([]);
    } else {
      setSelectedOpportunities(filteredOpportunities.map((opp: any) => opp.id));
    }
  };

  // Mutations for CRUD operations
  const createListMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; opportunityIds: number[] }) => {
      return await apiRequest('POST', '/api/saved-lists', {
        name: data.name,
        description: data.description,
        entity_type: 'opportunities',
        entity_ids: data.opportunityIds
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-lists'] });
      setShowSaveListModal(false);
      setSelectedOpportunities([]);
      toast({ title: "Success", description: "List created successfully" });
    }
  });

  const updateAssessmentMutation = useMutation({
    mutationFn: async ({ opportunityId, assessment, reasons, comment }: any) => {
      return await apiRequest('POST', `/api/${currentEnvironment}/opportunities/${opportunityId}/assessment`, {
        assessment,
        withhold_reasons: reasons,
        comment
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${currentEnvironment}/opportunities`] });
      toast({ title: "Success", description: "Assessment updated successfully" });
    }
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
            <p className="text-gray-600">Manage and track all opportunities</p>
          </div>
          <Button className="bg-[#5567E5] hover:bg-[#4556D4] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create opportunity
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center gap-4">
          {/* Left side - Lists and filters */}
          <div className="flex items-center gap-3">
            {/* Saved Lists Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-gray-700">
                  <Bookmark className="w-4 h-4 mr-2" />
                  {activeList ? activeList.name : 'All opportunities'}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuItem onClick={() => setActiveList(null)}>
                  <div className="flex items-center justify-between w-full">
                    <span>All opportunities</span>
                    <span className="text-sm text-gray-500">{opportunities.length}</span>
                  </div>
                </DropdownMenuItem>
                {savedLists.map((list: any) => (
                  <DropdownMenuItem key={list.id} onClick={() => setActiveList(list)}>
                    <div className="flex items-center justify-between w-full">
                      <span>{list.name}</span>
                      <span className="text-sm text-gray-500">{list.members?.length || 0}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Saved Views Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-gray-700">
                  <Eye className="w-4 h-4 mr-2" />
                  {activeOpportunityView ? activeOpportunityView.name : 'Default view'}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => setActiveOpportunityView(null)}>
                  Default view
                </DropdownMenuItem>
                {savedViews.map((view: any) => (
                  <DropdownMenuItem key={view.id} onClick={() => setActiveOpportunityView(view)}>
                    {view.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={() => setShowSaveViewModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New view
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right side - Search and actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search opportunities..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* Fields Selector */}
            <FieldsSelector
              fields={[
                { key: 'title', label: 'Opportunity', required: true },
                { key: 'customer', label: 'Customer', required: false },
                { key: 'stage', label: 'Stage', required: false },
                { key: 'value', label: 'Value', required: false },
                { key: 'lastActivity', label: 'Close Date', required: false },
                { key: 'type', label: 'Type', required: false }
              ]}
              visibleFields={Object.keys(opportunityVisibleFields).filter(key => opportunityVisibleFields[key as keyof typeof opportunityVisibleFields])}
              onFieldsChange={(fields) => {
                const newVisibleFields = {
                  title: fields.includes('title'),
                  customer: fields.includes('customer'),
                  stage: fields.includes('stage'),
                  value: fields.includes('value'),
                  lastActivity: fields.includes('lastActivity'),
                  type: fields.includes('type')
                };
                setOpportunityVisibleFields(newVisibleFields);
              }}
            />

            {/* Export Button */}
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedOpportunities.length > 0 && (
        <div className="mx-4 bg-blue-50 px-4 py-3 rounded-lg border border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-700 font-medium">
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
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSaveListModal(true)}
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Add to list
            </Button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="mx-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{filteredOpportunities.length}</div>
          <div className="text-sm text-gray-500">Total Opportunities</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            €{filteredOpportunities.reduce((sum: number, opp: any) => sum + (Number(opp.estimated_value) || 0), 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Total Value</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            €{Math.round(filteredOpportunities.reduce((sum: number, opp: any) => {
              const value = Number(opp.estimated_value) || 0;
              const probability = opp.stage === 'Closed (Won)' ? 1.0 : 
                                opp.stage === 'Negotiation' ? 0.7 :
                                opp.stage === 'Proposal Sent to Client' ? 0.6 :
                                opp.stage === 'Qualified Lead' ? 0.4 : 0.2;
              return sum + (value * probability);
            }, 0)).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Weighted Value</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {filteredOpportunities.filter((opp: any) => opp.stage === 'Closed (Won)').length}
          </div>
          <div className="text-sm text-gray-500">Won Opportunities</div>
        </div>
      </div>

      {/* Main Table */}
      <div className="mx-4 bg-white rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedOpportunities.length === filteredOpportunities.length && filteredOpportunities.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              {opportunityVisibleFields.title && <TableHead>Opportunity</TableHead>}
              {opportunityVisibleFields.customer && <TableHead>Customer</TableHead>}
              <TableHead>Related contacts</TableHead>
              {opportunityVisibleFields.type && <TableHead>Start Date</TableHead>}
              {opportunityVisibleFields.type && <TableHead>Insurance Description</TableHead>}
              {opportunityVisibleFields.stage && <TableHead>Stage</TableHead>}
              {opportunityVisibleFields.value && <TableHead>Value</TableHead>}
              {opportunityVisibleFields.lastActivity && <TableHead>Close Date</TableHead>}
              <TableHead className="w-[200px]">Assessment</TableHead>
              <TableHead className="w-[80px]">Comments</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOpportunities.map((opportunity: any) => (
              <TableRow key={opportunity.id} className="group hover:bg-gray-50">
                <TableCell>
                  <div className={`transition-opacity ${
                    isOpportunitySelected(opportunity.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <Checkbox 
                      checked={isOpportunitySelected(opportunity.id)}
                      onCheckedChange={() => toggleSelectOpportunity(opportunity.id)}
                    />
                  </div>
                </TableCell>
                {opportunityVisibleFields.title && (
                  <TableCell>
                    <Link href={`/lists/opportunities/${opportunity.id}`}>
                      <span className="font-medium text-blue-600 hover:underline cursor-pointer">
                        {opportunity.title}
                      </span>
                    </Link>
                  </TableCell>
                )}
                {opportunityVisibleFields.customer && (
                  <TableCell>
                    <span className="text-gray-900">
                      {opportunity.clientName || 'Unknown Customer'}
                    </span>
                  </TableCell>
                )}
                <TableCell>
                  <span className="text-gray-600">-</span>
                </TableCell>
                {opportunityVisibleFields.type && (
                  <TableCell>
                    {opportunity.start_date 
                      ? new Date(opportunity.start_date).toLocaleDateString()
                      : 'Not set'
                    }
                  </TableCell>
                )}
                {opportunityVisibleFields.type && (
                  <TableCell>
                    <span className="text-gray-600">
                      {opportunity.type || 'Not specified'}
                    </span>
                  </TableCell>
                )}
                {opportunityVisibleFields.stage && (
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {opportunity.stage || 'Unknown'}
                    </Badge>
                  </TableCell>
                )}
                {opportunityVisibleFields.value && (
                  <TableCell>
                    <span className="font-medium">
                      €{Number(opportunity.estimated_value || 0).toLocaleString()}
                    </span>
                  </TableCell>
                )}
                {opportunityVisibleFields.lastActivity && (
                  <TableCell>
                    {opportunity.expected_close_date 
                      ? new Date(opportunity.expected_close_date).toLocaleDateString()
                      : 'Not set'
                    }
                  </TableCell>
                )}
                <TableCell>
                  {opportunity.assessment === 'Accept' ? (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200">Accepted</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        onClick={() => {
                          setSelectedOpportunityForWithhold(opportunity);
                          setShowWithholdModal(true);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : opportunity.assessment === 'Withhold' ? (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800 border-red-200">Withheld</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                        onClick={() => {
                          updateAssessmentMutation.mutate({
                            opportunityId: opportunity.id,
                            assessment: 'Accept',
                            reasons: [],
                            comment: ''
                          });
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => {
                          updateAssessmentMutation.mutate({
                            opportunityId: opportunity.id,
                            assessment: 'Accept',
                            reasons: [],
                            comment: ''
                          });
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          setSelectedOpportunityForWithhold(opportunity);
                          setShowWithholdModal(true);
                        }}
                      >
                        Withhold
                      </Button>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                  </Button>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Save List Modal */}
      <Dialog open={showSaveListModal} onOpenChange={setShowSaveListModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Selection as List</DialogTitle>
            <DialogDescription>
              Create a new list with {selectedOpportunities.length} selected opportunities
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="listName">List Name</Label>
              <Input
                id="listName"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="Enter list name"
              />
            </div>
            <div>
              <Label htmlFor="listDescription">Description (Optional)</Label>
              <Textarea
                id="listDescription"
                value={listDescription}
                onChange={(e) => setListDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveListModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                createListMutation.mutate({
                  name: listName,
                  description: listDescription,
                  opportunityIds: selectedOpportunities
                });
                setListName("");
                setListDescription("");
              }}
              disabled={!listName}
            >
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withhold Modal */}
      <Dialog open={showWithholdModal} onOpenChange={setShowWithholdModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withhold Opportunity</DialogTitle>
            <DialogDescription>
              Select reasons for withholding this opportunity
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reasons for withholding</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {availableWithholdReasons.map((reason: any) => (
                  <div key={reason.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`reason-${reason.id}`}
                      checked={withholdReasons.includes(reason.reason)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setWithholdReasons([...withholdReasons, reason.reason]);
                        } else {
                          setWithholdReasons(withholdReasons.filter(r => r !== reason.reason));
                        }
                      }}
                    />
                    <Label htmlFor={`reason-${reason.id}`} className="text-sm">
                      {reason.reason}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="withholdComment">Additional Comments</Label>
              <Textarea
                id="withholdComment"
                value={withholdComment}
                onChange={(e) => setWithholdComment(e.target.value)}
                placeholder="Enter additional comments"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowWithholdModal(false);
              setWithholdReasons([]);
              setWithholdComment("");
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedOpportunityForWithhold) {
                  updateAssessmentMutation.mutate({
                    opportunityId: selectedOpportunityForWithhold.id,
                    assessment: 'Withhold',
                    reasons: withholdReasons,
                    comment: withholdComment
                  });
                }
                setShowWithholdModal(false);
                setWithholdReasons([]);
                setWithholdComment("");
              }}
              disabled={withholdReasons.length === 0}
            >
              Withhold Opportunity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}