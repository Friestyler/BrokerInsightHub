import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from '@tanstack/react-query';
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Link2, X } from 'lucide-react';

interface PartnerCampaignShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignIds: number[];
  campaignNames: string[];
  partnerId: string;
  partnerName?: string;
  onSuccess?: () => void;
}

export default function PartnerCampaignShareModal({
  isOpen,
  onClose,
  campaignIds,
  campaignNames,
  partnerId,
  partnerName,
  onSuccess
}: PartnerCampaignShareModalProps) {
  const [emailInput, setEmailInput] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('Viewer');
  const [linkSharing, setLinkSharing] = useState('Restricted...');
  const [isSharing, setIsSharing] = useState(false);
  const { environment } = useEnvironment();
  const { toast } = useToast();

  // Fetch partner contacts
  const { data: partnerContacts = [] } = useQuery({
    queryKey: [`/api/${environment.id}/partners/${partnerId}/contacts`],
    enabled: isOpen && !!partnerId,
  });

  // Get current user and owner info
  const { data: users = [] } = useQuery({
    queryKey: [`/api/${environment.id}/users`],
    enabled: isOpen,
  });

  const currentUser = users.find((user: any) => user.id === 1); // Current user
  const owner = users.find((user: any) => user.name === 'De Goudse') || currentUser;

  const handleShare = async () => {
    if (!emailInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);
    try {
      await apiRequest('POST', `/api/${environment.id}/campaigns/share`, {
        campaignIds,
        email: emailInput.trim(),
        permission: selectedPermission.toLowerCase(),
        partnerId
      });

      toast({
        title: "Campaigns Shared",
        description: `${campaignNames.length} campaign(s) shared with ${emailInput}`,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share campaigns",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share {campaignNames.length} Campaign{campaignNames.length > 1 ? 's' : ''}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Email Input */}
          <div className="flex space-x-2">
            <Input
              placeholder="Add people, groups, or partners"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="flex-1"
            />
            <Select value={selectedPermission} onValueChange={setSelectedPermission}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Viewer">Viewer</SelectItem>
                <SelectItem value="Editor">Editor</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleShare}
              disabled={isSharing || !emailInput.trim()}
              className="bg-[#5567E5] hover:bg-[#4556D4] text-white"
            >
              Send
            </Button>
          </div>

          {/* People with access */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">People with access</h4>
            
            {/* Owner */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8 bg-[#5567E5] text-white">
                  <AvatarFallback>{getInitials(owner?.name || 'De Goudse')}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">{owner?.name || 'De Goudse'}</div>
                  <div className="text-xs text-gray-500">{owner?.email || 'de.goudse@company.com'}</div>
                </div>
              </div>
              <span className="text-xs text-gray-500">Owner</span>
            </div>

            {/* Partner contacts */}
            {partnerContacts.map((contact: any) => (
              <div key={contact.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8 bg-green-500 text-white">
                    <AvatarFallback>{getInitials(contact.full_name || contact.first_name || 'P')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{contact.full_name || `${contact.first_name} ${contact.last_name}`}</div>
                    <div className="text-xs text-gray-500">{contact.email || 'john.smith@partner.com'}</div>
                  </div>
                </div>
                <Select defaultValue="Viewer">
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          {/* Get link section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Link2 className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Get link</span>
              </div>
              <Select value={linkSharing} onValueChange={setLinkSharing}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Restricted...">Restricted...</SelectItem>
                  <SelectItem value="Anyone with link">Anyone with link</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-500">Link sharing is off</p>
          </div>

          {/* Done button */}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}