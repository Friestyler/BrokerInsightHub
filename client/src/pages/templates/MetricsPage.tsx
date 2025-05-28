import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Search, Plus, Target, TrendingUp, Users, DollarSign, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

// Category color mapping
const categoryColors = {
  "Financial": "#10B981",
  "Revenue": "#059669", 
  "Partner": "#3B82F6",
  "Pipeline": "#2563EB",
  "Sales": "#DC2626",
  "Training": "#7C3AED",
  "Certification": "#9333EA",
  "People": "#F59E0B",
  "Marketing": "#EF4444",
  "Budget": "#84CC16",
  "Digital": "#06B6D4",
  "Operations": "#8B5CF6",
  "Growth": "#F97316",
  "Customer Success": "#14B8A6",
  "Product Development": "#6366F1",
  "Innovation": "#EC4899",
  "Quality": "#22C55E",
  "Compliance": "#A855F7",
  "Risk Management": "#F59E0B",
  "Technology": "#3B82F6",
  "Market Expansion": "#EF4444"
};

// Mock OKR data
const mockOkrTemplates = [
  {
    id: 1,
    title: "Increase Annual Revenue",
    description: "Drive revenue growth through new client acquisition and expansion of existing accounts",
    category: "Financial",
    difficulty: "Medium",
    timeframe: "Quarterly",
    tags: ["Revenue", "Growth", "Sales"],
    keyResults: [
      { id: 1, title: "Acquire 50 new enterprise clients", target: 50, current: 12 },
      { id: 2, title: "Increase average deal size by 25%", target: 25, current: 8 },
      { id: 3, title: "Achieve 95% client retention rate", target: 95, current: 88 }
    ],
    owner: "Sales Team",
    progress: 34,
    dueDate: "2024-03-31"
  },
  {
    id: 2,
    title: "Expand Partner Network",
    description: "Build strategic partnerships to increase market reach and service capabilities",
    category: "Partner",
    difficulty: "High",
    timeframe: "Annual",
    tags: ["Partnership", "Growth", "Network"],
    keyResults: [
      { id: 4, title: "Sign 10 new strategic partners", target: 10, current: 4 },
      { id: 5, title: "Generate 30% revenue from partnerships", target: 30, current: 18 },
      { id: 6, title: "Launch 3 co-branded products", target: 3, current: 1 }
    ],
    owner: "Partnership Team",
    progress: 45,
    dueDate: "2024-12-31"
  },
  {
    id: 3,
    title: "Improve Team Productivity",
    description: "Enhance operational efficiency and team performance through training and tools",
    category: "People",
    difficulty: "Medium",
    timeframe: "Quarterly",
    tags: ["Productivity", "Training", "Efficiency"],
    keyResults: [
      { id: 7, title: "Complete leadership training for 100% of managers", target: 100, current: 65 },
      { id: 8, title: "Reduce project delivery time by 20%", target: 20, current: 12 },
      { id: 9, title: "Achieve 90% employee satisfaction score", target: 90, current: 84 }
    ],
    owner: "HR Team",
    progress: 67,
    dueDate: "2024-06-30"
  },
  {
    id: 4,
    title: "Digital Transformation Initiative",
    description: "Modernize technology stack and digitize core business processes",
    category: "Digital",
    difficulty: "High",
    timeframe: "Annual",
    tags: ["Technology", "Innovation", "Efficiency"],
    keyResults: [
      { id: 10, title: "Migrate 80% of systems to cloud", target: 80, current: 35 },
      { id: 11, title: "Implement AI-powered analytics", target: 1, current: 0 },
      { id: 12, title: "Reduce manual processes by 50%", target: 50, current: 22 }
    ],
    owner: "IT Team",
    progress: 28,
    dueDate: "2024-12-31"
  },
  {
    id: 5,
    title: "Customer Success Excellence",
    description: "Enhance customer experience and build long-term relationships",
    category: "Customer Success",
    difficulty: "Medium",
    timeframe: "Quarterly",
    tags: ["Customer", "Satisfaction", "Retention"],
    keyResults: [
      { id: 13, title: "Achieve NPS score of 70+", target: 70, current: 58 },
      { id: 14, title: "Reduce churn rate to under 5%", target: 5, current: 8 },
      { id: 15, title: "Implement proactive support for top 100 clients", target: 100, current: 67 }
    ],
    owner: "Customer Success Team",
    progress: 72,
    dueDate: "2024-09-30"
  },
  {
    id: 6,
    title: "Market Expansion Strategy",
    description: "Enter new geographical markets and expand service offerings",
    category: "Market Expansion",
    difficulty: "High",
    timeframe: "Annual",
    tags: ["Expansion", "Growth", "International"],
    keyResults: [
      { id: 16, title: "Launch in 3 new countries", target: 3, current: 1 },
      { id: 17, title: "Establish local partnerships in each market", target: 3, current: 1 },
      { id: 18, title: "Achieve 15% international revenue", target: 15, current: 6 }
    ],
    owner: "Business Development",
    progress: 41,
    dueDate: "2024-12-31"
  }
];

export default function MetricsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedOkrs, setSelectedOkrs] = useState<Set<number>>(new Set());

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    mockOkrTemplates.forEach(okr => {
      okr.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, []);

  // Filter OKRs based on search and filters
  const filteredOkrs = useMemo(() => {
    return mockOkrTemplates.filter(okr => {
      // Search filter
      if (searchTerm && !okr.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !okr.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "all" && okr.category !== selectedCategory) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== "all" && okr.difficulty !== selectedDifficulty) {
        return false;
      }

      // Timeframe filter
      if (selectedTimeframe !== "all" && okr.timeframe !== selectedTimeframe) {
        return false;
      }

      // Tags filter
      if (selectedTags.length > 0 && !selectedTags.some(tag => okr.tags.includes(tag))) {
        return false;
      }

      return true;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedTimeframe, selectedTags]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedDifficulty("all");
    setSelectedTimeframe("all");
    setSelectedTags([]);
    setDateRange(undefined);
  };

  const toggleOkrSelection = (okrId: number) => {
    const newSelected = new Set(selectedOkrs);
    if (newSelected.has(okrId)) {
      newSelected.delete(okrId);
    } else {
      newSelected.add(okrId);
    }
    setSelectedOkrs(newSelected);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-yellow-500";
    if (progress >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getProgressIcon = (category: string) => {
    switch (category) {
      case "Financial":
      case "Revenue":
      case "Budget":
        return <DollarSign className="h-4 w-4" />;
      case "Partner":
      case "People":
      case "Customer Success":
        return <Users className="h-4 w-4" />;
      case "Sales":
      case "Marketing":
      case "Growth":
      case "Market Expansion":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OKR Templates</h1>
          <p className="text-gray-600 mt-1">Manage your Objectives and Key Results templates</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Import Template
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Create OKR Template
          </Button>
        </div>
      </div>

      {/* Search and filter section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search field */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search OKR templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Category filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.keys(categoryColors).map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Difficulty filter */}
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>

          {/* Timeframe filter */}
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Timeframes</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
              <SelectItem value="Quarterly">Quarterly</SelectItem>
              <SelectItem value="Annual">Annual</SelectItem>
            </SelectContent>
          </Select>

          {/* Date range picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* Clear filters button */}
          {(searchTerm || selectedCategory !== "all" || selectedDifficulty !== "all" || 
            selectedTimeframe !== "all" || selectedTags.length > 0 || dateRange) && (
            <Button variant="ghost" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>

        {/* Tags section */}
        <div className="mt-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Filter by tags:</div>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    setSelectedTags(selectedTags.filter(t => t !== tag));
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Selection action bar */}
      {selectedOkrs.size > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-6 flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium">{selectedOkrs.size}</span> OKR templates selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedOkrs(new Set())}>
              Clear Selection
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" size="sm">
              Create Template Set
            </Button>
          </div>
        </div>
      )}

      {/* OKR Templates Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedOkrs.size === filteredOkrs.length && filteredOkrs.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedOkrs(new Set(filteredOkrs.map(okr => okr.id)));
                    } else {
                      setSelectedOkrs(new Set());
                    }
                  }}
                />
              </TableHead>
              <TableHead>OKR Template</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Key Results</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Timeframe</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOkrs.map(okr => (
              <TableRow 
                key={okr.id}
                className={cn(
                  "cursor-pointer hover:bg-gray-50",
                  selectedOkrs.has(okr.id) && "bg-indigo-50"
                )}
                onClick={() => toggleOkrSelection(okr.id)}
              >
                <TableCell>
                  <Checkbox 
                    checked={selectedOkrs.has(okr.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedOkrs(new Set([...selectedOkrs, okr.id]));
                      } else {
                        const newSelected = new Set(selectedOkrs);
                        newSelected.delete(okr.id);
                        setSelectedOkrs(newSelected);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900">{okr.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-2">{okr.description}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: categoryColors[okr.category as keyof typeof categoryColors] || "#6B7280" }}
                    />
                    <span className="text-sm">{okr.category}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">{okr.progress}%</span>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn("h-2 rounded-full transition-all duration-300", getProgressColor(okr.progress))}
                        style={{ width: `${okr.progress}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {okr.keyResults.slice(0, 2).map(kr => (
                      <div key={kr.id} className="text-xs text-gray-600 flex justify-between">
                        <span className="truncate max-w-[150px]">{kr.title}</span>
                        <span className="text-gray-500 ml-2">{kr.current}/{kr.target}</span>
                      </div>
                    ))}
                    {okr.keyResults.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{okr.keyResults.length - 2} more...
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={okr.difficulty === "High" ? "destructive" : okr.difficulty === "Medium" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {okr.difficulty}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{okr.timeframe}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">{okr.owner}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {okr.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {okr.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{okr.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Empty state */}
      {filteredOkrs.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No OKR templates found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== "all" || selectedDifficulty !== "all" || 
             selectedTimeframe !== "all" || selectedTags.length > 0
              ? "Try adjusting your filters to see more results"
              : "Create your first OKR template to get started"
            }
          </p>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Create OKR Template
          </Button>
        </div>
      )}
    </div>
  );
}