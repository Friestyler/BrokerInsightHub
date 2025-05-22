import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Calendar, 
  BarChart4 
} from 'lucide-react';

interface TaskMetricsProps {
  timeFrame: string;
  region: string;
}

interface Task {
  id: number;
  name: string;
  type: 'milestone' | 'activity' | 'task';
  status: 'open' | 'in_progress' | 'completed' | 'overdue';
  dueDate: string;
  assignee: string;
  plan: string;
  planTag: string;
  planColor: string;
  partner: string;
  progress: number;
  completion?: string;
  priority: 'low' | 'medium' | 'high';
}

const TaskMetrics: React.FC<TaskMetricsProps> = ({ timeFrame, region }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Sample data for tasks
  const tasks: Task[] = [
    {
      id: 1,
      name: 'Kwaliteitsgesprekken met top-intermediairs',
      type: 'milestone',
      status: 'open',
      dueDate: '2025-06-30',
      assignee: 'Jan Vermeer',
      plan: 'Intern Actieplan',
      planTag: 'IA',
      planColor: 'bg-green-500',
      partner: 'Multiple Partners',
      progress: 0,
      completion: '0 / 8 completed',
      priority: 'high'
    },
    {
      id: 2,
      name: 'Openstaande offertes - aanvragen bespreken',
      type: 'activity',
      status: 'in_progress',
      dueDate: '2025-05-31',
      assignee: 'Sarah Johnson',
      plan: 'Intern Actieplan',
      planTag: 'IA',
      planColor: 'bg-green-500',
      partner: 'Multiple Partners',
      progress: 5,
      completion: '5 / 96 completed',
      priority: 'high'
    },
    {
      id: 3,
      name: 'Product training',
      type: 'activity',
      status: 'in_progress',
      dueDate: '2025-05-25',
      assignee: 'Thomas De Vries',
      plan: 'Excellent Agent Plan',
      planTag: 'EA',
      planColor: 'bg-blue-500',
      partner: 'Else',
      progress: 67,
      completion: '2 / 3 completed',
      priority: 'medium'
    },
    {
      id: 4,
      name: 'Commercial Action',
      type: 'task',
      status: 'open',
      dueDate: '2025-05-28',
      assignee: 'Laura Martens',
      plan: 'Excellent Agent Plan',
      planTag: 'EA',
      planColor: 'bg-blue-500',
      partner: 'Evergem',
      progress: 0,
      completion: '0 / 12 completed',
      priority: 'medium'
    },
    {
      id: 5,
      name: 'Quarterly visit',
      type: 'task',
      status: 'overdue',
      dueDate: '2025-04-30',
      assignee: 'Michael Brown',
      plan: 'Excellent Agent Plan',
      planTag: 'EA',
      planColor: 'bg-blue-500',
      partner: 'Antwerpen',
      progress: 0,
      completion: '0 / 1 completed',
      priority: 'high'
    },
    {
      id: 6,
      name: 'Yearly review with regional sales manager',
      type: 'milestone',
      status: 'open',
      dueDate: '2025-07-15',
      assignee: 'Sophie Dupont',
      plan: 'Performance Plan',
      planTag: 'P',
      planColor: 'bg-purple-500',
      partner: 'Gent',
      progress: 0,
      completion: '0 / 7 completed',
      priority: 'low'
    },
    {
      id: 7,
      name: 'Send monthly newsletter on product updates',
      type: 'activity',
      status: 'in_progress',
      dueDate: '2025-05-31',
      assignee: 'Emma Williams',
      plan: 'Digital Engagement',
      planTag: 'DE',
      planColor: 'bg-orange-500',
      partner: 'All Partners',
      progress: 50,
      completion: '4 / 8 completed',
      priority: 'medium'
    }
  ];

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesType = typeFilter === 'all' || task.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesStatus && matchesType && matchesPriority;
  });

  // Calculate statistics
  const totalTasks = tasks.length;
  const overdueTasks = tasks.filter(task => task.status === 'overdue').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const openTasks = tasks.filter(task => task.status === 'open' || task.status === 'in_progress').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get task status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'open': return 'bg-gray-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  // Get task status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'open':
        return <Badge className="bg-gray-500">Open</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500">Overdue</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="border-red-500 text-red-500">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="border-green-500 text-green-500">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTasks}</div>
            <div className="mt-1 flex items-center">
              <Clock className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-sm text-muted-foreground">Requires attention</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueTasks}</div>
            <div className="mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-sm text-muted-foreground">Past due date</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assigned Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(tasks.map(t => t.assignee)).size}</div>
            <div className="mt-1 flex items-center">
              <Users className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-sm text-muted-foreground">Active team members</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="milestone">Milestone</SelectItem>
            <SelectItem value="activity">Activity</SelectItem>
            <SelectItem value="task">Task</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task List */}
      <div className="border rounded-md">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 bg-gray-100 rounded-t-md text-sm font-medium">
          <div>Task</div>
          <div>Plan</div>
          <div>Status</div>
          <div>Due Date</div>
          <div>Assignee</div>
          <div>Progress</div>
        </div>

        {filteredTasks.map(task => (
          <div key={task.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 border-t">
            <div className="flex items-center">
              <div className="flex flex-col">
                <div className="font-medium">{task.name}</div>
                <div className="text-sm text-gray-500">{task.partner}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full ${task.planColor} text-white flex items-center justify-center text-xs font-bold mr-2`}>
                {task.planTag}
              </div>
              <span className="text-sm truncate">{task.plan}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusBadge(task.status)}
              {getPriorityBadge(task.priority)}
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-sm">{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
            
            <div className="text-sm">{task.assignee}</div>
            
            <div className="flex flex-col">
              <div className="text-sm mb-1">{task.completion}</div>
              <Progress 
                value={task.progress} 
                className="h-2"
              />
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No tasks found matching your filter criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskMetrics;