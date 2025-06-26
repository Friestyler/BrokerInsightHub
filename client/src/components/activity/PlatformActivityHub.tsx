import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  CheckSquare,
  MessageSquare,
  User,
  Building2,
  Target,
  Clock,
  Filter,
  Search,
  Star,
  ThumbsUp,
  MessageCircle,
  Pin,
  CheckCircle,
  Calendar as CalendarIcon,
  Users
} from 'lucide-react';

interface ActivityItem {
  id: number;
  activity_type: 'task' | 'comment';
  title?: string;
  content: string;
  priority?: string;
  completed?: boolean;
  visible_to_partner?: boolean;
  entity_type: 'partner' | 'opportunity' | 'customer';
  entity_id: number;
  entity_name?: string;
  assigned_to?: number;
  user_id?: number;
  author_id?: number;
  created_at: string;
  updated_at: string;
  reactions?: any[];
  source_entity_type?: string;
  source_entity_id?: number;
  source_entity_name?: string;
}

interface User {
  id: number;
  name: string;
  email?: string;
  initials?: string;
}

interface FilterState {
  search: string;
  entityType: string;
  priority: string;
  assignee: string;
  status: string;
  dateRange: string;
  mentions: boolean;
  from: string;
  recordNames: string[];
}

const defaultFilters: FilterState = {
  search: '',
  entityType: 'all',
  priority: 'all',
  assignee: 'all',
  status: 'all',
  dateRange: 'all',
  mentions: false,
  from: 'all',
  recordNames: []
};

export default function PlatformActivityHub() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'tasks' | 'comments'>('timeline');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const { environment } = useEnvironment();
  const currentEnv = environment || 'degoudse';
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const timelineRef = useRef<HTMLDivElement>(null);

  // Fetch unified activities from all entities
  const { data: unifiedActivities, isLoading } = useQuery({
    queryKey: ['/api/unified-activities'],
    staleTime: 0,
    gcTime: 0
  });

  // Fetch users for name resolution
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  // Fetch partners for filter options
  const { data: partners } = useQuery({
    queryKey: ['/api/partners'],
  });

  // Fetch opportunities for entity name resolution
  const { data: opportunities } = useQuery({
    queryKey: ['/api/opportunities'],
  });

  // Fetch customers for entity name resolution
  const { data: customers } = useQuery({
    queryKey: ['/api/customers'],
  });

  // Task completion mutation
  const completeTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: number; completed: boolean }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      if (!response.ok) throw new Error('Failed to update task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/unified-activities'] });
      toast({
        title: "Task updated",
        description: "Task completion status has been updated.",
      });
    }
  });

  // Reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async ({ activityId, emoji }: { activityId: number; emoji: string }) => {
      const response = await fetch(`/api/activities/${activityId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji, user_id: 1 })
      });
      if (!response.ok) throw new Error('Failed to add reaction');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/unified-activities'],
        exact: false 
      });
    }
  });

  // Auto-scroll to bottom for timeline
  useEffect(() => {
    if (activeTab === 'timeline' && timelineRef.current && unifiedActivities) {
      timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
    }
  }, [unifiedActivities, activeTab]);

  // Get entity name
  const getEntityName = (activity: ActivityItem): string | null => {
    // Return entity_name if it exists and is not null/undefined
    if (activity.entity_name && activity.entity_name !== 'null' && activity.entity_name !== 'undefined') {
      return activity.entity_name;
    }
    
    // If no entity_type or entity_id, this is a general platform activity
    if (!activity.entity_type || activity.entity_id == null) {
      return null; // Don't show source badge for general activities
    }
    
    switch (activity.entity_type) {
      case 'partner':
        return Array.isArray(partners) ? partners.find((p: any) => p.id === activity.entity_id)?.name || `Partner #${activity.entity_id}` : `Partner #${activity.entity_id}`;
      case 'opportunity':
        return Array.isArray(opportunities) ? opportunities.find((o: any) => o.id === activity.entity_id)?.title || `Opportunity #${activity.entity_id}` : `Opportunity #${activity.entity_id}`;
      case 'customer':
        return Array.isArray(customers) ? customers.find((c: any) => c.id === activity.entity_id)?.name || `Customer #${activity.entity_id}` : `Customer #${activity.entity_id}`;
      default:
        return activity.entity_type ? `${activity.entity_type} #${activity.entity_id}` : null;
    }
  };

  // Get user info
  const getUser = (userId?: number): User | null => {
    if (!userId || !Array.isArray(users)) return null;
    return users.find((u: any) => u.id === userId) || null;
  };

  // Filter activities
  const filterActivities = (activities: ActivityItem[]): ActivityItem[] => {
    if (!Array.isArray(activities)) return [];

    return activities.filter(activity => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesContent = activity.content?.toLowerCase().includes(searchLower);
        const matchesTitle = activity.title?.toLowerCase().includes(searchLower);
        const entityName = getEntityName(activity);
        const matchesEntity = entityName ? entityName.toLowerCase().includes(searchLower) : false;
        if (!matchesContent && !matchesTitle && !matchesEntity) return false;
      }

      // Entity type filter
      if (filters.entityType !== 'all' && activity.entity_type !== filters.entityType) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && activity.priority !== filters.priority) {
        return false;
      }

      // Assignee filter
      if (filters.assignee !== 'all') {
        const assigneeId = parseInt(filters.assignee);
        if (activity.assigned_to !== assigneeId && activity.user_id !== assigneeId) {
          return false;
        }
      }

      // Status filter for tasks
      if (filters.status !== 'all' && activity.activity_type === 'task') {
        if (filters.status === 'completed' && !activity.completed) return false;
        if (filters.status === 'open' && activity.completed) return false;
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const activityDate = new Date(activity.created_at);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filters.dateRange) {
          case 'today':
            if (daysDiff > 0) return false;
            break;
          case 'yesterday':
            if (daysDiff !== 1) return false;
            break;
          case 'last7days':
            if (daysDiff > 7) return false;
            break;
          case 'last30days':
            if (daysDiff > 30) return false;
            break;
          case 'last3months':
            if (daysDiff > 90) return false;
            break;
          case 'last12months':
            if (daysDiff > 365) return false;
            break;
        }
      }

      // Comments-specific filters
      if (activeTab === 'comments') {
        // 'From' filter (who wrote comments)
        if (filters.from !== 'all') {
          const fromId = parseInt(filters.from);
          if (activity.user_id !== fromId && activity.author_id !== fromId) {
            return false;
          }
        }

        // Record names filter
        if (filters.recordNames.length > 0) {
          const entityName = getEntityName(activity);
          if (!entityName || !filters.recordNames.some(name => entityName.toLowerCase().includes(name.toLowerCase()))) {
            return false;
          }
        }
      }

      return true;
    });
  };

  // Sort activities by date (newest first for tasks/comments, oldest first for timeline)
  const sortActivities = (activities: ActivityItem[]): ActivityItem[] => {
    const sorted = [...activities].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return activeTab === 'timeline' ? dateA - dateB : dateB - dateA;
    });
    return sorted;
  };

  // Get filtered and sorted activities
  const getActivitiesForTab = (): ActivityItem[] => {
    if (!Array.isArray(unifiedActivities)) return [];
    
    let activities = [...unifiedActivities];
    
    // Filter by tab type
    switch (activeTab) {
      case 'tasks':
        activities = activities.filter(a => a.activity_type === 'task');
        break;
      case 'comments':
        activities = activities.filter(a => a.activity_type === 'comment');
        break;
      // timeline shows all
    }
    
    return sortActivities(filterActivities(activities));
  };

  const filteredActivities = getActivitiesForTab();

  // Reset filters when tab changes
  useEffect(() => {
    setFilters(defaultFilters);
  }, [activeTab]);

  // Handle task completion
  const handleCompleteTask = (taskId: number, completed: boolean) => {
    completeTaskMutation.mutate({ taskId, completed: !completed });
  };

  // Handle reaction
  const handleReaction = (activityId: number, emoji: string) => {
    addReactionMutation.mutate({ activityId, emoji });
  };

  // Get entity icon
  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'partner':
        return <Building2 className="h-3 w-3" />;
      case 'opportunity':
        return <Target className="h-3 w-3" />;
      case 'customer':
        return <Users className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  // Get entity color
  const getEntityColor = (entityType: string) => {
    switch (entityType) {
      case 'partner':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'opportunity':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'customer':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Render timeline item using existing partner activity hub style
  const renderTimelineItem = (activity: ActivityItem, index: number) => {
    const user = getUser(activity.assigned_to || activity.user_id || activity.author_id);
    const entityName = getEntityName(activity);
    const isTask = activity.activity_type === 'task';
    const isComment = activity.activity_type === 'comment';
    const isCompleted = isTask && activity.completed;

    return (
      <div key={`timeline-${activity.activity_type}-${activity.id}-${index}-${activity.created_at.replace(/[^\w]/g, '')}`} className="flex items-start gap-3 relative group">
        {/* Timeline line */}
        {index < filteredActivities.length - 1 && (
          <div className="absolute left-4 top-10 w-px h-8 bg-gray-200"></div>
        )}
        
        {/* Avatar/Icon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center relative z-10 bg-white border-2 border-gray-200">
          {isTask && (
            <CheckSquare className={`h-4 w-4 ${isCompleted ? 'text-green-600' : 'text-gray-600'}`} />
          )}
          {isComment && (
            <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xs font-medium text-blue-700">
                {user?.initials || user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 relative">
          <div className={`bg-white rounded-lg p-3 border transition-all duration-200 relative ${
            isCompleted 
              ? 'border-green-200 bg-green-50/30' 
              : 'border-gray-200 hover:bg-[#F5F6FA] hover:border-[#E6E7F1]'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-medium ${
                isCompleted ? 'text-gray-500' : 'text-gray-900'
              }`}>
                {user?.name || 'Unknown User'}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(activity.created_at).toLocaleString([], { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              {isCompleted && (
                <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full">
                  Completed
                </span>
              )}
              
              {/* Source badge - only show for activities linked to specific entities */}
              {entityName && (
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border bg-white text-gray-700 border-gray-200`}>
                  {getEntityIcon(activity.entity_type)}
                  <span className="font-medium">{entityName}</span>
                </div>
              )}
            </div>
            
            {/* Task title */}
            {isTask && activity.title && (
              <h4 className={`font-medium text-sm mb-1 ${
                isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
              }`}>
                {activity.title}
              </h4>
            )}
            
            <p className={`text-sm mb-2 ${
              isCompleted 
                ? 'text-gray-500 line-through' 
                : 'text-gray-700'
            }`}>
              {activity.content}
            </p>
            
            {/* Task metadata */}
            {isTask && (
              <div className="flex items-center gap-2 flex-wrap">
                {activity.priority && (
                  <Badge variant="outline" className="text-xs bg-white border-gray-200 text-gray-700">
                    {activity.priority}
                  </Badge>
                )}
                {activity.assigned_to && (
                  <Badge variant="outline" className="text-xs bg-white border-gray-200 text-gray-700">
                    {getUser(activity.assigned_to)?.name || `User ${activity.assigned_to}`}
                  </Badge>
                )}
              </div>
            )}

            {/* Reactions display */}
            {activity.reactions && activity.reactions.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                {activity.reactions.map((reaction: any, idx: number) => (
                  <button
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-[#E6E7F1] rounded-full text-xs hover:bg-gray-200 transition-colors"
                    onClick={() => handleReaction(activity.id, reaction.emoji)}
                  >
                    <span>{reaction.emoji}</span>
                    <span className="text-gray-600">{reaction.count}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Hover toolbar */}
            <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-white shadow-lg rounded-lg border border-gray-200 p-1 z-10">
              {/* Emoji reactions */}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-[#E6E7F1]"
                onClick={() => handleReaction(activity.id, '✅')}
              >
                <span className="text-sm">✅</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-[#E6E7F1]"
                onClick={() => handleReaction(activity.id, '👍')}
              >
                <span className="text-sm">👍</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-[#E6E7F1]"
                onClick={() => handleReaction(activity.id, '⭐')}
              >
                <span className="text-sm">⭐</span>
              </Button>

              {/* Task completion button */}
              {isTask && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-[#E6E7F1]"
                  onClick={() => handleCompleteTask(activity.id, activity.completed || false)}
                  title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                >
                  <CheckSquare className={`h-3 w-3 ${isCompleted ? 'text-green-600' : 'text-gray-600'}`} />
                </Button>
              )}

              {/* Pin button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-[#E6E7F1]"
              >
                <Pin className="h-3 w-3 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render filters
  const renderFilters = () => (
    <div className="sticky top-0 bg-white border-b border-gray-200 p-4 space-y-4 z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <Label htmlFor="search" className="text-sm font-medium text-gray-700">Search</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search activities..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-9 h-8"
            />
          </div>
        </div>

        {/* Entity Type */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Entity Type</Label>
          <Select
            value={filters.entityType}
            onValueChange={(value) => setFilters(prev => ({ ...prev, entityType: value }))}
          >
            <SelectTrigger className="h-8 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All entities</SelectItem>
              <SelectItem value="partner">Partners only</SelectItem>
              <SelectItem value="opportunity">Opportunities only</SelectItem>
              <SelectItem value="customer">Customers only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority (for tasks) */}
        {activeTab === 'tasks' && (
          <div>
            <Label className="text-sm font-medium text-gray-700">Priority</Label>
            <Select
              value={filters.priority}
              onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger className="h-8 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="low">Low priority</SelectItem>
                <SelectItem value="medium">Medium priority</SelectItem>
                <SelectItem value="high">High priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Comments-specific filters */}
        {activeTab === 'comments' ? (
          <>
            {/* From filter (who wrote comments) */}
            <div>
              <Label className="text-sm font-medium text-gray-700">From</Label>
              <Select
                value={filters.from}
                onValueChange={(value) => setFilters(prev => ({ ...prev, from: value }))}
              >
                <SelectTrigger className="h-8 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All authors</SelectItem>
                  {Array.isArray(users) && users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* In filter (record names) */}
            <div>
              <Label className="text-sm font-medium text-gray-700">In</Label>
              <Select
                value={filters.recordNames.length > 0 ? 'selected' : 'all'}
                onValueChange={(value) => {
                  if (value === 'all') {
                    setFilters(prev => ({ ...prev, recordNames: [] }));
                  }
                }}
              >
                <SelectTrigger className="h-8 mt-1">
                  <SelectValue placeholder={
                    filters.recordNames.length > 0 
                      ? `${filters.recordNames.length} selected`
                      : "All records"
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All records</SelectItem>
                  {Array.isArray(unifiedActivities) && 
                    unifiedActivities
                      .map(activity => getEntityName(activity))
                      .filter((name): name is string => name !== null && name !== undefined)
                      .filter((name, index, arr) => arr.indexOf(name) === index)
                      .sort()
                      .map((name, index) => (
                        <SelectItem 
                          key={index} 
                          value={name}
                          onSelect={() => {
                            setFilters(prev => ({
                              ...prev,
                              recordNames: prev.recordNames.includes(name)
                                ? prev.recordNames.filter(n => n !== name)
                                : [...prev.recordNames, name]
                            }));
                          }}
                        >
                          {name}
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          /* Assignee filter for non-comments tabs */
          <div>
            <Label className="text-sm font-medium text-gray-700">Assignee</Label>
            <Select
              value={filters.assignee}
              onValueChange={(value) => setFilters(prev => ({ ...prev, assignee: value }))}
            >
              <SelectTrigger className="h-8 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignees</SelectItem>
                {Array.isArray(users) && users.map((user: any) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Status (for tasks) */}
        {activeTab === 'tasks' && (
          <div>
            <Label className="text-sm font-medium text-gray-700">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="h-8 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tasks</SelectItem>
                <SelectItem value="open">Open tasks</SelectItem>
                <SelectItem value="completed">Completed tasks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Date Range */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Date Range</Label>
          <Select
            value={filters.dateRange}
            onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
          >
            <SelectTrigger className="h-8 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="last3months">Last 3 months</SelectItem>
              <SelectItem value="last12months">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filters indicator */}
      {Object.values(filters).some(value => value !== 'all' && value !== false && value !== '') && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters(defaultFilters)}
            className="h-6 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Card className="border border-[#E6E7F1] bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-[#282A3F]">Platform Activity Hub</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Comprehensive view of all activities across partners, opportunities, and customers
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
          <div className="px-6 border-b border-gray-200">
            <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="timeline" 
                className="flex items-center gap-2 data-[state=active]:bg-[#5567E5] data-[state=active]:text-white rounded-lg m-1 h-8"
              >
                <Calendar className="h-4 w-4" />
                Timeline
                <Badge variant="secondary" className="bg-white text-gray-700 border-0 text-xs">
                  {Array.isArray(unifiedActivities) ? unifiedActivities.length : 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="flex items-center gap-2 data-[state=active]:bg-[#5567E5] data-[state=active]:text-white rounded-lg m-1 h-8"
              >
                <CheckSquare className="h-4 w-4" />
                Tasks
                <Badge variant="secondary" className="bg-white text-gray-700 border-0 text-xs">
                  {Array.isArray(unifiedActivities) ? unifiedActivities.filter((a: any) => a.activity_type === 'task').length : 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="comments" 
                className="flex items-center gap-2 data-[state=active]:bg-[#5567E5] data-[state=active]:text-white rounded-lg m-1 h-8"
              >
                <MessageSquare className="h-4 w-4" />
                Comments
                <Badge variant="secondary" className="bg-white text-gray-700 border-0 text-xs">
                  {Array.isArray(unifiedActivities) ? unifiedActivities.filter((a: any) => a.activity_type === 'comment').length : 0}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="timeline" className="mt-0">
            {renderFilters()}
            <ScrollArea className="h-[600px]" ref={timelineRef}>
              <div className="p-6">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Loading activities...</p>
                  </div>
                ) : filteredActivities.length > 0 ? (
                  <div className="space-y-4">
                    {filteredActivities.map((activity, index) => renderTimelineItem(activity, index))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No activities found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="tasks" className="mt-0">
            {renderFilters()}
            <ScrollArea className="h-[600px]">
              <div className="p-6">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Loading tasks...</p>
                  </div>
                ) : filteredActivities.length > 0 ? (
                  <div className="space-y-4">
                    {filteredActivities.map((activity, index) => renderTimelineItem(activity, index))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No tasks found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="comments" className="mt-0">
            {renderFilters()}
            <ScrollArea className="h-[600px]">
              <div className="p-6">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Loading comments...</p>
                  </div>
                ) : filteredActivities.length > 0 ? (
                  <div className="space-y-4">
                    {filteredActivities.map((activity, index) => renderTimelineItem(activity, index))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No comments found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}