import React, { useState } from 'react';
import { Image as ImageIcon, Search } from 'lucide-react';
import { SampleImage } from '../types/detection';

interface GalleryViewProps {
  samples: SampleImage[];
  onSelectSampleForDetection: (sample: SampleImage) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ samples, onSelectSampleForDetection }) => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Marine Debris', 'Sonar Scans', 'Shipwrecks'];

  const filteredSamples = samples.filter((s) => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Marine Debris') return s.defaultModel === 'marine-debris';
    if (activeCategory === 'Shipwrecks') return s.defaultModel === 'shipwreck';
    if (activeCategory === 'Sonar Scans') return s.title.toLowerCase().includes('sonar');
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1a73e8]">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Underwater Debris Gallery</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse underwater datasets, acoustic sonar sweeps, and labeled marine debris instances
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-[#1a73e8] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSamples.map((sample) => {
          return (
            <div
              key={sample.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group"
            >
              {/* Image Preview */}
              <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                <img
                  src={sample.thumbnailUrl}
                  alt={sample.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-semibold text-white">
                  {sample.defaultModel}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{sample.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {sample.result.detectedObjects.map((obj, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[10.5px] font-medium text-slate-700"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${obj.dotColor}`} />
                        {obj.label} ({obj.confidence}%)
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <button
                  type="button"
                  onClick={() => onSelectSampleForDetection(sample)}
                  className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1a73e8] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-98"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Inspect in AI Detector</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
