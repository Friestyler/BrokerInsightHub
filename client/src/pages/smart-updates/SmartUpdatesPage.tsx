import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus,
  Target,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Play,
  Pause,
  Edit,
  Trash2,
  Settings,
  Activity,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface SmartUpdate {
  id: string;
  name: string;
  description: string;
  okrMetric: string;
  trigger: {
    condition: string;
    threshold: number;
    operator: string;
  };
  actions: {
    type: string;
    target: string;
    message?: string;
  }[];
  status: 'active' | 'paused' | 'draft';
  lastTriggered?: string;
  triggerCount: number;
  createdAt: string;
}

export default function SmartUpdatesPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Sample smart updates data
  const [smartUpdates, setSmartUpdates] = useState<SmartUpdate[]>([
    {
      id: '1',
      name: 'Partner Growth Alert',
      description: 'Notify stakeholders when partner acquisition exceeds targets',
      okrMetric: 'Partner Portfolio Growth',
      trigger: {
        condition: 'exceeds_target',
        threshold: 90,
        operator: 'greater_than'
      },
      actions: [
        {
          type: 'notification',
          target: 'stakeholders',
          message: 'Partner growth target exceeded! Great progress on Q2 objectives.'
        },
        {
          type: 'update_status',
          target: 'dashboard'
        }
      ],
      status: 'active',
      lastTriggered: '2024-05-30T14:30:00Z',
      triggerCount: 3,
      createdAt: '2024-05-01T09:00:00Z'
    },
    {
      id: '2',
      name: 'Revenue Milestone Celebration',
      description: 'Celebrate and communicate when revenue metrics hit key milestones',
      okrMetric: 'Revenue Growth',
      trigger: {
        condition: 'milestone_reached',
        threshold: 75,
        operator: 'equals'
      },
      actions: [
        {
          type: 'send_message',
          target: 'team_slack',
          message: 'Amazing work team! We\'ve hit 75% of our revenue target ahead of schedule! 🎉'
        },
        {
          type: 'create_activity',
          target: 'activity_hub'
        }
      ],
      status: 'active',
      lastTriggered: '2024-05-28T16:45:00Z',
      triggerCount: 1,
      createdAt: '2024-04-15T10:30:00Z'
    },
    {
      id: '3',
      name: 'Performance Risk Alert',
      description: 'Early warning system for underperforming metrics',
      okrMetric: 'Customer Satisfaction',
      trigger: {
        condition: 'behind_schedule',
        threshold: 50,
        operator: 'less_than'
      },
      actions: [
        {
          type: 'escalate',
          target: 'management',
          message: 'Customer satisfaction metric requires immediate attention'
        },
        {
          type: 'schedule_meeting',
          target: 'responsible_team'
        }
      ],
      status: 'paused',
      triggerCount: 0,
      createdAt: '2024-05-10T14:20:00Z'
    },
    {
      id: '4',
      name: 'Campaign Optimization Trigger',
      description: 'Auto-adjust campaigns based on OKR performance',
      okrMetric: 'Lead Generation',
      trigger: {
        condition: 'trend_analysis',
        threshold: 80,
        operator: 'trending_down'
      },
      actions: [
        {
          type: 'adjust_campaign',
          target: 'active_campaigns'
        },
        {
          type: 'notification',
          target: 'marketing_team',
          message: 'Lead generation trending down - campaign adjustments recommended'
        }
      ],
      status: 'draft',
      triggerCount: 0,
      createdAt: '2024-05-25T11:15:00Z'
    }
  ]);

  const toggleUpdateStatus = (id: string) => {
    setSmartUpdates(prev => 
      prev.map(update => 
        update.id === id 
          ? { ...update, status: update.status === 'active' ? 'paused' : 'active' }
          : update
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'paused': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'draft': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'draft': return <Edit className="h-4 w-4 text-gray-600" />;
      default: return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const activeUpdates = smartUpdates.filter(update => update.status === 'active');
  const totalTriggers = smartUpdates.reduce((sum, update) => sum + update.triggerCount, 0);

  return (
    <div className="container mx-auto px-6 py-6 max-w-7xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">Smart Updates</h1>
          <p className="text-gray-600">Automated updates orchestrated by OKR metric performance</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Smart Update
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Smart Update</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="update-name">Update Name</Label>
                  <Input id="update-name" placeholder="e.g., Partner Growth Alert" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="okr-metric">OKR Metric</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="partner-growth">Partner Portfolio Growth</SelectItem>
                      <SelectItem value="revenue-growth">Revenue Growth</SelectItem>
                      <SelectItem value="customer-satisfaction">Customer Satisfaction</SelectItem>
                      <SelectItem value="lead-generation">Lead Generation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe what this smart update does..." />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="condition">Trigger Condition</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exceeds_target">Exceeds Target</SelectItem>
                      <SelectItem value="behind_schedule">Behind Schedule</SelectItem>
                      <SelectItem value="milestone_reached">Milestone Reached</SelectItem>
                      <SelectItem value="trend_analysis">Trend Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operator">Operator</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="greater_than">Greater Than</SelectItem>
                      <SelectItem value="less_than">Less Than</SelectItem>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="trending_up">Trending Up</SelectItem>
                      <SelectItem value="trending_down">Trending Down</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threshold">Threshold (%)</Label>
                  <Input id="threshold" type="number" placeholder="85" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  Create Smart Update
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="updates">Smart Updates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Updates</p>
                    <p className="text-2xl font-medium">{activeUpdates.length}</p>
                  </div>
                  <Zap className="h-8 w-8 text-indigo-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Triggers</p>
                    <p className="text-2xl font-medium">{totalTriggers}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Connected Metrics</p>
                    <p className="text-2xl font-medium">4</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-medium">94%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Trigger Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start justify-between p-3 bg-green-50 rounded-md">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Partner Growth Alert Triggered</p>
                      <p className="text-xs text-gray-600">Stakeholders notified of 95% target achievement - 2 hours ago</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Success</Badge>
                </div>
                
                <div className="flex items-start justify-between p-3 bg-blue-50 rounded-md">
                  <div className="flex items-start gap-3">
                    <Zap className="h-4 w-4 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Revenue Milestone Reached</p>
                      <p className="text-xs text-gray-600">Team Slack message sent for 75% milestone - 1 day ago</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">Executed</Badge>
                </div>
                
                <div className="flex items-start justify-between p-3 bg-yellow-50 rounded-md">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Performance Risk Alert Paused</p>
                      <p className="text-xs text-gray-600">Update paused pending metric review - 3 days ago</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200">Paused</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates" className="space-y-6">
          <div className="grid gap-4">
            {smartUpdates.map((update) => (
              <Card key={update.id} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium">{update.name}</h3>
                        <Badge variant="outline" className={getStatusColor(update.status)}>
                          {getStatusIcon(update.status)}
                          <span className="ml-1 capitalize">{update.status}</span>
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          <Target className="h-3 w-3 mr-1" />
                          {update.okrMetric}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{update.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Trigger Condition</Label>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="capitalize">{update.trigger.condition.replace('_', ' ')}</span>
                            <span>{update.trigger.operator.replace('_', ' ')}</span>
                            <span className="font-medium">{update.trigger.threshold}%</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Actions ({update.actions.length})</Label>
                          <div className="flex flex-wrap gap-1">
                            {update.actions.map((action, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {action.type.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span>Triggers: {update.triggerCount}</span>
                          {update.lastTriggered && (
                            <span>Last: {new Date(update.lastTriggered).toLocaleDateString()}</span>
                          )}
                          <span>Created: {new Date(update.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleUpdateStatus(update.id)}
                          >
                            {update.status === 'active' ? (
                              <>
                                <Pause className="h-4 w-4 mr-1" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trigger Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Successful Triggers</span>
                    <span className="font-medium">94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Failed Triggers</span>
                    <span className="font-medium">6%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '6%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Active Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {smartUpdates
                    .sort((a, b) => b.triggerCount - a.triggerCount)
                    .slice(0, 3)
                    .map((update) => (
                      <div key={update.id} className="flex justify-between items-center">
                        <span className="text-sm truncate flex-1">{update.name}</span>
                        <Badge variant="outline">{update.triggerCount} triggers</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Trigger Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Analytics dashboard will show trigger patterns and performance metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}