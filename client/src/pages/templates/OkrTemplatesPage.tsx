import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from '@/lib/queryClient';

// Mock data for OKR templates
const mockTemplates = [
  {
    id: 1,
    name: "Focus Partner Plan Template",
    description: "Standard OKR template for setting up partner plans",
    tags: ["Partner", "Financial", "Growth"],
    metrics: [
      {
        id: 1,
        title: "Revenue Goal",
        description: "Revenue target for the partnership",
        unit: "currency",
        targetValue: 1000000,
        hierarchy: "objective",
      },
      {
        id: 2,
        title: "Pipeline New Business",
        description: "Target for pipeline of new business opportunities",
        unit: "currency",
        targetValue: 2000000,
        hierarchy: "objective",
      },
      {
        id: 3,
        title: "Training & Certification",
        description: "Complete required training and certification courses",
        unit: "boolean",
        targetValue: 1,
        hierarchy: "activity",
      },
      {
        id: 4,
        title: "Marketing Development Funds",
        description: "Allocated marketing development funds",
        unit: "currency",
        targetValue: 100000,
        hierarchy: "activity",
      },
    ],
    createdAt: new Date("2025-03-10"),
    updatedAt: new Date("2025-04-15"),
  },
  {
    id: 2,
    name: "Marketing Plan Template",
    description: "Template for creating marketing plans with partners",
    tags: ["Marketing", "Campaign", "Brand"],
    metrics: [
      {
        id: 5,
        title: "Co-branded Campaigns",
        description: "Number of co-branded campaigns to launch",
        unit: "number",
        targetValue: 4,
        hierarchy: "objective",
      },
      {
        id: 6,
        title: "Website Overhaul",
        description: "Complete website redesign project",
        unit: "boolean",
        targetValue: 1,
        hierarchy: "activity",
      },
      {
        id: 7,
        title: "Marketing Content",
        description: "Create marketing content (blog posts, case studies)",
        unit: "number",
        targetValue: 12,
        hierarchy: "activity",
      },
    ],
    createdAt: new Date("2025-02-15"),
    updatedAt: new Date("2025-04-10"),
  },
  {
    id: 3,
    name: "Customer Support Goals",
    description: "Template for customer support objectives",
    tags: ["Support", "Customer", "Service"],
    metrics: [
      {
        id: 8,
        title: "Customer Satisfaction",
        description: "CSAT score target",
        unit: "percentage",
        targetValue: 95,
        hierarchy: "objective",
      },
      {
        id: 9,
        title: "Response Time",
        description: "Average time to first response",
        unit: "number",
        targetValue: 4,
        hierarchy: "objective",
      },
      {
        id: 10,
        title: "Training Hours",
        description: "Support team training hours",
        unit: "number",
        targetValue: 40,
        hierarchy: "activity",
      },
    ],
    createdAt: new Date("2025-01-20"),
    updatedAt: new Date("2025-03-05"),
  },
  {
    id: 4,
    name: "Sales Territory Plan",
    description: "Template for sales territory planning",
    tags: ["Sales", "Territory", "Quota"],
    metrics: [
      {
        id: 11,
        title: "Territory Revenue",
        description: "Revenue target for territory",
        unit: "currency",
        targetValue: 500000,
        hierarchy: "objective",
      },
      {
        id: 12,
        title: "New Accounts",
        description: "Number of new accounts to acquire",
        unit: "number",
        targetValue: 10,
        hierarchy: "objective",
      },
      {
        id: 13,
        title: "Sales Meetings",
        description: "Required number of sales meetings",
        unit: "number",
        targetValue: 50,
        hierarchy: "activity",
      },
    ],
    createdAt: new Date("2025-02-01"),
    updatedAt: new Date("2025-04-01"),
  },
];

// Component for the tag badge with colors based on tag name
const TagBadge = ({ tag }: { tag: string }) => {
  const getTagColor = (tag: string) => {
    const tagMap: Record<string, string> = {
      Partner: "bg-indigo-100 text-indigo-800",
      Financial: "bg-green-100 text-green-800",
      Growth: "bg-emerald-100 text-emerald-800",
      Marketing: "bg-purple-100 text-purple-800",
      Campaign: "bg-fuchsia-100 text-fuchsia-800",
      Brand: "bg-pink-100 text-pink-800",
      Support: "bg-blue-100 text-blue-800",
      Customer: "bg-cyan-100 text-cyan-800",
      Service: "bg-sky-100 text-sky-800",
      Sales: "bg-amber-100 text-amber-800",
      Territory: "bg-orange-100 text-orange-800",
      Quota: "bg-yellow-100 text-yellow-800",
    };
    
    return tagMap[tag] || "bg-gray-100 text-gray-800";
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)} mr-2 mb-2`}>
      {tag}
    </span>
  );
};

// Component for creating a new template form
const NewTemplateForm = ({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (data: any) => void }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const templateData = {
      name,
      description,
      tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag !== ""),
    };
    
    onSubmit(templateData);
    // Reset form
    setName("");
    setDescription("");
    setTags("");
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New OKR Template</DialogTitle>
          <DialogDescription>
            Create a template that can be used to define OKRs for entities such as partners, customers, or opportunities.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                placeholder="Template name"
                className="col-span-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right text-sm font-medium">
                Description
              </label>
              <Input
                id="description"
                placeholder="Briefly describe this template"
                className="col-span-3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="tags" className="text-right text-sm font-medium">
                Tags
              </label>
              <Input
                id="tags"
                placeholder="Enter tags separated by commas"
                className="col-span-3"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Template</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main OKR Templates Page component
export default function OkrTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [templates, setTemplates] = useState(mockTemplates);
  
  // Collect all unique tags across templates
  const allTags = Array.from(
    new Set(templates.flatMap(template => template.tags))
  ).sort();
  
  // Filter templates based on search and tags
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchTerm === "" || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => template.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });
  
  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  // Handle template creation
  const handleCreateTemplate = (templateData: any) => {
    // Implement API call to create template
    // For now, just add to the mock data
    const newTemplate = {
      id: templates.length + 1,
      ...templateData,
      metrics: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setTemplates([...templates, newTemplate]);
  };
  
  // Clear all selected filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">OKR Templates</h1>
        
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Template
        </Button>
      </div>
      
      {/* Search and filter bar */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-grow max-w-xs">
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>
          
          {selectedTags.length > 0 && (
            <Button variant="ghost" onClick={clearFilters} className="h-10">
              Clear filters
            </Button>
          )}
        </div>
        
        {/* Tags filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {allTags.map(tag => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              size="sm"
              className={selectedTags.includes(tag) ? "bg-indigo-600 hover:bg-indigo-700" : ""}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Templates grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="pb-3">
              <div className="mb-3">
                {template.tags.map(tag => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>
              
              <div className="text-sm text-gray-600">
                <div className="mb-1">
                  <span className="font-medium">{template.metrics.length}</span> metrics defined
                </div>
                <div>
                  Last updated: {template.updatedAt.toLocaleDateString()}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between pt-0">
              <Button variant="outline" size="sm">
                Preview
              </Button>
              <Link href={`/templates/okr/${template.id}`}>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  Edit Template
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No templates found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Try adjusting your search or filters, or create a new template.
          </p>
          <Button 
            className="mt-4 bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Create Template
          </Button>
        </div>
      )}
      
      {/* Create template dialog */}
      <NewTemplateForm 
        isOpen={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)} 
        onSubmit={handleCreateTemplate} 
      />
    </div>
  );
}