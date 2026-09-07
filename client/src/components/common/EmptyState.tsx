import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border
     border-dashed border-gray-300 bg-white p-10 text-center"
    >
      <div className="mb-4 text-4xl">📝</div>

      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>

      <p className="mt-2 max-w-md text-sm text-gray-500">{description}</p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyState;
