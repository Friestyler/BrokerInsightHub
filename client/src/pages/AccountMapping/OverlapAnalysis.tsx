import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  CheckCircle2, 
  X, 
  Eye, 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin, 
  Building2,
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Filter,
  Download,
  Share2,
  GitMerge,
  AlertTriangle,
  Info
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EntityMatch {
  id: number;
  party1_entity: any;
  party2_entity: any;
  match_confidence: number;
  match_type: 'exact' | 'high' | 'medium' | 'low' | 'manual';
  status: 'confirmed' | 'suggested' | 'rejected' | 'pending';
  shared_customers?: any[];
  potential_value?: number;
  matching_fields?: string[];
  confidence_breakdown?: { [key: string]: number };
}

interface OverlapAnalysisProps {
  matches: EntityMatch[];
}

export default function OverlapAnalysis({ matches }: OverlapAnalysisProps) {
  const [selectedMatches, setSelectedMatches] = useState<number[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterConfidence, setFilterConfidence] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState<number | null>(null);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 0.7) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'suggested': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (matchId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/account-mapping/matches/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast({
          title: "Status Updated",
          description: `Match status updated to ${newStatus}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update match status",
        variant: "destructive"
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedMatches.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select matches to perform bulk actions",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/account-mapping/matches/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_ids: selectedMatches,
          action: action
        })
      });

      if (response.ok) {
        toast({
          title: "Bulk Action Complete",
          description: `${action} applied to ${selectedMatches.length} matches`,
        });
        setSelectedMatches([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive"
      });
    }
  };

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.party1_entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.party2_entity.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || match.status === filterStatus;
    const matchesConfidence = filterConfidence === 'all' || 
      (filterConfidence === 'high' && match.match_confidence >= 0.8) ||
      (filterConfidence === 'medium' && match.match_confidence >= 0.5 && match.match_confidence < 0.8) ||
      (filterConfidence === 'low' && match.match_confidence < 0.5);
    
    return matchesSearch && matchesStatus && matchesConfidence;
  });

  const stats = {
    total: matches.length,
    confirmed: matches.filter(m => m.status === 'confirmed').length,
    suggested: matches.filter(m => m.status === 'suggested').length,
    pending: matches.filter(m => m.status === 'pending').length,
    totalValue: matches.reduce((sum, m) => sum + (m.potential_value || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-md">
                <GitMerge className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Matches</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-md">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-md">
                <Target className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Suggested</p>
                <p className="text-2xl font-bold text-gray-900">{stats.suggested}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-md">
                <Info className="h-5 w-5 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-md">
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">€{(stats.totalValue / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Match Analysis</CardTitle>
              <CardDescription>Review and validate entity matches between organizations</CardDescription>
            </div>
            <div className="flex space-x-2">
              {selectedMatches.length > 0 && (
                <>
                  <Button variant="outline" onClick={() => handleBulkAction('confirm')}>
                    Confirm Selected ({selectedMatches.length})
                  </Button>
                  <Button variant="outline" onClick={() => handleBulkAction('reject')}>
                    Reject Selected
                  </Button>
                </>
              )}
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Search matches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="suggested">Suggested</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterConfidence} onValueChange={setFilterConfidence}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confidence</SelectItem>
                <SelectItem value="high">High (80%+)</SelectItem>
                <SelectItem value="medium">Medium (50-79%)</SelectItem>
                <SelectItem value="low">Low (under 50%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Matches List */}
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <div key={match.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Checkbox
                      checked={selectedMatches.includes(match.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMatches(prev => [...prev, match.id]);
                        } else {
                          setSelectedMatches(prev => prev.filter(id => id !== match.id));
                        }
                      }}
                    />

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Party 1 Entity */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{match.party1_entity.name}</span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          {match.party1_entity.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="h-3 w-3" />
                              <span>{match.party1_entity.email}</span>
                            </div>
                          )}
                          {match.party1_entity.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-3 w-3" />
                              <span>{match.party1_entity.phone}</span>
                            </div>
                          )}
                          {match.party1_entity.location && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-3 w-3" />
                              <span>{match.party1_entity.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Party 2 Entity */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{match.party2_entity.name}</span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          {match.party2_entity.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="h-3 w-3" />
                              <span>{match.party2_entity.email}</span>
                            </div>
                          )}
                          {match.party2_entity.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-3 w-3" />
                              <span>{match.party2_entity.phone}</span>
                            </div>
                          )}
                          {match.party2_entity.location && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-3 w-3" />
                              <span>{match.party2_entity.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={getConfidenceColor(match.match_confidence)}>
                        {Math.round(match.match_confidence * 100)}% Match
                      </Badge>
                      <Badge className={getStatusColor(match.status)}>
                        {match.status}
                      </Badge>
                      {match.potential_value && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          €{(match.potential_value / 1000).toFixed(0)}K Value
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => setShowDetails(match.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Select onValueChange={(value) => handleStatusUpdate(match.id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirm</SelectItem>
                        <SelectItem value="rejected">Reject</SelectItem>
                        <SelectItem value="pending">Mark Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {match.shared_customers && match.shared_customers.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-600">
                        {match.shared_customers.length} Shared Customers:
                      </span>
                      <span className="text-gray-600">
                        {match.shared_customers.slice(0, 3).join(', ')}
                        {match.shared_customers.length > 3 && ' ...'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Match Details Dialog */}
      {showDetails && (
        <Dialog open={!!showDetails} onOpenChange={() => setShowDetails(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Match Details</DialogTitle>
              <DialogDescription>
                Detailed analysis of entity match
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Confidence Breakdown */}
              <div>
                <h4 className="font-medium mb-3">Confidence Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Name Similarity</span>
                    <Badge>85%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Email Match</span>
                    <Badge>100%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Phone Match</span>
                    <Badge>100%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Location Similarity</span>
                    <Badge>90%</Badge>
                  </div>
                </div>
              </div>

              {/* Potential Opportunities */}
              <div>
                <h4 className="font-medium mb-3">Potential Opportunities</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-800">Cross-selling</div>
                    <div className="text-sm text-blue-600">Joint product offerings</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-800">Referral Programs</div>
                    <div className="text-sm text-green-600">Mutual customer referrals</div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}