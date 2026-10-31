import React from 'react';
import { Target, Cpu, HeartHandshake, ArrowRight } from 'lucide-react';
import { SonarisLogo } from './Icons';

export const AboutView: React.FC<{ onNavigateToDetect: () => void }> = ({ onNavigateToDetect }) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-8 animate-fadeIn">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#04162e] via-[#07254d] to-[#0a305e] text-white p-8 rounded-2xl border border-[#0f3b70] shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <SonarisLogo className="w-10 h-10" />
            <span className="text-xl font-bold tracking-tight">SONARIS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Protecting Oceans Through Deep Learning & Sonar Vision
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-2.5 leading-relaxed font-normal">
            Every year, over 11 million metric tons of plastics enter the marine environment, 
            endangering sea turtles, coral reefs, and benthic biodiversity. SONARIS empowers marine scientists, 
            autonomous underwater vehicles (AUVs), and cleanup crews with automated debris detection.
          </p>
          <div className="mt-5">
            <button
              onClick={onNavigateToDetect}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <span>Try Live Debris Detection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="absolute -bottom-10 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 3 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#1a73e8]">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Sonar & Optical Dual Vision</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Combines high-frequency side-scan sonar with optical RGB photography to identify submerged objects even in zero-visibility turbid water.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Edge & Cloud Inference</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Lightweight quantized models can be deployed directly onto underwater ROVs or run at scale in cloud telemetry pipelines with sub-150ms latency.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Open Conservation Data</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Supports standardized YOLO, COCO, and Pascal VOC dataset annotations so research teams can effortlessly link their own benchmarks.
          </p>
        </div>
      </div>
    </div>
  );
};
