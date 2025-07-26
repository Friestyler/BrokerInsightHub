import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Building, 
  Target, 
  Users, 
  UserCheck, 
  Folder, 
  Package, 
  GitBranch,
  Network,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Crown,
  Settings,
  Briefcase,
  Mail,
  Phone
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useEnvironment } from '@/contexts/EnvironmentContext';

// Interface definitions for network data
interface NetworkEntity {
  id: string;
  name: string;
  type: string;
  color: string;
  size: number;
  [key: string]: any;
}

interface NetworkRelationship {
  from: string;
  to: string;
  type: string;
  color: string;
  thickness?: number;
}

export default function NetworkVisualization() {
  const { environment } = useEnvironment();
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [activeView, setActiveView] = useState('network');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [activeFilters, setActiveFilters] = useState({
    customers: true,
    opportunities: true,
    contacts: true,
    partners: true,
    projects: true,
    products: true,
    hierarchy: true
  });

  const svgRef = useRef<SVGSVGElement>(null);

  // Fetch real data from API using direct degoudse endpoints
  const { data: customers } = useQuery({
    queryKey: ['/api/degoudse/customers'],
    staleTime: 30000,
  });

  const { data: opportunities } = useQuery({
    queryKey: ['/api/degoudse/opportunities'],
    staleTime: 30000,
  });

  const { data: partners } = useQuery({
    queryKey: ['/api/degoudse/partners'],
    staleTime: 30000,
  });

  const { data: contacts } = useQuery({
    queryKey: ['/api/degoudse/contacts'],
    staleTime: 30000,
  });

  const { data: products } = useQuery({
    queryKey: ['/api/degoudse/products'],
    staleTime: 30000,
  });

  // Set default customer when data loads
  useEffect(() => {
    if (customers && Array.isArray(customers) && customers.length > 0 && !selectedCustomer) {
      setSelectedCustomer(customers[0].name);
    }
  }, [customers, selectedCustomer]);

  // Calculate real counts from data
  const getEntityCounts = () => {
    const selectedCustomerData = customers?.find((c: any) => c.name === selectedCustomer);
    const customerOpportunities = opportunities?.filter((o: any) => o.customer_id === selectedCustomerData?.id) || [];
    const customerContacts = contacts?.filter((c: any) => c.customer_id === selectedCustomerData?.id) || [];
    
    return {
      customers: customers?.length || 0,
      opportunities: customerOpportunities.length,
      contacts: customerContacts.length,
      partners: partners?.length || 0,
      projects: 8, // Placeholder as projects not in current schema
      products: products?.length || 0,
      hierarchy: 1
    };
  };

  const entityCounts = getEntityCounts();

  const filterOptions = [
    { key: 'customers', label: 'Customers', count: entityCounts.customers, icon: Building },
    { key: 'opportunities', label: 'Opportunities', count: entityCounts.opportunities, icon: Target },
    { key: 'contacts', label: 'Contacts', count: entityCounts.contacts, icon: Users },
    { key: 'partners', label: 'Partners', count: entityCounts.partners, icon: UserCheck },
    { key: 'projects', label: 'Projects', count: entityCounts.projects, icon: Folder },
    { key: 'products', label: 'Products', count: entityCounts.products, icon: Package },
    { key: 'hierarchy', label: 'Hierarchy', count: entityCounts.hierarchy, icon: GitBranch }
  ];

  const toggleFilter = (filterKey: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey as keyof typeof prev]
    }));
  };

  const getRoleColor = (level: string) => {
    switch (level) {
      case 'executive': return 'bg-red-500 text-white';
      case 'vp': return 'bg-purple-500 text-white';
      case 'director': return 'bg-blue-500 text-white';
      case 'manager': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department.toLowerCase()) {
      case 'hr': return 'bg-purple-100 text-purple-800';
      case 'it': return 'bg-blue-100 text-blue-800';
      case 'marketing': return 'bg-pink-100 text-pink-800';
      case 'operations': return 'bg-orange-100 text-orange-800';
      case 'sales': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Transform real data for network visualization
  const getNetworkData = () => {
    if (!customers || !selectedCustomer) return { entities: [], relationships: [] };

    const selectedCustomerData = customers.find((c: any) => c.name === selectedCustomer);
    if (!selectedCustomerData) return { entities: [], relationships: [] };

    const entities: NetworkEntity[] = [];
    const relationships: NetworkRelationship[] = [];

    // Primary customer (large blue circle)
    entities.push({
      id: `customer-${selectedCustomerData.id}`,
      name: selectedCustomerData.name,
      type: 'customer',
      role: 'primary',
      color: '#3B82F6',
      size: 60,
      cx: 400,
      cy: 200
    });

    // Customer opportunities
    const customerOpportunities = opportunities?.filter((o: any) => o.customer_id === selectedCustomerData.id) || [];
    customerOpportunities.slice(0, 3).forEach((opp: any, index: number) => {
      const angle = (index * 120) * (Math.PI / 180);
      const x = 400 + Math.cos(angle) * 120;
      const y = 200 + Math.sin(angle) * 120;
      
      const status = opp.assessment_status || 'pending';
      let color = '#EAB308'; // yellow for pending
      if (status === 'accepted') color = '#10B981'; // green
      if (status === 'withheld') color = '#EF4444'; // red

      entities.push({
        id: `opportunity-${opp.id}`,
        name: opp.title,
        type: 'opportunity',
        status: status,
        value: opp.estimated_value ? `€${Math.round(opp.estimated_value / 1000)}k` : '',
        color: color,
        size: 35,
        cx: x,
        cy: y
      });

      relationships.push({
        from: `customer-${selectedCustomerData.id}`,
        to: `opportunity-${opp.id}`,
        type: 'has_opportunity',
        color: '#10B981'
      });
    });

    // Customer contacts
    const customerContacts = contacts?.filter((c: any) => c.customer_id === selectedCustomerData.id) || [];
    customerContacts.slice(0, 5).forEach((contact: any, index: number) => {
      const angle = (index * 72 + 36) * (Math.PI / 180);
      const x = 400 + Math.cos(angle) * 80;
      const y = 200 + Math.sin(angle) * 80;

      // Determine role level from job title
      const title = (contact.job_title || '').toLowerCase();
      let level = 'other';
      let color = '#6B7280';
      let size = 15;

      if (title.includes('ceo') || title.includes('executive') || title.includes('president')) {
        level = 'executive';
        color = '#EF4444';
        size = 25;
      } else if (title.includes('vp') || title.includes('vice president')) {
        level = 'vp';
        color = '#8B5CF6';
        size = 22;
      } else if (title.includes('director')) {
        level = 'director';
        color = '#3B82F6';
        size = 20;
      } else if (title.includes('manager')) {
        level = 'manager';
        color = '#10B981';
        size = 18;
      }

      entities.push({
        id: `contact-${contact.id}`,
        name: contact.first_name && contact.last_name ? `${contact.first_name} ${contact.last_name}` : contact.company_name,
        type: 'contact',
        level: level,
        role: contact.job_title,
        department: contact.department,
        email: contact.email,
        phone: contact.phone,
        color: color,
        size: size,
        cx: x,
        cy: y
      });

      relationships.push({
        from: `customer-${selectedCustomerData.id}`,
        to: `contact-${contact.id}`,
        type: 'employs',
        color: '#6366F1'
      });
    });

    return { entities, relationships };
  };

  const networkData = getNetworkData();

  const NetworkViewContent = () => (
    <div className="relative h-96 bg-gray-50 rounded-lg border overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" viewBox="0 0 800 400">
        {/* Relationship lines */}
        {networkData.relationships.map((rel, index) => {
          const fromEntity = networkData.entities.find(e => e.id === rel.from);
          const toEntity = networkData.entities.find(e => e.id === rel.to);
          if (!fromEntity || !toEntity) return null;

          return (
            <line
              key={index}
              x1={fromEntity.cx}
              y1={fromEntity.cy}
              x2={toEntity.cx}
              y2={toEntity.cy}
              stroke={rel.color}
              strokeWidth={rel.thickness || 2}
              className="opacity-60"
            />
          );
        })}

        {/* Entity nodes */}
        {networkData.entities.map((entity) => (
          <g key={entity.id}>
            <circle
              cx={entity.cx}
              cy={entity.cy}
              r={entity.size / 2}
              fill={entity.color}
              stroke={entity.type === 'customer' ? '#1E40AF' : 'none'}
              strokeWidth={entity.type === 'customer' ? '2' : '0'}
              className="cursor-pointer hover:opacity-80"
              onClick={() => setSelectedNode(entity)}
            />
            <text 
              x={entity.cx} 
              y={entity.cy + (entity.type === 'customer' ? 45 : 25)} 
              textAnchor="middle" 
              className="fill-gray-700 text-xs font-medium"
            >
              {entity.name.length > 12 ? entity.name.substring(0, 12) + '...' : entity.name}
            </text>
            {entity.value && (
              <text 
                x={entity.cx} 
                y={entity.cy + 35} 
                textAnchor="middle" 
                className="fill-gray-500 text-xs"
              >
                {entity.value}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Network controls */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-md border">
        <div className="text-xs font-semibold mb-2">Legend</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Primary Customer</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Owner/Parent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Accepted/Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Withheld/Inactive</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span>Projects</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Transform contacts data for org chart view
  const getOrgChartData = () => {
    if (!customers || !selectedCustomer || !contacts) return [];

    const selectedCustomerData = customers.find((c: any) => c.name === selectedCustomer);
    if (!selectedCustomerData) return [];

    const customerContacts = contacts.filter((c: any) => c.customer_id === selectedCustomerData.id);
    
    return customerContacts.map((contact: any) => {
      const title = (contact.job_title || '').toLowerCase();
      let level = 'other';

      if (title.includes('ceo') || title.includes('executive') || title.includes('president')) {
        level = 'executive';
      } else if (title.includes('vp') || title.includes('vice president')) {
        level = 'vp';
      } else if (title.includes('director')) {
        level = 'director';
      } else if (title.includes('manager')) {
        level = 'manager';
      }

      return {
        id: contact.id,
        name: contact.first_name && contact.last_name ? `${contact.first_name} ${contact.last_name}` : contact.company_name,
        role: contact.job_title || 'No title',
        department: contact.department || 'General',
        level: level,
        email: contact.email,
        phone: contact.phone
      };
    });
  };

  const OrgChartContent = () => {
    const orgContacts = getOrgChartData();
    const executives = orgContacts.filter(person => person.level === 'executive');
    const vps = orgContacts.filter(person => person.level === 'vp');
    const directors = orgContacts.filter(person => person.level === 'director');
    const managers = orgContacts.filter(person => person.level === 'manager');
    const others = orgContacts.filter(person => person.level === 'other');

    const ContactCard = ({ person }: { person: any }) => {
      const getRoleIcon = (level: string) => {
        switch (level) {
          case 'executive': return <Crown className="h-3 w-3" />;
          case 'vp': return <Settings className="h-3 w-3" />;
          case 'director': return <Building className="h-3 w-3" />;
          case 'manager': return <Briefcase className="h-3 w-3" />;
          default: return <Users className="h-3 w-3" />;
        }
      };

      return (
        <div 
          className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getRoleColor(person.level)}`}
          onClick={() => setSelectedNode(person)}
        >
          <div className="flex items-center space-x-2 mb-1">
            {getRoleIcon(person.level)}
            <div className="font-semibold text-sm">{person.name}</div>
          </div>
          <div className="text-xs opacity-90 mt-1">{person.role}</div>
          <Badge className={`mt-2 text-xs ${getDepartmentColor(person.department)}`}>
            {person.department}
          </Badge>
        </div>
      );
    };

    if (orgContacts.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No contacts found for this customer</p>
          <p className="text-sm">Select a customer with contacts to view the org chart</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Executive Level */}
        {executives.length > 0 && (
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-600 mb-3 flex items-center justify-center space-x-2">
              <Crown className="h-4 w-4 text-red-500" />
              <span>Executive Level</span>
            </div>
            <div className="flex justify-center space-x-4 flex-wrap">
              {executives.map(person => (
                <ContactCard key={person.id} person={person} />
              ))}
            </div>
          </div>
        )}

        {/* VP Level */}
        {vps.length > 0 && (
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-600 mb-3 flex items-center justify-center space-x-2">
              <Settings className="h-4 w-4 text-purple-500" />
              <span>VP Level</span>
            </div>
            <div className="flex justify-center space-x-4 flex-wrap">
              {vps.map(person => (
                <ContactCard key={person.id} person={person} />
              ))}
            </div>
          </div>
        )}

        {/* Director Level */}
        {directors.length > 0 && (
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-600 mb-3 flex items-center justify-center space-x-2">
              <Building className="h-4 w-4 text-blue-500" />
              <span>Director Level</span>
            </div>
            <div className="flex justify-center space-x-4 flex-wrap">
              {directors.map(person => (
                <ContactCard key={person.id} person={person} />
              ))}
            </div>
          </div>
        )}

        {/* Manager Level */}
        {managers.length > 0 && (
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-600 mb-3 flex items-center justify-center space-x-2">
              <Briefcase className="h-4 w-4 text-green-500" />
              <span>Manager Level</span>
            </div>
            <div className="flex justify-center space-x-4 flex-wrap">
              {managers.map(person => (
                <ContactCard key={person.id} person={person} />
              ))}
            </div>
          </div>
        )}

        {/* Other Roles */}
        {others.length > 0 && (
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-600 mb-3 flex items-center justify-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>Other Roles</span>
            </div>
            <div className="flex justify-center space-x-4 flex-wrap">
              {others.map(person => (
                <ContactCard key={person.id} person={person} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Network Visualization</h2>
          <p className="text-gray-600">Analyze customer relationships and organizational structures</p>
        </div>
        
        {/* Customer Selection */}
        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent>
            {customers && Array.isArray(customers) && customers.map((customer: any) => (
              <SelectItem key={customer.id} value={customer.name}>
                {customer.name} ({entityCounts.customers > 0 ? 'connections available' : 'no connections'})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Relationship Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
            {filterOptions.map((filter) => {
              const IconComponent = filter.icon;
              return (
                <Button
                  key={filter.key}
                  variant={activeFilters[filter.key as keyof typeof activeFilters] ? "default" : "outline"}
                  className="flex flex-col h-auto py-3 px-2"
                  onClick={() => toggleFilter(filter.key)}
                >
                  <IconComponent className="h-4 w-4 mb-1" />
                  <span className="text-xs font-medium">{filter.label}</span>
                  <span className="text-xs opacity-70">({filter.count})</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Visualization Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Relationship Network</CardTitle>
                <Tabs value={activeView} onValueChange={setActiveView} className="w-auto">
                  <TabsList>
                    <TabsTrigger value="network" className="flex items-center space-x-2">
                      <Network className="h-4 w-4" />
                      <span>Network View</span>
                    </TabsTrigger>
                    <TabsTrigger value="orgchart" className="flex items-center space-x-2">
                      <GitBranch className="h-4 w-4" />
                      <span>Org Chart</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {activeView === 'network' ? <NetworkViewContent /> : <OrgChartContent />}
            </CardContent>
          </Card>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedNode ? 'Node Details' : 'Select a Node'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <div className="font-semibold text-gray-900">{selectedNode.name}</div>
                    {selectedNode.role && (
                      <div className="text-sm text-gray-600 mt-1">{selectedNode.role}</div>
                    )}
                    {selectedNode.department && (
                      <Badge className={`mt-2 ${getDepartmentColor(selectedNode.department)}`}>
                        {selectedNode.department}
                      </Badge>
                    )}
                  </div>
                  
                  {selectedNode.email && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{selectedNode.email}</span>
                    </div>
                  )}
                  
                  {selectedNode.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{selectedNode.phone}</span>
                    </div>
                  )}
                  
                  {selectedNode.value && (
                    <div className="text-lg font-semibold text-green-600">
                      {selectedNode.value}
                    </div>
                  )}
                  
                  {selectedNode.status && (
                    <Badge variant={selectedNode.status === 'accepted' ? 'default' : 'secondary'}>
                      {selectedNode.status}
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click on any node in the visualization to see details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}