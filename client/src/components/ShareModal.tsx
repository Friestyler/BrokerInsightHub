import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useEnvironment } from "@/contexts/EnvironmentContext";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  currentSharedLink: string;
  existingSharedLinks: any[];
  onCopyLink: () => void;
  onCreateShare: () => void;
  isCreating?: boolean;
}

export function ShareModal({
  isOpen,
  onClose,
  itemName,
  currentSharedLink,
  existingSharedLinks,
  onCopyLink,
  onCreateShare,
  isCreating = false
}: ShareModalProps) {
  const { toast } = useToast();
  const { environment } = useEnvironment();
  const [linkAccess, setLinkAccess] = useState(existingSharedLinks.length > 0 ? "anyone" : "restricted");
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#ffffff] text-[#282A3F] p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-medium">
            Share "{itemName}"
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Add people section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Input 
                placeholder="Add people and groups"
                className="flex-1"
              />
              <Select defaultValue="viewer">
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="commenter">Commenter</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" disabled>Send</Button>
            </div>
            
            {/* Current collaborators section */}
            <div className="text-sm text-gray-500">
              People with access
            </div>
            
            {/* Owner */}
            <div className="flex items-center space-x-3 py-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {environment?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{environment?.name || 'You'}</div>
                <div className="text-xs text-gray-500">{environment?.name?.toLowerCase() || 'you'}@company.com</div>
              </div>
              <div className="text-sm text-gray-500">Owner</div>
            </div>
            
            {/* Sample collaborators */}
            <div className="flex items-center space-x-3 py-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                J
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">John Smith</div>
                <div className="text-xs text-gray-500">john.smith@partner.com</div>
              </div>
              <Select defaultValue="viewer">
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="commenter">Commenter</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-3 py-2">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                M
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Maria Garcia</div>
                <div className="text-xs text-gray-500">maria.garcia@company.com</div>
              </div>
              <Select defaultValue="editor">
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="commenter">Commenter</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="border-t pt-4">
            {/* Get link section */}
            <div className="space-y-3">
              <div className="text-sm font-medium">Get link</div>
              
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <div className="flex-1">
                  <Select value={linkAccess} onValueChange={setLinkAccess}>
                    <SelectTrigger className="w-full border-0 bg-transparent p-0 h-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restricted">
                        <div>
                          <div className="font-medium">Restricted</div>
                          <div className="text-xs text-gray-500">Only people with access can open with this link</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="anyone">
                        <div>
                          <div className="font-medium">Anyone with the link</div>
                          <div className="text-xs text-gray-500">Anyone on the internet with this link can view</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {linkAccess === "anyone" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={!currentSharedLink || isCreating}
                    onClick={() => {
                      if (currentSharedLink) {
                        onCopyLink();
                      } else {
                        onCreateShare();
                      }
                    }}
                  >
                    {isCreating ? "Creating..." : currentSharedLink ? "Copy link" : "Create link"}
                  </Button>
                )}
              </div>
              
              {/* Show sharing status */}
              {linkAccess === "anyone" && existingSharedLinks.length > 0 ? (
                <div className="flex items-center text-sm text-green-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Link sharing is on
                </div>
              ) : linkAccess === "anyone" ? (
                <div className="text-sm text-gray-500">
                  Click "Create link" to enable link sharing
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Link sharing is off
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <DialogClose asChild>
            <Button variant="outline">Done</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}