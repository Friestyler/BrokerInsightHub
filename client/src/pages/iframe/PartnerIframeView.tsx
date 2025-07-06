import React from "react";
import { useParams } from "wouter";
import { EntityDetailWrapper } from "@/components/entity/EntityDetailWrapper";

export default function PartnerIframeView() {
  const { id } = useParams();

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Partner not found</h3>
          <p className="text-gray-500">No partner ID provided.</p>
        </div>
      </div>
    );
  }

  return (
    <EntityDetailWrapper
      entityType="partner"
      entityId={id}
      isIframeMode={true}
      defaultTab="products"
      className="h-full"
      availableTabs={['products', 'overview', 'activity']}
    />
  );
}