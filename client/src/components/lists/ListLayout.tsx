import { ReactNode, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ListLayoutProps {
  title: string;
  description: string;
  entityName: string;
  createPath: string;
  children: ReactNode;
  filterOptions?: { label: string; value: string }[];
  sortOptions?: { label: string; value: string }[];
  viewOptions?: { label: string; value: string; icon?: ReactNode }[];
}

export default function ListLayout({
  title,
  description,
  entityName,
  createPath,
  children,
  filterOptions = [],
  sortOptions = [],
  viewOptions = []
}: ListLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recent');
  const [viewType, setViewType] = useState('table');
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            asChild
          >
            <Link href={createPath}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New {entityName}
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Search and Filters Row */}
      <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-2 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <Input
            className="pl-10 bg-white"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {filterOptions.length > 0 && (
          <div className="w-full lg:w-48">
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {filterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {sortOptions.length > 0 && (
          <div className="w-full lg:w-48">
            <Select value={selectedSort} onValueChange={setSelectedSort}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {viewOptions.length > 0 && (
          <div className="w-full lg:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white w-full lg:w-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <rect width="7" height="7" x="3" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="14" rx="1" />
                    <rect width="7" height="7" x="3" y="14" rx="1" />
                  </svg>
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {viewOptions.map((option) => (
                  <DropdownMenuItem 
                    key={option.value} 
                    onClick={() => setViewType(option.value)}
                    className={`flex items-center ${viewType === option.value ? 'bg-indigo-50 text-indigo-600' : ''}`}
                  >
                    {option.icon && <span className="mr-2">{option.icon}</span>}
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      
      {/* Content */}
      {children}
    </div>
  );
}