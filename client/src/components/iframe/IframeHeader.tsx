import { Button } from "@/components/ui/button";
import { Target, Download } from "lucide-react";
import nnLogo from "@assets/NN_Group_logo_1751474283145.jpeg";

interface IframeHeaderProps {
  entityType: 'partner' | 'customer' | 'opportunity';
  entityName: string;
  entityDescription: string;
  users: any[];
  onCreateOpportunity: () => void;
  entityId?: string | number;
}

export function IframeHeader({ entityType, entityName, entityDescription, users, onCreateOpportunity, entityId = 1 }: IframeHeaderProps) {
  const getEntityInitials = () => {
    if (entityName) {
      return entityName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return entityType === 'partner' ? 'PA' : entityType === 'customer' ? 'CU' : 'OP';
  };

  const getButtonText = () => {
    switch (entityType) {
      case 'partner':
        return 'Creëer Partner Kans';
      case 'customer':
        return 'Creëer Customer Kans';
      case 'opportunity':
        return 'Creëer Kans';
      default:
        return 'Creëer Kans';
    }
  };

  return (
    <div className="bg-white px-6 py-4">
      {/* Entity name and description like in screenshot */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#5567E5] flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {getEntityInitials()}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{entityName || `${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`}</h1>
            <p className="text-sm text-gray-600">{entityDescription}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={onCreateOpportunity}
            className="bg-[#5567E5] hover:bg-[#4556D4] text-white text-sm"
          >
            {getButtonText()}
          </Button>
          
          {/* NN Logo and Partner View link */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-md border border-gray-200 flex items-center justify-center">
              <img 
                src={nnLogo} 
                alt="Nationale Nederlanden Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <a 
              href={`https://b2467d66-de54-4dad-ac15-590957373315-00-213iiygb34s0.janeway.replit.dev/broker-view/${entityType}/${entityId}?tab=opportunities&list=39`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors cursor-pointer"
            >
              Partner View
            </a>
          </div>
        </div>
      </div>
      {/* Collaborators section exactly like screenshot */}
      <div className="flex items-center space-x-4 mb-4">
        <span className="text-sm font-medium text-gray-700">Collaborators:</span>
        
        {/* Internal collaborators */}
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-1">
            {users && Array.isArray(users) && users.slice(0, 3).map((user: any, index: number) => {
              const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500'];
              return (
                <div 
                  key={user?.id || index} 
                  className={`w-8 h-8 rounded-full ${colors[index % colors.length]} border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
                  title={user?.name || 'User'}
                  onClick={() => window.location.href = `/iframe/${entityType}/${entityName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  <span className="text-xs font-medium text-white">{initials}</span>
                </div>
              );
            })}
          </div>
          <span className="text-sm text-gray-500 font-medium">Internal</span>
        </div>
        
        <div className="h-4 w-px bg-gray-300"></div>
        
        {/* External collaborators */}
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-1">
            {users && Array.isArray(users) && users.slice(3, 5).map((user: any, index: number) => {
              const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';
              const colors = ['bg-orange-500', 'bg-red-500'];
              return (
                <div 
                  key={user?.id || index} 
                  className={`w-8 h-8 rounded-full ${colors[index % colors.length]} border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
                  title={user?.name || 'User'}
                  onClick={() => window.location.href = `/iframe/${entityType}/${entityName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  <span className="text-xs font-medium text-white">{initials}</span>
                </div>
              );
            })}
          </div>
          <span className="text-sm text-gray-500 font-medium">External</span>
        </div>
      </div>

    </div>
  );
}