import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Building, Package2, SquarePen } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { AddVendorModal } from "@/components/AddVendorModal";

type Vendor = {
  id: number;
  name: string;
  description: string;
  initials?: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  ownerId: number | null;
  createdAt: string;
  updatedAt: string;
};

export default function VendorsPage() {
  const { environment } = useEnvironment();

  const { data: vendors, isLoading } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors'],
    enabled: true
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
          <p className="text-gray-500">Manage your vendor relationships</p>
        </div>
        <AddVendorModal />
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
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-medium mr-3">
                          {vendor.initials || vendor.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium">{vendor.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{vendor.description}</TableCell>
                    <TableCell>
                      {vendor.contact_name && (
                        <div className="text-sm">
                          <div>{vendor.contact_name}</div>
                          {vendor.contact_email && (
                            <div className="text-gray-500">{vendor.contact_email}</div>
                          )}
                          {vendor.contact_phone && (
                            <div className="text-gray-500">{vendor.contact_phone}</div>
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
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new vendor.
              </p>
              <div className="mt-6">
                <AddVendorModal />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}