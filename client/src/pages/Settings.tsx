import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { 
  LayoutDashboard, 
  Database, 
  UsersRound, 
  Settings as SettingsIcon, 
  Server,
  Network,
  MessagesSquare
} from "lucide-react";
import { useEnvironment } from '../contexts/EnvironmentContext';
import UserAvatar from '../components/UserAvatar';

export default function Settings() {
  const { environment } = useEnvironment();
  const [activeTab, setActiveTab] = useState("entity-definitions");

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-gray-500 mt-1">
            Configure application settings for {environment.displayName}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <UserAvatar name="Admin User" size="md" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-12 md:col-span-3">
          <Card>
            <CardContent className="p-0">
              <nav className="flex flex-col">
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-3 hover:bg-gray-50 ${activeTab === 'general' ? 'bg-gray-50 border-l-2 border-indigo-500' : ''}`}
                  onClick={() => setActiveTab('general')}
                >
                  <LayoutDashboard className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-sm font-medium">General</span>
                </a>
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-3 hover:bg-gray-50 ${activeTab === 'entity-definitions' ? 'bg-gray-50 border-l-2 border-indigo-500' : ''}`}
                  onClick={() => setActiveTab('entity-definitions')}
                >
                  <Database className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-sm font-medium">Entity Attributes</span>
                </a>
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-3 hover:bg-gray-50 ${activeTab === 'relationship-attributes' ? 'bg-gray-50 border-l-2 border-indigo-500' : ''}`}
                  onClick={() => setActiveTab('relationship-attributes')}
                >
                  <Network className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-sm font-medium">Relationship Attributes</span>
                </a>
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-3 hover:bg-gray-50 ${activeTab === 'users' ? 'bg-gray-50 border-l-2 border-indigo-500' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  <UsersRound className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-sm font-medium">Users & Permissions</span>
                </a>
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-3 hover:bg-gray-50 ${activeTab === 'messaging' ? 'bg-gray-50 border-l-2 border-indigo-500' : ''}`}
                  onClick={() => setActiveTab('messaging')}
                >
                  <MessagesSquare className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-sm font-medium">Messaging</span>
                </a>
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-3 hover:bg-gray-50 ${activeTab === 'system' ? 'bg-gray-50 border-l-2 border-indigo-500' : ''}`}
                  onClick={() => setActiveTab('system')}
                >
                  <Server className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-sm font-medium">System</span>
                </a>
                <a 
                  href="#" 
                  className={`flex items-center px-4 py-3 hover:bg-gray-50 ${activeTab === 'advanced' ? 'bg-gray-50 border-l-2 border-indigo-500' : ''}`}
                  onClick={() => setActiveTab('advanced')}
                >
                  <SettingsIcon className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-sm font-medium">Advanced</span>
                </a>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="col-span-12 md:col-span-9">
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure general application settings for {environment.displayName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  General settings will be available in a future update.
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'entity-definitions' && (
            <EntityAttributesSettings />
          )}

          {activeTab === 'relationship-attributes' && (
            <RelationshipAttributesSettings />
          )}

          {activeTab === 'users' && (
            <Card>
              <CardHeader>
                <CardTitle>Users & Permissions</CardTitle>
                <CardDescription>
                  Manage users and their permissions in the {environment.displayName} environment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  User management will be available in a future update.
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'messaging' && (
            <Card>
              <CardHeader>
                <CardTitle>Messaging Settings</CardTitle>
                <CardDescription>
                  Configure messaging and notification settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Messaging settings will be available in a future update.
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'system' && (
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure system-level settings for {environment.displayName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  System settings will be available in a future update.
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'advanced' && (
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure advanced settings for {environment.displayName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Advanced settings will be available in a future update.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}