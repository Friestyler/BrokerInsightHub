import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HierarchicalTableCell } from "./HierarchicalTableCell";
import { NestedCountIndicator } from "./NestedCountIndicator";
import { useHierarchicalOKRs } from "@/hooks/useHierarchicalOKRs";

interface OKR {
  id: number;
  title: string;
  description?: string;
  parent?: number;
  nestedCount?: number;
  timeframe?: string;
  milestoneFrequency?: string;
  targetValue?: number;
  unit?: string;
  [key: string]: any;
}

interface ComingSoonOKRTableProps {
  okrs: OKR[];
  className?: string;
}

export function ComingSoonOKRTable({ okrs, className = "" }: ComingSoonOKRTableProps) {
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

  const formatTargetValue = (value?: number, unit?: string) => {
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
        showExpandOnHover={!hasChildren(okr.id)}
      />

      {/* Name Column */}
      <TableCell className={`p-4 align-middle text-[#282A3F] pt-[12px] pb-[12px] pl-[16px] pr-[16px] ${isChild ? 'pl-10' : ''}`}>
        <div className="flex items-center w-full">
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

      {/* Timeframe Column */}
      <TableCell className="px-3 py-2 align-middle">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
          {okr.timeframe || "Q4 2024"}
        </span>
      </TableCell>

      {/* Milestone Frequency Column */}
      <TableCell className="px-3 py-2 align-middle text-[#282A3F]">
        <div className="text-sm">
          {okr.milestoneFrequency || "Monthly"}
        </div>
      </TableCell>

      {/* Target Column */}
      <TableCell className="text-right px-3 py-2 align-middle text-[#282A3F]">
        <div className="font-medium">
          {formatTargetValue(okr.targetValue, okr.unit)}
        </div>
      </TableCell>

      {/* Actions Column */}
      <TableCell className="text-right px-3 py-2 align-middle">
        <button className="p-2 hover:bg-gray-100 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </TableCell>
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
            <TableHead 
              className="px-3 py-2 min-w-[300px]"
              style={{ 
                fontFamily: 'Poppins', 
                fontWeight: '500', 
                fontSize: '13px', 
                color: '#696C8C' 
              }}
            >
              Name
            </TableHead>
            <TableHead 
              className="px-3 py-2 min-w-[120px]"
              style={{ 
                fontFamily: 'Poppins', 
                fontWeight: '500', 
                fontSize: '13px', 
                color: '#696C8C' 
              }}
            >
              Timeframe
            </TableHead>
            <TableHead 
              className="px-3 py-2 min-w-[150px]"
              style={{ 
                fontFamily: 'Poppins', 
                fontWeight: '500', 
                fontSize: '13px', 
                color: '#696C8C' 
              }}
            >
              Milestone Frequency
            </TableHead>
            <TableHead 
              className="text-right px-3 py-2 min-w-[120px]"
              style={{ 
                fontFamily: 'Poppins', 
                fontWeight: '500', 
                fontSize: '13px', 
                color: '#696C8C' 
              }}
            >
              Target
            </TableHead>
            <TableHead 
              className="text-right px-3 py-2 min-w-[80px]"
              style={{ 
                fontFamily: 'Poppins', 
                fontWeight: '500', 
                fontSize: '13px', 
                color: '#696C8C' 
              }}
            >
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parentOKRs.map((okr) => [
            renderOKRRow(okr),
            
            // Child OKRs
            ...(expandedOKRs.has(okr.id) ? getChildren(okr.id).map((childOKR) => 
              renderOKRRow(childOKR, true)
            ) : [])
          ]).flat()}
        </TableBody>
      </Table>
    </div>
  );
}