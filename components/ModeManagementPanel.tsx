import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';

type ModeType = 'offGrid' | 'onGrid';
type StepState = 'idle' | 'running' | 'done';
type Phase = 'idle' | 'confirm' | 'running' | 'done';

interface StepDef {
  title: string;
  detail: string;
}

interface ModeMeta {
  name: string;
  desc: string[];
  warning?: string;
  steps: StepDef[];
}

const MODE_META: Record<ModeType, ModeMeta> = {
  offGrid: {
    name: '离网模式',
    desc: [
      '切离网运行模式后，禁止电网合闸，否则损坏储能',
      '独立于电网运行，为设备提供应急电源',
    ],
    warning: '离网运行期间严禁电网侧合闸；如需恢复电网供电，必须先将储能切回并网模式',
    steps: [
      { title: '储能停机状态检测', detail: '确认储能变流器处于停机状态，方可执行模式切换' },
      { title: '储能SOC校验', detail: '校验当前SOC ≥ 20%，满足离网带载需求' },
      { title: '离网模式指令下发', detail: '向储能变流器下发离网运行模式指令，并等待设备ACK' },
      { title: '电网断电状态确认', detail: '确认电网侧已断开，避免并/离网同时带电' },
      { title: '储能开机', detail: '下发开机指令，储能建立离网电压与频率' },
      { title: '离网输出校验', detail: '校验输出电压 380V±5%、频率 50Hz±0.5Hz' },
      { title: '切换结果确认', detail: '汇总校验结果，确认离网切换完成' },
    ],
  },
  onGrid: {
    name: '并网模式',
    desc: ['与电网相连，并网运行，支持多种控制策略'],
    steps: [
      { title: '储能停机状态检测', detail: '确认储能变流器处于停机状态，方可执行模式切换' },
      { title: '电网合闸状态确认', detail: '确认电网侧已合闸，线路带电正常' },
      { title: '并网模式指令下发', detail: '向储能变流器下发并网运行模式指令，并等待设备ACK' },
      { title: '电网供电校验', detail: '校验电网电压/频率处于并网允许范围' },
      { title: '储能开机', detail: '下发开机指令，储能并网跟随运行' },
      { title: '切换结果确认', detail: '汇总校验结果，确认并网切换完成' },
    ],
  },
};

const STEP_MS = 750;

const ModeManagementPanel: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<ModeType>('onGrid');
  const [selectedMode, setSelectedMode] = useState<ModeType>('onGrid');
  const [phase, setPhase] = useState<Phase>('idle');
  const [stepStates, setStepStates] = useState<StepState[]>(MODE_META.onGrid.steps.map(() => 'idle'));
  const [showToast, setShowToast] = useState(false);

  const targetMeta = MODE_META[selectedMode];
  const isSwitchPending = selectedMode !== currentMode;
  const busy = phase === 'confirm' || phase === 'running';
  const runningIdx = stepStates.indexOf('running');

  const handleSelect = (m: ModeType) => {
    if (busy) return;
    setSelectedMode(m);
    setPhase('idle');
    setStepStates(MODE_META[m].steps.map(() => 'idle'));
  };

  /* 切换执行：逐步点亮 校验中 → 通过，全部完成后落位当前模式 */
  useEffect(() => {
    if (phase !== 'running') return;
    const timers: number[] = [];
    targetMeta.steps.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => {
          setStepStates((prev) => prev.map((s, idx) => (idx === i ? 'running' : s)));
        }, i * STEP_MS)
      );
      timers.push(
        window.setTimeout(() => {
          setStepStates((prev) => prev.map((s, idx) => (idx === i ? 'done' : s)));
        }, (i + 1) * STEP_MS)
      );
    });
    timers.push(
      window.setTimeout(() => {
        setCurrentMode(selectedMode);
        setPhase('done');
        setShowToast(true);
        window.setTimeout(() => setShowToast(false), 3000);
      }, (targetMeta.steps.length + 0.4) * STEP_MS)
    );
    return () => timers.forEach((t) => clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const stepTitleText =
    phase === 'running'
      ? `正在切换至${targetMeta.name}…`
      : phase === 'done' && selectedMode === currentMode
      ? `${targetMeta.name}切换已完成`
      : `${targetMeta.name}切换操作 & 校验步骤`;

  return (
    <div className="flex-1 flex flex-col gap-4 relative min-h-0">
      {/* 模式选择卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        {(['offGrid', 'onGrid'] as ModeType[]).map((m) => {
          const selected = selectedMode === m;
          const isCurrent = currentMode === m;
          return (
            <button
              key={m}
              onClick={() => handleSelect(m)}
              disabled={busy}
              className={`relative text-left rounded-lg border p-4 pt-3.5 transition-all duration-200 ${
                busy ? 'cursor-not-allowed'
                  : selected
                  ? 'border-emerald-400 bg-emerald-50/70 shadow-sm cursor-pointer'
                  : 'border-slate-200 bg-white hover:border-emerald-300 cursor-pointer'
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-2.5 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                  当前模式
                </span>
              )}
              <div className="text-sm font-black text-slate-800 mb-1.5">{MODE_META[m].name}</div>
              {MODE_META[m].desc.map((d, i) => (
                <div key={i} className="text-xs text-slate-400 leading-relaxed">{d}</div>
              ))}
            </button>
          );
        })}
      </div>

      {/* 步骤标题 + 执行进度 */}
      <div className="flex items-center justify-between mt-1">
        <div className="text-sm font-black text-slate-800 tracking-tight">{stepTitleText}</div>
        {phase === 'running' && (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            执行中 第{Math.min(runningIdx + 1, targetMeta.steps.length)}/{targetMeta.steps.length} 步
          </span>
        )}
      </div>

      {/* 执行中提示 / 完成结果 */}
      {phase === 'running' && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-2">
          <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />
          <span className="text-[11px] text-blue-700 font-bold">切换执行中，请勿离开本页面或对站点执行其它操作</span>
        </div>
      )}
      {phase === 'done' && selectedMode === currentMode && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="text-[11px] text-emerald-700 font-bold">
            {targetMeta.steps.length} 项校验与指令全部通过，站点已切换至{targetMeta.name}运行
          </span>
        </div>
      )}
      {/* 离网模式的常驻安全提示 */}
      {currentMode === 'offGrid' && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50/70 px-3 py-2 max-w-3xl">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
          <span className="text-[11px] text-rose-600 font-bold leading-relaxed">{MODE_META.offGrid.warning}</span>
        </div>
      )}

      {/* 校验步骤（左右交错布局，带执行状态） */}
      <div className="flex flex-col">
        {targetMeta.steps.map((step, i) => {
          const stepNo = i + 1;
          const isEven = stepNo % 2 === 0;
          const isLast = stepNo === targetMeta.steps.length;
          const st = stepStates[i];
          return (
            <div key={`${selectedMode}-${stepNo}`} className={isEven ? 'ml-[30%]' : ''}>
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full text-white text-[11px] font-black flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                    st === 'done'
                      ? 'bg-emerald-500'
                      : st === 'running'
                      ? 'bg-emerald-400'
                      : 'bg-slate-300'
                  }`}
                >
                  {st === 'done' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : st === 'running' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    stepNo
                  )}
                </span>
                <div
                  className={`border rounded-lg px-4 py-2 shadow-sm w-72 transition-colors ${
                    st === 'done'
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : st === 'running'
                      ? 'bg-white border-emerald-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-700">{step.title}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        st === 'done'
                          ? 'text-emerald-600 bg-emerald-100'
                          : st === 'running'
                          ? 'text-blue-600 bg-blue-50 border border-blue-200'
                          : 'text-slate-400 bg-slate-100'
                      }`}
                    >
                      {st === 'done' ? '通过' : st === 'running' ? '校验中' : '待执行'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">{step.detail}</div>
                </div>
              </div>
              {!isLast && (
                <div className="h-4 ml-[10px] border-l-2 border-dashed border-slate-200"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* 切换按钮（选中非当前模式时出现） */}
      {isSwitchPending && phase === 'idle' && (
        <div className="sticky bottom-4 flex justify-end pr-2 mt-auto">
          <button
            onClick={() => setPhase('confirm')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black px-5 py-2.5 rounded-lg shadow-md transition-all"
          >
            切换至{targetMeta.name}
          </button>
        </div>
      )}

      {/* 二次确认弹窗 */}
      {phase === 'confirm' && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4"
          onClick={() => setPhase('idle')}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">确认切换至{targetMeta.name}？</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              将按 {targetMeta.steps.length} 个步骤自动执行校验与切换指令，过程中请勿对本站执行其它操作。
            </p>
            {targetMeta.warning && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-rose-600 font-bold leading-relaxed">{targetMeta.warning}</span>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setPhase('idle')}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setStepStates(targetMeta.steps.map(() => 'idle'));
                  setPhase('running');
                }}
                className="px-5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-sm transition-all cursor-pointer"
              >
                确认切换
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 切换成功 Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A2A3A]/95 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-[#2C3E50] animate-in fade-in slide-in-from-bottom-5 backdrop-blur-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          已切换至{MODE_META[currentMode].name}，模式切换指令执行完成
        </div>
      )}
    </div>
  );
};

export default ModeManagementPanel;
