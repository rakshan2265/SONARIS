/**
 * Centralized Geolocation & Marine Detection Service
 * Connects Geo-Tagged Sonar and Camera Detections with Backend APIs
 */

import { USE_MOCK_API, API_BASE_URL } from './detectionService';

export interface GeoDetection {
  id: string | number;
  type: string;                  // e.g. "shipwreck", "plastic bottle", "tire", "can", "fishing net", "pipe"
  category: 'marine-debris' | 'shipwreck';
  confidence: number;            // 0.0 - 1.0 or 0 - 100
  latitude: number;              // -90 to 90
  longitude: number;             // -180 to 180
  locationName?: string;         // e.g. "Bay of Bengal, Continental Shelf"
  timestamp: string;             // ISO-8601 string
  image: string;                 // URL or relative asset path
  depthMeters?: number;          // optional depth in meters
  sonarFrequencyKhz?: number;    // optional sonar frequency
  dims?: string;                 // e.g. "2.1m × 0.8m"
  ping?: number | string;        // e.g. 1432
  shadow?: string;               // e.g. "CONSISTENT" | "PARTIAL"
  boundingBoxes?: any[];
  notes?: string;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeoAnalyticsSummary {
  totalDetections: number;
  marineDebrisCount: number;
  shipwreckCount: number;
  latestDetection: GeoDetection | null;
  averageConfidence: number;
  distributionByRegion: { [region: string]: number };
}

// Initial seed mock detections around global ocean hotspots
export const INITIAL_GEO_DETECTIONS: GeoDetection[] = [
  {
    id: 1,
    type: "shipwreck",
    category: "shipwreck",
    confidence: 0.94,
    latitude: 13.0827,
    longitude: 80.2707,
    locationName: "Bay of Bengal (Chennai Coastal Shelf)",
    timestamp: "2026-09-09T10:30:00Z",
    image: "/assets/sample-3.jpg",
    depthMeters: 42,
    sonarFrequencyKhz: 450,
    notes: "Sunken wooden hull identified via side-scan acoustic sonar anomaly."
  },
  {
    id: 2,
    type: "plastic bottle",
    category: "marine-debris",
    confidence: 0.92,
    latitude: 11.3493,
    longitude: 142.1996,
    locationName: "Mariana Trench Basin",
    timestamp: "2026-09-09T08:15:00Z",
    image: "/assets/detection-result-raw.jpg",
    depthMeters: 85,
    notes: "High-density polyethylene debris resting on seabed substrate."
  },
  {
    id: 3,
    type: "tire",
    category: "marine-debris",
    confidence: 0.87,
    latitude: 35.8989,
    longitude: 14.5146,
    locationName: "Mediterranean Sea (Malta Trench)",
    timestamp: "2026-09-08T16:40:00Z",
    image: "/assets/sample-1.jpg",
    depthMeters: 28,
    notes: "Heavy rubber tire embedded in benthic marine flora."
  },
  {
    id: 4,
    type: "ghost net",
    category: "marine-debris",
    confidence: 0.91,
    latitude: 18.2208,
    longitude: -66.5901,
    locationName: "Caribbean Sea (Puerto Rico Trench)",
    timestamp: "2026-09-08T11:20:00Z",
    image: "/assets/sample-5.jpg",
    depthMeters: 36,
    notes: "Monofilament gillnet entangled around coral shelf."
  },
  {
    id: 5,
    type: "shipwreck",
    category: "shipwreck",
    confidence: 0.96,
    latitude: 51.1279,
    longitude: 1.3134,
    locationName: "English Channel (Dover Strait)",
    timestamp: "2026-09-07T14:10:00Z",
    image: "/assets/sample-4.jpg",
    depthMeters: 55,
    sonarFrequencyKhz: 900,
    notes: "Historic merchant vessel structure surveyed by autonomous AUV."
  },
  {
    id: 6,
    type: "can",
    category: "marine-debris",
    confidence: 0.76,
    latitude: -16.8524,
    longitude: 146.3125,
    locationName: "Coral Sea (Great Barrier Reef)",
    timestamp: "2026-09-06T09:05:00Z",
    image: "/assets/sample-1.jpg",
    depthMeters: 18,
    notes: "Corroded aluminum beverage container."
  },
  {
    id: 7,
    type: "plastic bag",
    category: "marine-debris",
    confidence: 0.83,
    latitude: 25.0000,
    longitude: -90.0000,
    locationName: "Gulf of Mexico Shelf",
    timestamp: "2026-09-05T19:30:00Z",
    image: "/assets/detection-result-raw.jpg",
    depthMeters: 62,
    notes: "Semi-translucent polymer film drifting above sea floor."
  }
];

// In-memory / LocalStorage cache for persistent demo sessions
const STORAGE_KEY = 'sonaris_geo_detections';

function getStoredDetections(): GeoDetection[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn("LocalStorage access error:", err);
  }
  return INITIAL_GEO_DETECTIONS;
}

function persistDetections(detections: GeoDetection[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(detections));
  } catch (err) {
    console.warn("LocalStorage save error:", err);
  }
}

/**
 * Fetch all Geo-Tagged detections
 * When backend is live, connects to GET /api/detections
 */
export async function getGeoDetections(): Promise<GeoDetection[]> {
  if (USE_MOCK_API) {
    // Return cached/stored detections with minimal simulated latency
    return getStoredDetections();
  }

  try {
    const response = await fetch(`${API_BASE_URL}/detections`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch geo detections: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Backend GET /api/detections failed, falling back to cached:", error);
    return getStoredDetections();
  }
}

/**
 * Save a newly geo-tagged detection
 * When backend is live, connects to POST /api/detections
 */
export async function saveGeoDetection(
  detectionData: Omit<GeoDetection, 'id'>
): Promise<GeoDetection> {
  const newId = Date.now();
  const createdDetection: GeoDetection = {
    ...detectionData,
    id: newId,
    timestamp: detectionData.timestamp || new Date().toISOString()
  };

  if (USE_MOCK_API) {
    const current = getStoredDetections();
    const updated = [createdDetection, ...current];
    persistDetections(updated);
    return createdDetection;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/detections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createdDetection)
    });

    if (!response.ok) {
      throw new Error(`Failed to save geo detection: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Backend POST /api/detections failed, storing locally:", error);
    const current = getStoredDetections();
    const updated = [createdDetection, ...current];
    persistDetections(updated);
    return createdDetection;
  }
}

/**
 * Get current user GPS location using browser Geolocation API
 * Prompts user for permission and returns { latitude, longitude, accuracy }
 */
export function getCurrentUserLocation(): Promise<LocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your web browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: parseFloat(position.coords.latitude.toFixed(4)),
          longitude: parseFloat(position.coords.longitude.toFixed(4)),
          accuracy: Math.round(position.coords.accuracy)
        });
      },
      (error) => {
        let msg = "Failed to retrieve location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = "Location permission was denied. Please allow location access in your browser.";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "Location information is currently unavailable.";
            break;
          case error.TIMEOUT:
            msg = "The request to get user location timed out.";
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

/**
 * Calculate Analytics on Geo-Tagged Detections
 */
export function calculateGeoAnalytics(detections: GeoDetection[]): GeoAnalyticsSummary {
  const total = detections.length;
  let debrisCount = 0;
  let shipwreckCount = 0;
  let totalConf = 0;
  const regions: { [region: string]: number } = {};

  detections.forEach((d) => {
    if (d.category === 'shipwreck' || d.type.toLowerCase().includes('wreck')) {
      shipwreckCount++;
    } else {
      debrisCount++;
    }

    const confVal = d.confidence > 1 ? d.confidence : d.confidence * 100;
    totalConf += confVal;

    // Categorize by approximate basin
    let region = "Global Waters";
    if (d.longitude > 40 && d.longitude < 100 && d.latitude > -20 && d.latitude < 30) {
      region = "Indian Ocean / Bay of Bengal";
    } else if (d.longitude >= 100 || d.longitude <= -100) {
      region = "Pacific Ocean";
    } else if (d.longitude > -80 && d.longitude < 0) {
      region = "Atlantic Ocean";
    } else if (d.latitude > 30 && d.latitude < 45 && d.longitude > -10 && d.longitude < 40) {
      region = "Mediterranean";
    }
    regions[region] = (regions[region] || 0) + 1;
  });

  // Sort by timestamp descending to find latest
  const sorted = [...detections].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return {
    totalDetections: total,
    marineDebrisCount: debrisCount,
    shipwreckCount: shipwreckCount,
    latestDetection: sorted[0] || null,
    averageConfidence: total > 0 ? Math.round(totalConf / total) : 0,
    distributionByRegion: regions
  };
}
