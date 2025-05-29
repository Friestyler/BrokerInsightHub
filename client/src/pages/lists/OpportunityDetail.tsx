import { useState } from 'react';
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

// Fetch opportunity from database
const useOpportunityData = (id: string) => {
  return useQuery({
    queryKey: ['/api/opportunities', id],
    queryFn: async () => {
      const response = await fetch(`/api/opportunities/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch opportunity');
      }
      return response.json();
    }
  });
};

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: opportunity, isLoading, error } = useOpportunityData(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading opportunity...</p>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load opportunity details</p>
          <Link href="/lists/opportunities">
            <Button variant="outline">Back to Opportunities</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-800',
      'discovery': 'bg-blue-100 text-blue-800',
      'proposal': 'bg-yellow-100 text-yellow-800',
      'negotiation': 'bg-orange-100 text-orange-800',
      'closed_won': 'bg-green-100 text-green-800',
      'closed_lost': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/lists/opportunities">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{opportunity.title}</h1>
          <p className="text-gray-600">{opportunity.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Value</label>
                  <p className="text-lg font-semibold">{formatCurrency(opportunity.estimatedValue || 0)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Probability</label>
                  <p className="text-lg font-semibold">{opportunity.probability}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Stage</label>
                  <Badge className={getStatusColor(opportunity.stage || 'active')}>
                    {opportunity.stage || 'Active'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="text-lg">{opportunity.type || 'Opportunity'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-gray-500">Progress</label>
                <Progress value={opportunity.probability || 0} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>
                    {opportunity.clientName ? opportunity.clientName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'CL'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{opportunity.clientName || 'Unknown Client'}</p>
                  <p className="text-sm text-gray-500">Client ID: {opportunity.clientId}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Details */}
          <Card>
            <CardHeader>
              <CardTitle>Key Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Expected Close Date</label>
                <p>{opportunity.expected_close_date ? new Date(opportunity.expected_close_date).toLocaleDateString() : 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Partner</label>
                <p>{opportunity.partnerName || 'No partner assigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p>{opportunity.location || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Priority</label>
                <Badge variant={opportunity.priority === 'high' ? 'destructive' : 'secondary'}>
                  {opportunity.priority || 'Medium'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                Edit Opportunity
              </Button>
              <Button className="w-full" variant="outline">
                View Client Details
              </Button>
              <Button className="w-full" variant="outline">
                Contact Partner
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}