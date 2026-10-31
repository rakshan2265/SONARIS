import React, { useRef, useState } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Search, 
  Cpu, 
  CheckCircle2, 
  Loader2, 
  MapPin, 
  Crosshair, 
  Navigation, 
  Globe2,
  Radio
} from 'lucide-react';
import { ModelType } from '../types/detection';
import { PlasticBottleIcon, ShipwreckIcon, MultiClassIcon } from './Icons';
import { getCurrentUserLocation } from '../services/geolocation';

interface UploadCardProps {
  selectedModel: ModelType;
  onModelSelect: (model: ModelType) => void;
  onImageSelected: (file: File) => void;
  onRunDetection: () => void;
  isLoading: boolean;
  selectedFile: File | null;
  latitude: number;
  longitude: number;
  locationName: string;
  onLocationChange: (lat: number, lng: number, name?: string) => void;
  onOpenMapPicker?: () => void;
  confidence: number;
  onConfidenceChange: (value: number) => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  selectedModel,
  onModelSelect,
  onImageSelected,
  onRunDetection,
  isLoading,
  selectedFile,
  latitude,
  longitude,
  confidence,
  onConfidenceChange,
  locationName,
  onLocationChange,
  onOpenMapPicker
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelected(e.dataTransfer.files[0]);
    }
  };

  // Browser Geolocation API
  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setGpsStatus(null);
    try {
      const coords = await getCurrentUserLocation();
      onLocationChange(coords.latitude, coords.longitude, "Current Device Location");
      setGpsStatus(`GPS coordinates locked (±${coords.accuracy || 15}m)`);
    } catch (err: any) {
      setGpsStatus(err.message || "Failed to obtain GPS coordinates");
    } finally {
      setIsLocating(false);
    }
  };

  const models: { id: ModelType; title: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
    {
      id: 'marine-debris',
      title: 'Marine Debris',
      desc: 'Detect underwater debris (bottles, cans, tires, etc.)',
      icon: PlasticBottleIcon,
    },
    {
      id: 'shipwreck',
      title: 'Shipwreck',
      desc: 'Detect shipwrecks and wreckage',
      icon: ShipwreckIcon,
    },
    {
      id: 'multi-class',
      title: 'Multi-Class',
      desc: 'Detect all objects (advanced)',
      icon: MultiClassIcon,
    },
  ];

  const presets = [
    { name: "Bay of Bengal", lat: 13.0827, lng: 80.2707 },
    { name: "Mariana Trench", lat: 11.3493, lng: 142.1996 },
    { name: "Mediterranean", lat: 35.8989, lng: 14.5146 },
    { name: "English Channel", lat: 51.1279, lng: 1.3134 }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-1 text-slate-800">
          <div className="text-[#1a73e8]">
            <UploadCloud className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight">
            Upload Sonar / Underwater Image
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4 pl-7">
          Drag & drop your image here, or click to browse
        </p>

        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[140px] ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
              : selectedFile
              ? 'border-emerald-400 bg-emerald-50/30'
              : 'border-slate-200 bg-[#fbfcfd] hover:border-slate-300'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/tiff, image/webp"
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800 truncate max-w-[220px]">
                {selectedFile.name}
              </p>
              <p className="text-[10px] text-slate-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready for inference
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-[#1a73e8] hover:underline font-medium"
              >
                Change Image
              </button>
            </div>
          ) : (
            <>
              <div className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 mb-2 bg-white shadow-xs">
                <ImageIcon className="w-4 h-4 text-slate-400" />
              </div>
              
              <p className="text-xs font-medium text-slate-600">
                Drag & drop image here
              </p>
              <span className="text-[10.5px] text-slate-400 my-0.5">or</span>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-0.5 px-3.5 py-1.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-medium shadow-sm transition-colors active:scale-95"
              >
                Choose File
              </button>
              
              <p className="mt-2.5 text-[10px] text-slate-400 tracking-tight">
                Supports: JPG, PNG, TIFF &nbsp;|&nbsp; Max size: 10MB
              </p>
            </>
          )}
        </div>

        {/* Model Selection Section */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2.5">
            <Cpu className="w-3.5 h-3.5 text-[#1a73e8]" />
            <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase">
              Select Detection Model
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {models.map((m) => {
              const Icon = m.icon;
              const isSelected = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onModelSelect(m.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-between min-h-[100px] ${
                    isSelected
                      ? 'border-[#1a73e8] bg-blue-50/50 shadow-xs ring-1 ring-[#1a73e8]'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1 ${
                    isSelected ? 'text-[#1a73e8]' : 'text-slate-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="w-full">
                    <span className={`block text-[11px] font-bold tracking-tight mb-0.5 ${
                      isSelected ? 'text-[#1a73e8]' : 'text-slate-800'
                    }`}>
                      {m.title}
                    </span>
                    <span className="block text-[9px] text-slate-500 leading-tight">
                      {m.desc}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* FUTURE MODULE: FLS Detection (Forward-Looking Sonar) */}
            <div
              className="p-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 text-center flex flex-col items-center justify-between min-h-[100px] relative select-none cursor-not-allowed opacity-80 group"
              title="FLS Detection (Forward-Looking Sonar)"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-1 text-slate-400 bg-white border border-slate-200/80 shadow-2xs">
                <Radio className="w-4 h-4" />
              </div>

              <div className="w-full">
                <span className="block text-[11px] font-bold tracking-tight mb-0.5 text-slate-700">
                  FLS Detection
                </span>
                <span className="block text-[9px] text-slate-400 leading-tight">
                  Forward-Looking Sonar
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase">
              Confidence Threshold
            </h3>
            <span className="text-[11px] font-mono font-semibold text-[#1a73e8]">{confidence.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.05}
            max={0.9}
            step={0.05}
            value={confidence}
            onChange={(e) => onConfidenceChange(parseFloat(e.target.value))}
            className="w-full accent-[#1a73e8]"
          />
          <p className="text-[9px] text-slate-400 mt-1">Applied to both the multiclass and pipeline-specialist models. Spec default: 0.25.</p>
        </div>

        {/* Detection Location (Geo-Tagging) Section */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-[#1a73e8]" />
              <h3 className="text-xs font-bold uppercase tracking-tight">
                Detection Location (Geo-Tag)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {latitude.toFixed(4)}&deg; N, {longitude.toFixed(4)}&deg; E
            </span>
          </div>

          {/* Location Inputs & Controls */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                  Latitude
                </label>
                <div className="relative">
                  <Crosshair className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => onLocationChange(parseFloat(e.target.value) || 0, longitude, locationName)}
                    className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                  Longitude
                </label>
                <div className="relative">
                  <Crosshair className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => onLocationChange(latitude, parseFloat(e.target.value) || 0, locationName)}
                    className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Quick Location Action Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1a73e8] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-98 disabled:opacity-60"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Getting GPS...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3 h-3" />
                    <span>Use Current Location</span>
                  </>
                )}
              </button>

              {onOpenMapPicker && (
                <button
                  type="button"
                  onClick={onOpenMapPicker}
                  className="py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                  <Globe2 className="w-3 h-3" />
                  <span>Select on Map</span>
                </button>
              )}
            </div>

            {/* Preset hot spots */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
              <span className="text-[10px] text-slate-400 shrink-0 mr-0.5">Presets:</span>
              {presets.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => onLocationChange(p.lat, p.lng, p.name)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors shrink-0 ${
                    Math.abs(latitude - p.lat) < 0.001 && Math.abs(longitude - p.lng) < 0.001
                      ? 'bg-blue-50 text-[#1a73e8] border-blue-300 font-semibold'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {gpsStatus && (
              <p className={`text-[10px] ${
                gpsStatus.includes('locked') ? 'text-emerald-600 font-semibold' : 'text-amber-600'
              }`}>
                {gpsStatus}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Run Detection Button */}
      <div className="mt-4 pt-2">
        <button
          type="button"
          onClick={onRunDetection}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing Sonar Data & Geo-Tagging...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>Run Detection</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
