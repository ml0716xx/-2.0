
import React, { useEffect, useState } from 'react';
import { Database, ChevronRight, ChevronLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import EnergyFlowDiagram from './components/EnergyFlowDiagram';
import StatsCard from './components/StatsCard';
import RevenueCard from './components/RevenueCard';
import AlarmPanel from './components/AlarmPanel';
import StrategyPanel from './components/StrategyPanel';
import Header from './components/Header';
import WeatherPanel from './components/WeatherPanel';
import EnergyRevenueSection from './components/EnergyRevenueSection';
import StrategyMonitorPage from './components/StrategyMonitorPage';
import SocialContributionSection from './components/SocialContributionSection';
import StrategyConfigPage from './components/StrategyConfigPage';
import StrategySchedulePage from './components/StrategySchedulePage';
import StrategySchedulePage2 from './components/StrategySchedulePage2';
import MainWiringDiagramPage from './components/MainWiringDiagramPage';
import StorageMonitoringPage from './components/StorageMonitoringPage';
import AlarmManagementPage from './components/AlarmManagementPage';
import AlgorithmPredictionPage from './components/AlgorithmPredictionPage';
import AlgorithmPredictionPage2 from './components/AlgorithmPredictionPage2';
import StrategyReportPage from './components/StrategyReportPage';
import AlgorithmMonitoringPage from './components/AlgorithmMonitoringPage';
import ElectricityReportPage from './components/ElectricityReportPage';
import RevenueReportPage from './components/RevenueReportPage';import TopologyManagementPage from './components/TopologyManagementPage';
import BusinessReportPage, { type Lifecycle } from './components/BusinessReportPage';
import TianyingSimReportModal from './components/TianyingSimReportModal';
import { EnergyStat, RevenueStat, AlarmItem, StrategyGroup } from './types';

/** 「本月不再提示」的本地存储键；值存当前月份 key（YYYY-MM） */
const SIM_DISMISS_KEY = 'ty_sim_report_dismiss_month';

/**
 * 本次会话是否已自动弹过仿真报告。
 * 模块级变量 + 在定时器触发时才置位：StrictMode 下 effect 会「执行→清理→再执行」，
 * 若在 effect 开头就置位，第二次执行会直接 return，而清理阶段已清掉定时器，弹窗将永不出现。
 */
let simAutoShown = false;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'yesterday' | 'total'>('today');
  const [currentPage, setCurrentPage] = useState('监控概览');
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  /** 监控概览默认展示能流图（原 3D 光储能流图） */
  const [overviewDiagramType, setOverviewDiagramType] = useState<'flow' | 'wiring'>('flow');

  /** 客户生命周期：未开通（售前） → 试运行 → 正式运行 */
  const [lifecycle, setLifecycle] = useState<Lifecycle>('presale');
  /** 《天盈 AI 仿真报告》弹窗 */
  const [isSimReportOpen, setIsSimReportOpen] = useState(false);
  /** 状态流转提示 */
  const [lifecycleToast, setLifecycleToast] = useState<string | null>(null);

  const currentMonthKey = new Date().toISOString().slice(0, 7);

  /* 售前阶段：进入系统后自动弹出仿真报告；勾选「本月不再提示」后当月不再弹 */
  useEffect(() => {
    if (simAutoShown) return;
    if (lifecycle !== 'presale') return;
    if (localStorage.getItem(SIM_DISMISS_KEY) === currentMonthKey) return;
    const timer = window.setTimeout(() => {
      simAutoShown = true;
      setIsSimReportOpen(true);
    }, 900);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg: string) => {
    setLifecycleToast(msg);
    window.setTimeout(() => setLifecycleToast(null), 4200);
  };

  /** 开通试运行（弹窗 CTA） */
  const handleActivateTrial = () => {
    setLifecycle('trial');
    setIsSimReportOpen(false);
    showToast('AI 智能调度试用已开通：30 天试用期已开始，策略运行报告与经营分析报告已切换为试运行口径。');
  };

  /** 试运行 → 正式运行 */
  const handleConvertToFormal = () => {
    setLifecycle('formal');
    showToast('已升级为正式版：AI 智能调度进入常态化托管，试用期专项模块已替换为长期累积收益与模型迭代日志。');
  };

  // Mock data with yesterday values
  const [energyStats] = useState<EnergyStat[]>([
    { type: 'pv', todayValue: 270.9, yesterdayValue: 258.4, totalValue: 12500, unit: 'kWh', trend: 5.2 },
    { type: 'storage', todayValue: 960, yesterdayValue: 945, totalValue: 45000, unit: 'kWh', trend: -2.1, subValue: { charge: 960, discharge: 1010 } },
    { type: 'charging', todayValue: 402, yesterdayValue: 380, totalValue: 21000, unit: 'kWh', trend: 18.5 },
    { type: 'grid-in', todayValue: 18.8, yesterdayValue: 20.2, totalValue: 5200, unit: 'kWh', trend: 2.4 },
    { type: 'grid-out', todayValue: 42.5, yesterdayValue: 39.8, totalValue: 8900, unit: 'kWh', trend: -1.2 },
  ]);

  const [revenue] = useState<RevenueStat>({
    today: 48,
    yesterday: 45.5,
    total: 3200,
    trend: 9.1,
    breakdown: { pv: 27.1, storage: 12.5, charging: 8.4 },
    rates: { peak: 1.2, flat: 0.8, valley: 0.3 }
  });

  const [alarms] = useState<AlarmItem[]>([
    { id: '1', level: 'warning', source: '光伏逆变器#1', message: '温度预警 65°C', timestamp: '14:23' },
    { id: '2', level: 'info', source: '储能电池组#2', message: 'SOC不平衡 3%', timestamp: '13:45' }
  ]);

  const [strategyGroup] = useState<StrategyGroup>({
    startTime: '14:00',
    endTime: '17:00',
    status: 'running',
    activeStrategies: [
      {
        id: '3',
        name: '峰谷套利',
        englishName: 'Peak-Valley Arbitrage',
        priority: 3,
        type: 'main',
        params: [],
        currentTask: { type: '储能放电', power: 120.5 }
      },
      {
        id: '1',
        name: '余电上网',
        englishName: 'Grid-Export Priority',
        priority: 1,
        type: 'sub',
        params: [{ label: '储能允许放电阈值', value: '100', unit: 'kW' }]
      },
      {
        id: '2',
        name: '动态增容',
        englishName: 'Dynamic Expansion',
        priority: 2,
        type: 'sub',
        params: [{ label: '储能允许充电阈值', value: '100', unit: 'kW' }]
      }
    ],
    nextTask: { type: '平时充电', time: '17:00 - 22:00', power: 50.0 }
  });

  const renderContent = () => {
    if (currentPage === '策略配置') {
      return (
        <StrategyConfigPage
          lifecycle={lifecycle}
          onActivate={handleActivateTrial}
          onConvert={handleConvertToFormal}
          onSwitchLifecycle={setLifecycle}
        />
      );
    }
    if (currentPage === '策略运行') {
      return <StrategySchedulePage2 />;
    }
    if (currentPage === '组态监控') {
      return <MainWiringDiagramPage />;
    }
    if (currentPage === '储能监控') {
      return <StorageMonitoringPage />;
    }
    if (currentPage === '算法推理') {
      return <AlgorithmPredictionPage onNavigate={setCurrentPage} />;
    }
    if (currentPage === '算法推理2') {
      return <AlgorithmPredictionPage2 onNavigate={setCurrentPage} />;
    }
    if (currentPage === '报警管理') {
      return <AlarmManagementPage />;
    }
    if (currentPage === '策略运行报告') {
      return (
        <StrategyReportPage
          lifecycle={lifecycle}
          onActivate={handleActivateTrial}
          onConvert={handleConvertToFormal}
          onSwitchLifecycle={setLifecycle}
          onOpenSimReport={() => setIsSimReportOpen(true)}
        />
      );
    }
    if (currentPage === '经营分析报告') {
      return (
        <BusinessReportPage
          lifecycle={lifecycle}
          onOpenSimReport={() => setIsSimReportOpen(true)}
          onConvert={handleConvertToFormal}
          onActivate={handleActivateTrial}
        />
      );
    }
    if (currentPage === '电量报表' || currentPage === '统计报表') {
      return <ElectricityReportPage />;
    }
    if (currentPage === '收益报表') {
      return <RevenueReportPage />;
    }
    if (currentPage === '算法监控') {
      return <AlgorithmMonitoringPage />;
    }
    if (currentPage === '拓扑管理') {
      return <TopologyManagementPage onNavigate={setCurrentPage} />;
    }
    if (currentPage === '策略监控') {
      return <StrategyMonitorPage />;
    }

    return (
      <>
        {/* Hero Section: Flow and Side Panels */}
        <div className="flex flex-col xl:flex-row relative">
          {/* Left Panel (Collapsible) */}
          <div 
            className="transition-all duration-500 ease-in-out flex-shrink-0 relative z-20 overflow-hidden"
            style={{ 
              width: isLeftPanelOpen ? '320px' : '0px',
              marginRight: isLeftPanelOpen ? '1rem' : '0px'
            }}
          >
            <div 
              className="w-[320px] flex flex-col gap-4 h-full transition-all duration-500 ease-in-out"
              style={{
                transform: isLeftPanelOpen ? 'translateX(0)' : 'translateX(-50px)',
                opacity: isLeftPanelOpen ? 1 : 0,
                pointerEvents: isLeftPanelOpen ? 'auto' : 'none'
              }}
            >
              <StatsCard stats={energyStats} activeTab={activeTab} onTabChange={setActiveTab} />
              <RevenueCard revenue={revenue} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>

          {/* Middle Panel */}
          <div className="flex-1 flex flex-col h-full relative min-w-0 transition-all duration-500 ease-in-out">
            {/* Left Toggle Button */}
            <button 
              onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
              className={`absolute top-1/2 -translate-y-1/2 z-40 flex items-center justify-center bg-white border border-slate-200 shadow-lg hover:bg-slate-50 text-slate-500 cursor-pointer transition-all duration-500 ease-in-out ${
                isLeftPanelOpen 
                  ? '-left-5 w-10 h-10 rounded-full' 
                  : 'left-0 w-6 h-24 rounded-r-xl border-l-0'
              }`}
            >
              {isLeftPanelOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>

            {/* Right Toggle Button */}
            <button 
              onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
              className={`absolute top-1/2 -translate-y-1/2 z-40 flex items-center justify-center bg-white border border-slate-200 shadow-lg hover:bg-slate-50 text-slate-500 cursor-pointer transition-all duration-500 ease-in-out ${
                isRightPanelOpen 
                  ? '-right-5 w-10 h-10 rounded-full' 
                  : 'right-0 w-6 h-24 rounded-l-xl border-r-0'
              }`}
            >
              {isRightPanelOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            
            <div 
              className={`relative h-full flex flex-col transition-all duration-500 ease-in-out ${isLeftPanelOpen ? '' : 'pl-8'} ${isRightPanelOpen ? '' : 'pr-8'}`} 
            >
              {/* Header control bar for diagram switching */}
              <div className="flex items-center justify-between mb-2.5 bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
                  <button
                    onClick={() => setOverviewDiagramType('flow')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      overviewDiagramType === 'flow'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    能流图
                  </button>
                  <button
                    onClick={() => setOverviewDiagramType('wiring')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      overviewDiagramType === 'wiring'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    电气组态监控
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsSimReportOpen(true)}
                    className="relative bg-white hover:bg-slate-50 px-4 py-1.5 rounded-xl text-xs font-bold text-slate-700 transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#1E9C7E]" />
                    天盈 AI 仿真报告
                    {lifecycle === 'presale' && (
                      <span className="ml-0.5 px-1.5 py-0.5 rounded-md bg-[#E8F7F1] text-[#17705A] text-[10px] font-bold">
                        NEW
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => setCurrentPage('策略监控')}
                    className="bg-emerald-50 hover:bg-emerald-100/80 px-4 py-1.5 rounded-xl text-xs font-bold text-emerald-700 transition-all border border-emerald-200/80 flex items-center gap-1 cursor-pointer"
                  >
                    点击查看策略监控 &rarr;
                  </button>
                </div>
              </div>

              <div className="h-full flex-1 min-h-0">
                {overviewDiagramType === 'flow' ? (
                  <EnergyFlowDiagram alarms={alarms} onNavigate={setCurrentPage} />
                ) : (
                  <MainWiringDiagramPage isEmbedded={true} />
                )}
              </div>
            </div>
          </div>

          {/* Right Panel (Collapsible) */}
          <div 
            className="transition-all duration-500 ease-in-out flex-shrink-0 relative z-20 overflow-hidden mt-4 xl:mt-0"
            style={{ 
              width: isRightPanelOpen ? '320px' : '0px',
              marginLeft: isRightPanelOpen ? '1rem' : '0px'
            }}
          >
            <div 
              className="w-[320px] flex flex-col gap-4 h-full transition-all duration-500 ease-in-out"
              style={{
                transform: isRightPanelOpen ? 'translateX(0)' : 'translateX(50px)',
                opacity: isRightPanelOpen ? 1 : 0,
                pointerEvents: isRightPanelOpen ? 'auto' : 'none'
              }}
            >
              <WeatherPanel />
              <StrategyPanel strategy={strategyGroup} />
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-12 gap-4 mt-4">
          <div className="col-span-12 xxl:col-span-8">
            <EnergyRevenueSection />
          </div>
          <div className="col-span-12 xxl:col-span-4">
            <SocialContributionSection />
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Left Sidebar */}
      <Sidebar onNavigate={setCurrentPage} activePage={currentPage} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 sm:p-5 gap-4 sm:gap-5 overflow-y-auto max-w-[1920px] mx-auto w-full">
        {/* Top Header（消息中心随生命周期变化，故需透传 lifecycle 与跳转能力） */}
        <Header
          lifecycle={lifecycle}
          onNavigate={setCurrentPage}
          onOpenSimReport={() => setIsSimReportOpen(true)}
        />

        {renderContent()}

        {/* Footer / Status Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mt-2">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2 border-l border-slate-100 pl-8"><Database className="w-4 h-4 text-blue-500" /> 云端同步周期: 15s</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-bold text-slate-700">系统逻辑链路正常</span>
          </div>
        </div>
      </main>

      {/* 《天盈 AI 仿真报告》弹窗（售前触达） */}
      <TianyingSimReportModal
        isOpen={isSimReportOpen}
        onClose={() => setIsSimReportOpen(false)}
        onActivate={handleActivateTrial}
        onDismissThisMonth={() => localStorage.setItem(SIM_DISMISS_KEY, currentMonthKey)}
      />

      {/* 生命周期流转提示 */}
      {lifecycleToast && (
        <div className="fixed bottom-6 right-6 z-[70] max-w-[420px] bg-[#1A2A3A]/95 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-start gap-3 border border-[#2C3E50] backdrop-blur-xs">
          <CheckCircle2 className="w-4 h-4 text-[#7BE0C0] mt-0.5 shrink-0" />
          <span className="text-xs font-bold leading-relaxed">{lifecycleToast}</span>
        </div>
      )}
    </div>
  );
};

export default App;
