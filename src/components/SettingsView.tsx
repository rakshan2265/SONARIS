import React, { useState } from 'react';
import { Settings as SettingsIcon, Sliders, Database, Server, Check, RotateCcw, ShieldCheck } from 'lucide-react';
import { USE_MOCK_API, API_BASE_URL } from '../services/detectionService';

export const SettingsView: React.FC = () => {
  const [apiUrl, setApiUrl] = useState(API_BASE_URL);
  const [useMock, setUseMock] = useState(USE_MOCK_API);
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [iouThreshold, setIouThreshold] = useState(45);
  const [modelWeights, setModelWeights] = useState('yolov8x-marine-v2');
  const [enableColorCorrection, setEnableColorCorrection] = useState(true);
  const [enableNoiseFilter, setEnableNoiseFilter] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    setApiUrl('http://localhost:8000/api');
    setUseMock(true);
    setConfidenceThreshold(70);
    setIouThreshold(45);
    setModelWeights('yolov8x-marine-v2');
    setEnableColorCorrection(true);
    setEnableNoiseFilter(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1a73e8]">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">System & Model Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure backend AI model parameters, inference endpoints, and image processing filters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold shadow-sm transition-all"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings successfully updated and cached for future inferences.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend & Dataset Connection Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Server className="w-4 h-4 text-[#1a73e8]" />
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Backend & API Configuration</h2>
          </div>

          {/* Mode Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Inference Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUseMock(true)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  useMock
                    ? 'border-[#1a73e8] bg-blue-50 text-[#1a73e8] font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Mock / Offline Demo
              </button>
              <button
                type="button"
                onClick={() => setUseMock(false)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  !useMock
                    ? 'border-[#1a73e8] bg-blue-50 text-[#1a73e8] font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Live Backend API
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              {useMock
                ? 'Using built-in sonar sample datasets and simulated inference latencies.'
                : 'Connects directly to your teammates\' FastAPI/Flask PyTorch server.'}
            </p>
          </div>

          {/* API URL input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Backend Endpoint URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              disabled={useMock}
              placeholder="http://localhost:8000/api"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 font-mono"
            />
            <p className="text-[10.5px] text-slate-400 mt-1">
              Calls <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">POST {apiUrl}/detect</code>
            </p>
          </div>

          {/* Model Weights */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">AI Model Checkpoint</label>
            <select
              value={modelWeights}
              onChange={(e) => setModelWeights(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
            >
              <option value="yolov8x-marine-v2">YOLOv8x-Marine (Trained on Underwater Debris 2026)</option>
              <option value="rt-detr-sonar">RT-DETR-Sonar (Real-Time Acoustic Sonar Detection)</option>
              <option value="yolov9-oceanic">YOLOv9-Oceanic (Multi-Class Submerged Object Detector)</option>
              <option value="custom-weights">Custom Weights (Loaded via Teammate Backend)</option>
            </select>
          </div>
        </div>

        {/* Inference Hyperparameters Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-[#1a73e8]" />
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Detection Thresholds</h2>
          </div>

          {/* Confidence Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Minimum Confidence Score</label>
              <span className="text-xs font-bold text-[#1a73e8]">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="95"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1a73e8]"
            />
            <p className="text-[10.5px] text-slate-400 mt-1">
              Only detections above this threshold will be rendered with bounding boxes.
            </p>
          </div>

          {/* IoU Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">NMS / IoU Overlap Threshold</label>
              <span className="text-xs font-bold text-[#1a73e8]">{iouThreshold}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              value={iouThreshold}
              onChange={(e) => setIouThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1a73e8]"
            />
            <p className="text-[10.5px] text-slate-400 mt-1">
              Suppresses redundant overlapping bounding boxes using Non-Maximum Suppression.
            </p>
          </div>

          {/* Preprocessing Toggles */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700 block">Underwater Color Restoration</span>
                <span className="text-[10.5px] text-slate-400 block">Compensates for red-wavelength loss in deep water</span>
              </div>
              <input
                type="checkbox"
                checked={enableColorCorrection}
                onChange={(e) => setEnableColorCorrection(e.target.checked)}
                className="w-4 h-4 text-[#1a73e8] rounded focus:ring-blue-500 accent-[#1a73e8] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700 block">Acoustic Sonar Denoising</span>
                <span className="text-[10.5px] text-slate-400 block">Filters speckle noise in synthetic aperture sonar</span>
              </div>
              <input
                type="checkbox"
                checked={enableNoiseFilter}
                onChange={(e) => setEnableNoiseFilter(e.target.checked)}
                className="w-4 h-4 text-[#1a73e8] rounded focus:ring-blue-500 accent-[#1a73e8] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Database & Export Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 md:col-span-2">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Database className="w-4 h-4 text-[#1a73e8]" />
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Dataset Storage & Logging</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-slate-500 block mb-1">Local Storage Cache</span>
              <span className="text-sm font-bold text-slate-800 block">24.5 MB</span>
              <span className="text-[10.5px] text-emerald-600 mt-1 block">6 sample datasets loaded</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-slate-500 block mb-1">Inference Logging</span>
              <span className="text-sm font-bold text-slate-800 block">Enabled</span>
              <span className="text-[10.5px] text-slate-400 mt-1 block">Telemetry stored locally</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-slate-500 block mb-1">Notification Alerts</span>
              <span className="text-sm font-bold text-slate-800 block">Critical Debris Only</span>
              <span className="text-[10.5px] text-slate-400 mt-1 block">Ghost nets & toxic hazards</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
