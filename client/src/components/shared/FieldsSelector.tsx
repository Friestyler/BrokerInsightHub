import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Columns3 } from "lucide-react";

interface FieldDefinition {
  key: string;
  label: string;
  required?: boolean;
}

interface FieldsSelectorProps {
  fields: FieldDefinition[];
  visibleFields: string[];
  onFieldsChange: (fields: string[]) => void;
  className?: string;
}

export function FieldsSelector({ 
  fields, 
  visibleFields, 
  onFieldsChange, 
  className = "" 
}: FieldsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFieldToggle = (fieldKey: string, checked: boolean) => {
    const field = fields.find(f => f.key === fieldKey);
    if (field?.required && !checked) {
      // Don't allow unchecking required fields
      return;
    }

    if (checked) {
      onFieldsChange([...visibleFields, fieldKey]);
    } else {
      onFieldsChange(visibleFields.filter(f => f !== fieldKey));
    }
  };

  const handleSelectAll = () => {
    onFieldsChange(fields.map(f => f.key));
  };

  const handleDeselectAll = () => {
    // Only keep required fields
    onFieldsChange(fields.filter(f => f.required).map(f => f.key));
  };

  const visibleCount = visibleFields.length;
  const totalCount = fields.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`${className} text-gray-600 hover:text-gray-800 hover:bg-gray-50`}
        >
          <Columns3 className="mr-2 h-4 w-4" />
          Fields
          <span className="ml-1 text-xs text-gray-500">({visibleCount}/{totalCount})</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Column Visibility</h4>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSelectAll}
                className="h-6 px-2 text-xs"
              >
                Select All
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleDeselectAll}
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {fields.map((field) => (
              <div key={field.key} className="flex items-center space-x-2">
                <Checkbox
                  id={field.key}
                  checked={visibleFields.includes(field.key)}
                  onCheckedChange={(checked) => handleFieldToggle(field.key, checked as boolean)}
                  disabled={field.required}
                />
                <label 
                  htmlFor={field.key} 
                  className={`text-sm flex-1 cursor-pointer ${
                    field.required ? 'text-gray-500' : 'text-gray-700'
                  }`}
                >
                  {field.label}
                  {field.required && <span className="text-xs text-gray-400 ml-1">(Required)</span>}
                </label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}