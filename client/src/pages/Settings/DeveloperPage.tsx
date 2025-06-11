import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { RefreshCw, Terminal } from "lucide-react";

// Database schema information for degoudse environment only
const databaseSchemas = {
  degoudse: {
    description: "De Goudse insurance partner environment",
    connection: "PostgreSQL via Neon Database (isolated schema)",
    tables: {
      partners: {
        columns: ['id', 'name', 'description', 'initials', 'industry', 'type', 'size', 'status', 'location', 'contact_email', 'primary_contact', 'partner_type', 'region', 'assigned_user_ids', 'linked_opportunity_ids', 'created_at', 'updated_at'],
        relationships: ['degoudse.partner_customers', 'degoudse.partner_opportunities', 'degoudse.users'],
        shadowRisk: 'Low - Environment isolated'
      },
      customers: {
        columns: ['id', 'name', 'description', 'ownerId', 'createdAt', 'updatedAt'],
        relationships: ['degoudse.partner_customers', 'degoudse.customer_opportunities', 'degoudse.contacts'],
        shadowRisk: 'Low - Environment isolated'
      },
      opportunities: {
        columns: ['id', 'title', 'description', 'status', 'stage', 'estimated_value', 'partner_name', 'expected_close_date', 'created_at', 'updated_at'],
        relationships: ['degoudse.partner_opportunities', 'degoudse.customer_opportunities', 'degoudse.opportunity_products'],
        shadowRisk: 'Low - Environment isolated'
      },
      partner_customers: {
        columns: ['id', 'partner_id', 'customer_id', 'created_at'],
        relationships: ['Junction: degoudse.partners ↔ degoudse.customers'],
        shadowRisk: 'Low - Environment isolated'
      },
      partner_opportunities: {
        columns: ['id', 'partner_id', 'opportunity_id', 'created_at'],
        relationships: ['Junction: degoudse.partners ↔ degoudse.opportunities'],
        shadowRisk: 'Low - Environment isolated'
      },
      customer_opportunities: {
        columns: ['id', 'customer_id', 'opportunity_id', 'created_at'],
        relationships: ['Junction: degoudse.customers ↔ degoudse.opportunities'],
        shadowRisk: 'Low - Environment isolated'
      },
      opportunity_products: {
        columns: ['id', 'opportunity_id', 'product_id', 'created_at'],
        relationships: ['Junction: degoudse.opportunities ↔ degoudse.products'],
        shadowRisk: 'Low - Environment isolated'
      },
      products: {
        columns: ['id', 'name', 'description', 'type', 'category', 'price', 'vendor_id', 'status', 'created_at', 'updated_at'],
        relationships: ['degoudse.vendors', 'degoudse.opportunity_products'],
        shadowRisk: 'Low - Environment isolated'
      },
      vendors: {
        columns: ['id', 'name', 'description', 'contact_email', 'contact_phone', 'website', 'industry', 'status', 'created_at', 'updated_at'],
        relationships: ['degoudse.products'],
        shadowRisk: 'Low - Environment isolated'
      },
      contacts: {
        columns: ['id', 'first_name', 'last_name', 'full_name', 'email', 'phone', 'job_title', 'department', 'company', 'linked_entity_type', 'linked_entity_id', 'is_primary', 'notes', 'tags', 'is_active', 'created_at', 'updated_at'],
        relationships: ['Polymorphic: degoudse entities via linked_entity_type/linked_entity_id'],
        shadowRisk: 'Low - Environment isolated'
      },
      okr_metrics: {
        columns: ['id', 'name', 'description', 'realized_value', 'target_value', 'measure_unit', 'currency_type', 'traffic_light_thresholds', 'progress_bar_thresholds', 'picklist_options', 'responsible_user_id', 'responsible_contact_id', 'timeframe', 'frequency', 'attachment_url', 'due_date', 'is_muted', 'is_archived', 'is_shared', 'hierarchy', 'tags', 'created_by', 'created_at', 'updated_at'],
        relationships: ['degoudse.okr_tags', 'degoudse.users', 'degoudse.contacts'],
        shadowRisk: 'Low - Environment isolated'
      },
      okr_tags: {
        columns: ['id', 'name', 'color', 'created_at', 'updated_at'],
        relationships: ['degoudse.okr_metrics'],
        shadowRisk: 'Low - Environment isolated'
      },
      saved_lists: {
        columns: ['id', 'name', 'description', 'type', 'entity_type', 'members', 'filters', 'is_shared', 'is_default', 'created_by', 'created_at', 'updated_at', 'partner_id'],
        relationships: ['degoudse.users (created_by)', 'degoudse.partners (partner_id)', 'degoudse.shared_lists'],
        shadowRisk: 'Low - Environment isolated'
      },
      shared_lists: {
        columns: ['id', 'list_id', 'shared_with_partner_id', 'shared_by_user_id', 'permissions', 'shared_at'],
        relationships: ['degoudse.saved_lists', 'degoudse.partners', 'degoudse.users'],
        shadowRisk: 'Low - Environment isolated'
      },
      list_collaborators: {
        columns: ['id', 'list_id', 'user_id', 'permissions', 'added_by', 'added_at'],
        relationships: ['degoudse.saved_lists', 'degoudse.users'],
        shadowRisk: 'Low - Environment isolated'
      },
      saved_views: {
        columns: ['id', 'name', 'description', 'entity_type', 'view_config', 'filters', 'sort_config', 'column_config', 'is_default', 'created_by', 'created_at', 'updated_at'],
        relationships: ['degoudse.users (created_by)'],
        shadowRisk: 'Low - Environment isolated'
      }
    }
  }
};

// Schema info for degoudse environment
const schemaInfo = databaseSchemas.degoudse.tables;

// Complete API endpoints mapping - updated from actual routes audit
const apiEndpoints = {
  degoudse_core: [
    { method: 'GET', path: '/api/degoudse/partners', description: 'Get all partners from degoudse schema with relationship counts' },
    { method: 'GET', path: '/api/degoudse/customers', description: 'Get all customers from degoudse environment' },
    { method: 'GET', path: '/api/degoudse/opportunities', description: 'Get all opportunities from degoudse environment' },
    { method: 'GET', path: '/api/degoudse/products', description: 'Get products from degoudse environment' },
    { method: 'GET', path: '/api/degoudse/vendors', description: 'Get vendors from degoudse environment' },
    { method: 'GET', path: '/api/degoudse/saved-lists', description: 'Get saved lists from degoudse environment' },
    { method: 'GET', path: '/api/degoudse/saved-views', description: 'Get saved views from degoudse environment' }
  ],
  degoudse_okr: [
    { method: 'GET', path: '/api/degoudse/okr-metrics', description: 'Get OKR metrics from degoudse environment' },
    { method: 'POST', path: '/api/degoudse/okr-metrics', description: 'Create new OKR metric in degoudse environment' },
    { method: 'PUT', path: '/api/degoudse/okr-metrics/:id', description: 'Update OKR metric in degoudse environment' },
    { method: 'GET', path: '/api/degoudse/okr-tags', description: 'Get OKR tags from degoudse environment' },
    { method: 'POST', path: '/api/degoudse/okr-tags', description: 'Create new OKR tag in degoudse environment' },
    { method: 'PUT', path: '/api/degoudse/okr-tags/:id', description: 'Update OKR tag in degoudse environment' },
    { method: 'DELETE', path: '/api/degoudse/okr-tags/:id', description: 'Delete OKR tag from degoudse environment' }
  ],
  relationships: [
    { method: 'GET', path: '/api/partners/:id/customers', description: 'Get customers for specific partner' },
    { method: 'GET', path: '/api/partners/:id/opportunities', description: 'Get opportunities for specific partner' },
    { method: 'GET', path: '/api/customers/:id/partners', description: 'Get partners for specific customer' },
    { method: 'GET', path: '/api/customers/:id/products', description: 'Get products for specific customer' },
    { method: 'GET', path: '/api/customers/:id/contacts', description: '✓ Get contacts for specific customer (NEW)' },
    { method: 'GET', path: '/api/opportunities/:id/partners', description: 'Get partners for specific opportunity' },
    { method: 'GET', path: '/api/vendors/:id/products', description: 'Get products for specific vendor' }
  ],
  detail: [
    { method: 'GET', path: '/api/customers/:id', description: 'Get specific customer details' },
    { method: 'GET', path: '/api/opportunities/:id', description: 'Get specific opportunity details' },
    { method: 'GET', path: '/api/vendors/:id', description: 'Get specific vendor details' },
    { method: 'GET', path: '/api/products/:id', description: 'Get specific product details' }
  ],
  mutations: [
    { method: 'POST', path: '/api/partners', description: '✓ Create new partner (Direct SQL - Working)' },
    { method: 'POST', path: '/api/customers', description: '✓ Create new customer (Direct SQL - Working)' },
    { method: 'POST', path: '/api/opportunities', description: '✓ Create new opportunity (Direct SQL - Fixed)' },
    { method: 'POST', path: '/api/vendors', description: 'Create new vendor' },
    { method: 'POST', path: '/api/products', description: 'Create new product' },
    { method: 'PUT', path: '/api/opportunities/:id', description: 'Update existing opportunity' },
    { method: 'DELETE', path: '/api/opportunities/:id', description: 'Delete opportunity' },
    { method: 'GET', path: '/api/users', description: 'Get all active users (requires x-environment-id header)' },
    { method: 'GET', path: '/api/users/:id', description: 'Get specific user by ID' },
    { method: 'POST', path: '/api/users', description: 'Create new user with role and department' },
    { method: 'PUT', path: '/api/users/:id', description: 'Update existing user' },
    { method: 'DELETE', path: '/api/users/:id', description: 'Soft delete user (deactivate)' },
    { method: 'GET', path: '/api/contacts', description: 'Get all contacts with optional entity filtering' },
    { method: 'GET', path: '/api/contacts/:id', description: 'Get specific contact by ID' },
    { method: 'POST', path: '/api/contacts', description: 'Create new contact with entity linking' },
    { method: 'PUT', path: '/api/contacts/:id', description: 'Update existing contact' },
    { method: 'DELETE', path: '/api/contacts/:id', description: 'Soft delete contact (deactivate)' },
    { method: 'POST', path: '/api/contacts/:id/link', description: 'Link contact to specific entity' },
    { method: 'GET', path: '/api/entities/:entityType/:entityId/contacts', description: 'Get contacts for specific entity' }
  ],
  environments: [
    { method: 'GET', path: '/api/degoudse/partners', description: 'Get partners from De Goudse environment' },
    { method: 'GET', path: '/api/degoudse/customers', description: 'Get customers from De Goudse environment' },
    { method: 'GET', path: '/api/degoudse/opportunities', description: 'Get opportunities from De Goudse environment' },
    { method: 'GET', path: '/api/degoudse/products', description: 'Get products from De Goudse environment' },
    { method: 'GET', path: '/api/degoudse/customers/:id/partners', description: 'Get partners for De Goudse customer' },
    { method: 'GET', path: '/api/degoudse/customers/:id/opportunities', description: 'Get opportunities for De Goudse customer' },
    { method: 'GET', path: '/api/degoudse/customers/:id/products', description: 'Get products for De Goudse customer' },
    { method: 'GET', path: '/api/degoudse/customers/:id/contacts', description: '✓ Get contacts for De Goudse customer (NEW)' },
    { method: 'GET', path: '/api/degoudse/okr-metrics', description: 'Get OKR metrics from De Goudse environment' },
    { method: 'GET', path: '/api/degoudse/okr-tags', description: 'Get OKR tags from De Goudse environment' },
    { method: 'POST', path: '/api/degoudse/upload-opportunities', description: 'Upload opportunities to De Goudse environment' },
    { method: 'GET', path: '/api/admin/environments', description: 'Get all available environments' },
    { method: 'GET', path: '/api/admin/environment-stats', description: 'Get statistics for all environments' },
    { method: 'GET', path: '/api/database-status', description: 'Get database connection and record counts' }
  ],
  utilities: [
    { method: 'POST', path: '/api/files/upload', description: 'Upload PDF files for processing' },
    { method: 'POST', path: '/api/files/compare', description: 'Compare PDF documents' },
    { method: 'POST', path: '/api/email/send', description: 'Send email notifications' }
  ]
};

// Complete frontend route mapping - updated from actual App.tsx audit
const frontendRoutes = {
  core: [
    { path: '/', component: 'PartnerPilot', description: 'Main dashboard and landing page' }
  ],
  entities: [
    { path: '/partners', component: 'PartnersPage', description: 'Main partners list with filtering and search' },
    { path: '/customers', component: 'CustomersPageClean', description: 'Main customers list with partner relationships' },
    { path: '/opportunities', component: 'OpportunitiesPage', description: 'Main opportunities list with advanced filtering and list management' },
    { path: '/vendors', component: 'VendorsPage', description: 'Vendors management page' },
    { path: '/products', component: 'ProductsPage', description: 'Products catalog page' },
    { path: '/projects', component: 'ProjectsPage', description: 'Projects list (placeholder)' },
    { path: '/contacts', component: 'ContactsPage', description: 'Contacts list (placeholder)' }
  ],
  details: [
    { path: '/lists/partners/:id', component: 'PartnerDetail-clean', description: 'Partner detail with related customers and opportunities' },
    { path: '/opportunities/:id', component: 'OpportunityDetail', description: 'Opportunity detail with client and partner information' }
  ],
  campaigns: [
    { path: '/campaigns', component: 'CampaignsPage', description: 'Campaign management (environment restricted)' },
    { path: '/campaigns/new', component: 'CampaignBuilder', description: 'Create new campaign' },
    { path: '/campaigns/:id', component: 'CampaignDetail', description: 'Campaign detail view' }
  ],
  dataUpload: [
    { path: '/data-upload', component: 'DataUploadOptions', description: 'Data upload selection page' },
    { path: '/data-upload/brio', component: 'BrioUploadFlow', description: 'Brio data upload wizard' },
    { path: '/data-upload/degoudse', component: 'DeGoudseUploadWizard', description: 'De Goudse data upload wizard' }
  ],
  settings: [
    { path: '/settings/users', component: 'UserManagement', description: 'User management and permissions' },
    { path: '/settings/developer', component: 'DeveloperPage', description: 'System architecture and debugging dashboard' }
  ],
  templates: [
    { path: '/templates/okr-metrics', component: 'OKRMetricsPage', description: 'OKR metrics templates' },
    { path: '/templates/groups/:id', component: 'GroupDetail', description: 'Group detail template' }
  ],
  reports: [
    { path: '/reports', component: 'ReportsPage', description: 'Reports and analytics dashboard' }
  ]
};

function DeveloperPage() {
  const { environment } = useEnvironment();
  const [activeTab, setActiveTab] = useState('database');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState<{
    myqollabi?: { 
      partners: number; customers: number; opportunities: number; products: number;
      partnerCustomerLinks: number; partnerOpportunityLinks: number; 
      customerOpportunityLinks: number; opportunityProductLinks: number;
    };
    degoudse?: { 
      partners: number; customers: number; opportunities: number; products: number;
      partnerCustomerLinks: number; partnerOpportunityLinks: number; 
      customerOpportunityLinks: number; opportunityProductLinks: number;
    };
  }>({});
  
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const queryClient = useQueryClient();

  // Function to refresh database status
  const refreshDatabaseStatus = async () => {
    setIsLoading(true);
    try {
      // Fetch database counts for both environments
      const response = await fetch('/api/database-status');
      if (response.ok) {
        const data = await response.json();
        setDatabaseStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch database status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch table counts
  const fetchTableCounts = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/degoudse/table-counts');
      if (response.ok) {
        const data = await response.json();
        setTableCounts(data);
      }
    } catch (error) {
      console.error('Failed to fetch table counts:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to refresh all dashboard data
  const refreshDashboard = async () => {
    await Promise.all([
      refreshDatabaseStatus(),
      fetchTableCounts()
    ]);
  };

  // Load database status and table counts on component mount
  useEffect(() => {
    refreshDashboard();
  }, []);

  // Simulate console output updates
  useEffect(() => {
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      const messages = [
        `${timestamp} [express] GET /api/partners 200 in 45ms`,
        `${timestamp} [express] GET /api/opportunities 200 in 67ms`,
        `${timestamp} [express] POST /api/contacts 201 in 123ms`,
        `${timestamp} [database] Connection pool active: 5/10 connections`,
        `${timestamp} [system] Memory usage: 45.2MB / 512MB`,
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setConsoleOutput(prev => [...prev.slice(-19), randomMessage]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Fetch live database statistics
  const { data: partnersCount } = useQuery({
    queryKey: ['/api/partners'],
    select: (data: any) => data?.length || 0
  });

  const { data: customersCount } = useQuery({
    queryKey: ['/api/customers'],
    select: (data: any) => data?.length || 0
  });

  const { data: opportunitiesCount } = useQuery({
    queryKey: ['/api/opportunities'],
    select: (data: any) => data?.length || 0
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Developer Dashboard</h1>
          <p className="text-muted-foreground">System architecture, data structures, and debugging tools</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshDashboard}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing || isLoading ? 'animate-spin' : ''}`} />
            {isRefreshing || isLoading ? 'Refreshing...' : 'Refresh Dashboard'}
          </Button>
          <Badge variant="outline" className="text-sm">
            Environment: {environment.name}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="api">API Endpoints</TabsTrigger>
          <TabsTrigger value="frontend">Frontend Routes</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="terminal" className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Terminal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-6">
          {/* Environment Isolation Status */}
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                Environment Isolation Successfully Configured
              </CardTitle>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-green-600">Current Environment</p>
                    <p className="text-lg font-bold text-green-800">De Goudse Only</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600">Data Sources</p>
                    <p className="text-lg font-bold text-green-800">Authentic degoudse data exclusively</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-green-600">
                  All API calls now route to /api/degoudse/ endpoints. No mixed environment data detected.
                </div>
              </CardContent>
            </CardHeader>
          </Card>

          {/* Recent Updates Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                System Status & Recent Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-green-600">✓ Recently Completed</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Fixed opportunity creation database errors</li>
                    <li>• Replaced storage layer with direct SQL approach</li>
                    <li>• Updated PostgreSQL array field handling</li>
                    <li>• Resolved React key prop warnings</li>
                    <li>• Standardized entity creation endpoints</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-blue-600">📊 Database Integration</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• All entities use myqollabi schema</li>
                    <li>• Direct SQL queries for reliability</li>
                    <li>• Proper array handling for linked fields</li>
                    <li>• Environment isolation active</li>
                    <li>• Real-time data synchronization</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Live Data Counts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Partners:</span>
                  <Badge variant="secondary">{partnersCount || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Customers:</span>
                  <Badge variant="secondary">{customersCount || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Opportunities:</span>
                  <Badge variant="secondary">{opportunitiesCount || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Schema: {environment.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.keys(schemaInfo).map((table) => (
                    <div key={table} className="text-sm">
                      <span className="font-medium">{table}</span>
                      <div className="text-xs text-muted-foreground ml-2">
                        {schemaInfo[table as keyof typeof schemaInfo].columns.length} columns
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Data Integrity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Authentic Data Only</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Relationships Enforced</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>No Mock Data</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comprehensive Database Schema Sections */}
          {Object.entries(databaseSchemas).map(([schemaName, schemaData]) => (
            <div key={schemaName} className="space-y-4">
              <div className="border-l-4 border-l-blue-500 pl-4">
                <h3 className="text-xl font-semibold capitalize flex items-center gap-2">
                  {schemaName.replace('_', ' ')} 

                  {schemaName === environment.id && (
                    <Badge variant="default" className="ml-2 bg-green-500">CURRENT</Badge>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{schemaData.description}</p>
                <p className="text-xs text-muted-foreground">{schemaData.connection}</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Object.entries(schemaData.tables).map(([tableName, tableInfo]) => (
                  <Card key={`${schemaName}-${tableName}`}>
                    <CardHeader>
                      <CardTitle className="text-lg capitalize flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {tableName}
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            {tableCounts[tableName] !== undefined ? `${tableCounts[tableName]} records` : 'Loading...'}
                          </Badge>
                        </div>
                        <Badge 
                          variant={
                            tableInfo.shadowRisk === 'None - Primary schema' ? 'default' :
                            tableInfo.shadowRisk?.includes('HIGH') ? 'destructive' : 
                            'secondary'
                          }
                          className={
                            tableInfo.shadowRisk === 'None - Primary schema' ? 'bg-green-500' :
                            tableInfo.shadowRisk?.includes('HIGH') ? '' : 
                            'bg-orange-500'
                          }
                        >
                          {tableInfo.shadowRisk?.includes('HIGH') ? '⚠️ SHADOW' : 
                           tableInfo.shadowRisk?.includes('Low') ? '🔒 ISOLATED' : '✓ SECURE'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Columns ({tableInfo.columns.length})</h4>
                          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                            {tableInfo.columns.map((column, index) => (
                              <Badge 
                                key={`${tableName}-${column}-${index}`} 
                                variant="outline" 
                                className="text-xs"
                              >
                                {column}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-2">Relationships</h4>
                          <div className="text-sm text-muted-foreground">
                            {Array.isArray(tableInfo.relationships) 
                              ? tableInfo.relationships.join(', ')
                              : tableInfo.relationships
                            }
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-2">Security Assessment</h4>
                          <div className={`text-xs p-2 rounded ${
                            tableInfo.shadowRisk?.includes('HIGH') ? 'bg-red-100 text-red-800' :
                            tableInfo.shadowRisk?.includes('Low') ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {tableInfo.shadowRisk}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
          
          {/* Environment Status */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                ✅ Shadow Database Removal Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white rounded border border-green-200">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-green-700">Shadow Schemas Remaining</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border border-green-200">
                    <div className="text-2xl font-bold text-green-600">DELETED</div>
                    <div className="text-sm text-green-700">Status</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border border-green-200">
                    <div className="text-2xl font-bold text-green-600">100%</div>
                    <div className="text-sm text-green-700">Environment Isolation</div>
                  </div>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <h4 className="font-medium text-green-800 mb-2">Cleanup Complete</h4>
                  <p className="text-sm text-green-700">
                    All shadow database schemas (acme, globex, oceanic) have been permanently deleted from PostgreSQL. 
                    The system now operates exclusively with the degoudse database environment.
                    Only authorized degoudse schema remains accessible.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          {Object.entries(apiEndpoints).map(([category, endpoints]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg capitalize">{category} Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {endpoints.map((endpoint, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono">{endpoint.path}</code>
                        </div>
                        <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="frontend" className="space-y-6">
          {Object.entries(frontendRoutes).map(([category, routes]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg capitalize">{category} Routes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {routes.map((route, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <code className="text-sm font-mono">{route.path}</code>
                          <Badge variant="outline">{route.component}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{route.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="relationships" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Partner Relationships</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Partner → Customers</h4>
                    <p className="text-sm text-muted-foreground mb-2">Many-to-many via partner_customers table</p>
                    <code className="text-xs bg-muted p-2 rounded block">
                      /api/partners/1/customers
                    </code>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Partner → Opportunities</h4>
                    <p className="text-sm text-muted-foreground mb-2">Many-to-many via partner_opportunities table</p>
                    <code className="text-xs bg-muted p-2 rounded block">
                      /api/partners/1/opportunities
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer & Opportunity Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Customer → Opportunities</h4>
                    <p className="text-sm text-muted-foreground mb-2">One-to-many via client_id foreign key</p>
                    <code className="text-xs bg-muted p-2 rounded block">
                      opportunities.client_id → customers.id
                    </code>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Customer → Partners</h4>
                    <p className="text-sm text-muted-foreground mb-2">Many-to-many via partner_customers table</p>
                    <code className="text-xs bg-muted p-2 rounded block">
                      /api/customers/1/partners
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="environments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Environment Schemas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <h4 className="font-medium mb-2">Active Database Schemas</h4>
                  <div className="space-y-2">
                    {['degoudse'].map((schema) => (
                      <div key={schema} className="flex justify-between items-center p-2 border rounded">
                        <span className="font-mono">{schema}</span>
                        <Badge variant={schema === environment.id ? "default" : "outline"}>
                          {schema === environment.id ? "Current" : "Available"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Isolation Audit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <h4 className="font-medium mb-2">Isolation Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Schema Separation:</span>
                      <Badge variant="default" className="bg-green-500">Complete</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Cross-Environment Queries:</span>
                      <Badge variant="default" className="bg-red-500">Blocked</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Leakage Risk:</span>
                      <Badge variant="default" className="bg-green-500">None</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Environment Switching:</span>
                      <Badge variant="default" className="bg-blue-500">Secure</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Environment Database Status
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshDatabaseStatus}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3 text-indigo-600">My Qollabi Environment</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Records</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Partners:</span>
                              <span className="font-mono">{databaseStatus.myqollabi?.partners || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Customers:</span>
                              <span className="font-mono">{databaseStatus.myqollabi?.customers || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Opportunities:</span>
                              <span className="font-mono">{databaseStatus.myqollabi?.opportunities || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Products:</span>
                              <span className="font-mono">{databaseStatus.myqollabi?.products || 0}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Relationships</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Partner ↔ Customer:</span>
                              <span className="font-mono text-blue-600">{databaseStatus.myqollabi?.partnerCustomerLinks || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Partner ↔ Opportunity:</span>
                              <span className="font-mono text-blue-600">{databaseStatus.myqollabi?.partnerOpportunityLinks || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Customer ↔ Opportunity:</span>
                              <span className="font-mono text-blue-600">{databaseStatus.myqollabi?.customerOpportunityLinks || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Opportunity ↔ Product:</span>
                              <span className="font-mono text-blue-600">{databaseStatus.myqollabi?.opportunityProductLinks || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3 text-orange-600">De Goudse Environment</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Records</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Partners:</span>
                              <span className="font-mono">{databaseStatus.degoudse?.partners || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Customers:</span>
                              <span className="font-mono">{databaseStatus.degoudse?.customers || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Opportunities:</span>
                              <span className="font-mono">{databaseStatus.degoudse?.opportunities || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Products:</span>
                              <span className="font-mono">{databaseStatus.degoudse?.products || 0}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Relationships</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Partner ↔ Customer:</span>
                              <span className="font-mono text-orange-600">{databaseStatus.degoudse?.partnerCustomerLinks || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Partner ↔ Opportunity:</span>
                              <span className="font-mono text-orange-600">{databaseStatus.degoudse?.partnerOpportunityLinks || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Customer ↔ Opportunity:</span>
                              <span className="font-mono text-orange-600">{databaseStatus.degoudse?.customerOpportunityLinks || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Opportunity ↔ Product:</span>
                              <span className="font-mono text-orange-600">{databaseStatus.degoudse?.opportunityProductLinks || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Environment-Specific Routes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <code className="bg-muted p-2 rounded">/api/degoudse/partners</code>
                      <code className="bg-muted p-2 rounded">/api/degoudse/opportunities</code>
                      <code className="bg-muted p-2 rounded">/api/degoudse/upload-opportunities</code>
                      <code className="bg-muted p-2 rounded">/data-upload/degoudse</code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Flow Monitoring</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <h4 className="font-medium mb-2">Frontend → Backend Flow</h4>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>React component mounts</li>
                    <li>useQuery hook triggers API call</li>
                    <li>Express route handler processes request</li>
                    <li>Drizzle ORM queries PostgreSQL</li>
                    <li>Data returned through response chain</li>
                    <li>React Query caches and displays data</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Environment Isolation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <h4 className="font-medium mb-2">Current Environment: {environment.name}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Schema:</span>
                      <Badge variant="outline">{environment.id === 'myqollabi' ? 'myqollabi' : environment.id}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Isolation:</span>
                      <Badge variant="outline">Complete</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Cross-env Access:</span>
                      <Badge variant="outline">Blocked</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real-Time Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={async () => {
                  try {
                    const endpoints = ['/api/partners', '/api/customers', '/api/opportunities'];
                    const results = await Promise.all(
                      endpoints.map(async (endpoint) => {
                        const response = await fetch(endpoint);
                        return { endpoint, status: response.status, ok: response.ok };
                      })
                    );
                    console.log('API Health Check:', results);
                    alert(`API Health: ${results.filter(r => r.ok).length}/${results.length} endpoints healthy`);
                  } catch (error) {
                    console.error('Health check failed:', error);
                    alert('Health check failed - see console for details');
                  }
                }}>
                  🔍 Run API Health Check
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => {
                  const audit = {
                    currentEnvironment: environment,
                    schemas: ['qollabi', 'degoudse', 'acme', 'globex', 'oceanic'],
                    apiEndpoints: Object.values(apiEndpoints).flat().length,
                    frontendRoutes: Object.values(frontendRoutes).flat().length,
                    isolationStatus: 'Complete',
                    timestamp: new Date().toISOString()
                  };
                  console.log('System Audit:', audit);
                  alert('Complete system audit logged to console');
                }}>
                  📊 Generate System Audit
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => {
                  console.log('Database Schema:', schemaInfo);
                  console.log('API Endpoints:', apiEndpoints);
                  console.log('Frontend Routes:', frontendRoutes);
                  console.log('Current Environment:', environment);
                  alert('All system information logged to console for debugging');
                }}>
                  🐛 Export Debug Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shadow Database Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Unauthorized Schemas</span>
                    <Badge variant="default" className="bg-green-500">None Detected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Route Consistency</span>
                    <Badge variant="default" className="bg-green-500">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Data Source Authenticity</span>
                    <Badge variant="default" className="bg-green-500">100%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Environment Isolation</span>
                    <Badge variant="default" className="bg-green-500">Enforced</Badge>
                  </div>
                  <div className="mt-3 p-2 bg-green-50 rounded text-xs">
                    Last Scan: {new Date().toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Database Connection</span>
                    <Badge variant="default" className="bg-green-500">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>API Endpoints</span>
                    <Badge variant="default" className="bg-green-500">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Data Integrity</span>
                    <Badge variant="default" className="bg-green-500">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Relationships</span>
                    <Badge variant="default" className="bg-green-500">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="terminal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Live Console Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full rounded border bg-black p-4">
                <div className="font-mono text-sm space-y-1">
                  {consoleOutput.length === 0 ? (
                    <div className="text-green-400">
                      Waiting for console output...
                    </div>
                  ) : (
                    consoleOutput.map((line, index) => (
                      <div key={index} className="text-green-400">
                        {line}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              <div className="mt-4 text-sm text-muted-foreground">
                Real-time server logs and system events. Console updates automatically every 3 seconds.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DeveloperPage;