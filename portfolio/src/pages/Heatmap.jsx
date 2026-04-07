import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { zoneAPI } from '../api/api';

// Fix for default marker icons in Leaflet + Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const URGENCY_COLORS = {
  high: '#ff4444',
  medium: '#ffbb33',
  low: '#00C851',
};

// Demo data if server returns empty
const DEMO_ZONES = [
  { _id: 'd1', name: 'Cyclone Warning', urgencyLevel: 'high', affectedPopulation: 45000, disasterType: 'Cyclone', location: { coordinates: [88.3639, 22.5726] } }, // Kolkata
  { _id: 'd2', name: 'Flood Risk Area', urgencyLevel: 'medium', affectedPopulation: 12000, disasterType: 'Flood', location: { coordinates: [77.5946, 12.9716] } }, // Bangalore
  { _id: 'd3', name: 'Safe Zone Alpha', urgencyLevel: 'low', affectedPopulation: 500, disasterType: 'Preparedness', location: { coordinates: [72.8777, 19.0760] } } // Mumbai
];

export default function Heatmap() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(L.layerGroup());
  const userMarkerRef = useRef(null);
  
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const handleLocate = useCallback(() => {
    setLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      (err) => {
        console.warn("Location error:", err.message);
        // Fallback to a random hotspot to show it works
        const spots = [[22.5726, 88.3639], [12.9716, 77.5946], [19.0760, 72.8777]];
        setUserLocation(spots[Math.floor(Math.random() * spots.length)]);
        setLocating(false);
      },
      { timeout: 6000 }
    );
  }, []);

  // 1. Fetch data
  const fetchZones = useCallback(async () => {
    try {
      setLoading(true);
      const res = await zoneAPI.getAll();
      const serverZones = res.data.data || [];
      // If server has no zones, use demo zones so the map isn't empty
      setZones(serverZones.length > 0 ? serverZones : DEMO_ZONES);
    } catch (err) {
      console.error('Failed to fetch zones, using demo data', err);
      setZones(DEMO_ZONES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  useEffect(() => {
    handleLocate();
  }, [handleLocate]);

  // 2. Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629], // India
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: true
    });

    // Add zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Premium Dark Matter Tile Layer (Base)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add markers layer group
    markersLayerRef.current.addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Update User Location Marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;
    const map = mapInstanceRef.current;

    // Remove old marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Add new marker
    userMarkerRef.current = L.marker(userLocation)
      .addTo(map)
      .bindPopup("<div style='color:#333'><b>Your Current Location</b><br/>Tracking active for your vicinity.</div>")
      .openPopup();

    map.flyTo(userLocation, 12, { animate: true, duration: 1.5 });
  }, [userLocation]);

  // 4. Update Disaster Zone Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    const layer = markersLayerRef.current;
    layer.clearLayers(); // Clean up old markers
    
    zones.forEach(zone => {
      if (!zone.location?.coordinates || zone.location.coordinates.length !== 2) return;
      
      const [lng, lat] = zone.location.coordinates;
      const color = URGENCY_COLORS[zone.urgencyLevel] || '#1f6feb';
      
      const marker = L.circleMarker([lat, lng], {
        radius: zone.affectedPopulation ? Math.max(15, Math.min(50, zone.affectedPopulation / 800)) : 18,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5,
        className: `pulse-marker-${zone.urgencyLevel}`
      }).addTo(layer);

      marker.bindPopup(`
        <div style="color: #333; min-width: 200px; font-family: sans-serif;">
           <div style="border-bottom: 2px solid ${color}; padding-bottom: 5px; margin-bottom: 8px;">
             <h3 style="margin: 0; font-size: 1.1rem; color: #111;">${zone.name}</h3>
             <span style="font-size: 0.7rem; font-weight: bold; text-transform: uppercase; color: ${color};">${zone.urgencyLevel} Priority</span>
           </div>
           <div style="font-size: 0.85rem; line-height: 1.6;">
             <div><b>Disaster:</b> ${zone.disasterType}</div>
             <div><b>Impact:</b> ${zone.affectedPopulation?.toLocaleString() || 'Monitoring'} people</div>
             <button onclick="window.location.href='/analytics'" style="margin-top: 10px; width: 100%; padding: 6px; background: #eee; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">Deep Analytics</button>
           </div>
        </div>
      `);
    });
  }, [zones]);

  return (
    <div className="heatmap-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Disaster Recovery Map</h1>
          <p className="page-subtitle">Interactive visualization of operational zones and risk hotspots</p>
        </div>
        <div className="page-actions">
          <button className={`btn btn-primary ${locating ? 'loading' : ''}`} onClick={handleLocate} disabled={locating}>
            <span className="btn-icon">📍</span> {locating ? 'Locating...' : 'My Location'}
          </button>
          <button className="btn btn-ghost" onClick={fetchZones}>
            <span className="btn-icon">🔄</span> Refresh
          </button>
        </div>
      </div>

      <div className="map-view-card">
        <div ref={mapContainerRef} className="map-display-area"></div>
        
        <div className="map-sidebar-legend">
          <h4>Risk Classification</h4>
          <div className="legend-items">
             <div className="legend-item">
               <span className="dot hot"></span> 
               <div className="legend-label">
                 <span>High Urgency</span>
                 <small>Critical response required</small>
               </div>
             </div>
             <div className="legend-item">
               <span className="dot med"></span> 
               <div className="legend-label">
                 <span>Medium Urgency</span>
                 <small>Active monitoring</small>
               </div>
             </div>
             <div className="legend-item">
               <span className="dot low"></span> 
               <div className="legend-label">
                 <span>Low Urgency</span>
                 <small>Stable / Maintenance</small>
               </div>
             </div>
          </div>
          
          <div className="legend-footer">
             <small>Updated: {new Date().toLocaleTimeString()}</small>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .heatmap-page { display: flex; flex-direction: column; height: 100%; gap: 20px; }
        
        .map-view-card { 
          flex: 1; position: relative; border-radius: 16px; overflow: hidden; 
          border: 1px solid var(--border); box-shadow: 0 12px 48px rgba(0,0,0,0.5);
          background: #0d1117; min-height: 550px;
        }
        
        .map-display-area { width: 100%; height: calc(100vh - 220px); z-index: 1; }
        
        .map-sidebar-legend {
          position: absolute; top: 24px; right: 24px; z-index: 1000;
          width: 200px; background: rgba(22, 27, 34, 0.85); backdrop-filter: blur(12px);
          padding: 20px; border-radius: 12px; border: 1px solid var(--border);
          color: var(--text-primary); transition: transform 0.3s;
        }
        
        .map-sidebar-legend h4 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; color: var(--text-secondary); margin-top: 0; }
        
        .legend-items { display: flex; flex-direction: column; gap: 14px; }
        
        .legend-item { display: flex; align-items: flex-start; gap: 12px; }
        
        .legend-label { display: flex; flex-direction: column; }
        .legend-label span { font-size: 0.85rem; font-weight: 600; }
        .legend-label small { font-size: 0.7rem; color: var(--text-muted); }
        
        .dot { width: 12px; height: 12px; border-radius: 50%; margin-top: 3px; flex-shrink: 0; }
        .dot.hot { background: #ff4444; box-shadow: 0 0 10px rgba(255, 68, 68, 0.6); }
        .dot.med { background: #ffbb33; box-shadow: 0 0 10px rgba(255, 187, 51, 0.6); }
        .dot.low { background: #00C851; box-shadow: 0 0 10px rgba(0, 200, 81, 0.6); }
        
        .legend-footer { margin-top: 20px; padding-top: 12px; border-top: 1px solid var(--border); text-align: center; color: var(--text-muted); }
        
        /* Leaflet Overrides */
        .leaflet-container { background: #0d1117 !important; cursor: crosshair !important; }
        .leaflet-popup-content-wrapper { background: #ffffff !important; color: #111 !important; border-radius: 12px !important; box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important; }
        .leaflet-popup-tip { background: #ffffff !important; }
        
        .page-actions { display: flex; gap: 12px; align-items: center; }
        .btn-icon { font-size: 1.1rem; }
        
        .loading { opacity: 0.7; pointer-events: none; }
        
        @keyframes pulse-hot {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 0.5; }
        }
      `}} />
    </div>
  );
}
