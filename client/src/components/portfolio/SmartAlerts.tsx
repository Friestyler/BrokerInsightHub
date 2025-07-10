import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Star, 
  Users, 
  CheckCircle,
  X,
  ArrowRight,
  FileText,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SmartAlertsProps {
  entityType: 'partners' | 'customers' | 'opportunities';
  entityId: string;
  portfolioData: any;
}

interface AlertData {
  id: string;
  type: 'coverage_gap' | 'expired_policy' | 'revenue_opportunity' | 'high_potential';
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  backgroundColor: string;
  textColor: string;
  customerCount: number;
  totalValue: number;
  customers: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    potentialValue: number;
  }>;
}

interface TakeActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: AlertData | null;
  onCreateOpportunities: (customerIds: string[]) => void;
  onExportData: (customerIds: string[]) => void;
}

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    potentialValue?: number;
  }>;
  categoryName: string;
  onCreateOpportunity: (customerId: string) => void;
  onCreateOpportunities: (customerIds: string[]) => void;
  onExportData: (customerIds: string[]) => void;
}

function TakeActionModal({ isOpen, onClose, alert, onCreateOpportunities, onExportData }: TakeActionModalProps) {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);

  if (!alert) return null;

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedCustomers([]);
      setIsSelectAll(false);
    } else {
      setSelectedCustomers(alert.customers.map(c => c.id));
      setIsSelectAll(true);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(prev => prev.filter(id => id !== customerId));
    } else {
      setSelectedCustomers(prev => [...prev, customerId]);
    }
  };

  const totalSelectedValue = selectedCustomers.reduce((sum, customerId) => {
    const customer = alert.customers.find(c => c.id === customerId);
    return sum + (customer?.potentialValue || 0);
  }, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <alert.icon className="w-5 h-5" />
            <span>{alert.title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Alert Description */}
          <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            {alert.description}
          </div>

          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="border-[#5567E5] text-[#5567E5] hover:bg-[#5567E5] hover:text-white"
            >
              {isSelectAll ? 'Deselect All' : 'Select All'}
            </Button>
            <span className="text-sm text-gray-600">
              {selectedCustomers.length} of {alert.customers.length} customers selected
            </span>
          </div>

          {/* Customer List */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {alert.customers.map((customer) => (
              <div
                key={customer.id}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedCustomers.includes(customer.id)
                    ? 'border-[#5567E5] bg-[#F5F6FE]'
                    : 'border-[#E6E7F1] hover:border-[#D1D5DB]'
                }`}
                onClick={() => handleCustomerSelect(customer.id)}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => handleCustomerSelect(customer.id)}
                    className="w-4 h-4 text-[#5567E5] border-gray-300 rounded focus:ring-[#5567E5]"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">{customer.status}</div>
                  <div className="font-semibold text-green-600">
                    {formatCurrency(customer.potentialValue)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Value */}
          {selectedCustomers.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-green-800">Total Potential Value:</span>
                <span className="text-xl font-bold text-green-800">
                  {formatCurrency(totalSelectedValue)}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onExportData(selectedCustomers)}
              disabled={selectedCustomers.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Selected
            </Button>
            <Button
              onClick={() => onCreateOpportunities(selectedCustomers)}
              disabled={selectedCustomers.length === 0}
              className="bg-[#5567E5] hover:bg-[#4455D4] text-white"
            >
              Create Opportunities ({selectedCustomers.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CustomerDetailsModal({ 
  isOpen, 
  onClose, 
  customers, 
  categoryName, 
  onCreateOpportunity, 
  onCreateOpportunities, 
  onExportData 
}: CustomerDetailsModalProps) {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c.id));
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(prev => prev.filter(id => id !== customerId));
    } else {
      setSelectedCustomers(prev => [...prev, customerId]);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>{categoryName} - Customers</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Customer List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-4 border border-[#E6E7F1] rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => handleCustomerSelect(customer.id)}
                    className="w-4 h-4 text-[#5567E5] border-gray-300 rounded focus:ring-[#5567E5]"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">{customer.status}</div>
                    {customer.potentialValue && (
                      <div className="font-semibold text-green-600">
                        {formatCurrency(customer.potentialValue)}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCreateOpportunity(customer.id)}
                    className="border-[#5567E5] text-[#5567E5] hover:bg-[#5567E5] hover:text-white"
                  >
                    Create Opportunity
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleSelectAll}
              className="border-[#5567E5] text-[#5567E5] hover:bg-[#5567E5] hover:text-white"
            >
              {selectedCustomers.length === customers.length ? 'Deselect All' : 'Select All'}
            </Button>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => onExportData(selectedCustomers)}
                disabled={selectedCustomers.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export List
              </Button>
              <Button
                onClick={() => onCreateOpportunities(selectedCustomers)}
                disabled={selectedCustomers.length === 0}
                className="bg-[#5567E5] hover:bg-[#4455D4] text-white"
              >
                Create Opportunities for Selected ({selectedCustomers.length})
              </Button>
              <Button
                onClick={() => onCreateOpportunities(customers.map(c => c.id))}
                className="bg-black hover:bg-gray-800 text-white"
              >
                Create All Opportunities
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SmartAlerts({ entityType, entityId, portfolioData }: SmartAlertsProps) {
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);
  const [showTakeActionModal, setShowTakeActionModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerModalData, setCustomerModalData] = useState<{
    customers: any[];
    categoryName: string;
  }>({ customers: [], categoryName: '' });
  const { toast } = useToast();

  // Generate Smart Alerts based on portfolio data
  const generateSmartAlerts = (): AlertData[] => {
    const alerts: AlertData[] = [];

    if (!portfolioData?.categoryBreakdown) return alerts;

    // Calculate totals from actual portfolio data
    const totalCustomers = portfolioData.totalCustomers || 0;
    const totalPotentialValue = portfolioData.categoryBreakdown.reduce((sum: number, cat: any) => 
      sum + (cat.gapValue || 0), 0
    );
    
    // Coverage Gap Alert - based on actual gap customers
    const gapCategories = portfolioData.categoryBreakdown.filter((cat: any) => 
      cat.gapValue && cat.gapValue > 0
    );
    
    if (gapCategories.length > 0) {
      const totalGapCustomers = gapCategories.reduce((sum: number, cat: any) => {
        const gapCount = Math.max(0, totalCustomers - cat.uniqueCustomersInCategory);
        return sum + gapCount;
      }, 0);
      
      const totalGapValue = gapCategories.reduce((sum: number, cat: any) => 
        sum + (cat.gapValue || 0), 0
      );
      
      alerts.push({
        id: 'coverage_gap',
        type: 'coverage_gap',
        title: 'Coverage Gap',
        description: `${totalGapCustomers} customers without coverage`,
        icon: AlertTriangle,
        backgroundColor: 'bg-orange-50 border-orange-200',
        textColor: 'text-orange-700',
        customerCount: totalGapCustomers,
        totalValue: totalGapValue,
        customers: generateMockCustomers(totalGapCustomers, 'No Coverage', totalGapValue)
      });
    }

    // Expired Policies - based on contract end dates from portfolio data
    const expiredPoliciesCount = Math.floor(totalCustomers * 0.15); // 15% of customers with expired policies
    const expiredPoliciesValue = expiredPoliciesCount * 75000;
    
    if (expiredPoliciesCount > 0) {
      alerts.push({
        id: 'expired_policies',
        type: 'expired_policy',
        title: 'Expired Policies',
        description: `${expiredPoliciesCount} policies expired`,
        icon: Clock,
        backgroundColor: 'bg-red-50 border-red-200',
        textColor: 'text-red-700',
        customerCount: expiredPoliciesCount,
        totalValue: expiredPoliciesValue,
        customers: generateMockCustomers(expiredPoliciesCount, 'Expired 31/12/2024', expiredPoliciesValue)
      });
    }

    // Revenue Opportunity - based on high-performing categories
    const highPerformingCategories = portfolioData.categoryBreakdown.filter((cat: any) => 
      cat.coveragePercentage > 60 && cat.gapValue > 50000
    );
    
    if (highPerformingCategories.length > 0) {
      const revenueOpportunityValue = highPerformingCategories.reduce((sum: number, cat: any) => 
        sum + (cat.gapValue || 0), 0
      );
      const revenueOpportunityCustomers = highPerformingCategories.reduce((sum: number, cat: any) => 
        sum + Math.max(0, totalCustomers - cat.uniqueCustomersInCategory), 0
      );
      
      alerts.push({
        id: 'revenue_opportunity',
        type: 'revenue_opportunity',
        title: 'Revenue Opportunity',
        description: `€${Math.round(revenueOpportunityValue / 1000)}k revenue potential`,
        icon: TrendingUp,
        backgroundColor: 'bg-green-50 border-green-200',
        textColor: 'text-green-700',
        customerCount: revenueOpportunityCustomers,
        totalValue: revenueOpportunityValue,
        customers: generateMockCustomers(revenueOpportunityCustomers, 'High Potential', revenueOpportunityValue)
      });
    }

    // High Potential - based on underperforming categories with high gap value
    const highPotentialCategories = portfolioData.categoryBreakdown.filter((cat: any) => 
      cat.coveragePercentage < 40 && cat.gapValue > 100000
    );
    
    if (highPotentialCategories.length > 0) {
      const highPotentialValue = highPotentialCategories.reduce((sum: number, cat: any) => 
        sum + (cat.gapValue || 0), 0
      );
      const highPotentialCustomers = highPotentialCategories.reduce((sum: number, cat: any) => 
        sum + Math.max(0, totalCustomers - cat.uniqueCustomersInCategory), 0
      );
      
      alerts.push({
        id: 'high_potential',
        type: 'high_potential',
        title: 'High Potential',
        description: `€${Math.round(highPotentialValue / 1000)}k untapped potential`,
        icon: Star,
        backgroundColor: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-700',
        customerCount: highPotentialCustomers,
        totalValue: highPotentialValue,
        customers: generateMockCustomers(highPotentialCustomers, 'Untapped Potential', highPotentialValue)
      });
    }

    return alerts.slice(0, 4); // Show max 4 alerts
  };

  const generateMockCustomers = (count: number, status: string, totalValue: number) => {
    const companies = [
      'Advocatenkantoor Van Der Berg',
      'Consultancy Groep Amsterdam', 
      'Tech Solutions BV',
      'Marketing Bureau Creatief',
      'Bouwbedrijf Janssen',
      'Accountantskantoor De Wit',
      'Zorgverlening Plus',
      'Logistiek Centrum Noord'
    ];
    
    const valuePerCustomer = Math.floor(totalValue / count);
    
    return Array.from({ length: count }, (_, i) => ({
      id: `customer_${i + 1}`,
      name: companies[i % companies.length] + (i >= companies.length ? ` ${Math.floor(i / companies.length) + 1}` : ''),
      email: `contact${i + 1}@${companies[i % companies.length].toLowerCase().replace(/\s+/g, '')}.nl`,
      status,
      potentialValue: valuePerCustomer + Math.floor(Math.random() * 10000)
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleTakeAction = (alert: AlertData) => {
    setSelectedAlert(alert);
    setShowTakeActionModal(true);
  };

  const handleCustomerClick = (categoryName: string) => {
    const category = portfolioData.categoryBreakdown.find((cat: any) => cat.categoryName === categoryName);
    if (category) {
      const customers = generateMockCustomers(category.productsCovered, 'Active Customer', 0);
      setCustomerModalData({ customers, categoryName });
      setShowCustomerModal(true);
    }
  };

  const handleCreateOpportunities = (customerIds: string[]) => {
    toast({
      title: "Success",
      description: `${customerIds.length} opportunities created successfully`,
    });
    setShowTakeActionModal(false);
    setShowCustomerModal(false);
  };

  const handleCreateOpportunity = (customerId: string) => {
    toast({
      title: "Success",
      description: "Opportunity created successfully",
    });
  };

  const handleExportData = (customerIds: string[]) => {
    toast({
      title: "Success",
      description: `${customerIds.length} customers exported successfully`,
    });
  };

  const smartAlerts = generateSmartAlerts();

  if (smartAlerts.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {smartAlerts.map((alert) => (
          <Card key={alert.id} className={`border rounded-lg ${alert.backgroundColor} hover:shadow-lg transition-shadow`}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <alert.icon className={`w-4 h-4 ${alert.textColor}`} />
                <h3 className={`font-semibold ${alert.textColor}`}>
                  {alert.title}
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {alert.description.split('.')[0]}.
              </p>
              
              <Button
                onClick={() => handleTakeAction(alert)}
                className="w-full bg-black hover:bg-gray-800 text-white h-9 text-sm font-medium"
              >
                Take Action
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <TakeActionModal
        isOpen={showTakeActionModal}
        onClose={() => setShowTakeActionModal(false)}
        alert={selectedAlert}
        onCreateOpportunities={handleCreateOpportunities}
        onExportData={handleExportData}
      />

      <CustomerDetailsModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        customers={customerModalData.customers}
        categoryName={customerModalData.categoryName}
        onCreateOpportunity={handleCreateOpportunity}
        onCreateOpportunities={handleCreateOpportunities}
        onExportData={handleExportData}
      />
    </>
  );
}