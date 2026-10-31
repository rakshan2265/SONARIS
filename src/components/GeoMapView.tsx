import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Search, 
  Crosshair, 
  Clock, 
  Compass, 
  ExternalLink,
  Layers,
  Anchor,
  Trash2,
  Globe
} from 'lucide-react';
import { GeoDetection, getGeoDetections, calculateGeoAnalytics, GeoAnalyticsSummary } from '../services/geolocation';

// Helper component to control map panning programmatically
const MapController: React.FC<{ targetCoords: [number, number] | null }> = ({ targetCoords }) => {
  const map = useMap();
  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, 7, { duration: 1.5 });
    }
  }, [targetCoords, map]);
  return null;
};

// Create custom animated SVG icons for marine debris vs shipwreck
const createCustomMarker = (category: 'marine-debris' | 'shipwreck', label: string) => {
  const isShipwreck = category === 'shipwreck' || label.toLowerCase().includes('wreck');
  const bgGradient = isShipwreck ? 'from-amber-500 to-yellow-400' : 'from-[#0284c7] to-[#38bdf8]';
  const pulseColor = isShipwreck ? 'bg-amber-400' : 'bg-cyan-400';
  const borderColor = isShipwreck ? 'border-amber-300' : 'border-cyan-200';

  const html = `
    <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
      <!-- Sonar pulse ring -->
      <div class="absolute w-8 h-8 rounded-full ${pulseColor} opacity-40 animate-ping"></div>
      
      <!-- Center Pin -->
      <div class="relative w-7 h-7 rounded-full bg-gradient-to-tr ${bgGradient} border-2 ${borderColor} shadow-lg shadow-black/50 flex items-center justify-center text-white text-[11px] font-bold transform transition-transform group-hover:scale-125">
        ${isShipwreck ? '⚓' : '🌊'}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-sonar-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16]
  });
};

interface GeoMapViewProps {
  onInspectInDetector?: (imagePath: string, modelType: 'marine-debris' | 'shipwreck') => void;
  onSwitchTo3DGlobe?: () => void;
}

export const GeoMapView: React.FC<GeoMapViewProps> = ({ onInspectInDetector, onSwitchTo3DGlobe }) => {
  const [detections, setDetections] = useState<GeoDetection[]>([]);
  const [analytics, setAnalytics] = useState<GeoAnalyticsSummary | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'marine-debris' | 'shipwreck'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetection, setSelectedDetection] = useState<GeoDetection | null>(null);
  const [panTarget, setPanTarget] = useState<[number, number] | null>(null);
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({});

  useEffect(() => {
    async function loadData() {
      const data = await getGeoDetections();
      setDetections(data);
      setAnalytics(calculateGeoAnalytics(data));
      if (data.length > 0) {
        setSelectedDetection(data[0]);
      }
    }
    loadData();
  }, []);

  const filteredDetections = detections.filter((d) => {
    const matchesCat = filterCategory === 'all' || d.category === filterCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      d.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.locationName && d.locationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.latitude.toString().includes(searchQuery) ||
      d.longitude.toString().includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  const handleSelectDetection = (d: GeoDetection) => {
    setSelectedDetection(d);
    setPanTarget([d.latitude, d.longitude]);
    const marker = markerRefs.current[d.id];
    if (marker) {
      marker.openPopup();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 pb-8 animate-fadeIn">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1a73e8] shadow-xs">
            <Compass className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Geo-Tagged Marine Detections</h1>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● Live GPS Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive acoustic sonar & optical debris locator linked with geographic coordinates
            </p>
          </div>
        </div>

        {/* Action / Search */}
        <div className="flex items-center gap-2">
          {onSwitchTo3DGlobe && (
            <button
              type="button"
              onClick={onSwitchTo3DGlobe}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#04162e] hover:bg-[#07254d] text-white text-xs font-semibold shadow-sm transition-colors border border-sky-400/30"
            >
              <Globe className="w-4 h-4 text-[#38bdf8]" />
              <span>3D Global Survey</span>
            </button>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ocean, coordinates, debris..."
              className="pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-52 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* Analytics Ribbon */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">Total Geo-Tags</span>
              <span className="text-2xl font-black text-slate-800">{analytics.totalDetections}</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">GPS verified</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1a73e8] border border-blue-200 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">Marine Debris Sites</span>
              <span className="text-2xl font-black text-slate-800">{analytics.marineDebrisCount}</span>
              <span className="text-[10px] text-cyan-600 block mt-0.5">Plastics, nets, tires, cans</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-200 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">Shipwreck Locations</span>
              <span className="text-2xl font-black text-slate-800">{analytics.shipwreckCount}</span>
              <span className="text-[10px] text-amber-600 block mt-0.5">Sunken hulls & wreckage</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Anchor className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">Latest Survey Record</span>
              <span className="text-xs font-bold text-slate-800 block truncate max-w-[140px]">
                {analytics.latestDetection?.locationName || 'Recent scan'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {analytics.latestDetection?.timestamp 
                  ? new Date(analytics.latestDetection.timestamp).toLocaleDateString() 
                  : 'N/A'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Main Map & Interactive Sidebar Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Map Container (Takes 2 Columns on Desktop) */}
        <div className="lg:col-span-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          {/* Filter Chips above Map */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  filterCategory === 'all'
                    ? 'bg-[#1a73e8] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Sites ({detections.length})
              </button>
              <button
                onClick={() => setFilterCategory('marine-debris')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  filterCategory === 'marine-debris'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Marine Debris ({detections.filter(d => d.category === 'marine-debris').length})
              </button>
              <button
                onClick={() => setFilterCategory('shipwreck')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  filterCategory === 'shipwreck'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Shipwrecks ({detections.filter(d => d.category === 'shipwreck').length})
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-medium">
              Showing {filteredDetections.length} of {detections.length} locations
            </div>
          </div>

          {/* Leaflet Map */}
          <div className="w-full h-[480px] rounded-xl overflow-hidden border border-slate-200 relative z-10 shadow-inner">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              {/* OpenStreetMap Standard Tiles */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapController targetCoords={panTarget} />

              {/* Plotted Markers */}
              {filteredDetections.map((d) => {
                const isShipwreck = d.category === 'shipwreck';
                return (
                  <Marker
                    key={d.id}
                    position={[d.latitude, d.longitude]}
                    icon={createCustomMarker(d.category, d.type)}
                    ref={(ref) => { markerRefs.current[d.id] = ref; }}
                    eventHandlers={{
                      click: () => {
                        setSelectedDetection(d);
                      }
                    }}
                  >
                    <Popup className="custom-marine-popup">
                      <div className="w-64 p-3.5 space-y-2.5 text-slate-100 font-sans">
                        {/* Thumbnail Image */}
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
                          <img
                            src={d.image}
                            alt={d.type}
                            className="w-full h-full object-cover"
                          />
                          <div className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider text-white ${
                            isShipwreck ? 'bg-amber-600' : 'bg-blue-600'
                          }`}>
                            {d.type}
                          </div>
                          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[9.5px] font-bold text-white">
                            {d.confidence > 1 ? d.confidence : Math.round(d.confidence * 100)}%
                          </div>
                        </div>

                        {/* Location Details */}
                        <div>
                          <h4 className="text-xs font-bold text-white line-clamp-1">
                            {d.locationName || 'Marine Target'}
                          </h4>
                          <div className="flex items-center gap-1 text-[10.5px] text-sky-300 mt-0.5 font-mono">
                            <Crosshair className="w-3 h-3 text-sky-400 shrink-0" />
                            <span>{d.latitude.toFixed(4)}&deg;, {d.longitude.toFixed(4)}&deg;</span>
                          </div>
                        </div>

                        {/* Timestamp & Depth */}
                        <div className="text-[10px] text-slate-400 space-y-0.5 border-t border-slate-800 pt-1.5">
                          <div className="flex items-center justify-between">
                            <span>Detected:</span>
                            <span className="text-slate-300 font-medium">
                              {new Date(d.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          {d.depthMeters && (
                            <div className="flex items-center justify-between">
                              <span>Estimated Depth:</span>
                              <span className="text-sky-300 font-medium">{d.depthMeters} meters</span>
                            </div>
                          )}
                        </div>

                        {/* Action Link */}
                        <button
                          type="button"
                          onClick={() => onInspectInDetector && onInspectInDetector(d.image, d.category)}
                          className="w-full py-1.5 px-2 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open in Debris Detector</span>
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Side Panel: Detection List / Inspector */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-800">
                <Layers className="w-4 h-4 text-[#1a73e8]" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Geo-Tagged Records</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {filteredDetections.length} recorded
              </span>
            </div>

            {/* Scrollable List */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {filteredDetections.map((d) => {
                const isSelected = selectedDetection?.id === d.id;
                const isShipwreck = d.category === 'shipwreck';
                return (
                  <div
                    key={d.id}
                    onClick={() => handleSelectDetection(d)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-center group ${
                      isSelected
                        ? 'border-[#1a73e8] bg-blue-50/50 shadow-xs ring-1 ring-[#1a73e8]'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 relative border border-slate-200">
                      <img
                        src={d.image}
                        alt={d.type}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          isShipwreck ? 'text-amber-600' : 'text-blue-600'
                        }`}>
                          {d.type}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600">
                          {d.confidence > 1 ? d.confidence : Math.round(d.confidence * 100)}%
                        </span>
                      </div>
                      
                      <h4 className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                        {d.locationName || 'Unknown Location'}
                      </h4>
                      
                      <p className="text-[10.5px] text-slate-400 font-mono truncate mt-0.5">
                        {d.latitude.toFixed(4)}&deg;, {d.longitude.toFixed(4)}&deg;
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Target Deep Inspector */}
          {selectedDetection && (
            <div className="bg-[#04162e] text-white p-5 rounded-2xl border border-[#0f3b70] shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-sky-300 uppercase tracking-wider">
                  Target Inspection
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-600/80 text-[10px] font-semibold text-white">
                  ID: #{selectedDetection.id}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white capitalize">
                  {selectedDetection.type}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  {selectedDetection.locationName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800">
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Latitude</span>
                  <span className="font-mono text-sky-200 font-semibold">{selectedDetection.latitude.toFixed(4)}&deg;</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Longitude</span>
                  <span className="font-mono text-sky-200 font-semibold">{selectedDetection.longitude.toFixed(4)}&deg;</span>
                </div>
              </div>

              {selectedDetection.notes && (
                <p className="text-[11px] text-slate-300 italic bg-slate-900/40 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                  "{selectedDetection.notes}"
                </p>
              )}

              <button
                type="button"
                onClick={() => onInspectInDetector && onInspectInDetector(selectedDetection.image, selectedDetection.category)}
                className="w-full py-2 px-3 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Run Detailed Sonar Analysis</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
