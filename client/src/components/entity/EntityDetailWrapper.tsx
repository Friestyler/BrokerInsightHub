import React, { useState } from "react";
import { EntityDetailProvider } from "./EntityDetailCore";
import { ExtractedCustomerProductsTab } from "./tabs/ExtractedCustomerProductsTab";
import { OverviewTab } from "./tabs/OverviewTab";
import { ActivityTab } from "./tabs/ActivityTab";
import { IframeHeader } from "@/components/iframe/IframeHeader";
import { PortfolioOverviewTab } from "@/components/portfolio/PortfolioOverviewTab";
import PartnerActivityHub from "@/components/activity/PartnerActivityHub";
import { useQuery } from "@tanstack/react-query";

interface EntityDetailWrapperProps {
  entityType: 'partner' | 'customer' | 'opportunity';
  entityId: string;
  isIframeMode?: boolean;
  defaultTab?: string;
  defaultSubTab?: string;
  className?: string;
  hideHeader?: boolean;
  availableTabs?: string[];
}

const DEFAULT_TABS = {
  partner: ['products', 'overview', 'activity'],
  customer: ['products', 'overview', 'activity'],
  opportunity: ['overview', 'activity']
};

export function EntityDetailWrapper({
  entityType,
  entityId,
  isIframeMode = false,
  defaultTab = 'products',
  defaultSubTab,
  className = "",
  hideHeader = false,
  availableTabs
}: EntityDetailWrapperProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [activeSubTab, setActiveSubTab] = useState(defaultSubTab);

  const tabs = availableTabs || DEFAULT_TABS[entityType] || ['overview'];

  // Fetch data for the entity
  const { data: entity, isLoading: entityLoading } = useQuery({
    queryKey: [`/api/${entityType}s/${entityId}`],
    enabled: !!entityId,
  });

  const { data: portfolioOverview, isLoading: portfolioLoading } = useQuery({
    queryKey: [`/api/${entityType}s/${entityId}/portfolio-overview`],
    enabled: !!entityId,
  });

  const { data: allTasks, isLoading: tasksLoading } = useQuery({
    queryKey: [`/api/${entityType}s/${entityId}/all-tasks`],
    enabled: !!entityId,
  });

  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: [`/api/${entityType}s/${entityId}/timeline`],
    enabled: !!entityId,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: [`/api/${entityType}s/${entityId}/activities`],
    enabled: !!entityId,
  });

  // Render tab content based on entity type and tab - EXACT MIRROR of base pages
  const renderTabContent = () => {
    if (entityLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'products':
        // Use extracted components that mirror the base pages exactly
        if (entityType === 'customer') {
          return <ExtractedCustomerProductsTab customerId={entityId} isIframeMode={isIframeMode} />;
        } else if (entityType === 'partner') {
          // For partner, we use the portfolio overview which includes products
          return <PortfolioOverviewTab entity={entity} portfolioData={portfolioOverview} />;
        }
        return <div>Products tab for {entityType} not implemented</div>;
        
      case 'overview':
        // Use the actual PortfolioOverviewTab component
        return <PortfolioOverviewTab entity={entity} portfolioData={portfolioOverview} />;
        
      case 'activity':
        // Use the actual PartnerActivityHub component
        return (
          <PartnerActivityHub 
            partnerId={entityId}
            allTasks={allTasks}
            timeline={timeline}
            activities={activities}
          />
        );
        
      default:
        return (
          <div className="bg-white border border-[#E6E7F1] rounded-lg p-16 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tab not found</h3>
            <p className="text-gray-500">The requested tab "{activeTab}" is not available.</p>
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {!hideHeader && isIframeMode && (
        <IframeHeader 
          entityType={entityType}
          entityId={entityId}
        />
      )}

      {/* Tab Navigation - only show in non-iframe mode */}
      {!isIframeMode && (
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-[#5567E5] text-[#5567E5]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}