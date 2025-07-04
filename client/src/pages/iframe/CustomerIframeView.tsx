import { useParams } from "wouter";
import { PortfolioOverviewTab } from "@/components/portfolio/PortfolioOverviewTab";
import { useEnvironment } from "@/contexts/EnvironmentContext";

export default function CustomerIframeView() {
  const { id } = useParams();
  const { environment } = useEnvironment();

  if (!id) {
    return <div className="p-6">Customer ID not found</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Clean iframe view - no navigation, no headers, just content */}
      <div className="p-6">
        <PortfolioOverviewTab 
          entityType="customers"
          entityId={id}
        />
      </div>
    </div>
  );
}