
import React, { useState } from 'react';
import { 
  Activity, Settings, LayoutDashboard, Database, 
  FileText, Bell, ClipboardList, Share2, 
  ChevronDown, HelpCircle, ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  onNavigate: (page: string) => void;
  activePage: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, activePage }) => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    '监控中心': true,
    '策略管理': true
  });

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const menuItems = [
    { 
      name: '监控中心', 
      icon: <Activity className="w-5 h-5" />,
      hasSub: true,
      subItems: ['监控概览', '策略监控', '主接线图', '储能监控']
    },
    { 
      name: '策略管理', 
      icon: <ClipboardList className="w-5 h-5" />, 
      hasSub: true,
      subItems: ['策略运行', '策略配置']
    },
    { name: '运营中心', icon: <Share2 className="w-5 h-5" /> },
    { name: '多站概览', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: '智能报告', icon: <FileText className="w-5 h-5" /> },
    { name: '报警管理', icon: <Bell className="w-5 h-5" /> },
    { name: '统计报表', icon: <Database className="w-5 h-5" /> },
    { name: '微网管理', icon: <Settings className="w-5 h-5" /> },
    { name: '系统日志', icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-100">
          <Settings className="w-5 h-5 animate-spin-slow" />
        </div>
        <span className="text-lg font-bold text-blue-600 tracking-tight">智能微网</span>
      </div>

      <div className="px-4 py-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">主导航</div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <div key={item.name}>
              <button
                onClick={() => {
                  if (item.hasSub) {
                    toggleMenu(item.name);
                  } else {
                    onNavigate(item.name);
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activePage === item.name && !item.hasSub
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${activePage === item.name ? 'text-emerald-500' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                {item.hasSub && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${openMenus[item.name] ? 'rotate-180' : ''}`} />
                )}
              </button>

              {item.hasSub && openMenus[item.name] && (
                <div className="mt-1 space-y-1">
                  {item.subItems?.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => onNavigate(sub)}
                      className={`w-full text-left pl-12 py-2 text-sm rounded-xl transition-all ${
                        activePage === sub 
                          ? 'bg-emerald-50 text-emerald-600 font-medium' 
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-50">
        <div className="flex items-center gap-2 text-slate-400 hover:text-slate-600 cursor-pointer mb-2">
          <HelpCircle className="w-4 h-4" />
          <span className="text-xs">智能微网服务中心</span>
        </div>
        <p className="text-[10px] text-slate-300">Copyright 2011-2025</p>
      </div>
    </aside>
  );
};

export default Sidebar;
