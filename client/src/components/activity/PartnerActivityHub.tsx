import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
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
import userAvatar from "@/assets/user-avatar.png";

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
}

const TimelineComposer = ({ onCreateTask, onCreateComment, teamMembers, isLoading }: TimelineComposerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMode, setActiveMode] = useState<'task' | 'comment'>('comment');
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
              {/* Comment Icon (Always visible) */}
              <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                <MessageSquare className="h-4 w-4" />
              </div>

              {/* Input Area */}
              <button
                onClick={() => setIsExpanded(true)}
                className="flex-1 text-left px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                Add a note or task...
              </button>

              {/* Right Actions */}
              <div className="flex items-center gap-1 pr-1">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <button 
                  onClick={() => {
                    setActiveMode('task');
                    setIsExpanded(true);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-100 transition-all duration-200"
                >
                  <CheckSquare className="h-4 w-4" />
                </button>
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
      {/* Modern Expanded Composer */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-100/50 overflow-hidden">
        <div className="p-4 space-y-4">
          {/* Input Field */}
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
              className="w-full min-h-[80px] resize-none border border-gray-200 bg-gray-50 text-gray-900 rounded-xl p-4 text-sm transition-all duration-200 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-500"
              autoFocus
            />
          </div>

          {/* Task-specific Controls */}
          {activeMode === 'task' && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              {/* Priority Selector */}
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-32 h-9 text-sm bg-white border border-[#E6E7F1] rounded-lg hover:border-[#D6D7E4] transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="urgent">🔴 Urgent</SelectItem>
                </SelectContent>
              </Select>

              {/* Assignee Selector */}
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger className="w-40 h-9 text-sm bg-white border border-[#E6E7F1] rounded-lg hover:border-[#D6D7E4] transition-colors">
                  <SelectValue placeholder="Assign to..." />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="ai-agent" disabled>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Bot className="h-4 w-4" />
                      <span>AI Agent (coming later)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            {/* Visibility Toggle */}
            <div className="flex items-center gap-3">
              <Switch
                checked={visibleToPartner}
                onCheckedChange={setVisibleToPartner}
                className="data-[state=checked]:bg-blue-500"
              />
              <span className="text-sm text-gray-600 flex items-center gap-2">
                {visibleToPartner ? <Eye className="h-4 w-4 text-blue-500" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                Visible to partner
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCancel} 
                className="px-4 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isLoading || !content.trim()}
                className={`px-6 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeMode === 'task' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {activeMode === 'task' ? 'Add Task' : 'Add Comment'}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PartnerActivityHub({ partnerId, partnerName, entityType = 'partner', entityId }: PartnerActivityHubProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedActivityType, setSelectedActivityType] = useState<'task' | 'comment' | 'attachment' | 'timeline' | 'actions' | 'meeting'>('timeline');
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
      setSelectedActivityType('timeline');
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
  const teamMembers = usersData ? usersData.map((user: any) => ({
    id: user.id.toString(),
    name: user.name,
    role: user.role,
    initials: user.initials
  })) : [];

  // Helper function to get user name from database
  const getUserName = (userId: number): string => {
    if (!userId) return 'Unknown User';
    const user = usersData?.find((u: any) => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  // Helper function to get user initials for avatar fallback
  const getUserInitials = (userId: number): string => {
    const user = usersData?.find((u: any) => u.id === userId);
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

  // Fetch next best actions
  const { data: nextActions } = useQuery({
    queryKey: [`/api/${currentEnv}/partners/${partnerId}/next-actions`],
    enabled: selectedActivityType === 'actions'
  });

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
      
      // Force timeline query refresh
      queryClient.invalidateQueries({ 
        queryKey: [`/api/${currentEnv}/partners/${partnerId}/timeline`],
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

  // Auto-scroll to bottom when timeline opens or new data arrives
  useLayoutEffect(() => {
    const timelineData = (timeline as any) || [];
    if (selectedActivityType === 'timeline' && timelineScrollRef.current && timelineData.length > 0) {
      const scrollContainer = timelineScrollRef.current;
      // Force scroll to bottom after layout is complete
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [selectedActivityType, timeline]);

  // Additional scroll trigger after renders complete
  useEffect(() => {
    const timelineData = (timeline as any) || [];
    if (selectedActivityType === 'timeline' && timelineScrollRef.current && timelineData.length > 0) {
      // Delayed scroll to ensure all async content is rendered
      setTimeout(() => {
        if (timelineScrollRef.current) {
          timelineScrollRef.current.scrollTop = timelineScrollRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [selectedActivityType, timeline]);

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
            <>
              {!showActivityInput ? (
                <button
                  onClick={() => setShowActivityInput(true)}
                  className="flex items-center gap-3 w-full text-left p-3 rounded-lg border border-[#E6E7F1] hover:border-[#D6D7E4] hover:bg-gray-50 transition-colors"
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
                  .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map((task: any) => (
                  <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                    <button
                      onClick={() => toggleTaskMutation.mutate({ taskId: task.id, completed: !task.completed })}
                      className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${
                        task.completed 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-[#E6E7F1] hover:border-green-400'
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
                  .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map((comment: any, index: number) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      comment.is_okr_comment ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      {comment.user_id === 2 ? (
                        <img 
                          src={userAvatar} 
                          alt="User Avatar" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className={`text-xs font-medium ${
                          comment.is_okr_comment ? 'text-purple-600' : 'text-blue-600'
                        }`}>
                          {comment.author_name ? comment.author_name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      )}
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
                          {new Date(comment.created_at).toLocaleString([], { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-400" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12h4l3-8 4 16 3-8h4"></path>
                    </svg>
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
                        <div key={`timeline-${item.activity_type}-${item.id}-${index}-${item.created_at.replace(/[^\w]/g, '')}`} className="flex items-start gap-3 relative">
                          {/* Timeline line */}
                          {index < rawTimelineData.length - 1 && (
                            <div className="absolute left-4 top-10 w-px h-8 bg-gray-200"></div>
                          )}
                          
                          {/* Avatar/Icon */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center relative z-10 bg-white border-2 border-gray-200">
                            {isTask && (
                              <CheckSquare className="h-4 w-4 text-green-600" />
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
                          
                          <div className="flex-1 min-w-0">
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900">
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
                              </div>
                              
                              <p className="text-sm text-gray-700 mb-2">
                                {item.activity_type === 'comment' ? item.content : (item.title || item.content || item.description || 'No description available')}
                              </p>
                              
                              {item.details && (
                                <p className="text-xs text-gray-500 mb-2">{item.details}</p>
                              )}
                              
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                {item.visible_to_partner && (
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-3 w-3 text-blue-500" />
                                    <span className="text-blue-600">shared with partner</span>
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
                          const okrSectionStart = lines.findIndex(line => 
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
                          const recommendationsStart = lines.findIndex(line => 
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