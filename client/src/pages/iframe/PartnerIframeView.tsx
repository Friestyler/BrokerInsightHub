import { useParams } from "wouter";
import { PortfolioOverviewTab } from "@/components/portfolio/PortfolioOverviewTab";
import { useEnvironment } from "@/contexts/EnvironmentContext";

export default function PartnerIframeView() {
  const { id } = useParams();
  const { environment } = useEnvironment();

  if (!id) {
    return <div className="p-6">Partner ID not found</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Clean iframe view - no navigation, no headers, just content */}
      <div className="p-6">
        <PortfolioOverviewTab 
          entityType="partners"
          entityId={id}
        />
      </div>
    </div>
  );
}