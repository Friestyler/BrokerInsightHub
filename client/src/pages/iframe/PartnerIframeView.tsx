import React from "react";
import { useParams } from "wouter";

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

  // Direct iframe to the actual partner detail page
  // This ensures 100% mirroring with zero maintenance
  const iframeUrl = `/lists/partners/${id}?iframe=true`;

  return (
    <div className="w-full" style={{ height: '100vh' }}>
      <iframe
        src={iframeUrl}
        className="w-full border-0"
        style={{ height: '100vh', minHeight: '800px' }}
        title={`Partner ${id} Details`}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      />
    </div>
  );
}