import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Building2, Target, UserCheck, ExternalLink, Search, Filter, Plus } from 'lucide-react';
import { apiRequest, queryClient } from "@/lib/queryClient";
import ContactRelationshipManager from './ContactRelationshipManager';

interface ContactRelationship {
  id: number;
  contact_id: number;
  entity_type: 'opportunity' | 'project' | 'customer' | 'partner' | 'contact' | 'vendor';
  entity_id: number;
  relationship_type: string;
  role?: string;
  is_primary: boolean;
  notes?: string;
  entity_name?: string;
  entity_status?: string;
  created_at: string;
}

interface ContactRelationshipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: number;
  contactName: string;
  envId?: string;
}

const ENTITY_TYPES = [
  { value: 'opportunity', label: 'Opportunities', icon: Target, color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'project', label: 'Projects', icon: Building2, color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'customer', label: 'Customers', icon: Building2, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'partner', label: 'Partners', icon: Users, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'vendor', label: 'Vendors', icon: Building2, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { value: 'contact', label: 'Contacts', icon: UserCheck, color: 'bg-gray-100 text-gray-800 border-gray-200' }
];

const RELATIONSHIP_TYPES: Record<string, string> = {
  'primary': 'Primary Contact',
  'secondary': 'Secondary Contact',
  'associated': 'Associated',
  'reports_to': 'Reports To',
  'collaborates_with': 'Collaborates With',
  'decision_maker': 'Decision Maker',
  'technical_contact': 'Technical Contact',
  'financial_contact': 'Financial Contact'
};

export default function ContactRelationshipsModal({ 
  isOpen, 
  onClose, 
  contactId, 
  contactName, 
  envId = 'degoudse' 
}: ContactRelationshipsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('all');
  const [showAddRelationshipModal, setShowAddRelationshipModal] = useState(false);


  // Fetch relationships
  const { data: relationships = [], isLoading } = useQuery({
    queryKey: [`/api/${envId}/contacts/${contactId}/relationships`],
    queryFn: () => apiRequest('GET', `/api/${envId}/contacts/${contactId}/relationships`) as Promise<ContactRelationship[]>,
    enabled: isOpen && !!contactId,
    staleTime: 5 * 60 * 1000
  });

  const getEntityIcon = (entityType: string) => {
    const entityConfig = ENTITY_TYPES.find(et => et.value === entityType);
    return entityConfig?.icon || Target;
  };

  const getEntityColor = (entityType: string) => {
    const entityConfig = ENTITY_TYPES.find(et => et.value === entityType);
    return entityConfig?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRelationshipLabel = (relationshipType: string) => {
    return RELATIONSHIP_TYPES[relationshipType] || relationshipType;
  };

  // Filter relationships based on search and entity type
  const filteredRelationships = relationships.filter((rel: ContactRelationship) => {
    const matchesSearch = !searchTerm || 
      rel.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rel.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rel.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedEntityType === 'all' || rel.entity_type === selectedEntityType;
    
    return matchesSearch && matchesType;
  });

  // Group relationships by entity type
  const groupedRelationships = filteredRelationships.reduce((acc: Record<string, ContactRelationship[]>, rel: ContactRelationship) => {
    if (!acc[rel.entity_type]) acc[rel.entity_type] = [];
    acc[rel.entity_type].push(rel);
    return acc;
  }, {});

  // Calculate relationship statistics
  const relationshipStats = ENTITY_TYPES.map(entityType => {
    const count = relationships.filter((rel: ContactRelationship) => rel.entity_type === entityType.value).length;
    return { ...entityType, count };
  });

  const totalRelationships = relationships.length;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="pb-4 border-b border-[#E6E7F1] px-6 pt-6 flex-shrink-0">
          <DialogTitle className="flex items-center text-xl">
            <Users className="h-6 w-6 mr-3 text-[#5567E5]" />
            Relationship Network: {contactName}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            View existing connections or search for new entities to connect
          </p>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col px-6">
          {/* Statistics Overview */}
          <div className="grid grid-cols-6 gap-3 p-4 bg-gray-50 rounded-lg mb-6 flex-shrink-0">
            {relationshipStats.map((stat) => {
              const Icon = stat.icon;
              const isSelected = selectedEntityType === stat.value;
              return (
                <div 
                  key={stat.value} 
                  className={`text-center cursor-pointer transition-all duration-200 p-2 rounded-lg hover:bg-white hover:shadow-sm ${
                    isSelected ? 'bg-white shadow-sm ring-2 ring-[#5567E5] ring-opacity-20' : ''
                  }`}
                  onClick={() => setSelectedEntityType(selectedEntityType === stat.value ? 'all' : stat.value)}
                >
                  <div className="flex items-center justify-center mb-2">
                    <div className={`p-2 rounded-lg ${stat.color} ${isSelected ? 'ring-2 ring-[#5567E5] ring-opacity-30' : ''}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{stat.count}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Search and Filter Controls + Add Button */}
          <div className="flex items-center space-x-4 mb-6 flex-shrink-0">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search relationships, roles, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedEntityType}
                onChange={(e) => setSelectedEntityType(e.target.value)}
                className="border border-[#E6E7F1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5567E5] focus:border-transparent"
              >
                <option value="all">All Types</option>
                {ENTITY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <Button 
              onClick={() => setShowAddRelationshipModal(true)}
              className="bg-[#5567E5] hover:bg-[#4556D4] flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Relationship
            </Button>
          </div>



          {/* Relationships Content */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5567E5] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading relationship network...</p>
                </div>
              </div>
            ) : totalRelationships === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Relationships Found</h4>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  This contact hasn't been connected to any opportunities, customers, partners, or other contacts yet.
                </p>
                <Button 
                  onClick={() => setShowAddRelationshipModal(true)}
                  className="bg-[#5567E5] hover:bg-[#4556D4]"
                >
                  Add First Relationship
                </Button>
              </div>
            ) : filteredRelationships.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Matching Relationships</h4>
                <p className="text-gray-600">
                  No relationships found matching your search criteria.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedRelationships).map(([entityType, relationships]) => {
                  const Icon = getEntityIcon(entityType);
                  const entityConfig = ENTITY_TYPES.find(et => et.value === entityType);
                  
                  return (
                    <Card key={entityType} className="border-[#E6E7F1] shadow-sm">
                      <CardHeader className="pb-3 bg-gray-50/50">
                        <CardTitle className="flex items-center text-base">
                          <Icon className="h-5 w-5 mr-2 text-[#5567E5]" />
                          {entityConfig?.label || entityType}
                          <Badge variant="outline" className="ml-2">
                            {relationships.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-4">
                        {relationships.map((relationship) => (
                          <div 
                            key={relationship.id}
                            className="group flex items-center justify-between p-4 bg-white border border-[#E6E7F1] rounded-lg hover:shadow-sm hover:border-[#5567E5]/30 transition-all"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <h5 className="font-semibold text-gray-900 truncate">
                                  {relationship.entity_name || `${entityType} #${relationship.entity_id}`}
                                </h5>
                                <Badge className={`${getEntityColor(entityType)} text-xs`}>
                                  {getRelationshipLabel(relationship.relationship_type)}
                                </Badge>
                                {relationship.is_primary && (
                                  <Badge className="bg-[#5567E5] text-white text-xs">
                                    Primary
                                  </Badge>
                                )}
                                {relationship.entity_status && (
                                  <Badge variant="outline" className="text-xs">
                                    {relationship.entity_status}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="space-y-1">
                                {relationship.role && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Role:</span> {relationship.role}
                                  </p>
                                )}
                                
                                {relationship.notes && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Notes:</span> {relationship.notes}
                                  </p>
                                )}
                                
                                <p className="text-xs text-gray-400">
                                  Connected {new Date(relationship.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ExternalLink className="h-4 w-4 text-[#5567E5]" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#E6E7F1] flex justify-between items-center px-6 pb-6 flex-shrink-0">
          <div className="text-sm text-gray-600">
            {totalRelationships > 0 && (
              <span>
                Showing {filteredRelationships.length} of {totalRelationships} relationships
              </span>
            )}
          </div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>

      {/* Add Relationship Modal */}
      {showAddRelationshipModal && (
        <ContactRelationshipManager 
          contactId={contactId} 
          envId={envId}
          onRelationshipAdded={() => {
            queryClient.invalidateQueries({ queryKey: [`/api/${envId}/contacts/${contactId}/relationships`] });
            setShowAddRelationshipModal(false);
          }}
          onClose={() => setShowAddRelationshipModal(false)}
        />
      )}
    </Dialog>
  );
}