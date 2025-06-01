import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MessageSquare, Paperclip, CheckSquare, ChevronDown, ChevronRight, Sparkles, Clock, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function PartnerActivityHub({ partnerId, partnerName }: PartnerActivityHubProps) {
  const [isTasksOpen, setIsTasksOpen] = useState(true);
  const [isCommentsOpen, setIsCommentsOpen] = useState(true);
  const [isActionsOpen, setIsActionsOpen] = useState(true);
  const [isQuickStatsOpen, setIsQuickStatsOpen] = useState(true);

  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  const [newComment, setNewComment] = useState({ content: '', isInternal: false });
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [showNewCommentForm, setShowNewCommentForm] = useState(false);

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
    mutationFn: (taskData: any) => apiRequest(`/api/${currentEnv}/activity/tasks`, {
      method: 'POST',
      body: JSON.stringify({
        ...taskData,
        entityType: 'partner',
        entityId: partnerId,
        assignedById: 1 // Mock user ID - in real app would come from auth
      })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/partners/${partnerId}/activities`] });
      setNewTask({ title: '', description: '', priority: 'medium' });
      setShowNewTaskForm(false);
      toast({ title: 'Task created successfully' });
    }
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: (commentData: any) => apiRequest(`/api/${currentEnv}/activity/comments`, {
      method: 'POST',
      body: JSON.stringify({
        ...commentData,
        entityType: 'partner',
        entityId: partnerId,
        authorId: 1 // Mock user ID - in real app would come from auth
      })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/partners/${partnerId}/activities`] });
      setNewComment({ content: '', isInternal: false });
      setShowNewCommentForm(false);
      toast({ title: 'Comment added successfully' });
    }
  });

  // Generate AI actions mutation
  const generateActionsMutation = useMutation({
    mutationFn: () => apiRequest(`/api/${currentEnv}/partners/${partnerId}/generate-actions`, {
      method: 'POST'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/partners/${partnerId}/next-actions`] });
      toast({ title: 'AI recommendations generated successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to generate AI recommendations', 
        description: error.response?.data?.error || 'An error occurred',
        variant: 'destructive' 
      });
    }
  });

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    createTaskMutation.mutate(newTask);
  };

  const handleCreateComment = () => {
    if (!newComment.content.trim()) return;
    createCommentMutation.mutate(newComment);
  };

  const handleGenerateActions = () => {
    generateActionsMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Activity Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tasks = activities?.tasks || [];
  const comments = activities?.comments || [];
  const actions = nextActions || [];

  // Calculate quick stats
  const pendingTasks = tasks.filter((t: ActivityTask) => t.status === 'pending').length;
  const completedTasks = tasks.filter((t: ActivityTask) => t.status === 'completed').length;
  const highPriorityActions = actions.filter((a: NextBestAction) => a.priority === 'high' || a.priority === 'urgent').length;

  return (
    <Card className="mb-6 border-l-4 border-l-indigo-600">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            Activity Hub - {partnerName}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateActions}
              disabled={generateActionsMutation.isPending}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {generateActionsMutation.isPending ? 'Generating...' : 'AI Actions'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <Collapsible open={isQuickStatsOpen} onOpenChange={setIsQuickStatsOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded hover:bg-gray-50">
            {isQuickStatsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="font-medium">Quick Stats</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-3 gap-4 mt-3 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
                <div className="text-sm text-gray-600">Pending Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                <div className="text-sm text-gray-600">Completed Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{highPriorityActions}</div>
                <div className="text-sm text-gray-600">High Priority Actions</div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* AI Next Best Actions */}
        <Collapsible open={isActionsOpen} onOpenChange={setIsActionsOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded hover:bg-gray-50">
            {isActionsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="font-medium">AI Next Best Actions</span>
            <Badge variant="secondary" className="ml-auto">{actions.length}</Badge>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-3 space-y-3">
              {isLoadingActions ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : actions.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No AI recommendations available</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={handleGenerateActions}
                    disabled={generateActionsMutation.isPending}
                  >
                    Generate Recommendations
                  </Button>
                </div>
              ) : (
                actions.map((action: NextBestAction) => (
                  <div key={action.id} className="border rounded-lg p-3 bg-gradient-to-r from-purple-50 to-indigo-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{action.title}</h4>
                          <Badge className={priorityColors[action.priority as keyof typeof priorityColors]}>
                            {action.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(action.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                        <p className="text-xs text-gray-500 italic">{action.reasoning}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(action.created_at).toLocaleDateString()}
                      </span>
                      <Badge className={statusColors[action.status as keyof typeof statusColors]}>
                        {action.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Tasks Section */}
        <Collapsible open={isTasksOpen} onOpenChange={setIsTasksOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded hover:bg-gray-50">
            {isTasksOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <CheckSquare className="h-4 w-4 text-green-600" />
            <span className="font-medium">Tasks</span>
            <Badge variant="secondary" className="ml-auto">{tasks.length}</Badge>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-3 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">Task Management</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewTaskForm(!showNewTaskForm)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </div>

              {showNewTaskForm && (
                <div className="border rounded-lg p-3 bg-gray-50 space-y-3">
                  <Input
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Task description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                  <div className="flex items-center gap-2">
                    <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleCreateTask} disabled={createTaskMutation.isPending}>
                      Create Task
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewTaskForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {tasks.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <CheckSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No tasks found</p>
                </div>
              ) : (
                tasks.map((task: ActivityTask) => (
                  <div key={task.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                            {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
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
                      <Badge className={statusColors[task.status as keyof typeof statusColors]}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Comments Section */}
        <Collapsible open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded hover:bg-gray-50">
            {isCommentsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Comments & Communication</span>
            <Badge variant="secondary" className="ml-auto">{comments.length}</Badge>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-3 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">Team Communication</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewCommentForm(!showNewCommentForm)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Comment
                </Button>
              </div>

              {showNewCommentForm && (
                <div className="border rounded-lg p-3 bg-gray-50 space-y-3">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment.content}
                    onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                  />
                  <div className="flex items-center gap-2">
                    <Button onClick={handleCreateComment} disabled={createCommentMutation.isPending}>
                      Post Comment
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewCommentForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {comments.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No comments yet</p>
                </div>
              ) : (
                comments.map((comment: ActivityComment) => (
                  <div key={comment.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{comment.author_name}</span>
                        {comment.is_internal && (
                          <Badge variant="outline" className="text-xs">Internal</Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                    {comment.assigned_to_name && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                        <AlertCircle className="h-3 w-3" />
                        Assigned to: {comment.assigned_to_name}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}