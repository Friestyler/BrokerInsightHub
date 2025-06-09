import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  Upload, 
  GitMerge, 
  Share2, 
  Eye, 
  Filter, 
  Download, 
  Settings,
  Plus,
  Search,
  FileSpreadsheet,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Building2,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Globe
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import UploadMappingWizard from "./UploadMappingWizard";
import CollaborationManager from "./CollaborationManager";
import OverlapAnalysis from "./OverlapAnalysis";

interface MappingProject {
  id: number;
  name: string;
  description: string;
  party1_name: string;
  party2_name: string;
  party1_entity_count: number;
  party2_entity_count: number;
  overlap_count: number;
  status: 'setup' | 'uploading' | 'mapping' | 'analyzing' | 'complete' | 'shared';
  created_at: string;
  updated_at: string;
  shared_with: string[];
  collaboration_status: 'private' | 'shared' | 'collaborative';
}

interface EntityMatch {
  id: number;
  party1_entity: any;
  party2_entity: any;
  match_confidence: number;
  match_type: 'exact' | 'high' | 'medium' | 'low' | 'manual';
  status: 'confirmed' | 'suggested' | 'rejected' | 'pending';
  shared_customers?: any[];
  potential_value?: number;
}

export default function AccountMappingHub() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [party1Name, setParty1Name] = useState('');
  const [party2Name, setParty2Name] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: mappingProjects } = useQuery({
    queryKey: ['/api/account-mapping/projects'],
    enabled: false // Disable for now, will use sample data
  });

  // Using actual data structure based on existing CRM entities
  const sampleProjects: MappingProject[] = [
    {
      id: 1,
      name: "Partner Network Overlap Analysis",
      description: "Cross-reference partner databases to identify mutual connections and opportunities",
      party1_name: "De Goudse",
      party2_name: "Partner Organization",
      party1_entity_count: 847,
      party2_entity_count: 1192,
      overlap_count: 67,
      status: 'complete',
      created_at: '2024-12-01',
      updated_at: '2024-12-08',
      shared_with: ['partner@organization.com'],
      collaboration_status: 'collaborative'
    },
    {
      id: 2,
      name: "Customer Base Comparison",
      description: "Analyze customer overlaps for joint service opportunities",
      party1_name: "De Goudse",
      party2_name: "Strategic Partner",
      party1_entity_count: 2547,
      party2_entity_count: 1823,
      overlap_count: 189,
      status: 'analyzing',
      created_at: '2024-12-05',
      updated_at: '2024-12-09',
      shared_with: ['contact@strategicpartner.com'],
      collaboration_status: 'shared'
    },
    {
      id: 3,
      name: "Vendor Relationship Mapping",
      description: "Map shared vendor relationships for negotiation leverage",
      party1_name: "De Goudse",
      party2_name: "Industry Peer",
      party1_entity_count: 312,
      party2_entity_count: 456,
      overlap_count: 0,
      status: 'mapping',
      created_at: '2024-12-07',
      updated_at: '2024-12-09',
      shared_with: [],
      collaboration_status: 'private'
    }
  ];

  const sampleMatches: EntityMatch[] = [
    {
      id: 1,
      party1_entity: {
        name: "Adviesgroep Financiële Planning B.V.",
        email: "info@afp.nl",
        phone: "+31 20 123 4567",
        location: "Amsterdam",
        industry: "Financial Services"
      },
      party2_entity: {
        name: "AFP Financiële Planning",
        email: "contact@afp.nl", 
        phone: "+31 20 123 4567",
        location: "Amsterdam, Netherlands",
        industry: "Insurance Advisory"
      },
      match_confidence: 0.95,
      match_type: 'exact',
      status: 'confirmed',
      shared_customers: ['Midsize Corp B.V.', 'Tech Solutions Amsterdam'],
      potential_value: 125000
    },
    {
      id: 2,
      party1_entity: {
        name: "Zorgverzekeringen Nederland",
        email: "info@zvn.nl",
        phone: "+31 30 987 6543",
        location: "Utrecht",
        industry: "Healthcare Insurance"
      },
      party2_entity: {
        name: "ZVN Zorgverzekeringen",
        email: "contact@zvn.com",
        phone: "+31 30 987 6543",
        location: "Utrecht",
        industry: "Health Insurance"
      },
      match_confidence: 0.87,
      match_type: 'high',
      status: 'suggested',
      potential_value: 85000
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'analyzing': return 'bg-blue-100 text-blue-800';
      case 'mapping': return 'bg-yellow-100 text-yellow-800';
      case 'uploading': return 'bg-purple-100 text-purple-800';
      case 'setup': return 'bg-gray-100 text-gray-800';
      case 'shared': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle2 className="h-4 w-4" />;
      case 'analyzing': return <Target className="h-4 w-4" />;
      case 'mapping': return <GitMerge className="h-4 w-4" />;
      case 'uploading': return <Upload className="h-4 w-4" />;
      case 'setup': return <Settings className="h-4 w-4" />;
      case 'shared': return <Share2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName || !party1Name || !party2Name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // API call to create new mapping project
      const response = await fetch('/api/account-mapping/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription,
          party1_name: party1Name,
          party2_name: party2Name
        })
      });

      if (response.ok) {
        toast({
          title: "Project Created",
          description: `Account mapping project "${newProjectName}" has been created successfully`,
        });

        setShowCreateDialog(false);
        setNewProjectName('');
        setNewProjectDescription('');
        setParty1Name('');
        setParty2Name('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredProjects = sampleProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.party1_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.party2_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Mapping</h1>
          <p className="text-gray-600 mt-2">Identify overlaps and collaboration opportunities between partner organizations</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              New Mapping Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Mapping Project</DialogTitle>
              <DialogDescription>
                Set up a new account mapping project to identify overlaps between organizations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., Partnership Mapping Q1 2025"
                />
              </div>
              <div>
                <Label htmlFor="projectDescription">Description (optional)</Label>
                <Input
                  id="projectDescription"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Brief description of mapping goals"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="party1">Party 1 Name</Label>
                  <Input
                    id="party1"
                    value={party1Name}
                    onChange={(e) => setParty1Name(e.target.value)}
                    placeholder="Your organization"
                  />
                </div>
                <div>
                  <Label htmlFor="party2">Party 2 Name</Label>
                  <Input
                    id="party2"
                    value={party2Name}
                    onChange={(e) => setParty2Name(e.target.value)}
                    placeholder="Partner organization"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProject}>
                  Create Project
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-md">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">{filteredProjects.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-md">
                <GitMerge className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Overlaps</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredProjects.reduce((sum, p) => sum + p.overlap_count, 0)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-md">
                <Share2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Shared Projects</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredProjects.filter(p => p.collaboration_status !== 'private').length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-md">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Potential Value</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">€1.2M</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="upload">Upload & Map</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <div className="flex space-x-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="setup">Setup</SelectItem>
                <SelectItem value="uploading">Uploading</SelectItem>
                <SelectItem value="mapping">Mapping</SelectItem>
                <SelectItem value="analyzing">Analyzing</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="shared">Shared</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projects List */}
          <div className="grid gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="mt-1">{project.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusIcon(project.status)}
                        <span className="ml-1 capitalize">{project.status}</span>
                      </Badge>
                      {project.collaboration_status === 'collaborative' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Collaborative
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Organizations</p>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                          {project.party1_name}
                        </div>
                        <div className="flex items-center text-sm">
                          <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                          {project.party2_name}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Entity Counts</p>
                      <div className="space-y-1">
                        <p className="text-sm">{project.party1_name}: {project.party1_entity_count.toLocaleString()}</p>
                        <p className="text-sm">{project.party2_name}: {project.party2_entity_count.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Overlap Analysis</p>
                      <div className="flex items-center">
                        <div className="text-2xl font-bold text-indigo-600">{project.overlap_count}</div>
                        <div className="ml-2 text-sm text-gray-500">matches found</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Actions</p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {project.collaboration_status !== 'private' && (
                          <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {project.shared_with.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-gray-600 mb-2">Shared with:</p>
                      <div className="flex flex-wrap gap-2">
                        {project.shared_with.map((email, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Mail className="h-3 w-3 mr-1" />
                            {email}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <UploadMappingWizard />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <OverlapAnalysis matches={sampleMatches} />
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <CollaborationManager projects={filteredProjects} />
        </TabsContent>
      </Tabs>
    </div>
  );
}