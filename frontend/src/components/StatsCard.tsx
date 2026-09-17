import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: 'primary' | 'accent' | 'amber' | 'red';
}

const colorClasses = {
  primary: 'from-primary-500 to-primary-600',
  accent: 'from-accent-500 to-accent-600',
  amber: 'from-amber-500 to-amber-600',
  red: 'from-red-500 to-red-600',
};

const bgClasses = {
  primary: 'bg-primary-50 dark:bg-primary-900/20',
  accent: 'bg-accent-50 dark:bg-accent-900/20',
  amber: 'bg-amber-50 dark:bg-amber-900/20',
  red: 'bg-red-50 dark:bg-red-900/20',
};

const iconBgClasses = {
  primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400',
  accent: 'bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  red: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
  return (
    <div className="card p-6 hover:scale-[1.02] transition-transform duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-surface-900 dark:text-white">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span className={`text-xs font-medium ${trend.value >= 0 ? 'text-accent-600' : 'text-red-600'}`}>
                {trend.value >= 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-surface-400">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-2xl ${iconBgClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className={`mt-4 h-1 rounded-full ${bgClasses[color]}`}>
        <div className={`h-full rounded-full bg-gradient-to-r ${colorClasses[color]}`} style={{ width: '60%' }} />
      </div>
    </div>
  );
};

export default StatsCard;
