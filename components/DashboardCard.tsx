import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'green' | 'blue' | 'orange' | 'purple' | 'red' | 'indigo';
  trend?: number;
  subtitle?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'green',
  trend,
  subtitle 
}) => {
  const colorClasses = {
    green: 'bg-gradient-to-r from-green-500 to-green-600',
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
    orange: 'bg-gradient-to-r from-orange-500 to-orange-600',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600',
    red: 'bg-gradient-to-r from-red-500 to-red-600',
    indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-2xl font-bold text-gray-900">
                {formatValue(value)}
              </p>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            {trend !== undefined && (
              <div className="mt-2 flex items-center">
                <span className={`text-sm font-medium ${
                  trend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend >= 0 ? '+' : ''}{trend}%
                </span>
                <span className="text-xs text-gray-500 ml-2">from last month</span>
              </div>
            )}
          </div>
          <div className={`${colorClasses[color]} p-3 rounded-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;