import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Tag {
  id: number;
  name: string;
  color: string;
  createdAt: string;
}

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
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("blue");
  const [editingTag, setEditingTag] = useState<number | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [editTagColor, setEditTagColor] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const { toast } = useToast();

  // Initialize with default tags
  useEffect(() => {
    const defaultTags: Tag[] = [
      { id: 1, name: "Revenue Growth", color: "green", createdAt: "2025-01-01" },
      { id: 2, name: "Customer Experience", color: "blue", createdAt: "2025-01-01" },
      { id: 3, name: "Product Innovation", color: "purple", createdAt: "2025-01-01" },
      { id: 4, name: "Operational Excellence", color: "orange", createdAt: "2025-01-01" },
      { id: 5, name: "Market Expansion", color: "cyan", createdAt: "2025-01-01" },
      { id: 6, name: "Team Development", color: "pink", createdAt: "2025-01-01" }
    ];
    setTags(defaultTags);
  }, []);

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;

    // Check for duplicate names
    if (tags.some(tag => tag.name.toLowerCase() === newTagName.trim().toLowerCase())) {
      toast({
        title: "Error",
        description: "A tag with this name already exists.",
        variant: "destructive"
      });
      return;
    }

    const newTag: Tag = {
      id: Math.max(...tags.map(t => t.id), 0) + 1,
      name: newTagName.trim(),
      color: newTagColor,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTags([...tags, newTag]);
    setNewTagName("");
    setNewTagColor("blue");
    
    toast({
      title: "Success",
      description: "Tag created successfully."
    });
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag.id);
    setEditTagName(tag.name);
    setEditTagColor(tag.color);
  };

  const handleSaveEdit = () => {
    if (!editTagName.trim() || !editingTag) return;

    // Check for duplicate names (excluding current tag)
    if (tags.some(tag => tag.id !== editingTag && tag.name.toLowerCase() === editTagName.trim().toLowerCase())) {
      toast({
        title: "Error",
        description: "A tag with this name already exists.",
        variant: "destructive"
      });
      return;
    }

    setTags(tags.map(tag => 
      tag.id === editingTag 
        ? { ...tag, name: editTagName.trim(), color: editTagColor }
        : tag
    ));

    setEditingTag(null);
    setEditTagName("");
    setEditTagColor("");

    toast({
      title: "Success",
      description: "Tag updated successfully."
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
      setTags(tags.filter(tag => tag.id !== tagToDelete.id));
      toast({
        title: "Success",
        description: "Tag deleted successfully."
      });
    }
    setDeleteDialogOpen(false);
    setTagToDelete(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#282A3F] mb-2" style={{ fontFamily: 'Poppins' }}>
            Tags
          </h1>
          <p className="text-[#696C8C]" style={{ fontFamily: 'Poppins', fontSize: '14px' }}>
            Create and manage tags that can be used to categorize OKR templates, partners, opportunities, and other entities.
          </p>
        </div>

        {/* Create New Tag Section */}
        <div className="bg-white rounded-lg border border-[#E6E7F1] p-6 mb-6">
          <h2 className="text-lg font-medium text-[#282A3F] mb-4" style={{ fontFamily: 'Poppins' }}>
            Create New Tag
          </h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="tag-name" className="block text-sm font-medium text-[#282A3F] mb-2" style={{ fontFamily: 'Poppins' }}>
                Tag Name
              </label>
              <Input
                id="tag-name"
                placeholder="Enter tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="border-[#E6E7F1] focus:border-[#3E4DC4] focus:ring-[#3E4DC4]"
                style={{ fontFamily: 'Poppins' }}
              />
            </div>
            <div className="w-48">
              <label htmlFor="tag-color" className="block text-sm font-medium text-[#282A3F] mb-2" style={{ fontFamily: 'Poppins' }}>
                Color
              </label>
              <Select value={newTagColor} onValueChange={setNewTagColor}>
                <SelectTrigger className="border-[#E6E7F1] focus:border-[#3E4DC4]">
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
            <Button 
              onClick={handleCreateTag}
              disabled={!newTagName.trim()}
              className="bg-[#3E4DC4] hover:bg-[#3344B8] text-white"
              style={{ fontFamily: 'Poppins' }}
            >
              Create Tag
            </Button>
          </div>
        </div>

        {/* Tags Table */}
        <div className="bg-white rounded-lg border border-[#E6E7F1]">
          <div className="px-6 py-4 border-b border-[#E6E7F1]">
            <h2 className="text-lg font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins' }}>
              All Tags ({tags.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#E6E7F1] hover:bg-[#F5F6FA]">
                  <TableHead className="px-6 py-3 text-[#696C8C]" style={{ fontFamily: 'Poppins', fontWeight: '500', fontSize: '13px' }}>
                    Tag
                  </TableHead>
                  <TableHead className="px-6 py-3 text-[#696C8C]" style={{ fontFamily: 'Poppins', fontWeight: '500', fontSize: '13px' }}>
                    Color
                  </TableHead>
                  <TableHead className="px-6 py-3 text-[#696C8C]" style={{ fontFamily: 'Poppins', fontWeight: '500', fontSize: '13px' }}>
                    Created
                  </TableHead>
                  <TableHead className="px-6 py-3 text-right text-[#696C8C]" style={{ fontFamily: 'Poppins', fontWeight: '500', fontSize: '13px' }}>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag.id} className="border-b border-[#E6E7F1] hover:bg-[#F5F6FA]">
                    <TableCell className="px-6 py-4">
                      {editingTag === tag.id ? (
                        <Input
                          value={editTagName}
                          onChange={(e) => setEditTagName(e.target.value)}
                          className="border-[#E6E7F1] focus:border-[#3E4DC4] focus:ring-[#3E4DC4]"
                          style={{ fontFamily: 'Poppins' }}
                        />
                      ) : (
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getColorClasses(tag.color)}`}>
                          {tag.name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {editingTag === tag.id ? (
                        <Select value={editTagColor} onValueChange={setEditTagColor}>
                          <SelectTrigger className="w-32 border-[#E6E7F1] focus:border-[#3E4DC4]">
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
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getColorClasses(tag.color)}`}></div>
                          <span className="capitalize text-[#282A3F]" style={{ fontFamily: 'Poppins', fontSize: '14px' }}>
                            {tag.color}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-[#696C8C]" style={{ fontFamily: 'Poppins', fontSize: '14px' }}>
                      {new Date(tag.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      {editingTag === tag.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
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
                            className="h-8 w-8 p-0 hover:bg-[#F5F6FA]"
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
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Poppins' }}>Delete Tag</DialogTitle>
              <DialogDescription style={{ fontFamily: 'Poppins' }}>
                Are you sure you want to delete the tag "{tagToDelete?.name}"? This action cannot be undone.
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
                style={{ fontFamily: 'Poppins' }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}