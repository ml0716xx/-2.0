import React, { useState } from 'react';

type ModeType = 'offGrid' | 'onGrid';

interface ModeMeta {
  name: string;
  desc: string[];
  stepTitle: string;
  steps: string[];
}

const MODE_META: Record<ModeType, ModeMeta> = {
  offGrid: {
    name: '离网模式',
    desc: [
      '切离网运行模式后，禁止电网合闸，否则损坏储能',
      '独立于电网运行，为设备提供应急电源',
    ],
    stepTitle: '储能离网模式切换操作 & 校验步骤',
    steps: [
      '储能停机状态检测',
      '储能SOC是否满足离网需求',
      '储能是否切换至离网模式',
      '储能切换离网模式',
      '电网断电状态确认',
      '设置储能开机',
      '确认切换离网模式结果',
    ],
  },
  onGrid: {
    name: '并网模式',
    desc: ['与电网相连，并网运行，支持多种控制策略'],
    stepTitle: '储能并网模式切换操作 & 校验步骤',
    steps: [
      '储能停机状态检测',
      '电网合闸状态确认',
      '储能切换并网模式',
      '确认电网正常供电',
      '设置储能开机',
      '确认切换并网模式结果',
    ],
  },
};

const ModeManagementPanel: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<ModeType>('offGrid');
  const [selectedMode, setSelectedMode] = useState<ModeType>('offGrid');
  const [showToast, setShowToast] = useState(false);

  const meta = MODE_META[selectedMode];
  const isSwitchPending = selectedMode !== currentMode;

  const handleSelect = (m: ModeType) => setSelectedMode(m);

  const handleSwitch = () => {
    setCurrentMode(selectedMode);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

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
              className={`relative text-left rounded-lg border p-4 pt-3.5 transition-all duration-200 ${
                selected
                  ? 'border-emerald-400 bg-emerald-50/70 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-emerald-300'
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

      {/* 步骤标题 */}
      <div className="text-sm font-black text-slate-800 mt-1 tracking-tight">{meta.stepTitle}</div>

      {/* 校验步骤（左右交错布局） */}
      <div className="flex flex-col">
        {meta.steps.map((step, i) => {
          const stepNo = i + 1;
          const isEven = stepNo % 2 === 0;
          const isLast = stepNo === meta.steps.length;
          return (
            <div key={`${selectedMode}-${stepNo}`} className={isEven ? 'ml-[30%]' : ''}>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[11px] font-black flex items-center justify-center shrink-0 shadow-sm">
                  {stepNo}
                </span>
                <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm w-60">
                  {step}
                </div>
              </div>
              {!isLast && (
                <div className="h-4 ml-[10px] border-l-2 border-dashed border-slate-200"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* 切换模式按钮（选中非当前模式时出现） */}
      {isSwitchPending && (
        <div className="sticky bottom-4 flex justify-end pr-2 mt-auto">
          <button
            onClick={handleSwitch}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black px-5 py-2.5 rounded-lg shadow-md transition-all"
          >
            切换模式
          </button>
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
