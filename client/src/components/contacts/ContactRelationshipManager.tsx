import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Building2, UserCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Entity {
  id: number;
  name: string;
  status?: string;
}

interface ContactRelationshipManagerProps {
  contactId: number;
  envId?: string;
  onRelationshipAdded?: () => void;
  onClose?: () => void;
}

const ENTITY_TYPES = [
  { value: 'opportunity', label: 'Opportunities', icon: Target, color: 'bg-green-100 text-green-800' },
  { value: 'project', label: 'Projects', icon: Building2, color: 'bg-orange-100 text-orange-800' },
  { value: 'customer', label: 'Customers', icon: Building2, color: 'bg-blue-100 text-blue-800' },
  { value: 'partner', label: 'Partners', icon: Users, color: 'bg-purple-100 text-purple-800' },
  { value: 'vendor', label: 'Vendors', icon: Building2, color: 'bg-indigo-100 text-indigo-800' },
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

export default function ContactRelationshipManager({ 
  contactId, 
  envId = 'degoudse', 
  onRelationshipAdded, 
  onClose 
}: ContactRelationshipManagerProps) {
  const { toast } = useToast();
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  
  const [formData, setFormData] = useState({
    relationshipType: 'associated',
    role: '',
    isPrimary: false,
    notes: ''
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
      resetForm();
      queryClient.invalidateQueries({ queryKey: [`/api/${envId}/contacts/${contactId}/relationships`] });
      toast({ title: 'Relationship created successfully' });
      onRelationshipAdded?.();
      onClose?.();
    },
    onError: (error) => {
      console.error('Create relationship error:', error);
      toast({ title: 'Failed to create relationship', variant: 'destructive' });
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Relationship</DialogTitle>
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
              <div className="space-y-2">
                <Label htmlFor="relationshipType" className="text-sm font-medium">
                  Relationship Type
                </Label>
                <Select
                  value={formData.relationshipType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, relationshipType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship type" />
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
              
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Role (Optional)
                </Label>
                <Input
                  id="role"
                  placeholder="e.g., Account Manager, Technical Lead"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
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
            <Button variant="outline" onClick={onClose}>
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
  );
}