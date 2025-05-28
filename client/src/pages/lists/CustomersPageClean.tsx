import { useState } from 'react';
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Clean customer data - single dummy record
const cleanCustomers = [
  {
    id: 1,
    name: "Sample Customer",
    partnerId: 1,
    partnerName: "Sample Partner",
    industry: "Insurance",
    size: "medium",
    status: "active",
    products: 1,
    opportunities: 0,
    initials: "SC",
    lastContact: "2025-05-28",
    annualRevenue: "$1M-$5M",
    location: "Demo Location"
  }
];

export default function CustomersPageClean() {
  const { currentEnvironment } = useEnvironment();
  
  const displayedCustomers = cleanCustomers;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer relationships and track opportunities
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {displayedCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {customer.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Partner: {customer.partnerName}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {customer.industry}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {customer.size}
                      </Badge>
                      <Badge 
                        variant={customer.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {customer.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    Revenue: {customer.annualRevenue}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Location: {customer.location}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last Contact: {customer.lastContact}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}