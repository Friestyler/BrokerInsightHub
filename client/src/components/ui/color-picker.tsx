import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function ColorPicker({ value, onChange, className, disabled }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [tempColor, setTempColor] = useState(value);

  const handleColorChange = (color: string) => {
    setTempColor(color);
  };

  const handleConfirm = () => {
    onChange(tempColor);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempColor(value);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(inputValue)) {
      setTempColor(inputValue);
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className="w-12 h-8 p-0 border border-input"
            style={{ backgroundColor: value }}
          >
            <span className="sr-only">Pick a color</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-3">
            <HexColorPicker color={tempColor} onChange={handleColorChange} />
            <div className="flex items-center space-x-2">
              <Input
                value={tempColor}
                onChange={handleInputChange}
                className="w-20 h-8 text-xs"
                placeholder="#000000"
              />
              <div className="flex space-x-1">
                <Button size="sm" onClick={handleConfirm} className="h-8 px-3">
                  OK
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 px-3">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 h-8 text-xs"
        placeholder="#000000"
        disabled={disabled}
      />
    </div>
  );
}