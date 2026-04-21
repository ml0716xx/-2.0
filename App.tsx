
import React, { useState } from 'react';
import { Activity, Database, ChevronRight, ChevronLeft } from 'lucide-react';
import Sidebar from './components/Sidebar';
import EnergyFlowDiagram from './components/EnergyFlowDiagram';
import StatsCard from './components/StatsCard';
import RevenueCard from './components/RevenueCard';
import AlarmPanel from './components/AlarmPanel';
import StrategyPanel from './components/StrategyPanel';
import Header from './components/Header';
import WeatherPanel from './components/WeatherPanel';
import PowerStrategySection from './components/PowerStrategySection';
import EnergyRevenueSection from './components/EnergyRevenueSection';
import SocialContributionSection from './components/SocialContributionSection';
import StrategyConfigPage from './components/StrategyConfigPage';
import StrategySchedulePage from './components/StrategySchedulePage';
import MainWiringDiagramPage from './components/MainWiringDiagramPage';
import StorageMonitoringPage from './components/StorageMonitoringPage';
import AlarmManagementPage from './components/AlarmManagementPage';
import AlgorithmPredictionPage from './components/AlgorithmPredictionPage';
import StrategyReportPage from './components/StrategyReportPage';
import { EnergyStat, RevenueStat, AlarmItem, StrategyGroup } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'yesterday' | 'total'>('today');
  const [currentPage, setCurrentPage] = useState('监控概览');
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

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
      return <StrategyConfigPage />;
    }
    if (currentPage === '策略运行') {
      return <StrategySchedulePage />;
    }
    if (currentPage === '主接线图') {
      return <MainWiringDiagramPage />;
    }
    if (currentPage === '储能监控') {
      return <StorageMonitoringPage />;
    }
    if (currentPage === '算法预测监控') {
      return <AlgorithmPredictionPage onNavigate={setCurrentPage} />;
    }
    if (currentPage === '报警管理') {
      return <AlarmManagementPage />;
    }
    if (currentPage === '策略运行报告') {
      return <StrategyReportPage />;
    }
    if (currentPage === '策略监控') {
      return (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-800">策略监控</h1>
            <button 
              onClick={() => setCurrentPage('监控中心')} 
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors flex items-center gap-1"
            >
              &larr; 返回监控中心
            </button>
          </div>
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 xl:col-span-8">
              <PowerStrategySection />
            </div>
            <div className="col-span-12 xl:col-span-4">
              <StrategyPanel strategy={strategyGroup} />
            </div>
          </div>
        </div>
      );
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
              marginRight: isLeftPanelOpen ? '2rem' : '0px'
            }}
          >
            <div 
              className="w-[320px] flex flex-col gap-8 h-full transition-all duration-500 ease-in-out"
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
              className={`relative h-full transition-all duration-500 ease-in-out ${isLeftPanelOpen ? '' : 'pl-8'} ${isRightPanelOpen ? '' : 'pr-8'}`} 
            >
              <button 
                onClick={() => setCurrentPage('策略监控')}
                className="absolute top-6 right-6 z-30 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm border border-emerald-100 flex items-center gap-1 cursor-pointer hover:shadow-md"
              >
                点击查看策略监控 &rarr;
              </button>
              <div className="h-full">
                <EnergyFlowDiagram alarms={alarms} onNavigate={setCurrentPage} />
              </div>
            </div>
          </div>

          {/* Right Panel (Collapsible) */}
          <div 
            className="transition-all duration-500 ease-in-out flex-shrink-0 relative z-20 overflow-hidden mt-8 xl:mt-0"
            style={{ 
              width: isRightPanelOpen ? '320px' : '0px',
              marginLeft: isRightPanelOpen ? '2rem' : '0px'
            }}
          >
            <div 
              className="w-[320px] flex flex-col gap-6 h-full transition-all duration-500 ease-in-out"
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
        <div className="grid grid-cols-12 gap-8">
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
      <main className="flex-1 flex flex-col p-8 gap-8 overflow-y-auto max-w-[1920px] mx-auto w-full">
        {/* Top Header */}
        <Header />

        {renderContent()}

        {/* Footer / Status Bar */}
        <div className="flex items-center justify-between text-sm text-slate-500 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm mt-4">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> 站点当前健康指数: 98/100</span>
            <span className="flex items-center gap-2 border-l border-slate-100 pl-8"><Database className="w-4 h-4 text-blue-500" /> 云端同步周期: 15s</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-bold text-slate-700">系统逻辑链路正常</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
