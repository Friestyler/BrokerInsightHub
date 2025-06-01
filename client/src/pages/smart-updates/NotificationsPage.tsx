import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Clock, 
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  Settings,
  Target,
  Send,
  Database,
  Activity
} from 'lucide-react';

interface NotificationSetting {
  id: string;
  module: string;
  type: string;
  name: string;
  description: string;
  enabled: boolean;
  frequency: string;
  channels: string[];
  icon: React.ReactNode;
  priority: 'low' | 'medium' | 'high';
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sample notification settings data
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: '1',
      module: 'Partners',
      type: 'activity',
      name: 'Partner Activity Updates',
      description: 'Get notified when partners complete key activities',
      enabled: true,
      frequency: 'real-time',
      channels: ['email', 'in-app'],
      icon: <Users className="h-4 w-4" />,
      priority: 'medium'
    },
    {
      id: '2',
      module: 'OKR Metrics',
      type: 'progress',
      name: 'OKR Progress Alerts',
      description: 'Alerts when OKR metrics approach deadlines or targets',
      enabled: true,
      frequency: 'daily',
      channels: ['email', 'in-app', 'slack'],
      icon: <Target className="h-4 w-4" />,
      priority: 'high'
    },
    {
      id: '3',
      module: 'Opportunities',
      type: 'status',
      name: 'Opportunity Status Changes',
      description: 'Track changes in opportunity pipeline and status',
      enabled: false,
      frequency: 'weekly',
      channels: ['email'],
      icon: <TrendingUp className="h-4 w-4" />,
      priority: 'medium'
    },
    {
      id: '4',
      module: 'Campaigns',
      type: 'performance',
      name: 'Campaign Performance',
      description: 'Performance reports and optimization suggestions',
      enabled: true,
      frequency: 'weekly',
      channels: ['email', 'in-app'],
      icon: <Send className="h-4 w-4" />,
      priority: 'low'
    },
    {
      id: '5',
      module: 'Data',
      type: 'quality',
      name: 'Data Quality Alerts',
      description: 'Notifications about data inconsistencies or issues',
      enabled: true,
      frequency: 'real-time',
      channels: ['in-app', 'slack'],
      icon: <Database className="h-4 w-4" />,
      priority: 'high'
    },
    {
      id: '6',
      module: 'Activity Hub',
      type: 'mentions',
      name: 'Mentions & Comments',
      description: 'When you are mentioned or receive comments',
      enabled: true,
      frequency: 'real-time',
      channels: ['email', 'in-app'],
      icon: <MessageSquare className="h-4 w-4" />,
      priority: 'high'
    }
  ]);

  const toggleNotification = (id: string) => {
    setNotificationSettings(prev => 
      prev.map(setting => 
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const updateFrequency = (id: string, frequency: string) => {
    setNotificationSettings(prev => 
      prev.map(setting => 
        setting.id === id ? { ...setting, frequency } : setting
      )
    );
  };

  const getModuleColor = (module: string) => {
    const colors = {
      'Partners': 'bg-blue-50 text-blue-700 border-blue-200',
      'OKR Metrics': 'bg-purple-50 text-purple-700 border-purple-200',
      'Opportunities': 'bg-green-50 text-green-700 border-green-200',
      'Campaigns': 'bg-orange-50 text-orange-700 border-orange-200',
      'Data': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Activity Hub': 'bg-pink-50 text-pink-700 border-pink-200'
    };
    return colors[module as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const enabledNotifications = notificationSettings.filter(setting => setting.enabled);
  const highPriorityNotifications = notificationSettings.filter(setting => setting.priority === 'high');

  return (
    <div className="container mx-auto px-6 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">Notification Center</h1>
        <p className="text-gray-600">Orchestrate notifications and reminders across all your modules</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Notifications</p>
                    <p className="text-2xl font-medium">{enabledNotifications.length}</p>
                  </div>
                  <Bell className="h-8 w-8 text-indigo-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">High Priority</p>
                    <p className="text-2xl font-medium">{highPriorityNotifications.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Modules</p>
                    <p className="text-2xl font-medium">6</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Channels</p>
                    <p className="text-2xl font-medium">3</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start justify-between p-3 bg-blue-50 rounded-md">
                  <div className="flex items-start gap-3">
                    <Target className="h-4 w-4 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium">OKR Progress Alert</p>
                      <p className="text-xs text-gray-600">Partner Growth metric is 85% complete - 2 hours ago</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">High</Badge>
                </div>
                
                <div className="flex items-start justify-between p-3 bg-green-50 rounded-md">
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-green-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Partner Activity</p>
                      <p className="text-xs text-gray-600">New partner onboarding completed - 4 hours ago</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Medium</Badge>
                </div>
                
                <div className="flex items-start justify-between p-3 bg-orange-50 rounded-md">
                  <div className="flex items-start gap-3">
                    <Send className="h-4 w-4 text-orange-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Campaign Performance</p>
                      <p className="text-xs text-gray-600">Weekly summary report ready - 1 day ago</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-200">Low</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings by Module</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {setting.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{setting.name}</h3>
                        <Badge variant="outline" className={getModuleColor(setting.module)}>
                          {setting.module}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={
                            setting.priority === 'high' ? "text-red-600 bg-red-50 border-red-200" :
                            setting.priority === 'medium' ? "text-amber-600 bg-amber-50 border-amber-200" :
                            "text-green-600 bg-green-50 border-green-200"
                          }
                        >
                          {setting.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{setting.description}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">Frequency:</Label>
                          <Select 
                            value={setting.frequency} 
                            onValueChange={(value) => updateFrequency(setting.id, value)}
                            disabled={!setting.enabled}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="real-time">Real-time</SelectItem>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">Channels:</Label>
                          <div className="flex gap-1">
                            {setting.channels.map((channel) => (
                              <Badge key={channel} variant="secondary" className="text-xs">
                                {channel}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Switch 
                    checked={setting.enabled}
                    onCheckedChange={() => toggleNotification(setting.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-digest">Daily Digest</Label>
                  <Switch id="email-digest" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-instant">Instant Alerts</Label>
                  <Switch id="email-instant" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  In-App Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="app-sound">Sound Alerts</Label>
                  <Switch id="app-sound" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="app-desktop">Desktop Notifications</Label>
                  <Switch id="app-desktop" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="app-badge">Badge Counts</Label>
                  <Switch id="app-badge" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Slack Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  Connect Slack Workspace
                </Button>
                <div className="space-y-2">
                  <Label htmlFor="slack-channel">Default Channel</Label>
                  <Input id="slack-channel" placeholder="#notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="slack-dm">Direct Messages</Label>
                  <Switch id="slack-dm" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Notification Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Quiet Hours</h3>
                  <div className="space-y-2">
                    <Label>From</Label>
                    <Input type="time" defaultValue="22:00" />
                  </div>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Input type="time" defaultValue="08:00" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Enable Quiet Hours</Label>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Weekly Schedule</h3>
                  <div className="space-y-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div key={day} className="flex items-center justify-between">
                        <Label>{day}</Label>
                        <Switch defaultChecked={!['Saturday', 'Sunday'].includes(day)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium">Digest Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Daily Digest Time</Label>
                    <Input type="time" defaultValue="09:00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Weekly Digest Day</Label>
                    <Select defaultValue="monday">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button>Save All Changes</Button>
      </div>
    </div>
  );
}