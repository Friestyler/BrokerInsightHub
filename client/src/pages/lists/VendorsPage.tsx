import { useState } from "react";
import { Link } from "wouter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Building, Plus, SquarePen, Layers, Package2 } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { useToast } from "@/hooks/use-toast";

type Vendor = {
  id: number;
  name: string;
  description: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  ownerId: number | null;
  createdAt: string;
  updatedAt: string;
};

export default function VendorsPage() {
  const { environment } = useEnvironment();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: "",
    description: "",
    contactName: "",
    contactEmail: "",
    contactPhone: ""
  });

  const { data: vendors, isLoading } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors'],
    enabled: true
  });

  const createVendorMutation = useMutation({
    mutationFn: (data: typeof newVendor) => {
      return apiRequest('/api/vendors', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      setIsCreateModalOpen(false);
      setNewVendor({
        name: "",
        description: "",
        contactName: "",
        contactEmail: "",
        contactPhone: ""
      });
      toast({
        title: "Success",
        description: "Vendor created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create vendor. Please try again.",
        variant: "destructive"
      });
      console.error("Error creating vendor:", error);
    }
  });

  const handleCreateVendor = () => {
    if (!newVendor.name || !newVendor.description) {
      toast({
        title: "Validation Error",
        description: "Name and description are required",
        variant: "destructive"
      });
      return;
    }

    createVendorMutation.mutate(newVendor);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
          <p className="text-gray-500">Manage your vendor relationships</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendors</CardTitle>
          <CardDescription>
            Your organization's vendors and suppliers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading vendors...</div>
          ) : vendors && vendors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-indigo-600" />
                        {vendor.name}
                      </div>
                    </TableCell>
                    <TableCell>{vendor.description}</TableCell>
                    <TableCell>
                      {vendor.contactName && (
                        <div className="text-sm">
                          <div>{vendor.contactName}</div>
                          {vendor.contactEmail && (
                            <div className="text-gray-500">{vendor.contactEmail}</div>
                          )}
                          {vendor.contactPhone && (
                            <div className="text-gray-500">{vendor.contactPhone}</div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link 
                        href={`/lists/vendors/${vendor.id}/products`}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                      >
                        <Package2 className="h-4 w-4 mr-1" />
                        View Products
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Link href={`/lists/vendors/${vendor.id}`}>
                          <Button variant="ghost" size="sm">
                            <SquarePen className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No vendors</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new vendor.</p>
              <div className="mt-6">
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vendor
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Vendor Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input
                id="name"
                value={newVendor.name}
                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                placeholder="Enter vendor name"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                value={newVendor.description}
                onChange={(e) => setNewVendor({ ...newVendor, description: e.target.value })}
                placeholder="Enter vendor description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="contactName" className="text-sm font-medium">Contact Name</label>
              <Input
                id="contactName"
                value={newVendor.contactName}
                onChange={(e) => setNewVendor({ ...newVendor, contactName: e.target.value })}
                placeholder="Enter contact name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="contactEmail" className="text-sm font-medium">Contact Email</label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={newVendor.contactEmail}
                  onChange={(e) => setNewVendor({ ...newVendor, contactEmail: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="contactPhone" className="text-sm font-medium">Contact Phone</label>
                <Input
                  id="contactPhone"
                  value={newVendor.contactPhone}
                  onChange={(e) => setNewVendor({ ...newVendor, contactPhone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleCreateVendor}
              disabled={createVendorMutation.isPending}
            >
              {createVendorMutation.isPending ? "Creating..." : "Create Vendor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}