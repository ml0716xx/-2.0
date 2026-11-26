/* ==========================================================================
   监控中心 · 设备监控
   --------------------------------------------------------------------------
   两个页面级 Tab，对应两种完全不同的问法：

     设备数据 —— 「这台设备现在怎么样」。左侧设备树定位到一台，右侧把它的
                 全部测点摊开：历史看曲线，最新看数值。单设备、深看。
     对比分析 —— 「几台设备、几个测点放一起看」。跨设备的测点勾选后画在一张图上，
                 或者切成明细表逐行看。多设备、横向比。

   为什么分成两个 Tab 而不是一张页面里挤：两者的选择器粒度不一样
   （一个选设备，一个选测点），挤在一起会让「我到底在看谁」变模糊。

   数据全部来自 deviceMonitorData，曲线用确定性种子生成，
   同一台设备同一天刷新多次结果一致，方便截图和演示。
   ========================================================================== */

import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Search,
  ChevronRight,
  ChevronDown,
  Pencil,
  AlertTriangle,
  Router,
  Zap,
  Gauge,
  Thermometer,
  Battery,
  Cpu,
  Boxes,
  List,
  BarChart3,
  Sparkles,
  RotateCcw,
  RefreshCw,
  Check,
  CalendarRange,
  Inbox,
  Plus,
  Trash2,
  X,
  BatteryCharging,
  PlugZap,
  CircleStop,
} from 'lucide-react';

import {
  DEVICE_TREE,
  DEFAULT_DEVICE_ID,
  DAY_BUCKETS,
  TOTAL_COMPARE_ROWS,
  COMPARE_BUCKETS,
  SERIES_COLORS,
  KIND_TONE,
  buildHistoryData,
  buildCompareChart,
  compareCellText,
  compareRowTime,
  chartablePoints,
  findDevice,
  latestText,
  pathToDevice,
  pointUnit,
  valueAt,
  type ChargerWorkState,
  type DeviceKind,
  type DeviceNode,
  type DevicePoint,
} from './deviceMonitorData';

const MAX_COMPARE_POINTS = 20;

const KIND_ICON: Record<DeviceKind, React.ReactNode> = {
  gateway: <Router size={26} />,
  transformer: <Zap size={26} />,
  meter: <Gauge size={26} />,
  sensor: <Thermometer size={26} />,
  cabinet: <Battery size={26} />,
  pcs: <Cpu size={26} />,
  charger: <BatteryCharging size={26} />,
};

const KIND_ICON_SM: Record<DeviceKind, React.ReactNode> = {
  gateway: <Router size={12} />,
  transformer: <Zap size={12} />,
  meter: <Gauge size={12} />,
  sensor: <Thermometer size={12} />,
  cabinet: <Battery size={12} />,
  pcs: <Cpu size={12} />,
  charger: <BatteryCharging size={12} />,
};

/* ---------- 小件 ---------- */

/** 页面级 Tab：下划线式，跟截图一致 */
const PageTabs: React.FC<{
  value: 'data' | 'compare';
  onChange: (v: 'data' | 'compare') => void;
}> = ({ value, onChange }) => (
  <div className="flex items-center gap-6 border-b border-slate-200">
    {[
      { key: 'data' as const, label: '设备数据' },
      { key: 'compare' as const, label: '对比分析' },
    ].map((t) => (
      <button
        key={t.key}
        onClick={() => onChange(t.key)}
        className={`relative pb-2.5 text-title transition-colors ${
          value === t.key ? 'font-black text-slate-800' : 'font-bold text-slate-400 hover:text-slate-600'
        }`}
      >
        {t.label}
        {value === t.key && (
          <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-emerald-500" />
        )}
      </button>
    ))}
  </div>
);

/** 复选框：自绘，避免各浏览器原生框风格不一 */
const CheckBox: React.FC<{ checked: boolean; onChange: () => void; label: React.ReactNode; dense?: boolean }> = ({
  checked,
  onChange,
  label,
  dense,
}) => (
  <button
    onClick={onChange}
    className={`w-full min-w-0 flex items-center gap-1.5 text-left rounded-md transition-colors ${
      dense ? 'py-[3px]' : 'py-1'
    } ${checked ? 'text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
  >
    <span
      className={`w-[13px] h-[13px] rounded-[3px] border flex items-center justify-center shrink-0 transition-colors ${
        checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'
      }`}
    >
      {checked && <Check size={9} className="text-white" strokeWidth={3.5} />}
    </span>
    <span className={`min-w-0 flex-1 truncate text-sub ${checked ? 'font-bold' : ''}`}>{label}</span>
  </button>
);

/** 设备缩略图：没有实拍图，用类型图标 + 浅色块顶上 */
const DeviceThumb: React.FC<{ kind: DeviceKind; size?: 'sm' | 'lg' }> = ({ kind, size = 'lg' }) => {
  const tone = KIND_TONE[kind];
  return (
    <div
      className={`rounded-xl flex items-center justify-center shrink-0 border border-white/60 ${
        size === 'lg' ? 'w-[96px] h-[70px]' : 'w-7 h-7'
      }`}
      style={{ background: `linear-gradient(135deg, ${tone.from}, ${tone.to})`, color: tone.text }}
    >
      {size === 'lg' ? KIND_ICON[kind] : KIND_ICON_SM[kind]}
    </div>
  );
};

/** 图例小条 */
const LegendChip: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <span className="flex items-center gap-1.5 text-body font-bold text-slate-600">
    <span className="w-4 h-0.5 rounded-full" style={{ background: color }} />
    {label}
  </span>
);

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; hint?: string }> = ({ icon, title, hint }) => (
  <div className="h-full min-h-[220px] flex flex-col items-center justify-center gap-2 text-slate-300">
    {icon}
    <div className="text-sub font-bold text-slate-400">{title}</div>
    {hint && <div className="text-body text-slate-400">{hint}</div>}
  </div>
);

/* ---------- 充电桩 ---------- */

/** 充/放电功率弹窗：留空 = 按额定功率全功率执行 */
const PowerModal: React.FC<{
  mode: 'charge' | 'discharge';
  ratedKw: number;
  onClose: () => void;
  onSubmit: (kw: number | null) => void;
}> = ({ mode, ratedKw, onClose, onSubmit }) => {
  const [val, setVal] = useState('');
  const [err, setErr] = useState('');
  const title = mode === 'charge' ? '开始充电' : '开始放电';

  const submit = () => {
    const t = val.trim();
    if (!t) {
      onSubmit(null);
      return;
    }
    const n = Number(t);
    if (!Number.isFinite(n) || n <= 0) {
      setErr('功率要大于 0');
      return;
    }
    if (n > ratedKw) {
      setErr(`不能超过额定功率 ${ratedKw} kW`);
      return;
    }
    onSubmit(n);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/30 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="w-[400px] max-w-full bg-white rounded-2xl border border-slate-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between">
          <span className="text-title font-black text-slate-800">{title}</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3.5">
          <div>
            <label className="block text-label font-bold text-slate-500 mb-1">
              {mode === 'charge' ? '充电' : '放电'}功率（kW）
              <span className="ml-1.5 font-normal text-slate-300">选填</span>
            </label>
            <input
              autoFocus
              value={val}
              onChange={(e) => {
                setVal(e.target.value.replace(/[^\d.]/g, ''));
                setErr('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder={`默认按额定功率 ${ratedKw} kW 执行`}
              className="h-8 w-full px-2.5 rounded-md border border-slate-200 text-body text-slate-700 outline-none focus:border-emerald-400"
            />
            {err && <div className="mt-1.5 text-label font-bold text-amber-600">{err}</div>}
          </div>
          <div className="text-label text-slate-300">
            不填则按额定功率全功率{mode === 'charge' ? '充电' : '放电'}；下发后可在工作状态里看实时功率
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="h-7 px-3 rounded-md border border-slate-200 text-label font-bold text-slate-600 hover:bg-slate-50"
          >
            取消
          </button>
          <button
            onClick={submit}
            className="h-7 px-3 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-label font-bold"
          >
            确认下发
          </button>
        </div>
      </div>
    </div>
  );
};

/** 充电桩操作条：开始充电 / 开始放电（都先弹功率）· 停止（充放电共用） */
const ChargerControl: React.FC<{ device: DeviceNode; flash: (msg: string, tone?: 'ok' | 'warn') => void }> = ({
  device,
  flash,
}) => {
  const ratedKw = device.ratedPowerKw ?? 60;
  /** idle / charging / discharging；初始 idle，工作状态测点跟着它变 */
  const [workState, setWorkState] = useState<ChargerWorkState>('idle');
  /** null = 弹层关着；'charge' / 'discharge' = 对应模式的功率输入 */
  const [sheet, setSheet] = useState<'charge' | 'discharge' | null>(null);

  const STATE_META: Record<ChargerWorkState, { text: string; cls: string }> = {
    idle: { text: '待机', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
    charging: { text: '充电中', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    discharging: { text: '放电中', cls: 'bg-sky-50 text-sky-600 border-sky-100' },
  };

  const submitPower = (mode: 'charge' | 'discharge', kw: number | null) => {
    setWorkState(mode === 'charge' ? 'charging' : 'discharging');
    setSheet(null);
    const label = mode === 'charge' ? '充电' : '放电';
    flash(kw ? `已下发「开始${label}」· 功率 ${kw} kW` : `已下发「开始${label}」· 默认全功率 ${ratedKw} kW`);
  };

  const stop = () => {
    const prev =
      workState === 'charging' ? '充电' : workState === 'discharging' ? '放电' : '';
    setWorkState('idle');
    flash(prev ? `已下发「停止」，结束${prev}` : '已下发「停止」');
  };

  const busy = workState !== 'idle';
  const meta = STATE_META[workState];

  return (
    <div className="shrink-0 mx-4 mt-3 rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sub font-black text-slate-800 shrink-0">充放电控制</span>
        <span className={`px-1.5 py-[1px] rounded text-label font-bold border ${meta.cls}`}>
          {meta.text}
        </span>
        {workState !== 'idle' && (
          <span className="text-label text-slate-400 truncate">
            按上次下发功率运行（原型示意，数值不动）
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setSheet('charge')}
          disabled={busy}
          className={`h-7 px-3 rounded-md text-label font-bold flex items-center gap-1 border transition-colors ${
            busy
              ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-white'
              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <BatteryCharging size={12} />
          开始充电
        </button>
        <button
          onClick={() => setSheet('discharge')}
          disabled={busy}
          className={`h-7 px-3 rounded-md text-label font-bold flex items-center gap-1 border transition-colors ${
            busy
              ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-white'
              : 'border-sky-200 text-sky-700 hover:bg-sky-50'
          }`}
        >
          <PlugZap size={12} />
          开始放电
        </button>
        <button
          onClick={stop}
          disabled={!busy}
          className={`h-7 px-3 rounded-md text-label font-bold flex items-center gap-1 border transition-colors ${
            busy
              ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
              : 'border-slate-200 text-slate-300 cursor-not-allowed bg-white'
          }`}
        >
          <CircleStop size={12} />
          停止
        </button>
      </div>

      {sheet && (
        <PowerModal
          mode={sheet}
          ratedKw={ratedKw}
          onClose={() => setSheet(null)}
          onSubmit={(kw) => submitPower(sheet, kw)}
        />
      )}
    </div>
  );
};

/* ---------- 历史数据 / 最新数据 的悬停提示 ---------- */
const ChartTooltip = ({ active, payload, label, points }: any) => {
  if (!active || !payload?.length) return null;
  const list = payload.filter((p: any) => p.value !== null && p.value !== undefined);
  if (!list.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-lg px-3 py-2 min-w-[160px]">
      <div className="text-body font-mono font-bold text-slate-500 mb-1.5">{label}</div>
      <div className="space-y-1">
        {list.map((p: any) => {
          const meta = points.find((x: DevicePoint) => x.key === p.dataKey);
          return (
            <div key={p.dataKey} className="flex items-center justify-between gap-4 text-body">
              <span className="flex items-center gap-1.5 font-bold text-slate-600">
                <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                {meta?.label ?? p.dataKey}
              </span>
              <span className="font-mono font-bold text-slate-800">
                {typeof p.value === 'number' ? p.value.toFixed(meta?.decimals ?? 1) : p.value}
                <span className="text-label font-normal text-slate-400 ml-0.5">
                  {meta ? pointUnit(meta) : ''}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ==========================================================================
   主页面
   ========================================================================== */

const DeviceMonitorPage: React.FC = () => {
  const [tab, setTab] = useState<'data' | 'compare'>('data');

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3">
      {/* 标题 */}
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-black text-slate-800 tracking-tight">设备监控</h2>
          <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 text-label font-bold border border-sky-100">
            站点 #0241
          </span>
          <span className="text-body text-slate-400 font-medium">
            按设备查测点，或跨设备把测点摆在一起比
          </span>
        </div>
      </div>

      <PageTabs value={tab} onChange={setTab} />

      {tab === 'data' ? <DeviceDataPanel /> : <ComparePanel />}
    </div>
  );
};

/* ==========================================================================
   Tab 1 · 设备数据
   ========================================================================== */

const DeviceDataPanel: React.FC = () => {
  const [deviceId, setDeviceId] = useState(DEFAULT_DEVICE_ID);
  const device = findDevice(deviceId);
  const chartPoints = useMemo(() => chartablePoints(device.points), [device]);

  /** 默认勾前两个「有数据」的测点：空列勾上也是条看不见的线，反而让人以为图坏了 */
  const defaultPoints = (id: string) =>
    chartablePoints(findDevice(id).points)
      .filter((p) => !p.noData)
      .slice(0, 2)
      .map((p) => p.key);

  const [selected, setSelected] = useState<string[]>(() => defaultPoints(DEFAULT_DEVICE_ID));

  const [innerTab, setInnerTab] = useState<'history' | 'latest' | 'control'>('history');
  const [date, setDate] = useState('2026-11-17');

  /** 充电控制条的提示走页面级 flash，避免它自己再挂一套提示 DOM */
  const [chargerHint, setChargerHint] = useState<{ text: string; tone: 'ok' | 'warn' } | null>(null);
  const chargerFlash = (text: string, tone: 'ok' | 'warn' = 'ok') => {
    setChargerHint({ text, tone });
    window.setTimeout(() => setChargerHint(null), 2600);
  };

  const handlePickDevice = (id: string) => {
    setDeviceId(id);
    setSelected(defaultPoints(id));
    setInnerTab('history');
  };

  const togglePoint = (key: string) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const activePoints = chartPoints.filter((p) => selected.includes(p.key));
  const chartData = useMemo(() => buildHistoryData(activePoints, date, DAY_BUCKETS), [activePoints, date]);

  const shiftDate = (delta: number) => {
    const d = new Date(`${date}T00:00:00`);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className="flex-1 min-h-[560px] flex gap-3 items-stretch">
      <DeviceTreePanel activeId={deviceId} onSelect={handlePickDevice} />

      <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-3">
        {/* 充电桩操作提示：挂在设备卡片上方，跟其他页的 flash 一致 */}
        {chargerHint && (
          <div
            className={`shrink-0 px-3 py-1.5 rounded-lg text-body font-bold ${
              chargerHint.tone === 'warn'
                ? 'bg-amber-500/90 text-white'
                : 'bg-slate-900/90 text-white'
            }`}
          >
            {chargerHint.text}
          </div>
        )}

        {/* 设备信息 */}
        <div className="shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3.5 flex items-start gap-4">
          <DeviceThumb kind={device.kind} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-heading font-black text-slate-800">{device.name}</span>
              <span
                className={`px-1.5 py-[1px] rounded text-label font-bold border ${
                  device.online
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {device.online ? '在线' : '离线'}
              </span>
              <span className="px-1.5 py-[1px] rounded text-label font-bold bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-0.5">
                <AlertTriangle size={9} />
                正常 ({device.alarms})
              </span>
            </div>
            <div className="mt-1.5 text-body text-slate-400 font-mono truncate" title={`SN：${device.sn}`}>SN：{device.sn}</div>
            <div className="mt-1 text-body text-slate-400">
              共 {device.points.length} 个测点
              {device.children?.length ? ` · 下挂 ${device.children.length} 台设备` : ''}
            </div>
          </div>
          <div className="hidden min-[1440px]:flex items-center gap-4 pl-4 pr-1 ml-1 border-l border-slate-100 shrink-0">
            {[
              { label: '所属站点', value: '站点 #0241' },
              { label: '最近上报', value: `${date} 14:26:08` },
            ].map((it) => (
              <div key={it.label}>
                <div className="text-label font-bold text-slate-400 mb-0.5">{it.label}</div>
                <div className="text-body font-bold text-slate-700 font-mono">{it.value}</div>
              </div>
            ))}
          </div>
          {device.kind !== 'charger' && (
            <button
              className="p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
              title="编辑设备信息"
            >
              <Pencil size={14} />
            </button>
          )}
        </div>

        {/* 充电桩：设备卡片下方挂充放电控制条（开始充电/放电先弹功率，停止充放电共用） */}
        {device.kind === 'charger' && <ChargerControl device={device} flash={chargerFlash} />}

        {/* 数据区 */}
        <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="shrink-0 px-4 pt-3 flex items-center justify-between border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-5">
              {[
                { key: 'history' as const, label: '历史数据' },
                { key: 'latest' as const, label: '最新数据' },
                ...(device.doCount
                  ? [{ key: 'control' as const, label: '自定义控制' }]
                  : []),
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setInnerTab(t.key)}
                  className={`relative pb-2.5 text-sub transition-colors ${
                    innerTab === t.key ? 'font-black text-slate-800' : 'font-bold text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t.label}
                  {innerTab === t.key && (
                    <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              ))}
            </div>

            <div className={`flex items-center gap-1 pb-1.5 ${innerTab === 'control' ? 'invisible' : ''}`}>
              <button
                onClick={() => shiftDate(-1)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              >
                <ChevronRight size={14} className="rotate-180" />
              </button>
              <div className="flex items-center gap-1.5 px-2 h-7 rounded-md border border-slate-200 bg-white min-w-[142px]">
                <CalendarRange size={12} className="text-slate-400 shrink-0" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-body font-bold font-mono text-slate-700 bg-transparent outline-none w-full min-w-0"
                />
              </div>
              <button
                onClick={() => shiftDate(1)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {innerTab === 'history' ? (
            <div className="flex-1 min-h-0 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-body font-bold text-slate-400">
                  设备测点
                  <span className="ml-1.5 font-normal text-slate-300">勾选后画到同一张图，可多选</span>
                </span>
                <span className="text-body text-slate-400">
                  已选 <b className="text-emerald-600">{activePoints.length}</b> / {chartPoints.length}
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/40 px-3 py-2 max-h-[134px] overflow-y-auto grid grid-cols-2 lg:grid-cols-3 min-[1400px]:grid-cols-4 gap-x-5">
                {chartPoints.map((p) => {
                  const on = selected.includes(p.key);
                  return (
                    <CheckBox
                      key={p.key}
                      dense
                      checked={on}
                      onChange={() => togglePoint(p.key)}
                      label={
                        <span className="flex items-center gap-1.5">
                          <span className="truncate">{p.label}</span>
                          {p.unit !== '-' && <span className="text-label text-slate-400">{p.unit}</span>}
                          {p.noData && <span className="text-caption text-slate-300">无数据</span>}
                        </span>
                      }
                    />
                  );
                })}
              </div>

              {activePoints.length > 0 ? (
                <>
                  <div className="flex items-center gap-4 flex-wrap mt-3 mb-1">
                    {activePoints.map((p, i) => (
                      <LegendChip
                        key={p.key}
                        color={SERIES_COLORS[i % SERIES_COLORS.length]}
                        label={`${p.label}${pointUnit(p) ? `（${pointUnit(p)}）` : ''}`}
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis
                          dataKey="t"
                          tick={{ fontSize: 10, fill: '#94A3B8' }}
                          axisLine={{ stroke: '#E2E8F0' }}
                          tickLine={false}
                          interval={Math.ceil(DAY_BUCKETS / 8)}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#94A3B8' }}
                          axisLine={false}
                          tickLine={false}
                          width={52}
                          tickFormatter={(v: number) => (Math.abs(v) >= 10000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
                        />
                        <Tooltip content={<ChartTooltip points={activePoints} />} />
                        {activePoints.map((p, i) => (
                          <Line
                            key={p.key}
                            type="monotone"
                            dataKey={p.key}
                            stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                            strokeWidth={1.8}
                            dot={false}
                            connectNulls={false}
                            isAnimationActive={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-label text-slate-300 mt-1">
                    采样间隔 15 分钟 · 共 {DAY_BUCKETS} 个点 · {date} 00:00 ~ 23:59
                  </div>
                </>
              ) : (
                <EmptyState icon={<BarChart3 size={26} />} title="还没选测点" hint="在上面勾几个测点，曲线会画到这里" />
              )}
            </div>
          ) : innerTab === 'latest' ? (
            <div className="flex-1 min-h-0 p-4 overflow-y-auto">
              <div className="text-body font-bold text-slate-400 mb-2">
                设备测点 · 最新值
                <span className="ml-1.5 font-normal text-slate-300">采集时间 {date} 10:49:30</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 border-t border-slate-100">
                {device.points.map((p) => (
                  <div
                    key={p.key}
                    className="flex items-center justify-between gap-3 py-2 border-b border-slate-50"
                  >
                    <span className="text-body text-slate-500 truncate">{p.label}</span>
                    <span className="flex items-baseline gap-1 shrink-0">
                      <span
                        className={`font-mono text-sub font-bold ${
                          latestText(p) === '--' ? 'text-slate-300' : 'text-slate-800'
                        }`}
                      >
                        {latestText(p)}
                      </span>
                      {pointUnit(p) && <span className="text-label text-slate-400">{pointUnit(p)}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <DoControlPanel key={device.id} device={device} />
          )}
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   Tab 3 · 自定义控制（仅网关）
   --------------------------------------------------------------------------
   网关自带 DO（数字输出）口，现场拿它去开补光、水泵、风机这类外接回路。
   DO 口数量不是用户填的，是设备上报的（device.doCount），所以这里只读。

   交互顺序是「先建控制、再选口」：
   页面上列的是**已经配好的控制项**，而不是一排空 DO 口。没被占用的口不铺出来，
   只在新建时的下拉里出现——4 路常常只用了 1~2 路，全铺一遍剩下的都是没用的空行。

   一条控制 = 控制名称 + 绑定的 DO 口 + 高/低两个动作名。
   动作名记的是「干什么」而不是「什么电平」，所以允许改成本地说法。
   配置存在本地，刷新页面还在——不然演示时一刷新就丢了。
   ========================================================================== */

interface DoControl {
  id: string;
  /** 绑定的 DO 口，DO1…DOn */
  port: string;
  /** 控制名称，如「补光灯」 */
  name: string;
  /** 高电平对应的动作名 */
  high: string;
  /** 低电平对应的动作名 */
  low: string;
  /** 当前输出电平 */
  state: 'high' | 'low';
}

interface ControlDraft {
  name: string;
  port: string;
  high: string;
  low: string;
}

const ctrlStorageKey = (deviceId: string) => `devmon_ctrl_${deviceId}`;

const emptyDraft: ControlDraft = { name: '', port: '', high: '', low: '' };

const portIndex = (port: string) => Number(port.replace(/\D/g, '')) || 0;

/** 预置一条示例：打开就有形态，可以改也可以删 */
const seedControls = (): DoControl[] => [
  { id: 'seed-1', port: 'DO1', name: '补光灯', high: '开灯', low: '关灯', state: 'low' },
];

/** 读本地配置；换网关时把不属于这台设备的口滤掉，别串设备 */
function loadControls(deviceId: string, count: number): DoControl[] {
  try {
    const raw = localStorage.getItem(ctrlStorageKey(deviceId));
    if (!raw) return seedControls();
    const saved = JSON.parse(raw) as DoControl[];
    if (!Array.isArray(saved)) return seedControls();
    return saved.filter((c) => c && portIndex(c.port) >= 1 && portIndex(c.port) <= count);
  } catch {
    return seedControls();
  }
}

const DoControlPanel: React.FC<{ device: DeviceNode }> = ({ device }) => {
  const count = device.doCount ?? 0;
  const [controls, setControls] = useState<DoControl[]>(() => loadControls(device.id, count));
  /** null = 弹层关着；'new' = 新建；其它 = 正在编辑的控制 id */
  const [sheet, setSheet] = useState<string | null>(null);
  const [draft, setDraft] = useState<ControlDraft>(emptyDraft);
  const [err, setErr] = useState('');
  const [hint, setHint] = useState<{ text: string; tone: 'ok' | 'warn' } | null>(null);

  useEffect(() => {
    localStorage.setItem(ctrlStorageKey(device.id), JSON.stringify(controls));
  }, [device.id, controls]);

  const flash = (text: string, tone: 'ok' | 'warn' = 'ok') => {
    setHint({ text, tone });
    window.setTimeout(() => setHint(null), 2600);
  };

  const allPorts = useMemo(
    () => Array.from({ length: count }, (_, i) => `DO${i + 1}`),
    [count],
  );

  /** 编辑中的那条，把它自己占的口放回可选列表，否则改不了自己的口 */
  const editing = sheet && sheet !== 'new' ? controls.find((c) => c.id === sheet) : undefined;
  const usedPorts = new Set(controls.filter((c) => c.id !== editing?.id).map((c) => c.port));
  const freePorts = allPorts.filter((p) => !usedPorts.has(p));

  /* 列表按 DO 口编号排，而不是按创建顺序 */
  const sorted = useMemo(
    () => [...controls].sort((a, b) => portIndex(a.port) - portIndex(b.port)),
    [controls],
  );

  const openNew = () => {
    if (freePorts.length === 0) {
      flash(`DO 口已全部占用（共 ${count} 路），先删一条再新建`, 'warn');
      return;
    }
    setDraft({ ...emptyDraft, port: freePorts[0] });
    setErr('');
    setSheet('new');
  };

  const openEdit = (c: DoControl) => {
    setDraft({ name: c.name, port: c.port, high: c.high, low: c.low });
    setErr('');
    setSheet(c.id);
  };

  const closeSheet = () => {
    setSheet(null);
    setErr('');
  };

  const submit = () => {
    const name = draft.name.trim();
    const high = draft.high.trim();
    const low = draft.low.trim();
    if (!name) {
      setErr('控制名称不能为空');
      return;
    }
    if (!draft.port) {
      setErr('要先选一个 DO 口');
      return;
    }
    if (!high || !low) {
      setErr('高电平、低电平的动作名都不能为空');
      return;
    }
    if (controls.some((c) => c.id !== editing?.id && c.port === draft.port)) {
      setErr(`${draft.port} 已经被另一条控制占用`);
      return;
    }

    if (editing) {
      setControls((prev) =>
        prev.map((c) =>
          c.id === editing.id ? { ...c, name, port: draft.port, high, low } : c,
        ),
      );
      flash(`「${name}」已保存 · 绑定 ${draft.port}`);
    } else {
      setControls((prev) => [
        ...prev,
        { id: `c-${Date.now()}`, port: draft.port, name, high, low, state: 'low' as const },
      ]);
      flash(`已新建控制「${name}」· 绑定 ${draft.port}`);
    }
    closeSheet();
  };

  const remove = (c: DoControl) => {
    setControls((prev) => prev.filter((x) => x.id !== c.id));
    flash(`已删除「${c.name}」，${c.port} 已释放`);
  };

  /** 下发一次电平：原型只切状态，不真的控设备 */
  const applyLevel = (c: DoControl, state: 'high' | 'low') => {
    const label = state === 'high' ? c.high : c.low;
    setControls((prev) => prev.map((x) => (x.id === c.id ? { ...x, state } : x)));
    flash(`${c.name} 已下发「${label}」· ${state === 'high' ? '高电平' : '低电平'}`);
  };

  return (
    <div className="relative flex-1 min-h-0 p-4 flex flex-col">
      {/* 头：路数来自设备，不是可填项 */}
      <div className="shrink-0 flex items-start justify-between gap-4 mb-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-title font-black text-slate-800">DO 口配置</span>
            <span className="px-1.5 py-[1px] rounded bg-slate-50 border border-slate-100 text-label font-bold text-slate-500">
              已用 {controls.length} / {count} 路
            </span>
          </div>
          {/* 提示信息原地替换副标题，不额外占位，避免出现时把表格顶下去 */}
          <div className="mt-1 text-label truncate">
            {hint ? (
              <span
                className={`font-bold ${hint.tone === 'warn' ? 'text-amber-600' : 'text-emerald-600'}`}
              >
                {hint.text}
              </span>
            ) : (
              <span className="text-slate-400">
                每条控制绑定一个 DO 口；口数由设备上报（{device.sn}），没用到的口不在这里列
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => flash(`已从网关重新读取 DO 口数量：${count} 路`)}
            className="h-7 px-2.5 rounded-md border border-slate-200 text-label font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
          >
            <RefreshCw size={11} />
            重新读取
          </button>
          <button
            onClick={openNew}
            className="h-7 px-3 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-label font-bold flex items-center gap-1"
          >
            <Plus size={12} />
            新建控制
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex-1 min-h-[180px] rounded-xl border border-dashed border-slate-200 bg-slate-50/30 flex flex-col items-center justify-center gap-1.5">
          <span className="text-sub font-bold text-slate-400">还没有设备控制</span>
          <span className="text-label text-slate-300">
            选一个没用到的 DO 口，配上高/低电平各要做什么
          </span>
          <button
            onClick={openNew}
            className="mt-1.5 h-7 px-3 rounded-md border border-emerald-200 text-emerald-700 text-label font-bold hover:bg-emerald-50 flex items-center gap-1"
          >
            <Plus size={12} />
            新建控制
          </button>
        </div>
      ) : (
        <div className="shrink-0 overflow-auto rounded-xl border border-slate-100">
          <table className="w-full text-body">
            <thead>
              <tr className="bg-slate-50/70">
                <th className="text-left px-4 py-2 font-bold text-slate-500">控制名称</th>
                <th className="text-left px-4 py-2 font-bold text-slate-500 whitespace-nowrap w-[120px]">
                  绑定 DO 口
                </th>
                <th className="text-left px-4 py-2 font-bold text-slate-500 whitespace-nowrap w-[170px]">
                  当前状态
                </th>
                <th className="text-left px-4 py-2 font-bold text-slate-500">执行动作</th>
                <th className="text-right px-4 py-2 font-bold text-slate-500 whitespace-nowrap w-[96px]">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => {
                const isHigh = c.state === 'high';
                const current = isHigh ? c.high : c.low;
                return (
                  <tr key={c.id} className="border-t border-slate-50 hover:bg-slate-50/40">
                    <td className="px-4 py-2.5">
                      <span
                        title={c.name}
                        className="block max-w-[190px] truncate font-bold text-slate-800"
                      >
                        {c.name}
                      </span>
                    </td>

                    <td className="px-4 py-2.5">
                      <span className="font-mono font-bold text-slate-600 px-1.5 py-[1px] rounded bg-slate-50 border border-slate-100">
                        {c.port}
                      </span>
                    </td>

                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isHigh ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        />
                        <span
                          title={current}
                          className={`font-bold truncate max-w-[130px] ${
                            isHigh ? 'text-emerald-600' : 'text-slate-500'
                          }`}
                        >
                          {current}
                        </span>
                        {/* 名字就是「高电平/低电平」时不用再补一遍电平，改名了才需要 */}
                        {current !== (isHigh ? '高电平' : '低电平') && (
                          <span className="text-label text-slate-300 shrink-0">
                            （{isHigh ? '高' : '低'}）
                          </span>
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => applyLevel(c, 'high')}
                          className={`h-7 px-3 rounded-md border text-label font-bold transition-colors ${
                            isHigh
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {c.high}
                        </button>
                        <button
                          onClick={() => applyLevel(c, 'low')}
                          className={`h-7 px-3 rounded-md border text-label font-bold transition-colors ${
                            !isHigh
                              ? 'bg-slate-700 border-slate-700 text-white'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {c.low}
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                          title="编辑这条控制"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => remove(c)}
                          className="p-1.5 rounded-md text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                          title="删除这条控制，DO 口回收"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 空态时不再叠一个预留框，两个虚线框摞一起太像占位符 */}
      {sorted.length > 0 && (
        <>
          <div className="shrink-0 text-label text-slate-300 mt-2">
            点动作按钮即下发控制指令（原型只切换状态，不下发到真实设备）· 配置存在本机，刷新后仍在
          </div>

          {/* 预留位：后续的网关其他配置（如 DI 口、上电状态、联动）放这块，先留空 */}
          <div className="flex-1 min-h-[96px] mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/40 flex flex-col items-center justify-center gap-1">
            <span className="text-label font-bold text-slate-300">预留区域</span>
            <span className="text-label text-slate-300/70">后续网关的其他配置放这里</span>
          </div>
        </>
      )}

      {/* 新建 / 编辑：先选口，再配两个电平的动作名 */}
      {sheet && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/30 flex items-center justify-center p-6"
          onClick={closeSheet}
        >
          <div
            className="w-[460px] max-w-full bg-white rounded-2xl border border-slate-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between">
              <span className="text-title font-black text-slate-800">
                {editing ? '编辑控制' : '新建控制'}
              </span>
              <button
                onClick={closeSheet}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              >
                <X size={14} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-3.5">
              <div>
                <label className="block text-label font-bold text-slate-500 mb-1">控制名称</label>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder="如：1 号补光灯"
                  className="h-8 w-full px-2.5 rounded-md border border-slate-200 text-body text-slate-700 outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-label font-bold text-slate-500 mb-1">
                  绑定 DO 口
                  <span className="ml-1.5 font-normal text-slate-300">
                    只剩 {freePorts.length} 个没用到的口
                  </span>
                </label>
                <select
                  value={draft.port}
                  onChange={(e) => setDraft((d) => ({ ...d, port: e.target.value }))}
                  className="h-8 w-full px-2 rounded-md border border-slate-200 text-body text-slate-700 outline-none focus:border-emerald-400 bg-white"
                >
                  {freePorts.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label font-bold text-slate-500 mb-1">高电平动作</label>
                  <input
                    value={draft.high}
                    onChange={(e) => setDraft((d) => ({ ...d, high: e.target.value }))}
                    placeholder="如：开灯"
                    className="h-8 w-full px-2.5 rounded-md border border-slate-200 text-body text-slate-700 outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-label font-bold text-slate-500 mb-1">低电平动作</label>
                  <input
                    value={draft.low}
                    onChange={(e) => setDraft((d) => ({ ...d, low: e.target.value }))}
                    placeholder="如：关灯"
                    className="h-8 w-full px-2.5 rounded-md border border-slate-200 text-body text-slate-700 outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="text-label text-slate-300">
                动作名按现场说法填，比如「开启 / 关闭」「切入 / 切出」，列表里显示的就是这两个名字
              </div>

              {err && <div className="text-label font-bold text-amber-600">{err}</div>}
            </div>

            <div className="px-5 py-3 border-t border-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={closeSheet}
                className="h-7 px-3 rounded-md border border-slate-200 text-label font-bold text-slate-600 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={submit}
                className="h-7 px-3 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-label font-bold"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- 左侧设备树 ---------- */
const DeviceTreePanel: React.FC<{ activeId: string; onSelect: (id: string) => void }> = ({
  activeId,
  onSelect,
}) => {
  const [keyword, setKeyword] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set([...pathToDevice(DEFAULT_DEVICE_ID), 'tr-2']),
  );

  /** 选中项变了，把它所在路径展开，否则树里找不到高亮 */
  React.useEffect(() => {
    setExpanded((prev) => new Set([...prev, ...pathToDevice(activeId)]));
  }, [activeId]);

  const q = keyword.trim().toLowerCase();

  /** 搜索：命中节点或它的后代命中就保留，命中时强制展开 */
  const visible = useMemo(() => {
    if (!q) return DEVICE_TREE;
    const filter = (nodes: DeviceNode[]): DeviceNode[] =>
      nodes
        .map((n) => {
          const hit = n.name.toLowerCase().includes(q) || n.sn.toLowerCase().includes(q);
          const kids = n.children ? filter(n.children) : [];
          if (hit) return { ...n, children: n.children };
          if (kids.length) return { ...n, children: kids };
          return null;
        })
        .filter(Boolean) as DeviceNode[];
    return filter(DEVICE_TREE);
  }, [q]);

  const isOpen = (id: string) => (q ? true : expanded.has(id));

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const renderNode = (node: DeviceNode, depth: number): React.ReactNode => {
    const hasKids = !!node.children?.length;
    const open = isOpen(node.id);
    const active = node.id === activeId;
    const tone = KIND_TONE[node.kind];

    return (
      <div key={node.id}>
        <button
          onClick={() => {
            if (hasKids) toggle(node.id);
            onSelect(node.id);
          }}
          className={`w-full flex items-center gap-1.5 pr-2 py-[5px] rounded-lg transition-colors ${
            active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
          style={{ paddingLeft: 6 + depth * 11 }}
        >
          {hasKids ? (
            <ChevronRight
              size={12}
              className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`}
            />
          ) : (
            <span className="w-3 shrink-0" />
          )}
          <span className="shrink-0" style={{ color: active ? '#059669' : tone.text }}>
            {KIND_ICON_SM[node.kind]}
          </span>
          <span
            title={node.name}
            className={`flex-1 min-w-0 text-left text-body truncate ${active ? 'font-bold' : ''}`}
          >
            {node.name}
          </span>
          <span className="shrink-0 text-label font-mono text-slate-300">{node.points.length}</span>
        </button>

        {hasKids && open && (
          <div>{node.children!.map((c) => renderNode(c, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-[286px] shrink-0 min-h-0 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
      <div className="shrink-0 px-3 pt-3 pb-2">
        <div className="text-title font-black text-slate-800 mb-2">设备列表</div>
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索设备名称或 SN"
            className="w-full h-7 pl-7 pr-2 rounded-md border border-slate-200 bg-white text-body text-slate-700 placeholder:text-slate-300 outline-none focus:border-emerald-400"
          />
        </div>
      </div>
      <div className="flex-1 min-h-0 px-1.5 pb-3 overflow-y-auto">
        {visible.length ? (
          visible.map((n) => renderNode(n, 0))
        ) : (
          <div className="py-10 text-center text-body text-slate-300">没有匹配的设备</div>
        )}
      </div>
    </aside>
  );
};

/* ==========================================================================
   Tab 2 · 对比分析
   ========================================================================== */

interface PickedPoint {
  key: string;
  deviceId: string;
  deviceName: string;
  point: DevicePoint;
}

const ZONE_DEVICES: Record<string, string[]> = {
  全部设备: [],
  '1号站房': ['gw-16', 'tr-main', 'meter-reverse'],
  '2号站房': ['tr-2', 'meter-reverse-2', 'sensor-th-2', 'ess-3', 'ess-4'],
  '3号站房': ['tr-5', 'tr-1', 'tr-3'],
};

/** 快速选择测点：一次勾一批，省得一个个点 */
const QUICK_PICKS: { label: string; match: (kind: DeviceKind, p: DevicePoint) => boolean }[] = [
  { label: '网关通信测点（信号/内存）', match: (kind, p) => kind === 'gateway' && ['rssi', 'mem'].includes(p.key) },
  { label: '电表电压电流（三相）', match: (kind, p) => kind === 'meter' && ['uA', 'uB', 'uC', 'iA', 'iB', 'iC'].includes(p.key) },
  { label: '变压器温度类', match: (kind, p) => kind === 'transformer' && ['oilTemp', 'windTemp'].includes(p.key) },
  { label: '储能柜 SOC/SOH', match: (kind, p) => kind === 'cabinet' && ['soc', 'soh'].includes(p.key) },
];

const ComparePanel: React.FC = () => {
  const [zone, setZone] = useState('全部设备');
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['gw-16']));
  const [picked, setPicked] = useState<string[]>(() =>
    chartablePoints(findDevice('gw-16').points).map((p) => `gw-16::${p.key}`),
  );
  const [hint, setHint] = useState('');

  const [from, setFrom] = useState('2026-11-16T00:00');
  const [to, setTo] = useState('2026-11-17T10:49');
  const [applied, setApplied] = useState<{ keys: string[]; from: string; to: string }>({
    keys: chartablePoints(findDevice('gw-16').points).map((p) => `gw-16::${p.key}`),
    from: '2026-11-16T00:00',
    to: '2026-11-17T10:49',
  });

  const [view, setView] = useState<'list' | 'chart'>('list');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [jump, setJump] = useState('');

  const flash = (msg: string) => {
    setHint(msg);
    window.setTimeout(() => setHint(''), 2600);
  };

  /** 当前区域下可见的设备树 */
  const visibleTree = useMemo(() => {
    const allow = ZONE_DEVICES[zone];
    if (!allow.length) return DEVICE_TREE;
    const filter = (nodes: DeviceNode[]): DeviceNode[] =>
      nodes
        .map((n) => {
          const kids = n.children ? filter(n.children) : [];
          if (allow.includes(n.id)) return n;
          if (kids.length) return { ...n, children: kids };
          return null;
        })
        .filter(Boolean) as DeviceNode[];
    return filter(DEVICE_TREE);
  }, [zone]);

  const allPicked: PickedPoint[] = useMemo(() => {
    return picked
      .map((key) => {
        const [deviceId, pointKey] = key.split('::');
        const dev = findDevice(deviceId);
        const point = dev.points.find((p) => p.key === pointKey);
        return point ? { key, deviceId, deviceName: dev.name, point } : null;
      })
      .filter(Boolean) as PickedPoint[];
  }, [picked]);

  const appliedPoints: PickedPoint[] = useMemo(() => {
    return applied.keys
      .map((key) => {
        const [deviceId, pointKey] = key.split('::');
        const dev = findDevice(deviceId);
        const point = dev.points.find((p) => p.key === pointKey);
        return point ? { key, deviceId, deviceName: dev.name, point } : null;
      })
      .filter(Boolean) as PickedPoint[];
  }, [applied.keys]);

  /** 统计区跟着「当前勾选」走；图上是「上次生成」的结果，两者不一致时提示一下 */
  const deviceCount = new Set(picked.map((k) => k.split('::')[0])).size;

  const dirty =
    picked.join('|') !== applied.keys.join('|') || from !== applied.from || to !== applied.to;

  const togglePoint = (deviceId: string, point: DevicePoint) => {
    const key = `${deviceId}::${point.key}`;
    setPicked((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= MAX_COMPARE_POINTS) {
        flash(`最多只能同时对比 ${MAX_COMPARE_POINTS} 个测点`);
        return prev;
      }
      return [...prev, key];
    });
  };

  const applyQuickPick = (label: string) => {
    const preset = QUICK_PICKS.find((x) => x.label === label);
    if (!preset) return;
    const next: string[] = [];
    const walk = (nodes: DeviceNode[]) => {
      nodes.forEach((n) => {
        n.points.forEach((p) => {
          if (!p.text && preset.match(n.kind, p)) next.push(`${n.id}::${p.key}`);
        });
        if (n.children) walk(n.children);
      });
    };
    walk(visibleTree);
    const merged = Array.from(new Set([...picked, ...next])).slice(0, MAX_COMPARE_POINTS);
    setPicked(merged);
    flash(`已按「${label}」补充测点，当前 ${merged.length} 个`);
  };

  const applyChart = () => {
    if (!picked.length) {
      flash('先勾选至少一个测点');
      return;
    }
    if (new Date(to) <= new Date(from)) {
      flash('结束时间要晚于开始时间');
      return;
    }
    setApplied({ keys: picked, from, to });
    setPage(1);
    flash(`已生成 ${picked.length} 条曲线`);
  };

  const reset = () => {
    setPicked([]);
    setApplied({ keys: [], from, to });
    setPage(1);
    flash('已清空已选测点');
  };

  const chartData = useMemo(
    () => buildCompareChart(appliedPoints.map((p) => ({ key: p.key, point: p.point })), COMPARE_BUCKETS),
    [appliedPoints],
  );

  const totalPages = Math.max(1, Math.ceil(TOTAL_COMPARE_ROWS / pageSize));
  const currentPage = Math.min(page, totalPages);
  const rowsOfPage = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return Array.from({ length: Math.min(pageSize, TOTAL_COMPARE_ROWS - start) }, (_, i) => start + i);
  }, [currentPage, pageSize]);

  const pageButtons = useMemo(() => {
    const list: (number | '...')[] = [];
    const push = (n: number | '...') => list.push(n);
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) push(i);
    } else {
      push(1);
      if (currentPage > 4) push('...');
      for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i += 1) push(i);
      if (currentPage < totalPages - 3) push('...');
      push(totalPages);
    }
    return list;
  }, [currentPage, totalPages]);

  const renderCompareNode = (node: DeviceNode, depth: number): React.ReactNode => {
    const hasKids = !!node.children?.length;
    const open = expanded.has(node.id);
    const tone = KIND_TONE[node.kind];
    const own = chartablePoints(node.points);
    const pickedHere = own.filter((p) => picked.includes(`${node.id}::${p.key}`)).length;

    return (
      <div key={node.id}>
        <button
          onClick={() =>
            setExpanded((prev) => {
              const next = new Set(prev);
              if (next.has(node.id)) next.delete(node.id);
              else next.add(node.id);
              return next;
            })
          }
          className="w-full flex items-center gap-1.5 pr-2 py-[5px] rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          style={{ paddingLeft: 6 + depth * 11 }}
        >
          <ChevronRight
            size={12}
            className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`}
          />
          <span className="shrink-0" style={{ color: tone.text }}>
            {KIND_ICON_SM[node.kind]}
          </span>
          <span className="flex-1 min-w-0 text-left text-sub truncate">{node.name}</span>
          {pickedHere > 0 && (
            <span className="shrink-0 px-1 rounded bg-emerald-50 text-emerald-600 text-caption font-bold">
              {pickedHere}
            </span>
          )}
          <span className="shrink-0 text-label font-mono text-slate-300">{own.length}</span>
        </button>

        {open && (
          <div>
            {own.map((p) => (
              <div key={p.key} style={{ paddingLeft: 20 + depth * 11 }}>
                <CheckBox
                  dense
                  checked={picked.includes(`${node.id}::${p.key}`)}
                  onChange={() => togglePoint(node.id, p)}
                  label={
                    <span className="flex items-center gap-1">
                      {p.label}
                      {p.unit !== '-' && <span className="text-label text-slate-300">{p.unit}</span>}
                    </span>
                  }
                />
              </div>
            ))}
            {hasKids && node.children!.map((c) => renderCompareNode(c, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-[560px] flex gap-3 items-stretch">
      {/* 左：站点设备 / 测点 */}
      <aside className="w-[286px] shrink-0 min-h-0 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
        <div className="shrink-0 px-3 pt-3">
          <div className="text-title font-black text-slate-800 mb-2">站点设备</div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-2 space-y-1.5">
            <div className="text-label font-bold text-slate-400">快速选择站点</div>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full h-7 px-1.5 rounded-md border border-slate-200 bg-white text-body text-slate-700 outline-none focus:border-emerald-400"
            >
              {Object.keys(ZONE_DEVICES).map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) applyQuickPick(e.target.value);
              }}
              className="w-full h-7 px-1.5 rounded-md border border-slate-200 bg-white text-body text-slate-500 outline-none focus:border-emerald-400"
            >
              <option value="">快速选择测点（多设备）</option>
              {QUICK_PICKS.map((q) => (
                <option key={q.label} value={q.label}>
                  {q.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 min-h-0 px-1.5 py-2 overflow-y-auto">
          {visibleTree.map((n) => renderCompareNode(n, 0))}
        </div>

        <div className="px-3 py-2 border-t border-slate-100 text-label text-slate-400">
          已选 <b className="text-emerald-600 font-mono">{picked.length}</b> / {MAX_COMPARE_POINTS} 个测点
        </div>
      </aside>

      {/* 右：统计周期 + 图/表 */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-3">
        <div className="shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 flex items-stretch gap-x-4 gap-y-3 flex-wrap">
          <div className="flex-[2] min-w-[392px]">
            <div className="text-label font-bold text-slate-400 mb-1">统计周期</div>
            <div className="flex items-center gap-1.5">
              <input
                type="datetime-local"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-7 w-[176px] shrink-0 px-1.5 rounded-md border border-slate-200 text-label font-mono text-slate-700 outline-none focus:border-emerald-400"
              />
              <span className="text-slate-300 text-body">~</span>
              <input
                type="datetime-local"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-7 w-[176px] shrink-0 px-1.5 rounded-md border border-slate-200 text-label font-mono text-slate-700 outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="w-px bg-slate-100 hidden min-[1600px]:block" />

          <div className="w-[104px] shrink-0">
            <div className="text-label font-bold text-slate-400 mb-1">已选设备</div>
            <div className="h-7 flex items-baseline gap-1">
              <span className="font-mono text-[18px] font-black leading-none text-slate-800">{deviceCount}</span>
              <span className="text-label text-slate-400">台</span>
            </div>
          </div>

          <div className="w-px bg-slate-100 hidden min-[1600px]:block" />

          <div className="w-[104px] shrink-0">
            <div className="text-label font-bold text-slate-400 mb-1">已选测点</div>
            <div className="h-7 flex items-baseline gap-1">
              <span className="font-mono text-[18px] font-black leading-none text-emerald-600">
                {picked.length}
              </span>
              <span className="text-label text-slate-400">/ {MAX_COMPARE_POINTS}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end shrink-0 ml-auto">
            {dirty && (
              <span className="flex items-center gap-1 text-label font-bold text-amber-500">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                有改动未生成
              </span>
            )}
            <button
              onClick={() => {
                const all = new Set<string>(expanded);
                const walk = (nodes: DeviceNode[]) =>
                  nodes.forEach((n) => {
                    all.add(n.id);
                    if (n.children) walk(n.children);
                  });
                walk(visibleTree);
                setExpanded(all);
                flash('展开全部设备，在左侧勾选要对比的测点');
              }}
              className="h-7 px-2.5 rounded-md border border-slate-200 text-body font-bold text-slate-600 hover:bg-slate-50"
            >
              编辑已选
            </button>
            <button
              onClick={reset}
              className="h-7 px-2.5 rounded-md border border-slate-200 text-body font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
            >
              <RotateCcw size={11} />
              重置
            </button>
            <button
              onClick={applyChart}
              className="h-7 px-3 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-body font-bold flex items-center gap-1 transition-colors"
            >
              <Sparkles size={11} />
              生成图表
            </button>
          </div>
        </div>

        {hint && (
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-body font-bold">{hint}</div>
        )}

        <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="shrink-0 px-4 py-2.5 flex items-center justify-between border-b border-slate-100">
            <span className="text-sub font-black text-slate-800">测点对比结果</span>
            <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg">
              {[
                { key: 'list' as const, label: '列表', icon: <List size={11} /> },
                { key: 'chart' as const, label: '图表', icon: <BarChart3 size={11} /> },
              ].map((v) => (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-body font-bold transition-colors ${
                    view === v.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {v.icon}
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {appliedPoints.length === 0 ? (
            <div className="flex-1 min-h-0">
              <EmptyState
                icon={<Inbox size={26} />}
                title="还没有生成对比数据"
                hint="左侧勾选测点，点右上角「生成图表」"
              />
            </div>
          ) : view === 'chart' ? (
            <div className="flex-1 min-h-0 p-4 flex flex-col">
              <div className="flex items-center gap-4 flex-wrap mb-2">
                {appliedPoints.map((p, i) => (
                  <LegendChip
                    key={p.key}
                    color={SERIES_COLORS[i % SERIES_COLORS.length]}
                    label={`${p.deviceName}-${p.point.label}${pointUnit(p.point) ? `（${pointUnit(p.point)}）` : ''}`}
                  />
                ))}
              </div>
              {/* 一条轴放不下两种量纲：单位和量级差得远时，明说一句，免得被当成数据错了 */}
              {new Set(appliedPoints.map((p) => pointUnit(p.point))).size > 1 && (
                <div className="text-label text-amber-500 font-bold -mt-1 mb-1">
                  所选测点单位不同，共用一根纵轴；量纲差太大时建议分批对比
                </div>
              )}
              <div className="flex-1 min-h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="t"
                      tick={{ fontSize: 10, fill: '#94A3B8' }}
                      axisLine={{ stroke: '#E2E8F0' }}
                      tickLine={false}
                      interval={Math.ceil(COMPARE_BUCKETS / 9)}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#94A3B8' }}
                      axisLine={false}
                      tickLine={false}
                      width={48}
                    />
                    <Tooltip content={<ChartTooltip points={appliedPoints.map((p) => p.point)} />} />
                    {appliedPoints.map((p, i) => (
                      <Line
                        key={p.key}
                        type="monotone"
                        dataKey={p.key}
                        stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                        strokeWidth={1.8}
                        dot={false}
                        connectNulls={false}
                        isAnimationActive={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-label text-slate-300 mt-1">
                原始采样 15 秒 · 图上按 10 分钟聚合 · 共 {COMPARE_BUCKETS} 个点
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 min-h-0 overflow-auto">
                {/* auto 布局：列少时各列自动摊平铺满，列多时靠 minWidth 触发横向滚动 */}
                <table className="w-full text-body">
                  <thead>
                    <tr className="bg-slate-50/70">
                      <th className="sticky left-0 bg-slate-50/70 text-left px-3 py-2 font-bold text-slate-500 whitespace-nowrap">
                        日期时间
                      </th>
                      {appliedPoints.map((p) => (
                        <th
                          key={p.key}
                          className="text-left px-3 py-2 font-bold text-slate-500 whitespace-nowrap"
                        >
                          <div className="text-label text-slate-400 font-normal">{p.deviceName}</div>
                          <div>
                            {p.point.label}
                            {pointUnit(p.point) && (
                              <span className="text-label text-slate-400 font-normal ml-1">
                                ({pointUnit(p.point)})
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rowsOfPage.map((idx) => (
                      <tr key={idx} className="border-t border-slate-50 hover:bg-slate-50/50">
                        <td className="sticky left-0 bg-white px-3 py-[5px] font-mono text-slate-500 whitespace-nowrap">
                          {compareRowTime(applied.from, idx)}
                        </td>
                        {appliedPoints.map((p) => {
                          const text = compareCellText(p.point, idx);
                          return (
                            <td
                              key={p.key}
                              className={`px-3 py-[5px] font-mono ${
                                text === '--' ? 'text-slate-300' : 'text-slate-700'
                              }`}
                            >
                              {text}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              <div className="shrink-0 flex items-center justify-between gap-3 px-3 py-2.5 border-t border-slate-100 flex-wrap">
                <div className="flex items-center gap-2 text-label text-slate-400">
                  <span>
                    共 <b className="text-slate-600 font-mono">{TOTAL_COMPARE_ROWS}</b> 条记录 /{' '}
                    <b className="text-slate-600 font-mono">{totalPages}</b> 页
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="h-6 px-1 rounded border border-slate-200 text-label text-slate-600 outline-none"
                  >
                    {[10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n} 条/页
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-6 px-2 rounded border border-slate-200 text-label text-slate-500 disabled:opacity-40 hover:bg-slate-50"
                  >
                    上一页
                  </button>
                  {pageButtons.map((b, i) =>
                    b === '...' ? (
                      <span key={`e${i}`} className="px-1 text-label text-slate-300">
                        …
                      </span>
                    ) : (
                      <button
                        key={b}
                        onClick={() => setPage(b)}
                        className={`h-6 min-w-6 px-1.5 rounded text-label font-bold ${
                          b === currentPage
                            ? 'bg-emerald-500 text-white'
                            : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {b}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-6 px-2 rounded border border-slate-200 text-label text-slate-500 disabled:opacity-40 hover:bg-slate-50"
                  >
                    下一页
                  </button>
                  <span className="ml-1 flex items-center gap-1 text-label text-slate-400">
                    跳至
                    <input
                      value={jump}
                      onChange={(e) => setJump(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && jump) {
                          setPage(Math.min(totalPages, Math.max(1, Number(jump))));
                          setJump('');
                        }
                      }}
                      className="w-9 h-6 px-1 rounded border border-slate-200 text-center font-mono text-slate-600 outline-none focus:border-emerald-400"
                    />
                    页
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceMonitorPage;
