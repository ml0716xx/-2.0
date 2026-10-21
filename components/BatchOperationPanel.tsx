/* ==========================================================================
   策略运行 · 策略排期 —— 批量操作面板（右栏）
   --------------------------------------------------------------------------
   交互顺序和旧版反过来：先在左侧日历上框出区间，再在右栏挑动作与规则。

     1 区间   日历上点首日、再点末日，区间归日历管，这里只回显
     2 动作   新增 / 移除 / 生效 / 失效，四个按钮平铺，不下拉
     3 规则   只有「新增」需要：策略模式、循环方式、生效状态
     4 预览   循环命中哪几天，实时回传给日历高亮；这里再列一遍日期
     5 确认   提交后日历上留痕，可撤销

   区间是「窗口」，循环是「窗口里哪几天真正排上」，两件事分开算。
   ========================================================================== */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  HelpCircle,
  Minus,
  Plus,
  X,
} from 'lucide-react';

export type BatchAction = '批量新增' | '批量移除' | '批量生效' | '批量失效';
type StrategyMode = 'AI 策略【PRO】' | 'AI 策略【标准】' | 'AI 策略【基础】' | '自定义';
type EffectState = '立即生效' | '暂不生效';
type CycleKind = '每天' | '按周';

export interface BatchResult {
  action: BatchAction;
  start: string;
  end: string;
  dates: string[];
  detail: string;
}

/* ---------------------------------- 日期 ---------------------------------- */

const pad = (n: number) => String(n).padStart(2, '0');
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** 闭区间内的每一天 */
export function datesBetween(start: string, end: string): string[] {
  if (!start || !end || end < start) return [];
  const out: string[] = [];
  const endDate = parseYmd(end);
  for (const d = parseYmd(start); d <= endDate; d.setDate(d.getDate() + 1)) out.push(ymd(d));
  return out;
}

export interface CycleRule {
  kind: CycleKind;
  week: boolean[]; // 周一..周日
  everyWeek: number; // 每 N 周
}

export const DEFAULT_CYCLE: CycleRule = {
  kind: '每天',
  week: [true, true, true, true, true, false, false],
  everyWeek: 1,
};

/** 窗口 + 循环 → 真正命中的日期 */
export function hitDatesOf(start: string, end: string, rule: CycleRule): string[] {
  const all = datesBetween(start, end);
  if (!all.length) return [];
  switch (rule.kind) {
    case '按周': {
      const first = parseYmd(all[0]);
      return all.filter(d => {
        const day = parseYmd(d);
        const idx = (day.getDay() + 6) % 7; // 周一 = 0
        const weekNo = Math.floor((day.getTime() - first.getTime()) / 86400000 / 7);
        return rule.week[idx] && weekNo % Math.max(1, rule.everyWeek) === 0;
      });
    }
    default:
      return all;
  }
}

/* ---------------------------------- 常量 ---------------------------------- */

const ACTIONS: BatchAction[] = ['批量新增', '批量移除', '批量生效', '批量失效'];

const ACTION_HINT: Record<BatchAction, string> = {
  批量新增: '给区间内的日子铺上新的排期',
  批量移除: '把区间内已有的排期清掉',
  批量生效: '让区间内已排的策略开始执行',
  批量失效: '让区间内已排的策略暂停执行',
};

const MODE_HINT: Record<StrategyMode, string> = {
  'AI 策略【PRO】': '由天盈 AI 按电价与负荷自动寻优，逐 15 分钟下发',
  'AI 策略【标准】': '由天盈 AI 提前排出充放电排程，按排程计划执行',
  'AI 策略【基础】': '按天气与日期绑定固定策略，不走 AI 寻优',
  自定义: '选择已配置好的策略组合，按循环方式铺到每一天',
};

const COMBO_OPTIONS = ['工作日储能套利', '周末光伏全额消纳', '需量控制优先'];

const CYCLE_KINDS: CycleKind[] = ['每天', '按周'];

const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

/* 原型里「今天」固定在这一天，和日历上标的一致 */
const TODAY = '2026-07-10';

/** 站点上已有的策略，和日历上画出来的策略条对齐；移除/生效/失效都得先勾 */
const EXISTING_STRATEGIES: {
  id: string;
  name: string;
  tone: 'indigo' | 'emerald' | 'slate' | 'amber';
  dates: string[];
}[] = [
  {
    id: 'std',
    name: 'AI 策略【标准】',
    tone: 'indigo',
    dates: [
      '2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17',
      '2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24',
      '2026-07-27', '2026-07-28', '2026-07-29', '2026-07-30', '2026-07-31',
    ],
  },
  {
    id: 'pro',
    name: 'AI 策略【PRO】',
    tone: 'emerald',
    dates: ['2026-07-07', '2026-07-08', '2026-07-13', '2026-07-14'],
  },
  {
    id: 'tpl',
    name: '七月策略模板',
    tone: 'slate',
    dates: ['2026-07-04', '2026-07-05', '2026-07-11', '2026-07-12', '2026-07-18', '2026-07-19'],
  },
  {
    id: 'light',
    name: 'AI 策略【基础】',
    tone: 'amber',
    dates: ['2026-07-01', '2026-07-02', '2026-07-03'],
  },
];

const TONE_CLASS: Record<string, string> = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  slate: 'bg-slate-400',
  amber: 'bg-amber-500',
};

/* ---------------------------------- 面板 ---------------------------------- */

interface Props {
  start: string;
  end: string;
  action: BatchAction | null;
  onActionChange: (a: BatchAction) => void;
  /** 右栏改日期 → 回传页面，左侧日历同步高亮 */
  onRangeChange: (start: string, end: string) => void;
  /** 命中的日期回传给日历高亮 */
  onPreviewChange: (dates: string[]) => void;
  onClearSelection: () => void;
  onSubmit: (r: BatchResult) => void;
  onClose: () => void;
}

export default function BatchOperationPanel({
  start,
  end,
  action,
  onActionChange,
  onRangeChange,
  onPreviewChange,
  onClearSelection,
  onSubmit,
  onClose,
}: Props) {
  const [mode, setMode] = useState<StrategyMode>('AI 策略【PRO】');
  const [combo, setCombo] = useState('');
  const [effect, setEffect] = useState<EffectState>('立即生效');
  const [cycle, setCycle] = useState<CycleRule>(DEFAULT_CYCLE);
  const [picked, setPicked] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [hoveredHelp, setHoveredHelp] = useState<StrategyMode | null>(null);

  /* 只点了起始日时按单日算，免得「共 0 天」卡住确认 */
  const effEnd = end || start;
  const range = useMemo(() => datesBetween(start, effEnd), [start, effEnd]);
  const isCreate = action === '批量新增';

  /** 每个已有策略在区间内落在哪几天；0 天的不让勾 */
  const strategyRows = useMemo(() => {
    const inRange = new Set(range);
    return EXISTING_STRATEGIES.map(s => ({
      ...s,
      hits: s.dates.filter(d => inRange.has(d)),
    }));
  }, [range]);

  const pickedNames = EXISTING_STRATEGIES.filter(s => picked.includes(s.id)).map(s => s.name);

  /** 新增按循环算命中；其余动作取「选中策略 ∩ 区间」的日子 */
  const hit = useMemo(() => {
    if (!action) return [];
    if (isCreate) return hitDatesOf(start, effEnd, cycle);
    const inRange = new Set(range);
    const set = new Set<string>();
    strategyRows
      .filter(r => picked.includes(r.id))
      .forEach(r => r.hits.forEach(d => inRange.has(d) && set.add(d)));
    return [...set].sort();
  }, [action, isCreate, start, effEnd, cycle, range, strategyRows, picked]);

  /* 命中集合回传给日历 */
  useEffect(() => {
    onPreviewChange(hit);
  }, [hit, onPreviewChange]);

  const canSubmit = !!action && hit.length > 0 && (isCreate || picked.length > 0);
  const cycleNote = isCreate
    ? cycle.kind === '每天'
      ? `区间 ${range.length} 天，每天命中`
      : `区间 ${range.length} 天，按周命中 ${hit.length} 天`
    : `选中 ${picked.length} 个策略，命中 ${hit.length} 天`;

  const togglePick = (id: string) => {
    setPicked(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    setError('');
  };

  const submit = () => {
    if (!action) {
      setError('先选一个动作');
      return;
    }
    if (isCreate && mode === '自定义' && !combo) {
      setError('请选择策略组合');
      return;
    }
    if (!isCreate && picked.length === 0) {
      setError('请至少勾选一个策略');
      return;
    }
    if (!hit.length) {
      setError('这个区间里没有命中的日期');
      return;
    }
    onSubmit({
      action,
      start,
      end,
      dates: hit,
      detail: isCreate
        ? `${mode === '自定义' ? `${mode}·${combo}` : mode} · ${cycleText(cycle)} · ${effect} · 命中 ${hit.length} 天`
        : `${pickedNames.join('、')} · 命中 ${hit.length} 天`,
    });
    /* 提交完把勾选清掉，免得下一次操作带着上次的策略 */
    setPicked([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col h-full max-h-[calc(100vh-196px)] overflow-hidden">
      {/* 头部 */}
      <div className="p-4 pb-3 border-b border-slate-100 shrink-0 flex justify-between items-start">
        <div className="min-w-0">
          <h3 className="text-base font-black text-slate-800">批量操作</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">选时间段，批量铺排期</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title="退出批量"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5" style={{ scrollbarWidth: 'none' }}>
        {/* 目标时间：右栏仍是主入口，左侧日历只做同步回显 */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[13px] font-bold text-slate-700">
              <span className="text-rose-500 mr-0.5">*</span>目标时间
            </p>
            {start && (
              <button
                type="button"
                onClick={onClearSelection}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600"
              >
                清除
              </button>
            )}
          </div>

          <RangePicker start={start} end={end} today={TODAY} onChange={onRangeChange} />

          <p className="mt-1.5 text-[11px] text-slate-400">
            {start
              ? `共 ${range.length} 天；也可以直接在左侧日历上点起止日`
              : '可在上面选区间，或直接在左侧日历上点起止日'}
          </p>
        </div>

        {!start ? (
          <EmptyState />
        ) : (
          <>
            {/* 动作 */}
            <div>
              <p className="mb-1.5 text-[13px] font-bold text-slate-700">要做什么</p>
              <div className="grid grid-cols-2 gap-2">
                {ACTIONS.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => {
                      onActionChange(a);
                      setError('');
                    }}
                    className={`h-9 rounded-lg text-[13px] font-bold border transition-colors ${
                      action === a
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              {action && <p className="mt-1.5 text-[11px] text-slate-400">{ACTION_HINT[action]}</p>}
            </div>

            {/* 移除 / 生效 / 失效：先勾要操作哪些策略，可多选 */}
            {action && !isCreate && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[13px] font-bold text-slate-700">
                    <span className="text-rose-500 mr-0.5">*</span>要操作的策略
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const all = strategyRows.filter(r => r.hits.length > 0).map(r => r.id);
                      setPicked(picked.length === all.length ? [] : all);
                      setError('');
                    }}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    {picked.length === strategyRows.filter(r => r.hits.length > 0).length ? '取消全选' : '全选'}
                  </button>
                </div>

                <div className="space-y-1.5">
                  {strategyRows.map(r => {
                    const checked = picked.includes(r.id);
                    const disabled = r.hits.length === 0;
                    return (
                      <label
                        key={r.id}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-colors ${
                          disabled
                            ? 'border-slate-100 bg-slate-50/60 cursor-not-allowed'
                            : checked
                              ? 'border-emerald-300 bg-emerald-50/60 cursor-pointer'
                              : 'border-slate-200 hover:border-slate-300 cursor-pointer'
                        }`}
                      >
                        <span
                          className={`w-[15px] h-[15px] rounded-[3px] border flex items-center justify-center shrink-0 ${
                            checked && !disabled
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {checked && !disabled && (
                            <svg viewBox="0 0 10 8" className="w-2.5 h-2" fill="none">
                              <path
                                d="M1 4l2.5 2.5L9 1"
                                stroke="white"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked && !disabled}
                          disabled={disabled}
                          onChange={() => !disabled && togglePick(r.id)}
                        />
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${TONE_CLASS[r.tone]}`} />
                        <span
                          className={`text-[13px] truncate ${
                            disabled ? 'text-slate-400' : 'text-slate-700 font-medium'
                          }`}
                        >
                          {r.name}
                        </span>
                        <span className="ml-auto text-[11px] text-slate-400 shrink-0">
                          {disabled ? '区间内无排期' : `${r.hits.length} 天`}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {picked.length === 0 && (
                  <p className="mt-1.5 text-[11px] text-slate-400">勾选后，只有这些策略的排期会被处理</p>
                )}
              </div>
            )}

            {/* 新增规则 */}
            {isCreate && (
              <>
                <div>
                  <p className="mb-1.5 text-[13px] font-bold text-slate-700">策略模式</p>
                  <div className="flex items-center gap-x-4 gap-y-2 flex-wrap">
                    {(Object.keys(MODE_HINT) as StrategyMode[]).map(m => (
                      <label
                        key={m}
                        className="flex items-center gap-1.5 cursor-pointer select-none"
                        onMouseEnter={() => setHoveredHelp(m)}
                        onMouseLeave={() => setHoveredHelp(null)}
                      >
                        <span
                          className={`w-[15px] h-[15px] rounded-full border flex items-center justify-center ${
                            mode === m ? 'border-emerald-500' : 'border-slate-300'
                          }`}
                        >
                          {mode === m && <span className="w-[7px] h-[7px] rounded-full bg-emerald-500" />}
                        </span>
                        <input type="radio" className="sr-only" checked={mode === m} onChange={() => setMode(m)} />
                        <span className={`text-[13px] ${mode === m ? 'text-slate-800 font-bold' : 'text-slate-600'}`}>
                          {m}
                        </span>
                        <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
                      </label>
                    ))}
                  </div>
                  {hoveredHelp && (
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{MODE_HINT[hoveredHelp]}</p>
                  )}
                </div>

                {mode === '自定义' && (
                  <div>
                    <p className="mb-1.5 text-[13px] font-bold text-slate-700">
                      <span className="text-rose-500 mr-0.5">*</span>策略组合
                    </p>
                    <ComboSelect
                      value={combo}
                      options={COMBO_OPTIONS}
                      onChange={c => {
                        setCombo(c);
                        setError('');
                      }}
                    />
                  </div>
                )}

                <div>
                  <p className="mb-1.5 text-[13px] font-bold text-slate-700">循环方式</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {CYCLE_KINDS.map(k => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setCycle(c => ({ ...c, kind: k }))}
                        className={`h-7 px-2.5 rounded-md text-[12px] font-bold border transition-colors ${
                          cycle.kind === k
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>

                  {cycle.kind === '按周' && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-1">
                        {WEEK_LABELS.map((w, i) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() =>
                              setCycle(c => ({ ...c, week: c.week.map((v, j) => (j === i ? !v : v)) }))
                            }
                            className={`w-7 h-7 rounded-md text-[12px] font-bold border transition-colors ${
                              cycle.week[i]
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : 'border-slate-200 text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-slate-600">
                        <span>每</span>
                        <Stepper
                          value={cycle.everyWeek}
                          min={1}
                          max={4}
                          onChange={v => setCycle(c => ({ ...c, everyWeek: v }))}
                        />
                        <span>周重复一次</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <p className="mb-1.5 text-[13px] font-bold text-slate-700">生效状态</p>
                  <div className="flex items-center gap-x-6">
                    {(['立即生效', '暂不生效'] as EffectState[]).map(s => (
                      <label key={s} className="flex items-center gap-1.5 cursor-pointer select-none">
                        <span
                          className={`w-[15px] h-[15px] rounded-full border flex items-center justify-center ${
                            effect === s ? 'border-emerald-500' : 'border-slate-300'
                          }`}
                        >
                          {effect === s && <span className="w-[7px] h-[7px] rounded-full bg-emerald-500" />}
                        </span>
                        <input
                          type="radio"
                          className="sr-only"
                          checked={effect === s}
                          onChange={() => setEffect(s)}
                        />
                        <span className={`text-[13px] ${effect === s ? 'text-slate-800 font-bold' : 'text-slate-600'}`}>
                          {s}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 预览 */}
            {action && (
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] font-bold text-slate-700">会落到哪几天</span>
                  <span className="text-[12px] text-slate-400">{cycleNote}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {hit.length === 0 ? (
                    <span className="text-[12px] text-slate-300">这个区间里没有可操作的日子</span>
                  ) : (
                    hit.map(d => (
                      <span
                        key={d}
                        className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-mono font-bold"
                      >
                        {d.slice(5)}
                      </span>
                    ))
                  )}
                </div>
                {isCreate && hit.length > 0 && (
                  <p className="mt-2 text-[11px] text-slate-400">
                    已在执行的日子会被覆盖，确认后可在提示条上撤销。
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 底部 */}
      <div className="shrink-0 px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className="text-[11px] text-rose-500 flex-1 min-w-0 truncate">{error}</span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-[13px] font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className={`px-4 py-2 rounded-md text-[13px] font-bold shadow-sm transition-colors ${
              canSubmit
                ? 'text-white bg-emerald-500 hover:bg-emerald-600'
                : 'text-white bg-slate-300 cursor-not-allowed'
            }`}
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- 零件 ---------------------------------- */

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-8">
      <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center">
        <CalendarDays className="w-5 h-5 text-emerald-600" />
      </div>
      <p className="text-[13px] font-bold text-slate-700">选好时间，再挑一个动作</p>
      <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-300">
        <span>选时间</span>
        <ChevronRight className="w-3 h-3" />
        <span>选动作</span>
        <ChevronRight className="w-3 h-3" />
        <span>确认</span>
      </div>
    </div>
  );
}

/* ------------------------------- 日期区间选择 ------------------------------- */

function RangePicker({
  start,
  end,
  today,
  onChange,
}: {
  start: string;
  end: string;
  today: string;
  onChange: (start: string, end: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const b = start ? parseYmd(start) : parseYmd(`${TODAY.slice(0, 7)}-01`);
    return { y: b.getFullYear(), m: b.getMonth() };
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const shift = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  /** 第一次点定起点，第二次点定终点；点早于起点的日子则重定起点 */
  const pick = (d: string) => {
    if (!start || (start && end)) {
      onChange(d, '');
      return;
    }
    if (d < start) {
      onChange(d, '');
      return;
    }
    onChange(start, d);
    setOpen(false);
  };

  return (
    <div ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full h-9 px-3 rounded-md border bg-white flex items-center justify-between gap-2 text-[13px] transition-colors ${
          open ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {start ? (
            <>
              <span className="text-slate-800 font-mono">{start}</span>
              <span className="text-slate-300">→</span>
              <span className={`font-mono ${end ? 'text-slate-800' : 'text-slate-400'}`}>
                {end || '结束日期'}
              </span>
            </>
          ) : (
            <span className="text-slate-400">开始日期　→　结束日期</span>
          )}
        </span>
        <ChevronRight className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2">
          <MonthGrid
            year={view.y}
            month={view.m}
            start={start}
            end={end}
            today={today}
            pick={pick}
            onPrev={() => shift(-1)}
            onPrevYear={() => shift(-12)}
            onNext={() => shift(1)}
            onNextYear={() => shift(12)}
          />
        </div>
      )}
    </div>
  );
}

function MonthGrid({
  year,
  month,
  start,
  end,
  today,
  pick,
  onPrev,
  onPrevYear,
  onNext,
  onNextYear,
}: {
  year: number;
  month: number;
  start: string;
  end: string;
  today: string;
  pick: (d: string) => void;
  onPrev: () => void;
  onPrevYear: () => void;
  onNext: () => void;
  onNextYear: () => void;
}) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // 周一为第一列
  const total = new Date(year, month + 1, 0).getDate();

  const cells: (string | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(ymd(new Date(year, month, d)));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <div className="flex items-center gap-1 text-slate-400">
          <button type="button" onClick={onPrevYear} className="p-0.5 hover:text-slate-600">
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={onPrev} className="p-0.5 hover:text-slate-600">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
        <span className="text-[13px] font-bold text-slate-700">
          {year}年 {pad(month + 1)}月
        </span>
        <div className="flex items-center gap-1 text-slate-400">
          <button type="button" onClick={onNext} className="p-0.5 hover:text-slate-600">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={onNextYear} className="p-0.5 hover:text-slate-600">
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEK_LABELS.map(w => (
          <span key={w} className="text-center text-[10px] text-slate-400 font-bold">
            {w}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} className="h-8" />;
          const inRange = !!start && !!end && d >= start && d <= end;
          const isStart = d === start;
          const isEnd = d === end;
          const isToday = d === today;
          return (
            <button
              key={d}
              type="button"
              onClick={() => pick(d)}
              className={`h-8 text-[12px] rounded-md transition-colors ${
                isStart || isEnd
                  ? 'bg-emerald-500 text-white font-bold'
                  : inRange
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-100'
              } ${isToday && !isStart && !isEnd ? 'ring-1 ring-emerald-400' : ''}`}
            >
              {Number(d.slice(8))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* 策略组合：下拉选，收起时只占一行 */
function ComboSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full h-9 px-3 rounded-md border bg-white flex items-center justify-between gap-2 text-[13px] transition-colors ${
          open ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <span className={value ? 'text-slate-800 font-medium' : 'text-slate-400'}>
          {value || '请选择策略组合'}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="mt-1 rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
          {options.map(o => (
            <button
              key={o}
              type="button"
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className={`w-full h-8 px-3 text-[13px] text-left flex items-center justify-between transition-colors ${
                o === value ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {o}
              {o === value && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="inline-flex items-center border border-slate-200 rounded-md h-7 overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-6 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="w-7 text-center font-mono font-bold text-slate-800">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-6 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

/** 循环规则的一句话描述，给提交回执用 */
function cycleText(c: CycleRule) {
  if (c.kind === '按周') {
    const days = WEEK_LABELS.filter((_, i) => c.week[i]).map(w => `周${w}`).join('、');
    return `${days || '未选'} · 每 ${c.everyWeek} 周`;
  }
  return c.kind;
}
