import React, { useState } from "react";
import {
  ArrowLeft, Plus, Trash2, Check, AlertCircle,
  ChevronDown, Layers, CalendarDays,
  Zap, Settings2, Lock, Play,
  RotateCcw, CheckCircle2, Info, Sparkles
} from "lucide-react";
import {
  MonthlyStrategyDayConfig,
  StrategyPeriodItem,
  StrategyTemplate,
  PRESET_TEMPLATES,
  JULY_WEATHER_MAPPING,
} from "./StrategySimulationConfigPage";

export interface StrategyRunConfigPageProps {
  onBack: () => void;
  onSaveAndSimulate: (monthlySchedule: Record<number, MonthlyStrategyDayConfig>) => void;
  initialMonth?: string;
  userAiStatus?: "activated" | "not_activated";
}

/** 应用范围类型：当月全部 / 自定义日期（工作日·非工作日由自定义日期的快捷键实现） */
type ScopeType = "all" | "custom";

interface ScopeStrategyItem {
  id: string;
  name: string;
  sourceType: "template" | "manual";
  templateId: string;
  manualPeriods: StrategyPeriodItem[];
  scopeType: ScopeType;
  customDates: number[];
}

/** 2026-07 月历：7月1日为周三（与报告页周末口径一致：4/5/11/12/18/19/25/26为周末） */
const WEEKDAY_LABELS = ["周三", "周四", "周五", "周六", "周日", "周一", "周二"];
const WEEKDAY_SHORT = ["三", "四", "五", "六", "日", "一", "二"];
const DAYS_IN_MONTH = 31;

/** 当月法定节假日（含调休，将计入"非工作日"；2026年7月无法定节假日） */
const MONTH_HOLIDAYS: number[] = [];

const weekdayOf = (d: number) => WEEKDAY_LABELS[(d - 1) % 7];
const isWeekendOf = (d: number) => weekdayOf(d) === "周六" || weekdayOf(d) === "周日";
/** 非工作日 = 周末 + 法定节假日 */
const isNonWorkdayOf = (d: number) => isWeekendOf(d) || MONTH_HOLIDAYS.includes(d);

const SCOPE_META: Record<ScopeType, { label: string; desc: string; chip: string; activeChip: string }> = {
  all: { label: "当月全部", desc: "策略作用于本月每一天（仅可存在一条）", chip: "border-slate-200 text-slate-600 hover:border-slate-300", activeChip: "border-slate-800 bg-slate-800 text-white" },
  custom: { label: "自定义日期", desc: "手动勾选日期，可用快捷键一键选工作日/非工作日", chip: "border-emerald-200 text-emerald-700 hover:border-emerald-300", activeChip: "border-emerald-600 bg-emerald-600 text-white" },
};

/** 范围精确度：自定义日期 > 当月全部 */
const scopeRank = (s: ScopeType): number => (s === "custom" ? 2 : 1);

/** 计算一条策略覆盖的具体日期列表 */
const datesCoveredBy = (item: ScopeStrategyItem): number[] => {
  const days: number[] = [];
  for (let d = 1; d <= DAYS_IN_MONTH; d++) {
    const hit = item.scopeType === "all" ? true : item.customDates.includes(d);
    if (hit) days.push(d);
  }
  return days;
};

const EMPTY_MANUAL_PERIODS: () => StrategyPeriodItem[] = () => [
  {
    id: `mp_${Date.now()}_1`,
    title: "计划时段1",
    timeRange: "00:00~07:00",
    chargeReserve: "95 %",
    dischargeReserve: "--",
    subStrategies: [
      {
        id: `ms_${Date.now()}_1_1`,
        name: "峰谷套利",
        type: "arbitrage",
        badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
        timeRange: "00:00 ~ 07:00",
        mode: "充电",
        power: "300",
      },
    ],
  },
  {
    id: `mp_${Date.now()}_2`,
    title: "计划时段2",
    timeRange: "18:00~22:00",
    chargeReserve: "--",
    dischargeReserve: "95 %",
    subStrategies: [
      {
        id: `ms_${Date.now()}_2_1`,
        name: "峰谷套利",
        type: "arbitrage",
        badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
        timeRange: "18:00 ~ 22:00",
        mode: "放电",
        power: "300",
      },
    ],
  },
];

const clonePeriods = (periods: StrategyPeriodItem[]): StrategyPeriodItem[] =>
  JSON.parse(JSON.stringify(periods));

const StrategyRunConfigPage: React.FC<StrategyRunConfigPageProps> = ({
  onBack,
  onSaveAndSimulate,
  initialMonth = "2026-07",
}) => {
  const monthLabel = initialMonth.split("-")[1] ? `${initialMonth.split("-")[1]}月` : initialMonth;
  const fullMonthLabel = `${initialMonth} · ${monthLabel}`;

  // 默认预置一条：七八月休息日模版 · 当月全部（保持与既有默认行为一致）
  const defaultItem = (): ScopeStrategyItem => ({
    id: `sl_${Date.now()}`,
    name: "七八月休息日模版",
    sourceType: "template",
    templateId: "tpl_weekend_july_aug",
    manualPeriods: [],
    scopeType: "all",
    customDates: [],
  });

  const [strategyList, setStrategyList] = useState<ScopeStrategyItem[]>([defaultItem()]);
  const [selectedId, setSelectedId] = useState<string>(strategyList[0]?.id || "");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  /** 日期冲突确认弹窗（保存/开始模拟时提醒替换） */
  const [confirmBox, setConfirmBox] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  /** 已保存快照：id -> 上次保存的策略内容（用于判断未保存修改 & 取消回滚） */
  const [savedSnapshots, setSavedSnapshots] = useState<Record<string, ScopeStrategyItem>>(() => {
    const first = strategyList[0];
    return first ? { [first.id]: first } : {};
  });

  const isDirty = (item: ScopeStrategyItem): boolean => {
    const snap = savedSnapshots[item.id];
    return !snap || JSON.stringify(snap) !== JSON.stringify(item);
  };
  const dirtyCount = strategyList.filter(isDirty).length;

  const selected = strategyList.find((it) => it.id === selectedId) || null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const updateItem = (id: string, patch: Partial<ScopeStrategyItem>) => {
    setStrategyList((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const removeItem = (id: string) => {
    if (strategyList.length <= 1) {
      setStrategyList([]);
      setSelectedId("");
      setSavedSnapshots({});
      showToast("策略列表已清空，本月将按「无策略」基准模拟");
      return;
    }
    const idx = strategyList.findIndex((it) => it.id === id);
    setStrategyList((prev) => prev.filter((it) => it.id !== id));
    setSavedSnapshots((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    if (selectedId === id) {
      const next = strategyList[idx + 1] || strategyList[idx - 1];
      setSelectedId(next?.id || "");
    }
    showToast("已删除该模拟策略");
  };

  /** 单条保存前检查日期冲突：返回与其它自定义策略重叠的日期 → 占用策略名 */
  const conflictsOf = (id: string): { dates: number[]; byName: Record<number, string> } => {
    const cur = strategyList.find((it) => it.id === id);
    const dates: number[] = [];
    const byName: Record<number, string> = {};
    if (!cur || cur.scopeType !== "custom") return { dates, byName };
    const map = occupiedByOther(id);
    cur.customDates.forEach((d) => {
      if (map[d]) {
        dates.push(d);
        byName[d] = map[d];
      }
    });
    return { dates, byName };
  };

  /** 全列表冲突统计：day -> 选择该日的自定义策略（按列表顺序），≥2 即重叠 */
  const dayChoosers = (): Record<number, ScopeStrategyItem[]> => {
    const map: Record<number, ScopeStrategyItem[]> = {};
    strategyList.forEach((it) => {
      if (it.scopeType !== "custom") return;
      it.customDates.forEach((d) => {
        (map[d] = map[d] || []).push(it);
      });
    });
    return map;
  };

  /** 冲突归一（纯函数）：重叠日期仅保留列表中靠后的策略，其余移除；返回新列表 */
  const resolveConflicts = (list: ScopeStrategyItem[]): ScopeStrategyItem[] => {
    const choosers: Record<number, ScopeStrategyItem[]> = {};
    list.forEach((it) => {
      if (it.scopeType !== "custom") return;
      it.customDates.forEach((d) => {
        (choosers[d] = choosers[d] || []).push(it);
      });
    });
    const dropByStrategy = new Map<string, Set<number>>();
    Object.entries(choosers).forEach(([day, arr]) => {
      if (arr.length < 2) return;
      const winner = arr[arr.length - 1]; // 靠后生效
      arr.forEach((it) => {
        if (it.id === winner.id) return;
        const d = Number(day);
        if (!dropByStrategy.has(it.id)) dropByStrategy.set(it.id, new Set());
        dropByStrategy.get(it.id)!.add(d);
      });
    });
    if (dropByStrategy.size === 0) return list;
    return list.map((it) => {
      const drop = dropByStrategy.get(it.id);
      if (!drop) return it;
      return { ...it, customDates: it.customDates.filter((d) => !drop.has(d)) };
    });
  };

  /** 保存单条策略：若有日期冲突先弹窗确认，确认后替换占用并固化快照 */
  const saveItem = (id: string) => {
    const cur = strategyList.find((it) => it.id === id);
    if (!cur) return;
    const { dates, byName } = conflictsOf(id);
    if (dates.length > 0) {
      setConfirmBox({
        title: "日期冲突提醒",
        message: `「${cur.name || "未命名策略"}」选中的 ${dates.length} 个日期当前由其它策略应用（如「${byName[dates[0]]}」）。保存后这些日期将改由本策略应用，并从原策略中移除。是否继续？`,
        onConfirm: () => {
          const set = new Set(dates);
          const nextList = strategyList.map((it) =>
            it.scopeType === "custom" && it.id !== id && it.customDates.some((d) => set.has(d))
              ? { ...it, customDates: it.customDates.filter((d) => !set.has(d)) }
              : it
          );
          setStrategyList(nextList);
          const nextSnaps: Record<string, ScopeStrategyItem> = {};
          nextList.forEach((it) => { nextSnaps[it.id] = JSON.parse(JSON.stringify(it)); });
          setSavedSnapshots(nextSnaps);
          showToast(`已保存，${dates.length} 个冲突日期已改由本策略应用`);
        },
      });
      return;
    }
    setSavedSnapshots((prev) => ({ ...prev, [id]: JSON.parse(JSON.stringify(cur)) }));
    showToast(`策略「${cur.name || "未命名"}」已保存`);
  };

  /** 开始模拟前：若存在日期冲突先弹窗确认，确认后按「靠后生效」归一再编译 */
  const handleSave = () => {
    const choosers = dayChoosers();
    const overlapDays = Object.entries(choosers).filter(([, arr]) => arr.length >= 2);
    if (overlapDays.length > 0) {
      const involved = new Set<string>();
      overlapDays.forEach(([, arr]) => arr.forEach((it) => involved.add(it.name || "未命名策略")));
      setConfirmBox({
        title: "日期冲突提醒",
        message: `检测到 ${overlapDays.length} 个日期被多条策略同时应用（涉及「${[...involved].slice(0, 2).join("」「")}」等 ${involved.size} 条策略）。开始模拟后，重叠日期将按「同范围靠后生效」原则由列表中靠后的策略应用，并自动从原策略中移除。是否继续？`,
        onConfirm: () => {
          const resolved = resolveConflicts(strategyList);
          setStrategyList(resolved);
          const nextSnaps: Record<string, ScopeStrategyItem> = {};
          resolved.forEach((it) => { nextSnaps[it.id] = JSON.parse(JSON.stringify(it)); });
          setSavedSnapshots(nextSnaps);
          const schedule = compileMonthSchedule(resolved);
          onSaveAndSimulate(schedule);
          showToast("已开始模拟");
        },
      });
      return;
    }
    const schedule = compileMonthSchedule();
    onSaveAndSimulate(schedule);
  };

  /** 取消单条策略的未保存修改：回滚到上次保存；从未保存过的新策略则删除 */
  const revertItem = (id: string) => {
    const snap = savedSnapshots[id];
    if (!snap) {
      removeItem(id);
      return;
    }
    setStrategyList((prev) => prev.map((it) => (it.id === id ? JSON.parse(JSON.stringify(snap)) : it)));
    showToast("已放弃未保存的修改");
  };

  /** 新增一条空白策略并直接打开右侧详情，来源/范围在详情里配置 */
  const addBlankStrategy = () => {
    const item: ScopeStrategyItem = {
      id: `sl_${Date.now()}`,
      name: "未配置策略",
      sourceType: "template",
      templateId: "tpl_weekend_july_aug",
      manualPeriods: [],
      scopeType: "custom",
      customDates: [],
    };
    setStrategyList((prev) => [...prev, item]);
    setSelectedId(item.id);
    showToast("已新增策略，请在右侧选择已有模版或切换为手动自定义");
  };

  // ---------- 编译：把「策略 + 应用范围」逐日展开为整月排程 ----------
  const compileMonthSchedule = (list: ScopeStrategyItem[] = strategyList): Record<number, MonthlyStrategyDayConfig> => {
    const schedule: Record<number, MonthlyStrategyDayConfig> = {};
    for (let day = 1; day <= DAYS_IN_MONTH; day++) {
      // 范围精确优先；同范围时列表中靠后的生效（后加覆盖先加）
      let best: ScopeStrategyItem | null = null;
      let bestRank = -1;
      list.forEach((item) => {
        if (datesCoveredBy(item).includes(day)) {
          const r = scopeRank(item.scopeType);
          if (r > bestRank || (r === bestRank && item !== best)) {
            best = item;
            bestRank = r;
          }
        }
      });

      let mode: "template" | "custom" = "template";
      let templateId = "tpl_none";
      let templateName = "无策略（未配置）";
      let customPeriods: StrategyPeriodItem[] = [];

      if (best) {
        if (best.sourceType === "manual") {
          mode = "custom";
          templateId = "tpl_manual_custom";
          templateName = best.name;
          customPeriods = best.manualPeriods;
        } else {
          const tpl = PRESET_TEMPLATES.find((t) => t.id === best.templateId) || PRESET_TEMPLATES[PRESET_TEMPLATES.length - 1];
          templateId = tpl.id;
          templateName = best.name || tpl.name;
          customPeriods = tpl.periods;
          if (tpl.id === "tpl_none") {
            mode = "template";
          }
        }
      }

      const weatherInfo = JULY_WEATHER_MAPPING[day] || { weather: "sunny" as const, label: "晴" };
      schedule[day] = {
        day: `${day}日`,
        dayNum: day,
        weekday: weekdayOf(day),
        isWeekend: isWeekendOf(day),
        hasAiRunning: false,
        mode,
        templateId,
        templateName,
        weatherType: weatherInfo.weather,
        customPeriods,
      };
    }
    return schedule;
  };

  // 覆盖统计：union 已覆盖天数
  const coveredSet = new Set<number>();
  strategyList.forEach((it) => datesCoveredBy(it).forEach((d) => coveredSet.add(d)));

  // ---------- 右侧当前策略详情 ----------
  const displayedTpl = selected
    ? PRESET_TEMPLATES.find((t) => t.id === selected.templateId) || null
    : null;
  const displayedPeriods: StrategyPeriodItem[] = selected
    ? selected.sourceType === "manual"
      ? selected.manualPeriods
      : displayedTpl?.periods || []
    : [];
  const isManualMode = selected?.sourceType === "manual";

  /** 切换应用范围；「当月全部」仅允许一条，重复选择时拦截 */
  const setScope = (id: string, st: ScopeType) => {
    if (st === "all") {
      const taken = strategyList.some((it) => it.id !== id && it.scopeType === "all");
      if (taken) {
        showToast("「当月全部」仅可存在一条，请先将已有策略改为自定义日期");
        return;
      }
    }
    updateItem(id, { scopeType: st });
  };

  /** 其它「自定义日期」策略已占用的日期 → day -> 策略名 */
  const occupiedByOther = (id: string): Record<number, string> => {
    const map: Record<number, string> = {};
    strategyList.forEach((it) => {
      if (it.id === id || it.scopeType !== "custom") return;
      it.customDates.forEach((d) => {
        if (!map[d]) map[d] = it.name || "未命名策略";
      });
    });
    return map;
  };

  /** 当前编辑策略视角下，被其它自定义日期策略占用的日期 */
  const occupiedMap = selected ? occupiedByOther(selected.id) : {};
  const toggleCustomDate = (d: number) => {
    if (!selected) return;
    const has = selected.customDates.includes(d);
    // 被其它自定义策略占用的日期允许选中，保存时提醒替换
    if (!has && occupiedMap[d]) {
      showToast(`该日期当前由「${occupiedMap[d]}」应用，保存后将以本策略为准`);
    }
    updateItem(selected.id, {
      customDates: has ? selected.customDates.filter((x) => x !== d) : [...selected.customDates, d].sort((a, b) => a - b),
    });
  };

  const addManualPeriod = () => {
    if (!selected) return;
    const newPeriod: StrategyPeriodItem = {
      id: `mp_${Date.now()}`,
      title: `计划时段${selected.manualPeriods.length + 1}`,
      timeRange: "08:30~11:30",
      chargeReserve: "--",
      dischargeReserve: "90 %",
      subStrategies: [
        {
          id: `ms_${Date.now()}_1`,
          name: "峰谷套利",
          type: "arbitrage",
          badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
          timeRange: "08:30 ~ 11:30",
          mode: "放电",
          power: "250",
        },
      ],
    };
    updateItem(selected.id, { manualPeriods: [...selected.manualPeriods, newPeriod] });
    showToast("已新增一个计划时段");
  };


  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FC] text-slate-800">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-16 right-6 z-[70] bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回</span>
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-baseline gap-2">
            <h1 className="text-sm font-black text-slate-900 tracking-tight">
              策略配置
            </h1>
            <span className="text-xs text-slate-400">
              配置本次需要模拟对比的基准策略及应用范围，用于计算收益提升对比
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 border border-slate-200 bg-slate-50 text-slate-600 rounded-lg px-3 py-1.5 text-xs font-bold">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
            {fullMonthLabel}
          </span>
        </div>
      </div>

      {/* Main Two-Column Body */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-5 py-5 flex items-start gap-5 pb-28">
        {/* ============ LEFT: 本次需要模拟的策略列表 ============ */}
        <aside className="w-[310px] shrink-0 rounded-2xl border border-slate-200 bg-white shadow-2xs flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                策略列表
              </h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {strategyList.length} 条
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              本次模拟的基准策略集合，可新增或删除
            </p>
          </div>

          {/* Items */}
          <div className="flex-1 px-3 py-3 space-y-2 overflow-y-auto max-h-[calc(100vh-320px)] min-h-[240px]">
            {strategyList.length === 0 && (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Layers className="w-5 h-5 stroke-[1.5]" />
                </div>
                <p className="text-xs font-bold text-slate-600">暂无模拟策略</p>
                <p className="text-[11px] text-slate-400">点击下方「新增策略」添加基准策略，空列表将按无策略模拟</p>
              </div>
            )}

            {strategyList.map((item) => {
              const isSel = item.id === selectedId;
              const covered = datesCoveredBy(item).length;
              const scope = SCOPE_META[item.scopeType];
              const isNone = item.sourceType === "template" && item.templateId === "tpl_none";
              const dirty = isDirty(item);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`group rounded-xl border-2 px-3 py-2.5 cursor-pointer transition-all relative ${
                    isSel
                      ? "border-emerald-500 bg-emerald-50/40 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      item.sourceType === "manual"
                        ? "bg-violet-50 text-violet-600"
                        : isNone
                        ? "bg-slate-100 text-slate-400"
                        : "bg-emerald-50 text-emerald-600"
                    }`}>
                      {item.sourceType === "manual" ? (
                        <Settings2 className="w-3.5 h-3.5" />
                      ) : isNone ? (
                        <RotateCcw className="w-3.5 h-3.5" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 fill-current" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate leading-tight">
                        {item.name || "未命名策略"}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-none">
                        {item.sourceType === "manual" ? "手动自定义策略" : "已有模版策略"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {dirty && (
                        <span
                          className="w-2 h-2 rounded-full bg-amber-400 shadow-sm"
                          title="有未保存的修改"
                        />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-md transition-all shrink-0 cursor-pointer"
                        title="删除该策略"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/90">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                      item.scopeType === "all"
                        ? "border-slate-300 bg-slate-100 text-slate-600"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }`}>
                      {scope.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      覆盖 {covered} 天
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Buttons */}
          <div className="border-t border-slate-100 p-3 space-y-1.5">
            <button
              onClick={addBlankStrategy}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-[#00B06B] hover:bg-emerald-50 rounded-lg border-2 border-dashed border-emerald-300 hover:border-emerald-400 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              新增策略
            </button>
            <p className="text-[10px] text-slate-400 leading-relaxed px-1">
              <Info className="w-3 h-3 inline -mt-0.5 mr-0.5" />
              新增后在右侧详情中选择已有策略模版或手动自定义
            </p>
          </div>
        </aside>

        {/* ============ RIGHT: 策略详情 ============ */}
        <section className="flex-1 min-w-0 space-y-4">
          {!selected ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 min-h-[420px] flex flex-col items-center justify-center gap-3 text-center p-10">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Settings2 className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-700">未选择策略</h3>
                <p className="text-xs text-slate-400 mt-1">在左侧选择或新增一条策略后，可在此编辑其详情与应用范围</p>
              </div>
            </div>
          ) : (
            <>
              {/* Card 1: 应用范围 */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="font-mono text-slate-400 text-xs">1</span>
                    应用范围
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">选择本策略作用于当月的日期范围</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(SCOPE_META) as ScopeType[]).map((st) => {
                    const meta = SCOPE_META[st];
                    const active = selected.scopeType === st;
                    const allTakenByOther = st === "all" && strategyList.some((it) => it.id !== selected.id && it.scopeType === "all");
                    return (
                      <button
                        key={st}
                        onClick={() => setScope(selected.id, st)}
                        disabled={allTakenByOther}
                        title={allTakenByOther ? "已有其它策略占用「当月全部」" : undefined}
                        className={`px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                          allTakenByOther
                            ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                            : active
                            ? `${meta.activeChip} cursor-pointer`
                            : `bg-white ${meta.chip} cursor-pointer`
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="text-xs font-bold">{meta.label}</span>
                          {allTakenByOther && <Lock className="w-3 h-3" />}
                        </span>
                        <span className={`block text-[10px] mt-0.5 ${active ? "opacity-80" : "text-slate-400"}`}>
                          {st === "all"
                            ? allTakenByOther
                              ? "已被其它策略占用"
                              : `覆盖 ${DAYS_IN_MONTH} 天 · 仅可一条`
                            : `已选 ${selected.customDates.length} 天`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selected.scopeType === "custom" && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
                        勾选 {monthLabel} 中应用本策略的日期
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">已选 {selected.customDates.length} 天</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1).map((d) => {
                        const weekend = isWeekendOf(d);
                        const on = selected.customDates.includes(d);
                        const occupier = occupiedMap[d];
                        return (
                          <button
                            key={d}
                            onClick={() => toggleCustomDate(d)}
                            title={occupier ? `当前由「${occupier}」应用，选中后保存时将替换` : undefined}
                            className={`relative flex flex-col items-center rounded-lg py-1 px-0.5 border transition-all ${
                              on
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-xs cursor-pointer"
                                : occupier
                                ? "bg-white border-dashed border-rose-300 text-slate-500 hover:border-rose-400 cursor-pointer"
                                : weekend
                                ? "bg-amber-50/70 border-amber-100 text-amber-600/80 hover:border-amber-300 cursor-pointer"
                                : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300 cursor-pointer"
                            }`}
                          >
                            {occupier && !on && (
                              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-400" title={`已被「${occupier}」占用`} />
                            )}
                            <span className="text-[11px] font-bold leading-none">{d}</span>
                            <span className={`text-[8px] leading-tight mt-0.5 max-w-full truncate ${
                              on ? "text-white/80" : occupier ? "text-rose-400/90" : "text-slate-400"
                            }`}>
                              {occupier ? occupier.slice(0, 3) : `周${WEEKDAY_SHORT[(d - 1) % 7]}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-3 pt-0.5">
                      <button
                        onClick={() => {
                          const wkds = Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1).filter(
                            (x) => !isNonWorkdayOf(x)
                          );
                          const taken = wkds.filter((x) => !!occupiedMap[x]).length;
                          updateItem(selected.id, { customDates: wkds });
                          if (taken > 0) showToast(`已选中 ${wkds.length} 天，其中 ${taken} 天当前由其它策略应用，保存时将替换`);
                        }}
                        className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        一键选工作日
                      </button>
                      <button
                        onClick={() => {
                          const wends = Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1).filter(
                            (x) => isNonWorkdayOf(x)
                          );
                          const taken = wends.filter((x) => !!occupiedMap[x]).length;
                          updateItem(selected.id, { customDates: wends });
                          if (taken > 0) showToast(`已选中 ${wends.length} 天，其中 ${taken} 天当前由其它策略应用，保存时将替换`);
                        }}
                        className="text-[10px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        一键选非工作日
                      </button>
                      <button
                        onClick={() => updateItem(selected.id, { customDates: [] })}
                        className="text-[10px] font-bold text-slate-500 hover:text-rose-600 px-2 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        清空
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-emerald-50/60 border border-emerald-100 rounded-lg px-3 py-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    本策略将覆盖 <strong className="text-emerald-700 font-bold">{datesCoveredBy(selected).length}</strong> 天
                    {selected.scopeType !== "all" && coveredSet.size < DAYS_IN_MONTH
                      ? "，未覆盖的日期将由其它策略或「无策略」兜底"
                      : selected.scopeType === "all"
                      ? "，若与更精确范围同时存在，则精确范围优先"
                      : ""}
                  </span>
                </div>
              </div>

              {/* Card 2: 策略来源（紧贴时段详情） */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="font-mono text-slate-400 text-xs">2</span>
                      策略来源
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">选择已有策略模版，或在下方时段区手动自定义充放参数</p>
                  </div>

                  {/* Source Segmented */}
                  <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl">
                    <button
                      onClick={() => {
                        if (!selected || selected.sourceType === "template") return;
                        // 手动 → 模版：若此前曾是模版则恢复之，否则回落默认休息日模版
                        const isKnownTpl = PRESET_TEMPLATES.some(
                          (t) => t.id === selected.templateId && t.id !== "tpl_none"
                        );
                        const restoreId = isKnownTpl ? selected.templateId : "tpl_weekend_july_aug";
                        const tpl = PRESET_TEMPLATES.find((t) => t.id === restoreId) || null;
                        updateItem(selected.id, {
                          sourceType: "template",
                          templateId: restoreId,
                          name: tpl ? tpl.name : selected.name,
                        });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selected.sourceType === "template"
                          ? "bg-white text-emerald-700 shadow-xs border border-slate-200"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <Zap className="w-3 h-3 inline -mt-0.5 mr-1" />
                      已有模版
                    </button>
                    <button
                      onClick={() => {
                        if (!selected || selected.sourceType === "manual") return;
                        // 模版 → 手动：将当前显示的时段作为自定义起点
                        updateItem(selected.id, {
                          sourceType: "manual",
                          manualPeriods: displayedPeriods.length ? clonePeriods(displayedPeriods) : EMPTY_MANUAL_PERIODS(),
                        });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selected.sourceType === "manual"
                          ? "bg-white text-violet-700 shadow-xs border border-slate-200"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <Settings2 className="w-3 h-3 inline -mt-0.5 mr-1" />
                      手动自定义
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {selected.sourceType === "template" ? (
                    /* 模版来源：名称跟随模版，不提供自定义命名 */
                    <div className="lg:col-span-2">
                      <label className="text-[11px] font-medium text-slate-500 block mb-1.5">选择策略模版</label>
                      <div className="relative">
                        <select
                          value={selected.templateId}
                          onChange={(e) => {
                            const tplId = e.target.value;
                            const tpl = PRESET_TEMPLATES.find((t) => t.id === tplId) || null;
                            updateItem(selected.id, { templateId: tplId, name: tpl ? tpl.name : selected.name });
                          }}
                          className="w-full appearance-none bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-medium rounded-lg px-3 py-2.5 pr-8 outline-none cursor-pointer transition-colors shadow-2xs"
                        >
                          {PRESET_TEMPLATES.filter((t) => t.id !== "tpl_none").map((tpl) => (
                            <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* 手动自定义：需要命名 */}
                      <div>
                        <label className="text-[11px] font-medium text-slate-500 block mb-1.5">策略名称</label>
                        <input
                          value={selected.name}
                          onChange={(e) => updateItem(selected.id, { name: e.target.value })}
                          placeholder="请输入策略名称"
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-medium rounded-lg px-3 py-2.5 outline-none transition-colors shadow-2xs focus:border-emerald-400"
                        />
                      </div>
                      <div className="flex items-end pb-1">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-violet-600 bg-violet-50 border border-violet-200 px-2.5 py-1.5 rounded-lg">
                          <Settings2 className="w-3 h-3" />
                          手动自定义 · 可在下方时段区自由增删
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Card 3: 计划时段配置详情 */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="font-mono text-slate-400 text-xs">3</span>
                      计划时段配置详情

                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isManualMode
                        ? "手动定义各时段的充放电保留率与功率参数"
                        : "所选策略模版在各时段的运行参数详情"}
                    </p>
                  </div>
                  {isManualMode && (
                    <button
                      onClick={addManualPeriod}
                      className="flex items-center gap-1 text-xs font-bold text-[#00B06B] hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      新增计划时段
                    </button>
                  )}
                </div>

                {displayedPeriods.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <RotateCcw className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-700">当前策略为「无策略（未配置）」</h4>
                      <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                        该策略覆盖的日期将不执行任何固定充放电基准策略，储能和光伏在基准对比中按自然自发自用状态计算。
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayedPeriods.map((period, pIdx) => (
                      <div key={period.id || pIdx} className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                        {/* Period Top Bar */}
                        <div className="bg-[#F8FAFC] px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{period.title}</span>
                          </div>
                          <div className="flex items-center gap-6 text-xs">
                            <div>
                              <span className="text-slate-400 mr-2">适用时段</span>
                              <span className="font-medium text-slate-800 font-mono">{period.timeRange}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 mr-2">充电预留容量</span>
                              <span className="font-medium text-slate-800 font-mono">{period.chargeReserve}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 mr-2">放电预留容量</span>
                              <span className="font-medium text-slate-800 font-mono">{period.dischargeReserve}</span>
                            </div>
                            {isManualMode && (
                              <button
                                onClick={() => {
                                  if (!selected) return;
                                  updateItem(selected.id, {
                                    manualPeriods: selected.manualPeriods.filter((p) => p.id !== period.id),
                                  });
                                }}
                                className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                                title="删除该时段"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Sub Strategies */}
                        <div className="p-4 space-y-3">
                          {period.subStrategies?.map((sub, sIdx) => (
                            <div key={sub.id || sIdx} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-medium">策略{sIdx + 1}</span>
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${sub.badgeColor}`}>
                                  {sub.name}
                                </span>
                              </div>
                              {sub.type === "arbitrage" ? (
                                <div className="border border-slate-100 rounded-lg overflow-hidden">
                                  <table className="w-full text-left text-xs">
                                    <thead className="bg-[#FAFAFA] text-slate-400 font-normal border-b border-slate-100">
                                      <tr>
                                        <th className="px-4 py-2 font-normal">适用时段</th>
                                        <th className="px-4 py-2 font-normal">充放电模式</th>
                                        <th className="px-4 py-2 font-normal">充放电功率(kW)</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      <tr className="text-slate-700 font-medium">
                                        <td className="px-4 py-2 font-mono">{sub.timeRange || period.timeRange}</td>
                                        <td className="px-4 py-2">{sub.mode || "放电"}</td>
                                        <td className="px-4 py-2 font-mono">{sub.power || "130"}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              ) : sub.type === "demand" ? (
                                <div className="bg-[#FAFAFA] p-3 rounded-lg border border-slate-100 flex flex-wrap items-center gap-8 text-xs text-slate-600">
                                  <div>
                                    <span className="text-slate-400 mr-2">允许充电偏移量</span>
                                    <span className="font-bold text-slate-800 font-mono">{sub.chargeOffset || "120 kW"}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 mr-2">储能允许充电阈值</span>
                                    <span className="font-bold text-slate-800 font-mono">{sub.chargeThreshold || "425 kW"}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-[#FAFAFA] p-3 rounded-lg border border-slate-100 flex flex-wrap items-center gap-8 text-xs text-slate-600">
                                  <div>
                                    <span className="text-slate-400 mr-2">允许放电偏移量</span>
                                    <span className="font-bold text-slate-800 font-mono">{sub.dischargeOffset || "50 kW"}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 mr-2">储能允许放电阈值</span>
                                    <span className="font-bold text-slate-800 font-mono">{sub.dischargeThreshold || "495 kW"}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card 4: 配置预览 */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="font-mono text-slate-400 text-xs">4</span>
                    配置预览
                  </h3>
                  <span className="text-xs text-slate-400">24小时策略时段分布（按时间顺序）</span>
                </div>
                {displayedPeriods.length === 0 ? (
                  <div className="w-full border border-dashed border-slate-200 rounded-lg p-3 bg-[#FAFAFA] flex items-center justify-center min-h-[44px]">
                    <span className="text-xs text-slate-400 font-medium">⚪ 当前为无策略状态，24小时无基准充放排程约束</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-full border border-slate-200 rounded-lg p-2 bg-[#FAFAFA] flex items-center gap-2 min-h-[44px] overflow-x-auto">
                      {[...displayedPeriods]
                        .sort((a, b) => (a.timeRange || "").localeCompare(b.timeRange || ""))
                        .map((period) => (
                          <div
                            key={period.id}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-md shrink-0 shadow-2xs"
                            title={`${period.title} · ${period.timeRange}`}
                          >
                            <span className="text-[10px] font-bold text-slate-500 font-mono border-r border-slate-100 pr-1.5">
                              {period.timeRange}
                            </span>
                            {period.subStrategies?.map((sub, i) => (
                              <span
                                key={i}
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${sub.badgeColor}`}
                              >
                                {sub.name}
                              </span>
                            ))}
                          </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-0.5">
                      <span>00:00</span>
                      <span>06:00</span>
                      <span>12:00</span>
                      <span>18:00</span>
                      <span>00:00</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 本条策略的保存/取消 */}
              {(() => {
                const dirty = isDirty(selected);
                return (
                  <div className={`flex items-center justify-between rounded-2xl border p-4 transition-all ${
                    dirty
                      ? "border-amber-200 bg-amber-50/60"
                      : "border-slate-200 bg-white"
                  }`}>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      {dirty ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          该策略有未保存的修改
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          该策略配置已保存
                        </>
                      )}
                    </span>
                    {dirty && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => revertItem(selected.id)}
                          className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => saveItem(selected.id)}
                          className="px-5 py-1.5 text-xs font-bold bg-[#00B06B] hover:bg-[#00965b] text-white rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          保存
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}
        </section>
      </div>

      {/* 日期冲突确认弹窗 */}
      {confirmBox && (
        <div
          className="fixed inset-0 z-[80] bg-slate-900/50 flex items-center justify-center p-4"
          onClick={() => setConfirmBox(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">{confirmBox.title}</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{confirmBox.message}</p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setConfirmBox(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const fn = confirmBox.onConfirm;
                  setConfirmBox(null);
                  fn();
                }}
                className="px-5 py-2 text-xs font-bold bg-[#00B06B] hover:bg-[#00965b] text-white rounded-lg shadow-sm transition-all cursor-pointer"
              >
                确认替换
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 z-40 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2 text-xs text-rose-500 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>算法模拟回测将完全参考本站历史真实负荷及充放参数。</span>
        </div>
        <div className="flex items-center gap-3">
          {dirtyCount > 0 && (
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {dirtyCount} 条策略未保存，开始模拟时将自动保存
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2 text-xs font-bold bg-[#00B06B] hover:bg-[#00965b] text-white rounded-lg transition-all cursor-pointer shadow-sm shadow-emerald-100 flex items-center gap-1.5"
          >
            <Play className="w-4 h-4" />
            开始模拟
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategyRunConfigPage;
