/* ==========================================================================
   策略配置 · 增值服务
   --------------------------------------------------------------------------
   原来这里叫「AI 相关参数」，只放 AI 策略的调优开关。改名叫增值服务，是因为
   三相不平衡治理也要开关和参数，它不属于 AI 策略，但和 AI 调优一样，都是
   「站点额外付了钱才有的能力」。与其新开一个 tab，不如把这个已经存在的
   参数页升级成增值服务的收口位置。

   所以这一页按「增值服务」分组排，每一组一张卡：

     一、AI 策略        —— 峰谷套利配置：经济性阈值
     二、三相不平衡治理 —— 开关 + 治理前阈值（可编辑保存）+ 当前阈值回显

   以后再来第三个增值服务，往下面加一组即可，页面结构不用动。

   本期不做「开通 / 有效期」——按已确认的口径，只做功能开关与参数。
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import {
  readPhaseConfig,
  writePhaseConfig,
  subscribePhaseConfig,
  phaseReleaseMax,
  type PhaseConfig,
} from './phaseImbalanceData';

const KEY_ECO_THRESHOLD = 'sys_ecoThreshold';

/** 开关：48×24，和 AI 需量调整那张卡保持同一套 */
const Switch = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
      checked ? 'bg-emerald-500' : 'bg-slate-200'
    }`}
  >
    <span
      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
        checked ? 'left-[26px]' : 'left-0.5'
      }`}
    />
  </button>
);

/** 复选框：方形，跟截图里的参数勾选项一致 */
/** 分组标题 */
const SectionTitle = ({ title, desc }: { title: string; desc: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="w-1 h-3.5 rounded-full bg-emerald-500" />
    <span className="text-[13px] font-black text-slate-800 tracking-tight">{title}</span>
    <span className="text-[11px] text-slate-400 font-medium">{desc}</span>
  </div>
);

const ValueAddPanel: React.FC = () => {
  /* 一、AI 策略：经济性阈值（填了即视为该参数生效） */
  const [ecoThreshold, setEcoThreshold] = useState(
    () => localStorage.getItem(KEY_ECO_THRESHOLD) || '',
  );

  /* 二、三相不平衡治理：与监控页、经营分析报告读的是同一份数据 */
  const [cfg, setCfg] = useState<PhaseConfig>(readPhaseConfig);
  useEffect(() => subscribePhaseConfig(() => setCfg(readPhaseConfig())), []);

  const patch = (p: Partial<Pick<PhaseConfig, 'on' | 'baseline'>>) => {
    writePhaseConfig(p);
    setCfg(readPhaseConfig());
  };

  /* 治理前阈值是人工填的，编辑中不能直接落库，否则输一半就把月度核算口径改了 */
  const [draft, setDraft] = useState(cfg.baseline);
  useEffect(() => setDraft(cfg.baseline), [cfg.baseline]);

  const parsed = parseFloat(draft);
  const draftOk = Number.isFinite(parsed) && parsed > 0;
  const dirty = draftOk && draft !== cfg.baseline;
  const saveBaseline = () => {
    if (!draftOk) return;
    patch({ baseline: String(parsed) });
  };

  const changeThreshold = (v: string) => {
    setEcoThreshold(v);
    localStorage.setItem(KEY_ECO_THRESHOLD, v);
  };

  const release = phaseReleaseMax(cfg);

  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">
        {/* 页头 */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-50">
          <div>
            <h3 className="text-sm font-black text-slate-800 tracking-tight">增值服务</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">
              站点已启用的增值能力与参数。关闭某一项后，对应的算法不参与策略计算，监控页与经营分析报告同步停止统计。
            </p>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
            已启用 {[ecoThreshold.trim() !== '', cfg.on].filter(Boolean).length} / 2 项
          </span>
        </div>

        {/* 一、AI 策略 */}
        <div>
          <SectionTitle title="一、AI 策略" desc="原来的 AI 相关参数，归入增值服务" />

          <div className="rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3.5">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-slate-800">峰谷套利配置</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-500 text-[10px] font-bold">
                人工智能领域
              </span>
            </div>

            {/* 经济性阈值：没填就显示 ---，和线上的空值态一致 */}
            <div className="mt-3 flex items-center gap-3">
              <span className="text-[11px] font-bold text-slate-500 w-[72px] shrink-0">经济性阈值</span>
              <div className="relative w-[160px]">
                <input
                  type="number"
                  inputMode="decimal"
                  value={ecoThreshold}
                  placeholder="---"
                  onChange={(e) => changeThreshold(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-14 py-1.5 text-sm font-bold text-slate-700 outline-none font-mono placeholder:text-slate-300 placeholder:font-normal focus:ring-2 ring-emerald-100"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-bold">
                  元/kWh
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                充放价差低于该值时，AI 不参与该策略调优
              </span>
            </div>
          </div>
        </div>

        {/* 二、三相不平衡治理 */}
        <div>
          <SectionTitle title="二、三相不平衡治理" desc="储能 PCS 三相独立出力，压降防逆流边界" />

          <div
            className={`rounded-xl border px-4 py-3.5 transition-colors ${
              cfg.on ? 'border-slate-100 bg-slate-50/40' : 'border-slate-100 bg-slate-50/20'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[13px] font-bold ${cfg.on ? 'text-slate-800' : 'text-slate-400'}`}>
                    三相不平衡治理
                  </span>
                  {cfg.on && release > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-fuchsia-50 text-fuchsia-500 text-[10px] font-bold">
                      释放 {release.toFixed(0)} kW 裕量
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">
                  关闭后储能按总功率三分均分，不做相间补偿
                </div>
              </div>
              <Switch
                checked={cfg.on}
                onChange={() => patch({ on: !cfg.on })}
                label="三相不平衡治理"
              />
            </div>

            {/* 治理前阈值人工填、可保存；当前阈值只回显公共配置里的那个数 */}
            {cfg.on && (
              <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex items-end gap-3 flex-wrap">
                <div className="shrink-0">
                  <div className="text-[11px] font-bold text-slate-500 mb-1.5">治理前阈值</div>
                  <div className="relative w-[124px]">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveBaseline();
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-10 py-1.5 text-sm font-bold text-slate-700 outline-none font-mono focus:ring-2 ring-emerald-100"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                      kW
                    </span>
                  </div>
                </div>

                <span className="pb-2 text-[11px] text-slate-300 font-bold">→</span>

                <div className="shrink-0">
                  <div className="text-[11px] font-bold text-slate-500 mb-1.5">当前阈值</div>
                  <div className="w-[124px] rounded-lg bg-slate-100 border border-slate-100 px-3 py-[7px] text-sm font-bold text-slate-500 font-mono">
                    {cfg.current}
                    <span className="text-[10px] font-normal text-slate-400 ml-1">kW</span>
                  </div>
                </div>

                <div className="pb-1.5 flex items-center gap-2">
                  {release > 0 ? (
                    <span className="px-1.5 py-0.5 rounded bg-fuchsia-50 text-fuchsia-500 text-[10px] font-bold">
                      压降 {release.toFixed(0)} kW
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-500 text-[10px] font-bold">
                      当前阈值不低于治理前，无释放裕量
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={saveBaseline}
                  disabled={!dirty}
                  className={`ml-auto mb-0.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                    dirty
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  {dirty ? '保存' : '已保存'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 说明：本期不做开通 */}
        <div className="pt-3 border-t border-slate-50 text-[11px] text-slate-400 leading-relaxed">
          本页只管理已启用增值服务的开关与参数。增值服务的开通、试用与有效期由后台配置，不在本原型范围内。
        </div>
      </div>
    </div>
  );
};

export default ValueAddPanel;
