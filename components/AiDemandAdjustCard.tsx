/* ==========================================================================
   AI 策略【PRO】详情 · AI 需量调整
   --------------------------------------------------------------------------
   只在试运行 / 正式运行（即 aiLocked 为 false）时出现。
   开关 = 公共配置里的「需量更新模式：AI 需量调整」，两个基准值也是同一份数据，
   任何一处改动都会写回 localStorage 并广播，另一处刷新。
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import { Info, Zap } from 'lucide-react';
import {
  aiOvercapValue,
  readDemandConfig,
  subscribeDemandConfig,
  writeDemandConfig,
} from './demandSettings';

const AiDemandAdjustCard: React.FC = () => {
  const [mode, setMode] = useState(() => readDemandConfig().mode);
  const [base, setBase] = useState(() => readDemandConfig().base);
  const [overcap, setOvercap] = useState(() => readDemandConfig().overcap);

  /* 公共配置那边改了，这里跟着刷新 */
  useEffect(
    () =>
      subscribeDemandConfig(() => {
        const next = readDemandConfig();
        setMode(next.mode);
        setBase(next.base);
        setOvercap(next.overcap);
      }),
    [],
  );

  const on = mode === 'ai';

  const toggle = () => {
    const next = on ? 'dynamic' : 'ai';
    setMode(next);
    writeDemandConfig({ mode: next });
  };

  const changeBase = (v: string) => {
    setBase(v);
    writeDemandConfig({ base: v });
  };

  const changeOvercap = (v: string) => {
    setOvercap(v);
    writeDemandConfig({ overcap: v });
  };

  return (
    <div
      className={`rounded-[2rem] border p-6 transition-colors ${
        on ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-100 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 ${
                on ? 'bg-indigo-500 border-indigo-500' : 'bg-indigo-50 border-indigo-100'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${on ? 'text-white' : 'text-indigo-600'}`} />
            </span>
            <h3 className="text-sm font-black text-slate-800 tracking-tight">AI 需量调整</h3>
            <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-500">
              与公共配置同步
            </span>
          </div>
          <p className="text-[12px] text-slate-400 leading-relaxed mt-1.5">
            开启后由 AI 双层寻优，按需量门限与超限阈值基准每日自动计算最优调优值。
          </p>
        </div>

        {/* 开关 */}
        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={toggle}
          className={`shrink-0 w-12 h-6 rounded-full p-0.5 transition-all flex ${
            on ? 'bg-indigo-500 justify-end' : 'bg-slate-200 justify-start'
          }`}
          title={on ? '关闭后回到动态追需' : '开启 AI 需量调整'}
        >
          <span className="w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center">
            <span className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-indigo-500' : 'bg-slate-300'}`} />
          </span>
        </button>
      </div>

      {on ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5 pt-5 border-t border-indigo-100/70">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
              需量门限基准值
              <span className="px-1 py-0.2 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] font-black">
                AI 寻优基准
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={base}
                onChange={e => changeBase(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none pr-12 font-mono focus:ring-2 ring-indigo-100 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-slate-400">
                kW
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pl-1">
              月内由 AI 寻优自动调升，次月 1 日重置。
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
              超限阈值基准值
              <span className="px-1 py-0.2 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] font-black">
                AI 寻优基准
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={overcap}
                onChange={e => changeOvercap(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none pr-12 font-mono focus:ring-2 ring-indigo-100 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-slate-400">
                kW
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pl-1">
              建议取需量门限基准值的 85% ~ 90%，当前 AI 寻优值{' '}
              <span className="font-mono font-black text-indigo-600">{aiOvercapValue(overcap)} kW</span>
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-4 flex items-start gap-1.5 text-[11px] text-slate-400 font-medium">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-300" />
          当前关闭，需量按公共配置的「动态追需」运行；打开即切换到 AI 需量调整。
        </p>
      )}
    </div>
  );
};

export default AiDemandAdjustCard;
