import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft,
  FileSpreadsheet,
  Handshake,
  UserCheck,
  Archive,
  Factory,
  Phone
} from "lucide-react";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function EntitySelectPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Partner Pilot</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/" onClick={() => {
                setLocation('/');
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('navigate-to-section', { detail: 'data-upload-3' }));
                }, 100);
              }}>Data Upload 3</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Select Entity Type</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="outline" size="sm" onClick={() => {
            setLocation('/');
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('navigate-to-section', { detail: 'data-upload-3' }));
            }, 100);
          }}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Data Upload 3
          </Button>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Select Entity Type</h1>
        <p className="text-gray-600">Choose the type of data you want to upload</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-blue-100 flex flex-col" onClick={() => setLocation('/data-upload-2/process/opportunities')}>
          <CardHeader className="flex-grow">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-lg mt-2">Opportunities</CardTitle>
            <CardDescription>
              Upload opportunity data with automatic attribute mapping and validation
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Upload Opportunities
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-green-100 flex flex-col" onClick={() => setLocation('/data-upload-2/process/partners')}>
          <CardHeader className="flex-grow">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Handshake className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-lg mt-2">Partners</CardTitle>
            <CardDescription>
              Import partner information with contact and relationship mapping
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Upload Partners
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-purple-100 flex flex-col" onClick={() => setLocation('/data-upload-2/process/customers')}>
          <CardHeader className="flex-grow">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <CardTitle className="text-lg mt-2">Customers</CardTitle>
            <CardDescription>
              Upload customer data with segmentation and preference mapping
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              Upload Customers
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-orange-100 flex flex-col" onClick={() => setLocation('/data-upload-2/process/products')}>
          <CardHeader className="flex-grow">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Archive className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-lg mt-2">Products</CardTitle>
            <CardDescription>
              Import product catalog with pricing and category organization
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <Button className="w-full bg-orange-600 hover:bg-orange-700">
              Upload Products
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-red-100 flex flex-col" onClick={() => setLocation('/data-upload-2/process/vendors')}>
          <CardHeader className="flex-grow">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Factory className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-lg mt-2">Vendors</CardTitle>
            <CardDescription>
              Upload vendor information with contract and performance data
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <Button className="w-full bg-red-600 hover:bg-red-700">
              Upload Vendors
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-gray-100 flex flex-col" onClick={() => setLocation('/data-upload-2/process/contacts')}>
          <CardHeader className="flex-grow">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Phone className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <CardTitle className="text-lg mt-2">Contacts</CardTitle>
            <CardDescription>
              Import contact information with relationship and communication preferences
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <Button className="w-full bg-gray-600 hover:bg-gray-700">
              Upload Contacts
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}