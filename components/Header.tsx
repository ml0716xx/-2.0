
import React, { useState, useEffect } from 'react';
import { CloudSun, Thermometer, Bell, Settings, Zap, ChevronDown, MapPin } from 'lucide-react';

const Header: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [currentSite, setCurrentSite] = useState('站点 #0241 (上海总部)');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex flex-col md:flex-row items-center justify-between bg-white rounded-2xl shadow-sm px-6 py-4 gap-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
          <Zap className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-none">微网站点运行概览</h1>
          <p className="text-xs text-slate-500 mt-1">智慧能源监控系统 · 实时在线</p>
        </div>
      </div>

      <div className="flex items-center flex-wrap justify-center gap-4">
        {/* 站点切换下拉框 */}
        <div className="relative group">
          <button className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all">
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span className="max-w-[150px] truncate">{currentSite}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform" />
          </button>
          <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-100 shadow-xl rounded-xl p-2 hidden group-hover:block z-50">
            {['站点 #0241 (上海总部)', '站点 #0242 (杭州分部)', '站点 #0243 (苏州工厂)'].map((site) => (
              <button
                key={site}
                onClick={() => setCurrentSite(site)}
                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
              >
                {site}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100/50">
          <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
            <CloudSun className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium">晴转多云</span>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium">24.5°C</span>
          </div>
        </div>

        <div className="text-right border-l border-slate-200 pl-6 hidden md:block">
          <div className="text-lg font-mono font-bold text-slate-800 leading-none">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {time.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
