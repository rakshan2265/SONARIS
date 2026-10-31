import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { DetectionResult } from '../types/detection';

interface DetectionViewerProps {
  result: DetectionResult | null;
  isLoading: boolean;
}

export const DetectionViewer: React.FC<DetectionViewerProps> = ({
  result,
  isLoading,
}) => {
  const [hoveredBoxId, setHoveredBoxId] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between h-full">
      <div className="flex flex-col h-full">
        {/* Header with Title and Model Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="text-[#1a73e8]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              Detection Result
            </h2>
          </div>

          {/* Model Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isLoading ? 'Processing Image...' : 'Model Ready'}</span>
          </div>
        </div>

        {/* Large Detection Image with Bounding Boxes & Labels */}
        <div className="relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200 flex-1 min-h-[340px] md:min-h-[420px] flex items-center justify-center group shadow-inner">
          {result?.imageUrl ? (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src={result.imageUrl}
                alt="Sonar / underwater detection output"
                className="w-full h-full object-contain select-none"
              />

              {/* Dynamic Bounding Boxes Overlay with Class & Confidence Labels */}
              {result.boundingBoxes && result.boundingBoxes.map((box) => {
                const isHovered = hoveredBoxId === box.id;
                const confScore = box.confidence > 1 ? box.confidence / 100 : box.confidence;
                return (
                  <div
                    key={box.id}
                    onMouseEnter={() => setHoveredBoxId(box.id)}
                    onMouseLeave={() => setHoveredBoxId(null)}
                    className="absolute cursor-pointer transition-all duration-150"
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                      borderColor: box.color || '#38bdf8',
                      borderWidth: isHovered ? '2.5px' : '2px',
                      backgroundColor: isHovered ? `${box.color || '#38bdf8'}25` : 'transparent',
                    }}
                  >
                    {/* Floating Label with Class & Confidence */}
                    <div
                      className="absolute -top-5 left-0 px-1.5 py-0.5 text-[9px] font-bold text-white tracking-wider rounded-t uppercase whitespace-nowrap shadow-sm pointer-events-none"
                      style={{ backgroundColor: box.color || '#38bdf8' }}
                    >
                      {box.label} {confScore.toFixed(2)}
                    </div>
                  </div>
                );
              })}

              {/* Scanning laser beam effect while loading */}
              {isLoading && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-pulse pointer-events-none flex flex-col justify-center items-center backdrop-blur-[1px]">
                  <div className="w-full h-0.5 bg-cyan-400 shadow-[0_0_8px_#38bdf8] animate-bounce" />
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-400 text-xs flex flex-col items-center">
              <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
              <span>Upload an image to run detection</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
