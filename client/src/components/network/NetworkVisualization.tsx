import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Building, 
  Target, 
  Users, 
  User,
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

  // Extract data arrays from API responses with proper type checking
  const customersArray = Array.isArray(customers?.data) ? customers.data : Array.isArray(customers) ? customers : [];
  const opportunitiesArray = Array.isArray(opportunities) ? opportunities : [];
  const partnersArray = Array.isArray(partners) ? partners : [];
  const contactsArray = Array.isArray(contacts) ? contacts : [];
  const productsArray = Array.isArray(products) ? products : [];

  // Set default customer when data loads
  useEffect(() => {
    if (customersArray && Array.isArray(customersArray) && customersArray.length > 0 && !selectedCustomer) {
      // Find a customer with opportunities for better visualization
      const customerWithOpportunities = customersArray.find((customer: any) => {
        const custOpps = opportunitiesArray?.filter((o: any) => o.customer_id === customer.id || o.clientId === customer.id);
        return custOpps && custOpps.length > 0;
      });
      
      const targetCustomer = customerWithOpportunities || customersArray[0];
      setSelectedCustomer(targetCustomer.name);
      
      console.log('Selected customer:', targetCustomer);
      console.log('Available opportunities:', opportunitiesArray?.slice(0, 3));
      console.log('Available contacts:', contactsArray?.slice(0, 3));
    }
  }, [customersArray, selectedCustomer, opportunitiesArray, contactsArray]);

  // Calculate real counts from data
  const getEntityCounts = () => {
    const selectedCustomerData = customersArray?.find((c: any) => c.name === selectedCustomer);
    if (!selectedCustomerData) {
      return {
        customers: customersArray?.length || 0,
        opportunities: 0,
        contacts: 0,
        partners: partnersArray?.length || 0,
        projects: 8,
        products: productsArray?.length || 0,
        hierarchy: 1
      };
    }
    
    // Check both customer_id and clientId field names
    const customerOpportunities = opportunitiesArray?.filter((o: any) => 
      o.customer_id === selectedCustomerData.id || o.clientId === selectedCustomerData.id
    ) || [];
    
    const customerContacts = contactsArray?.filter((c: any) => 
      c.customer_id === selectedCustomerData.id || c.clientId === selectedCustomerData.id
    ) || [];
    
    console.log('Entity counts for', selectedCustomer, ':', {
      customer: selectedCustomerData,
      opportunities: customerOpportunities.length,
      contacts: customerContacts.length,
      opportunitySample: customerOpportunities[0],
      contactSample: customerContacts[0]
    });
    
    return {
      customers: customersArray?.length || 0,
      opportunities: customerOpportunities.length,
      contacts: customerContacts.length,
      partners: partnersArray?.length || 0,
      projects: 8, // Placeholder as projects not in current schema
      products: productsArray?.length || 0,
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
    if (!customersArray || !selectedCustomer) return { entities: [], relationships: [] };

    const selectedCustomerData = customersArray.find((c: any) => c.name === selectedCustomer);
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

    // Customer opportunities (check both field names)
    const customerOpportunities = opportunitiesArray?.filter((o: any) => 
      o.customer_id === selectedCustomerData.id || o.clientId === selectedCustomerData.id
    ) || [];
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

    // Customer contacts (check both field names)
    const customerContacts = contactsArray.filter((c: any) => 
      c.customer_id === selectedCustomerData.id || c.clientId === selectedCustomerData.id
    );
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

    // Add partner relationships (via opportunities)
    const customerPartners = new Set();
    customerOpportunities.forEach((opp: any) => {
      const partnerId = opp.partner_id || opp.partnerId;
      if (partnerId) {
        const partner = partnersArray.find((p: any) => p.id === partnerId);
        if (partner && !customerPartners.has(partner.id)) {
          customerPartners.add(partner.id);
          
          entities.push({
            id: `partner-${partner.id}`,
            name: partner.name,
            type: 'partner',
            color: '#8B5CF6',
            size: 30,
            cx: 600,
            cy: 150 + Array.from(customerPartners).length * 60
          });

          relationships.push({
            from: `customer-${selectedCustomerData.id}`,
            to: `partner-${partner.id}`,
            type: 'managed_by',
            color: '#8B5CF6'
          });
        }
      }
    });

    // Add product connections (via opportunities)
    customerOpportunities.forEach((opp: any, index: number) => {
      const productId = opp.product_id || opp.productId;
      if (productId) {
        const product = productsArray.find((p: any) => p.id === productId);
        if (product) {
          const angle = (180 + index * 30) * (Math.PI / 180);
          const x = 400 + Math.cos(angle) * 150;
          const y = 200 + Math.sin(angle) * 150;

          const productNodeId = `product-${product.id}-opp-${opp.id}`;
          entities.push({
            id: productNodeId,
            name: product.name,
            type: 'product',
            color: '#F59E0B',
            size: 20,
            cx: x,
            cy: y
          });

          relationships.push({
            from: `opportunity-${opp.id}`,
            to: productNodeId,
            type: 'involves',
            color: '#F59E0B'
          });
        }
      }
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
    if (!customersArray || !selectedCustomer || !contactsArray) return [];

    const selectedCustomerData = customersArray.find((c: any) => c.name === selectedCustomer);
    if (!selectedCustomerData) return [];

    const customerContacts = contactsArray.filter((c: any) => c.customer_id === selectedCustomerData.id);
    
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


      {/* Relationship Filters - Apple/Google Style */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Relationship Filters</h3>
        <div className="grid grid-cols-7 gap-6">
          {filterOptions.map((filter) => {
            const IconComponent = filter.icon;
            const colors = {
              customers: 'bg-green-100 text-green-600',
              opportunities: 'bg-orange-100 text-orange-600', 
              contacts: 'bg-blue-100 text-blue-600',
              partners: 'bg-purple-100 text-purple-600',
              projects: 'bg-pink-100 text-pink-600',
              products: 'bg-indigo-100 text-indigo-600',
              hierarchy: 'bg-gray-100 text-gray-600'
            };
            return (
              <div 
                key={filter.key}
                className="flex flex-col items-center text-center cursor-pointer group transition-all duration-200 hover:scale-105"
                onClick={() => toggleFilter(filter.key)}
              >
                <div className={`w-12 h-12 rounded-2xl ${colors[filter.key as keyof typeof colors]} flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {filter.count}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {filter.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Visualization Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Relationship Network</h3>
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setActiveView('network')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeView === 'network' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Network className="h-4 w-4 inline mr-2" />
                    Network View
                  </button>
                  <button
                    onClick={() => setActiveView('orgchart')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeView === 'orgchart' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <GitBranch className="h-4 w-4 inline mr-2" />
                    Org Chart
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {activeView === 'network' ? <NetworkViewContent /> : <OrgChartContent />}
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedNode ? 'Node Details' : 'Select a Node'}
              </h3>
            </div>
            <div className="p-6">
              {selectedNode ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                      selectedNode.type === 'customer' ? 'bg-blue-100' :
                      selectedNode.type === 'opportunity' ? 'bg-yellow-100' :
                      selectedNode.type === 'contact' ? 'bg-indigo-100' :
                      selectedNode.type === 'partner' ? 'bg-purple-100' :
                      selectedNode.type === 'product' ? 'bg-orange-100' : 'bg-gray-100'
                    }`}>
                      {selectedNode.type === 'customer' && <Building className="h-8 w-8 text-blue-600" />}
                      {selectedNode.type === 'opportunity' && <Target className="h-8 w-8 text-yellow-600" />}
                      {selectedNode.type === 'contact' && <User className="h-8 w-8 text-indigo-600" />}
                      {selectedNode.type === 'partner' && <UserCheck className="h-8 w-8 text-purple-600" />}
                      {selectedNode.type === 'product' && <Package className="h-8 w-8 text-orange-600" />}
                    </div>
                    <div className="font-semibold text-gray-900 text-lg">{selectedNode.name}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">{selectedNode.type}</div>
                    {selectedNode.role && (
                      <div className="text-sm text-gray-600 mt-1">{selectedNode.role}</div>
                    )}
                    {selectedNode.department && (
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${getDepartmentColor(selectedNode.department)}`}>
                        {selectedNode.department}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 mt-6">
                    {/* Contact-specific information */}
                    {selectedNode.type === 'contact' && selectedNode.email && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-700">{selectedNode.email}</span>
                      </div>
                    )}
                    
                    {selectedNode.type === 'contact' && selectedNode.phone && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Phone className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700">{selectedNode.phone}</span>
                      </div>
                    )}
                    
                    {/* Opportunity value */}
                    {selectedNode.type === 'opportunity' && selectedNode.value && (
                      <div className="p-3 bg-green-50 rounded-xl">
                        <div className="text-sm text-gray-600 text-center mb-1">Estimated Value</div>
                        <div className="text-lg font-semibold text-green-700 text-center">
                          {selectedNode.value}
                        </div>
                      </div>
                    )}
                    
                    {/* Opportunity status */}
                    {selectedNode.type === 'opportunity' && selectedNode.status && (
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-2">Assessment Status</div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          selectedNode.status === 'accepted' 
                            ? 'bg-green-100 text-green-700' 
                            : selectedNode.status === 'withheld'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {selectedNode.status.charAt(0).toUpperCase() + selectedNode.status.slice(1)}
                        </span>
                      </div>
                    )}
                    
                    {/* Entity type badge */}
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        selectedNode.type === 'customer' ? 'bg-blue-100 text-blue-700' :
                        selectedNode.type === 'opportunity' ? 'bg-yellow-100 text-yellow-700' :
                        selectedNode.type === 'contact' ? 'bg-indigo-100 text-indigo-700' :
                        selectedNode.type === 'partner' ? 'bg-purple-100 text-purple-700' :
                        selectedNode.type === 'product' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedNode.type === 'contact' && selectedNode.level ? selectedNode.level.toUpperCase() : 'ENTITY'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Network className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm">Click on any node in the visualization to see details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}