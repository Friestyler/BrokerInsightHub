import { Home, BarChart2, Users, Settings, MoreHorizontal } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="fixed left-0 top-16 bottom-0 w-16 bg-white shadow-sm flex flex-col items-center py-6">
      <button className="w-10 h-10 rounded-lg flex items-center justify-center mb-6 text-primary-600 hover:bg-primary-100">
        <Home className="h-5 w-5" />
      </button>
      <button className="w-10 h-10 rounded-lg flex items-center justify-center mb-6 text-neutral-500 hover:bg-primary-100">
        <BarChart2 className="h-5 w-5" />
      </button>
      <button className="w-10 h-10 rounded-lg flex items-center justify-center mb-6 text-neutral-500 hover:bg-primary-100">
        <Users className="h-5 w-5" />
      </button>
      <button className="w-10 h-10 rounded-lg flex items-center justify-center mb-6 text-neutral-500 hover:bg-primary-100">
        <Settings className="h-5 w-5" />
      </button>
      <div className="mt-auto">
        <button className="w-10 h-10 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
