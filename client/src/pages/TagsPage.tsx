import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Tag, InsertTag } from "@shared/schema";

const colorOptions = [
  "blue", "green", "purple", "red", "orange", "yellow", "pink", "indigo", 
  "cyan", "teal", "emerald", "lime", "amber", "rose", "violet", "sky"
];

const getColorClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    red: "bg-red-100 text-red-800 border-red-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    pink: "bg-pink-100 text-pink-800 border-pink-200",
    indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
    cyan: "bg-cyan-100 text-cyan-800 border-cyan-200",
    teal: "bg-teal-100 text-teal-800 border-teal-200",
    emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
    lime: "bg-lime-100 text-lime-800 border-lime-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    rose: "bg-rose-100 text-rose-800 border-rose-200",
    violet: "bg-violet-100 text-violet-800 border-violet-200",
    sky: "bg-sky-100 text-sky-800 border-sky-200"
  };
  return colorMap[color] || "bg-gray-100 text-gray-800 border-gray-200";
};

export default function TagsPage() {
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("blue");
  const [editingTag, setEditingTag] = useState<number | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [editTagColor, setEditTagColor] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tags from API
  const { data: tags = [], isLoading } = useQuery<Tag[]>({
    queryKey: ['/api/tags'],
    queryFn: () => fetch('/api/tags').then(res => res.json()),
  });

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: (tagData: InsertTag) => apiRequest('/api/tags', 'POST', tagData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
      setIsCreateTagOpen(false);
      setNewTagName("");
      setNewTagColor("blue");
      toast({
        title: "Success",
        description: "Tag created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tag",
        variant: "destructive",
      });
    },
  });

  // Update tag mutation
  const updateTagMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InsertTag }) => 
      apiRequest(`/api/tags/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
      setEditingTag(null);
      setEditTagName("");
      setEditTagColor("");
      toast({
        title: "Success",
        description: "Tag updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tag",
        variant: "destructive",
      });
    },
  });

  // Delete tag mutation
  const deleteTagMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/tags/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
      setDeleteDialogOpen(false);
      setTagToDelete(null);
      toast({
        title: "Success",
        description: "Tag deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tag",
        variant: "destructive",
      });
    },
  });

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    createTagMutation.mutate({
      name: newTagName.trim(),
      color: newTagColor,
    });
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag.id);
    setEditTagName(tag.name);
    setEditTagColor(tag.color);
  };

  const handleSaveEdit = () => {
    if (!editTagName.trim() || !editingTag) return;
    updateTagMutation.mutate({
      id: editingTag,
      data: {
        name: editTagName.trim(),
        color: editTagColor,
      },
    });
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditTagName("");
    setEditTagColor("");
  };

  const handleDeleteTag = (tag: Tag) => {
    setTagToDelete(tag);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (tagToDelete) {
      deleteTagMutation.mutate(tagToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-white min-h-screen">
        <div className="px-6 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-[#696C8C]" style={{ fontFamily: 'Poppins' }}>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white min-h-screen">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#282A3F]" style={{ fontFamily: 'Poppins' }}>
              Tags
            </h1>
            <p className="text-[#696C8C] mt-1" style={{ fontFamily: 'Poppins', fontSize: '14px' }}>
              Create and manage tags that can be used to categorize OKR templates, partners, opportunities, and other entities.
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateTagOpen(true)}
            className="bg-[#3E4DC4] hover:bg-[#3344B8] text-white"
            style={{ fontFamily: 'Poppins' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M5 12h14"/>
              <path d="M12 5v14"/>
            </svg>
            Add new tag
          </Button>
        </div>

        {/* Tags Table */}
        <div className="bg-white">
          <div className="overflow-x-auto">
            <Table className="border-b min-w-full" style={{ borderColor: '#E6E7F1' }}>
              <TableHeader>
                <TableRow className="border-b hover:bg-[#F5F6FA] group" style={{ borderColor: '#E6E7F1' }}>
                  <TableHead 
                    className="px-3 py-2 min-w-[300px]"
                    style={{ 
                      fontFamily: 'Poppins', 
                      fontWeight: '500', 
                      fontSize: '13px', 
                      color: '#696C8C' 
                    }}
                  >
                    Tag
                  </TableHead>
                  <TableHead 
                    className="text-right px-3 py-2 min-w-[80px]"
                    style={{ 
                      fontFamily: 'Poppins', 
                      fontWeight: '500', 
                      fontSize: '13px', 
                      color: '#696C8C' 
                    }}
                  >
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag.id} className="hover:bg-[#F5F6FA] border-b group" style={{ borderColor: '#E6E7F1' }}>
                    <TableCell className="p-4 align-middle text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
                      {editingTag === tag.id ? (
                        <div className="flex items-center gap-3">
                          <Input
                            value={editTagName}
                            onChange={(e) => setEditTagName(e.target.value)}
                            className="border-[#E6E7F1] focus:border-[#3E4DC4] focus:ring-[#3E4DC4] flex-1"
                            style={{ fontFamily: 'Poppins' }}
                          />
                          <Select value={editTagColor} onValueChange={setEditTagColor}>
                            <SelectTrigger className="w-40 border-[#E6E7F1] focus:border-[#3E4DC4]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {colorOptions.map(color => (
                                <SelectItem key={color} value={color}>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${getColorClasses(color)}`}></div>
                                    <span className="capitalize" style={{ fontFamily: 'Poppins' }}>{color}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getColorClasses(tag.color)}`}>
                          {tag.name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-right">
                      {editingTag === tag.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={updateTagMutation.isPending}
                            className="bg-[#3E4DC4] hover:bg-[#3344B8] text-white h-8"
                            style={{ fontFamily: 'Poppins' }}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            className="border-[#E6E7F1] hover:bg-[#F5F6FA] h-8"
                            style={{ fontFamily: 'Poppins' }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditTag(tag)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                              <path d="m15 5 4 4"/>
                            </svg>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-600"
                            onClick={() => handleDeleteTag(tag)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"/>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            </svg>
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Create Tag Dialog */}
        <Dialog open={isCreateTagOpen} onOpenChange={setIsCreateTagOpen}>
          <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg sm:max-w-[500px] bg-[#ffffff]">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins' }}>
                Create New Tag
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Poppins' }}>
                Create a new tag that can be used to categorize items across the platform.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="new-tag-name" className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Poppins' }}>
                  Tag Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="new-tag-name"
                  placeholder="Enter tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  style={{ fontFamily: 'Poppins' }}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="new-tag-color" className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Poppins' }}>
                  Color
                </label>
                <Select value={newTagColor} onValueChange={setNewTagColor}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map(color => (
                      <SelectItem key={color} value={color}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getColorClasses(color)}`}></div>
                          <span className="capitalize" style={{ fontFamily: 'Poppins' }}>{color}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreateTagOpen(false);
                  setNewTagName("");
                  setNewTagColor("blue");
                }}
                style={{ fontFamily: 'Poppins' }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTag}
                disabled={!newTagName.trim() || createTagMutation.isPending}
                className="bg-[#3E4DC4] hover:bg-[#3344B8] text-white"
                style={{ fontFamily: 'Poppins' }}
              >
                {createTagMutation.isPending ? "Creating..." : "Create Tag"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Poppins' }}>Delete Tag</DialogTitle>
              <DialogDescription style={{ fontFamily: 'Poppins' }}>
                Are you sure you want to delete the tag "{tagToDelete?.name}"? This action cannot be undone and will remove this tag from all items throughout the platform.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDeleteDialogOpen(false)}
                style={{ fontFamily: 'Poppins' }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                disabled={deleteTagMutation.isPending}
                style={{ fontFamily: 'Poppins' }}
              >
                {deleteTagMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}