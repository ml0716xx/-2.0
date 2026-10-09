import React, { useState } from 'react';
import {
  Sun, Cloud, CloudSun, CloudRain, CloudSnow, CloudLightning, Wind,
  Plus, ChevronDown, ArrowRight, Info, CircleAlert, Sparkles,
} from 'lucide-react';

/** 天气图标库：后台新增天气类型时指定图标标识，前端在此映射 */
const WEATHER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  sun: Sun,
  cloudSun: CloudSun,
  cloud: Cloud,
  cloudRain: CloudRain,
  cloudSnow: CloudSnow,
  cloudLightning: CloudLightning,
  wind: Wind,
};

export interface WeatherType {
  key: string;
  label: string;
  /** 图标标识，见 WEATHER_ICONS */
  iconKey: string;
  /** 预置天气；新增天气类型在后台维护 */
  preset: boolean;
}

/** 预置天气：覆盖大部分场景，新增天气类型由后台维护 */
export const PRESET_WEATHER_TYPES: WeatherType[] = [
  { key: 'sunny', label: '晴天', iconKey: 'sun', preset: true },
  { key: 'cloudy', label: '多云', iconKey: 'cloudSun', preset: true },
  { key: 'overcast', label: '阴天', iconKey: 'cloud', preset: true },
  { key: 'snowrain', label: '雨雪', iconKey: 'cloudSnow', preset: true },
];

/**
 * 加载类型：不加载 / 加载自定义策略
 * 每种天气绑定一个自定义策略；天气与策略的自动切换开关在「策略运行」侧配置。
 */
export type WeatherLoadMode = 'none' | 'template';

export interface WeatherBinding {
  mode: WeatherLoadMode;
  /** 绑定的自定义策略 id（mode === 'template' 时有效） */
  templateId: string | null;
}

export type WeatherBindings = Record<string, WeatherBinding>;

/** 未配置时的默认绑定 */
export const EMPTY_BINDING: WeatherBinding = { mode: 'none', templateId: null };

interface LightIntelligencePanelProps {
  /** 天气类型：由后台维护，前端按返回列表展示 */
  weatherTypes: WeatherType[];
  /** 各天气绑定的策略 */
  bindings: WeatherBindings;
  /** 可绑定的策略：仅自定义策略（AI 策略不可被绑定） */
  customTemplates: { id: string; name: string }[];
  onBind: (weatherKey: string, binding: WeatherBinding) => void;
  /** 在绑定处直接新建自定义策略，返回新策略 id 以便立即绑定 */
  onCreateTemplate: (name: string) => string;
  /** 跳转到「策略组合列表」中的对应策略 */
  onViewTemplate: (templateId: string) => void;
}

/**
 * 轻智能面板（AI 策略【基础】详情）：
 *   说明条 → 天气概览条（切换选中）→ 详情卡（该天气配置哪个自定义策略）
 * 天气类型由后台维护，前端只做展示与配置；各天气的绑定状态实时回写到概览条状态点，
 * 配置即生效、无需保存。
 */
const LightIntelligencePanel: React.FC<LightIntelligencePanelProps> = ({
  weatherTypes,
  bindings,
  customTemplates,
  onBind,
  onCreateTemplate,
  onViewTemplate,
}) => {
  const [selectedKey, setSelectedKey] = useState(weatherTypes[0]?.key ?? '');
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState('');

  const selected = weatherTypes.find((w) => w.key === selectedKey) ?? weatherTypes[0];
  if (!selected) return null;

  const binding = bindings[selected.key] ?? EMPTY_BINDING;
  const boundTemplate =
    binding.mode === 'template' && binding.templateId
      ? customTemplates.find((t) => t.id === binding.templateId)
      : undefined;
  /** 已绑定的策略被删除：回落为未绑定并提示重选 */
  const bindingMissing = binding.mode === 'template' && !!binding.templateId && !boundTemplate;
  const SelectedIcon = WEATHER_ICONS[selected.iconKey] ?? Cloud;

  /** 新建自定义策略：建完即绑到当前天气 */
  const submitCreate = () => {
    const name = draftName.trim();
    if (!name) return;
    const id = onCreateTemplate(name);
    onBind(selected.key, { mode: 'template', templateId: id });
    setDraftName('');
    setCreating(false);
  };

  return (
    <div className="space-y-5">
      {/* 说明条：说清轻智能干什么、开关在哪 */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-[#B7E4D3] bg-[#E8F7F1] px-4 py-3">
        <Sparkles className="w-4 h-4 text-[#17705A] mt-0.5 shrink-0" />
        <p className="text-[12px] text-[#17705A] leading-relaxed">
          轻智能按站点所在地天气，自动切换对应的自定义策略；自动切换开关在「策略运行」中配置。
        </p>
      </div>

      {/* 天气概览条：一排天气胶囊，点击切换（天气类型由后台维护） */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-black text-slate-500 tracking-wide">天气</span>
          <span className="text-[11px] text-slate-400">每种天气绑定一个自定义策略</span>
        </div>
        <div className="flex items-stretch gap-3 overflow-x-auto pb-1">
          {weatherTypes.map((w) => {
            const b = bindings[w.key] ?? EMPTY_BINDING;
            const tpl =
              b.mode === 'template' && b.templateId
                ? customTemplates.find((t) => t.id === b.templateId)
                : undefined;
            const isSelected = selectedKey === w.key;
            const Icon = WEATHER_ICONS[w.iconKey] ?? Cloud;
            return (
              <button
                key={w.key}
                onClick={() => setSelectedKey(w.key)}
                className={`w-[136px] shrink-0 rounded-2xl border p-3 text-left transition-all ${
                  isSelected
                    ? 'border-emerald-300 bg-emerald-50/60 shadow-sm'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 shrink-0 ${isSelected ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className={`text-[13px] font-black truncate ${isSelected ? 'text-emerald-700' : 'text-slate-600'}`}>
                    {w.label}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tpl ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                  <span className={`text-[10px] font-bold truncate ${tpl ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {tpl ? tpl.name : '未绑定'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 详情卡：选中天气绑定哪个策略 */}
      <div>
        <div className="text-[12px] font-black text-slate-500 tracking-wide mb-3">自定义轻智能</div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${boundTemplate ? 'bg-emerald-50' : 'bg-slate-50'}`}>
              <SelectedIcon className={`w-4 h-4 ${boundTemplate ? 'text-emerald-500' : 'text-slate-400'}`} />
            </div>
            <span className="text-sm font-black text-slate-800 truncate">{selected.label}</span>
            <span
              className={`ml-auto shrink-0 px-2 py-0.5 rounded-md text-[10px] font-black border ${
                boundTemplate
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-slate-50 text-slate-400 border-slate-100'
              }`}
            >
              {boundTemplate ? '已绑定' : '未绑定'}
            </span>
          </div>

          <div className="grid grid-cols-12 gap-5 pt-4">
            <div className="col-span-12 md:col-span-4 space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">配置类型</label>
              <div className="inline-flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl">
                {(
                  [
                    ['none', '不配置'],
                    ['template', '配置自定义策略'],
                  ] as [WeatherLoadMode, string][]
                ).map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() =>
                      onBind(
                        selected.key,
                        k === 'none'
                          ? EMPTY_BINDING
                          : { mode: 'template', templateId: binding.templateId ?? customTemplates[0]?.id ?? null }
                      )
                    }
                    className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                      binding.mode === k
                        ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-12 md:col-span-8 space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">策略组合</label>
              {creating ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitCreate();
                      if (e.key === 'Escape') setCreating(false);
                    }}
                    placeholder="请输入新策略名称"
                    className="flex-1 min-w-0 bg-white border border-emerald-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 ring-emerald-100"
                  />
                  <button
                    onClick={submitCreate}
                    className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-black transition-colors"
                  >
                    新建并绑定
                  </button>
                  <button
                    onClick={() => setCreating(false)}
                    className="shrink-0 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 text-[12px] font-bold hover:bg-slate-50 transition-colors"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 min-w-0">
                    <select
                      disabled={binding.mode !== 'template'}
                      value={binding.templateId ?? ''}
                      onChange={(e) =>
                        onBind(selected.key, { mode: 'template', templateId: e.target.value || null })
                      }
                      className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 ring-emerald-100 cursor-pointer disabled:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed"
                    >
                      <option value="">{binding.mode === 'template' ? '请选择自定义策略' : '未配置策略'}</option>
                      {customTemplates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <button
                    onClick={() => setCreating(true)}
                    className="shrink-0 flex items-center gap-1 px-3.5 py-2.5 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 text-[12px] font-black hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    新建
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 min-h-[20px]">
            {bindingMissing && (
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600">
                <CircleAlert className="w-3.5 h-3.5 shrink-0" />
                原绑定策略已删除，请重新选择
              </div>
            )}
            {!bindingMissing && boundTemplate && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Info className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span className="truncate">
                  {selected.label}将执行「{boundTemplate.name}」
                </span>
                <button
                  onClick={() => onViewTemplate(boundTemplate.id)}
                  className="inline-flex items-center gap-0.5 shrink-0 font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  查看详情
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
            {!bindingMissing && binding.mode === 'template' && !boundTemplate && (
              <div className="text-[11px] text-slate-400">
                {customTemplates.length ? '请选择要配置的自定义策略' : '暂无自定义策略，可点「新建」直接创建'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightIntelligencePanel;
