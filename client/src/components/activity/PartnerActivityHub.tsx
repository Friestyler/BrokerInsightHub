import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  Plus, MessageSquare, CheckSquare, Paperclip, ChevronDown, ChevronRight, 
  Sparkles, Clock, User, Send, Eye, EyeOff, Check, X, Calendar, Filter, Brain, UserPlus, Bot, Target, Flag, Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import userAvatar from "@/assets/user-avatar.png";

// ActivityReactions component for displaying emoji reactions
interface ActivityReactionsProps {
  activityType: string;
  activityId: number;
  onReactionClick: (emoji: string) => void;
}

// Custom hook to check if there are reactions
const useHasReactions = (activityType: string, activityId: number) => {
  const { data: reactions, isLoading } = useQuery<any[]>({
    queryKey: [`/api/activity-reactions/${activityType}/${activityId}`],
    staleTime: 30000, // 30 seconds
    enabled: !!activityType && !!activityId, // Only fetch if we have valid parameters
  });

  const hasReactions = !isLoading && reactions && Array.isArray(reactions) && reactions.length > 0;
  return { hasReactions, reactions, isLoading };
};

const ActivityReactions = ({ activityType, activityId, onReactionClick }: ActivityReactionsProps) => {
  const { hasReactions, reactions, isLoading } = useHasReactions(activityType, activityId);

  // Handle cases where reactions is undefined, not an array, or empty
  if (isLoading || !hasReactions) {
    return null; // Don't show anything while loading or if no reactions
  }

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        {reactions!.map((reaction: any, index: number) => (
          <button
            key={`${reaction.emoji}-${index}`}
            onClick={() => onReactionClick(reaction.emoji)}
            className="flex items-center gap-1 px-2 py-1 bg-[#E6E7F1] hover:bg-gray-200 rounded-full transition-colors text-xs"
            title={`${reaction.user_names?.join(', ') || 'Users'} reacted with ${reaction.emoji}`}
          >
            <span>{reaction.emoji}</span>
            <span className="text-gray-600">{reaction.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

interface PartnerActivityHubProps {
  partnerId: number;
  partnerName: string;
  entityType?: 'partner' | 'opportunity';
  entityId?: number;
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
  { value: 'actions', label: 'Next Best Actions', icon: Sparkles, color: 'text-purple-600' },
  { value: 'meeting', label: 'Prepare a Meeting', icon: Calendar, color: 'text-orange-600' }
];

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};




interface TimelineComposerProps {
  onCreateTask: (taskData: {
    title: string;
    priority: string;
    assignedTo: string;
    visibleToPartner: boolean;
  }) => void;
  onCreateComment: (commentData: {
    content: string;
    visibleToPartner: boolean;
  }) => void;
  teamMembers: Array<{ id: string; name: string }>;
  isLoading: boolean;
  defaultMode?: 'task' | 'comment';
}

const TimelineComposer = ({ onCreateTask, onCreateComment, teamMembers, isLoading, defaultMode = 'comment' }: TimelineComposerProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultMode === 'task');
  const [activeMode, setActiveMode] = useState<'task' | 'comment'>(defaultMode);
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [visibleToPartner, setVisibleToPartner] = useState(true);

  const handleSubmit = () => {
    if (!content.trim()) return;
    
    if (activeMode === 'task') {
      onCreateTask({
        title: content.trim(),
        priority,
        assignedTo,
        visibleToPartner
      });
    } else {
      onCreateComment({
        content: content.trim(),
        visibleToPartner
      });
    }

    // Reset form
    setContent('');
    setPriority('medium');
    setAssignedTo('');
    setVisibleToPartner(true);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setContent('');
    setPriority('medium');
    setAssignedTo('');
    setVisibleToPartner(true);
    setIsExpanded(false);
  };

  const getPlaceholder = () => {
    return activeMode === 'task' ? 'What needs to be done?' : 'Write a comment...';
  };

  const getIcon = () => {
    return activeMode === 'task' ? CheckSquare : MessageSquare;
  };

  const getIconColor = () => {
    return activeMode === 'task' ? 'text-green-600' : 'text-blue-600';
  };

  if (!isExpanded) {
    return (
      <div className="border-t border-[#E6E7F1] pt-4 mt-4">
        {/* Modern Floating Input Bar */}
        <div className="relative">
          <div className="bg-white rounded-full border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 p-1">
            <div className="flex items-center gap-2">
              {/* Dynamic Icon based on mode */}
              <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                activeMode === 'task' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {activeMode === 'task' ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
              </div>

              {/* Input Area */}
              <button
                onClick={() => setIsExpanded(true)}
                className="flex-1 text-left px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                {activeMode === 'task' ? 'What needs to be done?' : 'Add a note or task...'}
              </button>

              {/* Right Actions */}
              <div className="flex items-center gap-1 pr-1">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                {defaultMode !== 'comment' && (
                  <button 
                    onClick={() => {
                      setActiveMode('task');
                      setIsExpanded(true);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-100 transition-all duration-200"
                  >
                    <CheckSquare className="h-4 w-4" />
                  </button>
                )}
                <button 
                  disabled
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 cursor-not-allowed"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-[#E6E7F1] pt-4 mt-4">
      {/* ClickUp-style Task Creator */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Main Input Area */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Textarea
              placeholder={getPlaceholder()}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
                if (e.key === 'Escape') {
                  handleCancel();
                }
              }}
              className="w-full h-8 min-h-[32px] max-h-8 resize-none border-0 bg-transparent text-gray-900 text-sm pl-2 pt-1 pr-0 pb-0 focus:ring-0 focus:outline-none placeholder:text-gray-400 overflow-hidden"
              autoFocus
            />
          </div>
        </div>

        {/* Task Properties Bar */}
        {activeMode === 'task' && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Priority Selector */}
              <div className="flex items-center gap-1">
                <Flag className="h-3.5 w-3.5 text-gray-400" />
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-7 w-20 text-xs border-0 bg-gray-50 hover:bg-gray-100 rounded-md px-2 focus:ring-1 focus:ring-blue-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-24">
                    <SelectItem value="low" className="text-xs">Low</SelectItem>
                    <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                    <SelectItem value="high" className="text-xs">High</SelectItem>
                    <SelectItem value="urgent" className="text-xs">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assignee Selector */}
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-gray-400" />
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger className="h-7 w-32 text-xs border-0 bg-gray-50 hover:bg-gray-100 rounded-md px-2 focus:ring-1 focus:ring-blue-200">
                    <SelectValue placeholder="Assign..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id} className="text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                            {(member as any).initials || member.name.charAt(0)}
                          </div>
                          <span>{member.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="ai-agent" disabled className="text-xs opacity-50">
                      <div className="flex items-center gap-2">
                        <Bot className="h-3.5 w-3.5" />
                        <span>AI Agent (soon)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center gap-3 ml-auto">
                <Switch
                  checked={visibleToPartner}
                  onCheckedChange={setVisibleToPartner}
                  className="h-4 w-7 data-[state=checked]:bg-blue-500"
                />
                <span className="text-xs text-gray-500">Share with partner</span>
              </div>
            </div>
          </div>
        )}

        {/* Comment Visibility for Comments */}
        {activeMode === 'comment' && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-3">
              <Switch
                checked={visibleToPartner}
                onCheckedChange={setVisibleToPartner}
                className="h-4 w-7 data-[state=checked]:bg-blue-500"
              />
              <span className="text-xs text-gray-500">Share with partner</span>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">⌘</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">↵</kbd>
            <span>to send</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCancel} 
              className="h-7 px-3 text-xs text-gray-500 hover:text-gray-700 hover:bg-white rounded-md"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isLoading || !content.trim()}
              className="h-7 px-4 text-xs font-medium bg-[#5567E5] hover:bg-[#4556D4] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                <span>{activeMode === 'task' ? 'Create task' : 'Add comment'}</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PartnerActivityHub({ partnerId, partnerName, entityType = 'partner', entityId }: PartnerActivityHubProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedActivityType, setSelectedActivityType] = useState<'task' | 'comment' | 'attachment' | 'timeline' | 'actions' | 'meeting'>('task');
  const [highlightActions, setHighlightActions] = useState(false);
  const [showActivityInput, setShowActivityInput] = useState(false);

  // Detect if we're in broker view
  const isBrokerView = location.startsWith('/broker-view');

  // Filter activity types based on broker view
  const filteredActivityTypes = isBrokerView 
    ? activityTypes.filter(type => type.value !== 'actions' && type.value !== 'meeting')
    : activityTypes;

  // Reset selected activity type if it's not available in broker view
  useEffect(() => {
    if (isBrokerView && (selectedActivityType === 'actions' || selectedActivityType === 'meeting')) {
      setSelectedActivityType('task');
    }
  }, [isBrokerView, selectedActivityType]);

  // Function to render markdown bold text
  const renderMarkdownText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };
  
  // Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [visibleToPartner, setVisibleToPartner] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');
  
  // Meeting preparation states
  const [meetingBriefing, setMeetingBriefing] = useState<any>(null);
  const [isPreparingMeeting, setIsPreparingMeeting] = useState(false);

  // Timeline scroll ref for auto-scrolling to bottom
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentEnv = localStorage.getItem('selectedEnvironment') || 'degoudse';

  // Fetch users from database
  const { data: usersData } = useQuery({
    queryKey: [`/api/${currentEnv}/users`],
  });

  // Available team members for assignment (use real users from database)
  const teamMembers = Array.isArray(usersData) ? usersData.map((user: any) => ({
    id: user.id.toString(),
    name: user.name,
    role: user.role || 'User',
    initials: user.initials || user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  })) : [];

  // Helper function to get user name from database
  const getUserName = (userId: number): string => {
    if (!userId) return 'Unknown User';
    const user = Array.isArray(usersData) ? usersData.find((u: any) => u.id === userId) : null;
    return user ? user.name : 'Unknown User';
  };

  // Helper function to get user initials for avatar fallback
  const getUserInitials = (userId: number): string => {
    const user = Array.isArray(usersData) ? usersData.find((u: any) => u.id === userId) : null;
    if (user && user.initials) {
      return user.initials;
    }
    // Fallback: generate initials from name
    const userName = getUserName(userId);
    return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Helper function to get user avatar URL (placeholder for now)
  const getUserAvatarUrl = (userId: number): string | null => {
    // In a real app, this would fetch from user profile data
    // For now, return null to show initials fallback
    return null;
  };

  // Use entityId and entityType to determine the correct API endpoint
  const actualEntityId = entityId || partnerId;
  const apiEndpoint = entityType === 'opportunity' 
    ? `/api/degoudse/opportunities/${actualEntityId}/activities`
    : `/api/degoudse/partners/${actualEntityId}/activities`;

  // Fetch activities using the dynamic endpoint
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: [apiEndpoint],
  });

  // Fetch timeline
  const { data: timeline } = useQuery({
    queryKey: [`/api/${currentEnv}/partners/${partnerId}/timeline`],
    staleTime: 0,
    gcTime: 0
  });

  // Fetch all related tasks (partner + opportunities + customers)
  const { data: allTasks } = useQuery({
    queryKey: [`/api/${currentEnv}/partners/${partnerId}/all-tasks`],
    enabled: !!partnerId
  });

  // Fetch next best actions
  const { data: nextActions } = useQuery({
    queryKey: [`/api/${currentEnv}/partners/${partnerId}/next-actions`],
    enabled: selectedActivityType === 'actions'
  });

  // Reaction toggle mutation
  const reactionMutation = useMutation({
    mutationFn: async ({ activityType, activityId, emoji }: { activityType: string; activityId: number; emoji: string }) => {
      const response = await fetch(`/api/${currentEnv}/activity-reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityType,
          activityId,
          userId: 1, // Current user ID
          emoji
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle reaction');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate specific reaction query for immediate updates
      queryClient.invalidateQueries({ 
        queryKey: [`/api/activity-reactions/${variables.activityType}/${variables.activityId}`] 
      });
      // Do NOT invalidate timeline to prevent auto-scroll
    },
    onError: (error) => {
      console.error('Error toggling reaction:', error);
      toast({ title: 'Failed to update reaction', variant: 'destructive' });
    }
  });

  // Handle reaction toggle
  const handleReactionToggle = (activityType: string, activityId: number, emoji: string) => {
    reactionMutation.mutate({ activityType, activityId, emoji });
  };

  // Create activity mutation
  const createActivityMutation = useMutation({
    mutationFn: (activityData: any) => {
      const activityType = activityData.activityType || selectedActivityType;
      const endpoint = activityType === 'task' ? 'tasks' : 
                     activityType === 'comment' ? 'comments' : 'attachments';
      
      const baseUrl = entityType === 'opportunity' 
        ? `/api/degoudse/opportunities/${actualEntityId}`
        : `/api/${currentEnv}/partners/${partnerId}`;
      
      console.log('Sending activity request:', { baseUrl, endpoint, activityData });
      
      return fetch(`${baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...activityData,
          user_id: 1
        })
      }).then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.text().then(text => {
          try {
            return text ? JSON.parse(text) : { success: true };
          } catch (e) {
            console.log('Response is not JSON:', text);
            return { success: true, message: text };
          }
        });
      });
    },
    onSuccess: (data) => {
      console.log('Activity created successfully:', data);
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
      queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/partners/${partnerId}/timeline`] });
      queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/partners`] });
      
      // Force immediate refetch with no cache
      queryClient.refetchQueries({ 
        queryKey: [apiEndpoint],
        type: 'active'
      });
      
      // Force timeline and all-tasks query refresh for bidirectional sync
      queryClient.invalidateQueries({ 
        queryKey: [`/api/${currentEnv}/partners/${partnerId}/timeline`],
        exact: true
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/${currentEnv}/partners/${partnerId}/all-tasks`],
        exact: true
      });
      
      resetForm();
      const activityType = (data as any).activityType || selectedActivityType;
      toast({ title: `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} created successfully` });
    },
    onError: (error, variables) => {
      const activityType = (variables as any).activityType || selectedActivityType;
      console.error(`Failed to create ${activityType}:`, error);
      toast({ 
        title: `Failed to create ${activityType}`, 
        description: 'Please try again',
        variant: 'destructive' 
      });
    }
  });

  // Toggle task completion
  const toggleTaskMutation = useMutation({
    mutationFn: ({ taskId, completed }: { taskId: number, completed: boolean }) =>
      fetch(`/api/${currentEnv}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed, completedAt: completed ? new Date().toISOString() : null })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
      queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/partners/${partnerId}/timeline`] });
      queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/partners/${partnerId}/all-tasks`] });
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

  // Prepare meeting with AI
  const prepareMeetingMutation = useMutation({
    mutationFn: () => 
      fetch(`/api/${currentEnv}/partners/${partnerId}/prepare-meeting`, {
        method: 'POST'
      }).then(res => res.json()),
    onSuccess: (data) => {
      setMeetingBriefing(data);
      setIsPreparingMeeting(false);
      toast({ title: 'Meeting briefing prepared successfully' });
    },
    onError: (error: any) => {
      setIsPreparingMeeting(false);
      toast({ 
        title: 'Failed to prepare meeting briefing', 
        description: 'Please check your OpenAI API configuration',
        variant: 'destructive' 
      });
    }
  });

  // Save meeting briefing
  const saveMeetingBriefingMutation = useMutation({
    mutationFn: () => 
      fetch(`/api/${currentEnv}/partners/${partnerId}/save-meeting-briefing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingBriefing)
      }).then(res => res.json()),
    onSuccess: (data) => {
      toast({ title: 'Meeting briefing saved successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to save meeting briefing', 
        description: 'Please try again',
        variant: 'destructive' 
      });
    }
  });

  // Load latest saved meeting briefing
  const { data: savedMeetingBriefing } = useQuery({
    queryKey: [`/api/${currentEnv}/partners/${partnerId}/latest-meeting-briefing`],
    enabled: selectedActivityType === 'meeting' && !meetingBriefing,
    retry: false
  });

  const handlePrepareMeeting = () => {
    setMeetingBriefing(null); // Clear previous briefing to ensure fresh content
    setIsPreparingMeeting(true);
    prepareMeetingMutation.mutate();
  };

  const handleSaveMeetingBriefing = () => {
    if (meetingBriefing) {
      saveMeetingBriefingMutation.mutate();
    }
  };

  // Load saved briefing when switching to meeting tab
  useEffect(() => {
    if (savedMeetingBriefing && !meetingBriefing && selectedActivityType === 'meeting') {
      setMeetingBriefing(savedMeetingBriefing);
    }
  }, [savedMeetingBriefing, meetingBriefing, selectedActivityType]);

  // Track timeline length to only scroll when new activities are added
  const [previousTimelineLength, setPreviousTimelineLength] = useState(0);

  // Auto-scroll to bottom when timeline opens or new activities are added
  useLayoutEffect(() => {
    const timelineData = (timeline as any) || [];
    const currentLength = timelineData.length;
    
    // Only scroll if switching to timeline view OR if new activities were added
    const shouldScroll = (
      (selectedActivityType === 'timeline' && timelineScrollRef.current) && 
      (previousTimelineLength === 0 || currentLength > previousTimelineLength)
    );
    
    if (shouldScroll && currentLength > 0) {
      const scrollContainer = timelineScrollRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
    
    setPreviousTimelineLength(currentLength);
  }, [selectedActivityType, timeline, previousTimelineLength]);

  // Additional scroll trigger only for new activities
  useEffect(() => {
    const timelineData = (timeline as any) || [];
    const currentLength = timelineData.length;
    
    if (selectedActivityType === 'timeline' && timelineScrollRef.current && currentLength > previousTimelineLength && currentLength > 0) {
      // Delayed scroll to ensure all async content is rendered for new activities only
      setTimeout(() => {
        if (timelineScrollRef.current) {
          timelineScrollRef.current.scrollTop = timelineScrollRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [selectedActivityType, timeline, previousTimelineLength]);

  const resetForm = () => {
    setTaskTitle('');
    setCommentContent('');
    setTaskPriority('medium');
    setVisibleToPartner(false);
    setAssignedTo('');
    setShowActivityInput(false);
  };

  const handleCreateActivity = () => {
    let activityData: any = { visible_to_partner: visibleToPartner };

    if (selectedActivityType === 'task') {
      if (!taskTitle.trim()) return;
      activityData = { ...activityData, title: taskTitle, priority: taskPriority, assigned_to: assignedTo };
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

  // Task completion mutation
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await fetch(`/api/${currentEnv}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      });
      if (!response.ok) throw new Error('Failed to complete task');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh the timeline and activities
      queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/${entityType}s/${entityType === 'partner' ? partnerId : entityId}/timeline`] });
      queryClient.invalidateQueries({ queryKey: [`/api/${currentEnv}/${entityType}s/${entityType === 'partner' ? partnerId : entityId}/activities`] });
      toast({ title: 'Task marked as complete' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to complete task', 
        description: 'Please try again',
        variant: 'destructive' 
      });
    }
  });

  const handleTaskCompletion = (taskId: number) => {
    completeTaskMutation.mutate(taskId);
  };

  if (activitiesLoading) {
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
  
  // Timeline data comes directly from the API - no client-side merging needed

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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h4l3-8 4 16 3-8h4"></path>
            </svg>
            <span className="text-sm font-medium text-gray-700">Activity</span>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{pendingTasks} pending</span>
              <span>{totalActivities} total</span>
              {actions.length > 0 && <span>{actions.length} AI suggestions</span>}
            </div>
          </button>
          
          {!isBrokerView && (
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
          )}
        </div>
      </div>
      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {/* Activity Type Selector - Apple Style */}
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
            {filteredActivityTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => {
                    setSelectedActivityType(type.value as 'task' | 'comment' | 'attachment' | 'timeline' | 'actions' | 'meeting');
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
            <div className="flex flex-col h-full">
              {/* Task List with timeline styling */}
              <div className="flex-1 space-y-4 max-h-64 overflow-y-auto mb-4">
                {Array.isArray(allTasks) && allTasks.length > 0 ? (
                  allTasks
                    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((task: any, index: number) => (
                      <div key={`task-${task.id}-${index}`} className="flex items-start gap-3 relative group">
                        {/* Timeline line */}
                        {index < allTasks.length - 1 && (
                          <div className="absolute left-4 top-10 w-px h-8 bg-gray-200"></div>
                        )}
                        
                        {/* Checkbox/Icon */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center relative z-10 bg-white border-2 border-gray-200">
                          <CheckSquare className={`h-4 w-4 ${task.completed ? 'text-green-600' : 'text-gray-600'}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0 relative">
                          <div className={`bg-white rounded-lg p-3 border transition-all duration-200 relative ${
                            task.completed 
                              ? 'border-green-200 bg-green-50/30' 
                              : 'border-gray-200 hover:bg-[#F5F6FA] hover:border-[#E6E7F1]'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-sm font-medium ${
                                task.completed ? 'text-gray-500' : 'text-gray-900'
                              }`}>
                                Task
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(task.created_at).toLocaleString([], { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              {task.completed && (
                                <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full">
                                  Completed
                                </span>
                              )}
                              {/* Source indicator - hide when viewing in native context */}
                              {task.source_type && task.source_name && task.source_type !== entityType && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-400">•</span>
                                  <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                                    task.source_type === 'opportunity' ? 'bg-green-100 text-green-700' :
                                    task.source_type === 'customer' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {task.source_type === 'opportunity' && <Target className="h-3 w-3" />}
                                    {task.source_type === 'customer' && <User className="h-3 w-3" />}
                                    <span>from {task.source_name}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <p className={`text-sm mb-2 ${
                              task.completed 
                                ? 'text-gray-500 line-through' 
                                : 'text-gray-700'
                            }`}>
                              {task.title}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                {task.visible_to_partner && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-blue-600">shared with partner</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Task badges for assignee and priority */}
                              {(task.assigned_to || task.priority) && (
                                <div className="flex items-center gap-2">
                                  {task.assigned_to && (
                                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 text-gray-700 rounded-full text-xs font-medium">
                                      <User className="h-3 w-3" />
                                      <span>{getUserName(task.assigned_to)}</span>
                                    </div>
                                  )}
                                  {task.priority && (
                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                      task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                      task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      <Flag className="h-3 w-3" />
                                      <span className="capitalize">{task.priority}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Hover Toolbar */}
                            <div className="absolute -top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                              <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-1.5 py-1 flex items-center gap-0.5">
                                {/* Muscle Emoji */}
                                <button 
                                  onClick={() => handleReactionToggle('task', task.id, '💪')}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-[#E6E7F1] rounded-md transition-colors duration-150"
                                >
                                  <span className="text-lg">💪</span>
                                </button>
                                
                                {/* Thumbs Up Emoji */}
                                <button 
                                  onClick={() => handleReactionToggle('task', task.id, '👍')}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-[#E6E7F1] rounded-md transition-colors duration-150"
                                >
                                  <span className="text-lg">👍</span>
                                </button>
                                
                                {/* Boom Emoji */}
                                <button 
                                  onClick={() => handleReactionToggle('task', task.id, '💥')}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-[#E6E7F1] rounded-md transition-colors duration-150"
                                >
                                  <span className="text-lg">💥</span>
                                </button>
                                
                                {/* Comments Icon */}
                                <button className="w-8 h-8 flex items-center justify-center hover:bg-[#E6E7F1] rounded-md transition-colors duration-150">
                                  <MessageSquare className="h-4 w-4 text-gray-600" />
                                </button>
                                
                                {/* Pin Icon */}
                                <button className="w-8 h-8 flex items-center justify-center hover:bg-[#E6E7F1] rounded-md transition-colors duration-150">
                                  <Bookmark className="h-4 w-4 text-gray-600" />
                                </button>
                                
                                {/* Task completion checkbox */}
                                <button 
                                  onClick={() => handleTaskCompletion(task.id)}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-[#E6E7F1] rounded-md transition-colors duration-150 relative group/tooltip"
                                  title="Mark task as complete"
                                >
                                  <CheckSquare className="h-4 w-4 text-gray-600" />
                                  {/* Custom tooltip aligned from right */}
                                  <div className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                    Mark task as complete
                                    <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                  </div>
                                </button>
                              </div>
                            </div>
                            
                            {/* Reactions Display */}
                            <ActivityReactions 
                              activityType="task"
                              activityId={task.id}
                              onReactionClick={(emoji: string) => handleReactionToggle('task', task.id, emoji)}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No tasks yet</p>
                    <p className="text-xs text-gray-400 mt-1">Create your first task below</p>
                  </div>
                )}
              </div>

              {/* Task Creation Composer */}
              <TimelineComposer
                onCreateTask={(taskData: {
                  title: string;
                  priority: string;
                  assignedTo: string;
                  visibleToPartner: boolean;
                }) => {
                  // Use existing task creation logic
                  const originalType = selectedActivityType;
                  const originalTitle = taskTitle;
                  const originalPriority = taskPriority;
                  const originalAssignedTo = assignedTo;
                  const originalVisibility = visibleToPartner;

                  // Set temporary values for task creation
                  setSelectedActivityType('task');
                  setTaskTitle(taskData.title);
                  setTaskPriority(taskData.priority);
                  setAssignedTo(taskData.assignedTo);
                  setVisibleToPartner(taskData.visibleToPartner);

                  // Create the task
                  handleCreateActivity();
                  
                  // Reset to original values after a brief delay
                  setTimeout(() => {
                    setSelectedActivityType(originalType);
                    setTaskTitle(originalTitle);
                    setTaskPriority(originalPriority);
                    setAssignedTo(originalAssignedTo);
                    setVisibleToPartner(originalVisibility);
                  }, 100);
                }}
                onCreateComment={() => {}} // Not used in task tab
                teamMembers={teamMembers}
                isLoading={createActivityMutation.isPending}
                defaultMode="task"
              />
            </div>
          )}



          {/* Comments */}
          {selectedActivityType === 'comment' && (
            <div className="flex flex-col h-full">
              {/* Comments Timeline with Cross-Entity Display */}
              <div className="flex-1 space-y-4 max-h-64 overflow-y-auto mb-4">
                {rawTimelineData && rawTimelineData.length > 0 ? (
                  rawTimelineData
                    .filter((item: any) => item.activity_type === 'comment')
                    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((comment: any, index: number) => (
                      <div key={`comment-${comment.id}-${index}`} className="flex items-start gap-3 relative group">
                        {/* Timeline line */}
                        {index < rawTimelineData.filter((item: any) => item.activity_type === 'comment').length - 1 && (
                          <div className="absolute left-4 top-10 w-px h-8 bg-gray-200"></div>
                        )}
                        
                        {/* User Avatar */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center relative z-10 bg-white border-2 border-gray-200">
                          {getUserAvatarUrl(comment.assigned_to) ? (
                            <img 
                              src={getUserAvatarUrl(comment.assigned_to)!} 
                              alt={getUserName(comment.assigned_to)}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                              {getUserInitials(comment.assigned_to)}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0 relative">
                          <div className="bg-white rounded-lg p-3 border border-gray-200 hover:bg-[#F5F6FA] hover:border-[#E6E7F1] transition-all duration-200 relative">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {comment.assigned_to ? getUserName(comment.assigned_to) : 'Unknown User'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleString([], { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              {/* Cross-entity source indicator - hide when viewing in native context */}
                              {comment.source_type && comment.source_name && comment.source_type !== entityType && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-400">•</span>
                                  <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                                    comment.source_type === 'opportunity' ? 'bg-green-100 text-green-700' :
                                    comment.source_type === 'customer' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {comment.source_type === 'opportunity' && <Target className="h-3 w-3" />}
                                    {comment.source_type === 'customer' && <User className="h-3 w-3" />}
                                    <span>from {comment.source_name}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-700 mb-2">
                              {comment.content}
                            </p>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {comment.visible_to_partner && (
                                <div className="flex items-center gap-1">
                                  <span className="text-blue-600">shared with partner</span>
                                </div>
                              )}
                            </div>

                            {/* Hover Toolbar */}
                            <div className="absolute -top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                              <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-1.5 py-1 flex items-center gap-0.5">
                                {/* Checkmark Emoji */}
                                <button 
                                  onClick={() => handleReactionToggle('comment', comment.id, '✅')}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-[#E6E7F1] rounded-md transition-colors duration-150"
                                >
                                  <span className="text-lg">✅</span>
                                </button>
                                
                                {/* Thumbs Up Emoji */}
                                <button 
                                  onClick={() => handleReactionToggle('comment', comment.id, '👍')}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-[#E6E7F1] rounded-md transition-colors duration-150"
                                >
                                  <span className="text-lg">👍</span>
                                </button>
                                
                                {/* Star Emoji */}
                                <button 
                                  onClick={() => handleReactionToggle('comment', comment.id, '⭐')}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-[#E6E7F1] rounded-md transition-colors duration-150"
                                >
                                  <span className="text-lg">⭐</span>
                                </button>
                                
                                {/* Reply Icon */}
                                <button className="w-8 h-8 flex items-center justify-center hover:bg-[#E6E7F1] rounded-md transition-colors duration-150">
                                  <MessageSquare className="h-4 w-4 text-gray-600" />
                                </button>
                                
                                {/* Pin Icon */}
                                <button className="w-8 h-8 flex items-center justify-center hover:bg-[#E6E7F1] rounded-md transition-colors duration-150">
                                  <Bookmark className="h-4 w-4 text-gray-600" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Reactions Display */}
                            <ActivityReactions 
                              activityType="comment"
                              activityId={comment.id}
                              onReactionClick={(emoji: string) => handleReactionToggle('comment', comment.id, emoji)}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No comments yet</p>
                    <p className="text-xs text-gray-400 mt-1">Start a conversation below</p>
                  </div>
                )}
              </div>

              {/* Comment Creation Composer */}
              <TimelineComposer
                onCreateComment={(commentData: {
                  content: string;
                  visibleToPartner: boolean;
                }) => {
                  // Use existing comment creation logic
                  const originalType = selectedActivityType;
                  const originalContent = commentContent;
                  const originalVisibility = visibleToPartner;

                  // Set temporary values for comment creation
                  setSelectedActivityType('comment');
                  setCommentContent(commentData.content);
                  setVisibleToPartner(commentData.visibleToPartner);

                  // Create the comment
                  handleCreateActivity();
                  
                  // Reset to original values after a brief delay
                  setTimeout(() => {
                    setSelectedActivityType(originalType);
                    setCommentContent(originalContent);
                    setVisibleToPartner(originalVisibility);
                  }, 100);
                }}
                onCreateTask={() => {}} // Not used in comment tab
                teamMembers={teamMembers}
                isLoading={createActivityMutation.isPending}
                defaultMode="comment"
              />
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
            <div className="flex flex-col h-full">
              {/* Timeline Content */}
              <div ref={timelineScrollRef} className="flex-1 space-y-4 max-h-64 overflow-y-auto mb-4">
                {rawTimelineData && rawTimelineData.length > 0 ? (
                  rawTimelineData
                    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((item: any, index: number) => {
                      const isTask = item.activity_type === 'task';
                      const isComment = item.activity_type === 'comment';
                      const isAttachment = item.activity_type === 'attachment';

                      return (
                        <div key={`timeline-${item.activity_type}-${item.id}-${index}-${item.created_at.replace(/[^\w]/g, '')}`} className="flex items-start gap-3 relative group">
                          {/* Timeline line */}
                          {index < rawTimelineData.length - 1 && (
                            <div className="absolute left-4 top-10 w-px h-8 bg-gray-200"></div>
                          )}
                          {/* Avatar/Icon */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center relative z-10 bg-white border-2 border-gray-200">
                            {isTask && (
                              <CheckSquare className={`h-4 w-4 ${item.completed ? 'text-green-600' : 'text-gray-600'}`} />
                            )}
                            {isComment && (
                              <>
                                {getUserAvatarUrl(item.assigned_to) ? (
                                  <img 
                                    src={getUserAvatarUrl(item.assigned_to)!} 
                                    alt={getUserName(item.assigned_to)}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                                    {getUserInitials(item.assigned_to)}
                                  </div>
                                )}
                              </>
                            )}
                            {isAttachment && (
                              <Paperclip className="h-4 w-4 text-purple-600" />
                            )}
                            {!isTask && !isComment && !isAttachment && (
                              <Clock className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 relative">
                            <div className={`bg-white rounded-lg p-3 border transition-all duration-200 relative ${
                              isTask && item.completed 
                                ? 'border-green-200 bg-green-50/30' 
                                : 'border-gray-200 hover:bg-[#F5F6FA] hover:border-[#E6E7F1]'
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-sm font-medium ${
                                  isTask && item.completed ? 'text-gray-500' : 'text-gray-900'
                                }`}>
                                  {item.activity_type === 'comment' && item.assigned_to ? getUserName(item.assigned_to) : (item.activity_type || 'Activity')}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(item.created_at).toLocaleString([], { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                                {/* Cross-entity source indicator - hide when viewing in native context */}
                                {item.source_type && item.source_name && item.source_type !== entityType && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-400">•</span>
                                    <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                                      item.source_type === 'opportunity' ? 'bg-green-100 text-green-700' :
                                      item.source_type === 'customer' ? 'bg-blue-100 text-blue-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {item.source_type === 'opportunity' && <Target className="h-3 w-3" />}
                                      {item.source_type === 'customer' && <User className="h-3 w-3" />}
                                      <span>from {item.source_name}</span>
                                    </div>
                                  </div>
                                )}
                                {isTask && item.completed && (
                                  <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full">
                                    Completed
                                  </span>
                                )}
                              </div>
                              
                              <p className={`text-sm mb-2 ${
                                isTask && item.completed 
                                  ? 'text-gray-500 line-through' 
                                  : 'text-gray-700'
                              }`}>
                                {item.activity_type === 'comment' ? item.content : (item.title || item.content || item.description || 'No description available')}
                              </p>
                              
                              {item.details && (
                                <p className="text-xs text-gray-500 mb-2">{item.details}</p>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  {item.visible_to_partner && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-blue-600">shared with partner</span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Task badges for assignee and priority */}
                                {isTask && (item.assigned_to || item.priority) && (
                                  <div className="flex items-center gap-2">
                                    {item.assigned_to && (
                                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 text-gray-700 rounded-full text-xs font-medium">
                                        <User className="h-3 w-3" />
                                        <span>{getUserName(item.assigned_to)}</span>
                                      </div>
                                    )}
                                    {item.priority && (
                                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                        item.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                        item.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                        item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-700'
                                      }`}>
                                        <Flag className="h-3 w-3" />
                                        <span className="capitalize">{item.priority}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Hover Toolbar */}
                              <div className="absolute -top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                                <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-1.5 py-1 flex items-center gap-0.5">
                                  {/* Muscle Emoji */}
                                  <button 
                                    onClick={() => handleReactionToggle(item.activity_type, item.id, '💪')}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors duration-150"
                                  >
                                    <span className="text-lg">💪</span>
                                  </button>
                                  
                                  {/* Thumbs Up Emoji */}
                                  <button 
                                    onClick={() => handleReactionToggle(item.activity_type, item.id, '👍')}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors duration-150"
                                  >
                                    <span className="text-lg">👍</span>
                                  </button>
                                  
                                  {/* Boom Emoji */}
                                  <button 
                                    onClick={() => handleReactionToggle(item.activity_type, item.id, '💥')}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors duration-150"
                                  >
                                    <span className="text-lg">💥</span>
                                  </button>
                                  
                                  {/* Comments Icon */}
                                  <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors duration-150">
                                    <MessageSquare className="h-4 w-4 text-gray-600" />
                                  </button>
                                  
                                  {/* Pin Icon */}
                                  <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors duration-150">
                                    <Bookmark className="h-4 w-4 text-gray-600" />
                                  </button>
                                  
                                  {/* Task completion checkbox for tasks only - moved to last position */}
                                  {isTask && (
                                    <button 
                                      onClick={() => handleTaskCompletion(item.id)}
                                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors duration-150 relative group/tooltip"
                                      title="Mark task as complete"
                                    >
                                      <CheckSquare className="h-4 w-4 text-gray-600" />
                                      {/* Custom tooltip aligned from right */}
                                      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                        Mark task as complete
                                        <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                      </div>
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              {/* Reactions Display - ActivityReactions handles its own conditional rendering */}
                              <ActivityReactions 
                                activityType={item.activity_type}
                                activityId={item.id}
                                onReactionClick={(emoji: string) => handleReactionToggle(item.activity_type, item.id, emoji)}
                              />
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

              {/* Timeline Composer */}
              <TimelineComposer
                onCreateTask={(taskData: {
                  title: string;
                  priority: string;
                  assignedTo: string;
                  visibleToPartner: boolean;
                }) => {
                  // Use existing task creation logic
                  const originalType = selectedActivityType;
                  const originalTitle = taskTitle;
                  const originalPriority = taskPriority;
                  const originalAssignedTo = assignedTo;
                  const originalVisibility = visibleToPartner;

                  // Set temporary values for task creation
                  setSelectedActivityType('task');
                  setTaskTitle(taskData.title);
                  setTaskPriority(taskData.priority);
                  setAssignedTo(taskData.assignedTo);
                  setVisibleToPartner(taskData.visibleToPartner);

                  // Create the task
                  handleCreateActivity();
                  
                  // Reset to original values after a brief delay
                  setTimeout(() => {
                    setSelectedActivityType(originalType);
                    setTaskTitle(originalTitle);
                    setTaskPriority(originalPriority);
                    setAssignedTo(originalAssignedTo);
                    setVisibleToPartner(originalVisibility);
                  }, 100);
                }}
                onCreateComment={(commentData: {
                  content: string;
                  visibleToPartner: boolean;
                }) => {
                  // Create comment directly with proper activity type
                  createActivityMutation.mutate({
                    ...commentData,
                    activityType: 'comment'
                  });
                }}
                teamMembers={teamMembers}
                isLoading={createActivityMutation.isPending}
              />
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

          {/* Prepare a Meeting */}
          {selectedActivityType === 'meeting' && (
            <div className="space-y-4">
              {!meetingBriefing ? (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center gap-4">
                    <Brain className="h-12 w-12 text-orange-400" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">AI Meeting Preparation</h3>
                      <p className="text-sm text-gray-600 mb-4">Generate intelligent briefing with OKR analysis and opportunity insights</p>
                      <Button 
                        onClick={handlePrepareMeeting}
                        disabled={prepareMeetingMutation.isPending}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        {prepareMeetingMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4 mr-2" />
                            Prepare Meeting Briefing
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-orange-500" />
                      <h3 className="text-lg font-semibold text-gray-900">Meeting Briefing: {meetingBriefing.partner}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleSaveMeetingBriefing}
                        disabled={saveMeetingBriefingMutation.isPending}
                      >
                        {saveMeetingBriefingMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          'Save'
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handlePrepareMeeting}
                        disabled={prepareMeetingMutation.isPending}
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Create New Briefing
                      </Button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Executive Summary</h4>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {(() => {
                        const actualOkrCount = meetingBriefing.dataUsed?.okrs || 0;
                        const actualOpportunityCount = meetingBriefing.dataUsed?.opportunities || 0;
                        
                        // If no meaningful data, provide appropriate summary
                        if (actualOkrCount === 0 && actualOpportunityCount === 0) {
                          return `${meetingBriefing.partner} currently has limited data available. This would be a good opportunity to discuss setting up OKRs and exploring new business opportunities.`;
                        }
                        
                        const lines = meetingBriefing.briefing.split('\n');
                        // Look for summary paragraph (first substantial paragraph or line with "summary")
                        const summaryLine = lines.find((line: string) => 
                          (line.includes('summary') || line.includes('Summary')) && line.length > 20
                        ) || lines.find((line: string) => 
                          line.trim().length > 50 && !line.includes('**') && !line.startsWith('- ')
                        );
                        return summaryLine?.replace(/^-?\s*(summary:?)?/i, '').trim() || `Meeting preparation complete for ${meetingBriefing.partner} with ${actualOkrCount} OKR${actualOkrCount !== 1 ? 's' : ''} and ${actualOpportunityCount} opportunit${actualOpportunityCount !== 1 ? 'ies' : 'y'} to review.`;
                      })()}
                    </p>
                  </div>

                  {/* Content Sections */}
                  <div className="grid gap-6">
                    {/* Top 3 OKRs */}
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="h-5 w-5 text-green-500" />
                        <h4 className="font-semibold text-gray-900">Top 3 OKRs to Review</h4>
                      </div>
                      <div className="space-y-3">
                        {(() => {
                          const actualOkrCount = meetingBriefing.dataUsed?.okrs || 0;
                          
                          if (actualOkrCount === 0) {
                            return (
                              <div className="text-center py-6 text-gray-500">
                                <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">No OKRs available for this partner at the moment.</p>
                              </div>
                            );
                          }
                          
                          // Look for OKR section in the AI response
                          const lines = meetingBriefing.briefing.split('\n');
                          const okrSectionStart = lines.findIndex((line: string) => 
                            line.toLowerCase().includes('okr') && line.includes('**')
                          );
                          
                          if (okrSectionStart === -1) {
                            return (
                              <div className="text-center py-6 text-gray-500">
                                <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">No OKR insights generated.</p>
                              </div>
                            );
                          }
                          
                          // Extract bullet points from OKR section
                          const okrItems = lines.slice(okrSectionStart + 1)
                            .filter((line: string) => line.trim().startsWith('- '))
                            .slice(0, Math.min(actualOkrCount, 3));
                          
                          return okrItems.map((item: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-md">
                              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-gray-700">
                                {renderMarkdownText(item.replace('- ', ''))}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Top 3 Opportunity Types */}
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                        <h4 className="font-semibold text-gray-900">Top 3 Opportunity Types to Discuss</h4>
                      </div>
                      <div className="space-y-3">
                        {meetingBriefing.briefing.split('\n').filter((line: string) => 
                          line.trim().startsWith('- **') && line.includes('Zonnepanelen')
                        ).map((item: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-md">
                            <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-gray-700">
                              {renderMarkdownText(item.replace('- ', ''))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckSquare className="h-5 w-5 text-purple-500" />
                        <h4 className="font-semibold text-gray-900">Meeting Recommendations</h4>
                      </div>
                      <div className="space-y-2">
                        {(() => {
                          const lines = meetingBriefing.briefing.split('\n');
                          
                          // Find recommendations section and extract bullet points
                          const recommendationsStart = lines.findIndex((line: string) => 
                            line.toLowerCase().includes('recommendation') || 
                            line.toLowerCase().includes('meeting recommendation')
                          );
                          
                          if (recommendationsStart === -1) {
                            // Fallback: look for bullet points that don't contain ** (not OKRs/opportunities)
                            return lines.filter((line: string) => 
                              line.trim().startsWith('- ') && 
                              !line.includes('**') && 
                              line.length > 15 &&
                              !line.toLowerCase().includes('okr') &&
                              !line.toLowerCase().includes('opportunity')
                            ).slice(0, 3).map((item: string, index: number) => (
                              <div key={index} className="flex items-start gap-3 p-2">
                                <CheckSquare className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{renderMarkdownText(item.replace('- ', ''))}</span>
                              </div>
                            ));
                          }
                          
                          // Extract bullet points after recommendations header
                          const recommendationItems = lines.slice(recommendationsStart + 1)
                            .filter((line: string) => line.trim().startsWith('- '))
                            .slice(0, 3);
                            
                          return recommendationItems.map((item: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-2">
                              <CheckSquare className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{renderMarkdownText(item.replace('- ', ''))}</span>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>


                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}