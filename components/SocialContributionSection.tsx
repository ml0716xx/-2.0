
import React from 'react';
import { Leaf, Cloud, TreePine, Fuel } from 'lucide-react';

const SocialContributionSection: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Leaf className="w-5 h-5 text-emerald-500" />
        <h2 className="text-base font-bold text-slate-800">社会贡献</h2>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* CO2 */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 group hover:shadow-lg transition-all duration-300">
          <Cloud className="absolute -bottom-6 -right-6 w-32 h-32 text-blue-200/40 group-hover:scale-110 transition-transform duration-500" />
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-200">
              <Cloud className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-600">等效减排</span>
          </div>
          <div className="text-3xl font-black text-blue-600 mb-1">689.21 <span className="text-sm font-normal">kg</span></div>
          <div className="text-xs text-slate-400">二氧化碳减排量</div>
        </div>

        {/* Trees */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6 group hover:shadow-lg transition-all duration-300">
          <TreePine className="absolute -bottom-6 -right-6 w-32 h-32 text-emerald-200/40 group-hover:scale-110 transition-transform duration-500" />
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-200">
              <TreePine className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-600">等效植树</span>
          </div>
          <div className="text-3xl font-black text-emerald-600 mb-1">821 <span className="text-sm font-normal">棵</span></div>
          <div className="text-xs text-slate-400">相当于植树数量</div>
        </div>

        {/* Coal */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-6 group hover:shadow-lg transition-all duration-300">
          <Fuel className="absolute -bottom-6 -right-6 w-32 h-32 text-orange-200/40 group-hover:scale-110 transition-transform duration-500" />
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500 rounded-xl text-white shadow-lg shadow-orange-200">
              <Fuel className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-600">等效节煤</span>
          </div>
          <div className="text-3xl font-black text-orange-600 mb-1">312.31 <span className="text-sm font-normal">kg</span></div>
          <div className="text-xs text-slate-400">标准煤节约量</div>
        </div>
      </div>
    </div>
  );
};

export default SocialContributionSection;
