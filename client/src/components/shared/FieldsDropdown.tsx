import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface FieldsDropdownProps {
  visibleFields: Record<string, boolean>;
  onFieldsChange: (fields: Record<string, boolean>) => void;
  fieldLabels: Record<string, string>;
  className?: string;
}

export function FieldsDropdown({ 
  visibleFields, 
  onFieldsChange, 
  fieldLabels,
  className = "" 
}: FieldsDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [originalFields, setOriginalFields] = useState<Record<string, boolean> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect changes from original state
  const hasFieldChanges = () => {
    if (!originalFields) return false;
    return JSON.stringify(originalFields) !== JSON.stringify(visibleFields);
  };

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (hasFieldChanges()) {
          setOriginalFields(null);
        }
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hasFieldChanges]);

  // Open dropdown and capture original state
  const handleDropdownOpen = () => {
    setOriginalFields(JSON.parse(JSON.stringify(visibleFields)));
    setShowDropdown(!showDropdown);
  };

  // Revert to original state
  const handleRevert = () => {
    if (originalFields) {
      onFieldsChange(originalFields);
      setOriginalFields(null);
    }
    setShowDropdown(false);
  };

  // Save changes and close
  const handleSave = () => {
    setOriginalFields(null);
    setShowDropdown(false);
  };

  const visibleCount = Object.values(visibleFields).filter(Boolean).length;
  const totalCount = Object.keys(visibleFields).length;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={handleDropdownOpen}
        className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-md transition-colors ${
          hasFieldChanges() 
            ? 'bg-blue-50 border-blue-200 text-blue-700' 
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M9 3v18"/>
          <path d="M15 3v18"/>
        </svg>
        Fields
        <span className="text-xs text-gray-500">
          ({visibleCount}/{totalCount})
        </span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Column Visibility</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const allSelected = Object.values(visibleFields).every(Boolean);
                    if (allSelected) {
                      // Keep first field always visible, uncheck others
                      const fieldKeys = Object.keys(visibleFields);
                      const newFields = { ...visibleFields };
                      fieldKeys.forEach((key, index) => {
                        newFields[key] = index === 0; // Keep first field visible
                      });
                      onFieldsChange(newFields);
                    } else {
                      // Select all
                      const newFields = { ...visibleFields };
                      Object.keys(newFields).forEach(key => {
                        newFields[key] = true;
                      });
                      onFieldsChange(newFields);
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {Object.values(visibleFields).every(Boolean) ? 'Deselect all' : 'Select all'}
                </button>
              </div>
            </div>
          </div>

          {/* Fields List */}
          <div className="p-2 max-h-96 overflow-y-auto">
            {Object.entries(visibleFields).map(([fieldKey, isVisible]) => (
              <label key={fieldKey} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => {
                    onFieldsChange({
                      ...visibleFields,
                      [fieldKey]: e.target.checked
                    });
                  }}
                  className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {fieldLabels[fieldKey] || fieldKey}
                </span>
              </label>
            ))}
          </div>

          {/* Footer */}
          {hasFieldChanges() && (
            <div className="p-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={handleRevert}
                className="text-sm text-gray-600 hover:text-gray-700"
              >
                Revert changes
              </button>
              <Button
                onClick={handleSave}
                size="sm"
                className="bg-[#5567E5] text-white hover:bg-[#4A5DD8]"
              >
                Save
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}