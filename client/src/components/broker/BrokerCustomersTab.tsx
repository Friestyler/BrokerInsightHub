import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface BrokerCustomersTabProps {
  partnerId: string;
  customers: any[];
  selectedCustomers: number[];
  setSelectedCustomers: (ids: number[]) => void;
}

export default function BrokerCustomersTab({
  partnerId,
  customers,
  selectedCustomers,
  setSelectedCustomers
}: BrokerCustomersTabProps) {
  
  // Safety check for customers data
  const safeCustomers = Array.isArray(customers) ? customers : [];

  return (
    <div className="space-y-4">
      {/* Statistics Overview for customers */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold text-[#282A3F]">{safeCustomers.length}</div>
          <div className="text-sm text-gray-500">Total customers</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold text-[#282A3F]">
            {safeCustomers.reduce((total: number, customer: any) => total + (customer.opportunityCount || 0), 0)}
          </div>
          <div className="text-sm text-gray-500">Total opportunities</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold text-[#282A3F]">
            €{safeCustomers.reduce((total: number, customer: any) => total + (customer.totalValue || 0), 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Total value</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold text-[#282A3F]">
            {safeCustomers.filter((customer: any) => customer.status === 'Active').length}
          </div>
          <div className="text-sm text-gray-500">Active</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold text-[#282A3F]">
            {safeCustomers.filter((customer: any) => customer.lastActivity && new Date(customer.lastActivity) > new Date(Date.now() - 30*24*60*60*1000)).length}
          </div>
          <div className="text-sm text-gray-500">Recent activity</div>
        </div>
      </div>

      {/* Customers table without toolbar controls */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox 
                  checked={selectedCustomers.length === safeCustomers.length && safeCustomers.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCustomers(safeCustomers.map(customer => customer.id));
                    } else {
                      setSelectedCustomers([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Contact person</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Opportunities</TableHead>
              <TableHead>Total value</TableHead>
              <TableHead>Last activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeCustomers.map((customer: any) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedCustomers.includes(customer.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCustomers([...selectedCustomers, customer.id]);
                      } else {
                        setSelectedCustomers(selectedCustomers.filter(id => id !== customer.id));
                      }
                    }}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {customer.name}
                </TableCell>
                <TableCell>{customer.industry}</TableCell>
                <TableCell>{customer.contactPerson}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {customer.opportunityCount || 0}
                  </Badge>
                </TableCell>
                <TableCell>
                  €{(customer.totalValue || 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  {customer.lastActivity ? new Date(customer.lastActivity).toLocaleDateString() : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}