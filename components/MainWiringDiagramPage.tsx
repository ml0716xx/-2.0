import React from 'react';

const ElectricalSymbols = {
  FlowLine: ({ x1, y1, x2, y2, color = "#10b981" }: { x1: number, y1: number, x2: number, y2: number, color?: string }) => (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#cbd5e1" strokeWidth="2" />
      <line 
        x1={x1} y1={y1} x2={x2} y2={y2} 
        stroke={color} 
        strokeWidth="2" 
        strokeDasharray="8 8" 
        className="flow-line" 
      />
    </g>
  ),
  Grid: ({ x, y }: { x: number, y: number }) => (
    <g transform={`translate(${x}, ${y})`}>
      <circle cx="0" cy="0" r="15" fill="none" stroke="#10b981" strokeWidth="2" />
      <path d="M -10 0 Q -5 -10 0 0 T 10 0" fill="none" stroke="#10b981" strokeWidth="2" />
      <text x="25" y="5" fill="#10b981" fontSize="14" fontWeight="bold">10kV 市电网</text>
    </g>
  ),
  Meter: ({ x, y, label }: { x: number, y: number, label?: string }) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-12" y="-12" width="24" height="24" fill="#ffffff" stroke="#8b5cf6" strokeWidth="2" rx="2" />
      <text x="0" y="4" fill="#8b5cf6" fontSize="12" textAnchor="middle" fontWeight="bold">M</text>
      {label && <text x="20" y="4" fill="#475569" fontSize="12">{label}</text>}
    </g>
  ),
  Transformer: ({ x, y, label }: { x: number, y: number, label: string }) => (
    <g transform={`translate(${x}, ${y})`}>
      <circle cx="0" cy="-10" r="14" fill="none" stroke="#3b82f6" strokeWidth="2" />
      <circle cx="0" cy="10" r="14" fill="none" stroke="#3b82f6" strokeWidth="2" />
      <text x="25" y="5" fill="#3b82f6" fontSize="12">{label}</text>
    </g>
  ),
  Breaker: ({ x, y, status = 'closed', label }: { x: number, y: number, status?: 'closed' | 'open', label?: string }) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-8" y="-8" width="16" height="16" fill={status === 'closed' ? '#ef4444' : '#22c55e'} stroke="#fff" strokeWidth="1" />
      {label && <text x="15" y="4" fill="#94a3b8" fontSize="12">{label}</text>}
    </g>
  ),
  Inverter: ({ x, y, label }: { x: number, y: number, label?: string }) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-18" y="-18" width="36" height="36" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" rx="4" />
      <line x1="-18" y1="-18" x2="18" y2="18" stroke="#94a3b8" strokeWidth="1" />
      <text x="-12" y="-2" fill="#64748b" fontSize="10" fontWeight="bold">DC</text>
      <text x="2" y="12" fill="#64748b" fontSize="10" fontWeight="bold">AC</text>
      {label && <text x="25" y="5" fill="#475569" fontSize="12">{label}</text>}
    </g>
  ),
  PV: ({ x, y }: { x: number, y: number }) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-24" y="-12" width="48" height="24" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" rx="2" />
      <line x1="-12" y1="-12" x2="-12" y2="12" stroke="#3b82f6" strokeWidth="1" />
      <line x1="0" y1="-12" x2="0" y2="12" stroke="#3b82f6" strokeWidth="1" />
      <line x1="12" y1="-12" x2="12" y2="12" stroke="#3b82f6" strokeWidth="1" />
      <line x1="-24" y1="0" x2="24" y2="0" stroke="#3b82f6" strokeWidth="1" />
      <text x="0" y="30" fill="#3b82f6" fontSize="14" textAnchor="middle" fontWeight="bold">光伏阵列</text>
    </g>
  ),
  Battery: ({ x, y }: { x: number, y: number }) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-16" y="-24" width="32" height="48" fill="#ffffff" stroke="#10b981" strokeWidth="2" rx="3" />
      <rect x="-6" y="-28" width="12" height="4" fill="#10b981" rx="1" />
      <line x1="-10" y1="-8" x2="10" y2="-8" stroke="#10b981" strokeWidth="2" />
      <line x1="0" y1="-14" x2="0" y2="-2" stroke="#10b981" strokeWidth="2" />
      <line x1="-10" y1="12" x2="10" y2="12" stroke="#10b981" strokeWidth="2" />
      <text x="0" y="42" fill="#10b981" fontSize="14" textAnchor="middle" fontWeight="bold">储能电池</text>
    </g>
  ),
  EVCharger: ({ x, y }: { x: number, y: number }) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-14" y="-24" width="28" height="48" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" rx="4" />
      <circle cx="0" cy="-10" r="5" fill="#f59e0b" />
      <path d="M 14 -5 Q 24 -5 24 5 L 24 15" fill="none" stroke="#f59e0b" strokeWidth="2" />
      <rect x="21" y="15" width="6" height="10" fill="#f59e0b" rx="1" />
      <text x="0" y="42" fill="#f59e0b" fontSize="14" textAnchor="middle" fontWeight="bold">充电桩群</text>
    </g>
  ),
  Load: ({ x, y }: { x: number, y: number }) => (
    <g transform={`translate(${x}, ${y})`}>
      <path d="M 0 -15 L 0 5 L -10 -5 M 0 5 L 10 -5" fill="none" stroke="#a8a29e" strokeWidth="2" />
      <rect x="-18" y="5" width="36" height="18" fill="#ffffff" stroke="#a8a29e" strokeWidth="2" rx="2" />
      <text x="0" y="42" fill="#a8a29e" fontSize="14" textAnchor="middle" fontWeight="bold">常规负荷</text>
    </g>
  ),
  DataBox: ({ x, y, title, data, color = '#3b82f6', active = true }: { x: number, y: number, title: string, data: {label: string, value: string}[], color?: string, active?: boolean }) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="0" y="0" width="160" height={24 + data.length * 20} fill="#ffffff" stroke={color} strokeWidth="1" rx="4" opacity="0.95" />
      <rect x="0" y="0" width="160" height="24" fill={color} opacity="0.15" rx="4" />
      <text x="80" y="16" fill={color} fontSize="12" textAnchor="middle" fontWeight="bold">{title}</text>
      {active && <circle cx="145" cy="12" r="4" fill="#10b981" className="animate-pulse" />}
      {!active && <circle cx="145" cy="12" r="4" fill="#94a3b8" />}
      {data.map((item, i) => (
        <g key={i} transform={`translate(10, ${40 + i * 20})`}>
          <text x="0" y="0" fill="#64748b" fontSize="11">{item.label}</text>
          <text x="140" y="0" fill="#1e293b" fontSize="11" textAnchor="end" fontWeight="bold">{item.value}</text>
        </g>
      ))}
    </g>
  )
};

const MainWiringDiagramPage: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <h1 className="text-xl font-bold text-slate-800">河北国杉2.5MW/6.688MWh用户侧储能项目10kV主接线图</h1>
      </div>
      
      <div className="flex-1 p-6 relative overflow-hidden flex flex-col">
        <style>
          {`
            @keyframes flow {
              to { stroke-dashoffset: -16; }
            }
            .flow-line {
              animation: flow 0.8s linear infinite;
            }
            @keyframes busbar-glow {
              0%, 100% { opacity: 0.1; }
              50% { opacity: 0.3; }
            }
            .busbar-glow {
              animation: busbar-glow 2s ease-in-out infinite;
            }
          `}
        </style>
        {/* Wiring Diagram Area */}
        <div className="relative w-full h-full border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner p-4">
          
          {/* Legend */}
          <div className="absolute top-6 left-6 bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
            <h3 className="text-slate-700 text-xs font-bold mb-2 border-b border-slate-100 pb-1">图例说明</h3>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-0.5 border-t-2 border-dashed border-[#10b981] flow-line"></div>
              <span className="text-slate-500 text-xs">电能流动方向</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></div>
              <span className="text-slate-500 text-xs">设备运行正常</span>
            </div>
          </div>

          <svg width="100%" height="100%" viewBox="0 0 1200 850" preserveAspectRatio="xMidYMid meet" className="max-w-full max-h-full">
            <g transform="translate(100, 50)">
              {/* Grid & Main Incoming */}
            <ElectricalSymbols.Grid x={500} y={40} />
            <ElectricalSymbols.FlowLine x1={500} y1={55} x2={500} y2={82} color="#ef4444" />
            <ElectricalSymbols.Breaker x={500} y={90} label="10kV 进线柜 (1AH1)" />
            <ElectricalSymbols.FlowLine x1={500} y1={98} x2={500} y2={126} color="#ef4444" />
            <ElectricalSymbols.Transformer x={500} y={150} label="10kV/0.4kV 变压器 (1T1)" />
            <ElectricalSymbols.FlowLine x1={500} y1={174} x2={500} y2={188} color="#ef4444" />
            <ElectricalSymbols.Meter x={500} y={200} label="0.4kV 关口表" />
            <ElectricalSymbols.FlowLine x1={500} y1={212} x2={500} y2={232} color="#ef4444" />
            <ElectricalSymbols.Breaker x={500} y={240} label="0.4kV 进线柜 (1AA1)" />
            <ElectricalSymbols.FlowLine x1={500} y1={248} x2={500} y2={280} color="#ef4444" />
            
            {/* Main 0.4kV Busbar */}
            <line x1="100" y1="280" x2="900" y2="280" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" className="busbar-glow" />
            <line x1="100" y1="280" x2="900" y2="280" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            <text x="120" y="265" fill="#475569" fontSize="14" fontWeight="bold">0.4kV I段母线</text>
            <ElectricalSymbols.DataBox x={40} y={180} title="0.4kV 母线监测" color="#64748b" active={true} data={[
              { label: '线电压 Uab', value: '400.2 V' },
              { label: '频率', value: '50.01 Hz' }
            ]} />

            {/* Branch 1: PV */}
            <ElectricalSymbols.FlowLine x1={200} y1={480} x2={200} y2={426} color="#3b82f6" />
            <ElectricalSymbols.FlowLine x1={200} y1={390} x2={200} y2={338} color="#3b82f6" />
            <ElectricalSymbols.FlowLine x1={200} y1={322} x2={200} y2={280} color="#3b82f6" />
            <ElectricalSymbols.Breaker x={200} y={330} label="光伏馈线柜" />
            <ElectricalSymbols.Inverter x={200} y={408} label="光伏逆变器" />
            <ElectricalSymbols.PV x={200} y={492} />
            <ElectricalSymbols.DataBox x={120} y={540} title="光伏系统" color="#3b82f6" active={true} data={[
              { label: '当前功率', value: '270.9 kW' },
              { label: '直流电压', value: '750 V' },
              { label: '直流电流', value: '361 A' },
              { label: '日发电量', value: '1250 kWh' },
              { label: '总发电量', value: '45.2 MWh' },
              { label: '状态', value: '运行中' }
            ]} />

            {/* Branch 2: BESS */}
            <ElectricalSymbols.FlowLine x1={400} y1={280} x2={400} y2={322} color="#10b981" />
            <ElectricalSymbols.FlowLine x1={400} y1={338} x2={400} y2={390} color="#10b981" />
            <ElectricalSymbols.FlowLine x1={400} y1={426} x2={400} y2={480} color="#10b981" />
            <ElectricalSymbols.Breaker x={400} y={330} label="储能馈线柜" />
            <ElectricalSymbols.Inverter x={400} y={408} label="储能 PCS" />
            <ElectricalSymbols.Battery x={400} y={504} />
            <ElectricalSymbols.DataBox x={320} y={560} title="储能系统" color="#10b981" active={true} data={[
              { label: '当前功率', value: '-120.5 kW' },
              { label: 'SOC', value: '65.2%' },
              { label: 'SOH', value: '99.1%' },
              { label: '日充电量', value: '1860 kWh' },
              { label: '日放电量', value: '1080 kWh' },
              { label: '状态', value: '充电中' }
            ]} />

            {/* Branch 3: EV Charging */}
            <ElectricalSymbols.FlowLine x1={600} y1={280} x2={600} y2={322} color="#f59e0b" />
            <ElectricalSymbols.FlowLine x1={600} y1={338} x2={600} y2={480} color="#f59e0b" />
            <ElectricalSymbols.Breaker x={600} y={330} label="充电桩馈线柜" />
            <ElectricalSymbols.EVCharger x={600} y={504} />
            <ElectricalSymbols.DataBox x={520} y={560} title="充电桩群" color="#f59e0b" active={true} data={[
              { label: '当前功率', value: '402.0 kW' },
              { label: '使用中', value: '12 / 20' },
              { label: '日充电量', value: '2100 kWh' },
              { label: '状态', value: '运行中' }
            ]} />

            {/* Branch 4: Load */}
            <ElectricalSymbols.FlowLine x1={800} y1={280} x2={800} y2={322} color="#a8a29e" />
            <ElectricalSymbols.FlowLine x1={800} y1={338} x2={800} y2={480} color="#a8a29e" />
            <ElectricalSymbols.Breaker x={800} y={330} label="常规负荷馈线柜" />
            <ElectricalSymbols.Load x={800} y={495} />
            <ElectricalSymbols.DataBox x={720} y={540} title="常规负荷" color="#a8a29e" active={true} data={[
              { label: '当前功率', value: '850.0 kW' },
              { label: '有功功率', value: '850.0 kW' },
              { label: '无功功率', value: '120.5 kvar' },
              { label: '日用电量', value: '4500 kWh' }
            ]} />

              {/* Gateway Meter Data Box */}
              <ElectricalSymbols.DataBox x={260} y={140} title="0.4kV 关口表监测" color="#8b5cf6" active={true} data={[
                { label: '正向有功电量', value: '45200 kWh' },
                { label: '反向有功电量', value: '1250 kWh' },
                { label: '当前有功功率', value: '632.0 kW' },
                { label: '当前无功功率', value: '-119 kvar' },
                { label: '功率因数 Pf', value: '0.98' }
              ]} />
              
              {/* Transformer Data Box */}
              <ElectricalSymbols.DataBox x={620} y={110} title="1T1 变压器" color="#3b82f6" active={true} data={[
                { label: '负载率', value: '45.2%' },
                { label: 'A相温度', value: '45°C' },
                { label: 'B相温度', value: '46°C' },
                { label: 'C相温度', value: '44°C' }
              ]} />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MainWiringDiagramPage;
