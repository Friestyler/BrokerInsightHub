import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";
import { 
  LayoutDashboard, 
  Database, 
  UsersRound, 
  Settings as SettingsIcon, 
  Server,
  Network,
  MessagesSquare,
  ArrowRight
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
            <div className="relative">
              <div className="absolute w-full h-full flex items-center justify-center">
                <div>
                  <div className="w-full max-w-xl px-8 pb-8 pt-6 bg-white rounded-lg shadow flex flex-col items-center">
                    <div className="text-center space-y-2 mb-4">
                      <h3 className="text-lg font-semibold">Entity Configuration Coming Soon</h3>
                      <p className="text-sm text-gray-500">
                        The Entity Attribute configuration UI is in development and will be available soon.
                      </p>
                    </div>
                    <div className="w-full border-t my-4"></div>
                    <p className="text-xs text-gray-400 mt-2">
                      Entity system architecture is ready, UI implementation in progress.
                    </p>
                  </div>
                </div>
              </div>
              <div className="opacity-25 pointer-events-none">
                <div className="mb-8">
                  <h2 className="text-lg font-medium mb-2">Entity Types</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="overflow-hidden">
                      <div className="h-2 bg-indigo-500 w-full"></div>
                      <CardContent className="pt-6">
                        <h3 className="font-medium flex items-center gap-1">
                          <Database className="w-4 h-4" />
                          Customers
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">7 attributes defined</p>
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden">
                      <div className="h-2 bg-indigo-500 w-full"></div>
                      <CardContent className="pt-6">
                        <h3 className="font-medium flex items-center gap-1">
                          <Database className="w-4 h-4" />
                          Partners
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">8 attributes defined</p>
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden">
                      <div className="h-2 bg-indigo-500 w-full"></div>
                      <CardContent className="pt-6">
                        <h3 className="font-medium flex items-center gap-1">
                          <Database className="w-4 h-4" />
                          Opportunities
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">9 attributes defined</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'relationship-attributes' && (
            <div className="relative">
              <div className="absolute w-full h-full flex items-center justify-center">
                <div>
                  <div className="w-full max-w-xl px-8 pb-8 pt-6 bg-white rounded-lg shadow flex flex-col items-center">
                    <div className="text-center space-y-2 mb-4">
                      <h3 className="text-lg font-semibold">Relationship Configuration Coming Soon</h3>
                      <p className="text-sm text-gray-500">
                        The Relationship Attribute configuration UI is in development and will be available soon.
                      </p>
                    </div>
                    <div className="w-full border-t my-4"></div>
                    <p className="text-xs text-gray-400 mt-2">
                      Relationship system architecture is ready, UI implementation in progress.
                    </p>
                  </div>
                </div>
              </div>
              <div className="opacity-25 pointer-events-none">
                <div className="mb-8">
                  <h2 className="text-lg font-medium mb-2">Relationship Types</h2>
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
                      <TableRow>
                        <TableCell className="font-medium">
                          Customer
                          <div className="text-xs text-gray-500">
                            via Partners
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </TableCell>
                        <TableCell>
                          Partner
                          <div className="text-xs text-gray-500">
                            via Customers
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="rounded bg-indigo-50 px-2 py-1 text-xs text-indigo-600">
                            many-to-many
                          </span>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
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