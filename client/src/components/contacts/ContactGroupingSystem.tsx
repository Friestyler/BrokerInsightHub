// Advanced Contact Grouping System - Senior Engineering Standard
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

interface Tag {
  id: number;
  name: string;
  color: string;
  category: string;
  description?: string;
}

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  job_title?: string;
  department?: string;
  company?: string;
  reports_to?: number;
  tags?: Tag[];
  attributes_count?: number;
}

interface GroupedContacts {
  [key: string]: Contact[];
}

interface ContactGroupingProps {
  contacts: Contact[];
  envId?: string;
  onGroupChange?: (groupBy: string) => void;
  renderContact?: (contact: Contact) => React.ReactNode;
}

export function ContactGroupingSystem({ 
  contacts, 
  envId = 'degoudse', 
  onGroupChange,
  renderContact 
}: ContactGroupingProps) {
  const [groupBy, setGroupBy] = useState<string>('none');

  // Fetch available tags for grouping
  const { data: tags = [] } = useQuery({
    queryKey: [`/api/${envId}/tags`],
    queryFn: () => apiRequest(`/api/${envId}/tags`),
    staleTime: 5 * 60 * 1000
  });

  // Get unique tag categories
  const tagCategories = Array.from(new Set(tags.map((tag: Tag) => tag.category).filter(Boolean)));

  const handleGroupChange = (value: string) => {
    setGroupBy(value);
    onGroupChange?.(value);
  };

  // Group contacts by selected criteria
  const groupContacts = (): GroupedContacts => {
    if (groupBy === 'none') {
      return { 'All Contacts': contacts };
    }

    if (groupBy === 'department') {
      return contacts.reduce((groups: GroupedContacts, contact) => {
        const key = contact.department || 'No Department';
        if (!groups[key]) groups[key] = [];
        groups[key].push(contact);
        return groups;
      }, {});
    }

    if (groupBy === 'company') {
      return contacts.reduce((groups: GroupedContacts, contact) => {
        const key = contact.company || 'No Company';
        if (!groups[key]) groups[key] = [];
        groups[key].push(contact);
        return groups;
      }, {});
    }

    // Tag-based grouping (Role, Department categories)
    if (tagCategories.includes(groupBy)) {
      const categoryTags = tags.filter((tag: Tag) => tag.category === groupBy);
      
      return contacts.reduce((groups: GroupedContacts, contact) => {
        const contactTags = contact.tags || [];
        const matchingTag = contactTags.find((tag: Tag) => 
          categoryTags.some((catTag: Tag) => catTag.id === tag.id)
        );
        
        const key = matchingTag ? matchingTag.name : `No ${groupBy}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(contact);
        return groups;
      }, {});
    }

    return { 'All Contacts': contacts };
  };

  const groupedContacts = groupContacts();

  // Get tag color for group headers
  const getGroupColor = (groupName: string): string => {
    if (tagCategories.includes(groupBy)) {
      const tag = tags.find((t: Tag) => t.name === groupName && t.category === groupBy);
      return tag?.color || '#6B7280';
    }
    return '#6B7280';
  };

  // Filter displayed tags to avoid redundancy
  const getDisplayTags = (contact: Contact): Tag[] => {
    if (!contact.tags) return [];
    
    // If grouping by tag category, hide tags from that category
    if (tagCategories.includes(groupBy)) {
      return contact.tags.filter(tag => tag.category !== groupBy);
    }
    
    return contact.tags;
  };

  // Get attributes count (enrichment)
  const getAttributesCount = (contact: Contact): number => {
    let count = 0;
    if (contact.email) count++;
    if (contact.job_title) count++;
    if (contact.department) count++;
    if (contact.company) count++;
    if (contact.reports_to) count++;
    if (contact.tags && contact.tags.length > 0) count += contact.tags.length;
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Group By Selector */}
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-700">Group by:</span>
        <Select value={groupBy} onValueChange={handleGroupChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="No grouping" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No grouping</SelectItem>
            <SelectItem value="department">Department</SelectItem>
            <SelectItem value="company">Company</SelectItem>
            {tagCategories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grouped Contact Lists */}
      <div className="space-y-8">
        {Object.entries(groupedContacts).map(([groupName, groupContacts]: [string, Contact[]]) => (
          <div key={groupName} className="space-y-4">
            {/* Group Header */}
            {groupBy !== 'none' && (
              <div className="flex items-center space-x-3">
                <div 
                  className="px-3 py-1 rounded-md text-white text-sm font-medium"
                  style={{ backgroundColor: getGroupColor(groupName) }}
                >
                  {groupName}
                </div>
                <span className="text-sm text-gray-500">
                  ({groupContacts.length} contact{groupContacts.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            {/* Contacts Table */}
            <div className="border rounded-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-medium text-xs text-gray-500 uppercase">CONTACT</th>
                      <th className="text-left p-3 font-medium text-xs text-gray-500 uppercase">TITLE</th>
                      <th className="text-left p-3 font-medium text-xs text-gray-500 uppercase">REPORTS TO</th>
                      <th className="text-left p-3 font-medium text-xs text-gray-500 uppercase">ATTRIBUTES</th>
                      <th className="text-left p-3 font-medium text-xs text-gray-500 uppercase">ENTITIES</th>
                      <th className="text-left p-3 font-medium text-xs text-gray-500 uppercase">NETWORK</th>
                      <th className="text-left p-3 font-medium text-xs text-gray-500 uppercase">ENRICHMENT</th>
                      <th className="text-left p-3 font-medium text-xs text-gray-500 uppercase">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupContacts.map((contact: Contact) => {
                      if (renderContact) {
                        return <tr key={contact.id}>{renderContact(contact)}</tr>;
                      }
                      
                      return (
                        <tr key={contact.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 text-sm font-medium">
                                  {contact.first_name?.[0]}{contact.last_name?.[0]}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{contact.full_name}</div>
                                {contact.email && (
                                  <div className="text-sm text-gray-500">{contact.email}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              {contact.job_title && (
                                <Badge variant="secondary" className="text-xs">
                                  {contact.job_title}
                                </Badge>
                              )}
                              {getDisplayTags(contact).map(tag => (
                                <Badge 
                                  key={tag.id} 
                                  variant="secondary"
                                  style={{ backgroundColor: tag.color, color: 'white' }}
                                  className="text-xs"
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {contact.reports_to ? (
                              <span>Supervisor ID: {contact.reports_to}</span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-600 font-medium">
                                {getAttributesCount(contact)} attributes
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-center">
                              <div className="text-sm font-medium">2</div>
                              <div className="text-xs text-gray-500">entities</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-center">
                              <div className="text-sm font-medium">1</div>
                              <div className="text-xs text-gray-500">contact</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-1">
                              <span className="text-blue-600 font-medium">
                                {getAttributesCount(contact)}
                              </span>
                              <span className="text-sm text-gray-500">attributes</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <button className="text-gray-400 hover:text-gray-600">
                              <span className="text-lg">•••</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContactGroupingSystem;