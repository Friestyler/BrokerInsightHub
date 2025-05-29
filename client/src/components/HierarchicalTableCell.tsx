import { ReactNode } from "react";
import { TableCell } from "@/components/ui/table";
import { ExpandCollapseButton } from "./ExpandCollapseButton";
import { SelectionCheckbox } from "./SelectionCheckbox";

interface HierarchicalTableCellProps {
  checked: boolean;
  onSelectionChange: (checked: boolean) => void;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggleExpansion: () => void;
  showExpandOnHover?: boolean;
}

export function HierarchicalTableCell({
  checked,
  onSelectionChange,
  isExpanded,
  hasChildren,
  onToggleExpansion,
  showExpandOnHover = false
}: HierarchicalTableCellProps) {
  return (
    <TableCell className="w-12 px-1 py-3">
      <div className="flex items-center" style={{ gap: '4px' }}>
        <SelectionCheckbox 
          checked={checked}
          onChange={onSelectionChange}
        />
        <ExpandCollapseButton
          isExpanded={isExpanded}
          hasChildren={hasChildren}
          onClick={onToggleExpansion}
          showOnHover={showExpandOnHover}
        />
      </div>
    </TableCell>
  );
}