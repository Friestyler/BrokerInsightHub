import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useEnvironment } from "@/contexts/EnvironmentContext";

// Base interface for all entity types
export interface EntityDetailCoreProps {
  entityId: string;
  entityType: 'partner' | 'customer' | 'opportunity';
  activeTab: string;
  activeSubTab?: string;
  isIframeMode?: boolean;
  onTabChange?: (tab: string) => void;
  onSubTabChange?: (subTab: string) => void;
}

// Universal entity data fetcher
export function useEntityData(entityType: string, entityId: string) {
  const { environment } = useEnvironment();
  
  const { data: entity, isLoading: entityLoading } = useQuery({
    queryKey: [`/api/${entityType}s/${entityId}`],
    enabled: !!entityId,
  });

  const { data: portfolioOverview, isLoading: portfolioLoading } = useQuery({
    queryKey: [`/api/${entityType}s/${entityId}/portfolio-overview`],
    enabled: !!entityId,
  });

  const { data: productAssignments, isLoading: productsLoading } = useQuery({
    queryKey: [`/api/${entityType}s/${entityId}/product-assignments`],
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

  return {
    entity,
    portfolioOverview,
    productAssignments,
    allTasks,
    timeline,
    activities,
    isLoading: entityLoading || portfolioLoading || productsLoading,
    tasksLoading,
    timelineLoading,
    activitiesLoading,
  };
}

// Context for sharing entity state
export const EntityDetailContext = React.createContext<{
  entityData: any;
  activeTab: string;
  activeSubTab?: string;
  isIframeMode: boolean;
  setActiveTab: (tab: string) => void;
  setActiveSubTab?: (subTab: string) => void;
} | null>(null);

export function EntityDetailProvider({ 
  children, 
  entityType, 
  entityId, 
  activeTab, 
  activeSubTab,
  isIframeMode = false,
  onTabChange,
  onSubTabChange 
}: {
  children: React.ReactNode;
  entityType: string;
  entityId: string;
  activeTab: string;
  activeSubTab?: string;
  isIframeMode?: boolean;
  onTabChange: (tab: string) => void;
  onSubTabChange?: (subTab: string) => void;
}) {
  const entityData = useEntityData(entityType, entityId);

  return (
    <EntityDetailContext.Provider
      value={{
        entityData,
        activeTab,
        activeSubTab,
        isIframeMode,
        setActiveTab: onTabChange,
        setActiveSubTab: onSubTabChange,
      }}
    >
      {children}
    </EntityDetailContext.Provider>
  );
}

export function useEntityDetail() {
  const context = React.useContext(EntityDetailContext);
  if (!context) {
    throw new Error('useEntityDetail must be used within EntityDetailProvider');
  }
  return context;
}