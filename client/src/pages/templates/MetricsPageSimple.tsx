import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function MetricsPage() {
  // State for OKR templates
  const [okrTemplates, setOkrTemplates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMeasureUnit, setSelectedMeasureUnit] = useState('');
  const [selectedTargetRange, setSelectedTargetRange] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('');
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: undefined,
    to: undefined
  });
  const [showNoTarget, setShowNoTarget] = useState(false);
  const [groupBy, setGroupBy] = useState('tag');
  const [isCreateOKROpen, setIsCreateOKROpen] = useState(false);

  // Load OKR templates from localStorage
  useEffect(() => {
    const loadTemplates = () => {
      const storedTemplates = localStorage.getItem('okrTemplates');
      if (storedTemplates) {
        try {
          const templates = JSON.parse(storedTemplates);
          setOkrTemplates(templates);
        } catch (error) {
          console.error('Error parsing stored OKR templates:', error);
          setOkrTemplates([]);
        }
      } else {
        setOkrTemplates([]);
      }
    };

    loadTemplates();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'okrTemplates') {
        loadTemplates();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filter templates
  const filteredTemplates = okrTemplates.filter((template: any) => {
    const matchesSearch = !searchTerm || 
      template.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || selectedTags.includes(template.tag);
    const matchesMeasureUnit = !selectedMeasureUnit || template.unit === selectedMeasureUnit;
    
    return matchesSearch && matchesTags && matchesMeasureUnit;
  });

  // Group templates by tag
  const groupedTemplates = filteredTemplates.reduce((groups: any, template: any) => {
    const key = template.tag || 'Untagged';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(template);
    return groups;
  }, {});

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setSelectedMeasureUnit('');
    setSelectedTargetRange('');
    setSelectedTimeframe('');
    setDateRange({ from: undefined, to: undefined });
    setShowNoTarget(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">OKR Metrics</h1>
      </div>
      
      {/* Search and filter controls */}
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

      {/* OKR Templates Display */}
      <div className="space-y-6">
        {Object.keys(groupedTemplates).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <h3 className="text-lg font-medium mb-2">No OKR templates found</h3>
            <p>Create your first OKR template to get started</p>
          </div>
        ) : (
          Object.entries(groupedTemplates).map(([tag, templates]: [string, any]) => (
            <div key={tag} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                {tag}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template: any) => (
                  <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-gray-900 text-sm">{template.title}</h3>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {template.unit}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Target: {template.targetValue || 'Not set'}</span>
                      <span>{template.tag}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create OKR Modal */}
      <Dialog open={isCreateOKROpen} onOpenChange={setIsCreateOKROpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create OKR Template</DialogTitle>
            <DialogDescription>
              Create a new OKR template for tracking objectives and key results.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                placeholder="Enter OKR title"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Input
                id="description"
                placeholder="Describe this OKR"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOKROpen(false)}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Create OKR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}