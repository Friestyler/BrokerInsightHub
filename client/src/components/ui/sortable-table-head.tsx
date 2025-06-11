import { TableHead } from "@/components/ui/table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { SortDirection } from "@/hooks/useSorting";

interface SortableTableHeadProps {
  children: React.ReactNode;
  sortKey: string;
  currentSortKey: string;
  currentDirection: SortDirection;
  onSort: (key: string) => void;
  className?: string;
}

export function SortableTableHead({
  children,
  sortKey,
  currentSortKey,
  currentDirection,
  onSort,
  className = ""
}: SortableTableHeadProps) {
  const isSorted = currentSortKey === sortKey;
  
  const getSortIcon = () => {
    if (!isSorted) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
    }
    
    if (currentDirection === 'asc') {
      return <ChevronUp className="h-4 w-4 text-gray-600" />;
    }
    
    if (currentDirection === 'desc') {
      return <ChevronDown className="h-4 w-4 text-gray-600" />;
    }
    
    return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
  };

  return (
    <TableHead 
      className={`cursor-pointer select-none bg-white hover:bg-gray-50 ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center justify-between">
        <span className="text-[#696C8C] text-[13px] font-medium" style={{ fontFamily: 'Poppins' }}>{children}</span>
        {getSortIcon()}
      </div>
    </TableHead>
  );
}