import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { AdvancedTimeframeFilter } from "@/components/ui/advanced-timeframe-filter";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function MetricsPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMeasureUnit, setSelectedMeasureUnit] = useState('');
  const [selectedTargetRange, setSelectedTargetRange] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [advancedTimeframe, setAdvancedTimeframe] = useState('');
  const [showNoTarget, setShowNoTarget] = useState(false);
  const [groupBy, setGroupBy] = useState('tag');
  const [isCreateOKROpen, setIsCreateOKROpen] = useState(false);
  const [okrTemplates, setOkrTemplates] = useState<any[]>([]);

  // Load OKR templates from localStorage
  useEffect(() => {
    const storedTemplates = localStorage.getItem('okrTemplates');
    if (storedTemplates) {
      try {
        setOkrTemplates(JSON.parse(storedTemplates));
      } catch (error) {
        console.error('Error parsing stored OKR templates:', error);
        setOkrTemplates([]);
      }
    }
  }, []);

  // Save OKR templates to localStorage
  const saveOKRTemplates = (templates: any[]) => {
    localStorage.setItem('okrTemplates', JSON.stringify(templates));
    setOkrTemplates(templates);
    
    // Dispatch a storage event to sync between tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'okrTemplates',
      newValue: JSON.stringify(templates)
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setSelectedMeasureUnit('');
    setSelectedTargetRange('');
    setSelectedTimeframe('');
    setDateRange({ from: undefined, to: undefined });
    setAdvancedTimeframe('');
    setShowNoTarget(false);
  };

  // Filter OKR templates
  const filteredOKRs = okrTemplates.filter(okr => {
    const matchesSearch = !searchTerm || 
      okr.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      okr.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || selectedTags.includes(okr.tag);
    
    const matchesMeasureUnit = !selectedMeasureUnit || okr.unit === selectedMeasureUnit;
    
    return matchesSearch && matchesTags && matchesMeasureUnit;
  });

  // Group OKRs by the selected grouping option
  const groupedOKRs = () => {
    if (groupBy === 'none') return { 'All Templates': filteredOKRs };
    
    return filteredOKRs.reduce((groups, okr) => {
      const key = okr[groupBy] || 'Uncategorized';
      if (!groups[key]) groups[key] = [];
      groups[key].push(okr);
      return groups;
    }, {} as Record<string, any[]>);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">OKR Templates</h1>
      </div>
      
      {/* Search and filter section */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search field */}
          <div className="relative w-60">
            <input
              type="text"
              placeholder="Search OKR templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
          
          {/* Filter buttons */}
          <div className="flex items-center gap-2">
            <Select 
              value={selectedTags.length === 1 ? selectedTags[0] : ""}
              onValueChange={(value) => {
                if (value === "clear") {
                  setSelectedTags([]);
                } else if (value && value !== "all_tags") {
                  setSelectedTags([value]);
                } else {
                  setSelectedTags([]);
                }
              }}
            >
              <SelectTrigger className="w-[140px] bg-white">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_tags">All Tags</SelectItem>
                {Array.from(new Set(okrTemplates.map(okr => okr.tag).filter(tag => tag && tag.trim() !== ""))).sort().map(tag => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
                {selectedTags.length > 0 && (
                  <>
                    <div className="border-t border-gray-200 my-1"></div>
                    <SelectItem value="clear" className="text-gray-600">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M18 6L6 18"></path>
                          <path d="M6 6l12 12"></path>
                        </svg>
                        Clear filter
                      </div>
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            
            <Select value={selectedMeasureUnit} onValueChange={(value) => {
              if (value === "clear") {
                setSelectedMeasureUnit("");
                setSelectedTargetRange("");
              } else {
                setSelectedMeasureUnit(value);
              }
            }}>
              <SelectTrigger className="w-[140px] bg-white">
                <SelectValue placeholder="Measure Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="currency">Currency</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="percent">Percent</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
                {selectedMeasureUnit && (
                  <>
                    <div className="border-t border-gray-200 my-1"></div>
                    <SelectItem value="clear" className="text-gray-600">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M18 6L6 18"></path>
                          <path d="M6 6l12 12"></path>
                        </svg>
                        Clear filter
                      </div>
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Group by dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 whitespace-nowrap">Group by:</span>
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-[120px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tag">Tag</SelectItem>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          {(selectedTags.length > 0 || searchTerm || selectedMeasureUnit) && (
            <div className="flex items-center gap-2">
              <button 
                className="flex items-center rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100"
                onClick={clearFilters}
                style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5F6585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M18 6L6 18"></path>
                  <path d="M6 6l12 12"></path>
                </svg>
                <span className="text-[#5F6585]">Clear filters</span>
              </button>
            </div>
          )}
          
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => setIsCreateOKROpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M5 12h14"/>
              <path d="M12 5v14"/>
            </svg>
            Add OKR Metric
          </Button>
        </div>
      </div>

      {/* OKR Templates Content */}
      <div className="space-y-6">
        {Object.entries(groupedOKRs()).map(([groupName, okrs]) => (
          <div key={groupName}>
            {groupBy !== 'none' && (
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">
                {groupName} ({okrs.length})
              </h2>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {okrs.map((okr) => (
                <Card key={okr.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{okr.title}</CardTitle>
                      {okr.tag && (
                        <Badge variant="secondary" className="ml-2">
                          {okr.tag}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{okr.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Unit:</span>
                        <span className="text-sm font-medium">{okr.unit}</span>
                      </div>
                      {okr.targetValue && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Target:</span>
                          <span className="text-sm font-medium">{okr.targetValue}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ))}
        
        {filteredOKRs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <p className="text-lg">No OKR templates found</p>
              <p className="text-sm">Try adjusting your search criteria or create a new template</p>
            </div>
          </div>
        )}
      </div>

      {/* Create OKR Modal */}
      <Dialog open={isCreateOKROpen} onOpenChange={setIsCreateOKROpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create OKR Template</DialogTitle>
            <DialogDescription>
              Create a new OKR template that can be reused across different projects and partners.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter OKR title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Textarea
                className="w-full"
                placeholder="Enter OKR description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOKROpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsCreateOKROpen(false)}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}