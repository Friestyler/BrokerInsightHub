import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { Search, Users, Share2, User, Check, X } from 'lucide-react';

interface ShareCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignIds: number[];
  campaignNames: string[];
  onSuccess?: () => void;
}

export default function ShareCampaignModal({
  isOpen,
  onClose,
  campaignIds,
  campaignNames,
  onSuccess
}: ShareCampaignModalProps) {
  const { toast } = useToast();
  const { environment } = useEnvironment();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartners, setSelectedPartners] = useState<number[]>([]);
  const [isSharing, setIsSharing] = useState(false);

  // Fetch partners for sharing
  const { data: partners = [], isLoading: isLoadingPartners } = useQuery({
    queryKey: [`/api/${environment.id}/partners`],
    enabled: isOpen
  });

  // Filter partners based on search term
  const filteredPartners = partners.filter((partner: any) =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePartnerToggle = (partnerId: number) => {
    setSelectedPartners(prev => 
      prev.includes(partnerId) 
        ? prev.filter(id => id !== partnerId)
        : [...prev, partnerId]
    );
  };

  const handleShareCampaigns = async () => {
    if (selectedPartners.length === 0) {
      toast({
        title: "No partners selected",
        description: "Please select at least one partner to share the campaign(s) with.",
        variant: "destructive"
      });
      return;
    }

    setIsSharing(true);
    try {
      // Share campaigns with selected partners
      await apiRequest('POST', `/api/${environment.id}/campaigns/share`, {
        campaignIds,
        partnerIds: selectedPartners
      });

      toast({
        title: "Success",
        description: `Successfully shared ${campaignIds.length} campaign(s) with ${selectedPartners.length} partner(s)`,
      });

      // Reset state and close modal
      setSelectedPartners([]);
      setSearchTerm('');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share campaigns with partners",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleClose = () => {
    setSelectedPartners([]);
    setSearchTerm('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-[#ffffff] text-[#282A3F]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Campaign{campaignIds.length > 1 ? 's' : ''} with Partners
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campaign info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Sharing {campaignIds.length} campaign{campaignIds.length > 1 ? 's' : ''}:
            </div>
            <div className="space-y-1">
              {campaignNames.map((name, index) => (
                <div key={index} className="text-sm text-gray-600">
                  • {name}
                </div>
              ))}
            </div>
          </div>

          {/* Partner search */}
          <div className="space-y-2">
            <Label htmlFor="partner-search">Search Partners</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="partner-search"
                type="text"
                placeholder="Search by partner name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Partner selection */}
          <div className="space-y-2">
            <Label>Select Partners ({selectedPartners.length} selected)</Label>
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {isLoadingPartners ? (
                <div className="p-4 text-center text-gray-500">Loading partners...</div>
              ) : filteredPartners.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'No partners found matching your search.' : 'No partners available.'}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredPartners.map((partner: any) => (
                    <div
                      key={partner.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                        selectedPartners.includes(partner.id) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handlePartnerToggle(partner.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{partner.name}</div>
                          {partner.email && (
                            <div className="text-xs text-gray-500">{partner.email}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {selectedPartners.includes(partner.id) ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 border border-gray-300 rounded"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected partners summary */}
          {selectedPartners.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm font-medium text-blue-700 mb-2">
                Selected Partners ({selectedPartners.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedPartners.map((partnerId) => {
                  const partner = partners.find((p: any) => p.id === partnerId);
                  return (
                    <Badge key={partnerId} variant="secondary" className="text-xs">
                      {partner?.name}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePartnerToggle(partnerId);
                        }}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleShareCampaigns}
            disabled={selectedPartners.length === 0 || isSharing}
            className="bg-[#5567E5] hover:bg-[#4556D4]"
          >
            {isSharing ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sharing...
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 mr-2" />
                Share Campaign{campaignIds.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}