import React from 'react';

export interface BaseWidgetProps {
  id: string;
  name: string;
  raw_value: number;
  type: string;
  status?: boolean | null;
  created_at: string;
  updated_at: string;
  className?: string;
}

export default function BaseWidget({ name, status, className, children }: BaseWidgetProps & { children: React.ReactNode }) {
  const getStatusColor = () => {
    if (status === null || status === undefined) return 'bg-gray-400 dark:bg-gray-600';
    return status ? 'bg-green-500' : 'bg-red-500';
  };

  return (
    <div className={`bg-white/90 dark:bg-white/5 rounded-lg shadow-lg border border-primary-light/20 dark:border-primary-dark/20 p-6 relative ${className || ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-primary-dark dark:text-primary-light">{name}</h3>
        <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor()}`} />
      </div>
      {children}
    </div>
  );
}