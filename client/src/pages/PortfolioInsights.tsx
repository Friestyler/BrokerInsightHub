import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, Search } from "lucide-react";

export default function PortfolioInsights() {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <div className="container mx-auto px-4 py-6 max-w-full">
      {/* Top Navigation */}
      <div className="flex space-x-1 mb-10">
        <Button 
          variant="ghost" 
          className={activeSection === 'dashboard' ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" : ""}
          onClick={() => setActiveSection('dashboard')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Dashboard
        </Button>

        <Button 
          variant="ghost"
          className={activeSection === 'whitespace' ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" : ""}
          onClick={() => setActiveSection('whitespace')}
        >
          <Search className="h-4 w-4 mr-2" />
          White Space Analysis
        </Button>
      </div>

      {/* Dashboard Section */}
      {activeSection === 'dashboard' && (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Portfolio Dashboard</h2>
          <p className="text-gray-600">Dashboard content will be implemented here</p>
        </div>
      )}

      {/* White Space Analysis Section */}
      {activeSection === 'whitespace' && (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">White Space Analysis</h2>
          <p className="text-gray-600">White space analysis content will be implemented here</p>
        </div>
      )}
    </div>
  );
}