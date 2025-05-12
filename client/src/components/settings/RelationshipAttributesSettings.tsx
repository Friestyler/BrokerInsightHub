import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Checkbox } from "../../components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { useToast } from "../../components/ui/use-toast";
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { Network, Plus, ArrowRight } from 'lucide-react';

// Types for entity definitions and relationship attributes
interface EntityDefinition {
  id: number;
  name: string;
  displayName: string;
  description: string;
  environment: string;
}

interface RelationshipAttribute {
  id: number;
  sourceEntityId: number;
  targetEntityId: number;
  sourceAttributeId: number;
  targetAttributeId: number;
  relationshipType: string;
  environment: string;
  
  // Enriched fields from related entities/attributes
  sourceEntityName?: string;
  sourceEntityDisplayName?: string;
  targetEntityName?: string;
  targetEntityDisplayName?: string;
  sourceAttributeName?: string;
  sourceAttributeDisplayName?: string;
  targetAttributeName?: string;
  targetAttributeDisplayName?: string;
}

export default function RelationshipAttributesSettings() {
  const { environment } = useEnvironment();
  const { toast } = useToast();
  
  // State for relationship form dialog
  const [showRelationshipForm, setShowRelationshipForm] = useState(false);
  const [relationshipFormData, setRelationshipFormData] = useState({
    sourceEntity: "",
    targetEntity: "",
    sourceAttributeName: "",
    sourceAttributeDisplayName: "",
    targetAttributeName: "",
    targetAttributeDisplayName: "",
    relationshipType: "many-to-one",
    isRequired: false
  });
  
  // Fetch entity definitions for the current environment
  const { data: entityDefinitions } = useQuery({
    queryKey: ['/api/entity-definitions', environment.id],
    queryFn: async () => {
      const res = await fetch(`/api/entity-definitions?environment=${environment.id}`);
      if (!res.ok) throw new Error('Failed to fetch entity definitions');
      return res.json() as Promise<EntityDefinition[]>;
    }
  });
  
  // Fetch relationship attributes
  const { data: relationshipAttributes, isLoading: isLoadingRelationships, refetch: refetchRelationships } = useQuery({
    queryKey: ['/api/relationship-attributes', environment.id],
    queryFn: async () => {
      const res = await fetch(`/api/relationship-attributes?environment=${environment.id}`);
      if (!res.ok) throw new Error('Failed to fetch relationship attributes');
      return res.json() as Promise<RelationshipAttribute[]>;
    }
  });
  
  // Get entity display name by name
  const getEntityDisplayName = (entityName: string): string => {
    if (!entityDefinitions) return entityName;
    const entity = entityDefinitions.find(e => e.name === entityName);
    return entity?.displayName || entityName;
  };
  
  // Handle relationship form submission
  const handleSubmitRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/relationship-attributes?environment=${environment.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(relationshipFormData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create relationship');
      }
      
      // Reset form and refresh relationships
      setRelationshipFormData({
        sourceEntity: "",
        targetEntity: "",
        sourceAttributeName: "",
        sourceAttributeDisplayName: "",
        targetAttributeName: "",
        targetAttributeDisplayName: "",
        relationshipType: "many-to-one",
        isRequired: false
      });
      setShowRelationshipForm(false);
      
      // Refetch relationships
      refetchRelationships();
      
      toast({
        title: "Relationship created",
        description: `Created relationship between ${getEntityDisplayName(relationshipFormData.sourceEntity)} and ${getEntityDisplayName(relationshipFormData.targetEntity)}`,
      });
    } catch (error) {
      console.error('Error creating relationship:', error);
      toast({
        title: "Error",
        description: "Failed to create relationship. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Relationship type descriptions
  const relationshipTypeDescriptions: Record<string, string> = {
    'one-to-one': 'Each source entity can relate to at most one target entity, and vice versa.',
    'one-to-many': 'Each source entity can relate to multiple target entities, but each target entity relates to at most one source entity.',
    'many-to-one': 'Multiple source entities can relate to a single target entity, but each source entity relates to at most one target entity.',
    'many-to-many': 'Multiple source entities can relate to multiple target entities.'
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Relationship Attributes
        </CardTitle>
        <CardDescription>
          Configure relationships between entities in the {environment.displayName} environment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Current Relationships</h3>
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={() => setShowRelationshipForm(true)}
            >
              <Plus className="h-4 w-4" /> 
              Create Relationship
            </Button>
          </div>
          
          {/* Relationships table */}
          {isLoadingRelationships ? (
            <div className="py-8 text-center text-gray-500">Loading relationships...</div>
          ) : (relationshipAttributes?.length || 0) === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No relationships defined yet. Click "Create Relationship" to create the first one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source Entity</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Target Entity</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relationshipAttributes?.map((rel) => (
                  <TableRow key={rel.id}>
                    <TableCell className="font-medium">
                      {rel.sourceEntityDisplayName || rel.sourceEntityName}
                      <div className="text-xs text-gray-500">
                        via {rel.sourceAttributeDisplayName || rel.sourceAttributeName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </TableCell>
                    <TableCell>
                      {rel.targetEntityDisplayName || rel.targetEntityName}
                      <div className="text-xs text-gray-500">
                        via {rel.targetAttributeDisplayName || rel.targetAttributeName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-indigo-50 px-2 py-1 text-xs text-indigo-600">
                        {rel.relationshipType}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
      
      {/* Relationship form dialog */}
      <Dialog open={showRelationshipForm} onOpenChange={setShowRelationshipForm}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New Relationship</DialogTitle>
            <DialogDescription>
              Define a relationship between two entity types.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitRelationship} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source-entity">Source Entity</Label>
                <Select 
                  value={relationshipFormData.sourceEntity} 
                  onValueChange={(value) => setRelationshipFormData({...relationshipFormData, sourceEntity: value})}
                  required
                >
                  <SelectTrigger id="source-entity">
                    <SelectValue placeholder="Select source entity" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityDefinitions?.map((def) => (
                      <SelectItem key={`src-${def.id}`} value={def.name}>{def.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target-entity">Target Entity</Label>
                <Select 
                  value={relationshipFormData.targetEntity} 
                  onValueChange={(value) => setRelationshipFormData({...relationshipFormData, targetEntity: value})}
                  required
                >
                  <SelectTrigger id="target-entity">
                    <SelectValue placeholder="Select target entity" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityDefinitions?.map((def) => (
                      <SelectItem key={`tgt-${def.id}`} value={def.name}>{def.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source-attr-name">Source Attribute Name (Optional)</Label>
                <Input 
                  id="source-attr-name" 
                  value={relationshipFormData.sourceAttributeName}
                  onChange={(e) => setRelationshipFormData({...relationshipFormData, sourceAttributeName: e.target.value})}
                  placeholder="Leave blank for default"
                />
                <p className="text-xs text-gray-500">
                  Default will be the target entity name
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="source-attr-display">Source Display Name (Optional)</Label>
                <Input 
                  id="source-attr-display" 
                  value={relationshipFormData.sourceAttributeDisplayName}
                  onChange={(e) => setRelationshipFormData({...relationshipFormData, sourceAttributeDisplayName: e.target.value})}
                  placeholder="Leave blank for default"
                />
                <p className="text-xs text-gray-500">
                  Default will be the target entity display name
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target-attr-name">Target Attribute Name (Optional)</Label>
                <Input 
                  id="target-attr-name" 
                  value={relationshipFormData.targetAttributeName}
                  onChange={(e) => setRelationshipFormData({...relationshipFormData, targetAttributeName: e.target.value})}
                  placeholder="Leave blank for default"
                />
                <p className="text-xs text-gray-500">
                  Default will be the source entity name
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target-attr-display">Target Display Name (Optional)</Label>
                <Input 
                  id="target-attr-display" 
                  value={relationshipFormData.targetAttributeDisplayName}
                  onChange={(e) => setRelationshipFormData({...relationshipFormData, targetAttributeDisplayName: e.target.value})}
                  placeholder="Leave blank for default"
                />
                <p className="text-xs text-gray-500">
                  Default will be the source entity display name
                </p>
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              <Label>Relationship Type</Label>
              <RadioGroup 
                value={relationshipFormData.relationshipType}
                onValueChange={(value) => setRelationshipFormData({...relationshipFormData, relationshipType: value})}
                className="grid grid-cols-2 gap-4 pt-2"
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="one-to-one" id="rel-one-to-one" />
                  <div className="grid gap-1">
                    <Label htmlFor="rel-one-to-one" className="font-medium">One-to-One</Label>
                    <p className="text-xs text-gray-500">
                      {relationshipTypeDescriptions['one-to-one']}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="one-to-many" id="rel-one-to-many" />
                  <div className="grid gap-1">
                    <Label htmlFor="rel-one-to-many" className="font-medium">One-to-Many</Label>
                    <p className="text-xs text-gray-500">
                      {relationshipTypeDescriptions['one-to-many']}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="many-to-one" id="rel-many-to-one" />
                  <div className="grid gap-1">
                    <Label htmlFor="rel-many-to-one" className="font-medium">Many-to-One</Label>
                    <p className="text-xs text-gray-500">
                      {relationshipTypeDescriptions['many-to-one']}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="many-to-many" id="rel-many-to-many" />
                  <div className="grid gap-1">
                    <Label htmlFor="rel-many-to-many" className="font-medium">Many-to-Many</Label>
                    <p className="text-xs text-gray-500">
                      {relationshipTypeDescriptions['many-to-many']}
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div className="pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rel-required"
                  checked={relationshipFormData.isRequired}
                  onCheckedChange={(checked) => 
                    setRelationshipFormData({
                      ...relationshipFormData, 
                      isRequired: checked === true
                    })
                  }
                />
                <Label htmlFor="rel-required">Make relationship required for source entity</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowRelationshipForm(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={!relationshipFormData.sourceEntity || !relationshipFormData.targetEntity}
              >
                Create Relationship
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}