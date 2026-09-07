import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  description?: string;
}

function StatsCard({ title, value, icon, description }: StatsCardProps) {
  return (
    <div
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm w-full"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            <span className="font-bold text-blue-700">{title}: </span>
            {description}
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>

          {description && <p className="mt-1 text-xs text-gray-500"></p>}
        </div>

        {icon && (
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">{icon}</div>
        )}
      </div>
    </div>
  );
}

export default StatsCard;
