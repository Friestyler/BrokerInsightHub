import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface AdvancedTimeframeFilterProps {
  value?: string;
  onValueChange?: (value: string, dateRange?: { from: Date | undefined; to: Date | undefined }) => void;
  placeholder?: string;
  dateRange?: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange?: (dateRange: { from: Date | undefined; to: Date | undefined }) => void;
  className?: string;
}

export function AdvancedTimeframeFilter({ value, onValueChange, placeholder, dateRange, onDateRangeChange, className }: AdvancedTimeframeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(value || '');
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });


  const presetOptions = [
    { section: 'Quick', items: [
      { value: 'today', label: 'Today' },
      { value: 'yesterday', label: 'Yesterday' },
      { value: 'last-7-days', label: 'Last 7 days' },
      { value: 'last-14-days', label: 'Last 14 days' },
      { value: 'last-30-days', label: 'Last 30 days' },
      { value: 'last-60-days', label: 'Last 60 days' },
      { value: 'last-90-days', label: 'Last 90 days' },
    ]},
    { section: 'Months', items: [
      { value: 'last-month', label: 'Last month' },
      { value: 'this-month', label: 'This month' },
      { value: 'next-month', label: 'Next month' },
      { value: 'last-3-months', label: 'Last 3 months' },
      { value: 'last-6-months', label: 'Last 6 months' },
    ]},
    { section: 'Quarters', items: [
      { value: 'last-quarter', label: 'Last quarter' },
      { value: 'this-quarter', label: 'This quarter' },
      { value: 'next-quarter', label: 'Next quarter' },
    ]},
    { section: 'Years', items: [
      { value: 'last-year', label: 'Last year' },
      { value: 'this-year', label: 'This year' },
      { value: 'next-year', label: 'Next year' },
      { value: 'year-to-date', label: 'Year to date' },
    ]},
    { section: 'Future', items: [
      { value: 'next-7-days', label: 'Next 7 days' },
      { value: 'next-14-days', label: 'Next 14 days' },
      { value: 'next-30-days', label: 'Next 30 days' },
      { value: 'next-60-days', label: 'Next 60 days' },
    ]},
    { section: 'Other', items: [
      { value: 'all-time', label: 'All time' },
      { value: 'since', label: 'Since' },
      { value: 'custom', label: 'Custom' },
    ]},
  ];

  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset);
    if (preset !== 'custom' && preset !== 'since') {
      setCustomDateRange({ from: undefined, to: undefined });
      onValueChange?.(preset);
    }
  };

  const handleApply = () => {
    if (selectedPreset === 'custom' || selectedPreset === 'since') {
      onValueChange?.(selectedPreset, customDateRange);
    } else {
      onValueChange?.(selectedPreset);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (selectedPreset === 'custom' && customDateRange?.from) {
      if (customDateRange.to) {
        return `${format(customDateRange.from, "MMM dd, y")} - ${format(customDateRange.to, "MMM dd, y")}`;
      }
      return format(customDateRange.from, "MMM dd, y");
    }
    
    if (selectedPreset) {
      const preset = presetOptions
        .flatMap(section => section.items)
        .find(item => item.value === selectedPreset);
      return preset?.label || selectedPreset;
    }
    
    return 'Select timeframe 2';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`justify-start text-left font-normal transition-colors ${
            value || dateRange?.from || dateRange?.to
              ? 'bg-[#E6E7F1] text-[#51536C] hover:bg-[#D5D7E5] hover:text-[#3E4257]'
              : 'bg-white hover:bg-gray-50'
          } ${className}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {getDisplayText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Left sidebar with preset options */}
          <div className="w-56 border-r border-gray-200 max-h-96 overflow-y-auto">
            {presetOptions.map((section) => (
              <div key={section.section} className="p-2">
                <div className="text-xs font-medium text-gray-500 mb-2 px-2">
                  {section.section.toUpperCase()}
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => handlePresetSelect(item.value)}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 flex items-center ${
                        selectedPreset === item.value 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-700'
                      }`}
                    >
                      {selectedPreset === item.value && (
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className="flex-1">{item.label}</span>
                      {item.value === 'custom' && (
                        <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right side - Calendar and time inputs */}
          {(selectedPreset === 'custom' || selectedPreset === 'since') && (
            <div className="p-4 min-w-[600px]">
              {/* Date inputs */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedPreset === 'since' ? 'Since date' : 'Start date'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customDateRange?.from ? format(customDateRange.from, "MMM dd, yyyy") : ''}
                      placeholder="Select date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      readOnly
                    />
                    <button className="absolute right-2 top-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M18 6L6 18"></path>
                        <path d="M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {selectedPreset === 'custom' && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customDateRange?.to ? format(customDateRange.to, "MMM dd, yyyy") : ''}
                        placeholder="Select date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        readOnly
                      />
                      <button className="absolute right-2 top-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M18 6L6 18"></path>
                          <path d="M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>



              {/* Calendar */}
              <Calendar
                mode="range"
                selected={customDateRange}
                onSelect={(date: any) => {
                  setCustomDateRange(date || { from: undefined, to: undefined });
                }}
                numberOfMonths={2}
                className="rounded-md border"
              />

              {/* Action buttons */}
              <div className="flex items-center justify-end mt-4 pt-4 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700">
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}