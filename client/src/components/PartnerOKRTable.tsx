import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HierarchicalTableCell } from "./HierarchicalTableCell";
import { NestedCountIndicator } from "./NestedCountIndicator";
import { useHierarchicalOKRs } from "@/hooks/useHierarchicalOKRs";

interface OKR {
  id: number;
  title: string;
  description?: string;
  parent?: number;
  targetValue: number;
  realizedValue?: number;
  unit: 'currency' | 'percentage' | 'number';
  endDate?: string;
  [key: string]: any;
}

interface PartnerOKRTableProps {
  okrs: OKR[];
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

export function PartnerOKRTable({
  okrs,
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
}: PartnerOKRTableProps) {
  const {
    expandedOKRs,
    selectedOKRs,
    setSelectedOKRs,
    nestedCounts,
    hasChildren,
    getChildren,
    parentOKRs,
    toggleOKRExpansion,
    handleSelectionChange
  } = useHierarchicalOKRs(okrs);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newOKRName.trim() && creatingUnderOKR && onCreateOKR) {
      onCreateOKR(creatingUnderOKR, newOKRName, newOKRType);
    } else if (e.key === 'Escape' && onCancelCreation) {
      onCancelCreation();
    }
  };

  const formatValue = (value?: number, unit?: string) => {
    if (!value) return "—";
    if (unit === 'currency') return `€${(value / 1000000).toFixed(1)}M`;
    if (unit === 'percentage') return `${value}%`;
    return value.toString();
  };

  const renderOKRRow = (okr: OKR, isChild = false) => (
    <TableRow key={okr.id} className={`hover:bg-[#F5F6FA] border-b group ${isChild ? 'bg-gray-50/30' : ''}`} style={{ borderColor: '#E6E7F1' }}>
      <HierarchicalTableCell
        checked={selectedOKRs.includes(okr.id)}
        onSelectionChange={(checked) => handleSelectionChange(okr.id, checked)}
        isExpanded={expandedOKRs.has(okr.id)}
        hasChildren={hasChildren(okr.id)}
        onToggleExpansion={() => toggleOKRExpansion(okr.id)}
        showExpandOnHover={!hasChildren(okr.id) && showInlineCreation}
      />

      {/* Name Column */}
      <TableCell className={`p-4 align-middle text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]`}>
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
          
          <NestedCountIndicator count={nestedCounts.get(okr.id) || 0} />
          
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
          {formatValue(okr.realizedValue, okr.unit)}
        </div>
      </TableCell>

      {/* Target Value */}
      <TableCell className="text-right p-4 align-middle text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px]">
        <div className="font-medium">
          {formatValue(okr.targetValue, okr.unit)}
        </div>
      </TableCell>

      {/* Current Milestone */}
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

      {/* Traffic Lights */}
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
        {creatingUnderOKR === parentId ? (
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
        ) : (
          <div className="flex items-center gap-4 w-full">
            <Button
              variant="ghost"
              onClick={() => onStartCreation?.(parentId)}
              className="text-blue-600 hover:text-blue-700 px-0 h-auto font-normal"
            >
              Create new activity
            </Button>
            <span className="text-gray-400">or</span>
            <Button
              variant="ghost"
              className="text-blue-600 hover:text-blue-700 px-0 h-auto font-normal"
            >
              Select existing activity
            </Button>
          </div>
        )}
      </TableCell>
      
      <TableCell colSpan={3}></TableCell>
    </TableRow>
  );

  return (
    <div className={className}>
      <Table className="border-b min-w-full" style={{ borderColor: '#E6E7F1' }}>
        <TableHeader>
          <TableRow className="border-b hover:bg-[#F5F6FA] group" style={{ borderColor: '#E6E7F1' }}>
            <TableHead className="w-12 px-3 py-2">
              <input
                type="checkbox"
                checked={okrs.length > 0 && okrs.every(okr => selectedOKRs.includes(okr.id))}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedOKRs(okrs.map(okr => okr.id));
                  } else {
                    setSelectedOKRs([]);
                  }
                }}
                className="rounded border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ 
                  opacity: okrs.some(okr => selectedOKRs.includes(okr.id)) ? 1 : undefined 
                }}
              />
            </TableHead>
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
              Current Milestone
            </TableHead>
            <TableHead className="text-[#696C8C] font-medium" style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: '500' }}>
              Due Date
            </TableHead>
            <TableHead className="text-[#696C8C] font-medium" style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: '500' }}>
              Traffic Lights
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
            ...(showInlineCreation && expandedOKRs.has(okr.id) ? 
              [renderInlineCreationRow(okr.id)] : []
            )
          ]).flat()}
        </TableBody>
      </Table>
    </div>
  );
}