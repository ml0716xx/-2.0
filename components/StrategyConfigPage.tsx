
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, ChevronRight, Clock, 
  Zap, Save, ArrowLeft, ChevronDown, HelpCircle, Info, Calendar, X, Copy, ChevronUp,
  TrendingUp, Sparkles, Lock, Rocket, ArrowUpRight, ShieldCheck
} from 'lucide-react';
import CommonConfigPanel from './CommonConfigPanel';
import ModeManagementPanel from './ModeManagementPanel';
import AiTierPromo from './AiTierPromo';
import LightIntelligencePanel, {
  EMPTY_BINDING,
  PRESET_WEATHER_TYPES,
  type WeatherBindings,
  type WeatherType,
} from './LightIntelligencePanel';
import { TY_TRIAL_META } from './tianyingReportData';

/** 客户生命周期：未开通（售前） / 试运行 / 正式运行 —— 与策略运行报告、经营分析报告同源 */
export type ConfigLifecycle = 'presale' | 'trial' | 'formal';

interface SubPeriod {
  start: string;
  end: string;
  type: '充电' | '放电' | '待机';
  power: number;
}

interface ScheduleBlock {
  id: string;
  startTime: string;
  endTime: string;
  threshold: string;
  reserveCharge: string;
  reserveDischarge: string;
  strategyType: string;
  dischargeThreshold: string;
  subPeriods: SubPeriod[];
  isCollapsed: boolean;
  chargeOffset?: string;
  dischargeOffset?: string;
}

/** 策略来源分组：自定义（可人工编辑）/ AI（天盈 AI 生成，按档位分级） */
type TemplateGroup = 'custom' | 'ai';

/** AI 策略档位 */
export type AiTier = '基础' | '标准' | 'PRO';

interface StrategyTemplate {
  id: string;
  name: string;
  group: TemplateGroup;
  aiTier?: AiTier;
  isActive: boolean;
  hasWarning: boolean;
  blocks: ScheduleBlock[];
}

/** 列表分组标题（顺序即展示顺序） */
const TEMPLATE_GROUPS: { key: TemplateGroup; title: string; desc: string }[] = [
  { key: 'ai', title: 'AI 策略', desc: '天盈 AI 依据站点特征自动生成' },
  { key: 'custom', title: '自定义策略', desc: '站端人工配置，可自由编辑与复制' },
];

/** AI 策略档位徽章配色 */
const AI_TIER_STYLE: Record<AiTier, string> = {
  基础: 'bg-sky-50 text-sky-600 border-sky-100',
  标准: 'bg-violet-50 text-violet-600 border-violet-100',
  PRO: 'bg-amber-50 text-amber-600 border-amber-200',
};




/** 本地日期 → YYYY-MM-DD（用于 date 输入框） */
const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

interface StrategyConfigPageProps {
  /** 客户生命周期状态（未开通 / 试运行 / 正式运行） */
  lifecycle?: ConfigLifecycle;
  /** 未开通 → 试运行 */
  onActivate?: () => void;
  /** 试运行 → 正式运行 */
  onConvert?: () => void;
  /** 演示用：直接切换三态，便于核对各状态的引导形态 */
  onSwitchLifecycle?: (l: ConfigLifecycle) => void;
}

/** 三态的状态角标（与策略运行报告同配色） */
const LifecycleBadge: React.FC<{ lifecycle: ConfigLifecycle }> = ({ lifecycle }) => {
  if (lifecycle === 'trial') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFF7E6] border border-[#FFE0A3] text-[10px] font-bold text-[#B7791F]">
        <Clock className="w-3 h-3" />
        试运行中 · 剩余 {TY_TRIAL_META.remainingDays} 天
      </span>
    );
  }
  if (lifecycle === 'formal') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E8F7F1] border border-[#B7E4D3] text-[10px] font-bold text-[#17705A]">
        <ShieldCheck className="w-3 h-3" />
        正式运行 · AI 智能托管
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F4F6F9] border border-[#E3E8EE] text-[10px] font-bold text-[#5A6B7C]">
      <Info className="w-3 h-3" />
      未开通
    </span>
  );
};

/**
 * 策略列表区的开通引导卡：三种状态各一套文案与 CTA
 *   未开通  → 说明 AI 策略需开通后使用，主 CTA「一键开通 30 天试用」
 *   试运行中 → 说明 AI 正按实测数据校准，主 CTA「一键升级正式版」
 *   正式运行 → 无引导
 * 开通与升级入口只保留在列表区，策略详情内不再重复展示。
 */
const AiActivationGuide: React.FC<{
  lifecycle: ConfigLifecycle;
  onActivate?: () => void;
  onConvert?: () => void;
}> = ({ lifecycle, onActivate, onConvert }) => {
  // 正式运行态：AI 策略已在使用中，无转化动作，不再额外展示引导
  if (lifecycle === 'formal') return null;

  const shell = lifecycle === 'presale' ? 'border-[#E3E8EE] bg-white' : 'border-[#FFE0A3] bg-gradient-to-br from-[#FFF9EC] to-[#FFF4DE]';

  return (
    <div className={`rounded-xl border px-4 py-3 flex flex-col gap-2 ${shell}`}>
      <div className="flex items-start gap-2.5">
        {lifecycle === 'presale' ? (
          <Lock className="w-4 h-4 text-[#1E9C7E] mt-0.5 shrink-0" />
        ) : (
          <Clock className="w-4 h-4 text-[#B7791F] mt-0.5 shrink-0" />
        )}
        <div className="min-w-0">
          <div className="text-[12px] font-bold text-[#1A2A3A]">
            {lifecycle === 'presale'
              ? 'AI 策略需开通后使用'
              : `AI 策略试运行中 · 剩余 ${TY_TRIAL_META.remainingDays} 天`}
          </div>
          <p className="text-[11px] text-[#7F8C8D] mt-0.5 leading-relaxed">
            {lifecycle === 'presale'
              ? '开通 30 天试用即可调用下方 3 档 AI 策略。'
              : `AI 正按实测数据校准参数，已试运行 ${TY_TRIAL_META.elapsedDays} / ${TY_TRIAL_META.totalDays} 天。`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {lifecycle === 'presale' && onActivate && (
          <button
            onClick={onActivate}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-[12px] font-bold bg-[#1E9C7E] hover:bg-[#17705A] text-white transition-colors w-full"
          >
            <Rocket className="w-3.5 h-3.5" />
            一键开通 30 天试用
          </button>
        )}
        {lifecycle === 'trial' && onConvert && (
          <button
            onClick={onConvert}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-[12px] font-bold bg-[#B7791F] hover:bg-[#96631A] text-white transition-colors w-full"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            一键升级正式版
          </button>
        )}
      </div>
    </div>
  );
};

/** 演示用三态切换：便于核对三种状态的引导形态 */
const LifecycleSwitcher: React.FC<{
  lifecycle: ConfigLifecycle;
  onSwitch?: (l: ConfigLifecycle) => void;
}> = ({ lifecycle, onSwitch }) => {
  if (!onSwitch) return null;
  return (
    <div className="flex items-center gap-0.5 bg-[#F4F6F9] p-1 rounded-lg border border-[#EAEDF2]">
      {(
        [
          ['presale', '未开通'],
          ['trial', '试运行'],
          ['formal', '正式运行'],
        ] as [ConfigLifecycle, string][]
      ).map(([k, label]) => (
        <button
          key={k}
          onClick={() => onSwitch(k)}
          className={`px-3 py-1 rounded-md text-[12px] font-bold transition-all ${
            lifecycle === k
              ? k === 'trial'
                ? 'bg-white text-[#B7791F] shadow-xs border border-[#FFE0A3]'
                : k === 'formal'
                  ? 'bg-white text-[#17705A] shadow-xs border border-[#B7E4D3]'
                  : 'bg-white text-[#5A6B7C] shadow-xs border border-[#E3E8EE]'
              : 'text-[#7F8C8D] hover:text-[#2C3E50]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

const StrategyConfigPage: React.FC<StrategyConfigPageProps> = ({
  lifecycle = 'presale',
  onActivate,
  onConvert,
  onSwitchLifecycle,
}) => {
  const [selectedId, setSelectedId] = useState('01');
  const [isEditing, setIsEditing] = useState(false);
  const [focusedThresholdBlockId, setFocusedThresholdBlockId] = useState<string | null>(null);

  // 公共配置状态
  const [activeTab, setActiveTab] = useState<'common' | 'selfConsumption' | 'mode'>('common');

  /**
   * AI 策略按日期模拟：默认 T 日，最远可选到 T+1（含）。
   * 标准档 / PRO 档的调度参数是逐日模拟结果，故需要日期维度。
   */
  const todayISO = toISODate(new Date());
  const tomorrowISO = toISODate(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [simDate, setSimDate] = useState(todayISO);

  /**
   * AI 策略【基础】= 轻智能：按天气绑定自定义策略。
   * 天气类型由后台维护（此处为预置 4 类），前端只消费列表；每种天气绑定 1 个自定义策略。
   */
  const weatherTypes: WeatherType[] = PRESET_WEATHER_TYPES;
  const [weatherBindings, setWeatherBindings] = useState<WeatherBindings>({
    sunny: { mode: 'template', templateId: '01' },
    cloudy: EMPTY_BINDING,
    overcast: EMPTY_BINDING,
    snowrain: EMPTY_BINDING,
  });

  const handleBindWeather = (weatherKey: string, binding: { mode: 'none' | 'template'; templateId: string | null }) => {
    setWeatherBindings((prev) => ({ ...prev, [weatherKey]: binding }));
  };

  /**
   * 轻智能里直接新建自定义策略：建成后落到「自定义策略」分组，供绑定与后续编辑。
   * 初始配置与「策略运行报告 · 手动自定义策略」下方的默认计划时段保持一致：
   *   00:00~07:00 充电 300kW（充电预留 95%）、18:00~22:00 放电 300kW（放电预留 95%）
   */
  const handleCreateCustomTemplate = (name: string): string => {
    const id = `custom-${Date.now().toString(36)}`;
    setTemplates((prev) => [
      ...prev,
      {
        id,
        name,
        group: 'custom',
        isActive: false,
        hasWarning: false,
        blocks: [
          {
            id: `${id}-b1`,
            startTime: '00:00',
            endTime: '07:00',
            threshold: '0',
            reserveCharge: '95',
            reserveDischarge: '0',
            strategyType: '峰谷套利',
            dischargeThreshold: '0',
            isCollapsed: true,
            subPeriods: [{ start: '00:00', end: '07:00', type: '充电', power: 300 }],
          },
          {
            id: `${id}-b2`,
            startTime: '18:00',
            endTime: '22:00',
            threshold: '0',
            reserveCharge: '0',
            reserveDischarge: '95',
            strategyType: '峰谷套利',
            dischargeThreshold: '0',
            isCollapsed: true,
            subPeriods: [{ start: '18:00', end: '22:00', type: '放电', power: 300 }],
          },
        ],
      },
    ]);
    return id;
  };

  const [templates, setTemplates] = useState<StrategyTemplate[]>([
    {
      id: '01',
      name: '峰谷套利核心策略',
      group: 'custom',
      isActive: true,
      hasWarning: false,
      blocks: [
        {
          id: 'b1',
          startTime: '00:00',
          endTime: '23:59',
          threshold: '50',
          reserveCharge: '20',
          reserveDischarge: '30',
          strategyType: '峰谷套利',
          dischargeThreshold: '42',
          chargeOffset: '10',
          dischargeOffset: '15',
          isCollapsed: false,
          subPeriods: [
            { start: '00:00', end: '01:00', type: '充电', power: 1.5 },
            { start: '01:00', end: '02:00', type: '放电', power: 2.2 },
          ]
        }
      ]
    },
    { 
      id: '02', 
      name: '全额消纳默认策略', 
      group: 'custom',
      isActive: false, 
      hasWarning: false, 
      blocks: [
        {
          id: 'b2',
          startTime: '00:00',
          endTime: '23:59',
          threshold: '25',
          reserveCharge: '10',
          reserveDischarge: '15',
          strategyType: '全额消纳（自发自用）',
          dischargeThreshold: '58',
          chargeOffset: '5',
          dischargeOffset: '12',
          isCollapsed: false,
          subPeriods: []
        }
      ]
    },
    // ===== AI 策略：标准档 / PRO 档内容取自「策略运行 · 策略排期」对应策略 =====
    // 基础档内容待补充，先占位
    { id: 'ai-basic', name: 'AI 策略', group: 'ai', aiTier: '基础', isActive: false, hasWarning: false, blocks: [] },
    {
      // 源自 策略运行 · 策略排期「AI 运行策略」（现名 AI 策略【标准】）
      id: 'ai-standard',
      name: 'AI 策略',
      group: 'ai',
      aiTier: '标准',
      isActive: true,
      hasWarning: false,
      blocks: [
        {
          id: 'ai-std-1',
          startTime: '00:00',
          endTime: '04:00',
          threshold: '0',
          reserveCharge: '20',
          reserveDischarge: '5',
          strategyType: '峰谷套利',
          dischargeThreshold: '0',
          isCollapsed: true,
          subPeriods: []
        },
        {
          id: 'ai-std-2',
          startTime: '04:00',
          endTime: '06:00',
          threshold: '0',
          reserveCharge: '10',
          reserveDischarge: '10',
          strategyType: '峰谷套利',
          dischargeThreshold: '0',
          isCollapsed: true,
          subPeriods: []
        },
        {
          id: 'ai-std-3',
          startTime: '06:00',
          endTime: '11:00',
          // 可逆流阈值 -10 kW
          threshold: '-10',
          reserveCharge: '0',
          reserveDischarge: '50',
          strategyType: '峰谷套利',
          dischargeThreshold: '0',
          isCollapsed: false,
          // AI 排程下发的 15min 明细
          subPeriods: [
            { start: '06:00', end: '06:15', type: '放电', power: 93.17 },
            { start: '06:15', end: '06:30', type: '放电', power: 76.86 },
            { start: '06:30', end: '06:45', type: '放电', power: 175.34 },
            { start: '06:45', end: '07:00', type: '放电', power: 181.25 }
          ]
        },
        {
          id: 'ai-std-4',
          startTime: '11:00',
          endTime: '18:00',
          threshold: '0',
          reserveCharge: '0',
          reserveDischarge: '20',
          strategyType: '全额消纳（自发自用）',
          dischargeThreshold: '0',
          isCollapsed: true,
          subPeriods: []
        },
        {
          id: 'ai-std-5',
          startTime: '18:00',
          endTime: '24:00',
          threshold: '0',
          reserveCharge: '30',
          reserveDischarge: '0',
          strategyType: '峰谷套利',
          dischargeThreshold: '0',
          isCollapsed: true,
          subPeriods: []
        }
      ]
    },
    {
      // 源自 策略运行 · 策略排期「AI 调度」（现名 AI 策略【PRO】）
      id: 'ai-pro',
      name: 'AI 策略',
      group: 'ai',
      aiTier: 'PRO',
      isActive: true,
      hasWarning: false,
      blocks: [
        {
          id: 'ai-pro-1',
          startTime: '12:00',
          endTime: '14:00',
          threshold: '0',
          reserveCharge: '0',
          reserveDischarge: '0',
          strategyType: '动态增容',
          dischargeThreshold: '0',
          chargeOffset: '49',
          isCollapsed: true,
          subPeriods: []
        },
        {
          id: 'ai-pro-2',
          startTime: '14:00',
          endTime: '16:00',
          threshold: '0',
          reserveCharge: '0',
          reserveDischarge: '0',
          strategyType: '峰谷套利',
          dischargeThreshold: '0',
          dischargeOffset: '30',
          isCollapsed: true,
          subPeriods: []
        },
        {
          id: 'ai-pro-3',
          startTime: '16:00',
          endTime: '18:00',
          threshold: '0',
          reserveCharge: '0',
          reserveDischarge: '0',
          strategyType: '动态增容',
          dischargeThreshold: '0',
          // 安全预留偏移 15 kW
          dischargeOffset: '15',
          isCollapsed: true,
          subPeriods: []
        }
      ]
    },
  ]);

  const currentTemplate = templates.find(t => t.id === selectedId) || templates[0];
  /** 当前选中的是否为 AI 策略（不可人工编辑） */
  const isAiTemplate = currentTemplate.group === 'ai';
  /** 是否已填充调度配置块（AI 策略基础档内容待补充，暂为空） */
  const hasBlocks = currentTemplate.blocks.length > 0;
  /** 未开通态：AI 策略的调度参数不可见，先引导开通（自定义策略不受生命周期影响） */
  const aiLocked = isAiTemplate && lifecycle === 'presale';
  /** 基础档即「轻智能」：按天气绑定自定义策略，无逐日模拟的调度参数 */
  const isBasicAi = isAiTemplate && currentTemplate.aiTier === '基础';
  /** 轻智能可绑定的策略：仅自定义策略 */
  const customTemplates = templates
    .filter((t) => t.group === 'custom')
    .map((t) => ({ id: t.id, name: t.name }));

  const socContainerRef = useRef<HTMLDivElement>(null);
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [draggingType, setDraggingType] = useState<'discharge' | 'charge' | null>(null);

  const handleSocDrag = (e: MouseEvent) => {
    if (!draggingBlockId || !draggingType || !socContainerRef.current) return;
    const rect = socContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.round(Math.max(0, Math.min(100, (x / rect.width) * 100)));
    
    updateBlockValue(draggingBlockId, draggingType === 'discharge' ? 'reserveDischarge' : 'reserveCharge', percentage.toString());
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setDraggingBlockId(null);
      setDraggingType(null);
    };
    if (draggingType) {
      window.addEventListener('mousemove', handleSocDrag);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleSocDrag);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingType, currentTemplate]);

  const updateBlockValue = (blockId: string, key: keyof ScheduleBlock, value: any) => {
    setTemplates(prev => prev.map(t => {
      if (t.id === selectedId) {
        return {
          ...t,
          blocks: t.blocks.map(b => b.id === blockId ? { ...b, [key]: value } : b)
        };
      }
      return t;
    }));
  };

  const handleCopyBlock = (blockId: string) => {
    const blockToCopy = currentTemplate.blocks.find(b => b.id === blockId);
    if (!blockToCopy) return;
    
    const newBlock = { 
      ...JSON.parse(JSON.stringify(blockToCopy)), 
      id: Math.random().toString(36).substr(2, 9),
      isCollapsed: false 
    };

    const blockIndex = currentTemplate.blocks.findIndex(b => b.id === blockId);
    const newBlocks = currentTemplate.blocks.map(b => ({ ...b, isCollapsed: true }));
    newBlocks.splice(blockIndex + 1, 0, newBlock);

    setTemplates(prev => prev.map(t => t.id === selectedId ? { ...t, blocks: newBlocks } : t));
  };

  const handleDeleteBlock = (blockId: string) => {
    if (currentTemplate.blocks.length <= 1) return;
    const newBlocks = currentTemplate.blocks.filter(b => b.id !== blockId);
    setTemplates(prev => prev.map(t => t.id === selectedId ? { ...t, blocks: newBlocks } : t));
  };

  const toggleBlockCollapse = (blockId: string) => {
    setTemplates(prev => prev.map(t => t.id === selectedId ? {
      ...t,
      blocks: t.blocks.map(b => b.id === blockId ? { ...b, isCollapsed: !b.isCollapsed } : b)
    } : t));
  };

  const handleAddNewBlock = () => {
    const templateBlock = currentTemplate.blocks[0];
    const newBlock = { 
      ...JSON.parse(JSON.stringify(templateBlock)), 
      id: Math.random().toString(36).substr(2, 9), 
      isCollapsed: false 
    };

    const newBlocks = currentTemplate.blocks.map(b => ({ ...b, isCollapsed: true }));
    newBlocks.push(newBlock);

    setTemplates(prev => prev.map(t => t.id === selectedId ? { ...t, blocks: newBlocks } : t));
  };

  const handleCopyTemplate = (templateId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = templates.find(t => t.id === templateId);
    if (!target) return;
    const isAi = target.group === 'ai';

    const newTemplate: StrategyTemplate = {
      ...JSON.parse(JSON.stringify(target)),
      id: Math.random().toString(36).substr(2, 5),
      // AI 策略不可人工编辑，副本落到「自定义策略」分组，名称带上原档位便于追溯
      name: isAi ? `${target.name}【${target.aiTier}】-副本` : `${target.name}-副本`,
      group: 'custom',
      aiTier: undefined,
      isActive: false
    };
    
    setTemplates([...templates, newTemplate]);
    setSelectedId(newTemplate.id);
    setIsEditing(false); // 复制后先显示概览
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);
  const handleSave = () => setIsEditing(false);

  const strategyTypes = ["全额消纳（自发自用）", "余电上网（自发自用）", "峰谷套利", "动态增容", "需量控制", "动态调压", "需求响应"];

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* 顶部标签页切换 */}
      <div className="flex items-center justify-between gap-8 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-8">
        <button
          onClick={() => setActiveTab('common')}
          className={`text-base font-bold pb-2 transition-all relative cursor-pointer ${
            activeTab === 'common'
              ? 'text-emerald-600 font-black'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          公共配置
          {activeTab === 'common' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full animate-fade-in"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('mode')}
          className={`text-base font-bold pb-2 transition-all relative cursor-pointer ${
            activeTab === 'mode'
              ? 'text-emerald-600 font-black'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          模式管理
          {activeTab === 'mode' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full animate-fade-in"></div>
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab('selfConsumption');
            setIsEditing(false);
          }}
          className={`text-base font-bold pb-2 transition-all relative cursor-pointer ${
            activeTab === 'selfConsumption'
              ? 'text-emerald-600 font-black'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          策略组合列表
          {activeTab === 'selfConsumption' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full animate-fade-in"></div>
          )}
        </button>
        </div>

        <LifecycleSwitcher lifecycle={lifecycle} onSwitch={onSwitchLifecycle} />
      </div>

      {activeTab === 'common' ? (
        <CommonConfigPanel />
      ) : activeTab === 'mode' ? (
        <ModeManagementPanel />
      ) : (
        <div className="flex-1 flex gap-4">
      {!isEditing && (
        <div className="w-72 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col shrink-0 animate-in slide-in-from-left duration-300">
          <div className="p-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-black text-slate-800 tracking-tight text-sm">策略组合列表</h3>
            <button className="flex items-center gap-1 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-sm text-[11px] px-2.5 py-1 font-bold whitespace-nowrap">
              <Plus className="w-3 h-3 shrink-0" /> 新增自定义策略
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {TEMPLATE_GROUPS.map((g) => {
              const list = templates.filter((t) => t.group === g.key);
              if (!list.length) return null;
              return (
                <div key={g.key} className="pt-3 first:pt-0">
                  {/* 分组标题：AI 分组额外标注当前生命周期状态 */}
                  <div className="flex items-center justify-between px-2 pb-2 gap-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                      {g.key === 'ai' && <Sparkles className="w-3 h-3 text-amber-500" />}
                      {g.title}
                    </span>
                    {g.key === 'ai' ? (
                      <LifecycleBadge lifecycle={lifecycle} />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 font-mono">{list.length}</span>
                    )}
                  </div>

                  {/* 开通引导：AI 策略分组专属（正式运行态不展示），全页唯一的开通/升级入口 */}
                  {g.key === 'ai' && lifecycle !== 'formal' && (
                    <div className="mb-2">
                      <AiActivationGuide
                        lifecycle={lifecycle}
                        onActivate={onActivate}
                        onConvert={onConvert}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    {list.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedId(t.id);
                          setIsEditing(false); // 切换策略退出编辑态，避免 AI 策略进入空编辑视图
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                          selectedId === t.id ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'hover:bg-slate-50 border-transparent'
                        } border relative`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${t.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                          <span className={`text-sm font-bold truncate ${selectedId === t.id ? 'text-emerald-700' : 'text-slate-600'}`}>{t.name}</span>
                          {t.group === 'ai' && lifecycle === 'presale' && (
                            <Lock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          )}
                          {t.group === 'ai' && t.aiTier && (
                            <span className={`shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${AI_TIER_STYLE[t.aiTier]}`}>
                              {t.aiTier}
                            </span>
                          )}
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${selectedId === t.id ? 'translate-x-0 opacity-100 text-emerald-400' : 'translate-x-4 opacity-0 text-slate-300 group-hover:opacity-100'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-4 transition-all duration-300 min-w-0">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-50 flex-1 relative">
          
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-50">
            <div className="flex items-center gap-3">
              {isEditing && (
                <button onClick={handleCancel} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                  <ArrowLeft className="w-4 h-4 text-slate-400" />
                </button>
              )}
              <div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                  {isEditing
                    ? `编辑: ${currentTemplate.name}`
                    : isAiTemplate
                      ? `${currentTemplate.name}【${currentTemplate.aiTier}】${isBasicAi ? ' · 轻智能' : ''}`
                      : '策略配置详情'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isAiTemplate
                        ? lifecycle === 'trial'
                          ? 'bg-amber-500'
                          : lifecycle === 'formal'
                            ? 'bg-emerald-500'
                            : 'bg-slate-300'
                        : currentTemplate.isActive
                          ? 'bg-emerald-500'
                          : 'bg-slate-300'
                    }`}
                  ></div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest ${
                      isAiTemplate
                        ? lifecycle === 'trial'
                          ? 'text-amber-500'
                          : lifecycle === 'formal'
                            ? 'text-emerald-500'
                            : 'text-slate-400'
                        : currentTemplate.isActive
                          ? 'text-emerald-500'
                          : 'text-slate-400'
                    }`}
                  >
                    {isAiTemplate
                      ? lifecycle === 'presale'
                        ? isBasicAi
                          ? '未开通 · 天气策略不可配置'
                          : '未开通 · 调度参数不可见'
                        : lifecycle === 'trial'
                          ? `试运行中 · 已试运行 ${TY_TRIAL_META.elapsedDays} / ${TY_TRIAL_META.totalDays} 天`
                          : '正式运行 · 当前已激活应用至站点'
                      : currentTemplate.isActive
                        ? '当前已激活应用至站点'
                        : '草稿/离线编辑中'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center flex-wrap gap-3">
              {/* AI 策略按日期模拟：默认 T 日，最远 T+1；未开通态置灰不可选（轻智能是按天气配置，无日期维度） */}
              {isAiTemplate && !isBasicAi && (
                <div
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                    aiLocked ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-white'
                  }`}
                  title={aiLocked ? '开通后可选择模拟日期' : 'AI 策略按所选日期进行模拟'}
                >
                  <Calendar className={`w-4 h-4 ${aiLocked ? 'text-slate-300' : 'text-slate-400'}`} />
                  <span className="text-[11px] font-bold text-slate-500">模拟日期</span>
                  <input
                    type="date"
                    value={simDate}
                    max={tomorrowISO}
                    disabled={aiLocked}
                    onChange={(e) => setSimDate(e.target.value)}
                    className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer w-[120px] disabled:text-slate-300 disabled:cursor-not-allowed"
                  />
                </div>
              )}

              {!isEditing ? (
                isAiTemplate ? null : (
                  <>
                    <button onClick={handleEdit} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100 group">
                      <Edit className="w-4 h-4" /> 修改策略
                    </button>
                    <button onClick={() => handleCopyTemplate(currentTemplate.id)} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group">
                      <Copy className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" /> 复制副本
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 border border-rose-100 text-rose-500 rounded-2xl font-black text-sm hover:bg-rose-50 transition-all">
                      <Trash2 className="w-4 h-4" /> 删除
                    </button>
                  </>
                )
              ) : (
                <>
                  <button onClick={handleCancel} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all">
                    取消
                  </button>
                  <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                    <Save className="w-4 h-4 mr-2" /> 确认并保存
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {/* 未开通态：AI 策略参数不可见，改为展示该档位的宣传页（三档内容各异）。
                开通入口统一在左侧列表区的引导卡，这里不再挂按钮。 */}
            {aiLocked && currentTemplate.aiTier && <AiTierPromo tier={currentTemplate.aiTier} />}

            {/* AI 策略【基础】= 轻智能：按天气配置自定义策略（未开通态已被上方整块锁定） */}
            {!aiLocked && isBasicAi && (
              <LightIntelligencePanel
                weatherTypes={weatherTypes}
                bindings={weatherBindings}
                customTemplates={customTemplates}
                onBind={handleBindWeather}
                onCreateTemplate={handleCreateCustomTemplate}
                onViewTemplate={(id) => {
                  setSelectedId(id);
                  setIsEditing(false);
                }}
              />
            )}

            {/* 试运行 / 正式态但尚无内容：说明内容待补充 */}
            {!hasBlocks && !aiLocked && !isBasicAi && (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <div
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${
                    lifecycle === 'trial' ? 'bg-amber-50 border-amber-100' : 'bg-[#E8F7F1] border-[#B7E4D3]'
                  }`}
                >
                  {lifecycle === 'trial' ? (
                    <Clock className="w-6 h-6 text-amber-500" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 text-[#17705A]" />
                  )}
                </div>
                <h3 className="text-base font-black text-slate-800 tracking-tight">
                  {currentTemplate.name}
                  {currentTemplate.aiTier ? `【${currentTemplate.aiTier}】` : ''}
                </h3>
                <p className="text-sm text-slate-400 font-medium max-w-md leading-relaxed">
                  {lifecycle === 'trial'
                    ? '该策略处于试运行期，天盈 AI 正按站点实测数据逐日校准调度参数。'
                    : '该策略已进入正式运行，由天盈 AI 持续托管与迭代，无需人工干预。'}
                </p>
              </div>
            )}

            {/* 试运行 / 正式态渲染调度参数（未开通态不可见） */}
            {hasBlocks && !aiLocked && currentTemplate.blocks.map((block) => (
              <div key={block.id} className={`bg-slate-50/50 rounded-[2rem] border border-slate-100 p-0 relative transition-all duration-300 ${focusedThresholdBlockId === block.id ? 'z-[100]' : 'z-10'}`}>
                <div 
                  className={`flex items-center justify-between p-8 cursor-pointer hover:bg-slate-100/50 transition-colors ${!block.isCollapsed ? 'border-b border-slate-100' : ''} ${block.isCollapsed ? 'rounded-[2rem]' : 'rounded-t-[2rem]'}`}
                  onClick={() => toggleBlockCollapse(block.id)}
                >
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-black text-slate-800 uppercase tracking-tight">
                        调度时段: {block.startTime} ~ {block.endTime}
                      </span>
                    </div>

                    {block.isCollapsed && (
                      <div className="flex flex-wrap items-center gap-3 2xl:gap-8 animate-in fade-in slide-in-from-left-4 duration-500 overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-xl shrink-0 whitespace-nowrap">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">策略:</span>
                          <span className="text-xs font-black text-slate-700">{block.strategyType}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-xl shrink-0 whitespace-nowrap">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SOC预留:</span>
                          <span className="text-xs font-black text-emerald-600">放 {block.reserveDischarge}%</span>
                          <span className="text-[10px] text-slate-300">/</span>
                          <span className="text-xs font-black text-amber-600">充 {block.reserveCharge}%</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-xl shrink-0 whitespace-nowrap">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">放电阈值:</span>
                          <span className="text-xs font-black text-slate-700 font-mono">{block.dischargeThreshold} kW</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 ml-4" onClick={(e) => e.stopPropagation()}>
                    {isEditing && (
                      <>
                        <button onClick={() => handleCopyBlock(block.id)} className="text-slate-300 hover:text-blue-500 transition-all p-2 hover:bg-blue-50 rounded-xl group" title="复制当前调度块">
                          <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <button onClick={() => handleDeleteBlock(block.id)} className="text-slate-300 hover:text-rose-500 transition-all p-2 hover:bg-rose-50 rounded-xl group" title="删除当前调度块">
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => toggleBlockCollapse(block.id)} 
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all rounded-xl"
                    >
                      {block.isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {!block.isCollapsed && (
                  <div className="p-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 xl:col-span-6 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><span className="text-rose-500">*</span> 策略生效时段</label>
                        {isEditing ? (
                          <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                              <input 
                                type="text" 
                                value={block.startTime} 
                                onChange={(e) => updateBlockValue(block.id, 'startTime', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-emerald-100 outline-none pr-10 font-mono" 
                              />
                              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            </div>
                            <span className="text-slate-300 font-bold">~</span>
                            <div className="relative flex-1">
                              <input 
                                type="text" 
                                value={block.endTime} 
                                onChange={(e) => updateBlockValue(block.id, 'endTime', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-emerald-100 outline-none pr-10 font-mono" 
                              />
                              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            </div>
                          </div>
                        ) : <div className="text-sm font-black text-slate-800 px-2 py-3 font-mono">{block.startTime} ~ {block.endTime}</div>}
                      </div>
                      <div className="col-span-12 xl:col-span-6 space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">全局逆流限额阈值</label>
                        <div className="relative">
                          <input disabled={!isEditing} type="number" placeholder="请输入数值" value={block.threshold} onChange={(e) => updateBlockValue(block.id, 'threshold', e.target.value)} className="w-full bg-white border border-slate-200 disabled:bg-transparent disabled:border-transparent rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-emerald-100 outline-none pr-12" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold uppercase">kW</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            储能放电预留容量
                            {isEditing && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>}
                          </div>
                          {isEditing ? <div className="flex items-center gap-2"><input type="number" value={block.reserveDischarge} onChange={(e) => updateBlockValue(block.id, 'reserveDischarge', e.target.value)} className="w-24 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-black focus:ring-2 ring-emerald-100 outline-none" /><span className="text-xs text-slate-400 font-bold">%</span></div> : <div className="text-sm font-black text-emerald-600">{block.reserveDischarge}%</div>}
                        </div>
                        <div className="space-y-1 text-right">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-end">
                            {isEditing && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>}
                            储能充电预留容量
                          </div>
                          {isEditing ? <div className="flex items-center gap-2 justify-end"><input type="number" value={block.reserveCharge} onChange={(e) => updateBlockValue(block.id, 'reserveCharge', e.target.value)} className="w-24 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-black focus:ring-2 ring-emerald-100 outline-none" /><span className="text-xs text-slate-400 font-bold">%</span></div> : <div className="text-sm font-black text-amber-600">{block.reserveCharge}%</div>}
                        </div>
                      </div>
                      <div className="relative pt-6 pb-2 select-none" ref={socContainerRef}>
                        <div className="h-10 w-full bg-slate-100 rounded-full flex overflow-hidden border border-slate-200 shadow-inner relative">
                          <div className="w-[5%] h-full bg-slate-200 flex items-center justify-center text-[9px] text-slate-500 font-bold border-r border-white/50">5%</div>
                          <div 
                            className={`h-full bg-emerald-400/90 flex items-center justify-center text-[10px] text-white font-black transition-all duration-300 border-r border-white/50 relative group ${isEditing ? 'cursor-col-resize' : ''}`} 
                            style={{ width: `${block.reserveDischarge}%` }}
                          >
                            {block.reserveDischarge}%
                            {isEditing && (
                              <div 
                                onMouseDown={() => { setDraggingBlockId(block.id); setDraggingType('discharge'); }}
                                className="absolute right-0 top-0 bottom-0 w-3 bg-emerald-600/30 hover:bg-emerald-600/50 cursor-col-resize flex items-center justify-center transition-colors border-l border-emerald-500/20"
                              >
                                <div className="w-0.5 h-4 bg-white/60 rounded-full"></div>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 h-full bg-white flex items-center justify-center text-[9px] text-slate-400 font-black tracking-widest uppercase italic opacity-50">{(90 - parseInt(block.reserveDischarge) - parseInt(block.reserveCharge))}% 运行区间</div>
                          <div 
                            className={`h-full bg-amber-400/90 flex items-center justify-center text-[10px] text-white font-black transition-all duration-300 border-l border-white/50 group relative ${isEditing ? 'cursor-col-resize' : ''}`} 
                            style={{ width: `${block.reserveCharge}%` }}
                          >
                            {block.reserveCharge}%
                            {isEditing && (
                              <div 
                                onMouseDown={() => { setDraggingBlockId(block.id); setDraggingType('charge'); }}
                                className="absolute left-0 top-0 bottom-0 w-3 bg-amber-600/30 hover:bg-amber-600/50 cursor-col-resize flex items-center justify-center transition-colors border-r border-amber-500/20"
                              >
                                <div className="w-0.5 h-4 bg-white/60 rounded-full"></div>
                              </div>
                            )}
                          </div>
                          <div className="w-[5%] h-full bg-slate-200 flex items-center justify-center text-[9px] text-slate-500 font-bold border-l border-white/50">5%</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-10 mt-10 border-t border-slate-100 pt-10">
                      <div className="col-span-12 xl:col-span-4 space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><span className="text-rose-500">*</span> 主算法调度策略</label>
                        {isEditing ? (
                          <div className="relative">
                            <select value={block.strategyType} onChange={(e) => updateBlockValue(block.id, 'strategyType', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-emerald-100 outline-none appearance-none transition-all shadow-sm">
                              {strategyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        ) : <div className="inline-flex px-4 py-2 rounded-xl text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">{block.strategyType}</div>}
                      </div>

                      {(block.strategyType === '全额消纳（自发自用）' || block.strategyType === '余电上网（自发自用）' || block.strategyType === '动态增容' || block.strategyType === '需量控制') && (
                        <div className="col-span-12 mt-6">
                          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                             <div className="flex items-center gap-3 mb-6">
                                <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                                <span className="text-sm font-black text-slate-800 tracking-tight">允许充放电偏移量设置</span>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                               {(block.strategyType === '全额消纳（自发自用）' || block.strategyType === '余电上网（自发自用）') && (
                                 <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">允许充电偏移量</label>
                                   <div className="relative">
                                      <input 
                                        type="number" 
                                        value={block.chargeOffset || ''} 
                                        onChange={(e) => updateBlockValue(block.id, 'chargeOffset', e.target.value)} 
                                        onFocus={() => isEditing && setFocusedThresholdBlockId(block.id)}
                                        onBlur={() => setFocusedThresholdBlockId(null)}
                                        disabled={!isEditing}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-emerald-100 outline-none transition-all shadow-sm disabled:bg-slate-100 disabled:text-slate-500" 
                                      />
                                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">kW</span>
                                   </div>
                                 </div>
                               )}

                               {(block.strategyType === '动态增容' || block.strategyType === '需量控制') && (
                                 <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">允许放电偏移量</label>
                                   <div className="relative">
                                      <input 
                                        type="number" 
                                        value={block.dischargeOffset || ''} 
                                        onChange={(e) => updateBlockValue(block.id, 'dischargeOffset', e.target.value)} 
                                        onFocus={() => isEditing && setFocusedThresholdBlockId(block.id)}
                                        onBlur={() => setFocusedThresholdBlockId(null)}
                                        disabled={!isEditing}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-emerald-100 outline-none transition-all shadow-sm disabled:bg-slate-100 disabled:text-slate-500" 
                                      />
                                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">kW</span>
                                   </div>
                                 </div>
                               )}

                               {focusedThresholdBlockId === block.id && (
                                 <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50 w-[640px] bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 animate-in fade-in slide-in-from-top-2">
                                   <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-slate-100 rotate-45"></div>
                                   <div className="font-black text-slate-800 text-sm mb-4 text-center tracking-tight">电网功率边界与调控偏移量图解</div>
                                   
                                   <svg viewBox="0 0 600 440" className="w-full h-auto bg-slate-50/50 rounded-2xl border border-slate-100">
                                      <defs>
                                        <marker id="arrowDown" markerWidth="10" markerHeight="10" refX="5" refY="8" orient="auto-start-reverse">
                                          <path d="M 0 0 L 5 8 L 10 0 z" fill="#10b981" />
                                        </marker>
                                        <marker id="arrowUp" markerWidth="10" markerHeight="10" refX="5" refY="2" orient="auto">
                                          <path d="M 0 10 L 5 2 L 10 10 z" fill="#10b981" />
                                        </marker>
                                        <marker id="arrowDownBlue" markerWidth="10" markerHeight="10" refX="5" refY="8" orient="auto-start-reverse">
                                          <path d="M 0 0 L 5 8 L 10 0 z" fill="#3b82f6" />
                                        </marker>
                                        <marker id="arrowUpBlue" markerWidth="10" markerHeight="10" refX="5" refY="2" orient="auto">
                                          <path d="M 0 10 L 5 2 L 10 10 z" fill="#3b82f6" />
                                        </marker>
                                      </defs>

                                      {/* Axis Bar */}
                                      <rect x="30" y="30" width="12" height="380" rx="6" fill="#e2e8f0" />
                                      {/* Zones coloring on the axis */}
                                      <rect x="30" y="30" width="12" height="70" rx="6" fill="#ef4444" /> {/* Top Red */}
                                      <rect x="30" y="100" width="12" height="70" fill="#f59e0b" /> {/* Top Yellow */}
                                      <rect x="30" y="170" width="12" height="100" fill="#10b981" /> {/* Middle Green */}
                                      <rect x="30" y="270" width="12" height="70" fill="#f59e0b" /> {/* Bottom Yellow */}
                                      <rect x="30" y="340" width="12" height="70" rx="6" fill="#ef4444" /> {/* Bottom Red */}

                                      {/* Highlight Zone Background */}
                                      <rect x="42" y="170" width="378" height="100" fill="#3b82f6" fillOpacity="0.05" />

                                      {/* Lines from the axis to the right */}
                                      <line x1="42" y1="40" x2="580" y2="40" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4"/>
                                      <line x1="42" y1="100" x2="580" y2="100" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4"/>
                                      <line x1="42" y1="170" x2="420" y2="170" stroke="#10b981" strokeWidth="2" strokeDasharray="2 2"/>
                                      <line x1="42" y1="270" x2="420" y2="270" stroke="#10b981" strokeWidth="2" strokeDasharray="2 2"/>
                                      <line x1="42" y1="340" x2="580" y2="340" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4"/>
                                      <line x1="42" y1="400" x2="580" y2="400" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4"/>

                                      {/* Texts */}
                                      <foreignObject x="50" y="26" width="530" height="40">
                                        <div xmlns="http://www.w3.org/1999/xhtml" className="flex flex-col">
                                          <span className="text-[13px] font-black text-rose-600">【红色禁区】变压器额定容量</span>
                                          <span className="text-[11px] text-slate-500 mt-0.5">物理极限，绝对不能碰，碰了就停电。</span>
                                        </div>
                                      </foreignObject>

                                      <foreignObject x="50" y="86" width="530" height="40">
                                        <div xmlns="http://www.w3.org/1999/xhtml" className="flex flex-col">
                                          <span className="text-[13px] font-black text-amber-600">【黄色警戒】超容阈值</span>
                                          <span className="text-[11px] text-slate-500 mt-0.5">调控触发点。一旦功率达到这里，储能系统立即开始“干活”（削峰）。</span>
                                        </div>
                                      </foreignObject>

                                      <foreignObject x="50" y="156" width="370" height="60">
                                        <div xmlns="http://www.w3.org/1999/xhtml" className="flex flex-col">
                                          <span className="text-[13px] font-black text-emerald-600">【绿色安全】允许充电偏移量</span>
                                          <span className="text-[11px] text-slate-500 mt-0.5 leading-snug">策略缓冲带。储能充电时，目标是停在“超容阈值 - 偏移量”的位置，给突然增加的负荷留出空间。</span>
                                        </div>
                                      </foreignObject>

                                      <foreignObject x="50" y="256" width="370" height="60">
                                        <div xmlns="http://www.w3.org/1999/xhtml" className="flex flex-col">
                                          <span className="text-[13px] font-black text-emerald-600">【绿色安全】允许放电偏移量</span>
                                          <span className="text-[11px] text-slate-500 mt-0.5 leading-snug">策略缓冲带。储能放电时，目标是停在“逆流阈值 + 偏移量”的位置，给突然增加的光伏留出空间。</span>
                                        </div>
                                      </foreignObject>

                                      <foreignObject x="50" y="326" width="530" height="40">
                                        <div xmlns="http://www.w3.org/1999/xhtml" className="flex flex-col">
                                          <span className="text-[13px] font-black text-amber-600">【黄色警戒】逆流阈值</span>
                                          <span className="text-[11px] text-slate-500 mt-0.5">调控触发点。一旦功率跌到这里，系统立即开始“干活”（限制放电或反向充电）。</span>
                                        </div>
                                      </foreignObject>

                                      <foreignObject x="50" y="386" width="530" height="40">
                                        <div xmlns="http://www.w3.org/1999/xhtml" className="flex flex-col">
                                          <span className="text-[13px] font-black text-rose-600">【红色禁区】0kW 刻度线</span>
                                          <span className="text-[11px] text-slate-500 mt-0.5">防逆流极限，绝对不能掉下去（漏电上网）。</span>
                                        </div>
                                      </foreignObject>

                                      {/* Arrows */}
                                      <g>
                                        <line x1="440" y1="100" x2="440" y2="162" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3"/>
                                        <line x1="440" y1="162" x2="440" y2="168" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowDown)"/>
                                        <foreignObject x="450" y="125" width="140" height="30">
                                          <div xmlns="http://www.w3.org/1999/xhtml" className="text-[12px] font-black text-emerald-600 drop-shadow-sm">
                                            允许充电偏移量
                                          </div>
                                        </foreignObject>

                                        {/* Storage operating zone */}
                                        <line x1="440" y1="178" x2="440" y2="262" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3 3"/>
                                        <line x1="440" y1="178" x2="440" y2="172" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowUpBlue)"/>
                                        <line x1="440" y1="262" x2="440" y2="268" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowDownBlue)"/>
                                        <foreignObject x="450" y="208" width="140" height="30">
                                          <div xmlns="http://www.w3.org/1999/xhtml" className="text-[12px] font-black text-blue-500 drop-shadow-sm bg-white/60 px-1 rounded inline-block">
                                            储能充放运行区间
                                          </div>
                                        </foreignObject>

                                        <line x1="440" y1="340" x2="440" y2="278" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3"/>
                                        <line x1="440" y1="278" x2="440" y2="272" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowUp)"/>
                                        <foreignObject x="450" y="295" width="140" height="30">
                                          <div xmlns="http://www.w3.org/1999/xhtml" className="text-[12px] font-black text-emerald-600 drop-shadow-sm">
                                            允许放电偏移量
                                          </div>
                                        </foreignObject>
                                      </g>
                                   </svg>
                                 </div>
                               )}
                             </div>
                          </div>
                        </div>
                      )}

                      {block.strategyType === '峰谷套利' && (
                        <div className="col-span-12 mt-12 border-t border-slate-100 pt-10">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div onClick={() => updateBlockValue(block.id, 'subPeriods', [...block.subPeriods, { start: '00:00', end: '01:00', type: '充电', power: 0 }])} className="p-2 bg-emerald-50 rounded-xl cursor-pointer hover:bg-emerald-100">
                                <Plus className="w-4 h-4 text-emerald-600" />
                              </div>
                              <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">新增调度时段</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                              <thead><tr className="bg-slate-50 border-b border-slate-100"><th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">适用时段</th><th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">调度模式</th><th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">执行功率</th>{isEditing && <th className="px-6 py-5 text-center">操作</th>}</tr></thead>
                              <tbody className="divide-y divide-slate-50">{block.subPeriods.map((p, idx) => (
                                <tr key={idx} className="group hover:bg-slate-50">
                                  <td className="px-6 py-5 text-sm font-bold text-slate-700 font-mono">{p.start} ~ {p.end}</td>
                                  <td className="px-6 py-5"><span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-100">{p.type}模式</span></td>
                                  <td className="px-6 py-5 text-sm font-mono font-black text-slate-800">{p.power.toFixed(1)} kW</td>
                                  {isEditing && (
                                    <td className="px-6 py-5 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => {
                                          const newSub = [...block.subPeriods];
                                          newSub.splice(idx+1, 0, JSON.parse(JSON.stringify(p)));
                                          updateBlockValue(block.id, 'subPeriods', newSub);
                                        }} className="text-slate-300 hover:text-blue-500 transition-all p-1.5 hover:bg-blue-50 rounded-lg"><Copy className="w-4 h-4" /></button>
                                        <button onClick={() => {
                                          updateBlockValue(block.id, 'subPeriods', block.subPeriods.filter((_, i) => i !== idx));
                                        }} className="text-slate-300 hover:text-rose-500 transition-all p-1.5 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              ))}</tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isEditing && (
               <div className="flex justify-center border-t border-slate-50 pt-12">
                 <button onClick={handleAddNewBlock} className="flex items-center gap-3 px-10 py-4 bg-white border-2 border-dashed border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-300 hover:bg-emerald-50/20 rounded-3xl font-black text-sm transition-all shadow-sm group">
                   <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" /> 添加新调度配置块
                 </button>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
      )}
    </div>
  );
};

export default StrategyConfigPage;
