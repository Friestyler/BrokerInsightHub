import { ReactNode } from "react";

interface ToolHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function ToolHeader({ title, description, actions }: ToolHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-800">{title}</h2>
        {description && <p className="text-neutral-600 mt-1">{description}</p>}
      </div>
      {actions && (
        <div className="flex space-x-2">
          {actions}
        </div>
      )}
    </div>
  );
}
