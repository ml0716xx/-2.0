/* ==========================================================================
   《天盈 AI 仿真报告》· 正文（可复用）
   --------------------------------------------------------------------------
   三章节与运营端「推送仿真报告」同源：
     1 运行概况 / 2 仿真收益对比 / 3 典型日分析

   三处共用同一份正文，避免同一份内容写三遍：
     · 售前《天盈 AI 仿真报告》弹窗（TianyingSimReportModal）
     · 策略运行报告 · 未开通状态（报告主体替换为本正文）
     · 经营分析报告 · AI 策略收益 tab · 未开通状态（正文铺开展示）

   数字全部取自 tianyingReportData.ts，组件不写死任何数值。
   ========================================================================== */

import React, { useState } from 'react';
import {
  Sparkles,
  Battery,
  Sun,
  Zap,
  ArrowRight,
  CheckCircle2,
  Rocket,
  Info,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

const C = {
  green: '#1E9C7E',
  blue: '#3B82F6',
  amber: '#F59E0B',
};

/** 章节外壳：编号 + 标题 + 说明 */
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

export interface TianyingSimReportBodyProps {
  /** 是否在正文末尾附「开通试用」引导条 */
  showActivateHint?: boolean;
  /** 开通试用 */
  onActivate?: () => void;
  /** 打开完整仿真报告弹窗 */
  onOpenSimReport?: () => void;
}

export default function TianyingSimReportBody({
  showActivateHint = false,
  onActivate,
  onOpenSimReport,
}: TianyingSimReportBodyProps) {
  const [caseIdx, setCaseIdx] = useState(0);

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

  return (
    <div className="space-y-4">
      {/* ------------------------- 1. 运行概况 ------------------------- */}
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
                    {fmt(r.value, 2)}
                    <span className="text-[10px] font-normal text-[#8A98A6] ml-0.5">{r.unit}</span>
                  </td>
                  <td className="px-3 py-2 text-[11px] text-[#7F8C8D]">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ------------------------- 2. 仿真收益对比 ------------------------- */}
      <Section no="2" title="仿真收益对比" hint="相同负荷与光伏输入下重排储能充放电计划">
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
          <div className="flex items-center gap-4 mt-1.5 flex-wrap">
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
                  <tr key={r.item} className={`border-t border-[#EAEDF2] ${isLast ? 'bg-[#F4FBF8]' : ''}`}>
                    <td
                      className={`px-3 py-2 text-[12px] whitespace-nowrap ${
                        isLast ? 'font-bold text-[#1A2A3A]' : 'text-[#2C3E50]'
                      }`}
                    >
                      {r.item}
                      <span className="text-[10px] text-[#9AA7B4] ml-1">{r.unit}</span>
                    </td>
                    <td className="px-3 py-2 text-right text-[12px] font-mono text-[#7F8C8D] whitespace-nowrap">
                      {fmt(r.real, 0)}
                    </td>
                    <td className="px-3 py-2 text-right text-[12px] font-mono font-bold text-[#1A2A3A] whitespace-nowrap">
                      {fmt(r.sim, 0)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right text-[12px] font-mono font-bold whitespace-nowrap ${
                        diff > 0 ? 'text-[#E5484D]' : diff < 0 ? 'text-[#1E9C7E]' : 'text-[#9AA7B4]'
                      }`}
                    >
                      {diff === 0 ? '—' : fmtSigned(diff, 0)}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-[#7F8C8D]">{r.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

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
                  <span className="text-[11px] font-bold text-[#5A6B7C]">购电 · {t.label}段</span>
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

      {/* ------------------------- 3. 典型日分析 ------------------------- */}
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
                      {fmt(r.real, 0)}
                    </td>
                    <td className="px-3 py-2 text-right text-[12px] font-mono font-bold text-[#1A2A3A] whitespace-nowrap">
                      {fmt(r.sim, 0)}
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

      {/* ------------------------- 口径说明 ------------------------- */}
      <div className="flex items-start gap-2 rounded-xl bg-white border border-[#EAEDF2] px-4 py-3">
        <Info size={13} className="text-[#93A1B0] mt-0.5 shrink-0" />
        <p className="text-[11px] text-[#7F8C8D] leading-relaxed">
          <span className="font-bold text-[#5A6B7C]">报告口径：</span>
          {TY_META.caliberNote}
        </p>
      </div>

      {/* ------------------------- 开通试用引导 ------------------------- */}
      {showActivateHint && (
        <div className="rounded-xl border border-[#B7E4D3] bg-gradient-to-br from-[#F1FBF7] to-[#E8F7F1] px-5 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <Rocket size={16} className="text-[#1E9C7E] mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-[#1A2A3A]">
                  以上为售前仿真测算结果，可多创收 {fmt(TY_SIM_DELTA.net, 0)} 元 / 月
                </div>
                <p className="text-[11px] text-[#5A6B7C] mt-1 leading-relaxed">
                  开通 30 天试用后，本页将切换为「实测 AI 轨迹 vs 后台基线仿真」的真实对比口径，
                  数据全部来自站点实际运行；试用期内可随时退出。
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] text-[#2C7A6E]">
                  {['免审批自动开通', '无需改造设备', '试用期随时退出'].map(t => (
                    <span key={t} className="flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-[#1E9C7E]" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {onOpenSimReport && (
                <button
                  type="button"
                  onClick={onOpenSimReport}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[12px] font-bold text-[#17705A] border border-[#B7E4D3] bg-white/70 hover:bg-white transition-colors"
                >
                  <Sparkles size={14} />
                  查看仿真报告
                </button>
              )}
              {onActivate && (
                <button
                  type="button"
                  onClick={onActivate}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[12px] font-bold bg-[#1E9C7E] hover:bg-[#17705A] text-white transition-colors shadow-sm"
                >
                  <Rocket size={14} />
                  一键免费开通 30 天试用
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
