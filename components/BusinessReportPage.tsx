/* ==========================================================================
   智能报告 · 经营分析报告
   --------------------------------------------------------------------------
   两个 tab：
     1）经营分析报告 —— 与客户侧 PDF 正文同源（去封面、去目录）
        第一章 月度经营总览：收益构成、四象限指标卡、光伏/储能/充电桩三段图表
        第二章 指标分析：光伏消纳率、度电成本
     2）AI 策略收益 —— 按客户所处生命周期挂载不同同源内容：
        · 未开通（售前）  → 与《天盈 AI 仿真报告》同源
        · 试运行          → 与策略运行报告 · 试运行场景同源
        · 正式运行        → 与策略运行报告 · 正式运行场景同源
   三种状态共用同一套报告模板，仅模块与角标不同（模板一致率 ≈ 90%）。
   ========================================================================== */

import React, { useState } from 'react';
import {
  Calendar,
  Download,
  Sparkles,
  Battery,
  Sun,
  Zap,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Rocket,
  Clock,
  BadgeCheck,
  Activity,
  PlugZap,
  Info,
  GitBranch,
} from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts';

import {
  BIZ_META,
  BIZ_REVENUE,
  BIZ_CARDS,
  BIZ_SITE_INFO,
  BIZ_PV_DAILY,
  BIZ_ESS_DAILY,
  BIZ_EV_DAILY,
  BIZ_CONSUMPTION,
  BIZ_UNIT_COST,
  BIZ_NOTES,
  TY_SIM_KPI,
  TY_SIM_DELTA,
  TY_SIM_ROWS,
  TY_SIM_WHY,
  TY_TRIAL,
  TY_FORMAL,
  fmt,
  fmtSigned,
} from './tianyingReportData';

/** 生命周期：未开通 / 试运行 / 正式运行 */
export type Lifecycle = 'presale' | 'trial' | 'formal';

interface BusinessReportPageProps {
  lifecycle: Lifecycle;
  /** 打开《天盈 AI 仿真报告》弹窗 */
  onOpenSimReport: () => void;
  /** 试运行 → 正式运行 */
  onConvert: () => void;
}

const C = {
  green: '#1E9C7E',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  amber: '#F59E0B',
  ink: '#1A2A3A',
  slate: '#5A6B7C',
  line: '#EAEDF2',
};

const TONE_COLOR: Record<string, string> = {
  pv: C.green,
  ess: C.blue,
  grid: C.purple,
  load: C.amber,
};

/** 图表卡片外壳 */
function ChartCard({
  title,
  unit,
  children,
  note,
  height = 240,
}: {
  title: string;
  unit?: string;
  children: React.ReactNode;
  note?: string;
  height?: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#EAEDF2] p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[13px] font-bold text-[#1A2A3A]">{title}</h3>
        {unit && <span className="text-[11px] text-[#93A1B0]">单位：{unit}</span>}
      </div>
      <div style={{ height }}>{children}</div>
      {note && (
        <p className="text-[11px] text-[#7F8C8D] leading-relaxed mt-2 pt-2 border-t border-[#F1F4F7]">
          <span className="font-bold text-[#5A6B7C]">分析：</span>
          {note}
        </p>
      )}
    </div>
  );
}

const tooltipStyle = {
  fontSize: 11,
  borderRadius: 8,
  border: '1px solid #EAEDF2',
  boxShadow: '0 4px 12px rgba(26,42,58,0.08)',
};

/* ==========================================================================
   第一章 月度经营总览
   ========================================================================== */
function MonthlyOverview() {
  return (
    <div className="space-y-4">
      {/* 站点信息 */}
      <div className="bg-white rounded-xl border border-[#EAEDF2] px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1 h-3.5 rounded-full bg-[#1E9C7E]" />
          <span className="text-[13px] font-bold text-[#1A2A3A]">站点信息</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {BIZ_SITE_INFO.map(it => (
            <div key={it.label} className="rounded-lg bg-[#FBFCFD] border border-[#EAEDF2] px-3 py-2">
              <div className="text-[11px] text-[#8A98A6]">{it.label}</div>
              <div className="text-[13px] font-bold text-[#1A2A3A] mt-0.5">{it.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 收益构成 + 指标卡 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#EAEDF2] p-4">
          <h3 className="text-[13px] font-bold text-[#1A2A3A] mb-1">收益构成</h3>
          <div className="relative" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={BIZ_REVENUE.items.filter(i => i.valueWan > 0)}
                  dataKey="valueWan"
                  nameKey="label"
                  innerRadius={54}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="none"
                >
                  {BIZ_REVENUE.items
                    .filter(i => i.valueWan > 0)
                    .map(i => (
                      <Cell key={i.key} fill={i.color} />
                    ))}
                </Pie>
                <Tooltip
                  formatter={(v: any, n: any) => [`${fmt(Number(v), 2)} 万元`, n]}
                  contentStyle={tooltipStyle}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-[11px] text-[#8A98A6]">月总收益</div>
              <div className="text-xl font-black font-mono text-[#1A2A3A]">
                {fmt(BIZ_REVENUE.totalWan, 2)}
              </div>
              <div className="text-[10px] text-[#9AA7B4]">万元</div>
            </div>
          </div>
          <div className="space-y-1.5 mt-2">
            {BIZ_REVENUE.items.map(it => (
              <div key={it.key} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[12px] text-[#5A6B7C]">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: it.color }} />
                  {it.label}
                </span>
                <span className="text-[12px] font-mono font-bold text-[#1A2A3A]">
                  {fmt(it.valueWan, 2)}
                  <span className="text-[10px] font-normal text-[#9AA7B4] ml-0.5">万元</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
          {BIZ_CARDS.map(c => (
            <div
              key={c.label}
              className="bg-white rounded-xl border border-[#EAEDF2] p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#8A98A6]">{c.label}</span>
                <span
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: `${TONE_COLOR[c.tone]}14` }}
                >
                  {c.tone === 'ess' ? (
                    <Battery size={13} style={{ color: TONE_COLOR[c.tone] }} />
                  ) : c.tone === 'pv' ? (
                    <Sun size={13} style={{ color: TONE_COLOR[c.tone] }} />
                  ) : (
                    <Zap size={13} style={{ color: TONE_COLOR[c.tone] }} />
                  )}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-[22px] font-black font-mono text-[#1A2A3A] leading-none">
                  {c.value}
                </span>
                <span className="text-[11px] text-[#8A98A6]">{c.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 1.1 光伏 */}
      <ChartCard
        title="1.1 光伏发电量 & 收益"
        unit="kWh / 元"
        note={BIZ_NOTES.pv}
        height={250}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={BIZ_PV_DAILY} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF2F5" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#93A1B0' }} axisLine={{ stroke: '#EAEDF2' }} tickLine={false} interval={1} />
            <YAxis yAxisId="l" tick={{ fontSize: 10, fill: '#93A1B0' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: '#93A1B0' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="l" dataKey="kwh" name="日发电量" fill="#BFE3D6" radius={[3, 3, 0, 0]} />
            <Line yAxisId="r" type="monotone" dataKey="revenue" name="日收益" stroke={C.green} strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 1.2 储能 */}
      <ChartCard
        title="1.2 储能充放电量 & 收益"
        unit="kWh / 元"
        note={BIZ_NOTES.ess}
        height={250}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={BIZ_ESS_DAILY} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF2F5" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#93A1B0' }} axisLine={{ stroke: '#EAEDF2' }} tickLine={false} interval={1} />
            <YAxis yAxisId="l" tick={{ fontSize: 10, fill: '#93A1B0' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: '#93A1B0' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="l" dataKey="charge" name="充电量" fill="#C7D9F8" radius={[3, 3, 0, 0]} />
            <Bar yAxisId="l" dataKey="discharge" name="放电量" fill={C.blue} radius={[3, 3, 0, 0]} />
            <Line yAxisId="r" type="monotone" dataKey="revenue" name="储能收益" stroke={C.purple} strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 1.3 充电桩 */}
      <ChartCard
        title="1.3 充电桩充电量 & 收益"
        unit="kWh / 元"
        note={BIZ_NOTES.ev}
        height={200}
      >
        <div className="h-full flex flex-col items-center justify-center gap-2">
          <div className="w-11 h-11 rounded-2xl bg-[#F4F6F9] flex items-center justify-center">
            <PlugZap size={20} className="text-[#B6C1CC]" />
          </div>
          <div className="text-[12px] font-bold text-[#8A98A6]">站点未配置充电桩</div>
          <div className="text-[11px] text-[#9AA7B4]">
            本月充电量 0 kWh、充电收益 0 元，该模块按模板保留
          </div>
        </div>
      </ChartCard>
    </div>
  );
}

/* ==========================================================================
   第二章 指标分析
   ========================================================================== */
function IndicatorAnalysis() {
  return (
    <div className="space-y-4">
      <ChartCard
        title="2.1 光伏消纳率"
        unit="kWh / %"
        note={BIZ_NOTES.consumption}
        height={260}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={BIZ_CONSUMPTION.daily} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF2F5" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#93A1B0' }} axisLine={{ stroke: '#EAEDF2' }} tickLine={false} interval={1} />
            <YAxis yAxisId="l" tick={{ fontSize: 10, fill: '#93A1B0' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="r" orientation="right" domain={[90, 100]} tick={{ fontSize: 10, fill: '#93A1B0' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="l" dataKey="gen" name="发电量" fill="#BFE3D6" radius={[3, 3, 0, 0]} />
            <Bar yAxisId="l" dataKey="selfUse" name="自发自用电量" fill={C.green} radius={[3, 3, 0, 0]} />
            <Line yAxisId="r" type="monotone" dataKey="rate" name="消纳率" stroke={C.amber} strokeWidth={2} dot={false} />
            <ReferenceLine yAxisId="r" y={BIZ_CONSUMPTION.rate} stroke={C.amber} strokeDasharray="4 3" strokeOpacity={0.5} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="2.2 度电成本"
        unit="kWh / 元"
        note={BIZ_NOTES.unitCost}
        height={260}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={BIZ_UNIT_COST.daily} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF2F5" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#93A1B0' }} axisLine={{ stroke: '#EAEDF2' }} tickLine={false} interval={1} />
            <YAxis yAxisId="l" tick={{ fontSize: 10, fill: '#93A1B0' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="r" domain={[0.5, 0.85]} tick={{ fontSize: 10, fill: '#93A1B0' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="l" dataKey="load" name="负载总用电" fill="#C7D9F8" radius={[3, 3, 0, 0]} />
            <Bar yAxisId="l" dataKey="grid" name="电网用电" fill="#DDD6FE" radius={[3, 3, 0, 0]} />
            <Line yAxisId="r" type="monotone" dataKey="rawCost" name="原始度电成本" stroke={C.amber} strokeWidth={2} dot={false} />
            <Line yAxisId="r" type="monotone" dataKey="optimizedCost" name="节约后度电成本" stroke={C.green} strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 度电成本结论卡 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          { label: '本月总用电量', value: `${BIZ_UNIT_COST.totalUseWanKwh}`, unit: '万kWh', tone: 'text-[#1A2A3A]' },
          { label: '原始度电成本', value: fmt(BIZ_UNIT_COST.rawCost, 2), unit: '元/kWh', tone: 'text-[#F59E0B]' },
          { label: '光储系统后度电成本', value: fmt(BIZ_UNIT_COST.optimizedCost, 2), unit: '元/kWh', tone: 'text-[#1E9C7E]' },
          { label: '当月节约', value: fmt(BIZ_UNIT_COST.savedWan, 2), unit: '万元', tone: 'text-[#E5484D]' },
        ].map(it => (
          <div key={it.label} className="bg-white rounded-xl border border-[#EAEDF2] px-4 py-3">
            <div className="text-[11px] text-[#8A98A6]">{it.label}</div>
            <div className={`text-lg font-black font-mono mt-1 ${it.tone}`}>
              {it.value}
              <span className="text-[11px] font-normal text-[#9AA7B4] ml-1">{it.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   AI 策略收益 tab —— 按生命周期切换同源内容
   ========================================================================== */

/** 状态角标：三种状态的唯一视觉锚点 */
function StatusBadge({ lifecycle }: { lifecycle: Lifecycle }) {
  if (lifecycle === 'presale') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F4F6F9] border border-[#E3E8EE] text-[11px] font-bold text-[#5A6B7C]">
        <Info size={12} />
        未开通 · 仿真预评估
      </span>
    );
  }
  if (lifecycle === 'trial') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFF7E6] border border-[#FFE0A3] text-[11px] font-bold text-[#B7791F]">
        <Clock size={12} />
        试运行中 · 剩余 {TY_TRIAL.remainingDays} 天
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E8F7F1] border border-[#B7E4D3] text-[11px] font-bold text-[#17705A]">
      <BadgeCheck size={12} />
      正式版 · AI 智能托管中
    </span>
  );
}

/** 顶部模块：试用期省钱卡 / 长期累积卡（正式版） */
function TopModule({
  lifecycle,
  onOpenSimReport,
  onConvert,
}: {
  lifecycle: Lifecycle;
  onOpenSimReport: () => void;
  onConvert: () => void;
}) {
  if (lifecycle === 'presale') {
    return (
      <div className="bg-gradient-to-br from-[#1A2A3A] to-[#1E3A46] rounded-xl px-5 py-4 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-white/70">
              <Sparkles size={12} className="text-[#7BE0C0]" />
              基于站点历史负荷与光伏数据的策略仿真
            </div>
            <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
              <span className="text-xl font-black font-mono">
                +{fmt(TY_SIM_DELTA.net, 0)}
              </span>
              <span className="text-[12px] text-white/70">元 / 月</span>
              <span className="px-2 py-0.5 rounded-md bg-[#7BE0C0]/18 text-[#9DECD3] text-[11px] font-bold font-mono">
                提升 {fmt(TY_SIM_DELTA.liftPct, 1)}%
              </span>
              <span className="text-[11px] text-white/55">
                总收益 {fmt(TY_SIM_KPI.total.real, 0)} → {fmt(TY_SIM_KPI.total.sim, 0)} 元
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenSimReport}
              className="px-3.5 py-2 rounded-lg text-[12px] font-bold text-white/85 border border-white/25 hover:bg-white/10 transition-colors"
            >
              查看完整仿真报告
            </button>
            <button
              type="button"
              onClick={onOpenSimReport}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold bg-[#1E9C7E] hover:bg-[#17705A] transition-colors"
            >
              <Rocket size={14} />
              一键开通 30 天试用
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (lifecycle === 'trial') {
    return (
      <div className="bg-gradient-to-br from-[#FFF9EC] to-[#FFF4DE] rounded-xl border border-[#FFE0A3] px-5 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-[#B7791F]">
              <Clock size={12} />
              试用期已运行 {TY_TRIAL.elapsedDays} / {TY_TRIAL.totalDays} 天
            </div>
            <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
              <span className="text-xl font-black font-mono text-[#B7791F]">
                {fmt(TY_TRIAL.savedTotal, 0)}
              </span>
              <span className="text-[12px] text-[#8A6D3B]">元 · 试用期累计省钱</span>
              <span className="px-2 py-0.5 rounded-md bg-[#B7791F]/12 text-[#B7791F] text-[11px] font-bold font-mono">
                较传统基线 +{fmt(TY_TRIAL.liftPct, 1)}%
              </span>
            </div>
            <div className="text-[11px] text-[#8A6D3B] mt-1">
              预估年化可节省 {fmt(TY_TRIAL.annualized, 0)} 元 · 对比基线
              {TY_TRIAL.baselineName}
            </div>
          </div>
          <button
            type="button"
            onClick={onConvert}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[12px] font-bold bg-[#B7791F] hover:bg-[#96631A] text-white transition-colors shrink-0"
          >
            <ArrowUpRight size={14} />
            一键升级正式版
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#F1FBF7] to-[#E8F7F1] rounded-xl border border-[#B7E4D3] px-5 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[#17705A]">
            <ShieldCheck size={12} />
            正式运行 {TY_FORMAL.runningMonths} 个月
          </div>
          <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-black font-mono text-[#17705A]">
              {fmt(TY_FORMAL.cumSaved, 0)}
            </span>
            <span className="text-[12px] text-[#2C7A6E]">元 · 长期累积收益</span>
            <span className="px-2 py-0.5 rounded-md bg-[#17705A]/10 text-[#17705A] text-[11px] font-bold font-mono">
              本月 {fmt(TY_FORMAL.cumulative[TY_FORMAL.cumulative.length - 1].saved, 0)} 元
            </span>
          </div>
          <div className="text-[11px] text-[#2C7A6E] mt-1">
            最近算法迭代 {TY_FORMAL.modelLog[0].version}（{TY_FORMAL.modelLog[0].date}）
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSimReport}
            className="px-3.5 py-2 rounded-lg text-[12px] font-bold text-[#17705A] border border-[#B7E4D3] bg-white/60 hover:bg-white transition-colors"
          >
            查看仿真报告
          </button>
        </div>
      </div>
    </div>
  );
}

/** 归因区：按状态切换口径 */
function Attribution({ lifecycle }: { lifecycle: Lifecycle }) {
  if (lifecycle === 'presale') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {TY_SIM_WHY.map(w => (
          <div key={w.title} className="bg-white rounded-xl border border-[#EAEDF2] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#1A2A3A] text-white text-[11px] font-bold flex items-center justify-center">
                  {w.no}
                </span>
                <span className="text-[12px] font-bold text-[#1A2A3A]">{w.title}</span>
              </div>
              <span className={`font-mono text-sm font-black ${w.tone === 'up' ? 'text-[#E5484D]' : 'text-[#1E9C7E]'}`}>
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
    );
  }

  if (lifecycle === 'trial') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TY_TRIAL.attribution.map(a => (
          <div key={a.key} className="bg-white rounded-xl border border-[#EAEDF2] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#B7791F] text-white text-[11px] font-bold flex items-center justify-center">
                  {a.no}
                </span>
                <span className="text-[12px] font-bold text-[#1A2A3A]">{a.title}</span>
              </div>
            </div>
            <div className="text-lg font-black font-mono text-[#E5484D]">
              {fmt(a.amount, 0)}
              <span className="text-[11px] font-normal text-[#9AA7B4] ml-1">元</span>
            </div>
            <div className="text-[11px] text-[#8A98A6] mt-0.5">{a.desc}</div>
            <p className="text-[11px] text-[#8A98A6] leading-relaxed mt-2 pt-2 border-t border-[#EAEDF2]">
              {a.evidence}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {TY_FORMAL.attribution.map(a => (
        <div key={a.key} className="bg-white rounded-xl border border-[#EAEDF2] p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-md bg-[#1E9C7E] text-white text-[11px] font-bold flex items-center justify-center">
              {a.no}
            </span>
            <span className="text-[12px] font-bold text-[#1A2A3A]">{a.title}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black font-mono text-[#17705A]">{a.value}</span>
            <span className="text-[11px] font-bold text-[#E5484D] font-mono">{a.trend}</span>
          </div>
          <div className="text-[11px] text-[#8A98A6] mt-0.5">{a.desc}</div>
          <p className="text-[11px] text-[#8A98A6] leading-relaxed mt-2 pt-2 border-t border-[#EAEDF2]">
            {a.evidence}
          </p>
        </div>
      ))}
    </div>
  );
}

/** 对比曲线区：三种状态三条口径 */
function CompareSection({ lifecycle }: { lifecycle: Lifecycle }) {
  if (lifecycle === 'trial') {
    return (
      <ChartCard
        title="策略调度对比曲线"
        unit="元 / 日"
        note="基线仿真与实际 AI 轨迹吃的是同一份负荷与光伏数据，两者收益之差可直接归因到策略差异本身，而非天气或生产计划变化。"
        height={250}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={TY_TRIAL.curves.days} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF2F5" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#93A1B0' }} axisLine={{ stroke: '#EAEDF2' }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#93A1B0' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="baseline" name={TY_TRIAL.curves.baselineName} stroke="#B6C1CC" strokeWidth={2} strokeDasharray="5 4" dot={false} />
            <Line type="monotone" dataKey="ai" name={TY_TRIAL.curves.aiName} stroke={C.green} strokeWidth={2.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>
    );
  }

  if (lifecycle === 'formal') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard
            title="长期累积收益趋势"
            unit="元"
            note="累积收益按月度实际结算口径统计，逐月与虚拟基线归因结果核对一致。"
            height={250}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={TY_FORMAL.cumulative} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.green} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={C.green} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF2F5" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#93A1B0' }} axisLine={{ stroke: '#EAEDF2' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#93A1B0' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="cum" name="累积收益" stroke={C.green} strokeWidth={2} fill="url(#cumFill)" />
                <Line type="monotone" dataKey="saved" name="当月收益" stroke={C.amber} strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="bg-white rounded-xl border border-[#EAEDF2] p-4">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch size={13} className="text-[#5A6B7C]" />
            <span className="text-[13px] font-bold text-[#1A2A3A]">AI 算法模型迭代日志</span>
          </div>
          <div className="space-y-3">
            {TY_FORMAL.modelLog.map((l, i) => (
              <div key={l.version} className="flex gap-2.5">
                <div className="flex flex-col items-center shrink-0">
                  <span
                    className={`w-2 h-2 rounded-full mt-1 ${i === 0 ? 'bg-[#1E9C7E]' : 'bg-[#D5DBE2]'}`}
                  />
                  {i !== TY_FORMAL.modelLog.length - 1 && <span className="w-px flex-1 bg-[#EAEDF2] my-1" />}
                </div>
                <div className="min-w-0 pb-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-[#1A2A3A] font-mono">{l.version}</span>
                    <span className="text-[10px] text-[#9AA7B4]">{l.date}</span>
                  </div>
                  <p className="text-[11px] text-[#7F8C8D] leading-relaxed mt-0.5">{l.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // presale：与实际运行对照
  return (
    <div className="bg-white rounded-xl border border-[#EAEDF2] p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[13px] font-bold text-[#1A2A3A]">仿真收益逐项对照</h3>
        <span className="text-[11px] text-[#93A1B0]">口径：实际运行 → AI 策略仿真</span>
      </div>
      <div className="overflow-hidden rounded-lg border border-[#EAEDF2]">
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
                <tr key={r.item} className={`border-t border-[#EAEDF2] ${isLast ? 'bg-[#F4FBF8]' : ''}`}>
                  <td className={`px-3 py-2 text-[12px] whitespace-nowrap ${isLast ? 'font-bold text-[#1A2A3A]' : 'text-[#2C3E50]'}`}>
                    {r.item}
                    <span className="text-[10px] text-[#9AA7B4] ml-1">{r.unit}</span>
                  </td>
                  <td className="px-3 py-2 text-right text-[12px] font-mono text-[#7F8C8D] whitespace-nowrap">{fmt(r.real, 0)}</td>
                  <td className="px-3 py-2 text-right text-[12px] font-mono font-bold text-[#1A2A3A] whitespace-nowrap">{fmt(r.sim, 0)}</td>
                  <td className={`px-3 py-2 text-right text-[12px] font-mono font-bold whitespace-nowrap ${diff > 0 ? 'text-[#E5484D]' : diff < 0 ? 'text-[#1E9C7E]' : 'text-[#9AA7B4]'}`}>
                    {diff === 0 ? '—' : fmtSigned(diff, 0)}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-[#7F8C8D]">{r.note}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==========================================================================
   主页面
   ========================================================================== */
export default function BusinessReportPage({
  lifecycle,
  onOpenSimReport,
  onConvert,
}: BusinessReportPageProps) {
  const [tab, setTab] = useState<'biz' | 'ai'>('biz');
  const [period, setPeriod] = useState('2026-09');

  const TABS: { key: 'biz' | 'ai'; label: string }[] = [
    { key: 'biz', label: '经营分析报告' },
    { key: 'ai', label: 'AI 策略收益' },
  ];

  return (
    <div className="p-4 sm:p-6 h-full overflow-y-auto bg-[#F4F6F9] space-y-4">
      {/* 页头 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white px-6 py-4 rounded-xl shadow-[0_2px_8px_rgba(26,42,58,0.06)] border border-[#EAEDF2] gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-xl font-bold text-[#1A2A3A] tracking-tight">经营分析报告</h1>

          <div className="flex items-center gap-2 border border-[#EAEDF2] bg-white rounded-md px-3 py-1.5">
            <Calendar className="w-4 h-4 text-[#7F8C8D]" />
            <input
              type="month"
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none text-[#2C3E50] w-28 cursor-pointer"
            />
          </div>

          <span className="text-[12px] text-[#7F8C8D]">
            {BIZ_META.entity} · {BIZ_META.siteLabel}
          </span>

          <StatusBadge lifecycle={lifecycle} />
        </div>

        <button
          type="button"
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-md border border-[#EAEDF2] text-[#2C3E50] hover:bg-[#F7F9FB] transition-colors"
        >
          <Download className="w-4 h-4" />
          导出报告
        </button>
      </div>

      {/* tab 栏 */}
      <div className="bg-white rounded-xl border border-[#EAEDF2] shadow-[0_2px_8px_rgba(26,42,58,0.04)]">
        <div className="flex items-center gap-8 px-6 pt-3 border-b border-[#EAEDF2]">
          {TABS.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`pb-2.5 text-sm font-medium transition-colors relative ${
                tab === t.key
                  ? 'text-[#1A2A3A] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1E9C7E]'
                  : 'text-[#7F8C8D] hover:text-[#1A2A3A]'
              }`}
            >
              {t.label}
              {t.key === 'ai' && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-[#E8F7F1] text-[#17705A] text-[10px] font-bold">
                  AI
                </span>
              )}
            </button>
          ))}
        </div>

        {/* tab 内容 */}
        <div className="p-5">
          {tab === 'biz' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 rounded-full bg-[#1E9C7E]" />
                <span className="text-[13px] font-bold text-[#1A2A3A]">一、月度经营总览</span>
              </div>
              <MonthlyOverview />

              <div className="flex items-center gap-2 pt-2">
                <span className="w-1 h-3.5 rounded-full bg-[#3B82F6]" />
                <span className="text-[13px] font-bold text-[#1A2A3A]">二、指标分析</span>
              </div>
              <IndicatorAnalysis />
            </div>
          ) : (
            <div className="space-y-4">
              <TopModule lifecycle={lifecycle} onOpenSimReport={onOpenSimReport} onConvert={onConvert} />

              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 rounded-full bg-[#1E9C7E]" />
                <span className="text-[13px] font-bold text-[#1A2A3A]">
                  AI 智能调度效益分析
                </span>
                <span className="text-[11px] text-[#93A1B0]">
                  {lifecycle === 'presale'
                    ? '仿真预评估 · 与实际运行同输入对比'
                    : lifecycle === 'trial'
                      ? '反向仿真 · 实测 AI vs 后台基线'
                      : '虚拟基线归因 · 实测 AI vs 基线'}
                </span>
              </div>

              <CompareSection lifecycle={lifecycle} />
              <Attribution lifecycle={lifecycle} />

              {/* 状态说明 */}
              <div className="flex items-start gap-2 rounded-xl bg-white border border-[#EAEDF2] px-4 py-3">
                <Info size={13} className="text-[#93A1B0] mt-0.5 shrink-0" />
                <p className="text-[11px] text-[#7F8C8D] leading-relaxed">
                  {lifecycle === 'presale' ? (
                    <>
                      <span className="font-bold text-[#5A6B7C]">未开通状态：</span>
                      本 tab 展示的是基于历史负荷与光伏数据回算的仿真结果，用于评估 AI 策略的降本空间；
                      开通试运行后，此处将替换为实测数据口径。
                    </>
                  ) : lifecycle === 'trial' ? (
                    <>
                      <span className="font-bold text-[#5A6B7C]">试运行状态：</span>
                      本 tab 与策略运行报告共用同一套模板，仅顶部模块替换为【试用期累计省钱】、
                      末尾附【一键升级正式版】入口，报告主体结构与正式版一致。
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-[#5A6B7C]">正式运行状态：</span>
                      本 tab 与策略运行报告共用同一套模板；相比试用期，顶部模块替换为
                      【长期累积收益趋势】与【AI 算法模型迭代日志】，并移除试用促转化入口。
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
