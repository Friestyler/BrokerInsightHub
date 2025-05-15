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
        <div className="flex items-center justify-center w-10 h-10 text-xs rounded-md hover:bg-indigo-50 cursor-pointer">
          {environment.logo ? (
            <img 
              src={environment.logo} 
              alt={environment.name} 
              className="w-7 h-7"
            />
          ) : (
            <div className="w-7 h-7 rounded-sm flex items-center justify-center text-gray-700 bg-gray-50 border border-gray-200 uppercase hover:bg-indigo-50">
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
          <SelectTrigger className="w-full flex items-center justify-between py-3 px-4 rounded-md bg-gray-50 border border-gray-200 focus:outline-none hover:bg-indigo-50 hover:text-indigo-600 focus:text-indigo-600 focus:bg-indigo-50">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-7 h-7 mr-3 text-xs">
                {environment.logo ? (
                  <img 
                    src={environment.logo} 
                    alt={environment.name} 
                    className="w-6 h-6"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center text-gray-700 uppercase">
                    {environment.name.substring(0, 2)}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">{environment.name}</span>
            </div>
          </SelectTrigger>
          <SelectContent className="border border-gray-200 shadow-md p-1 bg-white">
            {environments.map(env => (
              <SelectItem key={env.id} value={env.id} className="py-2 px-2 focus:bg-indigo-50 focus:text-indigo-600 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-md mx-1 my-0.5">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-7 h-7 mr-2 text-xs">
                    {env.logo ? (
                      <img src={env.logo} alt={env.name} className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 rounded-sm flex items-center justify-center text-gray-700 uppercase">
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