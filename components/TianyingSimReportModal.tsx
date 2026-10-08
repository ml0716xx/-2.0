/* ==========================================================================
   《天盈 AI 仿真报告》· 网页端弹窗
   --------------------------------------------------------------------------
   用户旅程位置：售前推广阶段（潜在客户 / 未开通）
   触达方式：Web 端自动弹出，支持「本月不再提示」
   目标动作：阅读仿真收益 → 点击【一键免费开通 30 天 AI 智能调度】

   三章节与运营端「推送仿真报告」同源（运行概况 / 仿真收益对比 / 典型日分析），
   区别在于：本弹窗是客户侧看到的报告正文，不再有章节勾选与推送预览，
   底部换成试用转化 CTA。数字全部取自 tianyingReportData.ts。
   ========================================================================== */

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  Battery,
  Sun,
  ArrowRight,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Rocket,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  LabelList,
} from 'recharts';
import {
  TY_META,
  TY_SITE,
  TY_RAW_ROWS,
  TY_SIM_KPI,
  TY_SIM_DELTA,
  TY_SIM_ROWS,
  TY_SIM_WHY,
  TY_PRICE,
  TY_CASE_DAYS,
  fmt,
  fmtSigned,
} from './tianyingReportData';

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

/** 章节外壳 */
function Section({
  no,
  title,
  hint,
  children,
}: {
  no: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border border-[#EAEDF2] overflow-hidden">
      <div className="px-5 py-3 border-b border-[#EAEDF2] flex items-center gap-2.5 bg-[#FBFCFD]">
        <span className="w-5 h-5 rounded-md bg-[#1E9C7E] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
          {no}
        </span>
        <h3 className="text-sm font-bold text-[#1A2A3A]">{title}</h3>
        {hint && <span className="text-[11px] text-[#93A1B0]">{hint}</span>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function TianyingSimReportModal({
  isOpen,
  onClose,
  onActivate,
  onDismissThisMonth,
}: TianyingSimReportModalProps) {
  const [dontRemind, setDontRemind] = useState(false);
  const [caseIdx, setCaseIdx] = useState(0);
  const [activating, setActivating] = useState(false);

  if (!isOpen) return null;

  const reportNo = `${TY_META.reportNoPrefix}-${TY_META.period.replace('-', '')}-01`;
  const growth = TY_SIM_DELTA.liftPct;
  const totalReal = TY_SIM_KPI.total.real;
  const totalSim = TY_SIM_KPI.total.sim;
  const storageDiff = TY_SIM_DELTA.storageDiff;
  const pvDiff = TY_SIM_DELTA.pvDiff;
  const caseDay = TY_CASE_DAYS[caseIdx];

  /** 收益构成对比柱图数据 */
  const barData = [
    { name: '实际运行', 储能: TY_SIM_KPI.storage.real, 光伏: TY_SIM_KPI.pv.real },
    { name: 'AI 策略仿真', 储能: TY_SIM_KPI.storage.sim, 光伏: TY_SIM_KPI.pv.sim },
  ];

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
          {/* 1. 运行概况 */}
          <Section no="1" title="运行概况" hint="站点配置与实测运行指标">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
              {[
                { label: '光伏装机', value: TY_SITE.pvCapacityKwp, unit: 'kWp' },
                { label: '逆变器', value: TY_SITE.pvInverters, unit: '台' },
                { label: '储能容量', value: TY_SITE.essCapacityKwh, unit: 'kWh' },
                { label: '储能设备', value: TY_SITE.essUnits, unit: '台' },
                { label: 'PCS 功率', value: TY_SITE.essPowerKw, unit: 'kW' },
                { label: 'SOC 区间', value: TY_SITE.socRange, unit: '' },
              ].map(it => (
                <div key={it.label} className="rounded-lg border border-[#EAEDF2] bg-[#FBFCFD] px-3 py-2">
                  <div className="text-[11px] text-[#8A98A6]">{it.label}</div>
                  <div className="text-sm font-bold font-mono text-[#1A2A3A] mt-0.5">
                    {it.value}
                    {it.unit && <span className="text-[10px] font-normal text-[#8A98A6] ml-0.5">{it.unit}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[12px] font-bold text-[#5A6B7C] mb-2">实测运行指标</div>
            <div className="overflow-hidden rounded-lg border border-[#EAEDF2]">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FBFCFD]">
                    <th className="text-left px-3 py-2 text-[11px] font-bold text-[#8A98A6]">指标</th>
                    <th className="text-right px-3 py-2 text-[11px] font-bold text-[#8A98A6]">数值</th>
                    <th className="text-left px-3 py-2 text-[11px] font-bold text-[#8A98A6]">口径说明</th>
                  </tr>
                </thead>
                <tbody>
                  {TY_RAW_ROWS.map(r => (
                    <tr key={r.name} className="border-t border-[#EAEDF2]">
                      <td className="px-3 py-2 text-[12px] text-[#2C3E50] whitespace-nowrap">{r.name}</td>
                      <td className="px-3 py-2 text-right text-[12px] font-mono font-bold text-[#1A2A3A] whitespace-nowrap">
                        {fmt(r.value, r.unit === '%' || r.unit === 'kWh' ? 2 : 2)}
                        <span className="text-[10px] font-normal text-[#8A98A6] ml-0.5">{r.unit}</span>
                      </td>
                      <td className="px-3 py-2 text-[11px] text-[#7F8C8D]">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 2. 仿真收益对比 */}
          <Section no="2" title="仿真收益对比" hint="相同负荷与光伏输入下重排储能充放电计划">
            {/* 收益构成对比柱图 */}
            <div className="rounded-xl border border-[#EAEDF2] p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-bold text-[#5A6B7C]">收益构成：实际运行 → AI 策略仿真</span>
                <span className="text-[11px] text-[#8A98A6]">单位：元（全月）</span>
              </div>
              <div className="h-[190px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 18, right: 16, left: 4, bottom: 4 }} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF2F5" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#7F8C8D' }}
                      axisLine={{ stroke: '#EAEDF2' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#93A1B0' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                      formatter={(v: any, n: any) => [`${fmt(Number(v), 0)} 元`, n]}
                      contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #EAEDF2' }}
                    />
                    <ReferenceLine y={0} stroke="#EAEDF2" />
                    <Bar dataKey="储能" fill={C.blue} radius={[4, 4, 0, 0]}>
                      <LabelList
                        dataKey="储能"
                        position="top"
                        style={{ fontSize: 10, fill: '#5A6B7C', fontWeight: 700 }}
                        formatter={(v: any) => fmt(Number(v), 0)}
                      />
                    </Bar>
                    <Bar dataKey="光伏" fill={C.green} radius={[4, 4, 0, 0]}>
                      <LabelList
                        dataKey="光伏"
                        position="top"
                        style={{ fontSize: 10, fill: '#5A6B7C', fontWeight: 700 }}
                        formatter={(v: any) => fmt(Number(v), 0)}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 mt-1.5">
                <span className="flex items-center gap-1.5 text-[11px] text-[#5A6B7C]">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.blue }} />
                  储能收益 {fmt(TY_SIM_KPI.storage.real, 0)} → {fmt(TY_SIM_KPI.storage.sim, 0)} 元
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-[#5A6B7C]">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.green }} />
                  光伏收益 {fmt(TY_SIM_KPI.pv.real, 0)} → {fmt(TY_SIM_KPI.pv.sim, 0)} 元
                </span>
              </div>
            </div>

            {/* 逐项对照 */}
            <div className="overflow-hidden rounded-lg border border-[#EAEDF2] mb-4">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FBFCFD]">
                    <th className="text-left px-3 py-2 text-[11px] font-bold text-[#8A98A6]">指标</th>
                    <th className="text-right px-3 py-2 text-[11px] font-bold text-[#8A98A6]">实际运行</th>
                    <th className="text-right px-3 py-2 text-[11px] font-bold text-[#8A98A6]">AI 策略仿真</th>
                    <th className="text-right px-3 py-2 text-[11px] font-bold text-[#8A98A6]">绝对差</th>
                    <th className="text-left px-3 py-2 text-[11px] font-bold text-[#8A98A6]">说明</th>
                  </tr>
                </thead>
                <tbody>
                  {TY_SIM_ROWS.map(r => {
                    const diff = r.sim - r.real;
                    const isLast = r.item === '总收益';
                    return (
                      <tr
                        key={r.item}
                        className={`border-t border-[#EAEDF2] ${isLast ? 'bg-[#F4FBF8]' : ''}`}
                      >
                        <td className={`px-3 py-2 text-[12px] whitespace-nowrap ${isLast ? 'font-bold text-[#1A2A3A]' : 'text-[#2C3E50]'}`}>
                          {r.item}
                          <span className="text-[10px] text-[#9AA7B4] ml-1">{r.unit}</span>
                        </td>
                        <td className="px-3 py-2 text-right text-[12px] font-mono text-[#7F8C8D] whitespace-nowrap">
                          {fmt(r.real, r.unit === 'kWh' ? 0 : 0)}
                        </td>
                        <td className="px-3 py-2 text-right text-[12px] font-mono font-bold text-[#1A2A3A] whitespace-nowrap">
                          {fmt(r.sim, r.unit === 'kWh' ? 0 : 0)}
                        </td>
                        <td
                          className={`px-3 py-2 text-right text-[12px] font-mono font-bold whitespace-nowrap ${
                            diff > 0 ? 'text-[#E5484D]' : diff < 0 ? 'text-[#1E9C7E]' : 'text-[#9AA7B4]'
                          }`}
                        >
                          {diff === 0 ? '—' : `${fmtSigned(diff, 0)}`}
                        </td>
                        <td className="px-3 py-2 text-[11px] text-[#7F8C8D]">{r.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 增量来源 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
              {TY_SIM_WHY.map(w => (
                <div key={w.title} className="rounded-xl border border-[#EAEDF2] bg-[#FBFCFD] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-[#1A2A3A] text-white text-[11px] font-bold flex items-center justify-center">
                        {w.no}
                      </span>
                      <span className="text-[12px] font-bold text-[#1A2A3A]">{w.title}</span>
                    </div>
                    <span
                      className={`font-mono text-sm font-black ${
                        w.tone === 'up' ? 'text-[#E5484D]' : 'text-[#1E9C7E]'
                      }`}
                    >
                      {w.amount}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5A6B7C] leading-relaxed">{w.mechanism}</p>
                  <p className="text-[11px] text-[#8A98A6] leading-relaxed mt-1.5 pt-1.5 border-t border-[#EAEDF2]">
                    {w.evidence}
                  </p>
                </div>
              ))}
            </div>

            {/* 电价口径 */}
            <div className="rounded-xl border border-[#EAEDF2] p-4">
              <div className="flex items-center gap-2 mb-2.5">
                <Zap size={13} className="text-[#F59E0B]" />
                <span className="text-[12px] font-bold text-[#5A6B7C]">电价口径</span>
                <span className="text-[11px] text-[#9AA7B4]">两侧同价，差异来自时段结构</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {TY_PRICE.tou.map(t => (
                  <div key={t.key} className="rounded-lg border border-[#EAEDF2] px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#5A6B7C]">
                        购电 · {t.label}段
                      </span>
                      <span className="text-[12px] font-mono font-bold text-[#1A2A3A]">
                        {fmt(t.price, 4)}
                        <span className="text-[10px] font-normal text-[#9AA7B4] ml-0.5">元/kWh</span>
                      </span>
                    </div>
                    <div className="text-[10px] text-[#9AA7B4] mt-0.5">{t.window}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                {[
                  { label: '售电电价（余电上网）', value: fmt(TY_PRICE.salePrice, 4) },
                  { label: '充电加权电价', value: fmt(TY_PRICE.chargeWeighted, 4) },
                  { label: '放电加权电价', value: fmt(TY_PRICE.dischargeWeighted, 4) },
                  { label: '充放电毛价差', value: fmt(TY_PRICE.spread, 4) },
                ].map(it => (
                  <div key={it.label} className="rounded-lg bg-[#FBFCFD] border border-[#EAEDF2] px-3 py-2">
                    <div className="text-[10px] text-[#8A98A6]">{it.label}</div>
                    <div className="text-[12px] font-mono font-bold text-[#1A2A3A] mt-0.5">{it.value}</div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-[#9AA7B4] mt-2.5 leading-relaxed">{TY_PRICE.note}</div>
            </div>
          </Section>

          {/* 3. 典型日分析 */}
          <Section no="3" title="典型日分析" hint="案例日逐项对照与判读">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {TY_CASE_DAYS.map((d, i) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => setCaseIdx(i)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                    i === caseIdx
                      ? 'bg-[#1E9C7E] text-white border-[#1E9C7E]'
                      : 'bg-white text-[#5A6B7C] border-[#EAEDF2] hover:border-[#1E9C7E]/40'
                  }`}
                >
                  {d.date.slice(5)} · {d.tag}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
              <div className="rounded-xl border border-[#EAEDF2] px-4 py-3">
                <div className="text-[11px] text-[#8A98A6]">当日储能收益差</div>
                <div
                  className={`text-lg font-black font-mono mt-0.5 ${
                    caseDay.storageDiff > 0 ? 'text-[#E5484D]' : 'text-[#1E9C7E]'
                  }`}
                >
                  {fmtSigned(caseDay.storageDiff, 0)}
                  <span className="text-[11px] font-normal text-[#9AA7B4] ml-1">元</span>
                </div>
              </div>
              <div className="rounded-xl border border-[#EAEDF2] px-4 py-3">
                <div className="text-[11px] text-[#8A98A6]">当日总收益差</div>
                <div
                  className={`text-lg font-black font-mono mt-0.5 ${
                    caseDay.totalDiff > 0 ? 'text-[#E5484D]' : 'text-[#1E9C7E]'
                  }`}
                >
                  {fmtSigned(caseDay.totalDiff, 0)}
                  <span className="text-[11px] font-normal text-[#9AA7B4] ml-1">元</span>
                </div>
              </div>
              <div className="rounded-xl border border-[#EAEDF2] px-4 py-3">
                <div className="text-[11px] text-[#8A98A6]">案例日口径</div>
                <div className="text-[12px] font-bold text-[#1A2A3A] mt-1">
                  按储能收益差排序取前 3，另附 1 个反向日对照
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-[#EAEDF2] mb-3">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FBFCFD]">
                    <th className="text-left px-3 py-2 text-[11px] font-bold text-[#8A98A6]">指标</th>
                    <th className="text-right px-3 py-2 text-[11px] font-bold text-[#8A98A6]">实际运行</th>
                    <th className="text-right px-3 py-2 text-[11px] font-bold text-[#8A98A6]">AI 策略仿真</th>
                    <th className="text-right px-3 py-2 text-[11px] font-bold text-[#8A98A6]">绝对差</th>
                  </tr>
                </thead>
                <tbody>
                  {caseDay.rows.map(r => {
                    const diff = r.sim - r.real;
                    return (
                      <tr key={r.name} className="border-t border-[#EAEDF2]">
                        <td className="px-3 py-2 text-[12px] text-[#2C3E50] whitespace-nowrap">{r.name}</td>
                        <td className="px-3 py-2 text-right text-[12px] font-mono text-[#7F8C8D] whitespace-nowrap">
                          {fmt(r.real, r.name.includes('元') ? 0 : 0)}
                        </td>
                        <td className="px-3 py-2 text-right text-[12px] font-mono font-bold text-[#1A2A3A] whitespace-nowrap">
                          {fmt(r.sim, r.name.includes('元') ? 0 : 0)}
                        </td>
                        <td
                          className={`px-3 py-2 text-right text-[12px] font-mono font-bold whitespace-nowrap ${
                            diff > 0 ? 'text-[#E5484D]' : diff < 0 ? 'text-[#1E9C7E]' : 'text-[#9AA7B4]'
                          }`}
                        >
                          {fmtSigned(diff, 0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl bg-[#FBFCFD] border border-[#EAEDF2] px-4 py-3">
              <div className="text-[11px] font-bold text-[#8A98A6] mb-1">判读要点</div>
              <p className="text-[12px] text-[#5A6B7C] leading-relaxed">{caseDay.reading}</p>
            </div>
          </Section>

          {/* 口径说明 */}
          <div className="flex items-start gap-2 rounded-xl bg-white border border-[#EAEDF2] px-4 py-3">
            <Info size={13} className="text-[#93A1B0] mt-0.5 shrink-0" />
            <p className="text-[11px] text-[#7F8C8D] leading-relaxed">
              <span className="font-bold text-[#5A6B7C]">报告口径：</span>
              {TY_META.caliberNote}
            </p>
          </div>
        </div>

        {/* ------------------------------ 底部 CTA ------------------------------ */}
        <div className="shrink-0 border-t border-[#EAEDF2] bg-white px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[12px] text-[#5A6B7C]">
                <ShieldCheck size={13} className="text-[#1E9C7E]" />
                <span>报告编号</span>
                <span className="font-mono text-[#1A2A3A]">{reportNo}</span>
                <span className="text-[#D5DBE2]">·</span>
                <span>接收方</span>
                <span className="font-semibold text-[#1A2A3A]">站点业主 · 用户端</span>
              </div>
              <label className="flex items-center gap-1.5 mt-2 cursor-pointer select-none w-fit">
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
