import React, { useState } from "react";
import { X, Plus, Trash2, Settings, Zap, Shield, HelpCircle, Clock, ChevronDown, BatteryCharging, Battery, Info } from "lucide-react";

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
}

const StrategyConfigModal: React.FC<StrategyConfigModalProps> = ({ isOpen, onClose }) => {
  const [configMode, setConfigMode] = useState<"custom" | "preset">("custom");
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  const [customPeriods, setCustomPeriods] = useState<StrategyPeriod[]>([
    {
      id: "1",
      startTime: "00:00",
      endTime: "00:00",
      chargeReserve: "",
      dischargeReserve: "",
      reverseFlowThreshold: "",
      strategies: [{ id: "s1", type: "" }]
    }
  ]);

  const presetModes = [
    {
      name: "峰谷套利 (两充两放)",
      description: "基于电价走势自动配置，获取最大差价收益",
      periods: [
        { id: "p1", startTime: "02:00", endTime: "06:00", chargeReserve: "98", dischargeReserve: "2", reverseFlowThreshold: "125", strategies: [{ id: "s1", type: "峰谷套利" }] },
        { id: "p2", startTime: "10:00", endTime: "14:00", chargeReserve: "98", dischargeReserve: "2", reverseFlowThreshold: "125", strategies: [{ id: "s2", type: "峰谷套利" }] },
        { id: "p3", startTime: "15:00", endTime: "22:00", chargeReserve: "2", dischargeReserve: "98", reverseFlowThreshold: "125", strategies: [{ id: "s3", type: "峰谷套利" }] }
      ]
    },
    {
      name: "全额消纳 (自发自用)",
      description: "优先满足负载，多余电量入储",
      periods: [
        { id: "px1", startTime: "08:00", endTime: "18:00", chargeReserve: "100", dischargeReserve: "5", reverseFlowThreshold: "0", strategies: [{ id: "sx1", type: "全额消纳" }] }
      ]
    },
    {
      name: "需量控制策略",
      description: "针对配变限额进行削峰填谷，降低需量费",
      periods: [
        { id: "pd1", startTime: "18:00", endTime: "22:00", chargeReserve: "20", dischargeReserve: "98", reverseFlowThreshold: "50", strategies: [{ id: "sd1", type: "需量控制" }] }
      ]
    }
  ];

  const handlePresetSelect = (modeName: string) => {
    setSelectedPreset(modeName);
    const preset = presetModes.find(m => m.name === modeName);
    if (preset) {
      setCustomPeriods(preset.periods as any);
    }
  };

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

  return (
    <>
      <datalist id="strategy-options">
        {strategyOptions.map((option, idx) => (
          <option key={idx} value={option} />
        ))}
      </datalist>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 z-50 h-full bg-white w-full max-w-2xl shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">自定义策略配置</h2>
            <p className="text-xs text-slate-400 mt-0.5">配置储能系统各时段的运行参数与策略类型</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          <div className="space-y-6">
            {/* Mode Switcher */}
            <div className="bg-white border border-slate-100 p-1.5 rounded-xl flex gap-1.5 shadow-sm">
              <button 
                onClick={() => setConfigMode("custom")}
                className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                  configMode === "custom" 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Settings className="w-4 h-4" />
                手动自定义配置
              </button>
              <button 
                onClick={() => setConfigMode("preset")}
                className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                  configMode === "preset" 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Zap className="w-4 h-4" />
                选用已有模式
              </button>
            </div>

            {configMode === "preset" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[13px] font-bold text-slate-700 ml-1">选择策略模式</label>
                <div className="grid grid-cols-1 gap-3">
                  {presetModes.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handlePresetSelect(item.name)}
                      className={`p-4 border text-left rounded-xl transition-all group ${
                        selectedPreset === item.name 
                          ? "bg-indigo-50/50 border-indigo-200 ring-2 ring-indigo-500/10" 
                          : "bg-white border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-bold ${selectedPreset === item.name ? "text-indigo-700" : "text-slate-800"}`}>
                          {item.name}
                        </span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          selectedPreset === item.name ? "border-indigo-600 bg-indigo-600" : "border-slate-200"
                        }`}>
                          {selectedPreset === item.name && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500">{item.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <h3 className="text-[14px] font-bold text-slate-800">时段明细配置</h3>
              {configMode === "custom" && (
                <button 
                  onClick={addPeriod}
                  className="flex items-center gap-1 text-[12px] text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  新增时段
                </button>
              )}
            </div>

            <div className="space-y-4">
              {customPeriods.map((period, index) => (
                <div key={period.id} className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden group transition-opacity ${configMode === "preset" ? "opacity-90" : ""}`}>
                  <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[13px] font-bold text-slate-800">时段{index + 1}</span>
                    <div className="flex items-center gap-3">
                      {configMode === "custom" && (
                        <button 
                          onClick={() => removePeriod(period.id)}
                          className="p-1 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <ChevronDown className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Time Period Input */}
                    <div className="flex items-center gap-4">
                      <label className="text-[13px] font-medium text-slate-600 min-w-20"><span className="text-red-500 ml-[-8px] mr-1">*</span>适用时段</label>
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-1 relative">
                          <input 
                            type="text" 
                            value={period.startTime}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setCustomPeriods(prev => prev.map(p => p.id === period.id ? { ...p, startTime: newVal } : p));
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-700 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                          />
                          <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 p-0.5" />
                        </div>
                        <span className="text-slate-300">~</span>
                        <div className="flex-1 relative">
                          <input 
                            type="text" 
                            value={period.endTime}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setCustomPeriods(prev => prev.map(p => p.id === period.id ? { ...p, endTime: newVal } : p));
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-700 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                          />
                          <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 p-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Parameter Inputs */}
                    <div className="space-y-4">
                      {/* Charge Reserve */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 min-w-20">
                          <label className="text-[13px] font-medium text-slate-600">充电预留</label>
                          <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                        <div className="flex-1 relative group/input">
                          <input 
                            type="text" 
                            value={period.chargeReserve}
                            placeholder="充电预留容量"
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setCustomPeriods(prev => prev.map(p => p.id === period.id ? { ...p, chargeReserve: newVal } : p));
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-indigo-300 transition-colors" 
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <span className="text-sm font-mono text-slate-400">%</span>
                            <BatteryCharging className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      </div>

                      {/* Discharge Reserve */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 min-w-20">
                          <label className="text-[13px] font-medium text-slate-600">放电预留</label>
                          <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                        <div className="flex-1 relative">
                          <input 
                            type="text" 
                            value={period.dischargeReserve}
                            placeholder="放电预留容量"
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setCustomPeriods(prev => prev.map(p => p.id === period.id ? { ...p, dischargeReserve: newVal } : p));
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-indigo-300 transition-colors" 
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <span className="text-sm font-mono text-slate-400">%</span>
                            <Battery className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      </div>

                      {/* Reverse Flow */}
                      <div className="flex items-center gap-4">
                        <label className="text-[13px] font-medium text-slate-600 min-w-20">可逆流阈值</label>
                        <div className="flex-1 relative">
                          <input 
                            type="text" 
                            value={period.reverseFlowThreshold}
                            placeholder="请输入可逆流阈值"
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setCustomPeriods(prev => prev.map(p => p.id === period.id ? { ...p, reverseFlowThreshold: newVal } : p));
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-indigo-300 transition-colors" 
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-mono text-slate-400">kW</span>
                        </div>
                      </div>
                    </div>

                    {/* Strategy Type Dropdown */}
                    <div className="pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-4">
                        <label className="text-[13px] font-medium text-slate-600 min-w-20"><span className="text-red-500 ml-[-8px] mr-1">*</span>策略类型1</label>
                        <div className="flex-1 flex gap-2 items-center">
                          <div className="flex-1 relative">
                            <input 
                              type="text"
                              list="strategy-options"
                              value={period.strategies?.[0]?.type || ""}
                              placeholder="请选择或输入策略类型"
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setCustomPeriods(prev => prev.map(p => p.id === period.id ? { ...p, strategies: [{ id: "s1", type: newVal }] } : p));
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-300 transition-colors pr-10" 
                            />
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                          <div className="flex items-center gap-1.5 ml-2">
                            <div className="p-1 px-1.5 bg-emerald-50 text-emerald-500 rounded border border-emerald-100/50 cursor-pointer hover:bg-emerald-100 transition-colors">
                              <Plus className="w-3.5 h-3.5" />
                            </div>
                            <div className="p-1 px-1.5 bg-slate-50 text-slate-300 rounded border border-slate-100/50 cursor-not-allowed">
                              <div className="w-3.5 h-0.5 bg-slate-300 rounded-full" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-between bg-white shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
          <div className="flex gap-2 items-center text-[11px] text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>修改后请确认下发，BMS 系统将在同步后生效。</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2 border border-slate-200 text-slate-600 text-[13px] font-bold rounded-lg hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button 
              onClick={onClose}
              className="px-8 py-2 bg-indigo-600 text-white text-[13px] font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
            >
              保存并执行
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StrategyConfigModal;
