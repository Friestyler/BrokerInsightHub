interface SelectionCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function SelectionCheckbox({ checked, onChange, className = "" }: SelectionCheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className={`rounded border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
      style={{ opacity: checked ? 1 : undefined }}
    />
  );
}