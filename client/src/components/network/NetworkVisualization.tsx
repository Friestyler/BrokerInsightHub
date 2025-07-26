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
  Sitemap,
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

// Mock data for network visualization
const mockNetworkData = {
  customers: [
    { id: 'customer-1', name: 'Amazon Customer Services', type: 'primary', color: '#3B82F6', size: 60 },
    { id: 'customer-2', name: 'GlobalTech Holdings', type: 'owner', color: '#EAB308', size: 45 },
    { id: 'customer-3', name: 'TechFlow Solutions', type: 'subsidiary', color: '#8B5CF6', size: 40 }
  ],
  opportunities: [
    { id: 'opp-1', name: 'Cyber Insurance', value: '€125k', status: 'accepted', color: '#10B981', size: 35 },
    { id: 'opp-2', name: 'Fleet Management', value: '€85k', status: 'pending', color: '#EAB308', size: 30 },
    { id: 'opp-3', name: 'Property Coverage', value: '€200k', status: 'withheld', color: '#EF4444', size: 40 }
  ],
  contacts: [
    { id: 'contact-1', name: 'Sarah Johnson', role: 'Executive', department: 'Operations', level: 'executive', color: '#EF4444', size: 25 },
    { id: 'contact-2', name: 'Mike Chen', role: 'VP Technology', department: 'IT', level: 'vp', color: '#8B5CF6', size: 22 },
    { id: 'contact-3', name: 'Lisa Rodriguez', role: 'Director Sales', department: 'Sales', level: 'director', color: '#3B82F6', size: 20 },
    { id: 'contact-4', name: 'Tom Wilson', role: 'HR Manager', department: 'HR', level: 'manager', color: '#10B981', size: 18 },
    { id: 'contact-5', name: 'Anna Brown', role: 'Marketing Specialist', department: 'Marketing', level: 'other', color: '#6B7280', size: 15 }
  ],
  partners: [
    { id: 'partner-1', name: 'Willis B.V', status: 'accepted', color: '#10B981', size: 30 },
    { id: 'partner-2', name: 'Baloise Group', status: 'accepted', color: '#10B981', size: 28 },
    { id: 'partner-3', name: 'Concordia Brussels', status: 'withheld', color: '#EF4444', size: 25 }
  ],
  projects: [
    { id: 'project-1', name: 'Digital Transformation', status: 'active', color: '#3B82F6', size: 25 },
    { id: 'project-2', name: 'Security Upgrade', status: 'planning', color: '#EAB308', size: 22 }
  ],
  products: [
    { id: 'product-1', name: 'Cyber Protection Suite', category: 'insurance', color: '#F97316', size: 20 },
    { id: 'product-2', name: 'Fleet Insurance', category: 'insurance', color: '#F97316', size: 18 }
  ]
};

const relationships = [
  { from: 'customer-1', to: 'contact-1', type: 'employs', color: '#6366F1' },
  { from: 'customer-1', to: 'contact-2', type: 'employs', color: '#6366F1' },
  { from: 'customer-1', to: 'opp-1', type: 'has_opportunity', color: '#10B981' },
  { from: 'contact-1', to: 'contact-2', type: 'manages', color: '#8B5CF6' },
  { from: 'contact-2', to: 'contact-3', type: 'manages', color: '#8B5CF6' },
  { from: 'opp-1', to: 'partner-1', type: 'assigned_to', color: '#3B82F6' },
  { from: 'customer-2', to: 'customer-1', type: 'owns', color: '#F97316' }
];

// Org chart mock data
const orgChartData = [
  {
    id: 'sarah-johnson',
    name: 'Sarah Johnson',
    role: 'Chief Executive Officer',
    department: 'Operations',
    level: 'executive',
    email: 'sarah.johnson@amazon.com',
    phone: '+31 20 123 4567',
    reports: ['mike-chen', 'lisa-rodriguez']
  },
  {
    id: 'mike-chen',
    name: 'Mike Chen',
    role: 'VP Technology',
    department: 'IT',
    level: 'vp',
    email: 'mike.chen@amazon.com',
    phone: '+31 20 123 4568',
    reportsTo: 'sarah-johnson',
    reports: ['tom-wilson']
  },
  {
    id: 'lisa-rodriguez',
    name: 'Lisa Rodriguez',
    role: 'Director Sales',
    department: 'Sales',
    level: 'director',
    email: 'lisa.rodriguez@amazon.com',
    phone: '+31 20 123 4569',
    reportsTo: 'sarah-johnson',
    reports: ['anna-brown']
  },
  {
    id: 'tom-wilson',
    name: 'Tom Wilson',
    role: 'HR Manager',
    department: 'HR',
    level: 'manager',
    email: 'tom.wilson@amazon.com',
    phone: '+31 20 123 4570',
    reportsTo: 'mike-chen'
  },
  {
    id: 'anna-brown',
    name: 'Anna Brown',
    role: 'Marketing Specialist',
    department: 'Marketing',
    level: 'other',
    email: 'anna.brown@amazon.com',
    phone: '+31 20 123 4571',
    reportsTo: 'lisa-rodriguez'
  }
];

export default function NetworkVisualization() {
  const [selectedCustomer, setSelectedCustomer] = useState('Amazon Customer Services');
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

  const filterOptions = [
    { key: 'customers', label: 'Customers', count: 3, icon: Building },
    { key: 'opportunities', label: 'Opportunities', count: 3, icon: Target },
    { key: 'contacts', label: 'Contacts', count: 30, icon: Users },
    { key: 'partners', label: 'Partners', count: 3, icon: UserCheck },
    { key: 'projects', label: 'Projects', count: 8, icon: Folder },
    { key: 'products', label: 'Products', count: 4, icon: Package },
    { key: 'hierarchy', label: 'Hierarchy', count: 1, icon: Sitemap }
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

  const NetworkViewContent = () => (
    <div className="relative h-96 bg-gray-50 rounded-lg border overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" viewBox="0 0 800 400">
        {/* Central customer node */}
        <circle
          cx="400"
          cy="200"
          r="30"
          fill="#3B82F6"
          stroke="#1E40AF"
          strokeWidth="2"
          className="cursor-pointer hover:opacity-80"
          onClick={() => setSelectedNode(mockNetworkData.customers[0])}
        />
        <text x="400" y="205" textAnchor="middle" className="fill-white text-xs font-semibold">
          Amazon
        </text>

        {/* Opportunity nodes */}
        {mockNetworkData.opportunities.map((opp, index) => {
          const angle = (index * 120) * (Math.PI / 180);
          const x = 400 + Math.cos(angle) * 120;
          const y = 200 + Math.sin(angle) * 120;
          
          return (
            <g key={opp.id}>
              <line x1="400" y1="200" x2={x} y2={y} stroke="#10B981" strokeWidth="2" />
              <circle
                cx={x}
                cy={y}
                r="15"
                fill={opp.color}
                className="cursor-pointer hover:opacity-80"
                onClick={() => setSelectedNode(opp)}
              />
              <text x={x} y={y + 25} textAnchor="middle" className="fill-gray-700 text-xs">
                {opp.name}
              </text>
              <text x={x} y={y + 35} textAnchor="middle" className="fill-gray-500 text-xs">
                {opp.value}
              </text>
            </g>
          );
        })}

        {/* Contact nodes */}
        {mockNetworkData.contacts.slice(0, 5).map((contact, index) => {
          const angle = (index * 72 + 36) * (Math.PI / 180);
          const x = 400 + Math.cos(angle) * 80;
          const y = 200 + Math.sin(angle) * 80;
          
          return (
            <g key={contact.id}>
              <line x1="400" y1="200" x2={x} y2={y} stroke="#8B5CF6" strokeWidth="1" />
              <circle
                cx={x}
                cy={y}
                r={contact.size / 2}
                fill={contact.color}
                className="cursor-pointer hover:opacity-80"
                onClick={() => setSelectedNode(contact)}
              />
              <text x={x} y={y + 20} textAnchor="middle" className="fill-gray-700 text-xs">
                {contact.name.split(' ')[0]}
              </text>
            </g>
          );
        })}
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
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Accepted/Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Withheld/Inactive</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Pending</span>
          </div>
        </div>
      </div>
    </div>
  );

  const OrgChartContent = () => {
    const executives = orgChartData.filter(person => person.level === 'executive');
    const vps = orgChartData.filter(person => person.level === 'vp');
    const directors = orgChartData.filter(person => person.level === 'director');
    const managers = orgChartData.filter(person => person.level === 'manager');
    const others = orgChartData.filter(person => person.level === 'other');

    const ContactCard = ({ person }: { person: any }) => (
      <div 
        className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getRoleColor(person.level)}`}
        onClick={() => setSelectedNode(person)}
      >
        <div className="font-semibold text-sm">{person.name}</div>
        <div className="text-xs opacity-90 mt-1">{person.role}</div>
        <Badge className={`mt-2 text-xs ${getDepartmentColor(person.department)}`}>
          {person.department}
        </Badge>
      </div>
    );

    return (
      <div className="space-y-6">
        {/* Executive Level */}
        {executives.length > 0 && (
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-600 mb-3">Executive Level</div>
            <div className="flex justify-center space-x-4">
              {executives.map(person => (
                <ContactCard key={person.id} person={person} />
              ))}
            </div>
          </div>
        )}

        {/* VP Level */}
        {vps.length > 0 && (
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-600 mb-3">VP Level</div>
            <div className="flex justify-center space-x-4">
              {vps.map(person => (
                <ContactCard key={person.id} person={person} />
              ))}
            </div>
          </div>
        )}

        {/* Director Level */}
        {directors.length > 0 && (
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-600 mb-3">Director Level</div>
            <div className="flex justify-center space-x-4">
              {directors.map(person => (
                <ContactCard key={person.id} person={person} />
              ))}
            </div>
          </div>
        )}

        {/* Manager Level */}
        {managers.length > 0 && (
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-600 mb-3">Manager Level</div>
            <div className="flex justify-center space-x-4">
              {managers.map(person => (
                <ContactCard key={person.id} person={person} />
              ))}
            </div>
          </div>
        )}

        {/* Other Roles */}
        {others.length > 0 && (
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-600 mb-3">Other Roles</div>
            <div className="flex justify-center space-x-4">
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
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Amazon Customer Services">Amazon Customer Services</SelectItem>
            <SelectItem value="GlobalTech Holdings">GlobalTech Holdings</SelectItem>
            <SelectItem value="TechFlow Solutions">TechFlow Solutions</SelectItem>
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
                      <Sitemap className="h-4 w-4" />
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