import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Phone } from 'lucide-react';

// Fix for default marker icon
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Doctor {
  id: number;
  ime: string;
  prezime: string;
  specijalnost: string;
  grad: string;
  lokacija: string;
  telefon: string;
  opis?: string;
  slika_profila?: string;
  ocjena?: number;
  broj_ocjena?: number;
  slug: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

interface DoctorsMapSplitViewProps {
  doctors: Doctor[];
  userLocation?: { lat: number; lng: number } | null;
}

const defaultCenter: LatLngExpression = [43.8563, 18.4131]; // Sarajevo

// Component to handle map centering
function MapController({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

export function DoctorsMapSplitView({ doctors, userLocation }: DoctorsMapSplitViewProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [hoveredDoctor, setHoveredDoctor] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(defaultCenter);
  const [mapZoom, setMapZoom] = useState(12);

  const doctorsWithCoords = useMemo(() => {
    return doctors.filter(d => d.latitude && d.longitude);
  }, [doctors]);

  const initialCenter = useMemo(() => {
    if (userLocation) return [userLocation.lat, userLocation.lng] as LatLngExpression;
    if (doctorsWithCoords.length > 0) {
      return [doctorsWithCoords[0].latitude!, doctorsWithCoords[0].longitude!] as LatLngExpression;
    }
    return defaultCenter;
  }, [userLocation, doctorsWithCoords]);

  useEffect(() => {
    setMapCenter(initialCenter);
  }, [initialCenter]);

  const handleDoctorClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    if (doctor.latitude && doctor.longitude) {
      setMapCenter([doctor.latitude, doctor.longitude]);
      setMapZoom(15);
    }
  };

  // Custom marker icons
  const getDoctorIcon = (isSelected: boolean, isHovered: boolean) => {
    const color = isSelected ? 'cyan' : isHovered ? 'blue' : 'gold';
    const iconSize: [number, number] = isSelected ? [35, 57] : isHovered ? [30, 49] : [25, 41];
    
    return new Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize,
      iconAnchor: [iconSize[0] / 2, iconSize[1]],
      popupAnchor: [1, -iconSize[1] + 10],
      shadowSize: [41, 41]
    });
  };

  const userLocationIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Left Side - Doctor List */}
      <div className="w-2/5 overflow-y-auto pr-2 space-y-3">
        {doctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nema doktora koji odgovaraju kriterijima</p>
          </div>
        ) : (
          doctors.map((doctor) => (
            <Card
              key={doctor.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedDoctor?.id === doctor.id
                  ? 'ring-2 ring-cyan-500 shadow-lg'
                  : hoveredDoctor === doctor.id
                  ? 'ring-1 ring-cyan-300'
                  : ''
              }`}
              onClick={() => handleDoctorClick(doctor)}
              onMouseEnter={() => setHoveredDoctor(doctor.id)}
              onMouseLeave={() => setHoveredDoctor(null)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Doctor Image */}
                  <div className="flex-shrink-0">
                    {doctor.slika_profila ? (
                      <img
                        src={doctor.slika_profila}
                        alt={`${doctor.ime} ${doctor.prezime}`}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center">
                        <span className="text-2xl font-bold text-cyan-700">
                          {doctor.ime[0]}{doctor.prezime[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Doctor Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/doktor/${doctor.slug}`}
                      className="font-semibold text-lg text-gray-900 hover:text-cyan-600 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Dr. {doctor.ime} {doctor.prezime}
                    </Link>

                    <p className="text-sm text-gray-600 mt-1">{doctor.specijalnost}</p>

                    {/* Rating */}
                    {doctor.ocjena && doctor.broj_ocjena && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{Number(doctor.ocjena).toFixed(1)}</span>
                        <span className="text-xs text-gray-500">({doctor.broj_ocjena})</span>
                      </div>
                    )}

                    {/* Location */}
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-cyan-600" />
                      <span>{doctor.grad}</span>
                      {doctor.distance && (
                        <Badge variant="secondary" className="text-xs">
                          {doctor.distance.toFixed(1)} km
                        </Badge>
                      )}
                    </div>

                    {/* Phone */}
                    {doctor.telefon && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-cyan-600" />
                        <a
                          href={`tel:${doctor.telefon}`}
                          className="hover:text-cyan-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {doctor.telefon}
                        </a>
                      </div>
                    )}

                    {/* View Profile Button */}
                    <Link
                      to={`/doktor/${doctor.slug}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        className="mt-3 bg-cyan-600 hover:bg-cyan-700 text-white"
                      >
                        Pogledaj profil
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Right Side - Map */}
      <div className="w-3/5 rounded-xl overflow-hidden shadow-lg border border-gray-200">
        <MapContainer
          center={initialCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location Marker */}
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userLocationIcon}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-semibold">Vaša lokacija</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Doctor Markers */}
          {doctorsWithCoords.map((doctor) => (
            <Marker
              key={doctor.id}
              position={[doctor.latitude!, doctor.longitude!]}
              icon={getDoctorIcon(
                selectedDoctor?.id === doctor.id,
                hoveredDoctor === doctor.id
              )}
              eventHandlers={{
                click: () => setSelectedDoctor(doctor),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[220px]">
                  <div className="flex items-start gap-3">
                    {doctor.slika_profila ? (
                      <img
                        src={doctor.slika_profila}
                        alt={`${doctor.ime} ${doctor.prezime}`}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center">
                        <span className="text-xl font-bold text-cyan-700">
                          {doctor.ime[0]}{doctor.prezime[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        Dr. {doctor.ime} {doctor.prezime}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{doctor.specijalnost}</p>
                      {doctor.ocjena && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-medium">{Number(doctor.ocjena).toFixed(1)}</span>
                        </div>
                      )}
                      <Link to={`/doktor/${doctor.slug}`}>
                        <Button size="sm" className="mt-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs">
                          Pogledaj profil
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
