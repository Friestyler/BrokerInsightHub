import { useState } from "react";
import { ActiveTool } from "@/lib/types";
import ToolCard from "@/components/ToolCard";
import NewsSection from "@/pages/news/NewsSection";
import CompareSection from "@/pages/compare/CompareSection";
import PredictSection from "@/pages/predict/PredictSection";

export default function Home() {
  const [activeTool, setActiveTool] = useState<ActiveTool>("news");

  const handleToolSelect = (tool: ActiveTool) => {
    setActiveTool(tool);
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">My Broker AI tools</h1>
        <p className="text-neutral-600 mt-2">Access powerful AI tools to enhance your broker business</p>
      </div>

      {/* Main Navigation Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <ToolCard
          icon="newspaper"
          title="Latest Insurance News in Belgium"
          description="Stay updated with the latest insurance news, regulations, and market trends"
          onClick={() => handleToolSelect("news")}
          isSelected={activeTool === "news"}
        />
        
        <ToolCard
          icon="file-text"
          title="Compare Files & Create Email"
          description="Compare insurance policies and automatically generate client emails"
          onClick={() => handleToolSelect("compare")}
          isSelected={activeTool === "compare"}
        />
        
        <ToolCard
          icon="pie-chart"
          title="Predict Cross and Upsell Opportunities"
          description="Identify potential cross-selling and upselling opportunities with AI"
          onClick={() => handleToolSelect("predict")}
          isSelected={activeTool === "predict"}
        />
      </div>

      {/* Content Sections */}
      {activeTool === "news" && <NewsSection />}
      {activeTool === "compare" && <CompareSection />}
      {activeTool === "predict" && <PredictSection />}
    </>
  );
}
