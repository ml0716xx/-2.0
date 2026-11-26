import React, { useState } from 'react';
import { SlidersHorizontal, X, Check, Lock, ShieldCheck } from 'lucide-react';
import type { Lifecycle } from './BusinessReportPage';

/* ==========================================================================
   状态预览（演示用）
   --------------------------------------------------------------------------
   开通改成「扫码由零碳云管家顾问办理」之后，系统内不再有把客户从
   未开通推到正式运行的动作，演示时没法翻到另一态的页面。

   所以补一个纯前端的开关：Header 右侧挂一枚小胶囊，点开选状态，选完即关。
   它只改 App 里的 lifecycle，不碰任何开通逻辑，也不代表真实客户状态 ——
   页面上凡是跟状态相关的模块（状态条、报告口径、策略参数可见性）都会跟着变。
   ========================================================================== */

const STATES: {
  key: Lifecycle;
  label: string;
  short: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    key: 'presale',
    label: '未开通',
    short: '售前',
    desc: '报告走仿真基线口径，AI 策略参数不可见，各页挂开通引导',
    icon: Lock,
    color: '#5A6B7C',
    bg: '#F4F6F9',
    border: '#E3E8EE',
  },
  {
    key: 'formal',
    label: '正式运行',
    short: '正式',
    desc: '常态化托管，长期累积收益口径，页面不再挂状态条',
    icon: ShieldCheck,
    color: '#17705A',
    bg: '#E8F7F1',
    border: '#B7E4D3',
  },
];

const LifecyclePreviewPanel: React.FC<{
  lifecycle: Lifecycle;
  onSwitch: (l: Lifecycle) => void;
}> = ({ lifecycle, onSwitch }) => {
  const [open, setOpen] = useState(false);
  const current = STATES.find((s) => s.key === lifecycle) ?? STATES[0];

  const pick = (key: Lifecycle) => {
    onSwitch(key);
    setOpen(false);
  };

  return (
    <>
      {/* 入口挂在 Header 右侧，跟着页面走；一眼能看到当前处于哪一态 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 h-9 px-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-100 transition-colors"
        title="演示用：切换客户生命周期，查看不同状态下的页面"
      >
        <SlidersHorizontal size={12} className="text-slate-400" />
        状态预览
        <span className="flex items-center gap-1 pl-1.5 ml-0.5 border-l border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: current.color }} />
          {current.label}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1A2A3A]/45 backdrop-blur-[2px]" onClick={() => setOpen(false)} />

          <div className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl border border-[#DCE3EB] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#EAEDF2] flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-[#1E9C7E]" />
                  <h3 className="text-[15px] font-bold text-[#1A2A3A]">状态预览</h3>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#F4F6F9] border border-[#E3E8EE] text-[10px] font-bold text-[#8A98A6]">
                    演示用
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-[#8A98A6]">
                  手动切换客户生命周期，核对两种状态下的页面形态
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-[#8A98A6] hover:text-[#1A2A3A] hover:bg-[#F4F6F9] transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-4 py-3.5 space-y-2">
              {STATES.map((s) => {
                const active = s.key === lifecycle;
                const Icon = s.icon;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => pick(s.key)}
                    className={`w-full text-left rounded-xl border px-3.5 py-3 transition-all ${
                      active
                        ? 'border-[#1E9C7E] bg-[#F1FBF7] shadow-xs'
                        : 'border-[#EAEDF2] bg-white hover:border-[#CFD8E3] hover:bg-[#F9FBFC]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                      </span>
                      <span
                        className="text-[12.5px] font-bold"
                        style={{ color: active ? '#17705A' : '#1A2A3A' }}
                      >
                        {s.label}
                      </span>
                      <span className="text-[10px] text-[#93A1B0]">{s.short}</span>
                      {active && (
                        <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-[#1E9C7E]">
                          <Check size={12} />
                          当前
                        </span>
                      )}
                    </div>
                    <p className="mt-1 pl-8 text-[10.5px] text-[#7F8C8D] leading-relaxed">{s.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="px-5 py-3 border-t border-[#EAEDF2] bg-[#F9FBFC]">
              <p className="text-[10px] text-[#8A98A6] leading-relaxed">
                这里的切换只影响预览。真实开通仍走扫码 —— 由零碳云管家顾问在后台配置，页面状态随之自动更新。
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LifecyclePreviewPanel;
