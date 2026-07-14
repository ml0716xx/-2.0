import React, { useState } from "react";
import { 
  Calendar, ChevronDown, Clock, Plus, X, 
  History, Sparkles, Cpu, Bot, ChevronRight, Check 
} from "lucide-react";

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
  type: "blue" | "green" | "orange" | "gray" | "dashed-purple" | "dashed-blue" | "dashed-green" | "cyan" | "light-green" | "light-orange";
  tag?: string;
  isActive?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}) => {
  let bgClass = "";
  let textClass = "";
  let borderClass = "border-transparent";

  switch (type) {
    case "blue": // AI运行策略
      bgClass = "bg-indigo-50/95 border-indigo-200 text-indigo-700 font-black";
      textClass = "text-indigo-700";
      borderClass = "border-indigo-200";
      break;
    case "green": // AI策略测试
      bgClass = "bg-emerald-50/95 border-emerald-200 text-emerald-800 font-black";
      textClass = "text-emerald-800";
      borderClass = "border-emerald-200";
      break;
    case "light-green": // Other tests
      bgClass = "bg-emerald-50/60 border-emerald-200/80 text-emerald-700";
      textClass = "text-emerald-700";
      borderClass = "border-emerald-200/80";
      break;
    case "light-orange": // Other templates/tests
      bgClass = "bg-amber-50/80 border-amber-200 text-amber-700";
      textClass = "text-amber-700";
      borderClass = "border-amber-200";
      break;
    case "orange":
      bgClass = "bg-orange-50/80 border-orange-200 text-orange-700";
      textClass = "text-orange-700";
      borderClass = "border-orange-200";
      break;
    case "gray":
      bgClass = "bg-slate-50 border-slate-200 text-slate-600";
      textClass = "text-slate-600";
      borderClass = "border-slate-200";
      break;
    case "dashed-purple": // AI调度
      bgClass = "bg-teal-50/95 border-teal-200 text-teal-800 font-extrabold";
      textClass = "text-teal-800";
      borderClass = "border-teal-200 border-dashed";
      break;
    case "dashed-blue": // Temporary/Uncommitted
      bgClass = "bg-sky-50/80 border-sky-200 text-sky-700";
      textClass = "text-sky-700";
      borderClass = "border-sky-200 border-dashed";
      break;
    case "dashed-green": // Temporary 2
      bgClass = "bg-amber-50/90 border-amber-300 text-amber-800";
      textClass = "text-amber-800";
      borderClass = "border-amber-300 border-dashed";
      break;
    case "cyan": // Sunday strategy
      bgClass = "bg-violet-50 border-violet-200 text-violet-700 font-extrabold";
      textClass = "text-violet-700";
      borderClass = "border-violet-200";
      break;
  }

  const isAiSchedule = title.includes("AI调度") || title.includes("AI 调度");
  const isAiPlan = title.includes("AI运行") || title.includes("AI排程") || title.includes("AI策略") || title.includes("AI周日");

  let borderLeftStyle = "";
  let iconNode = null;

  if (isAiSchedule) {
    // AI 调度 -> Teal color + Bot/Cpu icon
    borderLeftStyle = "border-l-[4px] border-l-teal-500 rounded-l-none";
    iconNode = <Bot className="w-3.5 h-3.5 shrink-0 text-teal-600" />;
  } else if (isAiPlan) {
    // AI 排程 / 运行 -> Indigo color + Sparkles icon
    borderLeftStyle = "border-l-[4px] border-l-indigo-600 rounded-l-none";
    iconNode = <Sparkles className="w-3.5 h-3.5 shrink-0 text-indigo-600 animate-pulse" />;
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      className={`h-[30px] rounded-[6px] px-3 flex items-center shadow-sm cursor-pointer transition-all mb-2 ${bgClass} ${borderClass} border ${borderLeftStyle} ${
        !isActive ? "opacity-50 border border-current border-dashed" : ""
      } ${
        isSelected
          ? "ring-2 ring-indigo-600 ring-offset-2 z-10 relative scale-[1.01]"
          : "hover:opacity-90"
      }`}
      style={{
        gridColumn: `span ${span}`,
      }}
      title={title}
    >
      <div className="flex w-full items-center justify-between min-w-0">
        <div className="flex items-center gap-1.5 truncate">
          {!isActive && (
            <div className="w-1.5 h-1.5 rounded-full border border-current opacity-60"></div>
          )}
          {iconNode}
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
  const [selectedMonth, setSelectedMonth] = useState("2026-07");
  const [selectedEventId, setSelectedEventId] = useState("e_airun");
  const [configTab, setConfigTab] = useState<"ai-run" | "ai-schedule">("ai-run");
  const [isEffective, setIsEffective] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTimeStr, setSelectedTimeStr] = useState("2026-07-10 09:45");

  // Controlled collapse states for the time slots
  const [expandedSlots, setExpandedSlots] = useState<Record<string, boolean>>({
    slot1: false,
    slot2: false,
    slot3: true,
    slot4: false,
    slot5: false,
  });

  const toggleSlot = (slot: string) => {
    setExpandedSlots((prev) => ({
      ...prev,
      [slot]: !prev[slot],
    }));
  };

  const historyRecords = [
    "2026-07-10 09:45",
    "2026-07-10 09:30",
    "2026-07-10 09:15",
    "2026-07-10 09:00",
    "2026-07-10 08:45",
    "2026-07-10 08:30",
    "2026-07-10 08:15",
    "2026-07-10 08:00",
    "2026-07-10 07:45",
    "2026-07-10 07:30",
    "2026-07-10 07:15",
  ];

  const strategyData = {
    e_airun: { name: "AI运行策略", dateStr: "2026-07-10", isActive: true },
    e_aischedule: { name: "AI调度策略", dateStr: "2026-07-10", isActive: true },
    e_test1: { name: "AI策略测试1", dateStr: "2026-06-29", isActive: false },
    e_test2: { name: "AI策略测试2", dateStr: "2026-06-29", isActive: false },
    e_template6: { name: "六月策略模板", dateStr: "2026-06-29", isActive: false },
    e_temp0701: { name: "临时_0701", dateStr: "2026-07-01", isActive: false },
    e_template7: { name: "七月策略模板", dateStr: "2026-07-01", isActive: false },
    e_sunday: { name: "AI周日测试", dateStr: "2026-07-05", isActive: true },
    e_temp0709: { name: "临时_0709", dateStr: "2026-07-09", isActive: false },
  };

  const currentStrategy =
    strategyData[selectedEventId as keyof typeof strategyData] ||
    strategyData.e_airun;

  return (
    <div className="p-3 sm:p-4 h-full overflow-hidden bg-[#f8fafc] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 shrink-0 gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              策略排期
            </h1>
            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full text-xs font-black flex items-center gap-1 shadow-sm shadow-emerald-50 shrink-0">
              <Bot className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              AI 调度
            </span>
          </div>
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
          <button className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-100 transition-all">
            批量操作
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-4 min-h-0">
        {/* Left: Calendar View */}
        <div
          className="bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col h-full overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-x-4 mb-3 shrink-0">
            {["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map(
              (day, i) => (
                <div
                  key={day}
                  className={`text-center text-[13px] font-bold ${
                    i >= 5 ? "text-rose-500" : "text-slate-600"
                  }`}
                >
                  {day}
                </div>
              ),
            )}
          </div>

          <div className="flex flex-col gap-4 min-w-[750px]">
            {/* Week 1 (June 29 - July 05) */}
            <div className="grid grid-cols-7 gap-x-4 relative">
              {/* Day numbers */}
              <div className="h-10 flex items-center px-2 text-sm font-bold text-slate-300">29</div>
              <div className="h-10 flex items-center px-2 text-sm font-bold text-slate-300">30</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800">01</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800">02</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800">03</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800">04</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800">05</div>

              {/* Row 1 events */}
              <div className="col-span-7 grid grid-cols-7 gap-x-4 mt-1 z-10">
                <EventPill
                  type="light-green"
                  span={5}
                  title="AI策略测试1 连续策略(06/29-07/03)"
                  isActive={true}
                  isSelected={selectedEventId === "e_test1"}
                  onClick={() => setSelectedEventId("e_test1")}
                />
                <EventPill
                  type="dashed-blue"
                  span={2}
                  title="七月策略模板 (周六日固定)"
                  isActive={true}
                  isSelected={selectedEventId === "e_template7"}
                  onClick={() => setSelectedEventId("e_template7")}
                />
              </div>

              {/* Row 2 events */}
              <div className="col-span-7 grid grid-cols-7 gap-x-4 z-10">
                <EventPill
                  type="light-orange"
                  span={2}
                  title="AI策略测试2 连续策略(06/29-06/30)"
                  isActive={true}
                  isSelected={selectedEventId === "e_test2"}
                  onClick={() => setSelectedEventId("e_test2")}
                />
                <EventPill
                  type="dashed-blue"
                  span={1}
                  title="临时_0701"
                  isActive={true}
                  isSelected={selectedEventId === "e_temp0701"}
                  onClick={() => setSelectedEventId("e_temp0701")}
                />
                <div className="col-span-4"></div>
              </div>

              {/* Row 3 events */}
              <div className="col-span-7 grid grid-cols-7 gap-x-4 z-10">
                <EventPill
                  type="light-orange"
                  span={2}
                  title="六月策略模板 连续策略(06/29-06/30)"
                  isActive={true}
                  isSelected={selectedEventId === "e_template6"}
                  onClick={() => setSelectedEventId("e_template6")}
                />
                <EventPill
                  type="dashed-blue"
                  span={1}
                  title="七月策略模板"
                  isActive={true}
                  isSelected={selectedEventId === "e_template7"}
                  onClick={() => setSelectedEventId("e_template7")}
                />
                <div className="col-span-4"></div>
              </div>

              {/* backgrounds */}
              <div className="absolute inset-0 grid grid-cols-7 gap-x-4 pointer-events-none z-0">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border-2 border-transparent bg-slate-50/40 -mx-1 -my-2 h-[155px]"
                  ></div>
                ))}
              </div>
            </div>

            {/* Week 2 (July 06 - July 12) */}
            <div className="grid grid-cols-7 gap-x-4 relative group mt-2">
              {/* Day numbers */}
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">06</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">07</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">08</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">09</div>
              <div className="h-10 flex items-center justify-between px-2 z-10 w-full">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white font-black text-xs">10</span>
                <span className="text-[10px] font-bold text-emerald-600 px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 flex items-center gap-0.5 shadow-sm shadow-emerald-50 shrink-0">
                  <Bot className="w-2.5 h-2.5" /> 今日调度
                </span>
              </div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">11</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">12</div>

              {/* Row 1 events */}
              <div className="col-span-7 grid grid-cols-7 gap-x-4 mt-1 z-10">
                <EventPill
                  type="green"
                  span={1}
                  title="AI策略测试1"
                  isActive={true}
                  isSelected={selectedEventId === "e_test1"}
                  onClick={() => setSelectedEventId("e_test1")}
                />
                <EventPill
                  type="blue"
                  span={4}
                  title="AI运行策略 连续策略(07/07-07/10)"
                  isActive={true}
                  isSelected={selectedEventId === "e_airun"}
                  onClick={() => {
                    setSelectedEventId("e_airun");
                    setConfigTab("ai-run");
                  }}
                />
                <EventPill
                  type="dashed-blue"
                  span={2}
                  title="七月策略模板 (周六日固定)"
                  isActive={true}
                  isSelected={selectedEventId === "e_template7"}
                  onClick={() => setSelectedEventId("e_template7")}
                />
              </div>

              {/* Row 2 events */}
              <div className="col-span-7 grid grid-cols-7 gap-x-4 z-10">
                <div className="col-span-1"></div>
                <EventPill
                  type="dashed-purple"
                  span={2}
                  title="AI调度 连续策略(07/07-07/08)"
                  isActive={true}
                  isSelected={selectedEventId === "e_aischedule"}
                  onClick={() => {
                    setSelectedEventId("e_aischedule");
                    setConfigTab("ai-schedule");
                  }}
                />
                <EventPill
                  type="dashed-green"
                  span={1}
                  title="临时_0709"
                  isActive={true}
                  isSelected={selectedEventId === "e_temp0709"}
                  onClick={() => setSelectedEventId("e_temp0709")}
                />
                <EventPill
                  type="dashed-purple"
                  span={1}
                  title="AI调度 (07/10)"
                  isActive={true}
                  isSelected={selectedEventId === "e_aischedule"}
                  onClick={() => {
                    setSelectedEventId("e_aischedule");
                    setConfigTab("ai-schedule");
                  }}
                />
                <div className="col-span-2"></div>
              </div>

              {/* Row 3 events */}
              <div className="col-span-7 grid grid-cols-7 gap-x-4 z-10">
                <div className="col-span-2"></div>
                <EventPill
                  type="dashed-purple"
                  span={1}
                  title="AI调度"
                  isActive={true}
                  isSelected={selectedEventId === "e_aischedule"}
                  onClick={() => {
                    setSelectedEventId("e_aischedule");
                    setConfigTab("ai-schedule");
                  }}
                />
                <EventPill
                  type="dashed-purple"
                  span={1}
                  title="AI调度"
                  isActive={true}
                  isSelected={selectedEventId === "e_aischedule"}
                  onClick={() => {
                    setSelectedEventId("e_aischedule");
                    setConfigTab("ai-schedule");
                  }}
                />
                <div className="col-span-3"></div>
              </div>

              {/* backgrounds with highlight on Fri 10th */}
              <div className="absolute inset-0 grid grid-cols-7 gap-x-4 pointer-events-none z-0 h-[175px]">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-[16px] h-full -mx-1 -my-2 transition-colors ${
                      i === 4
                        ? "border-2 border-emerald-500 bg-emerald-50/10 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                        : "bg-slate-50/40 border-2 border-transparent hover:border-slate-200"
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Week 3 (July 13 - July 19) */}
            <div className="grid grid-cols-7 gap-x-4 relative mt-10">
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">13</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">14</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">15</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">16</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">17</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">18</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">19</div>

              {/* Row 1 events */}
              <div className="col-span-7 grid grid-cols-7 gap-x-4 mt-1 z-10">
                <EventPill
                  type="blue"
                  span={5}
                  title="AI运行策略 连续策略(07/13-07/17)"
                  isActive={true}
                  isSelected={selectedEventId === "e_airun"}
                  onClick={() => {
                    setSelectedEventId("e_airun");
                    setConfigTab("ai-run");
                  }}
                />
                <EventPill
                  type="dashed-blue"
                  span={2}
                  title="七月策略模板 (周六日固定)"
                  isActive={true}
                  isSelected={selectedEventId === "e_template7"}
                  onClick={() => setSelectedEventId("e_template7")}
                />
              </div>

              {/* Row 2 events */}
              <div className="col-span-7 grid grid-cols-7 gap-x-4 z-10">
                <EventPill
                  type="dashed-purple"
                  span={5}
                  title="AI调度 连续策略(07/13-07/17)"
                  isActive={true}
                  isSelected={selectedEventId === "e_aischedule"}
                  onClick={() => {
                    setSelectedEventId("e_aischedule");
                    setConfigTab("ai-schedule");
                  }}
                />
                <div className="col-span-2"></div>
              </div>

              {/* Row 3 events */}
              <div className="col-span-7 grid grid-cols-7 gap-x-4 z-10">
                <div className="col-span-7"></div>
              </div>

              <div className="absolute inset-0 grid grid-cols-7 gap-x-4 pointer-events-none z-0 h-[155px]">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border-2 border-transparent bg-slate-50/40 -mx-1 -my-2 h-full hover:border-slate-200 transition-colors"
                  ></div>
                ))}
              </div>
            </div>

            {/* Week 4 (July 20 - July 26) */}
            <div className="grid grid-cols-7 gap-x-4 relative mt-10">
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">20</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">21</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">22</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">23</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">24</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">25</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">26</div>

              {/* Row 1 events */}
              <div className="col-span-7 grid grid-cols-7 gap-x-4 mt-1 z-10">
                <EventPill
                  type="blue"
                  span={5}
                  title="AI运行策略 连续策略(07/20-07/24)"
                  isActive={true}
                  isSelected={selectedEventId === "e_airun"}
                  onClick={() => {
                    setSelectedEventId("e_airun");
                    setConfigTab("ai-run");
                  }}
                />
                <EventPill
                  type="dashed-blue"
                  span={2}
                  title="七月策略模板 (周六日固定)"
                  isActive={true}
                  isSelected={selectedEventId === "e_template7"}
                  onClick={() => setSelectedEventId("e_template7")}
                />
              </div>

              {/* Row 2 events */}
              <div className="col-span-7 grid grid-cols-7 gap-x-4 z-10">
                <EventPill
                  type="dashed-purple"
                  span={5}
                  title="AI调度 连续策略(07/20-07/24)"
                  isActive={true}
                  isSelected={selectedEventId === "e_aischedule"}
                  onClick={() => {
                    setSelectedEventId("e_aischedule");
                    setConfigTab("ai-schedule");
                  }}
                />
                <div className="col-span-2"></div>
              </div>

              {/* Row 3 events */}
              <div className="col-span-7 grid grid-cols-7 gap-x-4 z-10">
                <div className="col-span-7"></div>
              </div>

              <div className="absolute inset-0 grid grid-cols-7 gap-x-4 pointer-events-none z-0 h-[155px]">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border-2 border-transparent bg-slate-50/40 -mx-1 -my-2 h-full hover:border-slate-200 transition-colors"
                  ></div>
                ))}
              </div>
            </div>

            {/* Week 5 (July 27 - Aug 02) */}
            <div className="grid grid-cols-7 gap-x-4 relative mt-10">
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">27</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">28</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">29</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">30</div>
              <div className="h-10 flex items-center px-2 text-sm font-black text-slate-800 z-10">31</div>
              <div className="h-10 flex items-center px-2 text-sm font-bold text-slate-300 z-10">01</div>
              <div className="h-10 flex items-center px-2 text-sm font-bold text-slate-300 z-10">02</div>

              {/* Row 1 events */}
              <div className="col-span-7 grid grid-cols-7 gap-x-4 mt-1 z-10">
                <EventPill
                  type="blue"
                  span={5}
                  title="AI运行策略 连续策略(07/27-07/31)"
                  isActive={true}
                  isSelected={selectedEventId === "e_airun"}
                  onClick={() => {
                    setSelectedEventId("e_airun");
                    setConfigTab("ai-run");
                  }}
                />
                <EventPill
                  type="dashed-blue"
                  span={2}
                  title="七月策略模板 (周六日固定)"
                  isActive={true}
                  isSelected={selectedEventId === "e_template7"}
                  onClick={() => setSelectedEventId("e_template7")}
                />
              </div>

              {/* Row 2 events */}
              <div className="col-span-7 grid grid-cols-7 gap-x-4 z-10">
                <EventPill
                  type="dashed-purple"
                  span={5}
                  title="AI调度 连续策略(07/27-07/31)"
                  isActive={true}
                  isSelected={selectedEventId === "e_aischedule"}
                  onClick={() => {
                    setSelectedEventId("e_aischedule");
                    setConfigTab("ai-schedule");
                  }}
                />
                <div className="col-span-2"></div>
              </div>

              <div className="absolute inset-0 grid grid-cols-7 gap-x-4 pointer-events-none z-0 h-[140px]">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border-2 border-transparent bg-slate-50/40 -mx-1 -my-2 h-full hover:border-slate-200 transition-colors"
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* 策略来源标注 Bottom Legend */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs font-black text-slate-500 shrink-0">
            <span className="text-slate-400">策略来源标注：</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100/50 rounded-lg text-indigo-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span>AI 排程 (运行策略)</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100/50 rounded-lg text-emerald-700">
              <Bot className="w-3.5 h-3.5 text-emerald-500" />
              <span>AI 调度 (实时算法)</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200/50 rounded-lg text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <span>自定义/固定策略</span>
            </div>
          </div>
        </div>

        {/* Right: Side Panel Configuration with internal overlay history panel */}
        <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col h-full overflow-hidden relative">
          
          {/* Main Config Sidebar Header */}
          <div className="p-4 pb-3 border-b border-slate-100 shrink-0 flex justify-between items-center">
            <h3 className="text-base font-black text-slate-800">
              策略配置
            </h3>
            <div className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg tracking-tight">
              2026-07-10
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto p-4"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Strategy Selector Tabs */}
            <div className="flex border-b border-slate-150 mb-6 items-center">
              <button
                onClick={() => setConfigTab("ai-run")}
                className={`pb-3 flex items-center gap-1.5 cursor-pointer text-sm font-black transition-all border-b-2 relative ${
                  configTab === "ai-run"
                    ? "border-emerald-500 text-slate-800"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                AI运行策略
              </button>
              <button
                onClick={() => setConfigTab("ai-schedule")}
                className={`pb-3 flex items-center gap-1.5 cursor-pointer text-sm font-black transition-all border-b-2 ml-6 ${
                  configTab === "ai-schedule"
                    ? "border-emerald-500 text-slate-800"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                AI调度
              </button>
              <div className="ml-auto pb-3 flex items-center">
                <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                  <Plus className="w-3.5 h-3.5 font-bold" />
                </button>
              </div>
            </div>

            {/* 策略状态 Section */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-black text-slate-800">
                策略状态
              </span>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  生效中
                </span>
                <button 
                  onClick={() => setIsEffective(!isEffective)}
                  className={`w-12 h-6 rounded-full p-0.5 cursor-pointer transition-all ${
                    isEffective ? "bg-emerald-500 flex justify-end" : "bg-slate-200 flex justify-start"
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-[9px] font-black text-emerald-600">
                      ON
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* AI elements inside AI schedule details (Only if in ai-schedule tab) */}
            {configTab === "ai-schedule" && (
              <div className="mb-6 p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 flex items-center justify-between shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 relative shrink-0">
                    <Bot className="w-5 h-5 animate-bounce" />
                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">AI 智能调度算法</h4>
                    <p className="text-[10px] font-bold text-emerald-600 mt-0.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      算法正在实时运行中
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black tracking-wide flex items-center gap-1 shadow-sm">
                    已使能
                  </span>
                </div>
              </div>
            )}

            {/* Time Slot Configurations */}
            <div className="space-y-4">
              {configTab === "ai-run" ? (
                <>
                  {/* Slot 1 */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
                    <button
                      onClick={() => toggleSlot("slot1")}
                      className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400">时段1</span>
                        <span className="text-sm font-black text-slate-700 font-mono">00:00~04:00</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedSlots.slot1 ? "rotate-180" : ""}`} />
                    </button>
                    {expandedSlots.slot1 && (
                      <div className="p-4 space-y-2 animate-in fade-in duration-200 text-xs text-slate-500 font-bold">
                        <div>充电预留容量: <span className="text-slate-800 font-black">20%</span></div>
                        <div>放电预留容量: <span className="text-slate-800 font-black">5%</span></div>
                      </div>
                    )}
                  </div>

                  {/* Slot 2 */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
                    <button
                      onClick={() => toggleSlot("slot2")}
                      className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400">时段2</span>
                        <span className="text-sm font-black text-slate-700 font-mono">04:00~06:00</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedSlots.slot2 ? "rotate-180" : ""}`} />
                    </button>
                    {expandedSlots.slot2 && (
                      <div className="p-4 space-y-2 animate-in fade-in duration-200 text-xs text-slate-500 font-bold">
                        <div>充电预留容量: <span className="text-slate-800 font-black">10%</span></div>
                        <div>放电预留容量: <span className="text-slate-800 font-black">10%</span></div>
                      </div>
                    )}
                  </div>

                  {/* Slot 3 - The Active One Matching Screenshot Layout */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
                    <button
                      onClick={() => toggleSlot("slot3")}
                      className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400">时段3</span>
                        <span className="text-sm font-black text-slate-700 font-mono">06:00~11:00</span>
                        <span className="ml-2 px-2 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-black leading-none uppercase">
                          正在生效
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedSlots.slot3 ? "rotate-180" : ""}`} />
                    </button>
                    
                    {expandedSlots.slot3 && (
                      <div className="p-4 space-y-4 animate-in fade-in duration-200">
                        {/* Parameter Grid */}
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-bold text-slate-500">
                          <div>
                            充电预留容量 <span className="text-slate-800 font-black ml-1">-- %</span>
                          </div>
                          <div>
                            放电预留容量 <span className="text-slate-800 font-black ml-1">50 %</span>
                          </div>
                          <div className="col-span-2">
                            可逆流阈值 <span className="text-slate-800 font-black ml-1">-10 kW</span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-dashed border-slate-200 my-2"></div>

                        {/* AI Active Running Section Banner Box */}
                        <div className="border border-blue-100 rounded-xl overflow-hidden shadow-sm">
                          {/* Banner Header */}
                          <div className="bg-[#4f46e5] text-white px-3 py-2 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-white shrink-0">
                              <Cpu className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-[11px] font-black tracking-wide">AI 智能算法排程进行中...</span>
                          </div>

                          {/* Banner Content (15min periods) */}
                          <div className="p-3 bg-white space-y-3.5 text-xs">
                            {/* Sub 1 */}
                            <div className="space-y-1">
                              <div className="font-mono font-black text-slate-700">06:00~06:15</div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-black text-slate-400">策略1</span>
                                  <span className="px-1.5 py-0.5 border border-blue-200 bg-blue-50/50 text-blue-600 text-[9px] font-black rounded">
                                    峰谷套利
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px]">
                                  <span className="text-slate-400 font-bold">放电</span>
                                  <span className="font-black text-slate-800 font-mono">93.17 kW</span>
                                </div>
                              </div>
                            </div>

                            <div className="border-t border-dashed border-slate-100"></div>

                            {/* Sub 2 */}
                            <div className="space-y-1">
                              <div className="font-mono font-black text-slate-700">06:15~06:30</div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-black text-slate-400">策略1</span>
                                  <span className="px-1.5 py-0.5 border border-blue-200 bg-blue-50/50 text-blue-600 text-[9px] font-black rounded">
                                    峰谷套利
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px]">
                                  <span className="text-slate-400 font-bold">放电</span>
                                  <span className="font-black text-slate-800 font-mono">76.86 kW</span>
                                </div>
                              </div>
                            </div>

                            <div className="border-t border-dashed border-slate-100"></div>

                            {/* Sub 3 */}
                            <div className="space-y-1">
                              <div className="font-mono font-black text-slate-700">06:30~06:45</div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-black text-slate-400">策略1</span>
                                  <span className="px-1.5 py-0.5 border border-blue-200 bg-blue-50/50 text-blue-600 text-[9px] font-black rounded">
                                    峰谷套利
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px]">
                                  <span className="text-slate-400 font-bold">放电</span>
                                  <span className="font-black text-slate-800 font-mono">175.34 kW</span>
                                </div>
                              </div>
                            </div>

                            <div className="border-t border-dashed border-slate-100"></div>

                            {/* Sub 4 */}
                            <div className="space-y-1">
                              <div className="font-mono font-black text-slate-700">06:45~07:00</div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-black text-slate-400">策略1</span>
                                  <span className="px-1.5 py-0.5 border border-blue-200 bg-blue-50/50 text-blue-600 text-[9px] font-black rounded">
                                    峰谷套利
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px]">
                                  <span className="text-slate-400 font-bold">放电</span>
                                  <span className="font-black text-slate-800 font-mono">181.25 kW</span>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Slot 4 */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
                    <button
                      onClick={() => toggleSlot("slot4")}
                      className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400">时段4</span>
                        <span className="text-sm font-black text-slate-700 font-mono">11:00~18:00</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedSlots.slot4 ? "rotate-180" : ""}`} />
                    </button>
                    {expandedSlots.slot4 && (
                      <div className="p-4 space-y-2 animate-in fade-in duration-200 text-xs text-slate-500 font-bold">
                        <div>主要策略: <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 font-black rounded">全额消纳</span></div>
                        <div>放电预留: <span className="text-slate-800 font-black">20%</span></div>
                      </div>
                    )}
                  </div>

                  {/* Slot 5 */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
                    <button
                      onClick={() => toggleSlot("slot5")}
                      className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400">时段5</span>
                        <span className="text-sm font-black text-slate-700 font-mono">18:00~24:00</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedSlots.slot5 ? "rotate-180" : ""}`} />
                    </button>
                    {expandedSlots.slot5 && (
                      <div className="p-4 space-y-2 animate-in fade-in duration-200 text-xs text-slate-500 font-bold">
                        <div>主要策略: <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 font-black rounded">峰谷套利</span></div>
                        <div>充电预留: <span className="text-slate-800 font-black">30%</span></div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Slot 1 for ai-schedule */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
                    <button
                      onClick={() => toggleSlot("slot1")}
                      className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400">时段1</span>
                        <span className="text-sm font-black text-slate-700 font-mono">12:00~14:00</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedSlots.slot1 ? "rotate-180" : ""}`} />
                    </button>
                    {expandedSlots.slot1 && (
                      <div className="p-4 space-y-2 animate-in fade-in duration-200 text-xs text-slate-500 font-bold">
                        <div>调度机制: <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 font-black rounded">动态增容</span></div>
                        <div>允许充电偏移量: <span className="text-slate-800 font-black">49 kW</span></div>
                      </div>
                    )}
                  </div>

                  {/* Slot 2 for ai-schedule */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
                    <button
                      onClick={() => toggleSlot("slot2")}
                      className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400">时段2</span>
                        <span className="text-sm font-black text-slate-700 font-mono">14:00~16:00</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedSlots.slot2 ? "rotate-180" : ""}`} />
                    </button>
                    {expandedSlots.slot2 && (
                      <div className="p-4 space-y-2 animate-in fade-in duration-200 text-xs text-slate-500 font-bold">
                        <div>调度机制: <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 font-black rounded">峰谷套利</span></div>
                        <div>允许放电偏移量: <span className="text-slate-800 font-black">30 kW</span></div>
                      </div>
                    )}
                  </div>

                  {/* Slot 3 for ai-schedule */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
                    <button
                      onClick={() => toggleSlot("slot3")}
                      className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400">时段3</span>
                        <span className="text-sm font-black text-slate-700 font-mono">16:00~18:00</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedSlots.slot3 ? "rotate-180" : ""}`} />
                    </button>
                    {expandedSlots.slot3 && (
                      <div className="p-4 space-y-2 animate-in fade-in duration-200 text-xs text-slate-500 font-bold">
                        <div>调度机制: <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 font-black rounded">动态增容</span></div>
                        <div>安全预留偏移: <span className="text-slate-800 font-black">15 kW</span></div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Preview Timeline - Matching Screenshot with custom circles and segmented timebar */}
            <div className="mt-8 pt-6 border-t border-slate-100 shrink-0">
              <h4 className="text-xs font-black text-slate-500 mb-3 uppercase tracking-wider">
                配置预览
              </h4>
              <div className="bg-[#f8fafc] border border-slate-200/80 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  {/* Left Pill Badges */}
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-black text-slate-600 bg-white border border-slate-200 rounded-md shadow-sm">
                      峰谷套利
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-black text-slate-600 bg-white border border-slate-200 rounded-md shadow-sm">
                      需量控制
                    </span>
                  </div>

                  {/* Right circular tags */}
                  <div className="flex items-center gap-1 border border-slate-200/60 bg-white rounded-full p-0.5 shadow-xs">
                    <span className="w-5 h-5 rounded-full bg-slate-50 text-slate-500 text-[9px] font-black flex items-center justify-center border border-slate-200/40">
                      峰
                    </span>
                    <span className="w-5 h-5 rounded-full bg-slate-50 text-slate-500 text-[9px] font-black flex items-center justify-center border border-slate-200/40">
                      余
                    </span>
                    <span className="w-5 h-5 rounded-full bg-slate-50 text-slate-500 text-[9px] font-black flex items-center justify-center border border-slate-200/40">
                      需
                    </span>
                  </div>
                </div>

                {/* Simulated Segmented Timebar */}
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden flex">
                  <div className="w-[15%] h-full bg-indigo-500" title="峰谷套利"></div>
                  <div className="w-[10%] h-full bg-amber-500" title="需量控制"></div>
                  <div className="w-[20%] h-full bg-emerald-500" title="全额消纳"></div>
                  <div className="w-[25%] h-full bg-indigo-500" title="峰谷套利"></div>
                  <div className="w-[10%] h-full bg-amber-500" title="需量控制"></div>
                  <div className="w-[20%] h-full bg-slate-300" title="闲置"></div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 font-bold px-0.5">
                  <span>00:00</span>
                  <span>00:00</span>
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
