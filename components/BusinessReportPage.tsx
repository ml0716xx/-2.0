/* ==========================================================================
   智能报告 · 经营分析报告
   --------------------------------------------------------------------------
   两个 tab：
     1）经营分析报告 —— 与客户侧 PDF 正文同源（去封面、去目录）
        第一章 月度经营总览：收益构成、四象限指标卡、光伏/储能/充电桩三段图表
        第二章 指标分析：光伏消纳率、度电成本
     2）AI 策略收益 —— 【策略运行报告】的精简视图，按客户生命周期分三态：
        · 未开通（售前）  指标遮罩 + 收益测算钩子 + 开通权益，突出营销转化
        · 试运行          指标解锁 + 试运行成绩单 + 剩余天数 + 一键升级正式版
        · 正式运行        指标解锁 + 本月运行成绩 + 无转化入口

   指标纪律：本 tab 只使用 AI_GAIN 里那张指标表，集合严格等于策略运行报告
   已渲染的指标，不新增口径、不发明指标。三种状态共用同一套指标与报告主体，
   仅顶部模块、角标、转化入口不同。
   ========================================================================== */

import React, { useState } from 'react';
import {
  Calendar,
  Download,
  Sparkles,
  Battery,
  Sun,
  Zap,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Rocket,
  Clock,
  BadgeCheck,
  PlugZap,
  Info,
  CheckCircle2,
  TrendingUp,
  Gift,
  Gauge,
  Coins,
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
  ReferenceLine,
} from 'recharts';

import {
  BIZ_META,
  BIZ_REVENUE,
  BIZ_CARDS,
  BIZ_SITE_INFO,
  BIZ_PV_DAILY,
  BIZ_ESS_DAILY,
  BIZ_NOTES,
  BIZ_CONSUMPTION,
  BIZ_UNIT_COST,
  AI_GAIN,
  AI_DAILY,
  AI_CURTAILMENT,
  TY_TRIAL_META,
  fmt,
} from './tianyingReportData';
import TianyingSimReportBody from './TianyingSimReportBody';

/** 生命周期：未开通 / 试运行 / 正式运行 */
export type Lifecycle = 'presale' | 'trial' | 'formal';

interface BusinessReportPageProps {
  lifecycle: Lifecycle;
  /** 打开《天盈 AI 仿真报告》弹窗 */
  onOpenSimReport: () => void;
  /** 试运行 → 正式运行 */
  onConvert: () => void;
  /** 未开通 → 试运行 */
  onActivate: () => void;
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

const tooltipStyle = {
  fontSize: 11,
  borderRadius: 8,
  border: '1px solid #EAEDF2',
  boxShadow: '0 4px 12px rgba(26,42,58,0.08)',
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

/* ==========================================================================
   tab1 · 第一章 月度经营总览
   ========================================================================== */
function MonthlyOverview() {
  return (
    <div className="space-y-4">
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

      <ChartCard title="1.1 光伏发电量 & 收益" unit="kWh / 元" note={BIZ_NOTES.pv} height={250}>
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

      <ChartCard title="1.2 储能充放电量 & 收益" unit="kWh / 元" note={BIZ_NOTES.ess} height={250}>
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

      <ChartCard title="1.3 充电桩充电量 & 收益" unit="kWh / 元" note={BIZ_NOTES.ev} height={200}>
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
   tab1 · 第二章 指标分析
   ========================================================================== */
function IndicatorAnalysis() {
  return (
    <div className="space-y-4">
      <ChartCard title="2.1 光伏消纳率" unit="kWh / %" note={BIZ_NOTES.consumption} height={260}>
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

      <ChartCard title="2.2 度电成本" unit="kWh / 元" note={BIZ_NOTES.unitCost} height={260}>
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
   tab2 · AI 策略收益（策略运行报告的精简视图）
   ========================================================================== */

/** 状态角标：三种状态唯一视觉锚点 */
function StatusBadge({ lifecycle }: { lifecycle: Lifecycle }) {
  if (lifecycle === 'presale') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F4F6F9] border border-[#E3E8EE] text-[11px] font-bold text-[#5A6B7C]">
        <Sparkles size={12} />
        未开通 · 仿真预评估
      </span>
    );
  }
  if (lifecycle === 'trial') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFF7E6] border border-[#FFE0A3] text-[11px] font-bold text-[#B7791F]">
        <Clock size={12} />
        试运行中 · 剩余 {TY_TRIAL_META.remainingDays} 天
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

/** 未开通：收益测算钩子（售前营销主视觉） */
function AiHeroPresale({
  onActivate,
  onOpenSimReport,
}: {
  onActivate: () => void;
  onOpenSimReport: () => void;
}) {
  const g = AI_GAIN;
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1A2A3A] via-[#1E3A46] to-[#17705A] text-white px-6 py-5">
      <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-[#7BE0C0]/10 blur-2xl" />
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-[#9DECD3] font-bold">
            <Sparkles size={13} />
            天盈 AI · 本站收益测算
          </div>
          <div className="mt-2 text-[15px] font-bold leading-snug">
            按本站点历史运行数据回算，AI 智能调度每月可多创收
          </div>
          <div className="mt-1.5 flex items-baseline gap-2.5 flex-wrap">
            <span className="text-[34px] font-black font-mono leading-none tracking-tight">
              ¥{fmt(g.aiBoost, 0)}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#7BE0C0]/20 text-[#9DECD3] text-[12px] font-bold font-mono">
              +{fmt(g.aiBoostPct, 1)}%
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-white/75">
            <span>
              综合度电成本 <span className="font-bold text-white">¥{fmt(g.unitCost, 3)}</span>
              <span className="text-[#9DECD3] ml-1">再降 ¥{fmt(g.unitCostDelta, 3)}</span>
            </span>
            <span>
              AI 运行 <span className="font-bold text-white">{g.aiDays}</span> / {g.days} 天
            </span>
            <span>
              光伏消纳率 <span className="font-bold text-white">{fmt(g.pv.consumptionRate, 1)}%</span>
              <span className="text-[#9DECD3] ml-1">+{fmt(g.pv.consumptionDelta, 1)} pct</span>
            </span>
          </div>
        </div>

        <div className="shrink-0 w-full lg:w-[248px] rounded-xl bg-white/8 border border-white/15 p-4">
          <div className="flex items-center gap-1.5 text-[11px] text-[#9DECD3] font-bold">
            <Gift size={12} />
            开通即得
          </div>
          <ul className="mt-2.5 space-y-1.5 text-[11px] text-white/85">
            {[
              '30 天 AI 智能调度试用',
              '11 项增益指标完整解锁',
              '策略运行报告全量视图',
              '专属顾问 1v1 收益解读',
            ].map(t => (
              <li key={t} className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-[#7BE0C0] shrink-0" />
                {t}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onActivate}
            className="mt-3.5 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[12px] font-bold bg-[#1E9C7E] hover:bg-[#17705A] transition-colors"
          >
            <Rocket size={14} />
            一键免费开通
          </button>
          <button
            type="button"
            onClick={onOpenSimReport}
            className="mt-2 w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold text-white/80 border border-white/20 hover:bg-white/10 transition-colors"
          >
            查看仿真报告
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** 试运行 / 正式运行：顶部成绩条（只用真实指标） */
function AiScoreStrip({ lifecycle, onConvert }: { lifecycle: Lifecycle; onConvert: () => void }) {
  const g = AI_GAIN;
  const isTrial = lifecycle === 'trial';

  return (
    <div
      className={`rounded-xl px-5 py-4 border ${
        isTrial
          ? 'bg-gradient-to-br from-[#FFF9EC] to-[#FFF4DE] border-[#FFE0A3]'
          : 'bg-gradient-to-br from-[#F1FBF7] to-[#E8F7F1] border-[#B7E4D3]'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0">
          <div
            className={`flex items-center gap-2 text-[11px] font-bold ${
              isTrial ? 'text-[#B7791F]' : 'text-[#17705A]'
            }`}
          >
            {isTrial ? <Clock size={12} /> : <ShieldCheck size={12} />}
            {isTrial
              ? `试运行已运行 ${TY_TRIAL_META.elapsedDays} / ${TY_TRIAL_META.totalDays} 天 · 对比基线：${TY_TRIAL_META.baselineName}`
              : `AI 智能托管中 · 本月运行成绩（当月 ${g.days} 天）`}
          </div>

          <div className="mt-2 flex flex-wrap items-end gap-x-7 gap-y-2">
            <div>
              <div className={`text-[10px] ${isTrial ? 'text-[#8A6D3B]' : 'text-[#2C7A6E]'}`}>
                全月综合运行总收益
              </div>
              <div
                className={`text-[22px] font-black font-mono leading-tight ${
                  isTrial ? 'text-[#B7791F]' : 'text-[#17705A]'
                }`}
              >
                {(g.totalRevenue / 10000).toFixed(2)}
                <span className="text-[11px] font-normal ml-1">万元</span>
              </div>
            </div>
            <div>
              <div className={`text-[10px] ${isTrial ? 'text-[#8A6D3B]' : 'text-[#2C7A6E]'}`}>
                AI 提升收益
              </div>
              <div className="text-[16px] font-black font-mono text-[#E5484D] leading-tight">
                ¥{fmt(g.aiBoost, 0)}
                <span className="text-[11px] font-normal text-[#8A6D3B] ml-1">
                  +{fmt(g.aiBoostPct, 1)}%
                </span>
              </div>
            </div>
            <div>
              <div className={`text-[10px] ${isTrial ? 'text-[#8A6D3B]' : 'text-[#2C7A6E]'}`}>
                综合度电成本
              </div>
              <div className="text-[16px] font-black font-mono text-[#1A2A3A] leading-tight">
                ¥{fmt(g.unitCost, 3)}
                <span className="text-[11px] font-normal text-[#1E9C7E] ml-1">
                  -¥{fmt(g.unitCostDelta, 3)}
                </span>
              </div>
            </div>
            <div>
              <div className={`text-[10px] ${isTrial ? 'text-[#8A6D3B]' : 'text-[#2C7A6E]'}`}>
                AI 运行时长
              </div>
              <div className="text-[16px] font-black font-mono text-[#1A2A3A] leading-tight">
                {fmt(g.aiRuntimePct, 2)}
                <span className="text-[11px] font-normal ml-1">%（{fmt(g.aiRuntimeHours, 2)}h）</span>
              </div>
            </div>
          </div>
        </div>

        {isTrial && (
          <div className="flex flex-col items-stretch gap-2 shrink-0">
            <div className="rounded-lg bg-white/70 border border-[#FFE0A3] px-3 py-2 text-center">
              <div className="text-[10px] text-[#8A6D3B]">试用期剩余</div>
              <div className="text-[15px] font-black font-mono text-[#B7791F]">
                {TY_TRIAL_META.remainingDays} 天
              </div>
            </div>
            <button
              type="button"
              onClick={onConvert}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[12px] font-bold bg-[#B7791F] hover:bg-[#96631A] text-white transition-colors"
            >
              <ArrowUpRight size={14} />
              一键升级正式版
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** 核心三项指标卡（策略运行报告 LEVEL 1 精简） */
function AiCoreCards() {
  const g = AI_GAIN;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="bg-white rounded-xl border border-[#EAEDF2] p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#8A98A6]">全月综合运行总收益</span>
          <span className="w-6 h-6 rounded-lg bg-[#E8F7F1] flex items-center justify-center">
            <Coins size={13} className="text-[#1E9C7E]" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-[24px] font-black font-mono text-[#1A2A3A] leading-none">
            {(g.totalRevenue / 10000).toFixed(2)}
          </span>
          <span className="text-[11px] text-[#8A98A6]">万元</span>
        </div>
        <div className="text-[11px] text-[#93A1B0] mt-1.5">
          光伏 {(g.pv.revenue / 10000).toFixed(2)} 万 + 储能 {(g.ess.revenue / 10000).toFixed(2)} 万
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#EAEDF2] p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#8A98A6]">AI 提升收益</span>
          <span className="w-6 h-6 rounded-lg bg-[#FDECEC] flex items-center justify-center">
            <TrendingUp size={13} className="text-[#E5484D]" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-[24px] font-black font-mono text-[#E5484D] leading-none">
            ¥{fmt(g.aiBoost, 0)}
          </span>
          <span className="text-[11px] font-bold text-[#1E9C7E] bg-[#E6F4F0] px-1.5 py-0.5 rounded font-mono">
            +{fmt(g.aiBoostPct, 1)}%
          </span>
        </div>
        <div className="text-[11px] text-[#93A1B0] mt-1.5">较基准策略（同输入条件）</div>
      </div>

      <div className="bg-white rounded-xl border border-[#EAEDF2] p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#8A98A6]">综合度电成本</span>
          <span className="w-6 h-6 rounded-lg bg-[#F1FBF7] flex items-center justify-center">
            <Gauge size={13} className="text-[#17705A]" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-[24px] font-black font-mono text-[#1A2A3A] leading-none">
            ¥{fmt(g.unitCost, 3)}
          </span>
          <span className="text-[11px] font-bold text-[#1E9C7E] bg-[#E6F4F0] px-1.5 py-0.5 rounded font-mono">
            -¥{fmt(g.unitCostDelta, 3)}
          </span>
        </div>
        <div className="text-[11px] text-[#93A1B0] mt-1.5">
          基准 ¥{fmt(g.unitCostBase, 3)} /kWh，降幅 {fmt(g.unitCostPct, 1)}%
        </div>
      </div>
    </div>
  );
}

/** 光伏 / 储能 双翼精简（各取 3 项最有说服力的指标） */
function AiWings() {
  const g = AI_GAIN;

  const pvItems = [
    { label: '光伏消纳率', value: `${fmt(g.pv.consumptionRate, 1)}%`, delta: `+${fmt(g.pv.consumptionDelta, 1)} pct`, base: `基准 ${fmt(g.pv.consumptionBase, 1)}%` },
    { label: '光伏入储电量', value: `${g.pv.toStorage}`, unit: '万kWh', delta: `+${fmt(g.pv.toStorageDelta, 1)}%`, base: `基准 ${g.pv.toStorageBase}万kWh` },
    { label: '限电止损', value: `¥${fmt(g.pv.curtailmentSaved, 0)}`, delta: `止损 ${fmt(g.pv.curtailmentEnergy, 1)} kWh`, base: `日均减亏 ¥${fmt(AI_CURTAILMENT.avgSavedDaily, 2)}` },
  ];
  const essItems = [
    { label: '储能综合利用率', value: `${fmt(g.ess.utilRate, 1)}%`, delta: `+${fmt(g.ess.utilDelta, 1)}%`, base: `基准 ${fmt(g.ess.utilBase, 1)}%` },
    { label: '储能充电成本', value: `¥${fmt(g.ess.chargeCost, 3)}`, delta: `${fmt(g.ess.chargeCostDelta, 1)}%`, base: `基准 ¥${fmt(g.ess.chargeCostBase, 3)}/kWh` },
    { label: '储能放电价格', value: `¥${fmt(g.ess.dischargePrice, 3)}`, delta: `+${fmt(g.ess.dischargePriceDelta, 1)}%`, base: `基准 ¥${fmt(g.ess.dischargePriceBase, 3)}/kWh` },
  ];

  const Wing = ({
    tone,
    icon,
    title,
    revenue,
    share,
    narrative,
    items,
  }: {
    tone: string;
    icon: React.ReactNode;
    title: string;
    revenue: number;
    share: number;
    narrative: string;
    items: { label: string; value: string; unit?: string; delta: string; base: string }[];
  }) => (
    <div className="bg-white rounded-xl border border-[#EAEDF2] p-4">
      <div className="flex items-start justify-between pb-3 border-b border-[#EAEDF2]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full" style={{ background: tone }} />
          <span className="text-[13px] font-bold text-[#1A2A3A] flex items-center gap-1.5">
            {icon}
            {title}
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: `${tone}14`, color: tone }}
          >
            占比 {fmt(share, 1)}%
          </span>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-[#93A1B0]">当月收益</div>
          <div className="text-[15px] font-black font-mono" style={{ color: tone }}>
            {(revenue / 10000).toFixed(2)}
            <span className="text-[10px] font-normal text-[#8A98A6] ml-0.5">万元</span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-[#7F8C8D] leading-relaxed mt-3">{narrative}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
        {items.map(it => (
          <div key={it.label} className="rounded-lg bg-[#FBFCFD] border border-[#EAEDF2] px-3 py-2.5">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-bold text-[#5A6B7C] truncate">{it.label}</span>
              <span
                className="shrink-0 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded"
                style={{ background: `${tone}14`, color: tone }}
              >
                {it.delta}
              </span>
            </div>
            <div className="mt-1.5 text-[15px] font-black font-mono text-[#1A2A3A]">
              {it.value}
              {it.unit && <span className="text-[10px] font-normal text-[#8A98A6] ml-0.5">{it.unit}</span>}
            </div>
            <div className="text-[10px] text-[#9AA7B4] mt-0.5">{it.base}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Wing
        tone={C.amber}
        icon={<Sun size={14} className="text-[#F59E0B]" />}
        title="光伏收益"
        revenue={g.pv.revenue}
        share={g.pv.sharePct}
        narrative={`AI 把光伏电量更多留在站内：消纳率 ${fmt(g.pv.consumptionRate, 1)}%，比基准高 ${fmt(g.pv.consumptionDelta, 1)} 个百分点；入储电量 ${g.pv.toStorage} 万kWh，同比基准增长 ${fmt(g.pv.toStorageDelta, 1)}%。`}
        items={pvItems}
      />
      <Wing
        tone={C.blue}
        icon={<Zap size={14} className="text-[#2563EB]" />}
        title="储能收益"
        revenue={g.ess.revenue}
        share={g.ess.sharePct}
        narrative={`AI 把充放电挪到该去的时段：充电成本降到 ¥${fmt(g.ess.chargeCost, 3)}/kWh，放电价格提到 ¥${fmt(g.ess.dischargePrice, 3)}/kWh，充放价差从 ¥${fmt(g.ess.spreadBase, 3)} 扩到 ¥${fmt(g.ess.spread, 3)}。`}
        items={essItems}
      />
    </div>
  );
}

/** 日收益对比曲线（策略运行报告「本月运行策略收益统计」精简） */
function AiDailyChart() {
  return (
    <ChartCard
      title="全月日收益对比"
      unit="元 / 日"
      height={250}
      note={`绿色为 AI 在基准策略之上多创造的收益，全月合计 ¥${fmt(AI_GAIN.aiBoost, 0)}；灰色为基准策略收益。当月 ${AI_GAIN.days} 天中 AI 运行 ${AI_GAIN.aiDays} 天。`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={AI_DAILY} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF2F5" />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#93A1B0' }} axisLine={{ stroke: '#EAEDF2' }} tickLine={false} interval={1} />
          <YAxis tick={{ fontSize: 10, fill: '#93A1B0' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="base" name="基础策略收益" stackId="rev" fill="#CBD5E1" radius={[0, 0, 0, 0]} />
          <Bar dataKey="boost" name="AI 提升收益" stackId="rev" fill={C.green} radius={[3, 3, 0, 0]} />
          <Line type="monotone" dataKey="total" name="当日总收益" stroke="#1A2A3A" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/** 口径说明条 */
function CaliberNote() {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-white border border-[#EAEDF2] px-4 py-3">
      <Info size={13} className="text-[#93A1B0] mt-0.5 shrink-0" />
      <p className="text-[11px] text-[#7F8C8D] leading-relaxed">
        <span className="font-bold text-[#5A6B7C]">口径说明：</span>
        {AI_GAIN.caliberNote}
      </p>
    </div>
  );
}

/** tab2 主体 */
function AiStrategyTab({
  lifecycle,
  onActivate,
  onConvert,
  onOpenSimReport,
}: BusinessReportPageProps) {
  /* 未开通（售前）：把《天盈 AI 仿真报告》正文铺开展示，末尾引导开通试用。
     注意这里不做遮罩 —— 遮罩会让客户看不到价值，反而降低开通意愿。 */
  if (lifecycle === 'presale') {
    return (
      <div className="space-y-4">
        <AiHeroPresale onActivate={onActivate} onOpenSimReport={onOpenSimReport} />

        <div className="flex items-center gap-2">
          <span className="w-1 h-3.5 rounded-full bg-[#1E9C7E]" />
          <span className="text-[13px] font-bold text-[#1A2A3A]">AI 智能调度效益预评估</span>
          <span className="text-[11px] text-[#93A1B0]">《天盈 AI 仿真报告》· 售前测算口径</span>
        </div>

        <TianyingSimReportBody
          showActivateHint
          onActivate={onActivate}
          onOpenSimReport={onOpenSimReport}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 试运行 / 正式运行：指标已解锁，展示真实运行成绩 */}
      <AiScoreStrip lifecycle={lifecycle} onConvert={onConvert} />

      <div className="flex items-center gap-2">
        <span className="w-1 h-3.5 rounded-full bg-[#1E9C7E]" />
        <span className="text-[13px] font-bold text-[#1A2A3A]">AI 智能调度效益分析</span>
        <span className="text-[11px] text-[#93A1B0]">策略运行报告 · 精简视图</span>
      </div>

      <AiCoreCards />
      <AiWings />
      <AiDailyChart />

      <CaliberNote />
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
  onActivate,
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

        <div className="flex items-center gap-2">
          {lifecycle === 'presale' && (
            <button
              type="button"
              onClick={onActivate}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-md bg-[#1E9C7E] hover:bg-[#17705A] text-white transition-colors shadow-xs"
            >
              <Rocket className="w-4 h-4" />
              免费开通试用
            </button>
          )}
          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-md border border-[#EAEDF2] text-[#2C3E50] hover:bg-[#F7F9FB] transition-colors"
          >
            <Download className="w-4 h-4" />
            导出报告
          </button>
        </div>
      </div>

      {/* tab 栏 */}
      <div className="bg-white rounded-xl border border-[#EAEDF2] shadow-[0_2px_8px_rgba(26,42,58,0.04)]">
        <div className="flex items-center gap-8 px-6 pt-3 border-b border-[#EAEDF2]">
          {TABS.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`pb-2.5 text-sm font-medium transition-colors relative flex items-center gap-1.5 ${
                tab === t.key
                  ? 'text-[#1A2A3A] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1E9C7E]'
                  : 'text-[#7F8C8D] hover:text-[#1A2A3A]'
              }`}
            >
              {t.label}
              {t.key === 'ai' &&
                (lifecycle === 'presale' ? (
                  <span className="px-1.5 py-0.5 rounded bg-[#F1F4F7] text-[#5A6B7C] text-[10px] font-bold">
                    仿真
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-[#E8F7F1] text-[#17705A] text-[10px] font-bold">
                    AI
                  </span>
                ))}
            </button>
          ))}
        </div>

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
            <AiStrategyTab
              lifecycle={lifecycle}
              onOpenSimReport={onOpenSimReport}
              onConvert={onConvert}
              onActivate={onActivate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
