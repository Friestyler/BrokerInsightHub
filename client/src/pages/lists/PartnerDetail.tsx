import { useState, useRef, DragEvent, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressCard } from "@fortawesome/free-solid-svg-icons";
import { format } from 'date-fns';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AdvancedTimeframeFilter } from "@/components/ui/advanced-timeframe-filter";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PartnerOKRTable } from "@/components/PartnerOKRTable";
import { CalendarIcon } from "lucide-react";

// Mock data
const mockPartnerData = {
  id: 2,
  name: "ABC Insurance Brokers",
  description: "Leading insurance brokerage specializing in commercial and personal lines",
  initials: "AI",
  industry: "Insurance",
  type: "Broker",
  size: "Mid-market",
  address: "456 Business Ave, Commerce City, CC 67890",
  customers: 127,
  opportunities: 18,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-05-20'),
  owner: {
    id: 2,
    name: "Sarah Johnson",
    initials: "SJ",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
  },
  team: [
    { id: 2, name: "Sarah Johnson", initials: "SJ", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    { id: 3, name: "Mike Chen", initials: "MC", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" }
  ]
};

const mockAssignedOKRs = [
  {
    id: 1,
    title: "Increase Revenue Stream",
    description: "Focus on expanding our core revenue channels",
    targetValue: 5000000,
    realizedValue: 3200000,
    unit: 'currency' as const,
    tags: ['Financial'],
    type: 'Objective',
    endDate: '2024-12-31',
    parent: undefined
  },
  {
    id: 2,
    title: "Q1 Sales Target",
    description: "Achieve quarterly sales milestone",
    targetValue: 1250000,
    realizedValue: 980000,
    unit: 'currency' as const,
    tags: ['Financial'],
    type: 'Key Result',
    endDate: '2024-03-31',
    parent: 1
  },
  {
    id: 3,
    title: "Customer Satisfaction",
    description: "Improve overall customer satisfaction scores",
    targetValue: 95,
    realizedValue: 87,
    unit: 'percentage' as const,
    tags: ['Customer'],
    type: 'Objective',
    endDate: '2024-12-31',
    parent: undefined
  }
];

function OKRPlansSection({ partnerId }: { partnerId: string }) {
  const [selectedOKRs, setSelectedOKRs] = useState<number[]>([]);
  const [expandedOKRs, setExpandedOKRs] = useState<Set<number>>(new Set());
  const [creatingUnderOKR, setCreatingUnderOKR] = useState<number | null>(null);
  const [newOKRName, setNewOKRName] = useState("");
  const [newOKRType, setNewOKRType] = useState<string>('number');

  const toggleOKRExpansion = (id: number) => {
    setExpandedOKRs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const startOKRCreation = (parentId: number) => {
    setCreatingUnderOKR(parentId);
    setNewOKRName("");
    setNewOKRType('number');
  };

  const cancelOKRCreation = () => {
    setCreatingUnderOKR(null);
    setNewOKRName("");
  };

  const handleOKRCreation = (parentId: number, title: string, type: string) => {
    console.log('Creating OKR:', { parentId, title, type });
    cancelOKRCreation();
  };

  // Group OKRs by tag
  const groupOKRs = (okrs: any[]) => {
    return okrs.reduce((groups: any, okr: any) => {
      const tag = okr.tags?.[0] || 'No Tag';
      if (!groups[tag]) {
        groups[tag] = [];
      }
      groups[tag].push(okr);
      return groups;
    }, {});
  };

  const groupedOKRs = groupOKRs(mockAssignedOKRs);
  const sortedGroups = Object.entries(groupedOKRs);

  const TagBadgeLocal = ({ tag }: { tag: string }) => {
    const tagColors: Record<string, string> = {
      'Financial': '#10B981',
      'Customer': '#3B82F6',
      'Operations': '#F59E0B',
      'Growth': '#8B5CF6'
    };

    return (
      <div 
        className="px-3 py-1 rounded-lg text-white text-sm font-medium"
        style={{ backgroundColor: tagColors[tag] || '#6B7280' }}
      >
        {tag}
      </div>
    );
  };

  return (
    <div className="p-6">
      {mockAssignedOKRs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-lg font-medium mb-1 text-gray-900">No OKR Templates Assigned</p>
          <p className="text-sm text-gray-500">This partner doesn't have any OKR templates assigned yet.</p>
        </div>
      ) : (
        <div>
          {sortedGroups.map(([groupName, okrsInGroup]) => (
            <div key={groupName} className="bg-white" style={{ marginBottom: '32px' }}>
              <div className="px-6 pb-0 pt-3 bg-[#ffffff] text-[#282A3F]">
                <div className="flex items-center">
                  {groupName === "No Tag" ? (
                    <div className="px-3 py-1 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium border border-dashed border-gray-400">
                      {groupName}
                    </div>
                  ) : (
                    <TagBadgeLocal tag={groupName} />
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <PartnerOKRTable
                  okrs={okrsInGroup as any}
                  showInlineCreation={true}
                  onCreateOKR={handleOKRCreation}
                  creatingUnderOKR={creatingUnderOKR}
                  onStartCreation={startOKRCreation}
                  onCancelCreation={cancelOKRCreation}
                  newOKRName={newOKRName}
                  onNewOKRNameChange={setNewOKRName}
                  newOKRType={newOKRType}
                  onNewOKRTypeChange={(type: string) => setNewOKRType(type)}
                  className="border-b min-w-full"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PartnerDetail() {
  const { id } = useParams();
  const partner = mockPartnerData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/partners">
              <Button variant="ghost" size="sm" className="p-2">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-blue-500 text-white font-semibold">
                  {partner.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{partner.name}</h1>
                <p className="text-gray-600">{partner.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="okr" className="w-full">
          <TabsContent value="okr" className="mt-4">
            <OKRPlansSection partnerId={id || '1'} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}