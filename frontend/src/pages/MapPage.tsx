import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import type { LatLngExpression, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Sub-component to handle map clicks
function ClickHandler({ markers, setMarkers, calculateRoute }: any) {
  useMapEvents({
    click(e) {
      // 1. Add the new marker to our list of markers (no limit!)
      const newMarkers = [...markers, e.latlng];
      setMarkers(newMarkers);
      
      // 2. As long as we have at least 2 points, calculate the route
      if (newMarkers.length >= 2) {
        calculateRoute(newMarkers);
      }
    },
  });
  return null;
}

export default function MapPage() {
  const [markers, setMarkers] = useState<LatLng[]>([]);
  const [routeLine, setRouteLine] = useState<LatLngExpression[]>([]);
  const [distance, setDistance] = useState<number>(0);
  const [statusText, setStatusText] = useState("Click the map to drop Point A");
  const [isSaving, setIsSaving] = useState(false);
  
    // NEW STATE VARIABLES FOR LOADING ROUTES
  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);
  const [showRoutes, setShowRoutes] = useState(false);

  // Now accepts an array of ANY size
  const calculateRoute = async (points: LatLng[]) => {
    setStatusText("Calculating route...");

    // Dynamically build the coordinate string for OSRM: "lng1,lat1;lng2,lat2;lng3,lat3..."
    const coords = points.map(p => `${p.lng},${p.lat}`).join(';');
    
    // The official OSRM demo server secretly only supports cars! 
    // We MUST use the OpenStreetMap.de dedicated foot server instead.
    // Note: The URL says 'driving', but this specific server ('routed-foot') converts it to walking paths.
    const osrmUrl = `https://routing.openstreetmap.de/routed-foot/route/v1/driving/${coords}?overview=full&geometries=geojson`;

    try {
      const response = await fetch(osrmUrl);
      const data = await response.json();

      if (data.code === 'Ok') {
        const coords = data.routes[0].geometry.coordinates;
        const latLngs = coords.map((c: number[]) => [c[1], c[0]] as LatLngExpression);
        setRouteLine(latLngs);
        
        const distanceMiles = parseFloat((data.routes[0].distance * 0.000621371).toFixed(2));
        setDistance(distanceMiles);
        setStatusText(`Route found! Distance: ${distanceMiles} miles`);
      }
    } catch (error) {
      console.error("Routing error:", error);
      setStatusText("Error calculating route.");
    }
  };
  // Save the route to the backend
  const saveRouteToBackend = async () => {
    if (markers.length < 2) return;
    setIsSaving(true);
    setStatusText("Saving to backend...");

    const testUserId = "6a45b4ebbcf278a14296329a";
    // Grab the very first and very last markers for the database
    const startMarker = markers[0];
    const endMarker = markers[markers.length - 1];

    const routeData = {
      userId: testUserId,
      routeName: "Test Multi-point Walking Route",
      distanceMiles: distance,
      startPoint: [startMarker.lng, startMarker.lat],
      endPoint: [endMarker.lng, endMarker.lat]
    };

    try {
      const response = await fetch('http://localhost:3000/APIs/routes/saveRoute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeData)
      });

      if (response.ok) {
        setStatusText("✅ Route saved successfully!");
      } else {
        const err = await response.json();
        setStatusText("❌ Failed to save: " + err.error);
      }
    } catch (error) {
      console.error("Backend error:", error);
      setStatusText("❌ Could not connect to backend.");
    }
    setIsSaving(false);
  };
  // Load routes from the backend for a specific user
  const loadRoutesFromBackend = async () => {
    // Toggle the list off if it's already open
    if (showRoutes) {
      setShowRoutes(false);
      return;
    }
    
    setStatusText("Loading saved routes...");
    const testUserId = "6a45b4ebbcf278a14296329a";

    try {
      const response = await fetch(`http://localhost:3000/APIs/routes/loadRoutes/${testUserId}`);
      if (response.ok) {
        const data = await response.json();
        setSavedRoutes(data.routes);
        setShowRoutes(true);
        setStatusText(`✅ Loaded ${data.routes.length} routes.`);
      } else {
        const err = await response.json();
        setStatusText("❌ Failed to load: " + (err.message || err.error));
      }
    } catch (error) {
      console.error("Backend error:", error);
      setStatusText("❌ Could not connect to backend.");
    }
  };

  // Clear the map and reset state
  const clearMap = () => {
    setMarkers([]);
    setRouteLine([]);
    setDistance(0);
    setStatusText("Click the map to drop Point A");
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      {/* UI Overlay */}
      <div style={{ 
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', 
        zIndex: 1000, background: 'white', padding: '15px 25px', borderRadius: '8px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)', textAlign: 'center'
      }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', fontWeight: 'bold' }}>Route Planner</h2>
        <p style={{ margin: '0 0 15px 0' }}>{statusText}</p>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={clearMap}
            style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Clear Map
          </button>
          
          {/* Show save button if we have at least 2 points */}
          {markers.length >= 2 && (
            <button 
              onClick={saveRouteToBackend}
              disabled={isSaving}
              style={{ padding: '8px 16px', background: isSaving ? '#9ca3af' : '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {isSaving ? "Saving..." : "Save Route"}
            </button>
          )}
          {/* Show load routes button */}
          <button 
            onClick={loadRoutesFromBackend}
            style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {showRoutes ? "Hide Routes" : "Load Routes"}
          </button>
        </div>
      </div>

      {/* Map Component */}
      <MapContainer 
        center={[28.6024, -81.2001]} // UCF coordinates
        zoom={14} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ClickHandler markers={markers} setMarkers={setMarkers} calculateRoute={calculateRoute} />
        
        {markers.map((position, idx) => (
          <Marker key={idx} position={position} />
        ))}

        {routeLine.length > 0 && (
          <Polyline positions={routeLine} pathOptions={{ color: 'blue', weight: 5 }} />
        )}
      </MapContainer>
    </div>
  );
}