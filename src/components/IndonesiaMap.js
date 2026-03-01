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
  // Indonesia region coordinates (approximate city centers)
  const regionCoordinates = {
    'Jakarta': { lat: -6.2088, lng: 106.8456 },
    'Bandung': { lat: -6.9175, lng: 107.6191 },
    'Surabaya': { lat: -7.2575, lng: 112.7521 },
    'Medan': { lat: 3.5952, lng: 98.6722 },
    'Makassar': { lat: -5.1477, lng: 119.4327 },
    'Yogyakarta': { lat: -7.7956, lng: 110.3695 },
    'Semarang': { lat: -6.9666, lng: 110.4196 },
    'Palembang': { lat: -2.9761, lng: 104.7754 },
    'Pontianak': { lat: -0.0263, lng: 109.3425 },
    'Banjarmasin': { lat: -3.3194, lng: 114.5908 },
    'Denpasar': { lat: -8.6705, lng: 115.2126 },
    'Manado': { lat: 1.4748, lng: 124.8421 },
    'Jayapura': { lat: -2.5916, lng: 140.6690 },
    'Padang': { lat: -0.9471, lng: 100.4172 },
    'Malang': { lat: -7.9666, lng: 112.6326 },
    'Balikpapan': { lat: -1.2654, lng: 116.8312 },
    'Pekanbaru': { lat: 0.5071, lng: 101.4478 },
    'Samarinda': { lat: -0.4948, lng: 117.1436 },
    'Batam': { lat: 1.0456, lng: 104.0305 },
    'Kupang': { lat: -10.1787, lng: 123.6070 },
    'Ambon': { lat: -3.6954, lng: 128.1814 },
    'Mataram': { lat: -8.5833, lng: 116.1167 },
  };

  const regionData = useMemo(() => {
    const regions = {};
    directives.forEach(directive => {
      const region = directive.region;
      if (!regions[region]) {
        regions[region] = {
          name: region,
          count: 0,
          pending: 0,
          in_progress: 0,
          implemented: 0,
          coordinates: regionCoordinates[region] || null
        };
      }
      regions[region].count++;
      regions[region][directive.status]++;
    });
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
