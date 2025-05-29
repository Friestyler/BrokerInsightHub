interface NestedCountIndicatorProps {
  count: number;
}

export function NestedCountIndicator({ count }: NestedCountIndicatorProps) {
  if (count === 0) return null;

  return (
    <div className="flex items-center" style={{ marginLeft: '4px' }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="4" cy="4" r="2" fill="#666666"/>
        <circle cx="12" cy="12" r="2" fill="#666666"/>
        <path d="M4 6C4 8 6 10 10 12" stroke="#666666" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
      <span className="text-xs text-gray-500 ml-1">{count}</span>
    </div>
  );
}