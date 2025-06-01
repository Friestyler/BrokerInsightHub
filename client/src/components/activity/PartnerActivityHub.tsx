import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, MessageSquare, CheckSquare, Paperclip, ChevronDown, ChevronRight, 
  Sparkles, Clock, User, Send, Eye, EyeOff, Check, X, Calendar, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface PartnerActivityHubProps {
  partnerId: number;
  partnerName: string;
}

interface ActivityItem {
  id: number;
  type: 'task' | 'comment' | 'attachment';
  content: string;
  description?: string;
  priority?: string;
  completed?: boolean;
  visible_to_partner: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface NextBestAction {
  id: number;
  action_type: string;
  title: string;
  description: string;
  priority: string;
  confidence: number;
  reasoning: string;
  status: string;
  created_at: string;
}

const activityTypes = [
  { value: 'task', label: 'Task', icon: CheckSquare, color: 'text-green-600' },
  { value: 'comment', label: 'Comment', icon: MessageSquare, color: 'text-blue-600' },
  { value: 'attachment', label: 'Document', icon: Paperclip, color: 'text-purple-600' }
];

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

export default function PartnerActivityHub({ partnerId, partnerName }: PartnerActivityHubProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState<'task' | 'comment' | 'attachment'>('task');
  const [showActivityInput, setShowActivityInput] = useState(false);
  
  // Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [visibleToPartner, setVisibleToPartner] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentEnv = localStorage.getItem('selectedEnvironment') || 'degoudse';

  // Fetch activities
  const { data: activities, isLoading } = useQuery({
    queryKey: [`/api/${currentEnv}/partners/${partnerId}/activities`],
  });

  // Fetch timeline
  const { data: timeline } = useQuery({
    queryKey: [`/api/${currentEnv}/partners/${partnerId}/timeline`],
    enabled: showTimeline
  });

  // Fetch next best actions
  const { data: nextActions } = useQuery({
    queryKey: [`/api/${currentEnv}/partners/${partnerId}/next-actions`],
  });

  // Create activity mutation
  const createActivityMutation = useMutation({
    mutationFn: (activityData: any) => {
      const endpoint = selectedActivityType === 'task' ? 'tasks' : 
                     selectedActivityType === 'comment' ? 'comments' : 'attachments';
      
      return fetch(`/api/${currentEnv}/activity/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...activityData,
          entityType: 'partner',
          entityId: partnerId,
          authorId: 1,
          assignedById: 1
        })
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/partners/${partnerId}/activities`] });
      if (showTimeline) {
        queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/partners/${partnerId}/timeline`] });
      }
      resetForm();
      toast({ title: `${selectedActivityType.charAt(0).toUpperCase() + selectedActivityType.slice(1)} created successfully` });
    }
  });

  // Toggle task completion
  const toggleTaskMutation = useMutation({
    mutationFn: ({ taskId, completed }: { taskId: number, completed: boolean }) =>
      fetch(`/api/${currentEnv}/activity/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed, completedAt: completed ? new Date().toISOString() : null })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/partners/${partnerId}/activities`] });
    }
  });

  // Generate AI actions
  const generateActionsMutation = useMutation({
    mutationFn: () => 
      fetch(`/api/${currentEnv}/partners/${partnerId}/generate-actions`, {
        method: 'POST'
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/partners/${partnerId}/next-actions`] });
      toast({ title: 'AI recommendations generated successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to generate AI recommendations', 
        description: 'Please check your OpenAI API configuration',
        variant: 'destructive' 
      });
    }
  });

  const resetForm = () => {
    setTaskTitle('');
    setCommentContent('');
    setTaskPriority('medium');
    setVisibleToPartner(false);
    setShowActivityInput(false);
  };

  const handleCreateActivity = () => {
    let activityData: any = { visibleToPartner };

    if (selectedActivityType === 'task') {
      if (!taskTitle.trim()) return;
      activityData = { ...activityData, title: taskTitle, priority: taskPriority };
    } else if (selectedActivityType === 'comment') {
      if (!commentContent.trim()) return;
      activityData = { ...activityData, content: commentContent };
    }

    createActivityMutation.mutate(activityData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleCreateActivity();
    }
    if (e.key === 'Escape') {
      resetForm();
    }
  };

  if (isLoading) {
    return (
      <div className="mb-4 border border-gray-200 rounded-xl bg-white shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Activity</span>
          </div>
        </div>
        <div className="p-4 flex items-center justify-center h-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const tasks = (activities as any)?.tasks || [];
  const comments = (activities as any)?.comments || [];
  const attachments = (activities as any)?.attachments || [];
  const actions = (nextActions as any) || [];
  const timelineData = (timeline as any) || [];

  const completedTasks = tasks.filter((t: any) => t.completed).length;
  const pendingTasks = tasks.filter((t: any) => !t.completed).length;
  const totalActivities = tasks.length + comments.length + attachments.length;

  const SelectedIcon = activityTypes.find(type => type.value === selectedActivityType)?.icon || CheckSquare;

  return (
    <div className="mb-4 border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Header - Always visible */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <MessageSquare className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Activity</span>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{pendingTasks} pending</span>
              <span>{totalActivities} total</span>
              {actions.length > 0 && <span>{actions.length} AI suggestions</span>}
            </div>
          </button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTimeline(!showTimeline)}
              className={`text-xs transition-colors ${showTimeline ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'}`}
            >
              <Calendar className="h-3 w-3 mr-1" />
              Timeline
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateActionsMutation.mutate()}
              disabled={generateActionsMutation.isPending}
              className="text-xs text-gray-600 hover:text-purple-600"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {generateActionsMutation.isPending ? 'Generating...' : 'AI Actions'}
            </Button>
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {/* Activity Type Selector - Apple Style */}
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
            {activityTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => {
                    setSelectedActivityType(type.value as any);
                    if (!showActivityInput) setShowActivityInput(true);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedActivityType === type.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className={`h-4 w-4 ${selectedActivityType === type.value ? type.color : 'text-gray-500'}`} />
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* Quick Add Input */}
          {!showActivityInput ? (
            <button
              onClick={() => setShowActivityInput(true)}
              className="flex items-center gap-3 w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Add {selectedActivityType}...</span>
            </button>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <SelectedIcon className={`h-4 w-4 ${activityTypes.find(t => t.value === selectedActivityType)?.color}`} />
                Add {selectedActivityType}
              </div>

              {selectedActivityType === 'task' && (
                <div className="space-y-3">
                  <Input
                    placeholder="Task title..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="border-0 bg-white shadow-sm"
                    autoFocus
                  />
                  <div className="flex items-center gap-3">
                    <Select value={taskPriority} onValueChange={setTaskPriority}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {selectedActivityType === 'comment' && (
                <Textarea
                  placeholder="Add a comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="border-0 bg-white shadow-sm resize-none min-h-[80px]"
                  autoFocus
                />
              )}

              {/* Partner Visibility Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={visibleToPartner}
                    onCheckedChange={setVisibleToPartner}
                    className="scale-75"
                  />
                  <span className="text-xs text-gray-600 flex items-center gap-1">
                    {visibleToPartner ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    Visible to partner
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetForm}
                    className="h-7 px-3 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreateActivity}
                    disabled={
                      createActivityMutation.isPending ||
                      (selectedActivityType === 'task' && !taskTitle.trim()) ||
                      (selectedActivityType === 'comment' && !commentContent.trim())
                    }
                    className="h-7 px-3 text-xs"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                ⌘ + Enter to save, Escape to cancel
              </div>
            </div>
          )}

          {/* Timeline View */}
          {showTimeline && (
            <div className="border rounded-lg p-4 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Activity Timeline</span>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {[...tasks, ...comments, ...attachments]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((item: any, index) => {
                    const isTask = item.title !== undefined;
                    const isComment = item.content !== undefined && !item.filename;
                    const isAttachment = item.filename !== undefined;

                    return (
                      <div key={`${isTask ? 'task' : isComment ? 'comment' : 'attachment'}-${item.id}`} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md">
                        <div className="flex-shrink-0 mt-1">
                          {isTask && (
                            <button
                              onClick={() => toggleTaskMutation.mutate({ taskId: item.id, completed: !item.completed })}
                              className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${
                                item.completed 
                                  ? 'bg-green-500 border-green-500 text-white' 
                                  : 'border-gray-300 hover:border-green-400'
                              }`}
                            >
                              {item.completed && <Check className="h-3 w-3" />}
                            </button>
                          )}
                          {isComment && <MessageSquare className="h-4 w-4 text-blue-500" />}
                          {isAttachment && <Paperclip className="h-4 w-4 text-purple-500" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {isTask ? item.title : isComment ? item.content : item.filename}
                            </span>
                            {item.visible_to_partner && (
                              <Eye className="h-3 w-3 text-blue-500" />
                            )}
                            {isTask && item.priority && (
                              <Badge className={priorityColors[item.priority as keyof typeof priorityColors]}>
                                {item.priority}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* AI Actions - Collapsed */}
          {actions.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 px-3 rounded-lg hover:bg-gray-50 text-sm">
                <ChevronRight className="h-4 w-4" />
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="font-medium">AI Suggestions</span>
                <Badge variant="secondary" className="ml-auto text-xs">{actions.length}</Badge>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 space-y-2 pl-6">
                  {actions.map((action: NextBestAction) => (
                    <div key={action.id} className="border-l-2 border-purple-200 pl-3 py-2 bg-purple-50 rounded-r-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm text-gray-900">{action.title}</h4>
                            <Badge className={priorityColors[action.priority as keyof typeof priorityColors]}>
                              {action.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      )}
    </div>
  );
}