import React from 'react';

const StorageMonitoringPage: React.FC = () => {
  return (
    <div className="flex flex-col h-full min-h-[800px] bg-[#1a2b3c] rounded-xl shadow-sm border border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-[#1e3145]">
        <h1 className="text-xl font-bold text-white">储能监控</h1>
      </div>
      
      <div className="flex-1 p-6 relative overflow-auto flex items-center justify-center">
        {/* 3D Model Area (Placeholder) */}
        <div className="relative w-full max-w-6xl h-[600px] border border-[#3b5b85] rounded-lg bg-[#1e3145]/30 flex flex-col items-center justify-center">
          <div className="text-slate-400 flex flex-col items-center gap-4 mb-12">
            <div className="w-32 h-16 bg-slate-600 rounded-sm flex items-center justify-center border-2 border-slate-500">
              <span className="text-white font-bold">储能柜 3D 模型</span>
            </div>
            <p className="text-lg">储能监控可视化区域</p>
            <p className="text-sm text-slate-500">（请参考图2示例，此处为占位符）</p>
          </div>
          
          {/* Example Data Boxes (like in the image) */}
          <div className="absolute top-10 left-10 border border-[#00ffff] bg-[#1a2b3c]/80 p-3 rounded text-xs w-48 shadow-[0_0_10px_rgba(0,255,255,0.2)]">
            <div className="text-[#00ffff] font-bold mb-2 border-b border-[#00ffff]/30 pb-1">EMS1(32410102) 主机</div>
            <div className="space-y-1.5">
              <div className="flex justify-between"><span className="text-white">运行模式:</span><span className="text-[#00ff00]">单柜主机</span></div>
              <div className="flex justify-between items-center"><span className="text-white">运行状态:</span><div className="w-3 h-3 rounded-full bg-[#00ff00]"></div></div>
            </div>
          </div>

          <div className="absolute top-40 left-10 border border-[#00ffff] bg-[#1a2b3c]/80 p-3 rounded text-xs w-48 shadow-[0_0_10px_rgba(0,255,255,0.2)]">
            <div className="text-[#00ffff] font-bold mb-2 border-b border-[#00ffff]/30 pb-1">测控装置1</div>
            <div className="space-y-1">
              <div className="flex justify-between"><span className="text-white">Uab:</span><span className="text-[#00ff00]">668V</span></div>
              <div className="flex justify-between"><span className="text-white">Ubc:</span><span className="text-[#00ff00]">667V</span></div>
              <div className="flex justify-between"><span className="text-white">Uca:</span><span className="text-[#00ff00]">668V</span></div>
              <div className="h-px bg-[#00ffff]/30 my-1"></div>
              <div className="flex justify-between"><span className="text-white">Ia:</span><span className="text-[#00ff00]">4A</span></div>
              <div className="flex justify-between"><span className="text-white">Ib:</span><span className="text-[#00ff00]">4A</span></div>
              <div className="flex justify-between"><span className="text-white">Ic:</span><span className="text-[#00ff00]">4A</span></div>
            </div>
          </div>

          <div className="absolute top-10 right-10 border border-[#00ffff] bg-[#1a2b3c]/80 p-3 rounded text-xs w-64 shadow-[0_0_10px_rgba(0,255,255,0.2)]">
            <div className="flex border-b border-[#00ffff]/30 pb-1 mb-2">
              <div className="flex-1 text-center text-[#00ffff] font-bold border-r border-[#00ffff]/30">电池舱A</div>
              <div className="flex-1 text-center text-[#00ffff] font-bold">电池舱B</div>
            </div>
            <div className="flex">
              <div className="flex-1 pr-2 border-r border-[#00ffff]/30 space-y-1">
                <div className="flex justify-between"><span className="text-white">SOC:</span><span className="text-[#00ff00]">59%</span></div>
                <div className="flex justify-between"><span className="text-white">总电压:</span><span className="text-[#00ff00]">1387.8V</span></div>
                <div className="flex justify-between"><span className="text-white">总电流:</span><span className="text-white">0A</span></div>
              </div>
              <div className="flex-1 pl-2 space-y-1">
                <div className="flex justify-between"><span className="text-white">SOC:</span><span className="text-[#00ff00]">59.1%</span></div>
                <div className="flex justify-between"><span className="text-white">总电压:</span><span className="text-[#00ff00]">1388.1V</span></div>
                <div className="flex justify-between"><span className="text-white">总电流:</span><span className="text-white">0A</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageMonitoringPage;
