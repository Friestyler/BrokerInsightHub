import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ToolHeader from "@/components/ToolHeader";
import { type Client, type Opportunity, type InsuranceProduct } from "@shared/schema";

interface ClientWithOpportunity extends Client {
  currentProducts: InsuranceProduct[];
  opportunity: InsuranceProduct;
  probability: number;
  estimatedValue: number;
}

export default function PredictOpportunities() {
  const { data: opportunities, isLoading, refetch } = useQuery<ClientWithOpportunity[]>({
    queryKey: ['/api/opportunities'],
  });

  const handleRefresh = () => {
    refetch();
  };

  const headerActions = (
    <>
      <Button variant="outline" size="sm" className="text-neutral-700">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
          <path d="M12 3v12" />
          <path d="m8 11 4 4 4-4" />
          <path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4" />
        </svg>
        Export
      </Button>
      <Button size="sm" onClick={handleRefresh}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </svg>
        Refresh Data
      </Button>
    </>
  );

  const renderStatCards = () => {
    if (isLoading) {
      return Array(3).fill(0).map((_, i) => (
        <Card key={i} className="bg-neutral-50 rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-2 w-full rounded-full mb-2" />
          <Skeleton className="h-4 w-28" />
        </Card>
      ));
    }

    return (
      <>
        <Card className="bg-neutral-50 rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-neutral-800">Total Opportunities</h3>
            <span className="text-2xl font-bold text-primary-600">47</span>
          </div>
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div className="h-2 bg-primary-500 rounded-full" style={{ width: '65%' }}></div>
          </div>
          <p className="text-xs text-neutral-500 mt-2">15 new opportunities this month</p>
        </Card>
        
        <Card className="bg-neutral-50 rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-neutral-800">Success Rate</h3>
            <span className="text-2xl font-bold text-green-600">28%</span>
          </div>
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div className="h-2 bg-green-500 rounded-full" style={{ width: '28%' }}></div>
          </div>
          <p className="text-xs text-neutral-500 mt-2">↑ 3% increase from last month</p>
        </Card>
        
        <Card className="bg-neutral-50 rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-neutral-800">Potential Revenue</h3>
            <span className="text-2xl font-bold text-primary-600">€24.7K</span>
          </div>
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div className="h-2 bg-primary-500 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <p className="text-xs text-neutral-500 mt-2">Based on conversion projections</p>
        </Card>
      </>
    );
  };

  const renderOpportunitiesTable = () => {
    if (isLoading) {
      return (
        <div className="p-6 text-center">
          <Skeleton className="h-72 w-full" />
        </div>
      );
    }

    const opportunitiesSample = [
      {
        id: 1,
        name: 'Van Damme BVBA',
        type: 'Commercial Client',
        initials: 'VD',
        currentProducts: [{ id: 1, name: 'Property', category: 'Commercial' }, { id: 2, name: 'Liability', category: 'Commercial' }],
        opportunity: { id: 3, name: 'Cyber Insurance', category: 'Commercial' },
        probability: 85,
        estimatedValue: 2450
      },
      {
        id: 2,
        name: 'Laura Martens',
        type: 'Individual Client',
        initials: 'LM',
        currentProducts: [{ id: 4, name: 'Auto', category: 'Personal' }, { id: 5, name: 'Home', category: 'Personal' }],
        opportunity: { id: 6, name: 'Life Insurance', category: 'Personal' },
        probability: 65,
        estimatedValue: 890
      },
      {
        id: 3,
        name: 'Green Tech SA',
        type: 'Commercial Client',
        initials: 'GT',
        currentProducts: [{ id: 1, name: 'Property', category: 'Commercial' }],
        opportunity: { id: 7, name: 'Business Interruption', category: 'Commercial' },
        probability: 90,
        estimatedValue: 3200
      }
    ];

    const clientsToDisplay = opportunities || opportunitiesSample;

    return (
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Current Products</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Opportunity</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Probability</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Est. Value</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {clientsToDisplay.map((client) => (
            <tr key={client.id} className="hover:bg-neutral-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">{client.initials}</div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-neutral-800">{client.name}</div>
                    <div className="text-xs text-neutral-500">{client.type}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-1">
                  {client.currentProducts.map((product) => (
                    <span key={product.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.name}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {client.opportunity.name}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-16 bg-neutral-200 rounded-full h-2 mr-2">
                    <div 
                      className={`h-2 rounded-full ${client.probability >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                      style={{ width: `${client.probability}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-neutral-800">{client.probability}%</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">€{client.estimatedValue.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button variant="link" className="text-primary-600 hover:text-primary-900 mr-3">Contact</Button>
                <Button variant="link" className="text-neutral-600 hover:text-neutral-900">Details</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="p-6 pl-8">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-white rounded-xl p-6 border border-neutral-200">
          <ToolHeader 
            title="Predict Cross & Upsell Opportunities" 
            actions={headerActions}
          />
          
          <div className="mb-6 bg-primary-50 border border-primary-200 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 md:mr-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-1">Upload your portfolio data</h3>
              <p className="text-neutral-600 text-sm">Upload your client portfolio data to get AI-powered cross and upsell predictions</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Upload CSV File
              </Button>
              <Button size="lg" variant="outline" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M8 12h8" />
                  <path d="M8 16h8" />
                  <path d="M8 20h8" />
                </svg>
                Upload Excel File
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {renderStatCards()}
          </div>
          
          <Card className="border border-neutral-200 rounded-lg overflow-hidden">
            <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <h3 className="font-medium text-neutral-800 mb-2 sm:mb-0">Client Opportunity List</h3>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Input placeholder="Search clients..." className="pl-8" />
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Products" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="home">Home Insurance</SelectItem>
                      <SelectItem value="auto">Auto Insurance</SelectItem>
                      <SelectItem value="life">Life Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {renderOpportunitiesTable()}
            </div>
            
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-neutral-200">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-neutral-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of <span className="font-medium">47</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button variant="outline" size="icon" className="rounded-l-md">
                      <span className="sr-only">Previous</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </Button>
                    <Button variant="outline" className="bg-primary-50 text-primary-600 border-primary-300 hover:bg-primary-100">1</Button>
                    <Button variant="outline">2</Button>
                    <Button variant="outline">3</Button>
                    <Button variant="outline" disabled>...</Button>
                    <Button variant="outline">8</Button>
                    <Button variant="outline" size="icon" className="rounded-r-md">
                      <span className="sr-only">Next</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          </Card>
        </Card>
      </div>
    </div>
  );
}
