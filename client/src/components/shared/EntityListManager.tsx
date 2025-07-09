import { useState, useEffect } from 'react';
import { SavedListsManager } from './SavedListsManager';
import { SavedViewsManager } from './SavedViewsManager';
import { FilterBar } from './FilterBar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EntityListManagerProps {
  entityType: 'partner' | 'customer' | 'opportunity';
  data: any[];
  columns: Array<{
    key: string;
    label: string;
    render?: (item: any) => React.ReactNode;
  }>;
  onItemClick?: (item: any) => void;
  actions?: Array<{
    label: string;
    onClick: (item: any) => void;
  }>;
  isLoading?: boolean;
}

export function EntityListManager({
  entityType,
  data,
  columns,
  onItemClick,
  actions = [],
  isLoading = false
}: EntityListManagerProps) {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedView, setSelectedView] = useState<any>(null);
  const [filteredData, setFilteredData] = useState(data);

  // Filter data based on search term, filters, and selected view
  useEffect(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        Object.values(item).some(value => 
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply custom filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(item => item[key] === value);
      }
    });

    // Apply view filters if a view is selected
    if (selectedView?.filters) {
      Object.entries(selectedView.filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          filtered = filtered.filter(item => item[key] === value);
        }
      });
    }

    setFilteredData(filtered);
  }, [data, searchTerm, filters, selectedView]);

  // Handle list selection
  const handleListSelect = (list: any) => {
    if (list && list.members) {
      // Filter data to show only items in the selected list
      const listData = data.filter(item => list.members.includes(item.id));
      setFilteredData(listData);
      setSelectedItems([]);
    } else {
      // Reset to all data
      setFilteredData(data);
    }
  };

  // Handle view selection
  const handleViewSelect = (view: any) => {
    setSelectedView(view);
    if (view?.filters) {
      setFilters(view.filters);
    } else {
      setFilters({});
    }
  };

  // Handle item selection
  const handleItemSelect = (itemId: number, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const isAllSelected = filteredData.length > 0 && selectedItems.length === filteredData.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < filteredData.length;

  return (
    <div className="space-y-6">
      {/* Header with Lists and Segment Views */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            {entityType.charAt(0).toUpperCase() + entityType.slice(1)}s
          </h2>
        </div>
      </div>

      {/* Lists and Segment Views Management */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SavedListsManager
            entityType={entityType}
            selectedItems={selectedItems}
            onListSelect={handleListSelect}
            currentFilters={filters}
          />
          <SavedViewsManager
            entityType={entityType}
            currentFilters={filters}
            onViewSelect={handleViewSelect}
            selectedView={selectedView}
          />
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        entityType={entityType}
        filters={filters}
        onFiltersChange={setFilters}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Data Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              {columns.map(column => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              {actions.length > 0 && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} className="text-center py-8">
                  No {entityType}s found
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map(item => (
                <TableRow 
                  key={item.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onItemClick?.(item)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) => handleItemSelect(item.id, checked as boolean)}
                    />
                  </TableCell>
                  {columns.map(column => (
                    <TableCell key={column.key}>
                      {column.render ? column.render(item) : item[column.key]}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action, index) => (
                            <DropdownMenuItem 
                              key={index}
                              onClick={() => action.onClick(item)}
                            >
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredData.length} of {data.length} {entityType}s
        {selectedItems.length > 0 && ` • ${selectedItems.length} selected`}
      </div>
    </div>
  );
}