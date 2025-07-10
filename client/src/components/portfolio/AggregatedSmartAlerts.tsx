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

interface AlertData {
  type: 'coverage_gap' | 'expired_policy' | 'revenue_opportunity' | 'high_potential';
  title: string;
  description: string;
  customerCount: number;
  totalValue: number;
  backgroundColor: string;
  textColor: string;
  categories: string[];
}

interface AggregatedSmartAlertsProps {
  alerts: AlertData[];
  isLoading?: boolean;
}

interface TakeActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: AlertData | null;
}

function TakeActionModal({ isOpen, onClose, alert }: TakeActionModalProps) {
  const { toast } = useToast();
  const [isCreatingOpportunities, setIsCreatingOpportunities] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!alert) return null;

  const handleCreateOpportunities = async () => {
    setIsCreatingOpportunities(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Opportunities Created",
        description: `Created ${alert.customerCount} new opportunities based on ${alert.title.toLowerCase()} analysis.`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create opportunities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingOpportunities(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Export Complete",
        description: `${alert.title} data exported successfully.`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${alert.backgroundColor}`}>
              {alert.type === 'coverage_gap' && <AlertTriangle className={`h-5 w-5 ${alert.textColor}`} />}
              {alert.type === 'expired_policy' && <Clock className={`h-5 w-5 ${alert.textColor}`} />}
              {alert.type === 'revenue_opportunity' && <TrendingUp className={`h-5 w-5 ${alert.textColor}`} />}
              {alert.type === 'high_potential' && <Star className={`h-5 w-5 ${alert.textColor}`} />}
            </div>
            <span>Take Action: {alert.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Alert Summary */}
          <div className={`p-4 rounded-lg ${alert.backgroundColor} border`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-semibold ${alert.textColor}`}>{alert.description}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Categories: {alert.categories.join(', ')}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${alert.textColor}`}>
                  {alert.customerCount} customers
                </div>
                <div className="text-sm text-gray-600">
                  €{alert.totalValue.toLocaleString()} total value
                </div>
              </div>
            </div>
          </div>

          {/* Action Options */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Available Actions</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Create Opportunities */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">Create Opportunities</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        Generate new opportunities for all {alert.customerCount} affected customers
                      </p>
                      <Button 
                        onClick={handleCreateOpportunities}
                        disabled={isCreatingOpportunities}
                        className="mt-3 w-full"
                        size="sm"
                      >
                        {isCreatingOpportunities ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            Create {alert.customerCount} opportunities
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Export Data */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Download className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">Export Customer Data</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        Download detailed analysis and customer list for external processing
                      </p>
                      <Button 
                        onClick={handleExport}
                        disabled={isExporting}
                        variant="outline"
                        className="mt-3 w-full"
                        size="sm"
                      >
                        {isExporting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                            Exporting...
                          </>
                        ) : (
                          <>
                            Export CSV report
                            <FileText className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-3">Impact Summary</h5>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{alert.customerCount}</div>
                <div className="text-sm text-gray-600">Customers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  €{(alert.totalValue / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{alert.categories.length}</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateOpportunities} disabled={isCreatingOpportunities}>
            Take action
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AggregatedSmartAlerts({ alerts, isLoading = false }: AggregatedSmartAlertsProps) {
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTakeAction = (alert: AlertData) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!alerts?.length) {
    return (
      <div className="mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Alerts</h3>
            <p className="text-gray-600">
              Your portfolio is performing well with no critical alerts at this time.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'coverage_gap':
        return AlertTriangle;
      case 'expired_policy':
        return Clock;
      case 'revenue_opportunity':
        return TrendingUp;
      case 'high_potential':
        return Star;
      default:
        return AlertTriangle;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {alerts.map((alert, index) => {
          const IconComponent = getAlertIcon(alert.type);
          
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Alert Header */}
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${alert.backgroundColor}`}>
                      <IconComponent className={`h-5 w-5 ${alert.textColor}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {alert.title}
                    </h3>
                  </div>

                  {/* Alert Description */}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {alert.description}
                  </p>

                  {/* Take Action Button */}
                  <Button 
                    onClick={() => handleTakeAction(alert)}
                    className="w-full"
                    size="sm"
                  >
                    Take action
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <TakeActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        alert={selectedAlert}
      />
    </>
  );
}