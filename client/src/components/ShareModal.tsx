import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { apiRequest } from "@/lib/queryClient";

interface Collaborator {
  id: string;
  name: string;
  email: string;
  accessLevel: 'viewer' | 'commenter' | 'editor';
  avatar?: string;
  isOwner?: boolean;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  listId: number;
  envId: string;
  currentSharedLink: string;
  existingSharedLinks: any[];
  collaborators?: Collaborator[];
  onCopyLink: () => void;
  onCreateShare: () => void;
  isCreating?: boolean;
  onRefreshList?: () => void;
}

export function ShareModal({
  isOpen,
  onClose,
  itemName,
  listId,
  envId,
  currentSharedLink,
  existingSharedLinks,
  collaborators = [],
  onCopyLink,
  onCreateShare,
  isCreating = false,
  onRefreshList
}: ShareModalProps) {
  const { toast } = useToast();
  const { environment } = useEnvironment();
  const [linkAccess, setLinkAccess] = useState(existingSharedLinks.length > 0 ? "anyone" : "restricted");
  
  // Modal state management
  const [currentView, setCurrentView] = useState<'main' | 'compose'>('main');
  const [selectedEmail, setSelectedEmail] = useState('');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState('viewer');
  const [emailMessage, setEmailMessage] = useState('');

  const [isSending, setIsSending] = useState(false);
  const [removingCollaboratorId, setRemovingCollaboratorId] = useState<string | null>(null);
  const [updatingAccessId, setUpdatingAccessId] = useState<string | null>(null);
  
  // Local collaborators state with real API data
  const [localCollaborators, setLocalCollaborators] = useState<Collaborator[]>([]);

  // Fetch collaborators from API when modal opens
  useEffect(() => {
    if (isOpen && listId && envId) {
      fetchCollaborators();
    }
  }, [isOpen, listId, envId]);

  const fetchCollaborators = async () => {
    try {
      const response = await apiRequest('GET', `/api/${envId}/saved-lists/${listId}/collaborators`);
      const apiCollaborators = response.map((collab: any) => ({
        id: collab.id.toString(),
        name: collab.name || collab.user_name || collab.email.split('@')[0],
        email: collab.email || collab.user_email,
        accessLevel: collab.access_level,
        avatar: (collab.name || collab.user_name || collab.email).charAt(0).toUpperCase(),
        isOwner: false
      }));
      setLocalCollaborators(apiCollaborators);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };
  
  // Email input and suggestions
  const [emailInput, setEmailInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  
  // Mock email suggestions - in real app, these would come from API
  const emailSuggestions = [
    { email: 'kameliakolev@gmail.com', name: 'Kamelia Kolev', avatar: 'K' },
    { email: 'john.smith@partner.com', name: 'John Smith', avatar: 'J' },
    { email: 'maria.garcia@company.com', name: 'Maria Garcia', avatar: 'M' },
    { email: 'alex.johnson@degoudse.com', name: 'Alex Johnson', avatar: 'A' }
  ];
  
  const filteredSuggestions = emailSuggestions.filter(suggestion =>
    suggestion.email.toLowerCase().includes(emailInput.toLowerCase()) ||
    suggestion.name.toLowerCase().includes(emailInput.toLowerCase())
  );
  
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const handleEmailSelect = (email: string, name: string) => {
    setSelectedEmail(email);
    setEmailInput(email);
    setShowSuggestions(false);
    setCurrentView('compose');
  };
  
  const handleRemoveCollaborator = async (collaboratorId: string) => {
    setRemovingCollaboratorId(collaboratorId);
    
    try {
      await apiRequest('DELETE', `/api/${envId}/saved-lists/${listId}/collaborators/${collaboratorId}`);
      
      toast({
        title: "Access removed",
        description: "Collaborator access has been removed.",
      });
      
      // Remove from local state
      setLocalCollaborators(prev => prev.filter(collab => collab.id !== collaboratorId));
      
      // Refresh list to update is_shared flag
      if (onRefreshList) {
        onRefreshList();
      }
    } catch (error) {
      toast({
        title: "Error removing access",
        description: "Failed to remove collaborator access. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRemovingCollaboratorId(null);
    }
  };

  const handleUpdateAccessLevel = async (collaboratorId: string, newAccessLevel: string) => {
    setUpdatingAccessId(collaboratorId);
    
    try {
      await apiRequest('PATCH', `/api/${envId}/saved-lists/${listId}/collaborators/${collaboratorId}`, {
        accessLevel: newAccessLevel
      });
      
      toast({
        title: "Access updated",
        description: "Collaborator access level has been updated.",
      });
      
      // Update local state
      setLocalCollaborators(prev => 
        prev.map(collab => 
          collab.id === collaboratorId 
            ? { ...collab, accessLevel: newAccessLevel as 'viewer' | 'commenter' | 'editor' }
            : collab
        )
      );
    } catch (error) {
      toast({
        title: "Error updating access",
        description: "Failed to update access level. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdatingAccessId(null);
    }
  };

  const handleSendInvite = async () => {
    if (!selectedEmail || !isValidEmail(selectedEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      await apiRequest('POST', `/api/${envId}/saved-lists/${listId}/collaborators`, {
        email: selectedEmail,
        name: selectedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        accessLevel: selectedAccessLevel,
        message: emailMessage
      });
      
      toast({
        title: "Invitation sent",
        description: `${selectedEmail} has been invited to collaborate.`,
      });
      
      // Refresh collaborators and list
      await fetchCollaborators();
      if (onRefreshList) {
        onRefreshList();
      }
      
      // Reset form and go back to main view
      setCurrentView('main');
      setSelectedEmail('');
      setEmailInput('');
      setEmailMessage('');
    } catch (error) {
      toast({
        title: "Failed to send invitation",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedEmail('');
    setEmailInput('');
    setEmailMessage('');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#ffffff] text-[#282A3F] p-6" aria-describedby="share-modal-description">
        <div id="share-modal-description" className="sr-only">
          Share {itemName} with others by adding their email addresses or copying a shareable link
        </div>
        
        <DialogHeader className="pb-4">
          <div className="flex items-center space-x-2">
            {currentView === 'compose' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToMain}
                className="p-1 h-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
            )}
            <DialogTitle className="text-lg font-medium">
              Share "{itemName}"
            </DialogTitle>
          </div>
        </DialogHeader>
        
        {currentView === 'main' ? (
          <div className="space-y-4">
            {/* Add people section */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Input 
                    ref={emailInputRef}
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setShowSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowSuggestions(emailInput.length > 0)}
                    placeholder="Add people and groups"
                    className="flex-1"
                  />
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.email}
                          className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleEmailSelect(suggestion.email, suggestion.name)}
                        >
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {suggestion.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{suggestion.name}</div>
                            <div className="text-xs text-gray-500">{suggestion.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Select value={selectedAccessLevel} onValueChange={setSelectedAccessLevel}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="commenter">Commenter</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  size="sm" 
                  disabled={!emailInput || !isValidEmail(emailInput)}
                  onClick={() => {
                    if (isValidEmail(emailInput)) {
                      setSelectedEmail(emailInput);
                      setCurrentView('compose');
                    }
                  }}
                >
                  Send
                </Button>
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
              
              {/* Dynamic collaborators list */}
              {localCollaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center space-x-3 py-2 group">
                  <div className={`w-8 h-8 ${collaborator.isOwner ? 'bg-blue-600' : 'bg-green-600'} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                    {collaborator.avatar || collaborator.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{collaborator.name}</div>
                    <div className="text-xs text-gray-500">{collaborator.email}</div>
                  </div>
                  
                  {collaborator.isOwner ? (
                    <div className="text-sm text-gray-500">Owner</div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Select 
                        value={collaborator.accessLevel} 
                        onValueChange={(value) => handleUpdateAccessLevel(collaborator.id, value)}
                        disabled={updatingAccessId === collaborator.id}
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="commenter">Commenter</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Remove button - only visible on hover */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveCollaborator(collaborator.id)}
                        disabled={removingCollaboratorId === collaborator.id}
                        title="Remove access"
                      >
                        {removingCollaboratorId === collaborator.id ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
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
            
            <div className="flex justify-end pt-4">
              <DialogClose asChild>
                <Button variant="outline">Done</Button>
              </DialogClose>
            </div>
          </div>
        ) : (
          // Compose email view
          <div className="space-y-4">
            {/* Selected person */}
            <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {selectedEmail.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-sm font-medium">{selectedEmail}</div>
                </div>
                <Select value={selectedAccessLevel} onValueChange={setSelectedAccessLevel}>
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
            
            {/* Message editor */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Message</label>
              <Textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Add a message (optional)"
                className="min-h-[120px] resize-none"
              />
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-between pt-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleBackToMain}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendInvite}
                  disabled={isSending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}