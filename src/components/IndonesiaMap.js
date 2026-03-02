import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const IndonesiaMap = ({ directives }) => {
  // Indonesia province coordinates (center of provinces)
  const regionCoordinates = {
    // Sumatera
    'Aceh': { lat: 4.6951, lng: 96.7494 },
    'Sumatera Utara': { lat: 2.1154, lng: 99.5451 },
    'Sumatera Barat': { lat: -0.7399, lng: 100.8000 },
    'Riau': { lat: 0.2933, lng: 101.7068 },
    'Kepulauan Riau': { lat: 3.9457, lng: 108.1429 },
    'Jambi': { lat: -1.6101, lng: 103.6131 },
    'Sumatera Selatan': { lat: -3.3194, lng: 103.9144 },
    'Kepulauan Bangka Belitung': { lat: -2.7411, lng: 106.4406 },
    'Bengkulu': { lat: -3.5778, lng: 102.3464 },
    'Lampung': { lat: -4.5586, lng: 105.4068 },
    // Jawa
    'DKI Jakarta': { lat: -6.2088, lng: 106.8456 },
    'Jawa Barat': { lat: -7.0909, lng: 107.6689 },
    'Banten': { lat: -6.4058, lng: 106.0640 },
    'Jawa Tengah': { lat: -7.1500, lng: 110.1403 },
    'DI Yogyakarta': { lat: -7.8754, lng: 110.4262 },
    'Jawa Timur': { lat: -7.5360, lng: 112.2384 },
    // Kalimantan
    'Kalimantan Barat': { lat: 0.0000, lng: 111.5000 },
    'Kalimantan Tengah': { lat: -1.6814, lng: 113.3824 },
    'Kalimantan Selatan': { lat: -3.0926, lng: 115.2838 },
    'Kalimantan Timur': { lat: 0.5387, lng: 116.4194 },
    'Kalimantan Utara': { lat: 3.0731, lng: 116.0413 },
    // Sulawesi
    'Sulawesi Utara': { lat: 0.6247, lng: 123.9750 },
    'Gorontalo': { lat: 0.6999, lng: 122.4467 },
    'Sulawesi Tengah': { lat: -1.4300, lng: 121.4456 },
    'Sulawesi Barat': { lat: -2.8442, lng: 119.2321 },
    'Sulawesi Selatan': { lat: -3.6688, lng: 120.1941 },
    'Sulawesi Tenggara': { lat: -4.1449, lng: 122.1746 },
    // Bali & Nusa Tenggara
    'Bali': { lat: -8.3405, lng: 115.0920 },
    'Nusa Tenggara Barat': { lat: -8.6529, lng: 117.3616 },
    'Nusa Tenggara Timur': { lat: -8.6574, lng: 121.0794 },
    // Maluku
    'Maluku': { lat: -3.2385, lng: 130.1453 },
    'Maluku Utara': { lat: 1.5709, lng: 127.8087 },
    // Papua
    'Papua Barat Daya': { lat: -1.3361, lng: 132.1908 },
    'Papua Barat': { lat: -1.3361, lng: 133.1747 },
    'Papua Tengah': { lat: -3.9949, lng: 136.3492 },
    'Papua Pegunungan': { lat: -4.2699, lng: 138.0804 },
    'Papua Selatan': { lat: -7.2942, lng: 138.7305 },
    'Papua': { lat: -4.2699, lng: 138.0804 },
  };
  
  const regionData = useMemo(() => {
    const regions = {};
    directives.forEach(directive => {
      const region = directive.region;
      if (!region) return;
      
      // Check if region exists in coordinates
      const coords = regionCoordinates[region];
      
      if (!regions[region]) {
        regions[region] = {
          name: region,
          count: 0,
          pending: 0,
          in_progress: 0,
          implemented: 0,
          coordinates: coords || null
        };
      }
      regions[region].count++;
      regions[region][directive.status]++;
    });
    
    // Filter only regions with valid coordinates
    return Object.values(regions).filter(r => r.coordinates !== null);
  }, [directives]);

  const getRegionColor = (region) => {
    if (region.implemented > 0 && region.pending === 0 && region.in_progress === 0) {
      return '#10B981'; // emerald - all done
    }
    if (region.in_progress > 0) {
      return '#3B82F6'; // blue - in progress
    }
    return '#F59E0B'; // amber - pending
  };

  const getMarkerRadius = (count) => {
    const minRadius = 12;
    const maxRadius = 30;
    const maxCount = Math.max(...regionData.map(r => r.count), 1);
    return minRadius + ((count / maxCount) * (maxRadius - minRadius));
  };

  // Indonesia center coordinates
  const indonesiaCenter = [-2.5, 118.0];
  const defaultZoom = 5;

  return (
    <Card className="p-4 bg-white border-0 shadow-sm" data-testid="indonesia-map">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-emerald-100 p-2 rounded-lg">
          <MapPin className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Persebaran Region Aktif</h3>
          <p className="text-xs text-slate-500">Distribusi arahan berdasarkan daerah</p>
        </div>
      </div>

      {/* Leaflet Map */}
      <div className="rounded-xl overflow-hidden" style={{ height: '280px' }}>
        <MapContainer
          center={indonesiaCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {regionData.map((region) => (
            <CircleMarker
              key={region.name}
              center={[region.coordinates.lat, region.coordinates.lng]}
              radius={getMarkerRadius(region.count)}
              pathOptions={{
                fillColor: getRegionColor(region),
                fillOpacity: 0.7,
                color: 'white',
                weight: 2,
              }}
              data-testid={`map-marker-${region.name}`}
            >
              <Popup>
                <div className="p-1">
                  <h4 className="font-semibold text-slate-800 text-sm mb-1">{region.name}</h4>
                  <p className="text-xs text-slate-600 mb-2">{region.count} arahan aktif</p>
                  <div className="flex flex-wrap gap-1">
                    {region.pending > 0 && (
                      <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                        {region.pending} pending
                      </span>
                    )}
                    {region.in_progress > 0 && (
                      <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                        {region.in_progress} aktif
                      </span>
                    )}
                    {region.implemented > 0 && (
                      <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                        {region.implemented} selesai
                      </span>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Region List */}
      <div className="mt-4 space-y-2 max-h-[180px] overflow-y-auto">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">Detail Region</h4>
        {regionData.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Belum ada data region</p>
        ) : (
          regionData.map((region) => (
            <div
              key={region.name}
              className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
              data-testid={`region-item-${region.name}`}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getRegionColor(region) }}
                />
                <div>
                  <p className="font-medium text-slate-800 text-sm">{region.name}</p>
                  <p className="text-xs text-slate-500">{region.count} arahan aktif</p>
                </div>
              </div>
              <div className="flex gap-1">
                {region.in_progress > 0 && (
                  <Badge className="bg-blue-100 text-blue-700 border-0 text-xs px-2 py-0.5">
                    {region.in_progress} active
                  </Badge>
                )}
                {region.implemented > 0 && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs px-2 py-0.5">
                    {region.implemented} done
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-slate-200">
        <p className="text-xs font-semibold text-slate-600 mb-2">Legenda:</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-slate-600">Selesai</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-slate-600">Berlangsung</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-xs text-slate-600">Menunggu</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default IndonesiaMap;