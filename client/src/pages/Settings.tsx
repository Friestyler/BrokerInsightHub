import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from '@/components/Layout';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { Separator } from '@/components/ui/separator';
import EntityAttributesSettings from '@/components/settings/EntityAttributesSettings';
import RelationshipAttributesSettings from '@/components/settings/RelationshipAttributesSettings';

export default function Settings() {
  const { environment } = useEnvironment();
  const [activeTab, setActiveTab] = useState("general");

  return (
    <Layout>
      <div className="container mt-6 px-4 md:px-6">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-1">Settings</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Manage your {environment.name} environment settings and configurations.
                </p>
              </div>
            </div>
            <Separator className="my-6" />
            
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="entity-attributes">Entity Attributes</TabsTrigger>
                <TabsTrigger value="entity-relationships">Entity Relationships</TabsTrigger>
                <TabsTrigger value="users">Users & Teams</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{environment.name} Environment Settings</CardTitle>
                    <CardDescription>
                      Configure general settings for this environment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p>
                        These settings affect all users in the <strong>{environment.name}</strong> environment.
                        Changes to these settings will be immediately visible to all users.
                      </p>
                      <p className="text-sm text-gray-500">
                        Environment ID: {environment.id}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="entity-attributes" className="space-y-6">
                <EntityAttributesSettings />
              </TabsContent>
              
              <TabsContent value="entity-relationships" className="space-y-6">
                <RelationshipAttributesSettings />
              </TabsContent>
              
              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      Manage users and team permissions in this environment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p>
                        User management settings will be implemented in a future update.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}