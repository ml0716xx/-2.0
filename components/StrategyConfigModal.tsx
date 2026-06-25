import React, { useState } from "react";
import { 
  X, Plus, Trash2, Settings, Zap, Shield, HelpCircle, Clock, 
  ChevronDown, BatteryCharging, Battery, Info, Check, Cpu, Lock, ArrowUpRight 
} from "lucide-react";

interface StrategyPeriod {
  id: string;
  startTime: string;
  endTime: string;
  chargeReserve: string;
  dischargeReserve: string;
  reverseFlowThreshold: string;
  strategies: { id: string; type: string }[];
}

interface StrategyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (baselineType: "configure" | "select", selectedBaselineId: string, selectedAiId: string) => void;
}

const StrategyConfigModal: React.FC<StrategyConfigModalProps> = ({ isOpen, onClose, onSave }) => {
  const [baselineType, setBaselineType] = useState<"configure" | "select">("configure");
  const [selectedBaselineStrategy, setSelectedBaselineStrategy] = useState<string>("non-ai-1");
  const [selectedAiStrategy, setSelectedAiStrategy] = useState<string>("ai_scheduling");

  const [customPeriods, setCustomPeriods] = useState<StrategyPeriod[]>([
    {
      id: "1",
      startTime: "02:00",
      endTime: "06:00",
      chargeReserve: "98",
      dischargeReserve: "2",
      reverseFlowThreshold: "125",
      strategies: [{ id: "s1", type: "峰谷套利" }]
    }
  ]);

  const existingNonAiStrategies = [
    { id: "non-ai-1", name: "峰谷套利策略 (非AI-两充两放)", description: "固定时段：02:00-06:00, 10:00-14:00 充电；15:00-22:00 充电放电套利", periodsCount: 3 },
    { id: "non-ai-2", name: "全额消纳自发自用策略 V1.0", description: "固定时段：08:00-18:00 优先光伏完全消纳入储，减少向电网倒送", periodsCount: 1 },
    { id: "non-ai-3", name: "最大需量控制自保护方案", description: "根据配电变压器需量限额进行削峰，18:00-22:00 放电避峰", periodsCount: 1 },
    { id: "non-ai-4", name: "平段充电-高峰放电策略", description: "平电段定时充电、高峰和尖峰电段定时放电的物理定时方案", periodsCount: 2 }
  ];

  const baselinePeriodsMap: Record<string, StrategyPeriod[]> = {
    "non-ai-1": [
      { id: "na-1-1", startTime: "02:00", endTime: "06:00", chargeReserve: "98", dischargeReserve: "2", reverseFlowThreshold: "125", strategies: [{ id: "nas1", type: "峰谷套利" }] },
      { id: "na-1-2", startTime: "10:00", endTime: "14:00", chargeReserve: "98", dischargeReserve: "2", reverseFlowThreshold: "125", strategies: [{ id: "nas2", type: "峰谷套利" }] },
      { id: "na-1-3", startTime: "15:00", endTime: "22:00", chargeReserve: "2", dischargeReserve: "98", reverseFlowThreshold: "125", strategies: [{ id: "nas3", type: "峰谷套利" }] }
    ],
    "non-ai-2": [
      { id: "na-2-1", startTime: "08:00", endTime: "18:00", chargeReserve: "100", dischargeReserve: "5", reverseFlowThreshold: "0", strategies: [{ id: "nas4", type: "全额消纳" }] }
    ],
    "non-ai-3": [
      { id: "na-3-1", startTime: "18:00", endTime: "22:00", chargeReserve: "20", dischargeReserve: "98", reverseFlowThreshold: "50", strategies: [{ id: "nas5", type: "需量控制" }] }
    ],
    "non-ai-4": [
      { id: "na-4-1", startTime: "08:00", endTime: "11:30", chargeReserve: "95", dischargeReserve: "5", reverseFlowThreshold: "100", strategies: [{ id: "nas6", type: "平段充电" }] },
      { id: "na-4-2", startTime: "18:00", endTime: "22:00", chargeReserve: "5", dischargeReserve: "95", reverseFlowThreshold: "100", strategies: [{ id: "nas7", type: "高峰放电" }] }
    ]
  };

  const availableAiStrategies = [
    { id: "ai_scheduling", name: "AI 调度" },
    { id: "ai_schedule_1", name: "AI 排程1" },
    { id: "ai_schedule_2", name: "AI 排程2" }
  ];

  const addPeriod = () => {
    const newId = (customPeriods.length + 1).toString();
    setCustomPeriods([
      ...customPeriods,
      {
        id: newId,
        startTime: "00:00",
        endTime: "00:00",
        chargeReserve: "",
        dischargeReserve: "",
        reverseFlowThreshold: "",
        strategies: [{ id: `s${newId}`, type: "" }]
      }
    ]);
  };

  const removePeriod = (id: string) => {
    if (customPeriods.length > 1) {
      setCustomPeriods(customPeriods.filter(p => p.id !== id));
    }
  };

  const strategyOptions = [
    "峰谷套利",
    "全额消纳",
    "余电上网",
    "需量控制",
    "平峰充-高峰放 (组合1)",
    "谷电充-尖峰放 (高效方案)",
    "光伏优先-余电入储 (绿色模式)",
    "需量上限保护 (安全模式)"
  ];

  const handleSaveAndExecute = () => {
    if (onSave) {
      onSave(baselineType, selectedBaselineStrategy, selectedAiStrategy);
    }
    onClose();
  };

  return (
    <>
      <datalist id="strategy-options">
        {strategyOptions.map((option, idx) => (
          <option key={idx} value={option} />
        ))}
      </datalist>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 z-50 h-full bg-slate-50 w-full max-w-2xl shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/60 bg-white">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              策略模拟配置与下发
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">选择对比基准基础策略，并选择用于模拟的 AI 策略核心</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* 1. BASELINE STRATEGY CONFIG SECTION (Unified Card) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-6">
            
            {/* 1.1 选择/配置基础策略部分 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-xs">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">1. 配置 / 选择 基础策略 (对比基准)</h4>
                  <p className="text-[11px] text-slate-400">选择作为计算收益提升基准的传统固定物理策略</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setBaselineType("configure")}
                  className={`p-3.5 border rounded-xl text-left transition-all relative ${
                    baselineType === "configure" 
                      ? "border-blue-500 bg-blue-50/25 ring-2 ring-blue-500/10" 
                      : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Settings className={`w-4 h-4 ${baselineType === "configure" ? "text-blue-600" : "text-slate-400"}`} />
                    <span className={`text-xs font-bold ${baselineType === "configure" ? "text-blue-700" : "text-slate-700"}`}>
                      在本页面手动配置
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    直接自定义各时段的充放电保留率、功率等运行参数。
                  </p>
                </button>

                <button 
                  type="button"
                  onClick={() => setBaselineType("select")}
                  className={`p-3.5 border rounded-xl text-left transition-all relative ${
                    baselineType === "select" 
                      ? "border-blue-500 bg-blue-50/25 ring-2 ring-blue-500/10" 
                      : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Cpu className={`w-4 h-4 ${baselineType === "select" ? "text-blue-600" : "text-slate-400"}`} />
                    <span className={`text-xs font-bold ${baselineType === "select" ? "text-blue-700" : "text-slate-700"}`}>
                      选择已创建的非 AI 策略
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    选择企业已发布或正在执行的非 AI 传统排期策略。
                  </p>
                </button>
              </div>

              {/* If choosing to select existing Non-AI strategy */}
              {baselineType === "select" && (
                <div className="space-y-3 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="text-[11px] font-bold text-slate-500 block">选择已创建的策略模板</label>
                  <div className="relative">
                    <select
                      value={selectedBaselineStrategy}
                      onChange={(e) => setSelectedBaselineStrategy(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none pr-10 cursor-pointer shadow-sm"
                    >
                      {existingNonAiStrategies.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Divider line between Step 1 and Step 2 inside the same Unified Card */}
            <div className="border-t border-slate-100 my-2" />

            {/* 1.2 DETAILED PERIOD CONFIG (Shown only if manual configuration is chosen) */}
            {baselineType === "configure" ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800">2. 手动配置时段明细</h4>
                    <p className="text-[11px] text-slate-400">配置储能系统各时段的运行参数与策略类型</p>
                  </div>
                  <button 
                    type="button"
                    onClick={addPeriod}
                    className="flex items-center gap-1 text-[11px] text-indigo-600 font-bold hover:text-indigo-700 transition-colors bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    新增时段
                  </button>
                </div>

                <div className="space-y-4 pt-1">
                  {customPeriods.map((period, index) => (
                    <div key={period.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">运行计划时段 {index + 1}</span>
                        <div className="flex items-center gap-2">
                          {customPeriods.length > 1 && (
                            <button 
                              type="button"
                              onClick={() => removePeriod(period.id)}
                              className="p-1 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        {/* Time Period Input */}
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-bold text-slate-600 min-w-[70px]">适用时段</label>
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex-1 relative">
                              <input 
                                type="text" 
                                value={period.startTime}
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  setCustomPeriods(prev => prev.map(p => p.id === period.id ? { ...p, startTime: newVal } : p));
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-mono focus:outline-none focus:border-indigo-500" 
                              />
                              <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                            </div>
                            <span className="text-slate-300 text-xs">~</span>
                            <div className="flex-1 relative">
                              <input 
                                type="text" 
                                value={period.endTime}
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  setCustomPeriods(prev => prev.map(p => p.id === period.id ? { ...p, endTime: newVal } : p));
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-mono focus:outline-none focus:border-indigo-500" 
                              />
                              <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                            </div>
                          </div>
                        </div>

                        {/* Parameter Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Charge Reserve */}
                          <div>
                            <label className="text-[11px] font-bold text-slate-500 block mb-1">充电预留</label>
                            <div className="relative">
                              <input 
                                type="text" 
                                value={period.chargeReserve}
                                placeholder="充电容量"
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  setCustomPeriods(prev => prev.map(p => p.id === period.id ? { ...p, chargeReserve: newVal } : p));
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-300" 
                              />
                              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <span className="text-[10px] font-mono text-slate-400">%</span>
                                <BatteryCharging className="w-3 h-3 text-slate-400" />
                              </div>
                            </div>
                          </div>

                          {/* Discharge Reserve */}
                          <div>
                            <label className="text-[11px] font-bold text-slate-500 block mb-1">放电预留</label>
                            <div className="relative">
                              <input 
                                type="text" 
                                value={period.dischargeReserve}
                                placeholder="放电深度"
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  setCustomPeriods(prev => prev.map(p => p.id === period.id ? { ...p, dischargeReserve: newVal } : p));
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-300" 
                              />
                              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <span className="text-[10px] font-mono text-slate-400">%</span>
                                <Battery className="w-3 h-3 text-slate-400" />
                              </div>
                            </div>
                          </div>

                          {/* Reverse Flow */}
                          <div>
                            <label className="text-[11px] font-bold text-slate-500 block mb-1">可逆流阈值</label>
                            <div className="relative">
                              <input 
                                type="text" 
                                value={period.reverseFlowThreshold}
                                placeholder="阈值"
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  setCustomPeriods(prev => prev.map(p => p.id === period.id ? { ...p, reverseFlowThreshold: newVal } : p));
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-300" 
                              />
                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400">kW</span>
                            </div>
                          </div>
                        </div>

                        {/* Strategy Type Dropdown */}
                        <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                          <label className="text-xs font-bold text-slate-600 min-w-[70px]">策略类型</label>
                          <div className="flex-1 flex gap-2 items-center">
                            <div className="flex-1 relative">
                              <input 
                                type="text"
                                list="strategy-options"
                                value={period.strategies?.[0]?.type || ""}
                                placeholder="选择或输入策略类型"
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  setCustomPeriods(prev => prev.map(p => p.id === period.id ? { ...p, strategies: [{ id: "s1", type: newVal }] } : p));
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-300 pr-8" 
                              />
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Selected preset strategy details (Read-only view) */
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800">2. 基础策略时段配置详情 (只读)</h4>
                    <p className="text-[11px] text-slate-400">当前所选非 AI 策略的运行时间及充放参数详情</p>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    预设锁定
                  </span>
                </div>

                <div className="space-y-4 pt-1">
                  {(baselinePeriodsMap[selectedBaselineStrategy] || []).map((period, index) => (
                    <div key={period.id} className="bg-slate-50/50 border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
                      <div className="px-4 py-2 bg-slate-100/40 border-b border-slate-200/40 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">计划时段 {index + 1}</span>
                      </div>
                      
                      <div className="p-4 space-y-3.5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-500 min-w-[70px]">适用时段</span>
                          <div className="flex items-center gap-2 flex-1 font-mono text-xs text-slate-800 font-semibold bg-white border border-slate-200/70 px-3 py-1.5 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{period.startTime}</span>
                            <span className="text-slate-300 px-1">~</span>
                            <span>{period.endTime}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block mb-1">充电预留</span>
                            <div className="bg-white border border-slate-200/70 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 flex items-center justify-between">
                              <span>{period.chargeReserve || "0"}%</span>
                              <BatteryCharging className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block mb-1">放电预留</span>
                            <div className="bg-white border border-slate-200/70 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 flex items-center justify-between">
                              <span>{period.dischargeReserve || "0"}%</span>
                              <Battery className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block mb-1">可逆流阈值</span>
                            <div className="bg-white border border-slate-200/70 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 flex items-center justify-between">
                              <span>{period.reverseFlowThreshold || "0"} kW</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-500 min-w-[70px]">策略类型</span>
                          <div className="bg-white border border-slate-200/70 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 flex-1">
                            {period.strategies?.[0]?.type || "未设置"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. AI STRATEGY SELECTION SECTION */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-xs">
                2
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-800">2. 选择进行模拟的 AI 策略</h4>
                <p className="text-[11px] text-slate-400">选择用于与上述基础策略比对套利的 AI 智能托管算法</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {availableAiStrategies.map((ai) => {
                const isSelected = selectedAiStrategy === ai.id;
                return (
                  <button
                    type="button"
                    key={ai.id}
                    onClick={() => setSelectedAiStrategy(ai.id)}
                    className={`w-full px-4 py-3 border text-left rounded-xl transition-all flex items-center justify-between relative overflow-hidden group ${
                      isSelected 
                        ? "bg-emerald-50/30 border-emerald-500 ring-2 ring-emerald-500/10 shadow-sm" 
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`text-sm font-bold tracking-tight ${isSelected ? "text-emerald-800" : "text-slate-700"}`}>
                      {ai.name}
                    </span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 bg-white"
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-slate-200/60 bg-white flex items-center justify-between shadow-[0_-4px_25px_-10px_rgba(0,0,0,0.06)]">
          <div className="flex gap-1.5 items-center text-[10px] text-slate-400 max-w-[280px]">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>算法模拟回测将完全参考本站历史真实负荷及充放参数。</span>
          </div>
          <div className="flex gap-2.5">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button 
              type="button"
              onClick={handleSaveAndExecute}
              className="px-6 py-2 bg-indigo-600 text-white text-xs font-extrabold rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-150 transform active:scale-97 flex items-center gap-1"
            >
              保存并重新算模拟 <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StrategyConfigModal;
