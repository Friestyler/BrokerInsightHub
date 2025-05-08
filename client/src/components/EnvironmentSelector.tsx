import React from "react";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEnvironment } from "../contexts/EnvironmentContext";

interface EnvironmentSelectorProps {
  collapsed?: boolean;
}

export default function EnvironmentSelector({ collapsed = false }: EnvironmentSelectorProps) {
  const { environment, setEnvironment, environments } = useEnvironment();
  
  // If sidebar is collapsed, just show the logo/icon
  if (collapsed) {
    return (
      <div className="flex justify-center">
        <div className="flex items-center justify-center w-9 h-9 bg-white text-xs font-semibold">
          {environment.logo ? (
            <img 
              src={environment.logo} 
              alt={environment.name} 
              className="w-6 h-6"
            />
          ) : (
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white uppercase">
              {environment.name.substring(0, 2)}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Full environment selector for expanded sidebar
  return (
    <div className="w-full mx-auto">
      <div className="relative">
        <Select value={environment.id} onValueChange={setEnvironment}>
          <SelectTrigger className="w-full flex items-center justify-between py-2 px-3 border-none focus:outline-none focus:ring-0 focus:ring-offset-0 shadow-none">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 mr-2 text-xs font-semibold">
                {environment.logo ? (
                  <img 
                    src={environment.logo} 
                    alt={environment.name} 
                    className="w-6 h-6"
                  />
                ) : (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white uppercase">
                    {environment.name.substring(0, 2)}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-gray-800">{environment.name}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </SelectTrigger>
          <SelectContent className="border border-gray-200 shadow-md">
            {environments.map(env => (
              <SelectItem key={env.id} value={env.id} className="focus:bg-gray-100">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-7 h-7 mr-2 text-xs font-semibold">
                    {env.logo ? (
                      <img src={env.logo} alt={env.name} className="w-5 h-5" />
                    ) : (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white uppercase">
                        {env.name.substring(0, 2)}
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-sm">{env.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}