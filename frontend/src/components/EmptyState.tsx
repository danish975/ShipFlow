import React from 'react';
import { PackageX } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
    <div className="p-4 rounded-full bg-surface-100 dark:bg-surface-800 mb-4">
      <PackageX className="w-10 h-10 text-surface-400" />
    </div>
    <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300">{title}</h3>
    <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 max-w-sm">{description}</p>
    {action && (
      <button onClick={action.onClick} className="btn-primary mt-4">{action.label}</button>
    )}
  </div>
);

export default EmptyState;
