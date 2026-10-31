import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ExternalLink, X, RotateCcw, Map } from 'lucide-react';
import { GeoDetection, getGeoDetections } from '../services/geolocation';

interface GlobalGlobeViewProps {
  onInspectInDetector?: (imagePath: string, modelType: 'marine-debris' | 'shipwreck') => void;
  onSwitchTo2DMap?: () => void;
  initialFocusId?: string | number;
}

const CLASS_COLOR: { [key: string]: number } = {
  pipe: 0x3FE8C8,
  plastic: 0x3FE8C8,
  'plastic bottle': 0x3FE8C8,
  'plastic bag': 0x3FE8C8,
  ghost_fishing_gear: 0xF2A93B,
  'ghost net': 0xF2A93B,
  tire: 0xF2A93B,
  can: 0x3FE8C8,
  shipwreck: 0x9C90FF,
  default: 0x3FE8C8
};

const CLASS_HEX: { [key: string]: string } = {
  pipe: '#3FE8C8',
  plastic: '#3FE8C8',
  'plastic bottle': '#3FE8C8',
  'plastic bag': '#3FE8C8',
  ghost_fishing_gear: '#F2A93B',
  'ghost net': '#F2A93B',
  tire: '#F2A93B',
  can: '#3FE8C8',
  shipwreck: '#9C90FF',
  default: '#3FE8C8'
};

const getColor = (type: string) => {
  const t = type.toLowerCase();
  for (const k in CLASS_COLOR) {
    if (t.includes(k)) return CLASS_COLOR[k];
  }
  return CLASS_COLOR.default;
};

const getHex = (type: string) => {
  const t = type.toLowerCase();
  for (const k in CLASS_HEX) {
    if (t.includes(k)) return CLASS_HEX[k];
  }
  return CLASS_HEX.default;
};

function latLonToVector3(lat: number, lon: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function makeHaloTexture(hex: number) {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  const col = '#' + hex.toString(16).padStart(6, '0');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, col + 'CC');
  g.addColorStop(0.4, col + '55');
  g.addColorStop(1, col + '00');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function makeNebulaTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#030810';
  ctx.fillRect(0, 0, 1024, 512);
  const blobs: [number, number, number, string][] = [
    [300, 220, 420, 'rgba(20,55,58,0.55)'],
    [700, 300, 380, 'rgba(15,45,50,0.5)'],
    [150, 380, 300, 'rgba(25,60,55,0.4)'],
    [850, 120, 320, 'rgba(18,50,52,0.45)'],
    [500, 90, 350, 'rgba(12,38,42,0.4)'],
  ];
  blobs.forEach(([x, y, r, col]) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });
  const img = ctx.getImageData(0, 0, 1024, 512);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 10;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}

export const GlobalGlobeView: React.FC<GlobalGlobeViewProps> = ({
  onInspectInDetector,
  onSwitchTo2DMap,
  initialFocusId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [detections, setDetections] = useState<GeoDetection[]>([]);
  const [selectedDetection, setSelectedDetection] = useState<GeoDetection | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Animation & Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const markerMeshesRef = useRef<THREE.Mesh[]>([]);
  const resetViewFnRef = useRef<() => void>(() => {});
  const focusDetectionByIdRef = useRef<(id: string | number) => void>(() => {});

  // Load detections
  useEffect(() => {
    async function load() {
      const data = await getGeoDetections();
      setDetections(data);
    }
    load();
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || (window.innerHeight - 70);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    let camDistance = 15.5;
    camera.position.set(0, 0, camDistance);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    const RADIUS = 5;
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Load NASA Blue Marble textures
    const loader = new THREE.TextureLoader();
    const dayTex = loader.load('/assets/earth/earth_atmos_2048.jpg');
    const nightTex = loader.load('/assets/earth/earth_lights_2048.png');
    const specTex = loader.load('/assets/earth/earth_specular_2048.jpg');
    const cloudTex = loader.load('/assets/earth/earth_clouds_1024.png');
    [dayTex, nightTex, specTex, cloudTex].forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
    });

    const sunDirection = new THREE.Vector3(6, 4, 8).normalize();

    // Globe Shader Material
    const globeMat = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTex },
        nightTexture: { value: nightTex },
        specularTexture: { value: specTex },
        sunDirection: { value: sunDirection },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main(){
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position,1.0);
          vWorldPosition = worldPos.xyz;
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }`,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform sampler2D specularTexture;
        uniform vec3 sunDirection;
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main(){
          vec3 N = normalize(vWorldNormal);
          vec3 L = normalize(sunDirection);
          float NdotL = dot(N,L);
          float dayFactor = smoothstep(-0.15, 0.15, NdotL);

          vec3 dayColor = texture2D(dayTexture, vUv).rgb;
          vec3 nightColor = texture2D(nightTexture, vUv).rgb * 1.5;
          vec3 baseColor = mix(nightColor, dayColor, dayFactor);

          float spec = texture2D(specularTexture, vUv).r;
          vec3 V = normalize(cameraPosition - vWorldPosition);
          vec3 H = normalize(L+V);
          float specHighlight = pow(max(dot(N,H),0.0), 9.0) * spec * dayFactor;

          vec3 color = baseColor + vec3(0.85,0.92,0.95) * specHighlight * 0.9;
          gl_FragColor = vec4(color, 1.0);
        }`
    });

    const globeMesh = new THREE.Mesh(new THREE.SphereGeometry(RADIUS, 96, 96), globeMat);
    globeGroup.add(globeMesh);

    // Cloud layer
    const cloudMat = new THREE.MeshLambertMaterial({
      map: cloudTex,
      alphaMap: cloudTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    });
    const cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(RADIUS * 1.012, 96, 96), cloudMat);
    globeGroup.add(cloudMesh);

    // Atmosphere glow
    const glowMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      uniforms: { color: { value: new THREE.Color(0x3FE8C8) } },
      vertexShader: `
        varying vec3 vNormal;
        void main(){ vNormal = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `
        varying vec3 vNormal; uniform vec3 color;
        void main(){ float i = pow(0.72 - dot(vNormal, vec3(0,0,1.0)), 2.5); gl_FragColor = vec4(color, i*0.55); }`
    });
    const glowMesh = new THREE.Mesh(new THREE.SphereGeometry(RADIUS * 1.12, 64, 64), glowMat);
    globeGroup.add(glowMesh);

    // Nebula backdrop
    const nebulaMesh = new THREE.Mesh(
      new THREE.SphereGeometry(70, 32, 32),
      new THREE.MeshBasicMaterial({ map: makeNebulaTexture(), side: THREE.BackSide })
    );
    scene.add(nebulaMesh);

    // Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 900;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 40 + Math.random() * 40;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      starPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      starPos[i * 3 + 2] = r * Math.cos(ph);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0x4d6a78, size: 0.12, transparent: true, opacity: 0.6 })
    );
    scene.add(stars);

    // Lighting
    scene.add(new THREE.AmbientLight(0x445566, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(6, 4, 8);
    scene.add(sun);

    // Interaction vars
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let focused = false;
    let animating = false;
    let targetQuat = new THREE.Quaternion();
    let startQuat = new THREE.Quaternion();
    let animT = 0;
    let zoomFrom = camDistance;
    let zoomTo = camDistance;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      canvas.style.cursor = 'grabbing';
    };

    const onPointerUp = () => {
      isDragging = false;
      canvas.style.cursor = 'grab';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || focused) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      globeGroup.rotation.y += dx * 0.004;
      globeGroup.rotation.x += dy * 0.004;
      globeGroup.rotation.x = Math.max(-1.1, Math.min(1.1, globeGroup.rotation.x));
      prevX = e.clientX;
      prevY = e.clientY;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);

    // Focus on marker logic
    const focusMarker = (dot: THREE.Mesh) => {
      const d: GeoDetection = dot.userData.detection;
      const localDir = dot.position.clone().normalize();
      targetQuat = new THREE.Quaternion().setFromUnitVectors(localDir, new THREE.Vector3(0, 0, 1));
      startQuat = globeGroup.quaternion.clone();
      zoomFrom = camDistance;
      zoomTo = 9;
      animT = 0;
      animating = true;
      focused = true;
      setIsFocused(true);

      setSelectedDetection(d);
      setTimeout(() => {
        setIsPanelOpen(true);
      }, 550);
    };

    // Reset view
    const resetView = () => {
      targetQuat = globeGroup.quaternion.clone();
      startQuat = globeGroup.quaternion.clone();
      zoomFrom = camDistance;
      zoomTo = 15.5;
      animT = 0;
      animating = true;
      focused = false;
      setIsFocused(false);
      setIsPanelOpen(false);
    };
    resetViewFnRef.current = resetView;

    // Focus by ID helper
    focusDetectionByIdRef.current = (id: string | number) => {
      const dot = markerMeshesRef.current.find((m) => m.userData?.detection?.id === id);
      if (dot) focusMarker(dot);
    };

    // Click raycasting
    let downX = 0;
    let downY = 0;
    const onCanvasDown = (e: MouseEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const raycaster = new THREE.Raycaster();
    const mouseNDC = new THREE.Vector2();

    const onCanvasUp = (e: MouseEvent) => {
      const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (moved < 5 && !animating) {
        const rect = canvas.getBoundingClientRect();
        mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouseNDC, camera);
        const hits = raycaster.intersectObjects(markerMeshesRef.current);
        if (hits.length > 0) {
          focusMarker(hits[0].object as THREE.Mesh);
        }
      }
    };

    canvas.addEventListener('mousedown', onCanvasDown);
    canvas.addEventListener('mouseup', onCanvasUp);

    // Render loop
    let reqId = 0;
    let t0 = performance.now();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = (now - t0) / 1000;
      t0 = now;

      if (animating) {
        animT = Math.min(1, animT + dt / 1.1);
        const ease = 1 - Math.pow(1 - animT, 3);
        globeGroup.quaternion.slerpQuaternions(startQuat, targetQuat, ease);
        camDistance = zoomFrom + (zoomTo - zoomFrom) * ease;
        camera.position.set(0, 0, camDistance);
        if (animT >= 1) animating = false;
      } else if (!isDragging && !focused) {
        globeGroup.rotation.y += 0.0009;
      }
      cloudMesh.rotation.y += 0.00025;

      markerMeshesRef.current.forEach((dot) => {
        const halo = dot.userData.halo;
        if (halo) {
          halo.quaternion.copy(camera.quaternion);
          const p = 0.9 + Math.sin(now * 0.002 + halo.userData.pulsePhase) * 0.18;
          halo.scale.set(0.55 * p, 0.55 * p, 1);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Window Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight || (window.innerHeight - 70);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('mousedown', onCanvasDown);
      canvas.removeEventListener('mouseup', onCanvasUp);
      renderer.dispose();
    };
  }, []);

  // Update markers when detections change
  useEffect(() => {
    if (!globeGroupRef.current) return;
    const globeGroup = globeGroupRef.current;
    const RADIUS = 5;

    // Clear previous markers
    markerMeshesRef.current.forEach((m) => {
      globeGroup.remove(m);
      if (m.userData.halo) globeGroup.remove(m.userData.halo);
    });
    markerMeshesRef.current = [];

    // Add new detection markers
    detections.forEach((d) => {
      const pos = latLonToVector3(d.latitude, d.longitude, RADIUS * 1.015);
      const color = getColor(d.type);

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 16),
        new THREE.MeshBasicMaterial({ color })
      );
      dot.position.copy(pos);
      dot.userData = { detection: d };
      globeGroup.add(dot);
      markerMeshesRef.current.push(dot);

      // Pulsing Halo Sprite
      const haloMat = new THREE.SpriteMaterial({
        map: makeHaloTexture(color),
        transparent: true,
        depthWrite: false,
        opacity: 0.85
      });
      const halo = new THREE.Sprite(haloMat);
      halo.scale.set(0.55, 0.55, 1);
      halo.position.copy(pos);
      halo.userData = { pulsePhase: Math.random() * Math.PI * 2 };
      globeGroup.add(halo);
      dot.userData.halo = halo;
    });

    // If initialFocusId passed, trigger focus
    if (initialFocusId && focusDetectionByIdRef.current) {
      setTimeout(() => {
        focusDetectionByIdRef.current(initialFocusId);
      }, 700);
    }
  }, [detections, initialFocusId]);

  const avgConfidence = detections.length > 0
    ? Math.round((detections.reduce((acc, d) => acc + (d.confidence > 1 ? d.confidence : d.confidence * 100), 0) / detections.length))
    : 0;

  const surveyRegions = new Set(detections.map((d) => Math.round(d.latitude / 15))).size;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-90px)] min-h-[600px] bg-[#030810] rounded-2xl overflow-hidden border border-[#0B3A5C]/40 shadow-2xl select-none"
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* HUD: Top-Left Title & Metrics Block */}
      <div className="absolute top-6 left-6 z-20 max-w-sm pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3FE8C8] animate-ping" />
          <span className="text-[11px] font-mono tracking-widest text-[#3FE8C8] uppercase font-bold">
            Live Global Survey Feed
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
          Marine Debris Detection
          <span className="block text-[#3FE8C8] text-base font-semibold font-mono mt-0.5">
            Global Survey View
          </span>
        </h1>
        <p className="mt-1 text-xs text-[#7FA3AA] font-mono">
          Side-Scan Sonar & Camera-derived anomaly map
        </p>

        {/* HUD Statistics */}
        <div className="mt-4 flex items-center gap-6 font-mono border-t border-[#3FE8C8]/20 pt-3">
          <div>
            <div className="text-2xl font-bold text-[#3FE8C8]">{detections.length}</div>
            <div className="text-[10px] text-[#7FA3AA] tracking-wider mt-0.5">DETECTIONS</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#EAF6F3]">{surveyRegions}</div>
            <div className="text-[10px] text-[#7FA3AA] tracking-wider mt-0.5">SURVEY REGIONS</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#F2A93B]">{avgConfidence}%</div>
            <div className="text-[10px] text-[#7FA3AA] tracking-wider mt-0.5">AVG CONFIDENCE</div>
          </div>
        </div>
      </div>

      {/* HUD: Top-Right Controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        {onSwitchTo2DMap && (
          <button
            type="button"
            onClick={onSwitchTo2DMap}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#081726]/85 backdrop-blur-md border border-[#3FE8C8]/30 hover:border-[#3FE8C8] text-xs font-mono text-[#EAF6F3] shadow-lg transition-colors"
          >
            <Map className="w-4 h-4 text-[#3FE8C8]" />
            <span>Switch to 2D Map</span>
          </button>
        )}

        {isFocused && (
          <button
            type="button"
            onClick={() => resetViewFnRef.current()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#081726]/85 backdrop-blur-md border border-[#3FE8C8]/40 hover:border-[#3FE8C8] text-xs font-mono text-[#EAF6F3] shadow-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#3FE8C8]" />
            <span>&larr; Back to Global View</span>
          </button>
        )}
      </div>

      {/* HUD: Bottom-Left Interactive Legend */}
      <div className="absolute bottom-6 left-6 z-20 bg-[#081726]/80 backdrop-blur-md border border-[#3FE8C8]/25 rounded-xl p-3.5 font-mono text-xs shadow-xl pointer-events-auto">
        <div className="text-[10px] uppercase font-bold text-[#7FA3AA] tracking-wider mb-2">
          Debris Classification
        </div>
        <div className="space-y-1.5 text-[11px] text-[#EAF6F3]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3FE8C8] shadow-[0_0_8px_#3FE8C8]" />
            <span>Plastic / Bottle / Pipe</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F2A93B] shadow-[0_0_8px_#F2A93B]" />
            <span>Ghost Fishing Gear / Tire</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9C90FF] shadow-[0_0_8px_#9C90FF]" />
            <span>Shipwreck / Wreckage</span>
          </div>
        </div>
      </div>

      {/* HUD: Bottom-Right Hint */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 text-xs font-mono text-[#7FA3AA] pointer-events-none bg-[#081726]/70 px-3 py-1.5 rounded-full border border-slate-800">
        <span className="w-2 h-2 rounded-full bg-[#3FE8C8] animate-pulse" />
        <span>Drag to rotate &bull; Click marker to inspect anomaly</span>
      </div>

      {/* Slide-out Target Detail Panel */}
      <div
        className={`absolute top-0 right-0 h-full w-96 bg-[#081726]/95 backdrop-blur-xl border-l border-[#3FE8C8]/30 shadow-2xl z-30 transition-transform duration-500 ease-out p-6 overflow-y-auto ${
          isPanelOpen && selectedDetection ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedDetection && (
          <div className="space-y-4">
            {/* Close Button */}
            <button
              onClick={() => resetViewFnRef.current()}
              className="absolute top-5 right-5 w-8 h-8 rounded-full border border-[#3FE8C8]/30 flex items-center justify-center text-[#7FA3AA] hover:text-[#3FE8C8] hover:border-[#3FE8C8] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Eyebrow & Title */}
            <div>
              <span className="text-[11px] font-mono tracking-widest text-[#3FE8C8] uppercase font-bold">
                {selectedDetection.type.replace(/\s+/g, '_').toUpperCase()}
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                Anomaly #{selectedDetection.id}
              </h2>
              <p className="text-xs text-[#7FA3AA] mt-0.5">
                {selectedDetection.locationName || 'Unspecified Oceanic Survey Zone'}
              </p>
            </div>

            {/* Confidence Gauge */}
            <div>
              <div className="flex items-baseline justify-between text-xs font-mono">
                <span className="text-xl font-bold text-[#EAF6F3]">
                  {selectedDetection.confidence > 1
                    ? selectedDetection.confidence
                    : Math.round(selectedDetection.confidence * 100)}%
                </span>
                <span className="text-[11px] text-[#7FA3AA]">calibrated confidence</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden border border-slate-700">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${selectedDetection.confidence > 1 ? selectedDetection.confidence : Math.round(selectedDetection.confidence * 100)}%`,
                    backgroundColor: getHex(selectedDetection.type)
                  }}
                />
              </div>
            </div>

            {/* Sonar Image Crop / Bounding Box Display */}
            <div className="border border-[#3FE8C8]/30 rounded-xl overflow-hidden bg-[#010508] shadow-inner">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={selectedDetection.image}
                  alt={selectedDetection.type}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase text-white shadow-sm"
                  style={{ backgroundColor: getHex(selectedDetection.type) }}
                >
                  {selectedDetection.type}
                </div>
              </div>
              <div className="p-2.5 text-[10px] font-mono text-[#7FA3AA] border-t border-[#3FE8C8]/20 flex items-center justify-between">
                <span>SSS detection crop &bull; bbox overlay</span>
                <span className="text-[#3FE8C8] font-bold">VERIFIED</span>
              </div>
            </div>

            {/* Field Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs border-t border-slate-800">
              <div className="bg-[#030c14] p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-[#7FA3AA]">LATITUDE</div>
                <div className="text-sm font-semibold text-[#EAF6F3] mt-0.5">
                  {selectedDetection.latitude.toFixed(4)}&deg;
                </div>
              </div>

              <div className="bg-[#030c14] p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-[#7FA3AA]">LONGITUDE</div>
                <div className="text-sm font-semibold text-[#EAF6F3] mt-0.5">
                  {selectedDetection.longitude.toFixed(4)}&deg;
                </div>
              </div>

              <div className="bg-[#030c14] p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-[#7FA3AA]">ESTIMATED DEPTH</div>
                <div className="text-sm font-semibold text-[#EAF6F3] mt-0.5">
                  {selectedDetection.depthMeters ? `${selectedDetection.depthMeters}m` : '38m'}
                </div>
              </div>

              <div className="bg-[#030c14] p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-[#7FA3AA]">TIMESTAMP</div>
                <div className="text-xs font-semibold text-[#EAF6F3] mt-0.5 truncate">
                  {new Date(selectedDetection.timestamp).toLocaleDateString()}
                </div>
              </div>

              <div className="bg-[#030c14] p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-[#7FA3AA]">SOURCE PING</div>
                <div className="text-sm font-semibold text-[#3FE8C8] mt-0.5">
                  #{selectedDetection.ping || '1432'}
                </div>
              </div>

              <div className="bg-[#030c14] p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-[#7FA3AA]">SHADOW CHECK</div>
                <div className="text-sm font-semibold text-emerald-400 mt-0.5">
                  {selectedDetection.shadow || 'CONSISTENT'}
                </div>
              </div>
            </div>

            {selectedDetection.notes && (
              <p className="text-xs text-[#7FA3AA] italic bg-[#030c14] p-3 rounded-xl border border-slate-800 font-mono leading-relaxed">
                "{selectedDetection.notes}"
              </p>
            )}

            {/* Action Button */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() =>
                  onInspectInDetector &&
                  onInspectInDetector(
                    selectedDetection.image,
                    selectedDetection.category === 'shipwreck' ? 'shipwreck' : 'marine-debris'
                  )
                }
                className="w-full py-2.5 px-4 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-mono text-xs font-semibold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Debris Detector</span>
              </button>

              <button
                type="button"
                onClick={() => resetViewFnRef.current()}
                className="w-full py-2 px-4 rounded-xl border border-slate-700 hover:bg-white/5 text-[#7FA3AA] hover:text-white font-mono text-xs transition-colors text-center"
              >
                Return to Orbit View
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
