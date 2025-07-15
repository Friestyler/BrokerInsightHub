import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Send, Calendar, Clock, ChevronDown, Pause, Square } from "lucide-react";

interface SendScheduleButtonProps {
  onSendNow: () => void;
  onScheduleSend: (scheduledTime: string) => void;
  onPause?: () => void;
  onStop?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  hasRecipients?: boolean;
  variant?: 'single' | 'bulk';
  size?: 'sm' | 'default';
  campaignStatus?: string;
}

export default function SendScheduleButton({
  onSendNow,
  onScheduleSend,
  onPause,
  onStop,
  disabled = false,
  isLoading = false,
  hasRecipients = true,
  variant = 'single',
  size = 'default',
  campaignStatus = 'draft'
}: SendScheduleButtonProps) {
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');

  const handleScheduleSend = () => {
    if (scheduledDateTime) {
      onScheduleSend(scheduledDateTime);
      setShowScheduleDialog(false);
      setScheduledDateTime('');
    }
  };

  const getQuickScheduleOptions = () => {
    const now = new Date();
    const options = [];
    
    // Tomorrow at 9 AM
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    // Next Monday at 9 AM
    const nextMonday = new Date(now);
    const daysUntilMonday = (1 + 7 - now.getDay()) % 7 || 7;
    nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
    nextMonday.setHours(9, 0, 0, 0);
    
    // In 2 hours
    const in2Hours = new Date(now);
    in2Hours.setHours(in2Hours.getHours() + 2);
    
    return [
      {
        label: 'In 2 hours',
        value: in2Hours.toISOString().slice(0, 16),
        icon: Clock
      },
      {
        label: 'Tomorrow 9 AM',
        value: tomorrow.toISOString().slice(0, 16),
        icon: Calendar
      },
      {
        label: 'Next Monday 9 AM',
        value: nextMonday.toISOString().slice(0, 16),
        icon: Calendar
      }
    ];
  };

  const quickOptions = getQuickScheduleOptions();

  const buttonClasses = size === 'sm' 
    ? "h-6 px-2 text-xs" 
    : "h-8 px-3 text-sm";

  const iconClasses = size === 'sm' ? "h-3 w-3" : "h-4 w-4";

  if (variant === 'single') {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size={size}
              className={`${buttonClasses} bg-green-600 hover:bg-green-700 text-white ${disabled ? 'opacity-50' : ''}`}
              disabled={disabled || isLoading || !hasRecipients}
            >
              <Send className={`${iconClasses} mr-1`} />
              {isLoading ? 'Sending...' : 'Send'}
              <ChevronDown className={`${iconClasses} ml-1`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onSendNow}>
              <Send className="h-4 w-4 mr-2" />
              Send now
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowScheduleDialog(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule to send
            </DropdownMenuItem>
            {onPause && (
              <DropdownMenuItem onClick={onPause}>
                <Pause className="h-4 w-4 mr-2" />
                Pause campaign
              </DropdownMenuItem>
            )}
            {onStop && (
              <DropdownMenuItem onClick={onStop}>
                <Square className="h-4 w-4 mr-2" />
                Stop campaign
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="datetime">When do you want to send this email?</Label>
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Quick options</Label>
                <div className="grid grid-cols-1 gap-2">
                  {quickOptions.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setScheduledDateTime(option.value)}
                      className="justify-start"
                    >
                      <option.icon className="h-4 w-4 mr-2" />
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleScheduleSend}
                  disabled={!scheduledDateTime}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Bulk variant for "Send All" functionality - same integrated design as single
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size={size}
            className={`${buttonClasses} bg-green-600 hover:bg-green-700 text-white ${disabled ? 'opacity-50' : ''}`}
            disabled={disabled || isLoading || !hasRecipients}
          >
            <Send className={`${iconClasses} mr-1`} />
            {isLoading ? 'Sending...' : 'Send all'}
            <ChevronDown className={`${iconClasses} ml-1`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onSendNow}>
            <Send className="h-4 w-4 mr-2" />
            Send now
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowScheduleDialog(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule to send
          </DropdownMenuItem>
          {onPause && (
            <DropdownMenuItem onClick={onPause}>
              <Pause className="h-4 w-4 mr-2" />
              Pause campaign
            </DropdownMenuItem>
          )}
          {onStop && (
            <DropdownMenuItem onClick={onStop}>
              <Square className="h-4 w-4 mr-2" />
              Stop campaign
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="datetime">When do you want to send this campaign?</Label>
              <Input
                id="datetime"
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Quick options</Label>
              <div className="grid grid-cols-1 gap-2">
                {quickOptions.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setScheduledDateTime(option.value)}
                    className="justify-start"
                  >
                    <option.icon className="h-4 w-4 mr-2" />
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleScheduleSend}
                disabled={!scheduledDateTime}
                className="bg-green-600 hover:bg-green-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}