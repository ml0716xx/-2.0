import React from 'react';
import { Sun, Droplets, Sunrise, Sunset, Thermometer } from 'lucide-react';

const WeatherPanel: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-xl">
            <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">实时气象</div>
            <div className="text-xs text-slate-400">更新于 14:30</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-bold text-slate-800">晴转多云</div>
          <div className="text-xs text-emerald-500 font-medium">AQI: 优</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <Thermometer className="w-3.5 h-3.5" /> 环境温度
          </div>
          <div className="text-sm font-bold text-slate-700">24.5 <span className="text-[10px] font-normal">°C</span></div>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <Droplets className="w-3.5 h-3.5" /> 空气湿度
          </div>
          <div className="text-sm font-bold text-slate-700">45%</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <Sunrise className="w-3.5 h-3.5" /> 日出时间
          </div>
          <div className="text-sm font-bold text-slate-700">06:15</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <Sunset className="w-3.5 h-3.5" /> 日落时间
          </div>
          <div className="text-sm font-bold text-slate-700">18:42</div>
        </div>
      </div>
    </div>
  );
};

export default WeatherPanel;
