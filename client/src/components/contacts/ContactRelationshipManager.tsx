import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Building2, Target, UserCheck, Trash2, Edit, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ContactRelationship {
  id: number;
  contact_id: number;
  entity_type: 'opportunity' | 'project' | 'customer' | 'partner' | 'contact';
  entity_id: number;
  relationship_type: string;
  role?: string;
  is_primary: boolean;
  notes?: string;
  entity_name?: string;
  entity_status?: string;
  created_at: string;
}

interface Entity {
  id: number;
  name: string;
  status?: string;
}

interface ContactRelationshipManagerProps {
  contactId: number;
  envId?: string;
}

const ENTITY_TYPES = [
  { value: 'opportunity', label: 'Opportunities', icon: Target, color: 'bg-green-100 text-green-800' },
  { value: 'customer', label: 'Customers', icon: Building2, color: 'bg-blue-100 text-blue-800' },
  { value: 'partner', label: 'Partners', icon: Users, color: 'bg-purple-100 text-purple-800' },
  { value: 'contact', label: 'Contacts', icon: UserCheck, color: 'bg-gray-100 text-gray-800' }
];

const RELATIONSHIP_TYPES = [
  { value: 'primary', label: 'Primary Contact' },
  { value: 'secondary', label: 'Secondary Contact' },
  { value: 'associated', label: 'Associated' },
  { value: 'reports_to', label: 'Reports To' },
  { value: 'collaborates_with', label: 'Collaborates With' },
  { value: 'decision_maker', label: 'Decision Maker' },
  { value: 'technical_contact', label: 'Technical Contact' },
  { value: 'financial_contact', label: 'Financial Contact' }
];

export default function ContactRelationshipManager({ contactId, envId = 'degoudse' }: ContactRelationshipManagerProps) {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  
  const [formData, setFormData] = useState({
    relationshipType: 'associated',
    role: '',
    isPrimary: false,
    notes: ''
  });

  // Fetch existing relationships
  const { data: relationships = [], isLoading: relationshipsLoading } = useQuery({
    queryKey: [`/api/${envId}/contacts/${contactId}/relationships`],
    queryFn: () => apiRequest('GET', `/api/${envId}/contacts/${contactId}/relationships`),
    staleTime: 5 * 60 * 1000
  });

  // Fetch available entities for selection
  const { data: availableEntities = [], isLoading: entitiesLoading } = useQuery({
    queryKey: [`/api/${envId}/contacts/relationship-entities`, selectedEntityType, searchTerm],
    queryFn: () => apiRequest('GET', `/api/${envId}/contacts/relationship-entities?type=${selectedEntityType}&search=${searchTerm}`),
    enabled: !!selectedEntityType,
    staleTime: 2 * 60 * 1000
  });

  // Create relationship mutation
  const createRelationshipMutation = useMutation({
    mutationFn: (relationshipData: any) => 
      apiRequest('POST', `/api/${envId}/contacts/${contactId}/relationships`, relationshipData),
    onSuccess: () => {
      setShowCreateDialog(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: [`/api/${envId}/contacts/${contactId}/relationships`] });
      toast({ title: 'Relationship created successfully' });
    },
    onError: (error) => {
      console.error('Create relationship error:', error);
      toast({ title: 'Failed to create relationship', variant: 'destructive' });
    }
  });

  // Delete relationship mutation
  const deleteRelationshipMutation = useMutation({
    mutationFn: (relationshipId: number) => 
      apiRequest('DELETE', `/api/${envId}/contacts/relationships/${relationshipId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${envId}/contacts/${contactId}/relationships`] });
      toast({ title: 'Relationship deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete relationship', variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setFormData({
      relationshipType: 'associated',
      role: '',
      isPrimary: false,
      notes: ''
    });
    setSelectedEntityType('');
    setSelectedEntity(null);
    setSearchTerm('');
  };

  const handleCreateRelationship = () => {
    if (!selectedEntity || !selectedEntityType) {
      toast({ title: 'Please select an entity to connect', variant: 'destructive' });
      return;
    }

    createRelationshipMutation.mutate({
      entityType: selectedEntityType,
      entityId: selectedEntity.id,
      relationshipType: formData.relationshipType,
      role: formData.role || null,
      isPrimary: formData.isPrimary,
      notes: formData.notes || null
    });
  };

  const getEntityIcon = (entityType: string) => {
    const entityConfig = ENTITY_TYPES.find(et => et.value === entityType);
    return entityConfig?.icon || Target;
  };

  const getEntityColor = (entityType: string) => {
    const entityConfig = ENTITY_TYPES.find(et => et.value === entityType);
    return entityConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const getRelationshipLabel = (relationshipType: string) => {
    const relationship = RELATIONSHIP_TYPES.find(rt => rt.value === relationshipType);
    return relationship?.label || relationshipType;
  };

  // Group relationships by entity type
  const groupedRelationships = relationships.reduce((acc: Record<string, ContactRelationship[]>, rel: ContactRelationship) => {
    if (!acc[rel.entity_type]) acc[rel.entity_type] = [];
    acc[rel.entity_type].push(rel);
    return acc;
  }, {});

  if (relationshipsLoading) {
    return <div className="flex items-center justify-center p-8">Loading relationships...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Relationship Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Contact Relationships</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#5567E5] hover:bg-[#4556D4]">
              <Plus className="h-4 w-4 mr-1" />
              Add Relationship
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Connect Contact to Entity</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Entity Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select Entity Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {ENTITY_TYPES.map((entityType) => {
                    const Icon = entityType.icon;
                    return (
                      <Card 
                        key={entityType.value}
                        className={`cursor-pointer transition-all border-2 ${
                          selectedEntityType === entityType.value 
                            ? 'border-[#5567E5] bg-[#5567E5]/5' 
                            : 'border-[#E6E7F1] hover:border-[#5567E5]/30'
                        }`}
                        onClick={() => {
                          setSelectedEntityType(entityType.value);
                          setSelectedEntity(null);
                          setSearchTerm('');
                        }}
                      >
                        <CardContent className="p-4 text-center">
                          <Icon className="h-8 w-8 mx-auto mb-2 text-[#5567E5]" />
                          <p className="text-sm font-medium">{entityType.label}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Entity Search and Selection */}
              {selectedEntityType && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Search and Select Entity</Label>
                  <Input
                    placeholder={`Search ${selectedEntityType}s...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                  
                  {entitiesLoading ? (
                    <div className="text-center py-4 text-sm text-gray-500">Searching...</div>
                  ) : availableEntities.length > 0 ? (
                    <div className="max-h-32 overflow-y-auto space-y-1 border rounded-md p-2">
                      {availableEntities.map((entity: Entity) => (
                        <div
                          key={entity.id}
                          className={`p-2 rounded cursor-pointer transition-colors ${
                            selectedEntity?.id === entity.id
                              ? 'bg-[#5567E5] text-white'
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={() => setSelectedEntity(entity)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{entity.name}</span>
                            {entity.status && (
                              <Badge variant="outline" className="text-xs">
                                {entity.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchTerm ? (
                    <div className="text-center py-4 text-sm text-gray-500">
                      No {selectedEntityType}s found matching "{searchTerm}"
                    </div>
                  ) : null}
                  
                  {selectedEntity && (
                    <div className="p-3 bg-[#5567E5]/5 border border-[#5567E5]/20 rounded-md">
                      <p className="text-sm font-medium text-[#5567E5]">
                        Selected: {selectedEntity.name}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Relationship Configuration */}
              {selectedEntity && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="relationshipType" className="text-sm font-medium">
                        Relationship Type
                      </Label>
                      <Select
                        value={formData.relationshipType}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, relationshipType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RELATIONSHIP_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="role" className="text-sm font-medium">
                        Role (Optional)
                      </Label>
                      <Input
                        id="role"
                        placeholder="e.g., Project Manager, Decision Maker"
                        value={formData.role}
                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Notes (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional context about this relationship..."
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPrimary"
                      checked={formData.isPrimary}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isPrimary" className="text-sm">
                      Mark as primary relationship
                    </Label>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateRelationship}
                  disabled={!selectedEntity || createRelationshipMutation.isPending}
                  className="bg-[#5567E5] hover:bg-[#4556D4]"
                >
                  {createRelationshipMutation.isPending ? 'Creating...' : 'Create Relationship'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Existing Relationships */}
      {Object.keys(groupedRelationships).length === 0 ? (
        <Card className="border-[#E6E7F1]">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Relationships Yet</h4>
            <p className="text-gray-600 mb-4">
              Connect this contact to opportunities, customers, partners, or other contacts to build a comprehensive relationship network.
            </p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-[#5567E5] hover:bg-[#4556D4]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Relationship
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedRelationships).map(([entityType, relationships]) => {
            const Icon = getEntityIcon(entityType);
            const entityConfig = ENTITY_TYPES.find(et => et.value === entityType);
            
            return (
              <Card key={entityType} className="border-[#E6E7F1]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-base">
                    <Icon className="h-5 w-5 mr-2 text-[#5567E5]" />
                    {entityConfig?.label || entityType} ({relationships.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relationships.map((relationship) => (
                    <div 
                      key={relationship.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h5 className="font-medium text-gray-900">
                            {relationship.entity_name || `${entityType} #${relationship.entity_id}`}
                          </h5>
                          <Badge className={getEntityColor(entityType)}>
                            {getRelationshipLabel(relationship.relationship_type)}
                          </Badge>
                          {relationship.is_primary && (
                            <Badge variant="outline" className="text-[#5567E5] border-[#5567E5]">
                              Primary
                            </Badge>
                          )}
                          {relationship.entity_status && (
                            <Badge variant="outline">
                              {relationship.entity_status}
                            </Badge>
                          )}
                        </div>
                        
                        {relationship.role && (
                          <p className="text-sm text-gray-600 mt-1">
                            Role: {relationship.role}
                          </p>
                        )}
                        
                        {relationship.notes && (
                          <p className="text-sm text-gray-600 mt-1">
                            {relationship.notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteRelationshipMutation.mutate(relationship.id)}
                          disabled={deleteRelationshipMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}