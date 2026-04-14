import React from 'react';

const MainWiringDiagramPage: React.FC = () => {
  return (
    <div className="flex flex-col h-full min-h-[800px] bg-[#1a2b3c] rounded-xl shadow-sm border border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-[#1e3145]">
        <h1 className="text-xl font-bold text-white">河北国杉2.5MW/6.688MWh用户侧储能项目10kV主接线图</h1>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-[#2a4365] text-white rounded-md text-sm font-medium hover:bg-[#314e75] transition-colors border border-[#3b5b85]">
            储能系统运行工况图
          </button>
          <button className="px-4 py-2 bg-[#2a4365] text-white rounded-md text-sm font-medium hover:bg-[#314e75] transition-colors border border-[#3b5b85]">
            参数下发
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-6 relative overflow-auto">
        {/* Top Summary Cards */}
        <div className="flex justify-center gap-8 mb-12">
          <div className="border border-[#3b5b85] p-4 rounded-md bg-[#1e3145]/50 min-w-[250px]">
            <div className="flex justify-between mb-2">
              <span className="text-white text-sm font-medium">10kV总加组有功功率:</span>
              <span className="text-[#00ff00] font-bold">632kW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white text-sm font-medium">10kV总加组无功功率:</span>
              <span className="text-[#00ff00] font-bold">-119kvar</span>
            </div>
          </div>
          
          <div className="border border-[#3b5b85] p-4 rounded-md bg-[#1e3145]/50 min-w-[250px]">
            <div className="flex justify-between mb-2">
              <span className="text-white text-sm font-medium">当日市电供电量:</span>
              <span className="text-[#00ff00] font-bold">7700kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white text-sm font-medium">储能功率:</span>
              <span className="text-[#00ff00] font-bold">6.6kW</span>
            </div>
          </div>
          
          <div className="border border-[#3b5b85] p-4 rounded-md bg-[#1e3145]/50 min-w-[250px]">
            <div className="flex justify-between mb-2">
              <span className="text-white text-sm font-medium">当日储能系统充电量:</span>
              <span className="text-[#00ff00] font-bold">1860kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white text-sm font-medium">当日储能系统放电量:</span>
              <span className="text-[#00ff00] font-bold">1080kWh</span>
            </div>
          </div>
          
          <div className="border border-[#3b5b85] p-4 rounded-md bg-[#1e3145]/50 min-w-[250px]">
            <div className="flex justify-between mb-2">
              <span className="text-white text-sm font-medium">昨日储能系统充电量:</span>
              <span className="text-[#00ff00] font-bold">3960kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white text-sm font-medium">昨日储能系统放电量:</span>
              <span className="text-[#00ff00] font-bold">3480kWh</span>
            </div>
          </div>
        </div>

        {/* Wiring Diagram Area (Placeholder for actual diagram) */}
        <div className="relative w-full h-[600px] border border-[#3b5b85] rounded-lg bg-[#1e3145]/30 flex items-center justify-center">
          <div className="text-slate-400 flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-yellow-400 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-yellow-400 rounded-full"></div>
            </div>
            <p className="text-lg">主接线图可视化区域</p>
            <p className="text-sm text-slate-500">（请参考图1示例，此处为占位符）</p>
          </div>
          
          {/* Example Data Box (like in the image) */}
          <div className="absolute top-20 left-1/4 border border-[#3b5b85] bg-[#1a2b3c] p-3 rounded text-xs w-48">
            <div className="bg-[#2a4365] text-white text-center py-1 mb-2 font-bold">1#主进</div>
            <div className="space-y-1">
              <div className="flex justify-between"><span className="text-white">Uab:</span><span className="text-[#00ff00]">10220V</span></div>
              <div className="flex justify-between"><span className="text-white">Ubc:</span><span className="text-[#00ff00]">0V</span></div>
              <div className="flex justify-between"><span className="text-white">Uca:</span><span className="text-[#00ff00]">10220V</span></div>
              <div className="h-px bg-[#3b5b85] my-1"></div>
              <div className="flex justify-between"><span className="text-white">Ia:</span><span className="text-[#00ff00]">34.2A</span></div>
              <div className="flex justify-between"><span className="text-white">Ib:</span><span className="text-[#00ff00]">0A</span></div>
              <div className="flex justify-between"><span className="text-white">Ic:</span><span className="text-[#00ff00]">37.6A</span></div>
              <div className="h-px bg-[#3b5b85] my-1"></div>
              <div className="flex justify-between"><span className="text-white">P:</span><span className="text-[#00ff00]">632kW</span></div>
              <div className="flex justify-between"><span className="text-white">Q:</span><span className="text-[#00ff00]">-119kvar</span></div>
              <div className="flex justify-between"><span className="text-white">Pf:</span><span className="text-[#00ff00]">0.982</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainWiringDiagramPage;
