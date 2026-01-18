import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Building2, MapPin, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { formatNumber } from '@/utils/formatters';

interface Clinic {
  id: number;
  naziv: string;
  adresa: string;
  grad: string;
  telefon: string;
  latitude?: number;
  longitude?: number;
  slug?: string;
  distance?: number;
}

interface ClinicsMapProps {
  clinics: Clinic[];
  userLocation?: { lat: number; lng: number } | null;
}

// Fix for default marker icon
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function ClinicsMap({ clinics, userLocation }: ClinicsMapProps) {
  const navigate = useNavigate();

  // Filter clinics with valid coordinates
  const validClinics = clinics.filter(c => c.latitude && c.longitude);

  // Default center - Sarajevo
  const defaultCenter: [number, number] = [43.8563, 18.4131];
  
  // Use user location or first clinic or default
  const center: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng]
    : validClinics.length > 0 && validClinics[0].latitude && validClinics[0].longitude
    ? [validClinics[0].latitude, validClinics[0].longitude]
    : defaultCenter;

  if (validClinics.length === 0) {
    return (
      <div className="bg-muted/30 rounded-lg p-8 text-center min-h-[500px] flex flex-col items-center justify-center">
        <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">Nema klinika sa GPS koordinatama</p>
        <p className="text-muted-foreground">
          Molimo koristite list view za prikaz svih klinika.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border shadow-sm">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '600px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {validClinics.map((clinic) => (
          <Marker
            key={clinic.id}
            position={[clinic.latitude!, clinic.longitude!]}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-start gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-primary mt-1" />
                  <h3 className="font-semibold text-lg">{clinic.naziv}</h3>
                </div>
                
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{clinic.adresa}, {clinic.grad}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{clinic.telefon}</span>
                  </div>

                  {clinic.distance && (
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <MapPin className="h-4 w-4" />
                      <span>{formatNumber(clinic.distance)} km od vas</span>
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/klinika/${clinic.slug || clinic.id}`)}
                >
                  Pogledaj profil
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User location marker if available */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={new Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold">Vaša lokacija</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}


