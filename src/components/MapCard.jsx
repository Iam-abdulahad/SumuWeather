import { Map } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import GlassCard from './GlassCard';
import L from 'leaflet';

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapCard({ location }) {
  if (!location) return null;

  // We use a unique key to remount the map when location changes, 
  // ensuring the center is updated properly.
  const mapKey = `${location.latitude}-${location.longitude}`;

  return (
    <GlassCard className="flex flex-col gap-3 p-4 md:p-5" id="map-card">
      <div className="flex items-center gap-2">
        <Map size={16} className="text-cloud-white/75" aria-hidden="true" />
        <h2 className="font-body text-micro font-medium uppercase tracking-wider text-cloud-white/75">
          Precipitation Map
        </h2>
      </div>

      <div className="relative mt-2 h-[250px] w-full overflow-hidden rounded-[16px] border border-white/10">
        <MapContainer 
          key={mapKey}
          center={[location.latitude, location.longitude]} 
          zoom={8} 
          scrollWheelZoom={false} // Prevent getting stuck while scrolling the dashboard
          className="h-full w-full bg-deep-atmosphere"
          zoomControl={true}
        >
          {/* Base Map - Dark themed OSM or standard */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          <Marker position={[location.latitude, location.longitude]} />
        </MapContainer>

        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-deep-atmosphere/85 px-3 py-2 font-body text-micro text-cloud-white/85 backdrop-blur-sm">
          Precipitation radar unavailable
        </div>
        
        {/* Transparent overlay for interactions if we wanted to require a click to activate map, but scrollWheelZoom=false is usually enough. */}
      </div>
    </GlassCard>
  );
}
