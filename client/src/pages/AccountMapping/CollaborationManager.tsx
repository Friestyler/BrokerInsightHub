import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Share2, 
  UserPlus, 
  Mail, 
  Link, 
  Copy, 
  Eye, 
  EyeOff, 
  Users, 
  Shield, 
  Clock,
  MessageSquare,
  Bell,
  Download,
  ExternalLink,
  Settings,
  CheckCircle2,
  AlertCircle,
  Building2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

interface CollaborationManagerProps {
  projects: MappingProject[];
}

interface SharedList {
  id: number;
  name: string;
  description: string;
  entity_count: number;
  shared_with: string[];
  permissions: 'view' | 'edit' | 'admin';
  created_at: string;
  expires_at?: string;
}

export default function CollaborationManager({ projects }: CollaborationManagerProps) {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [sharePermissions, setSharePermissions] = useState('view');
  const [expirationDays, setExpirationDays] = useState('30');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [includeEntities, setIncludeEntities] = useState({
    confirmed_matches: true,
    high_confidence: false,
    all_matches: false
  });

  // Sample shared lists data
  const sharedLists: SharedList[] = [
    {
      id: 1,
      name: "Confirmed Partner Overlaps",
      description: "Validated matches between De Goudse and strategic partners",
      entity_count: 67,
      shared_with: ['partner@organization.com', 'analyst@strategicpartner.com'],
      permissions: 'edit',
      created_at: '2024-12-05',
      expires_at: '2025-01-05'
    },
    {
      id: 2,
      name: "High-Value Prospects",
      description: "Joint customer opportunities with revenue potential >€50K",
      entity_count: 23,
      shared_with: ['sales@partner.com'],
      permissions: 'view',
      created_at: '2024-12-08'
    }
  ];

  const handleShareProject = async () => {
    if (!selectedProject || !shareEmail) {
      toast({
        title: "Missing Information",
        description: "Please select a project and enter an email address",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/account-mapping/projects/${selectedProject}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: shareEmail,
          message: shareMessage,
          permissions: sharePermissions,
          expires_in_days: parseInt(expirationDays)
        })
      });

      if (response.ok) {
        toast({
          title: "Project Shared",
          description: `Project access granted to ${shareEmail}`,
        });
        setShowShareDialog(false);
        setShareEmail('');
        setShareMessage('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share project",
        variant: "destructive"
      });
    }
  };

  const handleCreateSharedList = async () => {
    if (!newListName) {
      toast({
        title: "Missing Information",
        description: "Please enter a list name",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/account-mapping/shared-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newListName,
          description: newListDescription,
          project_id: selectedProject,
          include_entities: includeEntities
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Shared List Created",
          description: `"${newListName}" created with ${result.entity_count} entities`,
        });
        setShowListDialog(false);
        setNewListName('');
        setNewListDescription('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create shared list",
        variant: "destructive"
      });
    }
  };

  const generateShareLink = (listId: number) => {
    const baseUrl = window.location.origin;
    const shareToken = `sl_${listId}_${Date.now()}`;
    return `${baseUrl}/share/list/${shareToken}`;
  };

  const copyShareLink = (listId: number) => {
    const link = generateShareLink(listId);
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Share link copied to clipboard",
    });
  };

  const collaborativeProjects = projects.filter(p => p.collaboration_status !== 'private');

  return (
    <div className="space-y-6">
      {/* Project Sharing */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Share2 className="h-5 w-5 mr-2" />
                Project Collaboration
              </CardTitle>
              <CardDescription>Share mapping projects with partners and manage permissions</CardDescription>
            </div>
            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Share Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Project</DialogTitle>
                  <DialogDescription>
                    Grant access to account mapping projects with specific permissions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="project">Select Project</Label>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a project to share" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id.toString()}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Partner Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      placeholder="partner@organization.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="permissions">Access Level</Label>
                    <Select value={sharePermissions} onValueChange={setSharePermissions}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">View Only</SelectItem>
                        <SelectItem value="edit">View & Edit</SelectItem>
                        <SelectItem value="admin">Full Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="expiration">Access Expiration</Label>
                    <Select value={expirationDays} onValueChange={setExpirationDays}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                        <SelectItem value="0">No expiration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message (optional)</Label>
                    <Input
                      id="message"
                      value={shareMessage}
                      onChange={(e) => setShareMessage(e.target.value)}
                      placeholder="Add a personal message for the invitation"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleShareProject}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {collaborativeProjects.map(project => (
              <div key={project.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{project.name}</h4>
                      <Badge className={project.collaboration_status === 'collaborative' ? 
                        'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }>
                        {project.collaboration_status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span>{project.party1_name} ⟷ {project.party2_name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{project.shared_with.length} collaborators</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>

                {project.shared_with.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shared Lists Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Link className="h-5 w-5 mr-2" />
                Shared Lists
              </CardTitle>
              <CardDescription>Create and manage shareable entity lists for collaboration</CardDescription>
            </div>
            <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Shared List
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Shared List</DialogTitle>
                  <DialogDescription>
                    Generate a shareable list of matched entities
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="listName">List Name</Label>
                    <Input
                      id="listName"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="e.g., Q1 2025 Partnership Opportunities"
                    />
                  </div>

                  <div>
                    <Label htmlFor="listDescription">Description</Label>
                    <Input
                      id="listDescription"
                      value={newListDescription}
                      onChange={(e) => setNewListDescription(e.target.value)}
                      placeholder="Brief description of the list contents"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sourceProject">Source Project</Label>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose source project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id.toString()}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Include Entities</Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={includeEntities.confirmed_matches}
                          onCheckedChange={(checked) => 
                            setIncludeEntities(prev => ({ ...prev, confirmed_matches: checked }))
                          }
                        />
                        <label className="text-sm">Confirmed Matches</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={includeEntities.high_confidence}
                          onCheckedChange={(checked) => 
                            setIncludeEntities(prev => ({ ...prev, high_confidence: checked }))
                          }
                        />
                        <label className="text-sm">High Confidence Suggestions (80%+)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={includeEntities.all_matches}
                          onCheckedChange={(checked) => 
                            setIncludeEntities(prev => ({ ...prev, all_matches: checked }))
                          }
                        />
                        <label className="text-sm">All Matches</label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowListDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateSharedList}>
                      Create List
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sharedLists.map(list => (
              <div key={list.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{list.name}</h4>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {list.entity_count} entities
                      </Badge>
                      <Badge className={list.permissions === 'admin' ? 
                        'bg-red-100 text-red-800' : 
                        list.permissions === 'edit' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }>
                        {list.permissions}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{list.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>Created {list.created_at}</span>
                      </div>
                      {list.expires_at && (
                        <div className="flex items-center space-x-1">
                          <AlertCircle className="h-4 w-4 text-orange-400" />
                          <span>Expires {list.expires_at}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => copyShareLink(list.id)}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Link
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>

                {list.shared_with.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium text-gray-600 mb-2">Shared with:</p>
                    <div className="flex flex-wrap gap-2">
                      {list.shared_with.map((email, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Mail className="h-3 w-3 mr-1" />
                          {email}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
          <CardDescription>Track collaboration activities and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">partner@organization.com confirmed 12 matches</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Share2 className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New shared list "High-Value Prospects" created</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Bell className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">analyst@strategicpartner.com requested access to project</p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}