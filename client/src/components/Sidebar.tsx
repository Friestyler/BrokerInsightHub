import { Home, BarChart2, Users, Settings, MoreHorizontal } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="fixed left-0 top-16 bottom-0 w-16 bg-primary-500 shadow-sm flex flex-col items-center py-6">
      <button className="w-10 h-10 rounded-lg flex items-center justify-center mb-6 text-white hover:bg-primary-600">
        <Home className="h-5 w-5" />
      </button>
      <button className="w-10 h-10 rounded-lg flex items-center justify-center mb-6 text-primary-200 hover:bg-primary-600">
        <BarChart2 className="h-5 w-5" />
      </button>
      <button className="w-10 h-10 rounded-lg flex items-center justify-center mb-6 text-primary-200 hover:bg-primary-600">
        <Users className="h-5 w-5" />
      </button>
      <button className="w-10 h-10 rounded-lg flex items-center justify-center mb-6 text-primary-200 hover:bg-primary-600">
        <Settings className="h-5 w-5" />
      </button>
      <div className="mt-auto">
        <button className="w-10 h-10 rounded-lg flex items-center justify-center text-primary-200 hover:bg-primary-600">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
