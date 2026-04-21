import React from 'react';
import { AlertTriangle, Info, ShieldAlert, Clock, Filter, Search } from 'lucide-react';

const AlarmManagementPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">报警管理</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索报警源或内容..." 
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <Filter className="w-4 h-4" /> 筛选
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-sm text-slate-500">
              <th className="py-4 px-6 font-medium">级别</th>
              <th className="py-4 px-6 font-medium">报警源</th>
              <th className="py-4 px-6 font-medium">报警内容</th>
              <th className="py-4 px-6 font-medium">发生时间</th>
              <th className="py-4 px-6 font-medium">状态</th>
              <th className="py-4 px-6 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td className="py-4 px-6">
                <div className="flex items-center gap-2 text-rose-500 bg-rose-50 w-fit px-2.5 py-1 rounded-lg">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="font-semibold text-xs">严重</span>
                </div>
              </td>
              <td className="py-4 px-6 font-medium text-slate-700">储能变流器 #1</td>
              <td className="py-4 px-6 text-slate-600">直流侧过压保护触发</td>
              <td className="py-4 px-6 text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 14:25:33</td>
              <td className="py-4 px-6"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block mr-2"></span>未处理</td>
              <td className="py-4 px-6 text-right">
                <button className="text-emerald-600 hover:text-emerald-700 font-medium">处理</button>
              </td>
            </tr>
            <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td className="py-4 px-6">
                <div className="flex items-center gap-2 text-amber-500 bg-amber-50 w-fit px-2.5 py-1 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-semibold text-xs">警告</span>
                </div>
              </td>
              <td className="py-4 px-6 font-medium text-slate-700">光伏逆变器 #1</td>
              <td className="py-4 px-6 text-slate-600">温度预警 65°C</td>
              <td className="py-4 px-6 text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 14:23:10</td>
              <td className="py-4 px-6"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block mr-2"></span>未处理</td>
              <td className="py-4 px-6 text-right">
                <button className="text-emerald-600 hover:text-emerald-700 font-medium">处理</button>
              </td>
            </tr>
            <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td className="py-4 px-6">
                <div className="flex items-center gap-2 text-blue-500 bg-blue-50 w-fit px-2.5 py-1 rounded-lg">
                  <Info className="w-4 h-4" />
                  <span className="font-semibold text-xs">提示</span>
                </div>
              </td>
              <td className="py-4 px-6 font-medium text-slate-700">储能电池组 #2</td>
              <td className="py-4 px-6 text-slate-600">SOC不平衡 3%</td>
              <td className="py-4 px-6 text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 13:45:00</td>
              <td className="py-4 px-6"><span className="w-2 h-2 rounded-full bg-slate-300 inline-block mr-2"></span>已确认</td>
              <td className="py-4 px-6 text-right">
                <button className="text-slate-400 hover:text-slate-600 font-medium">详情</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlarmManagementPage;
