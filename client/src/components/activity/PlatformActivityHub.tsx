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
}

const defaultFilters: FilterState = {
  search: '',
  entityType: 'all',
  priority: 'all',
  assignee: 'all',
  status: 'all',
  dateRange: 'all',
  mentions: false
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
  const getEntityName = (activity: ActivityItem): string => {
    if (activity.entity_name) return activity.entity_name;
    
    switch (activity.entity_type) {
      case 'partner':
        return Array.isArray(partners) ? partners.find((p: any) => p.id === activity.entity_id)?.name || `Partner #${activity.entity_id}` : `Partner #${activity.entity_id}`;
      case 'opportunity':
        return Array.isArray(opportunities) ? opportunities.find((o: any) => o.id === activity.entity_id)?.title || `Opportunity #${activity.entity_id}` : `Opportunity #${activity.entity_id}`;
      case 'customer':
        return Array.isArray(customers) ? customers.find((c: any) => c.id === activity.entity_id)?.name || `Customer #${activity.entity_id}` : `Customer #${activity.entity_id}`;
      default:
        return `${activity.entity_type} #${activity.entity_id}`;
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
        const matchesEntity = getEntityName(activity).toLowerCase().includes(searchLower);
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
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
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

  // Render timeline item
  const renderTimelineItem = (activity: ActivityItem, index: number) => {
    const user = getUser(activity.assigned_to || activity.user_id || activity.author_id);
    const entityName = getEntityName(activity);
    const isCompleted = activity.activity_type === 'task' && activity.completed;

    return (
      <div key={`${activity.activity_type}-${activity.id}`} className="relative group">
        {/* Connecting line */}
        {index < filteredActivities.length - 1 && (
          <div className="absolute left-6 top-12 bottom-0 w-px bg-gray-200" />
        )}
        
        {/* Timeline item */}
        <div className={`flex gap-4 p-4 rounded-lg transition-all duration-200 hover:bg-[#F5F6FA] hover:border-[#E6E7F1] border border-transparent ${isCompleted ? 'bg-green-50 border-green-100' : ''}`}>
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
              <AvatarFallback className="bg-[#5567E5] text-white text-xs font-medium">
                {user?.initials || user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-[#282A3F] text-sm">
                {user?.name || 'Unknown User'}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(activity.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {/* Source indicator */}
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getEntityColor(activity.entity_type)}`}>
                {getEntityIcon(activity.entity_type)}
                <span className="font-medium">{entityName}</span>
              </div>
            </div>

            {/* Task title if it's a task */}
            {activity.activity_type === 'task' && activity.title && (
              <div className={`font-medium text-sm mb-1 ${isCompleted ? 'line-through text-gray-500' : 'text-[#282A3F]'}`}>
                {activity.title}
              </div>
            )}

            {/* Content */}
            <div className={`text-sm leading-relaxed ${isCompleted ? 'line-through text-gray-500' : 'text-gray-700'}`}>
              {activity.content}
            </div>

            {/* Task details */}
            {activity.activity_type === 'task' && (
              <div className="flex items-center gap-3 mt-2">
                {activity.priority && (
                  <Badge 
                    variant={activity.priority === 'high' ? 'destructive' : activity.priority === 'medium' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {activity.priority}
                  </Badge>
                )}
                {isCompleted && (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                    Completed
                  </Badge>
                )}
              </div>
            )}

            {/* Reactions */}
            {activity.reactions && activity.reactions.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                {activity.reactions.map((reaction: any, idx: number) => (
                  <div key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-[#E6E7F1] rounded-full text-xs">
                    <span>{reaction.emoji}</span>
                    <span className="text-gray-600">{reaction.count}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Hover toolbar */}
            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-white shadow-lg rounded-lg border border-gray-200 p-1">
              {/* Reactions */}
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

              {/* Task completion */}
              {activity.activity_type === 'task' && (
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

              {/* Pin */}
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

        {/* Assignee */}
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
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
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
                  <div className="space-y-0">
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
                  <div className="space-y-0">
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
                  <div className="space-y-0">
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