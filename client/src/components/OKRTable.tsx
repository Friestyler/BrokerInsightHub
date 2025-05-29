import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface OKR {
  id: number;
  title: string;
  description?: string;
  targetValue: number;
  realizedValue?: number;
  unit: 'currency' | 'percentage' | 'number';
  parent?: number;
  type: string;
  endDate?: string;
  tags?: string[];
}

interface OKRTableProps {
  okrs: OKR[];
  selectedOKRs: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  expandedOKRs: Set<number>;
  onToggleExpansion: (id: number) => void;
  showInlineCreation?: boolean;
  onCreateOKR?: (parentId: number, title: string, type: string) => void;
  creatingUnderOKR?: number | null;
  onStartCreation?: (parentId: number) => void;
  onCancelCreation?: () => void;
  newOKRName?: string;
  onNewOKRNameChange?: (name: string) => void;
  newOKRType?: string;
  onNewOKRTypeChange?: (type: string) => void;
  className?: string;
}

export function OKRTable({
  okrs,
  selectedOKRs,
  onSelectionChange,
  expandedOKRs,
  onToggleExpansion,
  showInlineCreation = false,
  onCreateOKR,
  creatingUnderOKR,
  onStartCreation,
  onCancelCreation,
  newOKRName = "",
  onNewOKRNameChange,
  newOKRType = "number",
  onNewOKRTypeChange,
  className = ""
}: OKRTableProps) {
  
  // Calculate nested count for each OKR
  const calculateNestedCounts = () => {
    const countsMap = new Map();
    okrs.forEach(okr => {
      const childrenCount = okrs.filter(child => child.parent === okr.id).length;
      countsMap.set(okr.id, childrenCount);
    });
    return countsMap;
  };

  const nestedCounts = calculateNestedCounts();

  // Check if an OKR has children
  const hasChildren = (okr: OKR) => {
    return nestedCounts.get(okr.id) > 0;
  };

  // Get children of an OKR
  const getChildren = (parentId: number) => {
    return okrs.filter(okr => okr.parent === parentId);
  };

  // Get only parent OKRs (no parent field)
  const parentOKRs = okrs.filter(okr => !okr.parent);

  const handleSelectionChange = (okrId: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedOKRs, okrId]);
    } else {
      onSelectionChange(selectedOKRs.filter(id => id !== okrId));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newOKRName.trim() && creatingUnderOKR && onCreateOKR) {
      onCreateOKR(creatingUnderOKR, newOKRName, newOKRType);
    } else if (e.key === 'Escape' && onCancelCreation) {
      onCancelCreation();
    }
  };

  const renderOKRRow = (okr: OKR, isChild = false) => (
    <TableRow key={okr.id} className={`hover:bg-[#F5F6FA] border-b group ${isChild ? 'bg-gray-50/30' : ''}`} style={{ borderColor: '#E6E7F1' }}>
      {/* Checkbox Column with Expand Arrow */}
      <TableCell className="w-12 px-1 py-3">
        <div className="flex items-center" style={{ gap: '4px' }}>
          <input
            type="checkbox"
            checked={selectedOKRs.includes(okr.id)}
            onChange={(e) => handleSelectionChange(okr.id, e.target.checked)}
            className="rounded border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ opacity: selectedOKRs.includes(okr.id) ? 1 : undefined }}
          />
          {/* Expand/collapse arrows */}
          {hasChildren(okr) ? (
            <button
              onClick={() => onToggleExpansion(okr.id)}
              className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
              style={{ width: '20px', height: '20px' }}
            >
              <svg 
                width="8" 
                height="13" 
                viewBox="0 0 8 13" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ 
                  transform: expandedOKRs.has(okr.id) ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}
              >
                <path d="M6.83984 6.28516C7.08594 6.55859 7.08594 6.96875 6.83984 7.21484L1.58984 12.4648C1.31641 12.7383 0.90625 12.7383 0.660156 12.4648C0.386719 12.2188 0.386719 11.8086 0.660156 11.5625L5.44531 6.77734L0.660156 1.96484C0.386719 1.71875 0.386719 1.30859 0.660156 1.0625C0.90625 0.789062 1.31641 0.789062 1.5625 1.0625L6.83984 6.28516Z" fill="#696C8C"/>
              </svg>
            </button>
          ) : showInlineCreation ? (
            <button
              onClick={() => onStartCreation?.(okr.id)}
              className="p-1 hover:bg-gray-100 rounded flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ width: '20px', height: '20px' }}
            >
              <svg 
                width="8" 
                height="13" 
                viewBox="0 0 8 13" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6.83984 6.28516C7.08594 6.55859 7.08594 6.96875 6.83984 7.21484L1.58984 12.4648C1.31641 12.7383 0.90625 12.7383 0.660156 12.4648C0.386719 12.2188 0.386719 11.8086 0.660156 11.5625L5.44531 6.77734L0.660156 1.96484C0.386719 1.71875 0.386719 1.30859 0.660156 1.0625C0.90625 0.789062 1.31641 0.789062 1.5625 1.0625L6.83984 6.28516Z" fill="#696C8C"/>
              </svg>
            </button>
          ) : (
            <div style={{ width: '20px', height: '20px' }}></div>
          )}
        </div>
      </TableCell>

      {/* Name Column */}
      <TableCell className="p-4 align-middle text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
        <div className={`flex items-center w-full ${isChild ? 'pl-6' : ''}`}>
          <span 
            className="text-[#282A3F]"
            style={{ 
              fontFamily: 'Poppins', 
              fontWeight: '400', 
              fontSize: '14px' 
            }}
          >
            {okr.title}
          </span>
          
          {/* Nested count icon */}
          {nestedCounts.get(okr.id) > 0 && (
            <div className="flex items-center" style={{ marginLeft: '4px' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="4" cy="4" r="2" fill="#666666"/>
                <circle cx="12" cy="12" r="2" fill="#666666"/>
                <path d="M4 6C4 8 6 10 10 12" stroke="#666666" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
              <span className="text-xs text-gray-500 ml-1">{nestedCounts.get(okr.id)}</span>
            </div>
          )}
          
          {/* Description icon */}
          {okr.description && (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="8" 
              viewBox="0 0 14 8" 
              fill="none" 
              className="text-gray-400 hover:text-gray-600 cursor-help flex-shrink-0"
              style={{ minWidth: '14px', minHeight: '8px', marginLeft: '4px' }}
            >
              <rect width="14" height="1" fill="currentColor"/>
              <rect y="3.5" width="14" height="1" fill="currentColor"/>
              <rect y="7" width="7" height="1" fill="currentColor"/>
            </svg>
          )}
        </div>
      </TableCell>

      {/* Realized Value */}
      <TableCell className="text-right p-4 align-middle text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
        <div className="font-medium">
          {okr.realizedValue ? (
            okr.unit === 'currency' 
              ? `€${(okr.realizedValue / 1000000).toFixed(1)}M`
              : okr.unit === 'percentage'
              ? `${okr.realizedValue}%`
              : okr.realizedValue.toString()
          ) : "—"}
        </div>
      </TableCell>

      {/* Target Value */}
      <TableCell className="text-right p-4 align-middle text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
        <div className="font-medium">
          {okr.unit === 'currency' 
            ? `€${(okr.targetValue / 1000000).toFixed(1)}M`
            : okr.unit === 'percentage'
            ? `${okr.targetValue}%`
            : okr.targetValue?.toString() || "—"
          }
        </div>
      </TableCell>

      {/* Period */}
      <TableCell className="p-4 align-middle text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
            {(() => {
              const now = new Date();
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return monthNames[now.getMonth()];
            })()}
          </span>
        </div>
      </TableCell>

      {/* Due Date */}
      <TableCell className="p-4 align-middle text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
        <div className="text-sm">
          {okr.endDate ? new Date(okr.endDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }) : '—'}
        </div>
      </TableCell>

      {/* Status */}
      <TableCell className="p-4 align-middle text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <div className="w-3 h-3 rounded-full bg-gray-200"></div>
          <div className="w-3 h-3 rounded-full bg-gray-200"></div>
        </div>
      </TableCell>

      {/* Progress */}
      <TableCell className="p-4 align-middle text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full"
              style={{ 
                width: `${okr.targetValue && okr.realizedValue 
                  ? Math.min((okr.realizedValue / okr.targetValue) * 100, 100)
                  : 0}%`
              }}
            ></div>
          </div>
          <span className="text-xs text-gray-500 min-w-[35px]">
            {okr.targetValue && okr.realizedValue 
              ? `${Math.round((okr.realizedValue / okr.targetValue) * 100)}%`
              : '0%'
            }
          </span>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right p-4 align-middle">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );

  const renderInlineCreationRow = (parentId: number) => (
    <TableRow key={`add-${parentId}`} className="border-b" style={{ borderColor: '#E6E7F1' }}>
      <TableCell className="w-12 px-1 py-3"></TableCell>
      
      <TableCell colSpan={5} className="p-4 align-middle text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
        <div className="flex items-center gap-2">
          <Input
            value={newOKRName}
            onChange={(e) => onNewOKRNameChange?.(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter activity name..."
            className="flex-1 border-0 focus:border-0 focus:ring-0 focus-visible:ring-0 focus-visible:border-0 active:border-0 shadow-none text-sm bg-transparent p-0 outline-none"
            style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
            autoFocus
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white border-[#E6E7F1] text-[#282A3F] hover:bg-[#F5F6FA] hover:border-[#D4D7E3] hover:text-[#282A3F] px-3 py-1 h-8 flex items-center gap-2"
                style={{ fontFamily: 'Poppins', fontSize: '12px' }}
              >
                {newOKRType === 'currency' && (
                  <>
                    <span className="text-[#696C8C] font-bold">€</span>
                    <span>Currency</span>
                  </>
                )}
                {newOKRType === 'percentage' && (
                  <>
                    <span className="text-[#696C8C] font-bold">%</span>
                    <span>Percentage</span>
                  </>
                )}
                {newOKRType === 'number' && (
                  <>
                    <span className="text-[#696C8C] font-bold">#</span>
                    <span>Number</span>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onNewOKRTypeChange?.('number')}>
                <span className="text-[#696C8C] font-bold mr-2">#</span>
                Number
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNewOKRTypeChange?.('percentage')}>
                <span className="text-[#696C8C] font-bold mr-2">%</span>
                Percentage
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNewOKRTypeChange?.('currency')}>
                <span className="text-[#696C8C] font-bold mr-2">€</span>
                Currency
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
      
      <TableCell colSpan={3}></TableCell>
    </TableRow>
  );

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: '#E6E7F1' }}>
            <TableHead className="w-12"></TableHead>
            <TableHead className="text-[#696C8C] font-medium" style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: '500' }}>
              Activity Name
            </TableHead>
            <TableHead className="text-right text-[#696C8C] font-medium" style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: '500' }}>
              Realized
            </TableHead>
            <TableHead className="text-right text-[#696C8C] font-medium" style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: '500' }}>
              Target
            </TableHead>
            <TableHead className="text-[#696C8C] font-medium" style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: '500' }}>
              Period
            </TableHead>
            <TableHead className="text-[#696C8C] font-medium" style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: '500' }}>
              Due Date
            </TableHead>
            <TableHead className="text-[#696C8C] font-medium" style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: '500' }}>
              Status
            </TableHead>
            <TableHead className="text-[#696C8C] font-medium" style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: '500' }}>
              Progress
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parentOKRs.map((okr) => [
            renderOKRRow(okr),
            
            // Child OKRs
            ...(expandedOKRs.has(okr.id) ? getChildren(okr.id).map((childOKR) => 
              renderOKRRow(childOKR, true)
            ) : []),
            
            // Inline creation row
            ...(showInlineCreation && expandedOKRs.has(okr.id) && creatingUnderOKR === okr.id ? 
              [renderInlineCreationRow(okr.id)] : []
            )
          ]).flat()}
        </TableBody>
      </Table>
    </div>
  );
}