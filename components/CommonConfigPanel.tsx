import React, { useState, useEffect } from 'react';
import { ChevronDown, Info, Save, AlertCircle } from 'lucide-react';
import { DEMAND_SYNC_EVENT, readDemandConfig, subscribeDemandConfig } from './demandSettings';
import { readReverseMode, writeReverseMode, type ReverseMode } from './reverseFlowSettings';

interface CommonConfigPanelProps {}

/**
 * 防逆流模式的解释气泡。
 * 两种模式的差别不在「阈值填多少」，而在「拿什么跟阈值比」——
 * 这一点不解释清楚，用户会以为切了模式阈值也跟着变。
 */
const ModeTip: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        aria-label="防逆流模式说明"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="w-4 h-4 rounded-full flex items-center justify-center text-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
      >
        <AlertCircle className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute left-0 top-6 z-40 w-[352px] max-w-[76vw] rounded-xl bg-slate-800/95 text-white shadow-xl p-3.5 space-y-2 text-[11px] leading-relaxed">
          <div>
            <span className="font-black text-emerald-300">总功率防逆流</span>
            <span className="text-white/80">
              {' '}只看关口瞬时总有功功率。三相不平衡重时，总功率够高、但某一相仍可能低于 0，形成单相倒送。
            </span>
          </div>
          <div>
            <span className="font-black text-emerald-300">单相防逆流</span>
            <span className="text-white/80">
              {' '}A/B/C 逐相比较，调度以最轻载相为准，保证每相功率都高于阈值。
            </span>
          </div>
          <div className="pt-2 border-t border-white/10 text-white/60">
            分相数据采不到时自动退回总功率模式，并在报警管理中提示，恢复后自动切回。
          </div>
        </div>
      )}
    </span>
  );
};

const CommonConfigPanel: React.FC<CommonConfigPanelProps> = () => {
  // Tariff Selects
  const [tariff1, setTariff1] = useState(() => {
    const saved = localStorage.getItem('sys_tariff1');
    return (saved === '单一制' || saved === '两部制') ? saved : '两部制';
  });
  const [tariff2, setTariff2] = useState(() => localStorage.getItem('sys_tariff2') || '按需计费');

  // Over-capacity Parameters
  const [demandMode, setDemandMode] = useState<'static' | 'dynamic' | 'ai'>(() => {
    return (localStorage.getItem('sys_demandMode') as 'static' | 'dynamic' | 'ai') || 'dynamic';
  });
  const [demandLimit, setDemandLimit] = useState(() => localStorage.getItem('sys_demandLimit') || '100');
  const [overcapacityLimit, setOvercapacityLimit] = useState(() => localStorage.getItem('sys_overcapacityLimit') || '90');
  
  // AI-specific Parameters
  const [initialDemandLimit, setInitialDemandLimit] = useState(() => localStorage.getItem('sys_initialDemandLimit') || '500');
  const [baselineOvercapacity, setBaselineOvercapacity] = useState(() => localStorage.getItem('sys_baselineOvercapacity') || '470');

  // 二级变压器参数
  const [transformerCapacity, setTransformerCapacity] = useState(() => localStorage.getItem('sys_transformerCapacity') || '1850');
  const [transformerOvercap, setTransformerOvercap] = useState(() => localStorage.getItem('sys_transformerOvercap') || '1750');

  // Reverse Flow Parameters
  const [reverseLimit, setReverseLimit] = useState(() => localStorage.getItem('sys_reverseLimit') || '10');
  /** 防逆流模式：默认总功率，与 PRD BR-02 一致（存量站点升级后仍按总功率跑） */
  const [reverseMode, setReverseMode] = useState<ReverseMode>(readReverseMode);
  /** EMS 侧实际在跑的模式（= 上一次保存的值），用来区分「表单里选了的」和「已经下发的」 */
  const [runningMode, setRunningMode] = useState<ReverseMode>(readReverseMode);
  const modePending = reverseMode !== runningMode;

  // Energy Storage Common Parameters
  const [socChargeLimit, setSocChargeLimit] = useState(() => localStorage.getItem('sys_socChargeLimit') || '98');
  const [socDischargeLimit, setSocDischargeLimit] = useState(() => localStorage.getItem('sys_socDischargeLimit') || '5.1');

  const [showSaveToast, setShowSaveToast] = useState(false);

  /* 策略详情页（AI 策略【PRO】）改了需量设置，这里同步刷新 */
  useEffect(
    () =>
      subscribeDemandConfig(() => {
        const next = readDemandConfig();
        setDemandMode(next.mode);
        setInitialDemandLimit(next.base);
        setBaselineOvercapacity(next.overcap);
      }),
    [],
  );

  // Interaction: When other options are chosen, retain AI values but they aren't active.
  // When switching to AI from other modes, ensure we display blank or placeholders initially if not filled.
  const handleCancel = () => {
    const savedTariff1 = localStorage.getItem('sys_tariff1');
    setTariff1((savedTariff1 === '单一制' || savedTariff1 === '两部制') ? savedTariff1 : '两部制');
    setTariff2(localStorage.getItem('sys_tariff2') || '按需计费');
    setDemandMode((localStorage.getItem('sys_demandMode') as 'static' | 'dynamic' | 'ai') || 'dynamic');
    setDemandLimit(localStorage.getItem('sys_demandLimit') || '100');
    setOvercapacityLimit(localStorage.getItem('sys_overcapacityLimit') || '90');
    setInitialDemandLimit(localStorage.getItem('sys_initialDemandLimit') || '500');
    setBaselineOvercapacity(localStorage.getItem('sys_baselineOvercapacity') || '470');
    setReverseLimit(localStorage.getItem('sys_reverseLimit') || '10');
    setReverseMode(readReverseMode());
    setRunningMode(readReverseMode());
    setSocChargeLimit(localStorage.getItem('sys_socChargeLimit') || '98');
    setSocDischargeLimit(localStorage.getItem('sys_socDischargeLimit') || '5.1');
    setTransformerCapacity(localStorage.getItem('sys_transformerCapacity') || '1850');
    setTransformerOvercap(localStorage.getItem('sys_transformerOvercap') || '1750');
  };

  const handleSave = () => {
    localStorage.setItem('sys_tariff1', tariff1);
    localStorage.setItem('sys_tariff2', tariff2);
    localStorage.setItem('sys_demandMode', demandMode);
    localStorage.setItem('sys_demandLimit', demandLimit);
    localStorage.setItem('sys_overcapacityLimit', overcapacityLimit);
    localStorage.setItem('sys_initialDemandLimit', initialDemandLimit);
    localStorage.setItem('sys_baselineOvercapacity', baselineOvercapacity);
    localStorage.setItem('sys_reverseLimit', reverseLimit);
    writeReverseMode(reverseMode);
    setRunningMode(reverseMode);
    localStorage.setItem('sys_socChargeLimit', socChargeLimit);
    localStorage.setItem('sys_socDischargeLimit', socDischargeLimit);
    localStorage.setItem('sys_transformerCapacity', transformerCapacity);
    localStorage.setItem('sys_transformerOvercap', transformerOvercap);

    // Trigger local storage event to notify other open components
    window.dispatchEvent(new Event('storage'));
    // 策略详情页的「AI 需量调整」读的是同一份数据，保存后让它跟着刷新
    window.dispatchEvent(new Event(DEMAND_SYNC_EVENT));

    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3500);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex-1 flex flex-col gap-4 relative animate-in fade-in duration-300">
      {/* 电价分类 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <span className="text-rose-500 font-bold">*</span>电价分类
          </label>
          <div className="relative">
            <select
              value={tariff1}
              onChange={(e) => setTariff1(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 ring-emerald-100 outline-none appearance-none transition-all shadow-sm"
            >
              <option value="单一制">单一制</option>
              <option value="两部制">两部制</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {tariff1 === '两部制' ? (
          <div className="space-y-2 animate-in fade-in duration-300">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <span className="text-rose-500 font-bold">*</span>计费方式 (两部制)
            </label>
            <div className="relative">
              <select
                value={tariff2}
                onChange={(e) => setTariff2(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 ring-emerald-100 outline-none appearance-none transition-all shadow-sm"
              >
                <option value="按容分计费">按容分计费</option>
                <option value="按需计费">按需计费</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        ) : (
          <div className="hidden md:block"></div>
        )}
      </div>

      {/* 总线参数 */}
      <fieldset className="border border-slate-200/80 rounded-xl p-4 relative pt-5 mt-2">
        <legend className="px-2 text-xs font-bold text-slate-600 tracking-tight bg-white">总线参数</legend>
        
        <div className="space-y-4">
          {/* 超限参数 */}
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">超限参数</div>

          {/* 需量更新模式 */}
          <div className="space-y-3">
            <div className="flex items-center gap-6">
              <span className="text-xs font-bold text-slate-500">需量更新模式</span>
              <div className="flex items-center gap-6 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                  <input
                    type="radio"
                    name="demandMode"
                    checked={demandMode === 'static'}
                    onChange={() => setDemandMode('static')}
                    className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 accent-emerald-500"
                  />
                  <span className={demandMode === 'static' ? 'text-emerald-600 font-extrabold' : 'text-slate-500'}>静态控需</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                  <input
                    type="radio"
                    name="demandMode"
                    checked={demandMode === 'dynamic'}
                    onChange={() => setDemandMode('dynamic')}
                    className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 accent-emerald-500"
                  />
                  <span className={demandMode === 'dynamic' ? 'text-emerald-600 font-extrabold' : 'text-slate-500'}>动态追需</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                  <input
                    type="radio"
                    name="demandMode"
                    checked={demandMode === 'ai'}
                    onChange={() => setDemandMode('ai')}
                    className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 accent-emerald-500"
                  />
                  <span className={demandMode === 'ai' ? 'text-indigo-600 font-extrabold flex items-center gap-1.5' : 'text-slate-500 flex items-center gap-1.5'}>
                    <span className="bg-indigo-50 text-indigo-600 px-1 py-0.2 rounded font-black text-[9px] border border-indigo-100 scale-90">AI</span>
                    AI 需量调整
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-start gap-1.5 text-[11px] text-slate-400 font-semibold pl-[104px]">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-400" />
              {demandMode === 'dynamic' ? (
                <span>实时监测需量，超限时自动抬升门限以保障充电（只升不降，按周期重置）</span>
              ) : demandMode === 'ai' ? (
                <span>由 AI 双层寻优，根据设定的需量门限与超限阈值基准，每日自动计算最优调优值。</span>
              ) : (
                <span>系统按固定超容门限运行，适合负荷波动规律 of 场景</span>
              )}
            </div>
          </div>

          {/* 输入框网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            {/* 需量门限 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                {demandMode === 'dynamic' ? '需量门限基准' : demandMode === 'ai' ? '需量门限基准值' : '需量门限功率'}
                {demandMode === 'ai' && (
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.2 rounded border border-indigo-100 font-bold scale-90">AI 寻优基准</span>
                )}
              </span>
              <div className="relative">
                <input
                  type="number"
                  value={demandMode === 'ai' ? initialDemandLimit : demandLimit}
                  onChange={(e) => {
                    if (demandMode === 'ai') {
                      setInitialDemandLimit(e.target.value);
                    } else {
                      setDemandLimit(e.target.value);
                    }
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 ring-emerald-100 outline-none pr-12 font-mono"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-slate-400">kW</span>
              </div>
              <div className="space-y-1.5 pl-1">
                {(demandMode === 'ai' || demandMode === 'dynamic') && (
                  <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5">
                    <span>本月最大需量</span>
                    <span className="text-slate-700 font-black font-mono">90 kW</span>
                    <span className="text-slate-400 font-mono pl-2">02-03 13:00:00</span>
                  </div>
                )}
                <div className="text-[11px] text-slate-400 font-medium flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-300" />
                  {demandMode === 'ai' ? (
                    <span>设置 AI 模式下的需量寻优起始基准值，月内由 AI 寻优自动调升，次月1日重置。</span>
                  ) : demandMode === 'dynamic' ? (
                    <span>设置值 100kW 保存后立即生效</span>
                  ) : (
                    <span>站点从电网获取电力的功率上限，两部制需量计费参考合同需量功率。</span>
                  )}
                </div>
              </div>
            </div>

            {/* 超限阈值 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                {demandMode === 'dynamic' ? '超限限值基准' : demandMode === 'ai' ? '超限阈值基准值' : '超限阈值'}
                {demandMode === 'ai' && (
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.2 rounded border border-indigo-100 font-bold scale-90">AI 寻优基准</span>
                )}
              </span>
              <div className="relative">
                <input
                  type="number"
                  value={demandMode === 'ai' ? baselineOvercapacity : overcapacityLimit}
                  onChange={(e) => {
                    if (demandMode === 'ai') {
                      setBaselineOvercapacity(e.target.value);
                    } else {
                      setOvercapacityLimit(e.target.value);
                    }
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 ring-emerald-100 outline-none pr-12 font-mono"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-slate-400">kW</span>
              </div>
              <div className="space-y-1.5 pl-1">
                {demandMode === 'ai' ? (
                  <div className="text-[11px] text-indigo-500 font-bold flex items-center gap-1.5 animate-in fade-in duration-300">
                    <span>AI寻优超限阈值</span>
                    <span className="text-indigo-700 font-black font-mono">
                      {(Math.round((parseFloat(baselineOvercapacity) || 470) * 0.996 * 10) / 10).toFixed(1)} kW
                    </span>
                    <span className="text-slate-400 font-mono pl-2">今日 09:15:00</span>
                  </div>
                ) : demandMode === 'dynamic' && (
                  <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5">
                    <span>EMS生效超限阈值</span>
                    <span className="text-slate-700 font-black font-mono">90 kW</span>
                    <span className="text-slate-400 font-mono pl-2">02-03 13:00:00</span>
                  </div>
                )}
                <div className="text-[11px] text-slate-400 font-medium flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-300" />
                  {demandMode === 'ai' ? (
                    <span>设置 AI 模式下的超限起始基准，建议参考需量门限基准值的 85% ~ 90%。</span>
                  ) : demandMode === 'dynamic' ? (
                    <span>设置动态追需的起始基准值，建议参考需量门限功率的 85% ~ 90%</span>
                  ) : (
                    <span>超限阈值是为了保证系统安全稳定运行的最大负载限值，建议设置为需量门限功率的 85% ~ 90%。</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      {/* 二级变压器参数 */}
      <fieldset className="border border-slate-200/80 rounded-xl p-6 relative pt-8 mt-4">
        <legend className="px-3 text-xs font-bold text-slate-600 tracking-tight bg-white">二级变压器参数</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 变压器额定容量 */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500">变压器额定容量</span>
            <div className="relative">
              <input
                type="number"
                value={transformerCapacity}
                onChange={(e) => setTransformerCapacity(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 ring-emerald-100 outline-none pr-14 font-mono"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-slate-400">kVA</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium flex items-start gap-1.5 pl-1">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-300" />
              <span>建议配置为变压器铭牌的视在功率值，无铭牌则使用图纸设计容量。</span>
            </div>
          </div>

          {/* 变压器最大有功输出 */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500">变压器最大有功输出</span>
            <div className="relative">
              <input
                type="number"
                value={transformerOvercap}
                onChange={(e) => setTransformerOvercap(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 ring-emerald-100 outline-none pr-14 font-mono"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-slate-400">kW</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium flex items-start gap-1.5 pl-1">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-300" />
              <span>变压器运行的最大有功功率值，建议设置为变压器额定容量的 85% ~ 90%。</span>
            </div>
          </div>
        </div>
      </fieldset>

      {/* 逆流参数 */}
      <fieldset className="border border-slate-200/80 rounded-xl p-6 relative pt-8 mt-4">
        <legend className="px-3 text-xs font-bold text-slate-600 tracking-tight bg-white">逆流参数</legend>

        <div className="space-y-5">
          {/* 防逆流模式（PRD 4.1.2：单选组放在阈值输入框之前） */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              防逆流模式
              <ModeTip />
            </span>
            <div className="flex items-center gap-6 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                <input
                  type="radio"
                  name="reverseMode"
                  checked={reverseMode === 'total'}
                  onChange={() => setReverseMode('total')}
                  className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 accent-emerald-500"
                />
                <span className={reverseMode === 'total' ? 'text-emerald-600 font-extrabold' : 'text-slate-500'}>
                  总功率防逆流
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                <input
                  type="radio"
                  name="reverseMode"
                  checked={reverseMode === 'phase'}
                  onChange={() => setReverseMode('phase')}
                  className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 accent-emerald-500"
                />
                <span className={reverseMode === 'phase' ? 'text-emerald-600 font-extrabold' : 'text-slate-500'}>
                  单相防逆流
                </span>
              </label>
              {reverseMode === 'phase' && (
                <span className="text-[11px] font-medium text-amber-600 flex items-center gap-1.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  代价是下网电量增加：最轻载相被拉回阈值以上，关口总下网功率随之抬升
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 逆流阈值：字段只有一个，含义随模式联动（BR-03/BR-04） */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500">
                {reverseMode === 'phase' ? '单相逆流阈值' : '逆流阈值'}
              </span>
              <div className="relative">
                <input
                  type="number"
                  value={reverseLimit}
                  onChange={(e) => setReverseLimit(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 ring-emerald-100 outline-none pr-12 font-mono"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold font-mono">kW</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium flex items-start gap-1.5 pl-1">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-300" />
                {reverseMode === 'phase' ? (
                  <span>切换模式时数值沿用，含义已从总功率阈值变为单相阈值。</span>
                ) : (
                  <span>未获取电网批准，站点限制向电网倒送功率，您可以根据项目实际情况，灵活调整逆流阈值，对站点进行防逆流保护！</span>
                )}
              </div>
            </div>

            {/* 当前执行 = 上一次保存下去的模式，未保存的改动还没下发，这里能看出来 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
                当前执行
                {modePending && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100">
                    保存后生效
                  </span>
                )}
              </span>
              <div
                className={`h-[46px] rounded-xl border px-4 flex items-center gap-2 ${
                  runningMode === 'phase'
                    ? 'bg-emerald-50/60 border-emerald-100'
                    : 'bg-slate-50 border-slate-100'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    runningMode === 'phase' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
                <span
                  className={`text-sm font-black ${
                    runningMode === 'phase' ? 'text-emerald-700' : 'text-slate-600'
                  }`}
                >
                  {runningMode === 'phase' ? '单相防逆流' : '总功率防逆流'}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {runningMode === 'phase' ? '逐相保障，每相 > 阈值' : '按关口总功率调控'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      {/* 储能公共参数 */}
      <fieldset className="border border-slate-200/80 rounded-xl p-6 relative pt-8 mt-4 mb-6">
        <legend className="px-3 text-xs font-bold text-slate-600 tracking-tight bg-white">储能公共参数</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 充电阈值 */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500">储能公共SOC充电阈值</span>
            <div className="relative">
              <input
                type="number"
                value={socChargeLimit}
                onChange={(e) => setSocChargeLimit(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 ring-emerald-100 outline-none pr-12 font-mono"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold font-mono">%</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium flex items-start gap-1.5 pl-1">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-300" />
              <span>储能最大充电状态，用于防止过度充电。</span>
            </div>
          </div>

          {/* 放电阈值 */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500">储能公共SOC放电阈值</span>
            <div className="relative">
              <input
                type="number"
                value={socDischargeLimit}
                onChange={(e) => setSocDischargeLimit(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 ring-emerald-100 outline-none pr-12 font-mono"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold font-mono">%</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium flex items-start gap-1.5 pl-1">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-300" />
              <span>储能最小放电状态，用于防止过度放电。</span>
            </div>
          </div>
        </div>
      </fieldset>

      {/* 底部操作按钮 */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
        <button
          onClick={handleCancel}
          className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          保存
        </button>
      </div>

      {/* 吐司弹窗 */}
      {showSaveToast && (
        <div className="fixed bottom-24 right-12 z-[999] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl shadow-emerald-100 flex items-center gap-2 border border-emerald-500 animate-in fade-in slide-in-from-bottom-4">
          <span className="font-bold">✓ 公共参数配置已成功保存！</span>
        </div>
      )}
    </div>
  );
};

export default CommonConfigPanel;
