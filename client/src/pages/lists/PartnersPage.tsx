import { useState, useEffect, useContext, createContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Plus, Filter, Share2, Download, Upload, Users, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';

// Context for list editing state
interface ListEditingContextType {
  isEditingList: boolean;
  setIsEditingList: (value: boolean) => void;
}

const ListEditingContext = createContext<ListEditingContextType>({
  isEditingList: false,
  setIsEditingList: () => {},
});

// Simple table component for partners
function PartnersTable() {
  const [selectedPartners, setSelectedPartners] = useState<number[]>([]);
  const { data: partners, isLoading } = useQuery({
    queryKey: ['/api/partners'],
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading partners...</div>;
  }

  if (!partners || partners.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No partners yet</h3>
        <p className="text-gray-600">Get started by creating your first partner.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      <div className="min-h-[32px] flex items-center justify-between bg-gray-50 px-4 py-2 rounded-md border">
        {selectedPartners.length > 0 ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {selectedPartners.length} partner{selectedPartners.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-500">
            Select at least one partner from the list to perform bulk actions
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedPartners([])}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Partners Grid */}
      <div className="grid gap-4">
        {partners.map((partner: any) => (
          <Card key={partner.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedPartners.includes(partner.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPartners([...selectedPartners, partner.id]);
                      } else {
                        setSelectedPartners(selectedPartners.filter(id => id !== partner.id));
                      }
                    }}
                  />
                  <Link href={`/partners/${partner.id}`} className="hover:underline">
                    <h3 className="font-semibold text-lg">{partner.name}</h3>
                  </Link>
                </div>
                <Badge variant={partner.status === 'active' ? 'default' : 'secondary'}>
                  {partner.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span> {partner.partnerType || 'N/A'}
                </div>
                <div>
                  <span className="text-gray-500">Location:</span> {partner.location || 'N/A'}
                </div>
                <div>
                  <span className="text-gray-500">Industry:</span> {partner.industry || 'N/A'}
                </div>
                <div>
                  <span className="text-gray-500">Contact:</span> {partner.contactEmail || 'N/A'}
                </div>
              </div>
              {partner.description && (
                <p className="text-gray-600 mt-3 text-sm">{partner.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Main page content component
function PartnersPageContent() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isEditingList } = useContext(ListEditingContext);

  // Form data for creating new partner
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    contactEmail: '',
    primaryContact: '',
    partnerType: 'partner',
    region: '',
    status: 'active',
    industry: 'Insurance',
    size: 'medium'
  });

  const handleCreatePartner = async () => {
    if (!formData.name || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Name and description are required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Partner created successfully!"
        });
        queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
        setFormData({
          name: '',
          description: '',
          location: '',
          contactEmail: '',
          primaryContact: '',
          partnerType: 'partner',
          region: '',
          status: 'active',
          industry: 'Insurance',
          size: 'medium'
        });
        setShowCreateModal(false);
      } else {
        throw new Error('Failed to create partner');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create partner. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-black">Partners</h1>
        <Button
          className={`flex items-center gap-2 px-4 py-2 text-white rounded-md transition-colors font-medium text-[14px] ${isEditingList ? 'bg-[#8B98F9] cursor-not-allowed' : 'bg-[#5567E5] hover:bg-[#4556D4]'}`}
          onClick={() => {
            if (!isEditingList) {
              setShowCreateModal(true);
            }
          }}
          disabled={isEditingList}
        >
          <Plus size={16} />
          Create partner
        </Button>
      </div>

      {/* Search and filters */}
      <div className="mb-6">
        <Input
          placeholder="Search partners..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-md"
        />
      </div>

      <PartnersTable />

      {/* Create Partner Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Partner</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Partner name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="contact@partner.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the partner"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, Country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryContact">Primary Contact</Label>
                <Input
                  id="primaryContact"
                  value={formData.primaryContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryContact: e.target.value }))}
                  placeholder="Contact person name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partnerType">Partner Type</Label>
                <Select value={formData.partnerType} onValueChange={(value) => setFormData(prev => ({ ...prev, partnerType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="broker">Broker</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePartner} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Partner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Main component with context provider
export default function PartnersPage() {
  const [isEditingList, setIsEditingList] = useState(false);

  return (
    <ListEditingContext.Provider value={{ isEditingList, setIsEditingList }}>
      <PartnersPageContent />
    </ListEditingContext.Provider>
  );
}