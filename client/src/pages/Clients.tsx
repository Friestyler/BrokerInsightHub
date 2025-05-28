import { useQuery } from "@tanstack/react-query";
import { Calendar, Users, Building2, Briefcase, ArrowUpRight } from "lucide-react";
import { useCallback, useState } from "react";
import { Link } from "wouter";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface Customer {
  id: number;
  name: string;
  description: string;
  ownerId: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  
  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers', Date.now()],
    refetchOnWindowFocus: false,
    staleTime: 0,
    cacheTime: 0
  });
  
  const filteredCustomers = useCallback(() => {
    return customers
      .filter((customer) => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [customers, searchTerm, filter]);
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Customers</h1>
          <p className="text-gray-600">Manage all your customer relationships and opportunities</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Users className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : customers?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : "12"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : "3"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Renewal Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : "€285,400"}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-white rounded-lg border shadow mb-6">
        <div className="p-4 border-b flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="w-full md:w-1/3">
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex flex-row space-x-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="active">Active Opportunities</SelectItem>
                  <SelectItem value="renewal">Upcoming Renewals</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select defaultValue="name">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="created">Date Created</SelectItem>
                  <SelectItem value="updated">Last Updated</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs defaultValue="grid" className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="grid w-40 grid-cols-2">
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="grid" className="p-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers().map((customer) => (
                  <Card key={customer.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle>{customer.name}</CardTitle>
                        <Avatar className="h-8 w-8 bg-primary/10">
                          <AvatarFallback className="text-primary">
                            {customer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <CardDescription className="line-clamp-2">{customer.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {new Date(customer.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">3 Products</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">2 Contacts</span>
                        </div>
                        <div className="flex items-center">
                          <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">1 Partner</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Link href={`/clients/${customer.id}`}>
                        <Button variant="outline" className="w-full">
                          View Details <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="table">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredCustomers().length > 0 ? (
                    filteredCustomers().map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2 bg-primary/10">
                              <AvatarFallback className="text-primary">
                                {customer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {customer.name}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{customer.description}</TableCell>
                        <TableCell>
                          {new Date(customer.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/clients/${customer.id}`}>
                            <Button size="sm" variant="outline">View</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No customers found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}