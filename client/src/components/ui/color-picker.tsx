import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const colorOptions = [
  { value: "#3B82F6", name: "Blue" },
  { value: "#10B981", name: "Green" },
  { value: "#F59E0B", name: "Orange" },
  { value: "#EF4444", name: "Red" },
  { value: "#8B5CF6", name: "Purple" },
  { value: "#06B6D4", name: "Cyan" },
  { value: "#84CC16", name: "Lime" },
  { value: "#F97316", name: "Amber" },
  { value: "#EC4899", name: "Pink" },
  { value: "#6B7280", name: "Gray" }
];

export function ColorPicker({ value, onChange, className, disabled }: ColorPickerProps) {
  const selectedColor = colorOptions.find(color => color.value === value) || colorOptions[0];

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn("w-32", className)}>
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded border border-gray-300" 
            style={{ backgroundColor: value }}
          />
          <SelectValue placeholder="Select color" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {colorOptions.map((color) => (
          <SelectItem key={color.value} value={color.value}>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border border-gray-300" 
                style={{ backgroundColor: color.value }}
              />
              {color.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}