import React from 'react';
import { UploadCloud, Play } from 'lucide-react';

interface HeroBannerProps {
  onUploadClick?: () => void;
  onWatchDemoClick?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onUploadClick, onWatchDemoClick }) => {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-xl bg-[#062548] min-h-[210px] md:min-h-[220px] flex items-center justify-between border border-[#0f3b70]">
      {/* Background panoramic underwater image with sunbeams & marine life */}
      <div 
        className="absolute inset-0 bg-cover bg-[center_right] opacity-95 transition-transform duration-700 hover:scale-102 pointer-events-none"
        style={{ backgroundImage: `url('/assets/hero-banner-clean.jpg?v=3')` }}
      />

      {/* Ocean gradient overlay ensuring pristine text readability on the left */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#04162e] via-[#04162e]/85 to-transparent pointer-events-none" />

      {/* Left Content Area */}
      <div className="relative z-10 p-6 md:p-8 max-w-xl text-white">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
          <span className="text-white block">AI-Powered</span>
          <span className="text-[#38bdf8] block drop-shadow-sm">Marine Debris Detection</span>
        </h1>
        
        <p className="mt-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed font-normal max-w-md">
          Detect and identify underwater debris using advanced AI and sonar imagery. 
          Help us keep our oceans clean and protect marine life.
        </p>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all duration-200 active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Image</span>
          </button>

          <button
            onClick={onWatchDemoClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm border border-white/30 backdrop-blur-sm transition-all duration-200 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Watch Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
