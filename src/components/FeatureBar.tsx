import React from 'react';
import { Waves, Leaf, Cpu, Shield, Globe } from 'lucide-react';

export const FeatureBar: React.FC = () => {
  const features = [
    {
      title: 'Protect Marine Life',
      desc: 'Reduce harm to marine ecosystems and wildlife.',
      icon: Waves,
      bgColor: 'bg-sky-50 text-[#1a73e8] border-sky-200',
    },
    {
      title: 'Keep Oceans Clean',
      desc: 'Identify and remove harmful debris from the sea.',
      icon: Leaf,
      bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      title: 'Powered by AI',
      desc: 'Accurate detection with advanced deep learning models.',
      icon: Cpu,
      bgColor: 'bg-blue-50 text-[#1a73e8] border-blue-200',
    },
    {
      title: 'Multiple Object Types',
      desc: 'Detects a wide range of debris and underwater objects.',
      icon: Shield,
      bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      title: 'For a Sustainable Future',
      desc: 'Cleaner oceans today, healthier tomorrow.',
      icon: Globe,
      bgColor: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    },
  ];

  return (
    <footer className="w-full bg-white border-t border-slate-200/80 py-5 px-6 mt-6 rounded-2xl shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div key={idx} className="flex items-start gap-3 group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${feat.bgColor} transition-transform group-hover:scale-105 shadow-xs`}>
                <Icon className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-800 tracking-tight">
                  {feat.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {feat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </footer>
  );
};
