import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Settings } from 'lucide-react';
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
  DialogTrigger,
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

// Entity types we display in the UI
const ENTITY_TYPES = [
  { id: 'customers', displayName: 'Customers' },
  { id: 'partners', displayName: 'Partners' },
  { id: 'opportunities', displayName: 'Opportunities' },
  { id: 'projects', displayName: 'Projects' },
  { id: 'contacts', displayName: 'Contacts' },
];

// Attribute types available for selection
const ATTRIBUTE_TYPES = [
  { id: 'text', displayName: 'Text' },
  { id: 'long_text', displayName: 'Long Text' },
  { id: 'number', displayName: 'Number' },
  { id: 'date', displayName: 'Date' },
  { id: 'datetime', displayName: 'Date & Time' },
  { id: 'boolean', displayName: 'True/False' },
  { id: 'single_select', displayName: 'Single Select' },
  { id: 'multi_select', displayName: 'Multi Select' },
  { id: 'user_single', displayName: 'User (Single)' },
  { id: 'user_multi', displayName: 'User (Multiple)' },
  { id: 'currency', displayName: 'Currency' },
  { id: 'percent', displayName: 'Percentage' },
];

export default function EntityAttributesSettings() {
  const { environment } = useEnvironment();
  const [activeEntity, setActiveEntity] = useState('customers');
  const [isAddAttributeDialogOpen, setIsAddAttributeDialogOpen] = useState(false);
  const [isEditAttributeDialogOpen, setIsEditAttributeDialogOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<any>(null);

  // New attribute form state
  const [newAttribute, setNewAttribute] = useState({
    name: '',
    displayName: '',
    description: '',
    type: 'text',
    isRequired: false,
  });

  // Fetch entity definitions
  const { data: entityDefinitions, isLoading: isLoadingDefinitions } = useQuery({
    queryKey: ['/api/entity-definitions', environment?.id],
    enabled: !!environment,
  });

  // Fetch entity attributes for the active entity
  const { data: entityAttributes, isLoading: isLoadingAttributes } = useQuery({
    queryKey: ['/api/entity-attributes', activeEntity, environment?.id],
    enabled: !!environment && !!activeEntity,
  });

  if (isLoadingDefinitions || isLoadingAttributes) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Mock data for development - replace with actual API data later
  const mockAttributes = [
    {
      id: 1,
      name: 'name',
      displayName: 'Name',
      description: 'The official name',
      type: 'text',
      isRequired: true,
      isSystemAttribute: true,
    },
    {
      id: 2,
      name: 'description',
      displayName: 'Description',
      description: 'A brief description',
      type: 'long_text',
      isRequired: false,
      isSystemAttribute: true,
    },
    {
      id: 3,
      name: 'owner',
      displayName: 'Owner',
      description: 'The primary user responsible for managing this entity',
      type: 'user_single',
      isRequired: false,
      isSystemAttribute: true,
    },
    {
      id: 4,
      name: 'team',
      displayName: 'Team',
      description: 'Users associated with this entity',
      type: 'user_multi',
      isRequired: true,
      isSystemAttribute: true,
    },
  ];

  // Additional attributes for opportunities
  const mockOpportunityAttributes = [
    ...mockAttributes,
    {
      id: 5,
      name: 'amount',
      displayName: 'Amount',
      description: 'The estimated total sale amount',
      type: 'currency',
      isRequired: false,
      isSystemAttribute: true,
    },
    {
      id: 6,
      name: 'stage',
      displayName: 'Stage',
      description: 'Current stage in the sales process',
      type: 'single_select',
      isRequired: false,
      isSystemAttribute: true,
    },
    {
      id: 7,
      name: 'probability',
      displayName: 'Probability',
      description: 'The likelihood that opportunity will close',
      type: 'percent',
      isRequired: false,
      isSystemAttribute: true,
    },
  ];

  // Get attributes based on the active entity
  const attributes = activeEntity === 'opportunities' ? mockOpportunityAttributes : mockAttributes;

  // Handle add attribute form submission
  const handleAddAttribute = () => {
    // TODO: Submit to API
    console.log('Adding attribute:', newAttribute);
    setIsAddAttributeDialogOpen(false);
    // Reset form
    setNewAttribute({
      name: '',
      displayName: '',
      description: '',
      type: 'text',
      isRequired: false,
    });
  };

  // Handle opening the edit dialog for an attribute
  const handleEditAttribute = (attribute: any) => {
    setSelectedAttribute(attribute);
    setIsEditAttributeDialogOpen(true);
  };

  // Handle saving edited attribute
  const handleSaveAttribute = () => {
    // TODO: Submit to API
    console.log('Saving attribute:', selectedAttribute);
    setIsEditAttributeDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeEntity} onValueChange={setActiveEntity} className="w-full">
        <TabsList className="grid grid-cols-5">
          {ENTITY_TYPES.map((entity) => (
            <TabsTrigger key={entity.id} value={entity.id}>
              {entity.displayName}
            </TabsTrigger>
          ))}
        </TabsList>

        {ENTITY_TYPES.map((entity) => (
          <TabsContent key={entity.id} value={entity.id} className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {entity.displayName} Attributes
              </h3>
              <Button onClick={() => setIsAddAttributeDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Attribute
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Display Name</TableHead>
                  <TableHead>API Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-[100px]">Required</TableHead>
                  <TableHead className="w-[100px]">System</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attributes.map((attribute) => (
                  <TableRow key={attribute.id}>
                    <TableCell className="font-medium">{attribute.displayName}</TableCell>
                    <TableCell>{attribute.name}</TableCell>
                    <TableCell>
                      {ATTRIBUTE_TYPES.find(t => t.id === attribute.type)?.displayName || attribute.type}
                    </TableCell>
                    <TableCell>
                      {attribute.isRequired ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          Required
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                          Optional
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {attribute.isSystemAttribute ? (
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          System
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                          Custom
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditAttribute(attribute)}
                        disabled={attribute.isSystemAttribute}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add Attribute Dialog */}
      <Dialog open={isAddAttributeDialogOpen} onOpenChange={setIsAddAttributeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Attribute</DialogTitle>
            <DialogDescription>
              Create a new attribute for {ENTITY_TYPES.find(e => e.id === activeEntity)?.displayName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="displayName" className="text-right">
                Display Name
              </Label>
              <Input
                id="displayName"
                className="col-span-3"
                value={newAttribute.displayName}
                onChange={(e) => setNewAttribute({ ...newAttribute, displayName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                API Name
              </Label>
              <Input
                id="name"
                className="col-span-3"
                value={newAttribute.name}
                onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                className="col-span-3"
                value={newAttribute.description}
                onChange={(e) => setNewAttribute({ ...newAttribute, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select 
                value={newAttribute.type}
                onValueChange={(value) => setNewAttribute({ ...newAttribute, type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ATTRIBUTE_TYPES.map((type) => (
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
                  checked={newAttribute.isRequired}
                  onCheckedChange={(checked) => setNewAttribute({ ...newAttribute, isRequired: checked })}
                />
                <Label htmlFor="isRequired">
                  {newAttribute.isRequired ? 'Required' : 'Optional'}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddAttribute}>
              Add Attribute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Attribute Dialog */}
      <Dialog open={isEditAttributeDialogOpen} onOpenChange={setIsEditAttributeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Attribute</DialogTitle>
            <DialogDescription>
              Update the attribute settings
            </DialogDescription>
          </DialogHeader>
          {selectedAttribute && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-displayName" className="text-right">
                  Display Name
                </Label>
                <Input
                  id="edit-displayName"
                  className="col-span-3"
                  value={selectedAttribute.displayName}
                  onChange={(e) => setSelectedAttribute({ ...selectedAttribute, displayName: e.target.value })}
                  disabled={selectedAttribute.isSystemAttribute}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  API Name
                </Label>
                <Input
                  id="edit-name"
                  className="col-span-3"
                  value={selectedAttribute.name}
                  disabled={true} // API name should not be changeable
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="edit-description"
                  className="col-span-3"
                  value={selectedAttribute.description}
                  onChange={(e) => setSelectedAttribute({ ...selectedAttribute, description: e.target.value })}
                  disabled={selectedAttribute.isSystemAttribute}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-type" className="text-right">
                  Type
                </Label>
                <Select 
                  value={selectedAttribute.type}
                  onValueChange={(value) => setSelectedAttribute({ ...selectedAttribute, type: value })}
                  disabled={selectedAttribute.isSystemAttribute}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ATTRIBUTE_TYPES.map((type) => (
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
                    checked={selectedAttribute.isRequired}
                    onCheckedChange={(checked) => setSelectedAttribute({ ...selectedAttribute, isRequired: checked })}
                    disabled={selectedAttribute.isSystemAttribute && selectedAttribute.name === 'name'}
                  />
                  <Label htmlFor="edit-isRequired">
                    {selectedAttribute.isRequired ? 'Required' : 'Optional'}
                  </Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleSaveAttribute} disabled={selectedAttribute?.isSystemAttribute && selectedAttribute?.name === 'name'}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}