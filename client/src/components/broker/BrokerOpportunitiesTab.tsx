import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, MessageSquare } from "lucide-react";

interface BrokerOpportunitiesTabProps {
  partnerId: string;
  opportunities: any[];
  selectedOpportunities: number[];
  setSelectedOpportunities: (ids: number[]) => void;
  handleAssessmentUpdate: (id: number, assessment: string) => void;
  setSelectedOpportunityForWithhold: (opportunity: any) => void;
  setIsWithholdModalOpen: (open: boolean) => void;
  setSelectedOpportunityForHistory: (opportunity: any) => void;
  setIsCommentsHistoryDialogOpen: (open: boolean) => void;
}

export default function BrokerOpportunitiesTab({
  partnerId,
  opportunities,
  selectedOpportunities,
  setSelectedOpportunities,
  handleAssessmentUpdate,
  setSelectedOpportunityForWithhold,
  setIsWithholdModalOpen,
  setSelectedOpportunityForHistory,
  setIsCommentsHistoryDialogOpen
}: BrokerOpportunitiesTabProps) {

  return (
    <div className="space-y-4">
      {/* Statistics cards showing summary data */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold text-[#282A3F]">{opportunities.length}</div>
          <div className="text-sm text-gray-500">Total Opportunities</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold text-[#282A3F]">
            {opportunities.reduce((total: number, opp: any) => total + (opp.estimatedValue || 0), 0).toLocaleString('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}
          </div>
          <div className="text-sm text-gray-500">Total Value</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold text-[#282A3F]">
            {opportunities.filter((opp: any) => opp.stage === 'Proposal').length}
          </div>
          <div className="text-sm text-gray-500">In Proposal</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold text-[#282A3F]">
            {opportunities.filter((opp: any) => opp.stage === 'Negotiation').length}
          </div>
          <div className="text-sm text-gray-500">In Negotiation</div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="text-xl font-semibold text-[#282A3F]">
            {Math.round(opportunities.filter((opp: any) => opp.stage === 'Closed Won').length / opportunities.length * 100) || 0}%
          </div>
          <div className="text-sm text-gray-500">Win Rate</div>
        </div>
      </div>

      {/* Opportunities table with assessment and comment functionality */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox 
                  checked={selectedOpportunities.length === opportunities.length && opportunities.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedOpportunities(opportunities.map(opp => opp.id));
                    } else {
                      setSelectedOpportunities([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Assessment</TableHead>
              <TableHead>Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.map((opportunity: any) => (
              <TableRow key={opportunity.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedOpportunities.includes(opportunity.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedOpportunities([...selectedOpportunities, opportunity.id]);
                      } else {
                        setSelectedOpportunities(selectedOpportunities.filter(id => id !== opportunity.id));
                      }
                    }}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {opportunity.title}
                </TableCell>
                <TableCell>{opportunity.customer?.name || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={opportunity.stage === 'Closed Won' ? 'default' : 'secondary'}>
                    {opportunity.stage}
                  </Badge>
                </TableCell>
                <TableCell>
                  {opportunity.estimatedValue?.toLocaleString('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) || 'N/A'}
                </TableCell>
                {/* Assessment Column - copied exactly from PartnerDetail.tsx */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    {opportunity.assessment === 'pending' || !opportunity.assessment ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2 border-green-300 text-green-700 hover:bg-green-50"
                          onClick={() => handleAssessmentUpdate(opportunity.id, 'accepted')}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2 border-red-300 text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedOpportunityForWithhold(opportunity);
                            setIsWithholdModalOpen(true);
                          }}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Withhold
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        {opportunity.assessment === 'accepted' ? (
                          <>
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-300 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Accepted
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setSelectedOpportunityForWithhold(opportunity);
                                setIsWithholdModalOpen(true);
                              }}
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-300 text-xs">
                              <XCircle className="w-3 h-3 mr-1" />
                              Withheld
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-green-600 hover:bg-green-50"
                              onClick={() => handleAssessmentUpdate(opportunity.id, 'accepted')}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                {/* Comments Column - copied exactly from PartnerDetail.tsx */}
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 hover:bg-gray-100"
                    onClick={() => {
                      setSelectedOpportunityForHistory(opportunity);
                      setIsCommentsHistoryDialogOpen(true);
                    }}
                  >
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}