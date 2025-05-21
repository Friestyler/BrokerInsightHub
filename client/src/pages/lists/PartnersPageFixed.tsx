// This file acts as a temporary placeholder until we fix the issues with PartnersPage.tsx
// It won't be used directly, but will help the application start properly

import { useState } from 'react';

export function PartnersTable() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Partners List</h1>
      <p className="mb-4">This is a placeholder for the partners list page.</p>
    </div>
  );
}

export default function PartnersPage() {
  return <PartnersTable />;
}