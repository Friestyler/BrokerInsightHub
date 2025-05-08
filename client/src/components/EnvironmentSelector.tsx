import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Import logos
import acmeLogo from "../assets/acme-logo.svg";
import qollabiLogo from "../assets/qollabi-placeholder.svg";

export interface Environment {
  id: string;
  name: string;
  logo?: string;
}

interface EnvironmentSelectorProps {
  collapsed?: boolean;
}

export default function EnvironmentSelector({ collapsed = false }: EnvironmentSelectorProps) {
  const [environments] = useState<Environment[]>([
    { id: "acme", name: "ACME CO", logo: acmeLogo },
    { id: "myqollabi", name: "My Qollabi", logo: qollabiLogo },
    { id: "globex", name: "Globex Corp" },
    { id: "oceanic", name: "Oceanic Airlines" },
  ]);
  
  const [selectedEnv, setSelectedEnv] = useState<string>("acme");
  
  const handleEnvironmentChange = (envId: string) => {
    setSelectedEnv(envId);
  };
  
  const getSelectedEnvironment = () => {
    return environments.find(env => env.id === selectedEnv) || environments[0];
  };
  
  // If sidebar is collapsed, just show the logo/icon
  if (collapsed) {
    return (
      <div className="flex justify-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gray-100 text-xs font-semibold">
          {getSelectedEnvironment().logo ? (
            <img 
              src={getSelectedEnvironment().logo} 
              alt={getSelectedEnvironment().name} 
              className="w-6 h-6"
            />
          ) : (
            getSelectedEnvironment().name.substring(0, 2)
          )}
        </div>
      </div>
    );
  }
  
  // Full environment selector for expanded sidebar
  return (
    <div className="w-full mx-auto">
      <div className="relative">
        <Select value={selectedEnv} onValueChange={handleEnvironmentChange}>
          <SelectTrigger className="w-full flex items-center justify-between py-3 px-4 rounded-md bg-white border border-gray-200 focus:outline-none">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 mr-3 text-xs font-semibold">
                {getSelectedEnvironment().logo ? (
                  <img 
                    src={getSelectedEnvironment().logo} 
                    alt={getSelectedEnvironment().name} 
                    className="w-5 h-5"
                  />
                ) : (
                  getSelectedEnvironment().name.substring(0, 2)
                )}
              </div>
              <span className="text-lg font-semibold">{getSelectedEnvironment().name}</span>
            </div>
            <ChevronDown className="h-5 w-5 text-gray-500" />
          </SelectTrigger>
          <SelectContent>
            {environments.map(env => (
              <SelectItem key={env.id} value={env.id}>
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 mr-3 text-xs font-semibold">
                    {env.logo ? (
                      <img src={env.logo} alt={env.name} className="w-5 h-5" />
                    ) : (
                      env.name.substring(0, 2)
                    )}
                  </div>
                  <span className="font-medium">{env.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}