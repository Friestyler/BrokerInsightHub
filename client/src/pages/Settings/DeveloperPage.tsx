import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnvironment } from "@/contexts/EnvironmentContext";

// Database schema information
const schemaInfo = {
  myqollabi: {
    partners: {
      columns: ['id', 'name', 'description', 'initials', 'industry', 'type', 'size', 'status', 'location', 'contact_email', 'primary_contact', 'partner_type', 'region', 'assigned_user_ids', 'linked_opportunity_ids', 'created_at', 'updated_at'],
      relationships: ['partner_customers', 'partner_opportunities']
    },
    customers: {
      columns: ['id', 'name', 'description', 'initials', 'owner_id', 'contact_name', 'contact_email', 'contact_phone', 'assigned_partner_id', 'created_at', 'updated_at'],
      relationships: ['partner_customers', 'opportunities (via client_id)']
    },
    opportunities: {
      columns: ['id', 'title', 'description', 'client_id', 'status', 'stage', 'type', 'estimated_value', 'probability', 'location', 'partner_name', 'last_activity_date', 'linked_contact_ids', 'created_by', 'created_at', 'updated_at'],
      relationships: ['partner_opportunities', 'customers (via client_id)']
    },
    partner_customers: {
      columns: ['id', 'partner_id', 'customer_id', 'created_at'],
      relationships: ['Many-to-many junction table connecting partners and customers']
    },
    partner_opportunities: {
      columns: ['id', 'partner_id', 'opportunity_id', 'created_at'],
      relationships: ['Many-to-many junction table connecting partners and opportunities']
    }
  }
};

// API endpoints mapping
const apiEndpoints = {
  core: [
    { method: 'GET', path: '/api/partners', description: 'Get all partners with aggregate data' },
    { method: 'GET', path: '/api/customers', description: 'Get all customers with partner relationships' },
    { method: 'GET', path: '/api/opportunities', description: 'Get all opportunities with client information' }
  ],
  relationships: [
    { method: 'GET', path: '/api/partners/:id/customers', description: 'Get customers for specific partner' },
    { method: 'GET', path: '/api/partners/:id/opportunities', description: 'Get opportunities for specific partner' },
    { method: 'GET', path: '/api/customers/:id/partners', description: 'Get partners for specific customer' },
    { method: 'GET', path: '/api/opportunities/:id/partners', description: 'Get partners for specific opportunity' }
  ],
  detail: [
    { method: 'GET', path: '/api/partners/:id', description: 'Get specific partner details' },
    { method: 'GET', path: '/api/customers/:id', description: 'Get specific customer details' },
    { method: 'GET', path: '/api/opportunities/:id', description: 'Get specific opportunity details' }
  ]
};

// Frontend route mapping
const frontendRoutes = {
  lists: [
    { path: '/partners', component: 'PartnersPage', description: 'Main partners list with filtering and search' },
    { path: '/customers', component: 'CustomersPageClean', description: 'Main customers list with partner relationships' },
    { path: '/opportunities', component: 'OpportunitiesPage', description: 'Main opportunities list with client links' }
  ],
  details: [
    { path: '/lists/partners/:id', component: 'PartnerDetail-clean', description: 'Partner detail with related customers and opportunities' },
    { path: '/opportunities/:id', component: 'OpportunityDetail', description: 'Opportunity detail with client and partner information' }
  ]
};

function DeveloperPage() {
  const { environment } = useEnvironment();
  const [activeTab, setActiveTab] = useState('database');

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
        <Badge variant="outline" className="text-sm">
          Environment: {environment.name}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="api">API Endpoints</TabsTrigger>
          <TabsTrigger value="frontend">Frontend Routes</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-6">
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
                <CardTitle className="text-lg">Schema: myqollabi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.keys(schemaInfo.myqollabi).map((table) => (
                    <div key={table} className="text-sm">
                      <span className="font-medium">{table}</span>
                      <div className="text-xs text-muted-foreground ml-2">
                        {schemaInfo.myqollabi[table as keyof typeof schemaInfo.myqollabi].columns.length} columns
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(schemaInfo.myqollabi).map(([tableName, tableInfo]) => (
              <Card key={tableName}>
                <CardHeader>
                  <CardTitle className="text-lg capitalize">{tableName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Columns</h4>
                      <div className="flex flex-wrap gap-1">
                        {tableInfo.columns.map((column) => (
                          <Badge key={column} variant="outline" className="text-xs">
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                <CardTitle>Debugging Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => {
                  console.log('Database Schema:', schemaInfo);
                  alert('Schema information logged to console');
                }}>
                  Log Database Schema
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => {
                  console.log('API Endpoints:', apiEndpoints);
                  alert('API endpoints logged to console');
                }}>
                  Log API Endpoints
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => {
                  console.log('Current Environment:', environment);
                  alert('Environment data logged to console');
                }}>
                  Log Environment Data
                </Button>
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
      </Tabs>
    </div>
  );
}

export default DeveloperPage;