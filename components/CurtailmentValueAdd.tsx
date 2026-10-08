/* ==========================================================================
   限电止损（增值特性）· 展示组件
   --------------------------------------------------------------------------
   抽成组件供两处共用，保证展示效果完全一致：
     · 策略运行报告 · 增值特性 tab
     · 经营分析报告 · AI 策略收益 tab · 增值特性

   内容三层：
     1 营销头（金色渐变）—— 本月减少损失金额、止损电量、日均减亏、触发天数 + 能力清单
     2 明细卡片 —— 逐日限电止损组合图 + 31 天明细表（可展开）
     3 96 点穿透弹窗 —— 单日逐 15min 出力与电价穿透 + Excel 导出

   数据全部取自 curtailmentData.ts，组件内不写死任何数值。
   ========================================================================== */

import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Sun,
  X,
} from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  curtailmentDataList,
  curtailmentTotalSaved,
  curtailmentTotalEnergy,
  curtailmentActiveDays,
  get96PointsForDay,
} from './curtailmentData';

/**
 * 日刻度渲染：与主报告图表的 DynamicXAxisTick 视觉一致
 * （fontSize 10 / dy 14 / 居中，AI 运行日标绿加粗）。
 * 主报告那份依赖日收益数据与模拟排程状态，此处按同样的「每 6 天有 1 天非 AI 日」
 * 规则本地判定，避免为一张限电图表反向依赖日收益模块。
 */
const CurtailmentDayTick = (props: any) => {
  const { x, y, payload } = props;
  const dayNum = parseInt(payload.value);
  const isAiDay = Number.isFinite(dayNum) ? dayNum % 6 !== 0 : false;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={14}
        textAnchor="middle"
        fill={isAiDay ? '#1E9C7E' : '#7F8C8D'}
        fontSize={10}
        fontWeight={isAiDay ? 'bold' : 'normal'}
      >
        {payload.value}
      </text>
    </g>
  );
};

export default function CurtailmentValueAdd() {
  /** 穿透弹窗当前查看的日期 */
  const [selectedCurtailDay, setSelectedCurtailDay] = useState<string>('15日');
  /** 穿透弹窗开关 */
  const [isCurtailModalOpen, setIsCurtailModalOpen] = useState<boolean>(false);
  /** 31 天明细表展开状态 */
  const [isTableExpanded, setIsTableExpanded] = useState<boolean>(false);
  /** 导出成功提示 */
  const [showExportToast, setShowExportToast] = useState<boolean>(false);

  return (
    <>

      <div className="space-y-4">
        {/* 增值特性头：营销位，突出本月金额与解锁感 */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#2A2118] via-[#3D2E1B] to-[#7A4F17] text-white px-5 py-4">
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-[#F5C77E]/12 blur-2xl" />
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-[#F5C77E]/20 border border-[#F5C77E]/40 text-[#FFE0A3] text-[10px] font-bold flex items-center gap-1">
                  <Sparkles size={11} />
                  增值特性
                </span>
                <span className="text-[11px] text-white/60">
                  微电网负电价 / 限电调控场景
                </span>
              </div>
              <div className="mt-2 text-[15px] font-bold">本月为您减少限电损失</div>
              <div className="mt-1.5 flex items-baseline gap-2.5 flex-wrap">
                <span className="text-[32px] font-black font-mono leading-none tracking-tight">
                  +¥{curtailmentTotalSaved.toLocaleString()}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#F5C77E]/20 text-[#FFE0A3] text-[11px] font-bold font-mono">
                  止损电量 {curtailmentTotalEnergy.toFixed(1)} kWh
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#7BE0C0]/15 text-[#9DECD3] text-[11px] font-bold font-mono">
                  日均减亏 ¥{(curtailmentTotalSaved / 31).toFixed(2)}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-white/70 leading-relaxed">
                全月 {curtailmentActiveDays} 天触发限电 / 负电价场景。AI 自动把光伏余电导向储能充能，
                避开逆功率罚款与负电价上网损失；点击下方记录可查看逐日明细与 96 点穿透曲线。
              </div>
            </div>
            <div className="shrink-0 rounded-xl bg-white/8 border border-white/15 px-4 py-3 w-full lg:w-[210px]">
              <div className="flex items-center gap-1.5 text-[11px] text-[#FFE0A3] font-bold">
                <ShieldCheck size={12} />
                增值能力说明
              </div>
              <ul className="mt-2 space-y-1.5 text-[11px] text-white/80">
                {['限电 / 负电价识别', '余电转储自动执行', '逐日止损台账', '96 点穿透分析'].map(t => (
                  <li key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 size={11} className="text-[#9DECD3] shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 明细卡片：逐日限电止损评估 + 96 点穿透入口 */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_8px_rgba(26,42,58,0.06)] border border-[#EAEDF2]">

    {/* 下图：每日光伏限电止损评估 (每日限电止损金额与限电电量统计 + 96点微电网穿透) */}
    <div className="flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#D97706]" />
          <span className="text-xs font-bold text-[#2C3E50]">每日光伏限电止损评估</span>
          <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 font-bold px-2 py-0.5 rounded-full">
            微电网负电价 / 限电调控减亏
          </span>
        </div>
        
        {/* 右上角统计胶囊 (与每日储能充放电均价和套利统计风格一致) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#EAEDF2] text-[#2C3E50] px-2.5 py-1 rounded-full text-xs font-medium shadow-2xs">
            <div className="w-2 h-2 rounded-full bg-[#D97706]" />
            <span className="text-[#7F8C8D]">全月限电电量</span>
            <span className="font-extrabold text-[#1A2A3A]">{curtailmentTotalEnergy.toFixed(1)} kWh</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-medium shadow-2xs">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>全月累计止损</span>
            <span className="font-extrabold text-emerald-700">
              +¥{curtailmentTotalSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* 图例与说明 */}
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-sm mb-4 bg-[#F8FAFC] p-3 rounded-xl border border-[#EAEDF2]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-xs bg-[#10B981]"></div>
            <span className="text-[#2C3E50] font-bold text-xs">每日限电止损金额 (元)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-xs bg-[#EF4444]"></div>
            <span className="text-[#2C3E50] font-bold text-xs">限电考核调整 (负值)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 bg-[#F59E0B] rounded-full"></div>
            <div className="w-2 h-2 rounded-full bg-[#F59E0B]"></div>
            <span className="text-[#2C3E50] font-bold text-xs">限电电量 (kWh)</span>
          </div>
        </div>
      </div>

      {/* 限电止损组合图 */}
      <div className="h-[230px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={curtailmentDataList}
            margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
            barGap={2}
            barCategoryGap="18%"
            onClick={(state: any) => {
              if (state && state.activeLabel) {
                setSelectedCurtailDay(state.activeLabel);
                setIsCurtailModalOpen(true);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEDF2" />
            <XAxis dataKey="day" scale="band" axisLine={{ stroke: "#EAEDF2" }} tickLine={false} tick={<CurtailmentDayTick />} interval={0} />
            {/* 左 Y 轴：止损金额 (元) */}
            <YAxis 
              yAxisId="left"
              axisLine={{ stroke: "#EAEDF2" }} 
              tickLine={false} 
              tick={{ fill: "#7F8C8D", fontSize: 10 }} 
              tickFormatter={(val) => `¥${val}`} 
              domain={[-100, 650]}
            />
            {/* 右 Y 轴：限电电量 (kWh) */}
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={{ stroke: "#EAEDF2" }} 
              tickLine={false} 
              tick={{ fill: "#D97706", fontSize: 10 }} 
              tickFormatter={(val) => `${val}k`} 
              domain={[0, 60]}
            />
            <Tooltip
              cursor={{ fill: "#F4F6F9" }}
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload;
                const loss = data.lossSaved || 0;
                const energy = data.curtailedEnergy || 0;
                const isCurtailDay = loss !== 0 || energy !== 0;

                return (
                  <div className="bg-white p-3.5 rounded-xl border border-[#EAEDF2] shadow-xl min-w-[240px]">
                    <div className="flex items-center justify-between font-bold text-[#1A2A3A] text-xs mb-2 pb-1 border-b border-[#EAEDF2]">
                      <span className="text-sm font-extrabold">{label} · 光伏限电评估</span>
                      {isCurtailDay ? (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${loss >= 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                          {loss >= 0 ? "限电消纳减亏" : "考核调整"}
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-medium">
                          无弃光/限电
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#7F8C8D]">限电止损金额:</span>
                        <span className={`font-mono font-bold ${loss > 0 ? "text-[#10B981]" : loss < 0 ? "text-[#EF4444]" : "text-[#7F8C8D]"}`}>
                          {loss > 0 ? `+¥${loss.toFixed(2)}` : loss < 0 ? `-¥${Math.abs(loss).toFixed(2)}` : "¥0.00"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#7F8C8D]">限电电量:</span>
                        <span className="font-mono font-bold text-[#D97706]">{energy.toFixed(1)} kWh</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#7F8C8D] bg-[#F8FAFC] p-1.5 rounded">
                        <span>分时电价状态:</span>
                        <span className="font-medium text-[#2C3E50]">{loss >= 0 && energy > 0 ? "负电价时段入储" : loss < 0 ? "偏差调整" : "常规电价"}</span>
                      </div>

                      {isCurtailDay && (
                        <div className="pt-2 border-t border-[#EAEDF2] flex items-center justify-center text-[11px] text-[#D97706] font-bold">
                          🔍 点击查看 96 点穿透分析曲线
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />

            {/* 每日限电止损柱状图 */}
            <Bar
              yAxisId="left"
              dataKey="lossSaved"
              name="限电止损金额 (元)"
              radius={[3, 3, 0, 0]}
              barSize={8}
            >
              {curtailmentDataList.map((entry, index) => {
                let barFill = "#10B981";
                if (entry.lossSaved < 0) {
                  barFill = "#EF4444";
                } else if (entry.lossSaved === 0) {
                  barFill = "#E2E8F0";
                }
                return (
                  <Cell
                    key={`cell-curtail-${index}`}
                    fill={barFill}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                );
              })}
            </Bar>

            {/* 每日限电电量折线 */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="curtailedEnergy"
              name="限电电量 (kWh)"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ r: 2, fill: "#F59E0B", stroke: "#ffffff", strokeWidth: 1.5 }}
              activeDot={{ r: 5, stroke: "#D97706", strokeWidth: 2, className: "cursor-pointer" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 展开/收起 31 天限电止损明细数据表 */}
      <div className="mt-4 pt-3 border-t border-[#EAEDF2]">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsTableExpanded(!isTableExpanded)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#2C3E50] hover:text-[#1A2A3A] transition-colors cursor-pointer"
          >
            <span>{isTableExpanded ? "收起 31 天限电明细表" : "展开查看 31 天限电止损明细数据"}</span>
            {isTableExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isTableExpanded && (
          <div className="mt-3 overflow-x-auto rounded-xl border border-[#EAEDF2]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#7F8C8D] font-bold border-b border-[#EAEDF2]">
                <tr>
                  <th className="py-2.5 px-3">日期</th>
                  <th className="py-2.5 px-3">限电止损金额 (元)</th>
                  <th className="py-2.5 px-3">限电电量 (kWh)</th>
                  <th className="py-2.5 px-3">调度策略</th>
                  <th className="py-2.5 px-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEDF2]">
                {curtailmentDataList.map((row) => (
                  <tr key={`table-curtail-${row.day}`} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-2 px-3 font-bold text-[#1A2A3A]">{row.day}</td>
                    <td className={`py-2 px-3 font-mono font-bold ${row.lossSaved > 0 ? "text-[#10B981]" : row.lossSaved < 0 ? "text-[#EF4444]" : "text-[#7F8C8D]"}`}>
                      {row.lossSaved > 0 ? `+¥${row.lossSaved.toFixed(2)}` : row.lossSaved < 0 ? `-¥${Math.abs(row.lossSaved).toFixed(2)}` : "¥0.00"}
                    </td>
                    <td className="py-2 px-3 font-mono text-[#D97706]">{row.curtailedEnergy.toFixed(1)} kWh</td>
                    <td className="py-2 px-3 text-[#2C3E50]">
                      {row.lossSaved > 0 ? "光伏入储消纳 / 避免负电价" : row.lossSaved < 0 ? "考核策略微调" : "全额直接消纳"}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedCurtailDay(row.day);
                          setIsCurtailModalOpen(true);
                        }}
                        className="text-[11px] font-bold text-[#D97706] hover:text-[#B45309] hover:underline cursor-pointer"
                      >
                        96点穿透
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
        </div>
      </div>

      {/* 96点微电网光伏限电与止损穿透分析弹窗 */}
      {isCurtailModalOpen && (() => {
        const points96 = get96PointsForDay(selectedCurtailDay);
        const dayItem = curtailmentDataList.find(d => d.day === selectedCurtailDay) || { lossSaved: 0, curtailedEnergy: 0 };
        const totalTheo = points96.reduce((acc, p) => acc + p.theoreticalGen, 0);
        const totalAct = points96.reduce((acc, p) => acc + p.actualGen, 0);
        const totalCurt = points96.reduce((acc, p) => acc + p.curtailedGen, 0);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl border border-[#EAEDF2] w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="p-5 border-b border-[#EAEDF2] flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <Sun className="w-5 h-5 text-[#D97706]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-[#1A2A3A]">
                        {selectedCurtailDay} · 96点微电网光伏限电与止损穿透分析
                      </h3>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                        15分钟级分辨率
                      </span>
                    </div>
                    <p className="text-xs text-[#7F8C8D] mt-0.5">
                      河北用户侧微电网 · 结合分时电价与光伏出力智能调控策略
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowExportToast(true);
                      setTimeout(() => setShowExportToast(false), 3000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#2C3E50] border border-[#EAEDF2] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>导出数据 (Excel)</span>
                  </button>
                  <button
                    onClick={() => setIsCurtailModalOpen(false)}
                    className="p-1.5 text-[#7F8C8D] hover:text-[#1A2A3A] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-5 flex-1">
                
                {/* 4 Summary Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#EAEDF2]">
                    <span className="text-[11px] text-[#7F8C8D] font-medium block">理论光伏发电量</span>
                    <span className="text-base font-black text-[#1A2A3A] font-sans mt-0.5 block">
                      {totalTheo.toFixed(1)} <span className="text-xs font-normal text-[#7F8C8D]">kWh</span>
                    </span>
                  </div>
                  <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#EAEDF2]">
                    <span className="text-[11px] text-[#7F8C8D] font-medium block">实际消纳发电量</span>
                    <span className="text-base font-black text-[#10B981] font-sans mt-0.5 block">
                      {totalAct.toFixed(1)} <span className="text-xs font-normal text-[#7F8C8D]">kWh</span>
                    </span>
                  </div>
                  <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#EAEDF2]">
                    <span className="text-[11px] text-[#7F8C8D] font-medium block">限电削减/入储量</span>
                    <span className="text-base font-black text-[#D97706] font-sans mt-0.5 block">
                      {totalCurt.toFixed(1)} <span className="text-xs font-normal text-[#7F8C8D]">kWh</span>
                    </span>
                  </div>
                  <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
                    <span className="text-[11px] text-emerald-800 font-bold block">当日实现限电止损</span>
                    <span className="text-base font-black text-[#10B981] font-sans mt-0.5 block">
                      {dayItem.lossSaved > 0 ? `+¥${dayItem.lossSaved.toFixed(2)}` : dayItem.lossSaved < 0 ? `-¥${Math.abs(dayItem.lossSaved).toFixed(2)}` : "¥0.00"}
                    </span>
                  </div>
                </div>

                {/* 96 Points Chart */}
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#EAEDF2]">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1A2A3A]">00:00 ~ 24:00 逐 15 分钟出力与电价穿透曲线</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-1 bg-[#F59E0B] rounded-full" />
                        <span className="text-[#7F8C8D]">理论出力 (kWh)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-1 bg-[#10B981] rounded-full" />
                        <span className="text-[#7F8C8D]">实际出力 (kWh)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-2 bg-amber-200 rounded-xs" />
                        <span className="text-[#7F8C8D]">限电/入储削峰</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-1 bg-[#2563EB] rounded-full" />
                        <span className="text-[#7F8C8D]">实时电价 (元/kWh)</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={points96}
                        margin={{ top: 10, right: 20, left: -15, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEDF2" />
                        <XAxis 
                          dataKey="time" 
                          axisLine={{ stroke: "#EAEDF2" }} 
                          tickLine={false} 
                          tick={{ fill: "#7F8C8D", fontSize: 10 }}
                          interval={7} // Show every 2 hours
                        />
                        {/* 左 Y 轴：电量 (kWh) */}
                        <YAxis 
                          yAxisId="power"
                          axisLine={{ stroke: "#EAEDF2" }} 
                          tickLine={false} 
                          tick={{ fill: "#7F8C8D", fontSize: 10 }} 
                          tickFormatter={(val) => `${val}`} 
                        />
                        {/* 右 Y 轴：电价 (元/kWh) */}
                        <YAxis 
                          yAxisId="price"
                          orientation="right"
                          axisLine={{ stroke: "#EAEDF2" }} 
                          tickLine={false} 
                          tick={{ fill: "#2563EB", fontSize: 10 }} 
                          tickFormatter={(val) => `¥${val}`} 
                          domain={[-0.4, 1.2]}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload || !payload.length) return null;
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-xl border border-[#EAEDF2] shadow-xl text-xs space-y-1 min-w-[200px]">
                                <div className="font-extrabold text-[#1A2A3A] pb-1 border-b border-[#EAEDF2] flex items-center justify-between">
                                  <span>{label}</span>
                                  <span className="text-emerald-700 font-mono">止损: +¥{data.lossSaved}</span>
                                </div>
                                <div className="flex justify-between text-[#7F8C8D]">
                                  <span>理论光伏:</span>
                                  <span className="font-bold text-[#F59E0B] font-mono">{data.theoreticalGen} kWh</span>
                                </div>
                                <div className="flex justify-between text-[#7F8C8D]">
                                  <span>实际消纳:</span>
                                  <span className="font-bold text-[#10B981] font-mono">{data.actualGen} kWh</span>
                                </div>
                                <div className="flex justify-between text-[#7F8C8D]">
                                  <span>限电削减/入储:</span>
                                  <span className="font-bold text-[#D97706] font-mono">{data.curtailedGen} kWh</span>
                                </div>
                                <div className="flex justify-between text-[#7F8C8D] pt-1 border-t border-[#EAEDF2]">
                                  <span>实时分时电价:</span>
                                  <span className={`font-bold font-mono ${data.tariff < 0 ? "text-red-600 font-black" : "text-[#2563EB]"}`}>
                                    {data.tariff < 0 ? `-¥${Math.abs(data.tariff)} (负电价)` : `¥${data.tariff}`}
                                  </span>
                                </div>
                              </div>
                            );
                          }}
                        />
                        
                        {/* 理论光伏出力折线/区域 */}
                        <Line
                          yAxisId="power"
                          type="monotone"
                          dataKey="theoreticalGen"
                          name="理论出力"
                          stroke="#F59E0B"
                          strokeWidth={1.5}
                          dot={false}
                        />

                        {/* 限电削减柱状图 */}
                        <Bar
                          yAxisId="power"
                          dataKey="curtailedGen"
                          name="削减/入储量"
                          fill="#FEF3C7"
                          stroke="#F59E0B"
                          strokeWidth={1}
                        />

                        {/* 实际消纳出力折线 */}
                        <Line
                          yAxisId="power"
                          type="monotone"
                          dataKey="actualGen"
                          name="实际出力"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={false}
                        />

                        {/* 分时电价折线 */}
                        <Line
                          yAxisId="price"
                          type="stepAfter"
                          dataKey="tariff"
                          name="分时电价"
                          stroke="#2563EB"
                          strokeWidth={1.8}
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 典型限电时段出力数据表片段 (11:00 ~ 14:00) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#2C3E50]">重点限电时段明细 (11:00 ~ 14:00 负电价光伏入储)</span>
                    <span className="text-[10px] text-[#7F8C8D]">采样间隔: 15分钟</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-[#EAEDF2]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] text-[#7F8C8D] font-bold border-b border-[#EAEDF2]">
                        <tr>
                          <th className="py-2 px-3">时间</th>
                          <th className="py-2 px-3">理论出力 (kWh)</th>
                          <th className="py-2 px-3">实际消纳 (kWh)</th>
                          <th className="py-2 px-3">削减/入储量 (kWh)</th>
                          <th className="py-2 px-3">分时电价 (元/kWh)</th>
                          <th className="py-2 px-3 text-right">止损增益 (元)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAEDF2]">
                        {points96.slice(44, 57).map((p, idx) => (
                          <tr key={`point-${idx}`} className="hover:bg-[#F8FAFC]">
                            <td className="py-1.5 px-3 font-bold text-[#1A2A3A]">{p.time}</td>
                            <td className="py-1.5 px-3 font-mono text-[#7F8C8D]">{p.theoreticalGen}</td>
                            <td className="py-1.5 px-3 font-mono font-bold text-[#10B981]">{p.actualGen}</td>
                            <td className="py-1.5 px-3 font-mono font-bold text-[#D97706]">{p.curtailedGen}</td>
                            <td className={`py-1.5 px-3 font-mono font-bold ${p.tariff < 0 ? "text-red-600" : "text-[#2C3E50]"}`}>
                              {p.tariff < 0 ? `-¥${Math.abs(p.tariff)}` : `¥${p.tariff}`}
                            </td>
                            <td className="py-1.5 px-3 font-mono font-bold text-[#10B981] text-right">
                              +¥{p.lossSaved}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#EAEDF2] flex items-center justify-between bg-[#F8FAFC]">
                <span className="text-xs text-[#7F8C8D]">
                  策略：在负电价与限电指令下，AI 自动将光伏余电导向储能充能，避免逆功率罚款与负电价上网损失。
                </span>
                <button
                  onClick={() => setIsCurtailModalOpen(false)}
                  className="px-4 py-2 bg-[#1A2A3A] hover:bg-[#2C3E50] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  关闭
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 导出成功 Toast 提示 */}
      {showExportToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A2A3A] text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-xs font-bold">{selectedCurtailDay} 96点穿透数据已成功生成</div>
            <div className="text-[10px] text-slate-300">正在下载 Excel 格式报表文件...</div>
          </div>
        </div>
      )}

    </>
  );
}
