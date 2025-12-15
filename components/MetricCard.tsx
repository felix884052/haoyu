
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  isTrendUp: boolean;
  prefix?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, isTrendUp, prefix }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-2xl font-bold text-slate-900">
          {prefix}{value}
        </h3>
        <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${
          isTrendUp ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
        }`}>
          {isTrendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}%
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
