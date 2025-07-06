import React from "react";
import { PortfolioOverviewTab } from "@/components/portfolio/PortfolioOverviewTab";
import { useEntityDetail } from "../EntityDetailCore";

interface OverviewTabProps {
  className?: string;
}

export function OverviewTab({ className = "" }: OverviewTabProps) {
  const { entityData } = useEntityDetail();
  const { entity, portfolioOverview } = entityData;

  return (
    <div className={className}>
      <PortfolioOverviewTab 
        entity={entity}
        portfolioData={portfolioOverview}
      />
    </div>
  );
}