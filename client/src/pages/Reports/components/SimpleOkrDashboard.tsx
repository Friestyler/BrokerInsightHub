import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SimpleOkrDashboardProps {
  timeFrame: string;
  region: string;
}

const SimpleOkrDashboard: React.FC<SimpleOkrDashboardProps> = ({ timeFrame, region }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <div className="text-xs text-muted-foreground">5 active, 2 completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">62%</div>
            <Progress value={62} className="h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Metrics Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span className="text-xs">5</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-orange-400 mr-1"></div>
                <span className="text-xs">4</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                <span className="text-xs">3</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-[auto_120px_120px_1fr] gap-4 px-4 py-2 bg-gray-100 rounded-md text-sm font-medium">
          <div>Plan / Metric</div>
          <div className="text-center">Fiscal Year 2025</div>
          <div className="text-center">Milestone Progress</div>
          <div className="text-center">Overall Progress</div>
        </div>

        <div className="border rounded-md p-4">
          <h3 className="text-lg font-medium mb-2">Commerciële Groei Top Segment</h3>
          <div className="pl-6 space-y-3">
            <div className="flex items-center justify-between">
              <span>Focus nieuwe klanten</span>
              <div className="flex items-center">
                <div className="flex space-x-1 mr-4">
                  {[1, 2, 3, 4].map(i => (
                    <div 
                      key={i} 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        i <= 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <div className="w-40">
                  <Progress value={50} className="h-2 bg-orange-100" />
                  <div className="text-right text-xs mt-1">50%</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Lead generatiecampagne</span>
              <div className="flex items-center">
                <div className="flex space-x-1 mr-4">
                  {[1, 2, 3].map(i => (
                    <div 
                      key={i} 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        i <= 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <div className="w-40">
                  <Progress value={33} className="h-2 bg-orange-100" />
                  <div className="text-right text-xs mt-1">33%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-md p-4">
          <h3 className="text-lg font-medium mb-2">Performance (KPIs)</h3>
          <div className="pl-6 space-y-3">
            <div className="flex items-center justify-between">
              <span>Aantal hypotheekaanvragen</span>
              <div className="flex items-center">
                <span className="mr-4 text-sm">211 / 285 #</span>
                <div className="w-40">
                  <Progress value={74} className="h-2 bg-orange-100" />
                  <div className="text-right text-xs mt-1">74%</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Hypotheek volume</span>
              <div className="flex items-center">
                <span className="mr-4 text-sm">47.5M € / 60M €</span>
                <div className="w-40">
                  <Progress value={79} className="h-2 bg-orange-100" />
                  <div className="text-right text-xs mt-1">79%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleOkrDashboard;