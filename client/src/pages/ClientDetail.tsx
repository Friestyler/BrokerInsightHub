import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  Clock, 
  Edit, 
  Mail, 
  Phone, 
  Plus, 
  Star, 
  Tags, 
  Users, 
  Briefcase
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomerUser {
  id: number;
  fullName: string;
  avatarInitials: string;
}

interface CustomerTeamMember {
  id: number;
  user: CustomerUser | null;
}

interface CustomerPartner {
  id: number;
  partner: {
    id: number;
    name: string;
    type: string;
    initials: string;
  } | null;
}

interface Customer {
  id: number;
  name: string;
  description: string;
  ownerId: number | null;
  createdAt: string;
  updatedAt: string;
  owner: CustomerUser | null;
  teamMembers: CustomerTeamMember[];
  partners: CustomerPartner[];
}

export default function ClientDetail() {
  const params = useParams<{ id: string }>();
  const customerId = parseInt(params.id);
  
  const { data: customer, isLoading, error } = useQuery({
    queryKey: [`/api/customers/${customerId}`],
    refetchOnWindowFocus: false
  });
  
  // If there's an error or invalid ID
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Link href="/clients">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
          </Button>
        </Link>
        <div className="p-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Customer</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't load the customer details. Please try again later.
          </p>
          <Link href="/clients">
            <Button>Return to Customers List</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <Link href="/clients">
        <Button variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
        </Button>
      </Link>
      
      {isLoading ? (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-60" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Avatar className="h-16 w-16 bg-primary/10">
                <AvatarFallback className="text-primary text-xl">
                  {customer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{customer.name}</h1>
                <p className="text-gray-600">{customer.description}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Star className="mr-2 h-4 w-4" /> Add to Favorites
              </Button>
              <Button>
                <Edit className="mr-2 h-4 w-4" /> Edit Customer
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Created: {new Date(customer.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Last updated: {new Date(customer.updatedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Tags className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Category: <Badge variant="outline">Enterprise</Badge></span>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Products: 3 active products</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customer.owner && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2 bg-primary/10">
                          <AvatarFallback className="text-primary">
                            {customer.owner.avatarInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{customer.owner.fullName}</p>
                          <p className="text-xs text-muted-foreground">Account Owner</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {customer.teamMembers.length > 0 && customer.teamMembers.map(member => (
                    member.user && (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2 bg-primary/10">
                            <AvatarFallback className="text-primary">
                              {member.user.avatarInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.user.fullName}</p>
                            <p className="text-xs text-muted-foreground">Team Member</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  ))}
                  
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <Plus className="mr-2 h-4 w-4" /> Add Team Member
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Partners</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customer.partners.length > 0 ? (
                    customer.partners.map(partnerItem => (
                      partnerItem.partner && (
                        <div key={partnerItem.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2 bg-blue-100">
                              <AvatarFallback className="text-blue-700">
                                {partnerItem.partner.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{partnerItem.partner.name}</p>
                              <p className="text-xs text-muted-foreground">{partnerItem.partner.type}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No partners assigned yet.</p>
                  )}
                  
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <Plus className="mr-2 h-4 w-4" /> Add Partner
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="opportunities" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="opportunities">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Opportunities</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Add Opportunity
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="p-12 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Building2 className="h-6 w-6 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Active Opportunities</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      There are no active opportunities for this customer. Create a new opportunity to track potential deals.
                    </p>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Create Opportunity
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle>Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-12 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Briefcase className="h-6 w-6 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Products</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      This customer doesn't have any products yet. Add products to track what this customer has purchased.
                    </p>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-12 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Documents</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      There are no documents associated with this customer yet. Upload documents to keep track of important files.
                    </p>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Upload Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="mr-4 flex flex-col items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <Users className="h-5 w-5 text-blue-700" />
                        </div>
                        <div className="h-full w-px bg-border" />
                      </div>
                      <div className="space-y-1 pt-1.5">
                        <p className="text-sm font-medium">Customer Created</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(customer.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Created by {customer.owner?.fullName || 'System'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="mr-4 flex flex-col items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <Tags className="h-5 w-5 text-blue-700" />
                        </div>
                      </div>
                      <div className="space-y-1 pt-1.5">
                        <p className="text-sm font-medium">Team Member Added</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(customer.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {customer.owner?.fullName || 'Unknown'} added as a team member
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}