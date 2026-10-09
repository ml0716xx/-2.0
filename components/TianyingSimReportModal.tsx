/* ==========================================================================
   《天盈 AI 仿真报告》· 网页端弹窗
   --------------------------------------------------------------------------
   用户旅程位置：售前推广阶段（潜在客户 / 未开通）
   触达方式：Web 端自动弹出，支持「本月不再提示」
   目标动作：阅读仿真收益 → 点击【一键免费开通 30 天 AI 智能调度】

   正文两章节（仿真收益对比 / 典型日分析）与运营端「推送仿真报告」同源，
   区别在于：本弹窗是客户侧看到的报告正文，不再有章节勾选与推送预览，
   底部换成试用转化 CTA。数字全部取自 tianyingReportData.ts。
   ========================================================================== */

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  Battery,
  ArrowRight,
  Zap,
  CheckCircle2,
  Rocket,
} from 'lucide-react';
import {
  TY_META,
  TY_SIM_KPI,
  TY_SIM_DELTA,
  fmt,
  fmtSigned,
} from './tianyingReportData';
import TianyingSimReportBody from './TianyingSimReportBody';

interface TianyingSimReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 点击【一键免费开通 30 天 AI 智能调度】 */
  onActivate: () => void;
  /** 勾选「本月不再提示」并关闭时触发 */
  onDismissThisMonth: () => void;
}

const C = {
  green: '#1E9C7E',
  greenDeep: '#17705A',
  blue: '#3B82F6',
  amber: '#F59E0B',
  ink: '#1A2A3A',
  slate: '#5A6B7C',
  line: '#EAEDF2',
  bg: '#F7F9FB',
};

export default function TianyingSimReportModal({
  isOpen,
  onClose,
  onActivate,
  onDismissThisMonth,
}: TianyingSimReportModalProps) {
  const [dontRemind, setDontRemind] = useState(false);
  const [activating, setActivating] = useState(false);

  if (!isOpen) return null;

  const growth = TY_SIM_DELTA.liftPct;
  const totalReal = TY_SIM_KPI.total.real;
  const totalSim = TY_SIM_KPI.total.sim;
  const storageDiff = TY_SIM_DELTA.storageDiff;
  const pvDiff = TY_SIM_DELTA.pvDiff;

  const handleClose = () => {
    if (dontRemind) onDismissThisMonth();
    onClose();
  };

  const handleActivate = () => {
    if (activating) return;
    setActivating(true);
    window.setTimeout(() => {
      setActivating(false);
      onActivate();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1A2A3A]/55 backdrop-blur-[2px]" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[1080px] h-[860px] max-h-[94vh] flex flex-col overflow-hidden border border-[#DCE3EB]">
        {/* ------------------------------ 报告头 ------------------------------ */}
        <div className="relative shrink-0 bg-gradient-to-br from-[#1A2A3A] via-[#1E3A46] to-[#17705A] text-white px-6 py-5">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-white/70 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/12 border border-white/20 flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-[#7BE0C0]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold tracking-tight">天盈 AI 仿真报告</h2>
                <span className="px-2 py-0.5 rounded-md bg-[#7BE0C0]/15 border border-[#7BE0C0]/35 text-[#9DECD3] text-[10px] font-bold">
                  AI 策略预评估
                </span>
              </div>
              <p className="text-[12px] text-white/70 mt-1">
                {TY_META.station} · {TY_META.region} · {TY_META.periodLabel} · {TY_META.version}
              </p>
            </div>
          </div>

          {/* 核心结论条 */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 rounded-xl bg-white/8 border border-white/15 px-4 py-3">
              <div className="text-[11px] text-white/60">基于站点历史负荷与光伏数据回算</div>
              <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                <span className="text-[22px] font-black font-mono">
                  +{fmt(TY_SIM_DELTA.net, 0)}
                </span>
                <span className="text-xs text-white/70">元 / 月</span>
                <span className="ml-1 px-2 py-0.5 rounded-md bg-[#7BE0C0]/18 text-[#9DECD3] text-[11px] font-bold font-mono">
                  提升 {fmt(growth, 1)}%
                </span>
              </div>
              <div className="text-[11px] text-white/60 mt-1">
                总收益 {fmt(totalReal, 0)} 元 → {fmt(totalSim, 0)} 元（全月口径）
              </div>
            </div>
            <div className="rounded-xl bg-white/8 border border-white/15 px-4 py-3">
              <div className="text-[11px] text-white/60">增量主来源</div>
              <div className="mt-1.5 flex items-center gap-2">
                <Battery size={14} className="text-[#9DECD3]" />
                <span className="text-sm font-bold">储能收益</span>
                <span className="font-mono font-black text-[#9DECD3]">
                  {fmtSigned(storageDiff, 0)}
                </span>
              </div>
              <div className="text-[11px] text-white/55 mt-1">
                光伏收益 {fmtSigned(pvDiff, 0)}（消纳率已高位）
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------ 正文 ------------------------------ */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-[#F7F9FB] px-6 py-5 space-y-4">
          <TianyingSimReportBody />
        </div>

        {/* ------------------------------ 底部 CTA ------------------------------ */}
        <div className="shrink-0 border-t border-[#EAEDF2] bg-white px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="min-w-0">
              <label className="flex items-center gap-1.5 cursor-pointer select-none w-fit">
                <input
                  type="checkbox"
                  checked={dontRemind}
                  onChange={e => setDontRemind(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#1E9C7E] cursor-pointer"
                />
                <span className="text-[11px] text-[#7F8C8D]">本月不再提示</span>
              </label>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-lg text-[12px] font-bold text-[#5A6B7C] hover:bg-[#F4F6F9] transition-colors"
              >
                稍后再说
              </button>
              <button
                type="button"
                onClick={handleActivate}
                disabled={activating}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-bold text-white shadow-sm transition-all ${
                  activating
                    ? 'bg-[#1E9C7E]/70 cursor-not-allowed'
                    : 'bg-[#1E9C7E] hover:bg-[#17705A] hover:shadow-md'
                }`}
              >
                {activating ? (
                  <>
                    <Zap size={15} className="animate-pulse" />
                    正在开通...
                  </>
                ) : (
                  <>
                    <Rocket size={15} />
                    一键免费开通 30 天 AI 智能调度
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2.5 text-[10px] text-[#9AA7B4]">
            <CheckCircle2 size={11} className="text-[#1E9C7E]" />
            开通后自动完成权限配置与 AI 托管，试用期内可随时退出，无需人工审批
            <span className="text-[#D5DBE2]">·</span>
            <TrendingUp size={11} className="text-[#3B82F6]" />
            试用期结束后按实际增益决定是否转正式版
          </div>
        </div>
      </div>
    </div>
  );
}
