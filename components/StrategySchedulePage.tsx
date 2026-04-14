import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronDown, Plus, Check } from 'lucide-react';

const StrategySchedulePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'template'>('schedule');
  const [selectedDate, setSelectedDate] = useState(6);
  const [selectedStrategyId, setSelectedStrategyId] = useState<number | null>(2);

  // Mock calendar data for April 2026
  const calendarGrid = [
    [
      { date: 30, isPrevMonth: true },
      { date: 31, isPrevMonth: true },
      { date: 1, isPrevMonth: false },
      { date: 2, isPrevMonth: false },
      { date: 3, isPrevMonth: false },
      { date: 4, isPrevMonth: false, isWeekend: true },
      { date: 5, isPrevMonth: false, isWeekend: true },
    ],
    [
      { date: 6, isPrevMonth: false, isToday: true },
      { date: 7, isPrevMonth: false },
      { date: 8, isPrevMonth: false },
      { date: 9, isPrevMonth: false },
      { date: 10, isPrevMonth: false },
      { date: 11, isPrevMonth: false, isWeekend: true },
      { date: 12, isPrevMonth: false, isWeekend: true },
    ],
    [
      { date: 13, isPrevMonth: false },
      { date: 14, isPrevMonth: false },
      { date: 15, isPrevMonth: false },
      { date: 16, isPrevMonth: false },
      { date: 17, isPrevMonth: false },
      { date: 18, isPrevMonth: false, isWeekend: true },
      { date: 19, isPrevMonth: false, isWeekend: true },
    ],
    [
      { date: 20, isPrevMonth: false },
      { date: 21, isPrevMonth: false },
      { date: 22, isPrevMonth: false },
      { date: 23, isPrevMonth: false },
      { date: 24, isPrevMonth: false },
      { date: 25, isPrevMonth: false, isWeekend: true },
      { date: 26, isPrevMonth: false, isWeekend: true },
    ],
    [
      { date: 27, isPrevMonth: false },
      { date: 28, isPrevMonth: false },
      { date: 29, isPrevMonth: false },
      { date: 30, isPrevMonth: false },
      { date: 1, isNextMonth: true },
      { date: 2, isNextMonth: true },
      { date: 3, isNextMonth: true },
    ]
  ];

  const strategyBlocks = [
    {
      id: 1,
      name: '春季高效 V2.1 (04/01 - 04/03)',
      row: 0,
      startCol: 2,
      span: 3,
      colorClass: 'bg-[#6EE7B7]',
      textClass: 'text-[#064E3B]',
      topClass: 'top-14',
      heightClass: 'h-8',
      roundedClass: 'rounded-full',
    },
    {
      id: 2,
      name: '削峰填谷 连续策略 (04/06 - 04/10)',
      row: 1,
      startCol: 0,
      span: 5,
      colorClass: 'bg-[#0346CB]',
      textClass: 'text-white',
      topClass: 'top-14',
      heightClass: 'h-10',
      roundedClass: 'rounded-lg',
      borderClass: 'border-2 border-white',
      shadowClass: 'shadow-md',
    },
    {
      id: 3,
      name: '备用策略',
      row: 1,
      startCol: 0,
      span: 1,
      colorClass: 'bg-orange-100',
      textClass: 'text-orange-600',
      topClass: 'top-[104px]',
      heightClass: 'h-6',
      roundedClass: 'rounded-md',
      borderClass: 'border border-orange-200',
    },
    {
      id: 4,
      name: '系统维护',
      row: 2,
      startCol: 0,
      span: 1,
      colorClass: 'bg-[#D1E8E2]',
      textClass: 'text-[#0F766E]',
      topClass: 'bottom-4',
      heightClass: 'h-6',
      roundedClass: 'rounded',
    }
  ];

  return (
    <div className="flex flex-col h-full min-h-[800px] bg-slate-50 rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Top Navigation Tabs */}
      <div className="flex items-center px-6 pt-4">
        <h1 className="text-2xl font-black text-slate-800 mr-8">策略排期</h1>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 cursor-pointer hover:border-blue-500 transition-colors shadow-sm mr-auto">
          <CalendarIcon className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-bold text-slate-700">2026年4月</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            批量操作
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6">
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Left Column: Calendar */}
          <div className="flex-[2] bg-white rounded-3xl border border-slate-100 flex flex-col overflow-hidden shadow-sm p-4">
            
            {/* Calendar Grid */}
            <div className="flex-1 flex flex-col">
              {/* Days of week */}
              <div className="grid grid-cols-7 mb-2">
                {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, i) => (
                  <div key={day} className={`py-4 text-center text-sm font-bold ${i >= 5 ? 'text-blue-600' : 'text-slate-600'}`}>
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Dates */}
              <div className="flex-1 flex flex-col gap-2">
                {calendarGrid.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex-1 grid grid-cols-7 relative gap-2">
                    {/* Day cells */}
                    {row.map((day, colIndex) => {
                      const isToday = day.isToday;
                      return (
                        <div 
                          key={colIndex} 
                          onClick={() => !day.isPrevMonth && !day.isNextMonth && setSelectedDate(day.date)}
                          className={`relative p-4 rounded-2xl transition-colors ${
                            day.isWeekend && !day.isPrevMonth && !day.isNextMonth ? 'bg-[#F4F7FB]' : 'bg-transparent'
                          }`}
                        >
                          {isToday ? (
                            <div className="absolute -inset-2 bg-white rounded-2xl border-2 border-blue-100 shadow-[0_8px_30px_rgba(59,130,246,0.15)] z-10 p-4 flex flex-col pointer-events-none">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-lg font-black text-blue-600">{day.date.toString().padStart(2, '0')}</span>
                                <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                                  <div className="w-1 h-1 bg-white rounded-full"></div>
                                  运行中
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className={`text-sm font-bold ${day.isPrevMonth || day.isNextMonth ? 'text-slate-300' : 'text-slate-700'}`}>
                              {day.date.toString().padStart(2, '0')}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Strategy blocks for this row */}
                    {strategyBlocks.filter(b => b.row === rowIndex).map(block => (
                      <div 
                        key={block.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStrategyId(block.id);
                        }}
                        className={`absolute ${block.topClass} ${block.heightClass} ${block.colorClass} ${block.roundedClass} ${block.borderClass || ''} ${block.shadowClass || ''} flex items-center px-4 z-20 cursor-pointer hover:opacity-90 transition-all ${selectedStrategyId === block.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                        style={{
                          left: `calc(${block.startCol} * (100% / 7) + 8px)`,
                          width: `calc(${block.span} * (100% / 7) - 16px)`
                        }}
                      >
                        <span className={`text-xs font-bold ${block.textClass} truncate`}>{block.name}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Configuration Details */}
          <div className="flex-1 bg-white rounded-3xl border border-slate-100 flex flex-col overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-50">
              <h2 className="text-lg font-black text-slate-800">策略配置</h2>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">2026-04-{selectedDate.toString().padStart(2, '0')}</span>
            </div>

            {/* Tabs */}
            <div className="flex items-center border-b border-slate-50 px-4 pt-2">
              <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-blue-500 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span className="text-sm font-bold text-blue-600">
                  {selectedStrategyId === 1 ? '春季高效 V2.1' : 
                   selectedStrategyId === 2 ? '削峰填谷 连续策略' : 
                   selectedStrategyId === 3 ? '备用策略' : '系统维护'}
                </span>
              </div>
              <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md ml-2 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-800">策略状态</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-bold text-emerald-600">生效中</span>
                  </div>
                  <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer flex items-center px-1 shadow-inner">
                    <span className="text-[10px] text-white font-black ml-1">ON</span>
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 shadow-sm"></div>
                  </div>
                </div>
              </div>

              {selectedStrategyId === 2 ? (
                <>
                  {/* Time Period Block */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                    <div className="p-5">
                      {/* Block Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-slate-800 text-base">时段3</span>
                          <span className="text-emerald-500 font-medium">10:00~15:00</span>
                          <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-sm shadow-emerald-200">正在生效</span>
                        </div>
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      </div>

                      {/* Capacity */}
                      <div className="flex items-center gap-16 text-sm text-slate-500 mb-8 pb-6 border-b border-slate-200 border-dashed">
                        <div>充电预留容量 <span className="font-bold text-slate-800 ml-2">-- %</span></div>
                        <div>放电预留容量 <span className="font-bold text-slate-800 ml-2">0 %</span></div>
                      </div>

                      {/* Strategy 1 */}
                      <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-sm font-bold text-slate-800">策略1</span>
                          <span className="px-3 py-1 border border-emerald-500 text-emerald-600 text-xs font-bold rounded">全额消纳</span>
                        </div>
                        <div className="text-sm text-slate-500">
                          允许放电偏移量 <span className="font-bold text-slate-800 ml-2">40 kW</span>
                        </div>
                      </div>

                      {/* Strategy 2 */}
                      <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-sm font-bold text-slate-800">策略2</span>
                          <span className="px-3 py-1 border border-blue-500 text-blue-600 text-xs font-bold rounded">峰谷套利</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                              <tr>
                                <th className="py-3 px-4 text-left font-medium border-b border-slate-200">适用时段</th>
                                <th className="py-3 px-4 text-left font-medium border-b border-slate-200">充放电模式</th>
                                <th className="py-3 px-4 text-left font-medium border-b border-slate-200">充放电功率(kW)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="py-4 px-4 text-slate-800">10:00 ~ 15:00</td>
                                <td className="py-4 px-4 text-slate-800">充电</td>
                                <td className="py-4 px-4 text-slate-800">50</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Strategy 3 */}
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-sm font-bold text-slate-800">策略3</span>
                          <span className="px-3 py-1 border border-amber-400 text-amber-500 text-xs font-bold rounded">需量控制</span>
                        </div>
                        <div className="text-sm text-slate-500">
                          允许充电偏移量 <span className="font-bold text-slate-800 ml-2">50 kW</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configuration Preview */}
                  <div>
                    <h3 className="text-base font-bold text-slate-800 mb-6">配置预览</h3>
                    <div className="relative pt-6 pb-8">
                      {/* Timeline Track */}
                      <div className="absolute top-10 left-0 right-0 h-1 bg-slate-200 rounded-full"></div>
                      
                      {/* Time Labels */}
                      <div className="absolute top-14 left-0 text-[10px] text-slate-400 font-medium">00:00</div>
                      <div className="absolute top-14 right-0 text-[10px] text-slate-400 font-medium">00:00</div>

                      {/* Blocks */}
                      <div className="relative flex items-center justify-between z-10 w-full px-2">
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
                          <span className="text-xs font-bold text-slate-700 whitespace-nowrap">峰谷套利</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
                          <span className="text-xs font-bold text-slate-700 whitespace-nowrap">需量控制</span>
                        </div>
                        
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2 py-1.5 shadow-sm">
                          <div className="text-[10px] font-bold text-slate-700 whitespace-nowrap">全额...</div>
                        </div>
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2 py-1.5 shadow-sm">
                          <div className="text-[10px] font-bold text-slate-700 whitespace-nowrap">需量...</div>
                        </div>

                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-full px-2 py-1.5">
                          <div className="w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">全</div>
                          <div className="w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">峰</div>
                          <div className="w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">需</div>
                        </div>

                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-full px-2 py-1.5">
                          <div className="text-[10px] font-bold text-slate-600">+2</div>
                        </div>

                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-full px-2 py-1.5">
                          <div className="w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">全</div>
                          <div className="w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">峰</div>
                          <div className="w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">需</div>
                        </div>
                        
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-full px-2 py-1.5">
                          <div className="text-[10px] font-bold text-slate-600">+2</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-slate-400">
                  请选择策略以查看详情
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategySchedulePage;
