import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEnvironment } from "@/contexts/EnvironmentContext";

import EntityAttributesSettings from "@/components/settings/EntityAttributesSettings";
import RelationshipAttributesSettings from "@/components/settings/RelationshipAttributesSettings";

export default function Settings() {
  const { currentEnvironment } = useEnvironment();
  const [activeTab, setActiveTab] = useState("entities");

  return (
    <div className="container px-4 py-6 lg:px-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{currentEnvironment.name} Settings</h1>
          <p className="text-muted-foreground">
            Configure entities, attributes, and relationships for {currentEnvironment.name}
          </p>
        </div>
      </div>
      <Separator className="my-6" />
      
      <Tabs defaultValue="entities" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="entities">Entities & Attributes</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="general">General Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="entities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Entity Management</CardTitle>
            </CardHeader>
            <CardContent>
              <EntityAttributesSettings />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="relationships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relationship Management</CardTitle>
            </CardHeader>
            <CardContent>
              <RelationshipAttributesSettings />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Configure general settings for {currentEnvironment.name}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}