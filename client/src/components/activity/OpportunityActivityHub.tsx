import { useState, useEffect } from 'react';
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

interface OpportunityActivityHubProps {
  opportunityId: number;
  opportunityTitle: string;
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

const activityTypes = [
  { value: 'timeline', label: 'Timeline', icon: Clock, color: '#6B7280' },
  { value: 'task', label: 'Task', icon: CheckSquare, color: '#10B981' },
  { value: 'comment', label: 'Comment', icon: MessageSquare, color: '#3B82F6' },
  { value: 'attachment', label: 'Attachment', icon: Paperclip, color: '#8B5CF6' },
  { value: 'actions', label: 'Actions', icon: Sparkles, color: '#F59E0B' },
  { value: 'meeting', label: 'Meeting', icon: Calendar, color: '#EF4444' }
];

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
  
  return date.toLocaleDateString();
};

const ActivityTypeButton = ({ type, isSelected, onClick, count = 0 }: {
  type: typeof activityTypes[0];
  isSelected: boolean;
  onClick: () => void;
  count?: number;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
      isSelected
        ? 'bg-[#E1E4FB] text-[#3E4DC4] shadow-sm'
        : 'text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]'
    }`}
  >
    <type.icon className="w-4 h-4" style={{ color: isSelected ? '#3E4DC4' : type.color }} />
    {type.label}
    {count > 0 && (
      <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
        {count}
      </Badge>
    )}
  </button>
);

export default function OpportunityActivityHub({ opportunityId, opportunityTitle }: OpportunityActivityHubProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedActivityType, setSelectedActivityType] = useState<'task' | 'comment' | 'attachment' | 'timeline' | 'actions' | 'meeting'>('timeline');
  const [highlightActions, setHighlightActions] = useState(false);
  const [showActivityInput, setShowActivityInput] = useState(false);

  // Activity input states
  const [newTask, setNewTask] = useState({ content: '', description: '', priority: 'medium', visible_to_partner: false });
  const [newComment, setNewComment] = useState({ content: '', visible_to_partner: false });
  const [newAttachment, setNewAttachment] = useState({ content: '', description: '', visible_to_partner: false });

  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Fetch activities for this opportunity
  const { data: activities = [], isLoading } = useQuery({
    queryKey: [`/api/degoudse/opportunities/${opportunityId}/activities`],
    enabled: !!opportunityId,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Filter activities by type
  const filteredActivities = selectedActivityType === 'timeline' 
    ? activities 
    : activities.filter((activity: ActivityItem) => activity.type === selectedActivityType);

  // Count activities by type
  const activityCounts = activityTypes.reduce((acc, type) => {
    acc[type.value] = type.value === 'timeline' 
      ? activities.length
      : activities.filter((activity: ActivityItem) => activity.type === type.value).length;
    return acc;
  }, {} as Record<string, number>);

  // Add activity mutation
  const addActivityMutation = useMutation({
    mutationFn: async (activityData: any) => {
      const response = await fetch(`/api/degoudse/opportunities/${opportunityId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData),
      });
      if (!response.ok) throw new Error('Failed to add activity');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/degoudse/opportunities/${opportunityId}/activities`] });
      setShowActivityInput(false);
      setNewTask({ content: '', description: '', priority: 'medium', visible_to_partner: false });
      setNewComment({ content: '', visible_to_partner: false });
      setNewAttachment({ content: '', description: '', visible_to_partner: false });
      toast({ title: 'Activity added successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to add activity', variant: 'destructive' });
    }
  });

  const handleAddActivity = () => {
    const baseData = {
      opportunity_id: opportunityId,
      user_id: 1, // Default user ID
      type: selectedActivityType
    };

    let activityData;
    switch (selectedActivityType) {
      case 'task':
        if (!newTask.content.trim()) return;
        activityData = { ...baseData, ...newTask };
        break;
      case 'comment':
        if (!newComment.content.trim()) return;
        activityData = { ...baseData, ...newComment };
        break;
      case 'attachment':
        if (!newAttachment.content.trim()) return;
        activityData = { ...baseData, ...newAttachment };
        break;
      default:
        return;
    }

    addActivityMutation.mutate(activityData);
  };

  const renderActivityInput = () => {
    if (!showActivityInput) return null;

    const commonProps = {
      className: "min-h-[80px] resize-none",
      placeholder: getPlaceholder()
    };

    function getPlaceholder() {
      switch (selectedActivityType) {
        case 'task': return 'Describe the task...';
        case 'comment': return 'Add a comment...';
        case 'attachment': return 'Attachment name or description...';
        default: return 'Add activity...';
      }
    }

    return (
      <div className="border border-[#E6E7F1] rounded-lg p-4 bg-white space-y-4">
        <div className="flex items-center gap-2 mb-3">
          {(() => {
            const type = activityTypes.find(t => t.value === selectedActivityType);
            return type ? <type.icon className="w-4 h-4" style={{ color: type.color }} /> : null;
          })()}
          <span className="font-medium text-gray-900">
            Add {activityTypes.find(t => t.value === selectedActivityType)?.label}
          </span>
        </div>

        {selectedActivityType === 'task' && (
          <>
            <Textarea
              value={newTask.content}
              onChange={(e) => setNewTask(prev => ({ ...prev, content: e.target.value }))}
              {...commonProps}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <Input
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Priority</label>
                <Select value={newTask.priority} onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newTask.visible_to_partner}
                onCheckedChange={(checked) => setNewTask(prev => ({ ...prev, visible_to_partner: checked }))}
              />
              <label className="text-sm text-gray-700">Visible to partner</label>
            </div>
          </>
        )}

        {selectedActivityType === 'comment' && (
          <>
            <Textarea
              value={newComment.content}
              onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
              {...commonProps}
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={newComment.visible_to_partner}
                onCheckedChange={(checked) => setNewComment(prev => ({ ...prev, visible_to_partner: checked }))}
              />
              <label className="text-sm text-gray-700">Visible to partner</label>
            </div>
          </>
        )}

        {selectedActivityType === 'attachment' && (
          <>
            <Input
              value={newAttachment.content}
              onChange={(e) => setNewAttachment(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Attachment name..."
            />
            <Input
              value={newAttachment.description}
              onChange={(e) => setNewAttachment(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description..."
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={newAttachment.visible_to_partner}
                onCheckedChange={(checked) => setNewAttachment(prev => ({ ...prev, visible_to_partner: checked }))}
              />
              <label className="text-sm text-gray-700">Visible to partner</label>
            </div>
          </>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" onClick={() => setShowActivityInput(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddActivity} disabled={addActivityMutation.isPending}>
            {addActivityMutation.isPending ? 'Adding...' : 'Add Activity'}
          </Button>
        </div>
      </div>
    );
  };

  const renderActivity = (activity: ActivityItem) => {
    const ActivityIcon = activityTypes.find(t => t.value === activity.type)?.icon || MessageSquare;
    const iconColor = activityTypes.find(t => t.value === activity.type)?.color || '#6B7280';

    return (
      <div key={activity.id} className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="flex-shrink-0">
          <ActivityIcon className="w-4 h-4 mt-0.5" style={{ color: iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">{activity.content}</span>
            {activity.visible_to_partner ? (
              <Eye className="w-3 h-3 text-blue-500" title="Visible to partner" />
            ) : (
              <EyeOff className="w-3 h-3 text-gray-400" title="Internal only" />
            )}
            {activity.priority && (
              <Badge 
                variant={activity.priority === 'high' ? 'destructive' : activity.priority === 'medium' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {activity.priority}
              </Badge>
            )}
          </div>
          {activity.description && (
            <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <img src={userAvatar} alt="User" className="w-4 h-4 rounded-full" />
            <span>{formatDateTime(activity.created_at)}</span>
          </div>
        </div>
        {activity.type === 'task' && (
          <div className="flex-shrink-0">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {activity.completed ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <div className="w-3 h-3 border border-gray-300 rounded-sm" />
              )}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#E6E7F1] rounded-lg mx-4 sm:mx-6 lg:mx-8 mb-6">
      <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
                <Brain className="w-5 h-5 text-[#5567E5]" />
                <h3 className="text-lg font-semibold text-gray-900">Activity Hub</h3>
              </div>
              <Badge variant="secondary" className="bg-[#F0F9FF] text-[#0369A1]">
                {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {highlightActions && (
                <div className="animate-pulse">
                  <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                </div>
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            {/* Activity Type Selector */}
            <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-3">
              {filteredActivityTypes.map((type) => (
                <ActivityTypeButton
                  key={type.value}
                  type={type}
                  isSelected={selectedActivityType === type.value}
                  onClick={() => setSelectedActivityType(type.value as any)}
                  count={activityCounts[type.value]}
                />
              ))}
            </div>

            {/* Add Activity Button */}
            {!isBrokerView && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowActivityInput(!showActivityInput)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add {activityTypes.find(t => t.value === selectedActivityType)?.label}
                </Button>
              </div>
            )}

            {/* Activity Input Form */}
            {renderActivityInput()}

            {/* Activities List */}
            <div className="space-y-1">
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">Loading activities...</div>
              ) : filteredActivities.length > 0 ? (
                filteredActivities.map(renderActivity)
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No {selectedActivityType === 'timeline' ? 'activities' : `${selectedActivityType}s`} yet</p>
                  <p className="text-sm">Start tracking opportunity progress here</p>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}