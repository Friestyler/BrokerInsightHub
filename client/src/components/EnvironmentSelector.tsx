import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEnvironment } from "../contexts/EnvironmentContext";
import deGoudseLogo from "../assets/de-goudse-logo.png";
import baloiseLogo from "../assets/baloise-logo.png";
import nnLogo from "@assets/NN_Group_logo_1751474283145.jpeg";
import concordiaLogo from "@assets/images-Concordia_1752649338540.png";

interface EnvironmentSelectorProps {
  collapsed?: boolean;
}

export default function EnvironmentSelector({ collapsed = false }: EnvironmentSelectorProps) {
  const { environment, setEnvironment, environments } = useEnvironment();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  
  // Helper function to get the correct logo for each environment
  const getEnvironmentLogo = (envId: string) => {
    if (envId === 'degoudse') return deGoudseLogo;
    if (envId === 'baloise') return baloiseLogo;
    if (envId === 'nn') return nnLogo;
    if (envId === 'concordia') return concordiaLogo;
    return null;
  };
  
  // If sidebar is collapsed, create a dropdown menu that can be clicked
  if (collapsed) {
    return (
      <div className="relative flex justify-center">
        {/* The icon trigger */}
        <div 
          className="flex items-center justify-center w-10 h-10 text-xs rounded-md hover:bg-indigo-50 cursor-pointer"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {getEnvironmentLogo(environment.id) ? (
            <div className="w-7 h-7 flex items-center justify-center">
              <img 
                src={getEnvironmentLogo(environment.id)!} 
                alt={environment.name} 
                className={environment.id === 'degoudse' ? "w-6 h-4 object-contain" : "w-6 h-5 object-contain"}
              />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-sm flex items-center justify-center text-gray-700 bg-gray-50 border border-gray-200 uppercase hover:bg-indigo-50">
              {environment.name.substring(0, 2)}
            </div>
          )}
        </div>
        
        {/* Dropdown that appears on click */}
        {isDropdownOpen && (
          <div className="absolute left-16 top-0 bg-white border border-gray-200 rounded-md shadow-md py-1 z-50 w-48">
            {environments.map(env => (
              <div 
                key={env.id} 
                className={`flex items-center p-2 cursor-pointer ${env.id === environment.id ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-indigo-50 hover:text-indigo-600'}`}
                onClick={() => {
                  setEnvironment(env.id);
                  setIsDropdownOpen(false);
                }}
              >
                <div className="flex items-center justify-center w-7 h-7 mr-2 text-xs">
                  {getEnvironmentLogo(env.id) ? (
                    <img 
                      src={getEnvironmentLogo(env.id)!} 
                      alt={env.name} 
                      className={env.id === 'degoudse' ? "w-6 h-4 object-contain" : "w-5 h-4 object-contain"}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-sm flex items-center justify-center text-gray-700 uppercase">
                      {env.name.substring(0, 2)}
                    </div>
                  )}
                </div>
                <span className="font-medium text-sm">{env.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  // Full environment selector for expanded sidebar
  return (
    <div className="w-full mx-auto">
      <div className="relative">
        <Select value={environment.id} onValueChange={setEnvironment}>
          <SelectTrigger className="environment-selector-bg w-full flex items-center justify-between py-3 px-4 rounded-md border border-gray-200 focus:outline-none hover:bg-indigo-50 hover:text-indigo-600 focus:text-indigo-600 focus:bg-indigo-50">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-7 h-7 mr-3 text-xs">
                {getEnvironmentLogo(environment.id) ? (
                  <img 
                    src={getEnvironmentLogo(environment.id)!} 
                    alt={environment.name} 
                    className={environment.id === 'degoudse' ? "w-6 h-4 object-contain" : "w-6 h-5 object-contain"}
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
                    {getEnvironmentLogo(env.id) ? (
                      <img 
                        src={getEnvironmentLogo(env.id)!} 
                        alt={env.name} 
                        className={env.id === 'degoudse' ? "w-6 h-4 object-contain" : "w-5 h-4 object-contain"}
                      />
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