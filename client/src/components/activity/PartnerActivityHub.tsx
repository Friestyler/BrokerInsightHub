import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MessageSquare, CheckSquare, ChevronDown, ChevronRight, Sparkles, Clock, User, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PartnerActivityHubProps {
  partnerId: number;
  partnerName: string;
}

interface ActivityTask {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to_name: string;
  assigned_by_name: string;
  due_date: string;
  created_at: string;
}

interface ActivityComment {
  id: number;
  content: string;
  author_name: string;
  assigned_to_name: string;
  is_internal: boolean;
  created_at: string;
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

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

export default function PartnerActivityHub({ partnerId, partnerName }: PartnerActivityHubProps) {
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const [inlineTaskTitle, setInlineTaskTitle] = useState('');
  const [inlineCommentContent, setInlineCommentContent] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current environment from localStorage
  const currentEnv = localStorage.getItem('selectedEnvironment') || 'degoudse';

  // Fetch activities
  const { data: activities, isLoading } = useQuery({
    queryKey: [`/api/${currentEnv}/partners/${partnerId}/activities`],
  });

  // Fetch next best actions
  const { data: nextActions, isLoading: isLoadingActions } = useQuery({
    queryKey: [`/api/${currentEnv}/partners/${partnerId}/next-actions`],
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (taskData: any) => 
      fetch(`/api/${currentEnv}/activity/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          entityType: 'partner',
          entityId: partnerId,
          assignedById: 1
        })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/partners/${partnerId}/activities`] });
      setInlineTaskTitle('');
      setShowTaskInput(false);
      toast({ title: 'Task created successfully' });
    }
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: (commentData: any) => 
      fetch(`/api/${currentEnv}/activity/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...commentData,
          entityType: 'partner',
          entityId: partnerId,
          authorId: 1
        })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/partners/${partnerId}/activities`] });
      setInlineCommentContent('');
      setShowCommentInput(false);
      toast({ title: 'Comment added successfully' });
    }
  });

  // Generate AI actions mutation
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
        description: error.message || 'An error occurred',
        variant: 'destructive' 
      });
    }
  });

  const handleCreateTask = () => {
    if (!inlineTaskTitle.trim()) return;
    createTaskMutation.mutate({ title: inlineTaskTitle, priority: 'medium' });
  };

  const handleCreateComment = () => {
    if (!inlineCommentContent.trim()) return;
    createCommentMutation.mutate({ content: inlineCommentContent, isInternal: false });
  };

  const handleTaskKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateTask();
    }
    if (e.key === 'Escape') {
      setShowTaskInput(false);
      setInlineTaskTitle('');
    }
  };

  const handleCommentKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateComment();
    }
    if (e.key === 'Escape') {
      setShowCommentInput(false);
      setInlineCommentContent('');
    }
  };

  if (isLoading) {
    return (
      <div className="mb-4 border border-gray-200 rounded-lg bg-white">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Activity</span>
          </div>
        </div>
        <div className="p-4 flex items-center justify-center h-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  const tasks = activities?.tasks || [];
  const comments = activities?.comments || [];
  const actions = nextActions || [];

  const pendingTasks = tasks.filter((t: ActivityTask) => t.status === 'pending').length;
  const highPriorityActions = actions.filter((a: NextBestAction) => a.priority === 'high' || a.priority === 'urgent').length;

  return (
    <div className="mb-4 border border-gray-200 rounded-lg bg-white">
      {/* Minimal header with activity stats */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Activity</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{pendingTasks} pending</span>
            <span>{comments.length} comments</span>
            <span>{actions.length} AI suggestions</span>
          </div>
        </div>
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

      <div className="p-3 space-y-2">
        {/* Quick add task - Google style */}
        <div className="space-y-2">
          {!showTaskInput ? (
            <button
              onClick={() => setShowTaskInput(true)}
              className="flex items-center gap-2 w-full text-left p-2 rounded-md hover:bg-gray-50 text-sm text-gray-600"
            >
              <Plus className="h-4 w-4" />
              Add task or comment...
            </button>
          ) : (
            <div className="border rounded-md p-2 bg-gray-50">
              <Input
                placeholder="Add a task..."
                value={inlineTaskTitle}
                onChange={(e) => setInlineTaskTitle(e.target.value)}
                onKeyDown={handleTaskKeyPress}
                className="border-0 bg-transparent p-1 text-sm focus:ring-0"
                autoFocus
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                    <CheckSquare className="h-3 w-3 mr-1" />
                    Task
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      setShowTaskInput(false);
                      setShowCommentInput(true);
                    }}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Comment
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    size="sm" 
                    onClick={handleCreateTask}
                    disabled={!inlineTaskTitle.trim() || createTaskMutation.isPending}
                    className="h-6 px-3 text-xs"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!showCommentInput && showTaskInput ? null : !showCommentInput ? null : (
            <div className="border rounded-md p-2 bg-gray-50">
              <Textarea
                placeholder="Add a comment..."
                value={inlineCommentContent}
                onChange={(e) => setInlineCommentContent(e.target.value)}
                onKeyDown={handleCommentKeyPress}
                className="border-0 bg-transparent p-1 text-sm resize-none focus:ring-0 min-h-[60px]"
                autoFocus
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      setShowCommentInput(false);
                      setShowTaskInput(true);
                    }}
                  >
                    <CheckSquare className="h-3 w-3 mr-1" />
                    Task
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Comment
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    size="sm" 
                    onClick={handleCreateComment}
                    disabled={!inlineCommentContent.trim() || createCommentMutation.isPending}
                    className="h-6 px-3 text-xs"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Next Best Actions - Collapsed by default */}
        {actions.length > 0 && (
          <Collapsible open={isActionsOpen} onOpenChange={setIsActionsOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 px-2 rounded hover:bg-gray-50 text-sm">
              {isActionsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="font-medium">AI Suggestions</span>
              <Badge variant="secondary" className="ml-auto text-xs">{actions.length}</Badge>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-2 pl-6">
                {actions.map((action: NextBestAction) => (
                  <div key={action.id} className="border-l-2 border-purple-200 pl-3 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm text-gray-900">{action.title}</h4>
                          <Badge className={priorityColors[action.priority as keyof typeof priorityColors]} size="sm">
                            {action.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{action.description}</p>
                        <p className="text-xs text-gray-500 italic">{action.reasoning}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Tasks Section - Collapsed by default */}
        {tasks.length > 0 && (
          <Collapsible open={isTasksOpen} onOpenChange={setIsTasksOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 px-2 rounded hover:bg-gray-50 text-sm">
              {isTasksOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <CheckSquare className="h-4 w-4 text-green-600" />
              <span className="font-medium">Tasks</span>
              <Badge variant="secondary" className="ml-auto text-xs">{tasks.length}</Badge>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-2 pl-6">
                {tasks.map((task: ActivityTask) => (
                  <div key={task.id} className="border-l-2 border-green-200 pl-3 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm text-gray-900">{task.title}</h4>
                          <Badge className={priorityColors[task.priority as keyof typeof priorityColors]} size="sm">
                            {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-xs text-gray-600 mb-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {task.assigned_to_name && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {task.assigned_to_name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(task.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Comments Section - Collapsed by default */}
        {comments.length > 0 && (
          <Collapsible open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 px-2 rounded hover:bg-gray-50 text-sm">
              {isCommentsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Comments</span>
              <Badge variant="secondary" className="ml-auto text-xs">{comments.length}</Badge>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-2 pl-6">
                {comments.map((comment: ActivityComment) => (
                  <div key={comment.id} className="border-l-2 border-blue-200 pl-3 py-2">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900">{comment.author_name}</span>
                        {comment.is_internal && (
                          <Badge variant="outline" className="text-xs">Internal</Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}