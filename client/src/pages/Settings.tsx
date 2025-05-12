import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { Loader2 } from 'lucide-react';
import EntityAttributesSettings from '@/components/settings/EntityAttributesSettings';
import RelationshipAttributesSettings from '@/components/settings/RelationshipAttributesSettings';

export default function Settings() {
  const { environment } = useEnvironment();
  const [activeTab, setActiveTab] = useState('entity-attributes');

  if (!environment) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure entity attributes and relationships for the {environment.displayName || environment.name} environment
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entity-attributes">Entity Attributes</TabsTrigger>
          <TabsTrigger value="relationship-attributes">Relationship Attributes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="entity-attributes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Entity Attributes</CardTitle>
              <CardDescription>
                Configure attributes for each entity type (Customers, Partners, Opportunities, Projects, Contacts)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EntityAttributesSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationship-attributes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relationship Attributes</CardTitle>
              <CardDescription>
                Define and configure relationships between different entity types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RelationshipAttributesSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}