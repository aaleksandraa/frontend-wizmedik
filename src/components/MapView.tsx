import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Phone, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { formatNumber } from '@/utils/formatters';

export interface MapItem {
  id: number;
  naziv: string;
  adresa: string;
  grad: string;
  telefon?: string;
  latitude?: number;
  longitude?: number;
  slug?: string;
  distance?: number;
  icon?: React.ReactNode;
}

interface MapViewProps {
  items: MapItem[];
  userLocation?: { lat: number; lng: number } | null;
  itemType: 'laboratorija' | 'banja' | 'dom-njega' | 'doktor' | 'klinika';
  itemIcon?: React.ReactNode;
  emptyMessage?: string;
  height?: string;
}

// Fix for default marker icon
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker colors for different types
const markerColors: Record<string, string> = {
  'laboratorija': 'violet',
  'banja': 'blue',
  'dom-njega': 'green',
  'doktor': 'gold',
  'klinika': 'orange',
};

export function MapView({ 
  items, 
  userLocation, 
  itemType, 
  itemIcon,
  emptyMessage = 'Nema lokacija sa GPS koordinatama',
  height = '600px'
}: MapViewProps) {
  const navigate = useNavigate();

  // Filter items with valid coordinates
  const validItems = items.filter(item => item.latitude && item.longitude);

  // Default center - Sarajevo
  const defaultCenter: [number, number] = [43.8563, 18.4131];
  
  // Use user location or first item or default
  const center: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng]
    : validItems.length > 0 && validItems[0].latitude && validItems[0].longitude
    ? [validItems[0].latitude, validItems[0].longitude]
    : defaultCenter;

  // Get route based on item type
  const getItemRoute = (item: MapItem) => {
    switch (itemType) {
      case 'laboratorija':
        return `/laboratorija/${item.slug || item.id}`;
      case 'banja':
        return `/banja/${item.slug || item.id}`;
      case 'dom-njega':
        return `/dom-njega/${item.slug || item.id}`;
      case 'doktor':
        return `/doktor/${item.slug || item.id}`;
      case 'klinika':
        return `/klinika/${item.slug || item.id}`;
      default:
        return '#';
    }
  };

  // Get type label
  const getTypeLabel = () => {
    switch (itemType) {
      case 'laboratorija':
        return 'laboratorija';
      case 'banja':
        return 'banja';
      case 'dom-njega':
        return 'domova';
      case 'doktor':
        return 'doktora';
      case 'klinika':
        return 'klinika';
      default:
        return 'lokacija';
    }
  };

  if (validItems.length === 0) {
    return (
      <div className="bg-muted/30 rounded-lg p-8 text-center flex flex-col items-center justify-center" style={{ minHeight: height }}>
        <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">{emptyMessage}</p>
        <p className="text-muted-foreground">
          Molimo koristite list view za prikaz svih {getTypeLabel()}.
        </p>
      </div>
    );
  }

  // Create custom icon based on type
  const getMarkerIcon = () => {
    const color = markerColors[itemType] || 'blue';
    return new Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  return (
    <div className="rounded-lg overflow-hidden border shadow-sm">
      <MapContainer
        center={center}
        zoom={validItems.length === 1 ? 14 : 8}
        style={{ height, width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {validItems.map((item) => (
          <Marker
            key={item.id}
            position={[item.latitude!, item.longitude!]}
            icon={getMarkerIcon()}
          >
            <Popup>
              <div className="p-2 min-w-[220px]">
                <div className="flex items-start gap-2 mb-2">
                  {itemIcon}
                  <h3 className="font-semibold text-base">{item.naziv}</h3>
                </div>
                
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>{item.adresa}, {item.grad}</span>
                  </div>
                  
                  {item.telefon && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <a href={`tel:${item.telefon}`} className="hover:text-primary">
                        {item.telefon}
                      </a>
                    </div>
                  )}

                  {item.distance !== undefined && (
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <MapPin className="h-4 w-4" />
                      <span>{formatNumber(item.distance)} km od vas</span>
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(getItemRoute(item))}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
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
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
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

export default MapView;
