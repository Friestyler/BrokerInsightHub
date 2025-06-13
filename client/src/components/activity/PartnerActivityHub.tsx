import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, MessageSquare, CheckSquare, Paperclip, ChevronDown, ChevronRight, 
  Sparkles, Clock, User, Send, Eye, EyeOff, Check, X, Calendar, Filter, Brain, UserPlus, Bot, Target
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
  { value: 'timeline', label: 'Timeline', icon: Calendar, color: 'text-gray-600' },
  { value: 'task', label: 'Tasks', icon: CheckSquare, color: 'text-green-600' },
  { value: 'comment', label: 'Comments', icon: MessageSquare, color: 'text-blue-600' },
  { value: 'attachment', label: 'Documents', icon: Paperclip, color: 'text-purple-600' },
  { value: 'actions', label: 'Next Best Actions', icon: Sparkles, color: 'text-purple-600' }
];

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

export default function PartnerActivityHub({ partnerId, partnerName }: PartnerActivityHubProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedActivityType, setSelectedActivityType] = useState<'task' | 'comment' | 'attachment' | 'timeline' | 'actions'>('timeline');
  const [highlightActions, setHighlightActions] = useState(false);
  const [showActivityInput, setShowActivityInput] = useState(false);
  
  // Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [visibleToPartner, setVisibleToPartner] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentEnv = localStorage.getItem('selectedEnvironment') || 'degoudse';

  // Available team members for assignment
  const teamMembers = [
    { id: 'john-doe', name: 'John Doe', role: 'Account Manager' },
    { id: 'sarah-johnson', name: 'Sarah Johnson', role: 'Senior Analyst' },
    { id: 'mike-chen', name: 'Mike Chen', role: 'Business Developer' },
    { id: 'emma-wilson', name: 'Emma Wilson', role: 'Partnership Lead' },
    { id: 'alex-rodriguez', name: 'Alex Rodriguez', role: 'Strategy Consultant' }
  ];

  // Fetch activities
  const { data: activities, isLoading } = useQuery({
    queryKey: [`/api/${currentEnv}/partners/${partnerId}/activities`],
  });

  // Fetch timeline
  const { data: timeline } = useQuery({
    queryKey: [`/api/${currentEnv}/partners/${partnerId}/timeline`]
  });

  // Fetch next best actions
  const { data: nextActions } = useQuery({
    queryKey: [`/api/${currentEnv}/partners/${partnerId}/next-actions`],
    enabled: selectedActivityType === 'actions'
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
      queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/partners/${partnerId}/timeline`] });
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
      queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/partners/${partnerId}/timeline`] });
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
      // Auto-expand and switch to actions tab
      setIsCollapsed(false);
      setSelectedActivityType('actions');
      setHighlightActions(true);
      // Remove highlight after 3 seconds
      setTimeout(() => setHighlightActions(false), 3000);
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

  // Convert AI recommendation to task
  const convertToTaskMutation = useMutation({
    mutationFn: ({ actionId, assignedTo }: { actionId: number, assignedTo: string }) =>
      fetch(`/api/${currentEnv}/partners/${partnerId}/convert-action-to-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId, assignedTo })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/partners/${partnerId}/activities`] });
      queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/partners/${partnerId}/next-actions`] });
      toast({ title: 'AI recommendation converted to task successfully' });
    }
  });

  const resetForm = () => {
    setTaskTitle('');
    setCommentContent('');
    setTaskPriority('medium');
    setVisibleToPartner(false);
    setAssignedTo('');
    setShowActivityInput(false);
  };

  const handleCreateActivity = () => {
    let activityData: any = { visibleToPartner };

    if (selectedActivityType === 'task') {
      if (!taskTitle.trim()) return;
      activityData = { ...activityData, title: taskTitle, priority: taskPriority, assignedTo };
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
  const rawTimelineData = (timeline as any) || [];
  
  // Merge tasks with timeline data
  const timelineData = [
    ...rawTimelineData,
    ...tasks.map((task: any) => ({
      ...task,
      activity_type: 'task',
      title: task.title,
      content: task.title,
      description: task.description || '',
      priority: task.priority,
      completed: task.completed,
      visible_to_partner: task.visible_to_partner,
      assigned_to_name: task.assignedTo ? teamMembers.find(m => m.id === task.assignedTo)?.name || task.assignedTo : null,
      author_name: 'System' // or get from actual user data
    })),
    ...comments.map((comment: any) => ({
      ...comment,
      activity_type: 'comment',
      title: 'Comment',
      content: comment.content,
      visible_to_partner: comment.visible_to_partner,
      author_name: comment.author_name || 'User'
    })),
    ...attachments.map((attachment: any) => ({
      ...attachment,
      activity_type: 'attachment',
      title: 'Document',
      content: attachment.filename || 'File attachment',
      visible_to_partner: attachment.visible_to_partner,
      author_name: attachment.author_name || 'User'
    }))
  ];

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
              onClick={() => generateActionsMutation.mutate()}
              disabled={generateActionsMutation.isPending}
              className="text-xs text-gray-600 hover:text-purple-600"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {generateActionsMutation.isPending ? 'Generating...' : 'Generate Next Best Action'}
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
                    if (type.value === 'task' || type.value === 'comment') {
                      if (!showActivityInput) setShowActivityInput(true);
                    } else {
                      setShowActivityInput(false);
                    }
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

          {/* Activity Content Based on Selected Type */}
          {/* Tasks */}
          {selectedActivityType === 'task' && (
            <>
              {!showActivityInput ? (
                <button
                  onClick={() => setShowActivityInput(true)}
                  className="flex items-center gap-3 w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Add task...</span>
                </button>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <CheckSquare className="h-4 w-4 text-green-600" />
                    Add Task
                  </div>
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
                    <Select value={assignedTo} onValueChange={setAssignedTo}>
                      <SelectTrigger className="w-40 h-8 text-xs">
                        <SelectValue placeholder="Assign to..." />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              {member.name}
                            </div>
                          </SelectItem>
                        ))}
                        <SelectItem value="ai-agent" disabled>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Bot className="h-3 w-3" />
                            AI Agent (coming later)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                      <Button variant="ghost" size="sm" onClick={resetForm} className="h-7 px-3 text-xs">
                        <X className="h-3 w-3 mr-1" />Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleCreateActivity}
                        disabled={createActivityMutation.isPending || !taskTitle.trim()}
                        className="h-7 px-3 text-xs"
                      >
                        <Send className="h-3 w-3 mr-1" />Add
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Task List */}
              <div className="space-y-2">
                {tasks
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map((task: any) => (
                  <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                    <button
                      onClick={() => toggleTaskMutation.mutate({ taskId: task.id, completed: !task.completed })}
                      className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${
                        task.completed 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {task.completed && <Check className="h-3 w-3" />}
                    </button>
                    <div className="flex-1">
                      <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        {task.priority && (
                          <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                            {task.priority}
                          </Badge>
                        )}
                        {task.assignedTo && (
                          <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                            <User className="h-3 w-3" />
                            <span>{teamMembers.find(m => m.id === task.assignedTo)?.name || task.assignedTo}</span>
                          </div>
                        )}
                        {task.visible_to_partner && <Eye className="h-3 w-3 text-blue-500" />}
                        <span className="text-xs text-gray-500">
                          {new Date(task.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Comments */}
          {selectedActivityType === 'comment' && (
            <div className="space-y-4">
              {/* Comments Timeline */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comments
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map((comment: any, index: number) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      comment.is_okr_comment ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      <span className={`text-xs font-medium ${
                        comment.is_okr_comment ? 'text-purple-600' : 'text-blue-600'
                      }`}>
                        {comment.author_name ? comment.author_name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`rounded-lg px-3 py-2 ${
                        comment.is_okr_comment ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
                      }`}>
                        {comment.is_okr_comment && comment.okr_metric_name && (
                          <div className="flex items-center gap-1 mb-1">
                            <Target className="h-3 w-3 text-purple-600" />
                            <span className="text-xs font-medium text-purple-700">
                              OKR: {comment.okr_metric_name}
                            </span>
                          </div>
                        )}
                        <p className="text-sm text-gray-900">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {comment.assigned_to_name && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">•</span>
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{comment.assigned_to_name}</span>
                          </div>
                        )}
                        {comment.visible_to_partner && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">•</span>
                            <Eye className="h-3 w-3 text-blue-500" />
                            <span className="text-xs text-blue-600">visible</span>
                          </div>
                        )}
                        {comment.is_okr_comment && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">•</span>
                            <Target className="h-3 w-3 text-purple-500" />
                            <span className="text-xs text-purple-600">OKR comment</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No comments yet</p>
                    <p className="text-xs text-gray-400 mt-1">Start a conversation</p>
                  </div>
                )}
              </div>

              {/* Quick Comment Input - Chat Style */}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-green-600">Y</span>
                  </div>
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a comment and press Enter..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (commentContent.trim()) {
                            handleCreateActivity();
                          }
                        }
                      }}
                      className="pr-12 border-gray-200 rounded-full bg-gray-50 focus:bg-white transition-colors"
                    />
                    <Button
                      size="sm"
                      onClick={handleCreateActivity}
                      disabled={createActivityMutation.isPending || !commentContent.trim()}
                      className="absolute right-1 top-1 h-7 w-7 p-0 rounded-full"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 ml-11">
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
              </div>
            </div>
          )}

          {/* Documents */}
          {selectedActivityType === 'attachment' && (
            <div className="space-y-3">
              <div className="text-center py-8 text-gray-500">
                <Paperclip className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Document upload coming soon</p>
              </div>
            </div>
          )}

          {/* Timeline View */}
          {selectedActivityType === 'timeline' && (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {timelineData && timelineData.length > 0 ? (
                timelineData
                  .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((item: any, index: number) => {
                    const isTask = item.activity_type === 'task';
                    const isComment = item.activity_type === 'comment';
                    const isAttachment = item.activity_type === 'attachment';

                    return (
                      <div key={`timeline-${item.id}-${item.created_at}`} className="flex items-start gap-3 relative">
                        {/* Timeline line */}
                        {index < timelineData.length - 1 && (
                          <div className="absolute left-4 top-10 w-px h-8 bg-gray-200"></div>
                        )}
                        
                        {/* Avatar/Icon */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center relative z-10 bg-white border-2 border-gray-200">
                          {isTask && (
                            <CheckSquare className="h-4 w-4 text-green-600" />
                          )}
                          {isComment && (
                            <MessageSquare className="h-4 w-4 text-blue-600" />
                          )}
                          {isAttachment && (
                            <Paperclip className="h-4 w-4 text-purple-600" />
                          )}
                          {!isTask && !isComment && !isAttachment && (
                            <Clock className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {item.activity_type || 'Activity'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(item.created_at).toLocaleString([], { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-700 mb-2">
                              {item.title || item.content || item.description || 'No description available'}
                            </p>
                            
                            {item.details && (
                              <p className="text-xs text-gray-500 mb-2">{item.details}</p>
                            )}
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {item.author_name && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{item.author_name}</span>
                                </div>
                              )}
                              {item.priority && (
                                <Badge className={`${priorityColors[item.priority as keyof typeof priorityColors]} text-xs`}>
                                  {item.priority}
                                </Badge>
                              )}
                              {item.visible_to_partner && (
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3 text-blue-500" />
                                  <span className="text-blue-600">visible</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No timeline activity yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start by adding a task or comment to see the timeline</p>
                </div>
              )}
            </div>
          )}

          {/* Next Best Actions */}
          {selectedActivityType === 'actions' && (
            <div className={`space-y-3 transition-all duration-500 ${highlightActions ? 'ring-2 ring-purple-300 ring-opacity-75 bg-purple-50 rounded-lg p-3 -m-3' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Next Best Actions</span>
                {highlightActions && (
                  <Badge className="bg-purple-100 text-purple-800 animate-pulse">
                    New
                  </Badge>
                )}
              </div>
              {actions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No AI suggestions available</p>
                  <p className="text-xs text-gray-400 mt-1">Generate new recommendations with the AI button above</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {actions.slice(0, 5).map((action: NextBestAction, index: number) => (
                    <div 
                      key={action.id} 
                      className={`p-3 bg-white border rounded-lg transition-all duration-300 ${
                        highlightActions 
                          ? 'border-purple-300 shadow-md animate-pulse' 
                          : 'border-purple-200'
                      }`}
                      style={highlightActions ? { animationDelay: `${index * 100}ms` } : {}}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-3 w-3 text-purple-600" />
                        <h4 className="font-medium text-sm text-gray-900">{action.title}</h4>
                        <Badge className={priorityColors[action.priority as keyof typeof priorityColors]}>
                          {action.priority}
                        </Badge>
                        {highlightActions && (
                          <Badge className="bg-purple-100 text-purple-800 animate-pulse">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{action.description}</p>
                      
                      {/* Assignment Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <Select 
                          onValueChange={(assignedTo) => {
                            if (assignedTo !== 'ai-agent') {
                              convertToTaskMutation.mutate({ actionId: action.id, assignedTo });
                            }
                          }}
                        >
                          <SelectTrigger className="w-36 h-7 text-xs">
                            <SelectValue placeholder="Assign to..." />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                <div className="flex items-center gap-2">
                                  <User className="h-3 w-3" />
                                  <span>{member.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                            <SelectItem value="ai-agent" disabled>
                              <div className="flex items-center gap-2 text-gray-400">
                                <Bot className="h-3 w-3" />
                                <span>AI Agent (coming later)</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={() => convertToTaskMutation.mutate({ actionId: action.id, assignedTo: '' })}
                          disabled={convertToTaskMutation.isPending}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Convert to Task
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}