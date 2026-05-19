import React, { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

const EventPill = ({
  span,
  title,
  type,
  tag,
  isActive = true,
  isSelected = false,
  onClick,
}: {
  span: number;
  title: string;
  type: "blue" | "green" | "orange" | "gray";
  tag?: string;
  isActive?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}) => {
  let bgClass = "";
  let textClass = "";

  switch (type) {
    case "blue":
      bgClass = "bg-[#2563eb]";
      textClass = "text-white";
      break;
    case "green":
      bgClass = "bg-[#6ee7b7]";
      textClass = "text-emerald-900";
      break;
    case "orange":
      bgClass = "bg-orange-100/80";
      textClass = "text-orange-600";
      break;
    case "gray":
      bgClass = "bg-[#d1fae5]"; // matching the green tint in the image for "系统维护"
      textClass = "text-emerald-700";
      break;
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      className={`h-[30px] rounded-[6px] px-3 flex items-center shadow-sm cursor-pointer transition-all mb-2 ${bgClass} ${
        !isActive
          ? "opacity-50 border border-current border-dashed"
          : "border border-transparent"
      } ${
        isSelected
          ? "ring-2 ring-blue-600 ring-offset-2 z-10 relative"
          : "hover:opacity-80"
      }`}
      style={{
        gridColumn: `span ${span}`,
      }}
      title={title}
    >
      <div
        className={`flex w-full items-center justify-between min-w-0 ${textClass}`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {!isActive && (
            <div className="w-1.5 h-1.5 rounded-full border border-current opacity-60"></div>
          )}
          <span className="text-xs font-bold truncate">{title}</span>
        </div>
        {tag && (
          <span className="shrink-0 text-[10px] font-bold opacity-80 pl-2">
            {tag}
          </span>
        )}
      </div>
    </div>
  );
};

const StrategySchedulePage2: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState("2026-04");
  const [selectedEventId, setSelectedEventId] = useState("e2");

  const strategyData = {
    e1: { name: "春季高效 V2.1", dateStr: "2026-04-01", isActive: false },
    e2: { name: "削峰填谷 连续策略", dateStr: "2026-04-06", isActive: true },
    e3: { name: "备用策略1", dateStr: "2026-04-06", isActive: false },
    e4: { name: "备用策略2", dateStr: "2026-04-06", isActive: false },
    e5: { name: "备用策略1", dateStr: "2026-04-09", isActive: true },
    e6: { name: "削峰填谷 连续策略", dateStr: "2026-04-09", isActive: false },
    e7: { name: "削峰填谷 连续策略", dateStr: "2026-04-12", isActive: true },
    e8: { name: "系统维护", dateStr: "2026-04-13", isActive: true },
    e9: { name: "削峰填谷 连续策略", dateStr: "2026-04-14", isActive: true },
    e10: { name: "备用策略1", dateStr: "2026-04-14", isActive: false },
    e11: { name: "备用策略2", dateStr: "2026-04-14", isActive: false },
    e12: { name: "备用策略2", dateStr: "2026-04-10", isActive: false },
  };

  const currentStrategy =
    strategyData[selectedEventId as keyof typeof strategyData] ||
    strategyData.e2;

  const daysInMonth = 30; // April has 30 days
  const startDayOfWeek = 3; // April 1st, 2026 is Wed, which is index 3 (Sun=0, Mon=1, Tue=2, Wed=3... wait. Let's assume Mon=1, Tue=2, Wed=3)

  return (
    <div className="p-4 sm:p-6 h-full overflow-hidden bg-[#f8fafc] flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            策略排期
          </h1>
          <div className="flex items-center gap-2 border border-slate-200 bg-white rounded-lg px-3 py-1.5 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm font-bold outline-none text-slate-700 w-28 cursor-pointer"
            />
          </div>
        </div>
        <div>
          <button className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors">
            批量操作
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 min-h-0">
        {/* Left: Calendar View */}
        <div
          className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col h-full overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="grid grid-cols-7 gap-x-4 mb-4 shrink-0">
            {["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map(
              (day, i) => (
                <div
                  key={day}
                  className={`text-center text-[13px] font-bold ${i >= 5 ? "text-blue-500" : "text-slate-600"}`}
                >
                  {day}
                </div>
              ),
            )}
          </div>

          <div className="flex flex-col gap-4 min-w-[700px]">
            {/* Week 1 */}
            <div className="grid grid-cols-7 gap-x-4 relative">
              {/* Day numbers */}
              <div className="h-10 flex items-center px-2 text-sm font-bold text-slate-300">
                30
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-bold text-slate-300">
                31
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800">
                01
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800">
                02
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800">
                03
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800">
                04
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800">
                05
              </div>

              {/* Empty rows to align events */}
              <div className="col-span-7 grid grid-cols-7 gap-x-4 mt-2">
                <div className="col-span-2"></div>
                <EventPill
                  type="green"
                  span={3}
                  title="春季高效 V2.1 (04/01 - 04/03)"
                  isActive={false}
                  isSelected={selectedEventId === "e1"}
                  onClick={() => setSelectedEventId("e1")}
                />
              </div>

              {/* bg grid columns */}
              <div className="absolute inset-0 grid grid-cols-7 gap-x-4 pointer-events-none z-0">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border-2 border-transparent bg-slate-50/50 -mx-1 -my-2 h-[140px]"
                  ></div>
                ))}
              </div>
            </div>

            {/* Week 2 */}
            <div className="grid grid-cols-7 gap-x-4 relative group">
              {/* Backgrounds */}
              <div className="absolute inset-0 grid grid-cols-7 gap-x-4 pointer-events-none z-0 h-[160px]">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-[16px] h-full -mx-1 -my-2 transition-colors ${i === 0 ? "border-2 border-blue-500 bg-white shadow-[0_0_0_4px_rgba(59,130,246,0.1)]" : "bg-slate-50/50 border-2 border-transparent hover:border-slate-200"}`}
                  ></div>
                ))}
              </div>

              {/* Day numbers */}
              <div className="h-10 flex items-center justify-between px-2 z-10 w-full">
                <span className="text-sm font-black text-blue-600">06</span>
                <div className="px-1.5 py-0.5 rounded-full shadow-sm bg-blue-500 text-white text-[10px] font-bold leading-none flex items-center gap-1 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  运行中
                </div>
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                07
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                08
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                09
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                10
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                11
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                12
              </div>

              {/* Events Layer */}
              <div className="col-span-12 grid grid-cols-7 gap-x-4 mt-1 z-10">
                <EventPill
                  type="blue"
                  span={3}
                  title="削峰填谷 连续策略 (04/06 - 04/08)"
                  isActive={true}
                  isSelected={selectedEventId === "e2"}
                  onClick={() => setSelectedEventId("e2")}
                />
                <EventPill
                  type="orange"
                  span={3}
                  title="备用策略1 (04/09 - 04/11)"
                  isActive={true}
                  isSelected={selectedEventId === "e5"}
                  onClick={() => setSelectedEventId("e5")}
                />
                <EventPill
                  type="blue"
                  span={1}
                  title="削峰填谷 连续策略 (04/12)"
                  isActive={true}
                  isSelected={selectedEventId === "e7"}
                  onClick={() => setSelectedEventId("e7")}
                />
              </div>
              <div className="col-span-12 grid grid-cols-7 gap-x-4 z-10">
                <EventPill
                  type="orange"
                  span={3}
                  title="备用策略1"
                  isActive={false}
                  isSelected={selectedEventId === "e3"}
                  onClick={() => setSelectedEventId("e3")}
                />
                <EventPill
                  type="blue"
                  span={3}
                  title="削峰填谷 连续策略"
                  isActive={false}
                  isSelected={selectedEventId === "e6"}
                  onClick={() => setSelectedEventId("e6")}
                />
              </div>
              <div className="col-span-12 grid grid-cols-7 gap-x-4 z-10">
                <EventPill
                  type="orange"
                  span={3}
                  title="备用策略2"
                  isActive={false}
                  isSelected={selectedEventId === "e4"}
                  onClick={() => setSelectedEventId("e4")}
                />
                <div style={{ gridColumn: "span 1" }}></div>
                <EventPill
                  type="orange"
                  span={3}
                  title="备用策略2 (04/10 - 04/12)"
                  isActive={false}
                  isSelected={selectedEventId === "e12"}
                  onClick={() => setSelectedEventId("e12")}
                />
              </div>
            </div>

            {/* Week 3 */}
            <div className="grid grid-cols-7 gap-x-4 relative">
              <div className="absolute inset-0 grid grid-cols-7 gap-x-4 pointer-events-none z-0 h-[140px]">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border-2 border-transparent bg-slate-50/50 -mx-1 -my-2 h-full hover:border-slate-200 transition-colors"
                  ></div>
                ))}
              </div>

              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                13
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                14
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                15
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                16
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                17
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                18
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                19
              </div>

              <div className="col-span-12 grid grid-cols-7 gap-x-4 mt-1 z-10">
                <EventPill
                  type="gray"
                  span={1}
                  title="系统维护"
                  isActive={true}
                  isSelected={selectedEventId === "e8"}
                  onClick={() => setSelectedEventId("e8")}
                />
                <EventPill
                  type="blue"
                  span={2}
                  title="削峰填谷 连续策略 (04/14 - 04/15)"
                  isActive={true}
                  isSelected={selectedEventId === "e9"}
                  onClick={() => setSelectedEventId("e9")}
                />
              </div>
              <div className="col-span-12 grid grid-cols-7 gap-x-4 z-10">
                <div style={{ gridColumn: "span 1" }}></div>
                <EventPill
                  type="orange"
                  span={2}
                  title="备用策略1"
                  isActive={false}
                  isSelected={selectedEventId === "e10"}
                  onClick={() => setSelectedEventId("e10")}
                />
              </div>
              <div className="col-span-12 grid grid-cols-7 gap-x-4 z-10">
                <div style={{ gridColumn: "span 1" }}></div>
                <EventPill
                  type="orange"
                  span={2}
                  title="备用策略2"
                  isActive={false}
                  isSelected={selectedEventId === "e11"}
                  onClick={() => setSelectedEventId("e11")}
                />
              </div>
            </div>

            {/* Week 4 */}
            <div className="grid grid-cols-7 gap-x-4 relative">
              <div className="absolute inset-0 grid grid-cols-7 gap-x-4 pointer-events-none z-0 h-[140px]">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border-2 border-transparent bg-slate-50/50 -mx-1 -my-2 h-full hover:border-slate-200 transition-colors"
                  ></div>
                ))}
              </div>

              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                20
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                21
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                22
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                23
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                24
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                25
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                26
              </div>
            </div>

            {/* Week 5 */}
            <div className="grid grid-cols-7 gap-x-4 relative">
              <div className="absolute inset-0 grid grid-cols-7 gap-x-4 pointer-events-none z-0 h-[140px]">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border-2 border-transparent bg-slate-50/50 -mx-1 -my-2 h-full hover:border-slate-200 transition-colors"
                  ></div>
                ))}
              </div>

              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                27
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                28
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                29
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">
                30
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-bold text-slate-300 z-10">
                01
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-bold text-slate-300 z-10">
                02
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-bold text-slate-300 z-10">
                03
              </div>
            </div>
          </div>
        </div>

        {/* Right: Side Panel Configuration */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col h-full overflow-hidden">
          <div className="p-6 pb-4 border-b border-slate-100 shrink-0 flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-800">策略配置</h3>
            <div className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-bold rounded-lg tracking-tight">
              {currentStrategy.dateStr}
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto p-6"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Strategy Selector */}
            <div className="flex border-b border-slate-200 mb-8 max-w-full">
              <div className="pb-3 border-b-2 border-blue-600 flex items-center gap-2 cursor-pointer w-fit text-sm font-bold text-blue-600 relative z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                {currentStrategy.name}
              </div>
              <div className="pb-3 flex items-center gap-2 cursor-pointer ml-6 w-fit text-slate-400 hover:text-slate-600 transition-colors">
                <span className="text-lg leading-none">+</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <span className="text-[15px] font-bold text-slate-800">
                策略状态
              </span>
              <div className="flex items-center gap-3">
                {currentStrategy.isActive ? (
                  <>
                    <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-bold">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]"></div>
                      生效中
                    </div>
                    <div className="w-12 h-6 bg-[#10b981] rounded-full p-0.5 cursor-pointer flex justify-end shadow-inner transition-all">
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-[9px] font-black text-emerald-600">
                          ON
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 text-slate-400 text-sm font-bold">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                      未生效
                    </div>
                    <div className="w-12 h-6 bg-slate-200 rounded-full p-0.5 cursor-pointer flex justify-start shadow-inner transition-all">
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-[9px] font-black text-slate-400">
                          OFF
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Config Card */}
            <div
              className={`border border-slate-100 rounded-2xl p-5 shadow-sm mb-8 bg-white relative overflow-hidden transition-opacity ${currentStrategy.isActive ? "opacity-100" : "opacity-60"}`}
            >
              <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-[0.03]">
                <Calendar className="w-24 h-24 text-slate-900" />
              </div>
              <div className="flex justify-between items-center mb-5 border-b border-slate-100 border-dashed pb-5 relative z-10">
                <div className="flex items-center gap-3">
                  <span className="text-[15px] font-black text-slate-800">
                    时段3
                  </span>
                  <span className="text-emerald-500 font-bold text-[15px] tabular-nums tracking-tight">
                    10:00~15:00
                  </span>
                  {currentStrategy.isActive ? (
                    <span className="px-2.5 py-1 bg-emerald-500 shadow-sm text-white text-[10px] rounded-full font-bold">
                      正在生效
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-slate-200 text-slate-500 text-[10px] rounded-full font-bold">
                      未生效
                    </span>
                  )}
                </div>
                <button className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-1.5 rounded-full">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-10 text-sm relative z-10">
                <div className="text-slate-500 flex flex-col gap-1">
                  充电预留容量{" "}
                  <span className="text-lg font-black text-slate-800">
                    --{" "}
                    <span className="text-sm font-medium text-slate-400">
                      %
                    </span>
                  </span>
                </div>
                <div className="text-slate-500 flex flex-col gap-1">
                  放电预留容量{" "}
                  <span className="text-lg font-black text-slate-800">
                    0{" "}
                    <span className="text-sm font-medium text-slate-400">
                      %
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`space-y-8 relative transition-opacity ${currentStrategy.isActive ? "opacity-100" : "opacity-60"}`}
            >
              {/* Decorative line */}
              <div className="absolute left-[5px] top-[14px] bottom-0 w-[2px] border-l-2 border-dashed border-slate-100 -z-10"></div>

              {/* Strategy 1 */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4 bg-white">
                  <div className="bg-white p-1 -ml-1">
                    <span className="text-sm font-black text-slate-800">
                      策略1
                    </span>
                  </div>
                  <span className="px-2 py-0.5 border border-[#10b981] text-[#10b981] text-xs font-bold rounded flex items-center gap-1.5 bg-emerald-50/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></div>
                    全额消纳
                  </span>
                </div>
                <div className="text-sm text-slate-500 pl-16">
                  允许放电偏移量{" "}
                  <span className="font-bold text-slate-800 ml-2">40 kW</span>
                </div>
              </div>

              {/* Strategy 2 */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4 bg-white">
                  <div className="bg-white p-1 -ml-1">
                    <span className="text-sm font-black text-slate-800">
                      策略2
                    </span>
                  </div>
                  <span className="px-2 py-0.5 border border-[#3b82f6] text-[#3b82f6] text-xs font-bold rounded flex items-center gap-1.5 bg-blue-50/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></div>
                    峰谷套利
                  </span>
                </div>
                <div className="pl-16 w-full">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-100 text-left">
                        <th className="font-normal pb-3 w-1/3">适用时段</th>
                        <th className="font-normal pb-3 w-1/3">充放电模式</th>
                        <th className="font-normal pb-3 w-1/3">
                          充放电功率(kW)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-4 text-slate-800 font-medium tabular-nums tracking-tight">
                          10:00 ~ 15:00
                        </td>
                        <td className="py-4 text-slate-800 font-medium">
                          充电
                        </td>
                        <td className="py-4 text-slate-800 font-medium">50</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Strategy 3 */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4 bg-white">
                  <div className="bg-white p-1 -ml-1">
                    <span className="text-sm font-black text-slate-800">
                      策略3
                    </span>
                  </div>
                  <span className="px-2 py-0.5 border border-[#f59e0b] text-[#f59e0b] text-xs font-bold rounded flex items-center gap-1.5 bg-orange-50/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></div>
                    需量控制
                  </span>
                </div>
                <div className="text-sm text-slate-500 pl-16">
                  允许充电偏移量{" "}
                  <span className="font-bold text-slate-800 ml-2">50 kW</span>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-10 pt-8 border-t border-slate-100">
              <h4 className="text-[15px] font-black text-slate-800 mb-5">
                配置预览
              </h4>
              <div
                className="flex items-center overflow-x-auto pb-4 gap-0"
                style={{ scrollbarWidth: "none" }}
              >
                <div className="px-4 py-2 rounded-l-lg border border-slate-300 text-xs font-bold text-slate-700 bg-white shadow-sm shrink-0 z-10">
                  峰谷套利
                </div>
                <div className="w-8 h-[2px] bg-slate-300 shrink-0 -mx-1 z-0"></div>
                <div className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 bg-white shadow-sm shrink-0 z-10">
                  需量控制
                </div>
                <div className="w-8 h-[2px] bg-slate-300 shrink-0 -mx-1 z-0"></div>
                <div className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 bg-white shadow-sm shrink-0 z-10">
                  全额消纳
                </div>
                <div className="w-8 h-[2px] bg-slate-300 shrink-0 -mx-1 z-0"></div>
                <div className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 bg-white shadow-sm shrink-0 z-10">
                  全峰需
                </div>
                <div className="w-8 h-[2px] bg-slate-300 shrink-0 -mx-1 z-0"></div>
                <div className="px-2 py-2 rounded-full border border-slate-300 text-xs font-bold text-slate-700 bg-white shadow-sm shrink-0 z-10 flex items-center justify-center">
                  +2
                </div>
                <div className="w-8 h-[2px] bg-slate-300 shrink-0 -mx-1 z-0"></div>
                <div className="px-4 py-2 rounded-r-lg border border-slate-300 text-xs font-bold text-slate-700 bg-white shadow-sm shrink-0 z-10">
                  全峰需
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategySchedulePage2;
