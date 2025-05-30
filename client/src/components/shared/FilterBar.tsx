import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';

interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'text' | 'multiselect';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface FilterBarProps {
  entityType: 'partner' | 'customer' | 'opportunity';
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
}

const filterConfigs: Record<string, FilterConfig[]> = {
  partner: [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' }
      ]
    },
    {
      key: 'industry',
      label: 'Industry',
      type: 'select',
      options: [
        { value: 'all', label: 'All Industries' },
        { value: 'Insurance', label: 'Insurance' },
        { value: 'Technology', label: 'Technology' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Healthcare', label: 'Healthcare' }
      ]
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'all', label: 'All Types' },
        { value: 'broker', label: 'Broker' },
        { value: 'direct', label: 'Direct' },
        { value: 'agent', label: 'Agent' }
      ]
    }
  ],
  customer: [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'prospect', label: 'Prospect' }
      ]
    },
    {
      key: 'industry',
      label: 'Industry',
      type: 'select',
      options: [
        { value: 'all', label: 'All Industries' },
        { value: 'Technology', label: 'Technology' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Healthcare', label: 'Healthcare' },
        { value: 'Manufacturing', label: 'Manufacturing' }
      ]
    }
  ],
  opportunity: [
    {
      key: 'stage',
      label: 'Stage',
      type: 'select',
      options: [
        { value: 'all', label: 'All Stages' },
        { value: 'prospect', label: 'Prospect' },
        { value: 'qualified', label: 'Qualified' },
        { value: 'proposal', label: 'Proposal' },
        { value: 'negotiation', label: 'Negotiation' },
        { value: 'closed-won', label: 'Closed Won' },
        { value: 'closed-lost', label: 'Closed Lost' }
      ]
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { value: 'all', label: 'All Priorities' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
      ]
    }
  ]
};

export function FilterBar({ 
  entityType, 
  filters, 
  onFiltersChange, 
  searchTerm, 
  onSearchChange 
}: FilterBarProps) {
  const config = filterConfigs[entityType] || [];

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters };
    if (value === 'all' || value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    onSearchChange('');
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || searchTerm;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={`Search ${entityType}s...`}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4">
        {config.map((filterConfig) => (
          <div key={filterConfig.key} className="min-w-[200px]">
            <Select
              value={filters[filterConfig.key] || 'all'}
              onValueChange={(value) => handleFilterChange(filterConfig.key, value)}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <SelectValue placeholder={filterConfig.label} />
                </div>
              </SelectTrigger>
              <SelectContent>
                {filterConfig.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}