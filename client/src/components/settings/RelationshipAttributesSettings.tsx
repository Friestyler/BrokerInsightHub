import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { Loader2, Plus, Settings, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Entity types we display in the UI
const ENTITY_TYPES = [
  { id: 'customers', displayName: 'Customers' },
  { id: 'partners', displayName: 'Partners' },
  { id: 'opportunities', displayName: 'Opportunities' },
  { id: 'projects', displayName: 'Projects' },
  { id: 'contacts', displayName: 'Contacts' },
];

// Relationship types
const RELATIONSHIP_TYPES = [
  { id: 'one_to_many', displayName: 'One-to-Many', description: 'One record of the first entity can be linked to many records of the second entity' },
  { id: 'many_to_one', displayName: 'Many-to-One', description: 'Many records of the first entity can be linked to one record of the second entity' },
  { id: 'many_to_many', displayName: 'Many-to-Many', description: 'Many records of the first entity can be linked to many records of the second entity' },
];

export default function RelationshipAttributesSettings() {
  const { environment } = useEnvironment();
  const [isAddRelationshipDialogOpen, setIsAddRelationshipDialogOpen] = useState(false);
  const [isEditRelationshipDialogOpen, setIsEditRelationshipDialogOpen] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState<any>(null);

  // New relationship form state
  const [newRelationship, setNewRelationship] = useState({
    sourceEntity: 'customers',
    targetEntity: 'partners',
    sourceAttributeName: '',
    targetAttributeName: '',
    relationshipType: 'many_to_many',
    isRequired: false,
  });

  // Fetch relationship attributes
  const { data: relationshipAttributes, isLoading } = useQuery({
    queryKey: ['/api/relationship-attributes', environment?.id],
    enabled: !!environment,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Mock data for development - replace with actual API data later
  const mockRelationships = [
    {
      id: 1,
      sourceEntity: 'customers',
      sourceEntityDisplayName: 'Customers',
      targetEntity: 'partners',
      targetEntityDisplayName: 'Partners',
      sourceAttributeName: 'partners',
      sourceAttributeDisplayName: 'Partners',
      targetAttributeName: 'customers',
      targetAttributeDisplayName: 'Customers',
      relationshipType: 'many_to_many',
      isRequired: false,
      isSystem: true,
    },
    {
      id: 2,
      sourceEntity: 'opportunities',
      sourceEntityDisplayName: 'Opportunities',
      targetEntity: 'customers',
      targetEntityDisplayName: 'Customers',
      sourceAttributeName: 'customers',
      sourceAttributeDisplayName: 'Customers',
      targetAttributeName: 'opportunities',
      targetAttributeDisplayName: 'Opportunities',
      relationshipType: 'many_to_one',
      isRequired: false,
      isSystem: true,
    },
    {
      id: 3,
      sourceEntity: 'opportunities',
      sourceEntityDisplayName: 'Opportunities',
      targetEntity: 'partners',
      targetEntityDisplayName: 'Partners',
      sourceAttributeName: 'partners',
      sourceAttributeDisplayName: 'Partners',
      targetAttributeName: 'opportunities',
      targetAttributeDisplayName: 'Opportunities',
      relationshipType: 'many_to_many',
      isRequired: false,
      isSystem: true,
    },
  ];

  // Handle add relationship form submission
  const handleAddRelationship = () => {
    // TODO: Submit to API
    console.log('Adding relationship:', newRelationship);
    setIsAddRelationshipDialogOpen(false);
    // Reset form
    setNewRelationship({
      sourceEntity: 'customers',
      targetEntity: 'partners',
      sourceAttributeName: '',
      targetAttributeName: '',
      relationshipType: 'many_to_many',
      isRequired: false,
    });
  };

  // Handle opening the edit dialog for a relationship
  const handleEditRelationship = (relationship: any) => {
    setSelectedRelationship(relationship);
    setIsEditRelationshipDialogOpen(true);
  };

  // Handle saving edited relationship
  const handleSaveRelationship = () => {
    // TODO: Submit to API
    console.log('Saving relationship:', selectedRelationship);
    setIsEditRelationshipDialogOpen(false);
  };

  const getRelationshipTypeLabel = (type: string) => {
    switch (type) {
      case 'one_to_many': return 'One-to-Many';
      case 'many_to_one': return 'Many-to-One';
      case 'many_to_many': return 'Many-to-Many';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Relationship Configurations</h3>
        <Button onClick={() => setIsAddRelationshipDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Relationship
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Understanding Relationships</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {RELATIONSHIP_TYPES.map((type) => (
              <div 
                key={type.id} 
                className="border rounded-lg p-4 bg-white"
              >
                <div className="font-medium mb-2 flex items-center">
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  {type.displayName}
                </div>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Source Entity</TableHead>
            <TableHead className="w-[150px]">Target Entity</TableHead>
            <TableHead className="w-[150px]">Source Attribute</TableHead>
            <TableHead className="w-[150px]">Target Attribute</TableHead>
            <TableHead className="w-[150px]">Relationship Type</TableHead>
            <TableHead className="w-[80px]">System</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockRelationships.map((relationship) => (
            <TableRow key={relationship.id}>
              <TableCell>{relationship.sourceEntityDisplayName}</TableCell>
              <TableCell>{relationship.targetEntityDisplayName}</TableCell>
              <TableCell>{relationship.sourceAttributeDisplayName}</TableCell>
              <TableCell>{relationship.targetAttributeDisplayName}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {getRelationshipTypeLabel(relationship.relationshipType)}
                </Badge>
              </TableCell>
              <TableCell>
                {relationship.isSystem ? (
                  <Badge variant="secondary">System</Badge>
                ) : (
                  <Badge variant="outline">Custom</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditRelationship(relationship)}
                  disabled={relationship.isSystem}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Relationship Dialog */}
      <Dialog open={isAddRelationshipDialogOpen} onOpenChange={setIsAddRelationshipDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Relationship</DialogTitle>
            <DialogDescription>
              Create a new relationship between entity types
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sourceEntity" className="text-right">
                Source Entity
              </Label>
              <Select 
                value={newRelationship.sourceEntity}
                onValueChange={(value) => setNewRelationship({ ...newRelationship, sourceEntity: value })}
              >
                <SelectTrigger id="sourceEntity" className="col-span-3">
                  <SelectValue placeholder="Select source entity" />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="targetEntity" className="text-right">
                Target Entity
              </Label>
              <Select 
                value={newRelationship.targetEntity}
                onValueChange={(value) => setNewRelationship({ ...newRelationship, targetEntity: value })}
              >
                <SelectTrigger id="targetEntity" className="col-span-3">
                  <SelectValue placeholder="Select target entity" />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.filter(e => e.id !== newRelationship.sourceEntity).map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sourceAttributeName" className="text-right">
                Source Attribute Name
              </Label>
              <Input
                id="sourceAttributeName"
                className="col-span-3"
                placeholder={`${ENTITY_TYPES.find(e => e.id === newRelationship.targetEntity)?.displayName}`}
                value={newRelationship.sourceAttributeName}
                onChange={(e) => setNewRelationship({ ...newRelationship, sourceAttributeName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="targetAttributeName" className="text-right">
                Target Attribute Name
              </Label>
              <Input
                id="targetAttributeName"
                className="col-span-3"
                placeholder={`${ENTITY_TYPES.find(e => e.id === newRelationship.sourceEntity)?.displayName}`}
                value={newRelationship.targetAttributeName}
                onChange={(e) => setNewRelationship({ ...newRelationship, targetAttributeName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="relationshipType" className="text-right">
                Relationship Type
              </Label>
              <Select 
                value={newRelationship.relationshipType}
                onValueChange={(value) => setNewRelationship({ 
                  ...newRelationship, 
                  relationshipType: value as 'one_to_many' | 'many_to_one' | 'many_to_many'
                })}
              >
                <SelectTrigger id="relationshipType" className="col-span-3">
                  <SelectValue placeholder="Select relationship type" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isRequired" className="text-right">
                Required
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isRequired"
                  checked={newRelationship.isRequired}
                  onCheckedChange={(checked) => setNewRelationship({ ...newRelationship, isRequired: checked })}
                />
                <Label htmlFor="isRequired">
                  {newRelationship.isRequired ? 'Required' : 'Optional'}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddRelationship}>
              Add Relationship
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Relationship Dialog */}
      <Dialog open={isEditRelationshipDialogOpen} onOpenChange={setIsEditRelationshipDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Relationship</DialogTitle>
            <DialogDescription>
              Update the relationship settings
            </DialogDescription>
          </DialogHeader>
          {selectedRelationship && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-sourceEntity" className="text-right">
                  Source Entity
                </Label>
                <Input
                  id="edit-sourceEntity"
                  className="col-span-3"
                  value={selectedRelationship.sourceEntityDisplayName}
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-targetEntity" className="text-right">
                  Target Entity
                </Label>
                <Input
                  id="edit-targetEntity"
                  className="col-span-3"
                  value={selectedRelationship.targetEntityDisplayName}
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-sourceAttributeDisplayName" className="text-right">
                  Source Display Name
                </Label>
                <Input
                  id="edit-sourceAttributeDisplayName"
                  className="col-span-3"
                  value={selectedRelationship.sourceAttributeDisplayName}
                  onChange={(e) => setSelectedRelationship({ 
                    ...selectedRelationship, 
                    sourceAttributeDisplayName: e.target.value 
                  })}
                  disabled={selectedRelationship.isSystem}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-targetAttributeDisplayName" className="text-right">
                  Target Display Name
                </Label>
                <Input
                  id="edit-targetAttributeDisplayName"
                  className="col-span-3"
                  value={selectedRelationship.targetAttributeDisplayName}
                  onChange={(e) => setSelectedRelationship({ 
                    ...selectedRelationship, 
                    targetAttributeDisplayName: e.target.value 
                  })}
                  disabled={selectedRelationship.isSystem}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-relationshipType" className="text-right">
                  Relationship Type
                </Label>
                <Select 
                  value={selectedRelationship.relationshipType}
                  onValueChange={(value) => setSelectedRelationship({ 
                    ...selectedRelationship, 
                    relationshipType: value
                  })}
                  disabled={selectedRelationship.isSystem}
                >
                  <SelectTrigger id="edit-relationshipType" className="col-span-3">
                    <SelectValue placeholder="Select relationship type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-isRequired" className="text-right">
                  Required
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-isRequired"
                    checked={selectedRelationship.isRequired}
                    onCheckedChange={(checked) => setSelectedRelationship({ 
                      ...selectedRelationship, 
                      isRequired: checked 
                    })}
                    disabled={selectedRelationship.isSystem}
                  />
                  <Label htmlFor="edit-isRequired">
                    {selectedRelationship.isRequired ? 'Required' : 'Optional'}
                  </Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleSaveRelationship} 
              disabled={selectedRelationship?.isSystem}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}