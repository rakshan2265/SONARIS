import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HeroBanner } from './components/HeroBanner';
import { UploadCard } from './components/UploadCard';
import { DetectionViewer } from './components/DetectionViewer';
import { FeatureBar } from './components/FeatureBar';
import { SettingsView } from './components/SettingsView';
import { ContactView } from './components/ContactView';
import { AnalyticsView } from './components/AnalyticsView';
import { GalleryView } from './components/GalleryView';
import { AboutView } from './components/AboutView';
import { GeoMapView } from './components/GeoMapView';
import { GlobalGlobeView } from './components/GlobalGlobeView';
import { ModelType, SampleImage, DetectionResult } from './types/detection';
import { SAMPLE_IMAGES, runDetectionInference, INITIAL_DETECTION_RESULT } from './services/detectionService';
import { saveGeoDetection } from './services/geolocation';
import { Play, X, Globe, ArrowRight, CheckCircle } from 'lucide-react';

export function App() {
  // Current active view: 'Home' | 'Detect' | 'Geo Map' | 'Gallery' | 'Analytics' | 'Settings' | 'About' | 'Contact'
  const [currentView, setCurrentView] = useState<string>('Home');
  const [selectedModel, setSelectedModel] = useState<ModelType>('marine-debris');
  const [confidence, setConfidence] = useState(0.25);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentResult, setCurrentResult] = useState<DetectionResult>(INITIAL_DETECTION_RESULT);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);

  // Geolocation states for geotagging during detection
  const [latitude, setLatitude] = useState<number>(13.0827);
  const [longitude, setLongitude] = useState<number>(80.2707);
  const [locationName, setLocationName] = useState<string>('Bay of Bengal Coastal Shelf');

  // Map Mode: '3d-globe' (Three.js Earth) or '2d-leaflet' (OpenStreetMap)
  const [mapMode, setMapMode] = useState<'3d-globe' | '2d-leaflet'>('3d-globe');
  const [focusedDetectionId, setFocusedDetectionId] = useState<string | number | undefined>(undefined);
  const [recentGeoTagToast, setRecentGeoTagToast] = useState<{
    id: string | number;
    label: string;
    confidence: number;
    lat: number;
    lng: number;
  } | null>(null);

  // Navigate between views
  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle local user file selection
  const handleImageSelected = (file: File) => {
    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    
    setCurrentResult({
      id: `custom-${Date.now()}`,
      imageUrl: previewUrl,
      modelName: selectedModel,
      status: 'ready',
      timestamp: new Date().toISOString(),
      detectedObjects: [],
      boundingBoxes: [],
      latitude,
      longitude,
    });
  };

  // Run detection inference and save geo-tag
  const handleRunDetection = async () => {
    setIsLoading(true);
    try {
      const source = selectedFile || currentResult.imageUrl;
      const res = await runDetectionInference(source, selectedModel, confidence, latitude, longitude);
      setCurrentResult(res);

      // Save geo-tagged detection into centralized geolocation service / backend
      const topObject = res.detectedObjects[0];
      const detectedType = topObject ? topObject.label.toLowerCase() : selectedModel;
      const category: 'marine-debris' | 'shipwreck' = 
        (selectedModel === 'shipwreck' || detectedType.includes('wreck')) ? 'shipwreck' : 'marine-debris';

      const saved = await saveGeoDetection({
        type: detectedType,
        category,
        confidence: topObject ? topObject.confidence / 100 : 0.88,
        latitude,
        longitude,
        locationName: locationName || `Survey Site (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
        timestamp: new Date().toISOString(),
        image: typeof source === 'string' ? source : res.imageUrl,
        notes: `AI ${selectedModel} acoustic inference run at survey coordinate.`
      });

      // Target this detection on the 3D globe and trigger banner notification
      setFocusedDetectionId(saved.id);
      setRecentGeoTagToast({
        id: saved.id,
        label: detectedType,
        confidence: topObject ? topObject.confidence : 88,
        lat: latitude,
        lng: longitude
      });
    } catch (err) {
      console.error('Detection inference error:', err);
      alert('Failed to run inference. Please check if your backend server is online.');
    } finally {
      setIsLoading(false);
    }
  };

  // Select a preset sample image from the carousel
  const handleSelectSample = (sample: SampleImage) => {
    setSelectedFile(null);
    setSelectedModel(sample.defaultModel);
    setCurrentResult(sample.result);
  };

  // Select a sample from the Gallery view and open it in the Detection viewer
  const handleGallerySampleSelect = (sample: SampleImage) => {
    handleSelectSample(sample);
    handleNavigate('Home');
  };

  // Deep inspect from Map
  const handleInspectFromMap = (imagePath: string, modelType: 'marine-debris' | 'shipwreck') => {
    const matchingSample = SAMPLE_IMAGES.find(s => s.imageUrl === imagePath || s.thumbnailUrl === imagePath);
    if (matchingSample) {
      handleSelectSample(matchingSample);
    } else {
      setSelectedModel(modelType);
      setCurrentResult(prev => ({
        ...prev,
        imageUrl: imagePath,
        modelName: modelType,
      }));
    }
    handleNavigate('Home');
  };

  return (
    <div className="min-h-screen bg-[#f0f4f9] flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={currentView}
        onTabChange={(tab) => handleNavigate(tab)}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex flex-row">
        {/* Left Sidebar */}
        <Sidebar
          activeItem={currentView === 'Detect' ? 'Detect Debris' : currentView}
          onSelectItem={(item) => {
            if (item === 'Detect Debris') handleNavigate('Detect');
            else handleNavigate(item);
          }}
        />

        {/* Center/Right Content Workspace */}
        <main className="flex-1 p-4 md:p-6 lg:p-7 max-w-7xl mx-auto w-full flex flex-col justify-between overflow-y-auto">
          {/* Conditional View Rendering */}
          {currentView === 'Geo Map' ? (
            mapMode === '3d-globe' ? (
              <GlobalGlobeView
                initialFocusId={focusedDetectionId}
                onInspectInDetector={handleInspectFromMap}
                onSwitchTo2DMap={() => setMapMode('2d-leaflet')}
              />
            ) : (
              <GeoMapView
                onInspectInDetector={handleInspectFromMap}
                onSwitchTo3DGlobe={() => setMapMode('3d-globe')}
              />
            )
          ) : currentView === 'Settings' ? (
            <SettingsView />
          ) : currentView === 'Contact' ? (
            <ContactView />
          ) : currentView === 'Analytics' ? (
            <AnalyticsView latestResult={currentResult} />
          ) : currentView === 'Gallery' ? (
            <GalleryView
              samples={SAMPLE_IMAGES}
              onSelectSampleForDetection={handleGallerySampleSelect}
            />
          ) : currentView === 'About' ? (
            <AboutView onNavigateToDetect={() => handleNavigate('Home')} />
          ) : (
            /* Home / Detect Main Dashboard (Reference View) */
            <div className="space-y-6">
              {/* Notification Banner when a detection is newly geo-tagged */}
              {recentGeoTagToast && (
                <div className="p-3.5 bg-gradient-to-r from-[#04162e] to-[#0a305e] border border-cyan-400/40 rounded-xl text-white flex items-center justify-between shadow-lg animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Anomaly Detected & Geo-Tagged: {recentGeoTagToast.label.toUpperCase()} ({recentGeoTagToast.confidence}%)
                      </span>
                      <span className="text-[11px] text-sky-200/80 font-mono">
                        Coordinates: {recentGeoTagToast.lat.toFixed(4)}&deg; N, {recentGeoTagToast.lng.toFixed(4)}&deg; E
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFocusedDetectionId(recentGeoTagToast.id);
                        setMapMode('3d-globe');
                        handleNavigate('Geo Map');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#3FE8C8] hover:bg-[#32c9ad] text-[#030810] font-mono text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Track on 3D Global Globe</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setRecentGeoTagToast(null)}
                      className="p-1 rounded-full text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Top Hero Banner */}
              <HeroBanner
                onUploadClick={() => {
                  const dropzone = document.querySelector('input[type="file"]') as HTMLInputElement;
                  dropzone?.click();
                }}
                onWatchDemoClick={() => setShowDemoModal(true)}
              />

              {/* Core Two-Column Detection Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Left Card: Upload, Model Selector & Geotagging */}
                <UploadCard
                  selectedModel={selectedModel}
                  onModelSelect={setSelectedModel}
                  onImageSelected={handleImageSelected}
                  onRunDetection={handleRunDetection}
                  isLoading={isLoading}
                  selectedFile={selectedFile}
                  latitude={latitude}
                  longitude={longitude}
                  confidence={confidence}
                  onConfidenceChange={setConfidence}
                  locationName={locationName}
                  onLocationChange={(lat, lng, name) => {
                    setLatitude(lat);
                    setLongitude(lng);
                    if (name) setLocationName(name);
                  }}
                  onOpenMapPicker={() => {
                    setMapMode('3d-globe');
                    handleNavigate('Geo Map');
                  }}
                />

                {/* Right Card: Detection Result Viewer */}
                <DetectionViewer
                  result={currentResult}
                  isLoading={isLoading}
                />
              </div>

              {/* Bottom 5-Feature Bar */}
              <FeatureBar />
            </div>
          )}
        </main>
      </div>

      {/* Interactive Demo Video Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h3 className="text-lg font-bold">SONARIS Demonstration</h3>
                <p className="text-xs text-slate-400">Deep-sea Sonar & Vision Object Detection</p>
              </div>
            </div>
            
            <div className="aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center relative group">
              <img 
                src="/assets/detection-result-raw.jpg" 
                alt="Demo preview" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                <div className="w-14 h-14 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                  <Play className="w-6 h-6 fill-current ml-1" />
                </div>
                <span className="text-xs text-slate-200 mt-2 font-medium">Click to Play AI Sonar Debris Detection Simulation</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
              <span>Resolution: 1080p &bull; Inference Speed: ~140ms</span>
              <button
                onClick={() => setShowDemoModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
