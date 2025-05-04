import NavigationTiles from "@/components/NavigationTiles";

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-800">My Broker AI Tools</h1>
          <p className="text-neutral-600 mt-1">Access intelligent tools to enhance your brokerage efficiency</p>
        </div>
        
        <NavigationTiles />
      </div>
    </div>
  );
}
