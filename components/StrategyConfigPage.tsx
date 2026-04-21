
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, ChevronRight, Clock, 
  Zap, Save, ArrowLeft, ChevronDown, HelpCircle, Info, Calendar, X, Copy, ChevronUp
} from 'lucide-react';

interface SubPeriod {
  start: string;
  end: string;
  type: '充电' | '放电' | '待机';
  power: number;
}

interface ScheduleBlock {
  id: string;
  startTime: string;
  endTime: string;
  threshold: string;
  reserveCharge: string;
  reserveDischarge: string;
  strategyType: string;
  dischargeThreshold: string;
  subPeriods: SubPeriod[];
  isCollapsed: boolean;
  chargeOffset?: string;
  dischargeOffset?: string;
}

interface StrategyTemplate {
  id: string;
  name: string;
  isActive: boolean;
  hasWarning: boolean;
  blocks: ScheduleBlock[];
}



const StrategyConfigPage: React.FC = () => {
  const [selectedId, setSelectedId] = useState('01');
  const [isEditing, setIsEditing] = useState(false);
  const [focusedThresholdBlockId, setFocusedThresholdBlockId] = useState<string | null>(null);

  const [templates, setTemplates] = useState<StrategyTemplate[]>([
    {
      id: '01',
      name: '峰谷套利核心策略',
      isActive: true,
      hasWarning: false,
      blocks: [
        {
          id: 'b1',
          startTime: '00:00',
          endTime: '23:59',
          threshold: '50',
          reserveCharge: '20',
          reserveDischarge: '30',
          strategyType: '峰谷套利',
          dischargeThreshold: '42',
          chargeOffset: '10',
          dischargeOffset: '15',
          isCollapsed: false,
          subPeriods: [
            { start: '00:00', end: '01:00', type: '充电', power: 1.5 },
            { start: '01:00', end: '02:00', type: '放电', power: 2.2 },
          ]
        }
      ]
    },
    { 
      id: '02', 
      name: '全额消纳默认策略', 
      isActive: false, 
      hasWarning: false, 
      blocks: [
        {
          id: 'b2',
          startTime: '00:00',
          endTime: '23:59',
          threshold: '25',
          reserveCharge: '10',
          reserveDischarge: '15',
          strategyType: '全额消纳（自发自用）',
          dischargeThreshold: '58',
          chargeOffset: '5',
          dischargeOffset: '12',
          isCollapsed: false,
          subPeriods: []
        }
      ]
    },
  ]);

  const currentTemplate = templates.find(t => t.id === selectedId) || templates[0];

  const socContainerRef = useRef<HTMLDivElement>(null);
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [draggingType, setDraggingType] = useState<'discharge' | 'charge' | null>(null);

  const handleSocDrag = (e: MouseEvent) => {
    if (!draggingBlockId || !draggingType || !socContainerRef.current) return;
    const rect = socContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.round(Math.max(0, Math.min(100, (x / rect.width) * 100)));
    
    updateBlockValue(draggingBlockId, draggingType === 'discharge' ? 'reserveDischarge' : 'reserveCharge', percentage.toString());
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setDraggingBlockId(null);
      setDraggingType(null);
    };
    if (draggingType) {
      window.addEventListener('mousemove', handleSocDrag);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleSocDrag);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingType, currentTemplate]);

  const updateBlockValue = (blockId: string, key: keyof ScheduleBlock, value: any) => {
    setTemplates(prev => prev.map(t => {
      if (t.id === selectedId) {
        return {
          ...t,
          blocks: t.blocks.map(b => b.id === blockId ? { ...b, [key]: value } : b)
        };
      }
      return t;
    }));
  };

  const handleCopyBlock = (blockId: string) => {
    const blockToCopy = currentTemplate.blocks.find(b => b.id === blockId);
    if (!blockToCopy) return;
    
    const newBlock = { 
      ...JSON.parse(JSON.stringify(blockToCopy)), 
      id: Math.random().toString(36).substr(2, 9),
      isCollapsed: false 
    };

    const blockIndex = currentTemplate.blocks.findIndex(b => b.id === blockId);
    const newBlocks = currentTemplate.blocks.map(b => ({ ...b, isCollapsed: true }));
    newBlocks.splice(blockIndex + 1, 0, newBlock);

    setTemplates(prev => prev.map(t => t.id === selectedId ? { ...t, blocks: newBlocks } : t));
  };

  const handleDeleteBlock = (blockId: string) => {
    if (currentTemplate.blocks.length <= 1) return;
    const newBlocks = currentTemplate.blocks.filter(b => b.id !== blockId);
    setTemplates(prev => prev.map(t => t.id === selectedId ? { ...t, blocks: newBlocks } : t));
  };

  const toggleBlockCollapse = (blockId: string) => {
    setTemplates(prev => prev.map(t => t.id === selectedId ? {
      ...t,
      blocks: t.blocks.map(b => b.id === blockId ? { ...b, isCollapsed: !b.isCollapsed } : b)
    } : t));
  };

  const handleAddNewBlock = () => {
    const templateBlock = currentTemplate.blocks[0];
    const newBlock = { 
      ...JSON.parse(JSON.stringify(templateBlock)), 
      id: Math.random().toString(36).substr(2, 9), 
      isCollapsed: false 
    };

    const newBlocks = currentTemplate.blocks.map(b => ({ ...b, isCollapsed: true }));
    newBlocks.push(newBlock);

    setTemplates(prev => prev.map(t => t.id === selectedId ? { ...t, blocks: newBlocks } : t));
  };

  const handleCopyTemplate = (templateId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = templates.find(t => t.id === templateId);
    if (!target) return;
    
    const newTemplate = {
      ...JSON.parse(JSON.stringify(target)),
      id: Math.random().toString(36).substr(2, 5),
      name: `${target.name}-副本`,
      isActive: false
    };
    
    setTemplates([...templates, newTemplate]);
    setSelectedId(newTemplate.id);
    setIsEditing(false); // 复制后先显示概览
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);
  const handleSave = () => setIsEditing(false);

  const strategyTypes = ["全额消纳（自发自用）", "余电上网（自发自用）", "峰谷套利", "动态增容", "需量控制", "动态调压", "需求响应"];

  return (
    <div className="flex-1 flex gap-8">
      {!isEditing && (
        <div className="w-80 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col shrink-0 animate-in slide-in-from-left duration-300">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-black text-slate-800 tracking-tight">策略组合模板</h3>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 text-xs font-bold">
              <Plus className="w-3.5 h-3.5" /> 新增
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                  selectedId === t.id ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'hover:bg-slate-50 border-transparent'
                } border relative`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-8">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${t.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  <span className={`text-sm font-bold truncate ${selectedId === t.id ? 'text-emerald-700' : 'text-slate-600'}`}>{t.name}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <ChevronRight className={`w-4 h-4 transition-transform ${selectedId === t.id ? 'translate-x-0 opacity-100 text-emerald-400' : 'translate-x-4 opacity-0 text-slate-300 group-hover:opacity-100'}`} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-8 transition-all duration-300 min-w-0">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-50 flex-1 relative">
          
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-50">
            <div className="flex items-center gap-4">
              {isEditing && (
                <button onClick={handleCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <ArrowLeft className="w-5 h-5 text-slate-400" />
                </button>
              )}
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  {isEditing ? `编辑: ${currentTemplate.name}` : '策略配置详情'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${currentTemplate.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  <span className={`text-[10px] ${currentTemplate.isActive ? 'text-emerald-500' : 'text-slate-400'} font-bold uppercase tracking-widest`}>
                    {currentTemplate.isActive ? '当前已激活应用至站点' : '草稿/离线编辑中'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center flex-wrap gap-3">
              {!isEditing ? (
                <>
                  <button onClick={handleEdit} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100 group">
                    <Edit className="w-4 h-4" /> 修改策略
                  </button>
                  <button onClick={() => handleCopyTemplate(currentTemplate.id)} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group">
                    <Copy className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" /> 复制副本
                  </button>
                  <button className="flex items-center gap-2 px-6 py-2.5 border border-rose-100 text-rose-500 rounded-2xl font-black text-sm hover:bg-rose-50 transition-all">
                    <Trash2 className="w-4 h-4" /> 删除
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleCancel} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all">
                    取消
                  </button>
                  <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                    <Save className="w-4 h-4 mr-2" /> 确认并保存
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {currentTemplate.blocks.map((block) => (
              <div key={block.id} className={`bg-slate-50/50 rounded-[2rem] border border-slate-100 p-0 relative transition-all duration-300 ${focusedThresholdBlockId === block.id ? 'z-[100]' : 'z-10'}`}>
                <div 
                  className={`flex items-center justify-between p-8 cursor-pointer hover:bg-slate-100/50 transition-colors ${!block.isCollapsed ? 'border-b border-slate-100' : ''} ${block.isCollapsed ? 'rounded-[2rem]' : 'rounded-t-[2rem]'}`}
                  onClick={() => toggleBlockCollapse(block.id)}
                >
                  <div className="flex items-center gap-8 flex-1 min-w-0">
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-black text-slate-800 uppercase tracking-tight">
                        调度时段: {block.startTime} ~ {block.endTime}
                      </span>
                    </div>

                    {block.isCollapsed && (
                      <div className="flex items-center gap-8 animate-in fade-in slide-in-from-left-4 duration-500 overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-xl">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">策略:</span>
                          <span className="text-xs font-black text-slate-700">{block.strategyType}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-xl">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SOC预留:</span>
                          <span className="text-xs font-black text-emerald-600">放 {block.reserveDischarge}%</span>
                          <span className="text-[10px] text-slate-300">/</span>
                          <span className="text-xs font-black text-amber-600">充 {block.reserveCharge}%</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-xl">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">放电阈值:</span>
                          <span className="text-xs font-black text-slate-700 font-mono">{block.dischargeThreshold} kW</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 ml-4" onClick={(e) => e.stopPropagation()}>
                    {isEditing && (
                      <>
                        <button onClick={() => handleCopyBlock(block.id)} className="text-slate-300 hover:text-blue-500 transition-all p-2 hover:bg-blue-50 rounded-xl group" title="复制当前调度块">
                          <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <button onClick={() => handleDeleteBlock(block.id)} className="text-slate-300 hover:text-rose-500 transition-all p-2 hover:bg-rose-50 rounded-xl group" title="删除当前调度块">
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => toggleBlockCollapse(block.id)} 
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all rounded-xl"
                    >
                      {block.isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {!block.isCollapsed && (
                  <div className="p-8 animate-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-12 gap-10">
                      <div className="col-span-12 xl:col-span-6 space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><span className="text-rose-500">*</span> 策略生效时段</label>
                        {isEditing ? (
                          <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                              <input 
                                type="text" 
                                value={block.startTime} 
                                onChange={(e) => updateBlockValue(block.id, 'startTime', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-emerald-100 outline-none pr-10 font-mono" 
                              />
                              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            </div>
                            <span className="text-slate-300 font-bold">~</span>
                            <div className="relative flex-1">
                              <input 
                                type="text" 
                                value={block.endTime} 
                                onChange={(e) => updateBlockValue(block.id, 'endTime', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-emerald-100 outline-none pr-10 font-mono" 
                              />
                              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            </div>
                          </div>
                        ) : <div className="text-sm font-black text-slate-800 px-2 py-3 font-mono">{block.startTime} ~ {block.endTime}</div>}
                      </div>
                      <div className="col-span-12 xl:col-span-6 space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">全局逆流限额阈值</label>
                        <div className="relative">
                          <input disabled={!isEditing} type="number" placeholder="请输入数值" value={block.threshold} onChange={(e) => updateBlockValue(block.id, 'threshold', e.target.value)} className="w-full bg-white border border-slate-200 disabled:bg-transparent disabled:border-transparent rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-emerald-100 outline-none pr-12" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold uppercase">kW</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 border-t border-slate-100 pt-10 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            储能放电预留容量 (Discharge Margin)
                            {isEditing && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>}
                          </div>
                          {isEditing ? <div className="flex items-center gap-2"><input type="number" value={block.reserveDischarge} onChange={(e) => updateBlockValue(block.id, 'reserveDischarge', e.target.value)} className="w-24 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-black focus:ring-2 ring-emerald-100 outline-none" /><span className="text-xs text-slate-400 font-bold">%</span></div> : <div className="text-sm font-black text-emerald-600">{block.reserveDischarge}%</div>}
                        </div>
                        <div className="space-y-1 text-right">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-end">
                            {isEditing && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>}
                            储能充电预留容量 (Charge Margin)
                          </div>
                          {isEditing ? <div className="flex items-center gap-2 justify-end"><input type="number" value={block.reserveCharge} onChange={(e) => updateBlockValue(block.id, 'reserveCharge', e.target.value)} className="w-24 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-black focus:ring-2 ring-emerald-100 outline-none" /><span className="text-xs text-slate-400 font-bold">%</span></div> : <div className="text-sm font-black text-amber-600">{block.reserveCharge}%</div>}
                        </div>
                      </div>
                      <div className="relative pt-6 pb-2 select-none" ref={socContainerRef}>
                        <div className="h-10 w-full bg-slate-100 rounded-full flex overflow-hidden border border-slate-200 shadow-inner relative">
                          <div className="w-[5%] h-full bg-slate-200 flex items-center justify-center text-[9px] text-slate-500 font-bold border-r border-white/50">5%</div>
                          <div 
                            className={`h-full bg-emerald-400/90 flex items-center justify-center text-[10px] text-white font-black transition-all duration-300 border-r border-white/50 relative group ${isEditing ? 'cursor-col-resize' : ''}`} 
                            style={{ width: `${block.reserveDischarge}%` }}
                          >
                            {block.reserveDischarge}%
                            {isEditing && (
                              <div 
                                onMouseDown={() => { setDraggingBlockId(block.id); setDraggingType('discharge'); }}
                                className="absolute right-0 top-0 bottom-0 w-3 bg-emerald-600/30 hover:bg-emerald-600/50 cursor-col-resize flex items-center justify-center transition-colors border-l border-emerald-500/20"
                              >
                                <div className="w-0.5 h-4 bg-white/60 rounded-full"></div>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 h-full bg-white flex items-center justify-center text-[9px] text-slate-400 font-black tracking-widest uppercase italic opacity-50">{(90 - parseInt(block.reserveDischarge) - parseInt(block.reserveCharge))}% Operating Zone</div>
                          <div 
                            className={`h-full bg-amber-400/90 flex items-center justify-center text-[10px] text-white font-black transition-all duration-300 border-l border-white/50 group relative ${isEditing ? 'cursor-col-resize' : ''}`} 
                            style={{ width: `${block.reserveCharge}%` }}
                          >
                            {block.reserveCharge}%
                            {isEditing && (
                              <div 
                                onMouseDown={() => { setDraggingBlockId(block.id); setDraggingType('charge'); }}
                                className="absolute left-0 top-0 bottom-0 w-3 bg-amber-600/30 hover:bg-amber-600/50 cursor-col-resize flex items-center justify-center transition-colors border-r border-amber-500/20"
                              >
                                <div className="w-0.5 h-4 bg-white/60 rounded-full"></div>
                              </div>
                            )}
                          </div>
                          <div className="w-[5%] h-full bg-slate-200 flex items-center justify-center text-[9px] text-slate-500 font-bold border-l border-white/50">5%</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-10 mt-10 border-t border-slate-100 pt-10">
                      <div className="col-span-12 xl:col-span-4 space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><span className="text-rose-500">*</span> 主算法调度策略</label>
                        {isEditing ? (
                          <div className="relative">
                            <select value={block.strategyType} onChange={(e) => updateBlockValue(block.id, 'strategyType', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-emerald-100 outline-none appearance-none transition-all shadow-sm">
                              {strategyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        ) : <div className="inline-flex px-4 py-2 rounded-xl text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">{block.strategyType}</div>}
                      </div>

                      {(block.strategyType === '全额消纳（自发自用）' || block.strategyType === '余电上网（自发自用）' || block.strategyType === '动态增容' || block.strategyType === '需量控制') && (
                        <div className="col-span-12 mt-6">
                          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                             <div className="flex items-center gap-3 mb-6">
                                <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                                <span className="text-sm font-black text-slate-800 tracking-tight">允许充放电偏移量设置</span>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                               {(block.strategyType === '全额消纳（自发自用）' || block.strategyType === '余电上网（自发自用）') && (
                                 <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">允许充电偏移量</label>
                                   <div className="relative">
                                      <input 
                                        type="number" 
                                        value={block.chargeOffset || ''} 
                                        onChange={(e) => updateBlockValue(block.id, 'chargeOffset', e.target.value)} 
                                        onFocus={() => isEditing && setFocusedThresholdBlockId(block.id)}
                                        onBlur={() => setFocusedThresholdBlockId(null)}
                                        disabled={!isEditing}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-emerald-100 outline-none transition-all shadow-sm disabled:bg-slate-100 disabled:text-slate-500" 
                                      />
                                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">kW</span>
                                   </div>
                                 </div>
                               )}

                               {(block.strategyType === '动态增容' || block.strategyType === '需量控制') && (
                                 <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">允许放电偏移量</label>
                                   <div className="relative">
                                      <input 
                                        type="number" 
                                        value={block.dischargeOffset || ''} 
                                        onChange={(e) => updateBlockValue(block.id, 'dischargeOffset', e.target.value)} 
                                        onFocus={() => isEditing && setFocusedThresholdBlockId(block.id)}
                                        onBlur={() => setFocusedThresholdBlockId(null)}
                                        disabled={!isEditing}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-emerald-100 outline-none transition-all shadow-sm disabled:bg-slate-100 disabled:text-slate-500" 
                                      />
                                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">kW</span>
                                   </div>
                                 </div>
                               )}

                               {focusedThresholdBlockId === block.id && (
                                 <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50 w-[640px] bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 animate-in fade-in slide-in-from-top-2">
                                   <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-slate-100 rotate-45"></div>
                                   <div className="font-black text-slate-800 text-sm mb-4 text-center tracking-tight">电网功率边界与调控偏移量图解</div>
                                   
                                   <svg viewBox="0 0 600 440" className="w-full h-auto bg-slate-50/50 rounded-2xl border border-slate-100">
                                      <defs>
                                        <marker id="arrowDown" markerWidth="10" markerHeight="10" refX="5" refY="8" orient="auto-start-reverse">
                                          <path d="M 0 0 L 5 8 L 10 0 z" fill="#10b981" />
                                        </marker>
                                        <marker id="arrowUp" markerWidth="10" markerHeight="10" refX="5" refY="2" orient="auto">
                                          <path d="M 0 10 L 5 2 L 10 10 z" fill="#10b981" />
                                        </marker>
                                        <marker id="arrowDownBlue" markerWidth="10" markerHeight="10" refX="5" refY="8" orient="auto-start-reverse">
                                          <path d="M 0 0 L 5 8 L 10 0 z" fill="#3b82f6" />
                                        </marker>
                                        <marker id="arrowUpBlue" markerWidth="10" markerHeight="10" refX="5" refY="2" orient="auto">
                                          <path d="M 0 10 L 5 2 L 10 10 z" fill="#3b82f6" />
                                        </marker>
                                      </defs>

                                      {/* Axis Bar */}
                                      <rect x="30" y="30" width="12" height="380" rx="6" fill="#e2e8f0" />
                                      {/* Zones coloring on the axis */}
                                      <rect x="30" y="30" width="12" height="70" rx="6" fill="#ef4444" /> {/* Top Red */}
                                      <rect x="30" y="100" width="12" height="70" fill="#f59e0b" /> {/* Top Yellow */}
                                      <rect x="30" y="170" width="12" height="100" fill="#10b981" /> {/* Middle Green */}
                                      <rect x="30" y="270" width="12" height="70" fill="#f59e0b" /> {/* Bottom Yellow */}
                                      <rect x="30" y="340" width="12" height="70" rx="6" fill="#ef4444" /> {/* Bottom Red */}

                                      {/* Highlight Zone Background */}
                                      <rect x="42" y="170" width="378" height="100" fill="#3b82f6" fillOpacity="0.05" />

                                      {/* Lines from the axis to the right */}
                                      <line x1="42" y1="40" x2="580" y2="40" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4"/>
                                      <line x1="42" y1="100" x2="580" y2="100" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4"/>
                                      <line x1="42" y1="170" x2="420" y2="170" stroke="#10b981" strokeWidth="2" strokeDasharray="2 2"/>
                                      <line x1="42" y1="270" x2="420" y2="270" stroke="#10b981" strokeWidth="2" strokeDasharray="2 2"/>
                                      <line x1="42" y1="340" x2="580" y2="340" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4"/>
                                      <line x1="42" y1="400" x2="580" y2="400" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4"/>

                                      {/* Texts */}
                                      <foreignObject x="50" y="26" width="530" height="40">
                                        <div xmlns="http://www.w3.org/1999/xhtml" className="flex flex-col">
                                          <span className="text-[13px] font-black text-rose-600">【红色禁区】变压器额定容量</span>
                                          <span className="text-[11px] text-slate-500 mt-0.5">物理极限，绝对不能碰，碰了就停电。</span>
                                        </div>
                                      </foreignObject>

                                      <foreignObject x="50" y="86" width="530" height="40">
                                        <div xmlns="http://www.w3.org/1999/xhtml" className="flex flex-col">
                                          <span className="text-[13px] font-black text-amber-600">【黄色警戒】超容阈值 (P<sub className="text-[9px]">cap</sub> &lt; S<sub className="text-[9px]">trafo</sub>)</span>
                                          <span className="text-[11px] text-slate-500 mt-0.5">调控触发点。一旦功率达到这里，储能系统立即开始“干活”（削峰）。</span>
                                        </div>
                                      </foreignObject>

                                      <foreignObject x="50" y="156" width="370" height="60">
                                        <div xmlns="http://www.w3.org/1999/xhtml" className="flex flex-col">
                                          <span className="text-[13px] font-black text-emerald-600">【绿色安全】允许充电偏移量</span>
                                          <span className="text-[11px] text-slate-500 mt-0.5 leading-snug">策略缓冲带。储能充电时，目标是停在“超容阈值 - 偏移量”的位置，给突然增加的负荷留出空间。</span>
                                        </div>
                                      </foreignObject>

                                      <foreignObject x="50" y="256" width="370" height="60">
                                        <div xmlns="http://www.w3.org/1999/xhtml" className="flex flex-col">
                                          <span className="text-[13px] font-black text-emerald-600">【绿色安全】允许放电偏移量</span>
                                          <span className="text-[11px] text-slate-500 mt-0.5 leading-snug">策略缓冲带。储能放电时，目标是停在“逆流阈值 + 偏移量”的位置，给突然增加的光伏留出空间。</span>
                                        </div>
                                      </foreignObject>

                                      <foreignObject x="50" y="326" width="530" height="40">
                                        <div xmlns="http://www.w3.org/1999/xhtml" className="flex flex-col">
                                          <span className="text-[13px] font-black text-amber-600">【黄色警戒】逆流阈值 (P<sub className="text-[9px]">rev</sub> &gt; 0)</span>
                                          <span className="text-[11px] text-slate-500 mt-0.5">调控触发点。一旦功率跌到这里，系统立即开始“干活”（限制放电或反向充电）。</span>
                                        </div>
                                      </foreignObject>

                                      <foreignObject x="50" y="386" width="530" height="40">
                                        <div xmlns="http://www.w3.org/1999/xhtml" className="flex flex-col">
                                          <span className="text-[13px] font-black text-rose-600">【红色禁区】0kW 刻度线</span>
                                          <span className="text-[11px] text-slate-500 mt-0.5">防逆流极限，绝对不能掉下去（漏电上网）。</span>
                                        </div>
                                      </foreignObject>

                                      {/* Arrows */}
                                      <g>
                                        <line x1="440" y1="100" x2="440" y2="162" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3"/>
                                        <line x1="440" y1="162" x2="440" y2="168" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowDown)"/>
                                        <foreignObject x="450" y="125" width="140" height="30">
                                          <div xmlns="http://www.w3.org/1999/xhtml" className="text-[12px] font-black text-emerald-600 drop-shadow-sm">
                                            允许充电偏移量
                                          </div>
                                        </foreignObject>

                                        {/* Storage operating zone */}
                                        <line x1="440" y1="178" x2="440" y2="262" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3 3"/>
                                        <line x1="440" y1="178" x2="440" y2="172" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowUpBlue)"/>
                                        <line x1="440" y1="262" x2="440" y2="268" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowDownBlue)"/>
                                        <foreignObject x="450" y="208" width="140" height="30">
                                          <div xmlns="http://www.w3.org/1999/xhtml" className="text-[12px] font-black text-blue-500 drop-shadow-sm bg-white/60 px-1 rounded inline-block">
                                            储能充放运行区间
                                          </div>
                                        </foreignObject>

                                        <line x1="440" y1="340" x2="440" y2="278" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3"/>
                                        <line x1="440" y1="278" x2="440" y2="272" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowUp)"/>
                                        <foreignObject x="450" y="295" width="140" height="30">
                                          <div xmlns="http://www.w3.org/1999/xhtml" className="text-[12px] font-black text-emerald-600 drop-shadow-sm">
                                            允许放电偏移量
                                          </div>
                                        </foreignObject>
                                      </g>
                                   </svg>
                                 </div>
                               )}
                             </div>
                          </div>
                        </div>
                      )}

                      {block.strategyType === '峰谷套利' && (
                        <div className="col-span-12 mt-12 border-t border-slate-100 pt-10">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div onClick={() => updateBlockValue(block.id, 'subPeriods', [...block.subPeriods, { start: '00:00', end: '01:00', type: '充电', power: 0 }])} className="p-2 bg-emerald-50 rounded-xl cursor-pointer hover:bg-emerald-100">
                                <Plus className="w-4 h-4 text-emerald-600" />
                              </div>
                              <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Add Scheduling Period</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                              <thead><tr className="bg-slate-50 border-b border-slate-100"><th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">适用时段</th><th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">调度模式</th><th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">执行功率</th>{isEditing && <th className="px-6 py-5 text-center">操作</th>}</tr></thead>
                              <tbody className="divide-y divide-slate-50">{block.subPeriods.map((p, idx) => (
                                <tr key={idx} className="group hover:bg-slate-50">
                                  <td className="px-6 py-5 text-sm font-bold text-slate-700 font-mono">{p.start} ~ {p.end}</td>
                                  <td className="px-6 py-5"><span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-100">{p.type}模式</span></td>
                                  <td className="px-6 py-5 text-sm font-mono font-black text-slate-800">{p.power.toFixed(1)} kW</td>
                                  {isEditing && (
                                    <td className="px-6 py-5 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => {
                                          const newSub = [...block.subPeriods];
                                          newSub.splice(idx+1, 0, JSON.parse(JSON.stringify(p)));
                                          updateBlockValue(block.id, 'subPeriods', newSub);
                                        }} className="text-slate-300 hover:text-blue-500 transition-all p-1.5 hover:bg-blue-50 rounded-lg"><Copy className="w-4 h-4" /></button>
                                        <button onClick={() => {
                                          updateBlockValue(block.id, 'subPeriods', block.subPeriods.filter((_, i) => i !== idx));
                                        }} className="text-slate-300 hover:text-rose-500 transition-all p-1.5 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              ))}</tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isEditing && (
               <div className="flex justify-center border-t border-slate-50 pt-12">
                 <button onClick={handleAddNewBlock} className="flex items-center gap-3 px-10 py-4 bg-white border-2 border-dashed border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-300 hover:bg-emerald-50/20 rounded-3xl font-black text-sm transition-all shadow-sm group">
                   <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" /> 添加新调度配置块
                 </button>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyConfigPage;
