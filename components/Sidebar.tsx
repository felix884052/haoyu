
import React from 'react';
import { LayoutDashboard, PieChart, Ticket, Settings, HelpCircle, Activity } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, icon: LayoutDashboard, label: '概览 Dashboard' },
    { id: AppView.BUDGET, icon: PieChart, label: '预算分配 Budget' },
    { id: AppView.COUPONS, icon: Ticket, label: '发券策略 Coupons' },
    { id: AppView.ANALYSIS, icon: Activity, label: '效果回溯 Analysis' },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Activity className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">OmniDecide AI</h1>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeView === item.id 
                ? 'bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-indigo-600' : 'text-slate-400'}`} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50">
          <Settings className="w-5 h-5 text-slate-400" />
          系统设置
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50">
          <HelpCircle className="w-5 h-5 text-slate-400" />
          帮助中心
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
