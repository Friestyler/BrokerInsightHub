interface ExpandCollapseButtonProps {
  isExpanded: boolean;
  hasChildren: boolean;
  onClick: () => void;
  showOnHover?: boolean;
}

export function ExpandCollapseButton({ 
  isExpanded, 
  hasChildren, 
  onClick, 
  showOnHover = false 
}: ExpandCollapseButtonProps) {
  if (!hasChildren && !showOnHover) {
    return <div style={{ width: '20px', height: '20px' }}></div>;
  }

  const buttonClass = hasChildren 
    ? "p-1 hover:bg-gray-100 rounded flex-shrink-0"
    : "p-1 hover:bg-gray-100 rounded flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity";

  return (
    <button
      onClick={onClick}
      className={buttonClass}
      style={{ width: '20px', height: '20px' }}
    >
      <svg 
        width="8" 
        height="13" 
        viewBox="0 0 8 13" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ 
          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }}
      >
        <path d="M6.83984 6.28516C7.08594 6.55859 7.08594 6.96875 6.83984 7.21484L1.58984 12.4648C1.31641 12.7383 0.90625 12.7383 0.660156 12.4648C0.386719 12.2188 0.386719 11.8086 0.660156 11.5625L5.44531 6.77734L0.660156 1.96484C0.386719 1.71875 0.386719 1.30859 0.660156 1.0625C0.90625 0.789062 1.31641 0.789062 1.5625 1.0625L6.83984 6.28516Z" fill="#696C8C"/>
      </svg>
    </button>
  );
}