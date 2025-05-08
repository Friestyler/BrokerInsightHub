import NavigationTiles from "@/components/NavigationTiles";

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          {/* Removed Qollabi name as requested */}
          <p className="text-neutral-600 mt-1">Access intelligent tools to enhance your brokerage efficiency</p>
        </div>
        
        <NavigationTiles />
        
        {/* Latest Insurance News section removed as requested */}
      </div>
    </div>
  );
}
