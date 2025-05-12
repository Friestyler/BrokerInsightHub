import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Checkbox } from "../../components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { useToast } from "../../components/ui/use-toast";
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { Database, Plus, PencilLine, Trash2 } from 'lucide-react';

// Types for entity definitions and attributes
interface EntityDefinition {
  id: number;
  name: string;
  displayName: string;
  description: string;
  environment: string;
}

interface EntityAttribute {
  id: number;
  entityDefinitionId: number;
  name: string;
  displayName: string;
  description: string;
  type: string;
  isRequired: boolean;
  isSystemAttribute: boolean;
  orderIndex: number;
  environment: string;
}

export default function EntityAttributesSettings() {
  const { environment } = useEnvironment();
  const { toast } = useToast();
  
  // State for the currently selected entity type
  const [selectedEntityType, setSelectedEntityType] = useState<string>("");
  
  // State for attribute form
  const [showAttributeForm, setShowAttributeForm] = useState(false);
  const [attributeFormData, setAttributeFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    type: "text",
    isRequired: false
  });
  
  // Fetch entity definitions for the current environment
  const { data: entityDefinitions, isLoading: isLoadingDefinitions } = useQuery({
    queryKey: ['/api/entity-definitions', environment.id],
    queryFn: async () => {
      const res = await fetch(`/api/entity-definitions?environment=${environment.id}`);
      if (!res.ok) throw new Error('Failed to fetch entity definitions');
      return res.json() as Promise<EntityDefinition[]>;
    }
  });
  
  // Fetch attributes for the selected entity type
  const { data: entityAttributes, isLoading: isLoadingAttributes, refetch: refetchAttributes } = useQuery({
    queryKey: ['/api/entity-attributes', selectedEntityType, environment.id],
    queryFn: async () => {
      if (!selectedEntityType) return [] as EntityAttribute[];
      
      const res = await fetch(`/api/entity-attributes/${selectedEntityType}?environment=${environment.id}`);
      if (!res.ok) throw new Error('Failed to fetch entity attributes');
      return res.json() as Promise<EntityAttribute[]>;
    },
    enabled: !!selectedEntityType
  });
  
  // Set the first entity type as default when data loads
  useEffect(() => {
    if (entityDefinitions && entityDefinitions.length > 0 && !selectedEntityType) {
      setSelectedEntityType(entityDefinitions[0].name);
    }
  }, [entityDefinitions, selectedEntityType]);
  
  // Handle entity type selection change
  const handleEntityTypeChange = (value: string) => {
    setSelectedEntityType(value);
  };
  
  // Handle attribute form submission
  const handleSubmitAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/entity-attributes/${selectedEntityType}?environment=${environment.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attributeFormData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create attribute');
      }
      
      // Reset form and refresh attributes
      setAttributeFormData({
        name: "",
        displayName: "",
        description: "",
        type: "text",
        isRequired: false
      });
      setShowAttributeForm(false);
      
      // Refetch attributes
      refetchAttributes();
      
      toast({
        title: "Attribute created",
        description: `${attributeFormData.displayName} has been added to ${selectedEntityType}`,
      });
    } catch (error) {
      console.error('Error creating attribute:', error);
      toast({
        title: "Error",
        description: "Failed to create attribute. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Group attributes by system and custom
  const systemAttributes = entityAttributes?.filter(attr => attr.isSystemAttribute) || [];
  const customAttributes = entityAttributes?.filter(attr => !attr.isSystemAttribute) || [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Entity Attributes
        </CardTitle>
        <CardDescription>
          Configure attributes for entity types in the {environment.displayName} environment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Entity type selector */}
          <div className="flex items-center gap-4">
            <div className="w-64">
              <Label htmlFor="entity-type">Entity Type</Label>
              <Select 
                value={selectedEntityType} 
                onValueChange={handleEntityTypeChange}
                disabled={isLoadingDefinitions}
              >
                <SelectTrigger id="entity-type">
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  {entityDefinitions?.map((def) => (
                    <SelectItem key={def.id} value={def.name}>{def.displayName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1"></div>
            
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={() => setShowAttributeForm(true)}
              disabled={!selectedEntityType}
            >
              <Plus className="h-4 w-4" /> 
              Add Custom Attribute
            </Button>
          </div>
          
          {/* Attributes tabs - System vs Custom */}
          {selectedEntityType && (
            <Tabs defaultValue="system" className="mt-6">
              <TabsList>
                <TabsTrigger value="system">System Attributes</TabsTrigger>
                <TabsTrigger value="custom">Custom Attributes</TabsTrigger>
              </TabsList>
              
              {/* System attributes */}
              <TabsContent value="system">
                {isLoadingAttributes ? (
                  <div className="py-8 text-center text-gray-500">Loading system attributes...</div>
                ) : systemAttributes.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">No system attributes found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {systemAttributes.map((attr) => (
                        <TableRow key={attr.id}>
                          <TableCell className="font-medium">{attr.name}</TableCell>
                          <TableCell>{attr.displayName}</TableCell>
                          <TableCell>
                            <span className="rounded bg-slate-100 px-2 py-1 text-xs">
                              {attr.type}
                            </span>
                          </TableCell>
                          <TableCell>
                            {attr.isRequired ? (
                              <span className="text-green-600 text-xs">Required</span>
                            ) : (
                              <span className="text-gray-400 text-xs">Optional</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" disabled>
                              <PencilLine className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
              
              {/* Custom attributes */}
              <TabsContent value="custom">
                {isLoadingAttributes ? (
                  <div className="py-8 text-center text-gray-500">Loading custom attributes...</div>
                ) : customAttributes.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    No custom attributes found. Click "Add Custom Attribute" to create one.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customAttributes.map((attr) => (
                        <TableRow key={attr.id}>
                          <TableCell className="font-medium">{attr.name}</TableCell>
                          <TableCell>{attr.displayName}</TableCell>
                          <TableCell>
                            <span className="rounded bg-slate-100 px-2 py-1 text-xs">
                              {attr.type}
                            </span>
                          </TableCell>
                          <TableCell>
                            {attr.isRequired ? (
                              <span className="text-green-600 text-xs">Required</span>
                            ) : (
                              <span className="text-gray-400 text-xs">Optional</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon">
                                <PencilLine className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
      
      {/* Attribute form dialog */}
      <Dialog open={showAttributeForm} onOpenChange={setShowAttributeForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Attribute</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitAttribute} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="attr-name">Attribute Name</Label>
                <Input 
                  id="attr-name" 
                  value={attributeFormData.name}
                  onChange={(e) => setAttributeFormData({...attributeFormData, name: e.target.value})}
                  placeholder="e.g. customerType"
                  required
                />
                <p className="text-xs text-gray-500">Used internally, no spaces</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="attr-display-name">Display Name</Label>
                <Input 
                  id="attr-display-name" 
                  value={attributeFormData.displayName}
                  onChange={(e) => setAttributeFormData({...attributeFormData, displayName: e.target.value})}
                  placeholder="e.g. Customer Type"
                  required
                />
                <p className="text-xs text-gray-500">Shown in forms and UI</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="attr-description">Description</Label>
              <Input 
                id="attr-description" 
                value={attributeFormData.description}
                onChange={(e) => setAttributeFormData({...attributeFormData, description: e.target.value})}
                placeholder="Description of this attribute"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="attr-type">Type</Label>
                <Select 
                  value={attributeFormData.type} 
                  onValueChange={(value) => setAttributeFormData({...attributeFormData, type: value})}
                >
                  <SelectTrigger id="attr-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="boolean">Yes/No</SelectItem>
                    <SelectItem value="select">Selection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end pb-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="attr-required"
                    checked={attributeFormData.isRequired}
                    onCheckedChange={(checked) => 
                      setAttributeFormData({
                        ...attributeFormData, 
                        isRequired: checked === true
                      })
                    }
                  />
                  <Label htmlFor="attr-required">Required field</Label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAttributeForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Attribute</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}