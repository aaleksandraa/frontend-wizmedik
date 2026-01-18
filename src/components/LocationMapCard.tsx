import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface LocationMapCardProps {
  naziv: string;
  adresa: string;
  grad: string;
  latitude?: number;
  longitude?: number;
  googleMapsLink?: string;
  markerColor?: 'blue' | 'green' | 'violet' | 'gold' | 'orange';
}

// Fix for default marker icon
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function LocationMapCard({ 
  naziv, 
  adresa, 
  grad, 
  latitude, 
  longitude, 
  googleMapsLink,
  markerColor = 'blue'
}: LocationMapCardProps) {
  // Generate Google Maps link if not provided but coordinates exist
  const mapsLink = googleMapsLink || 
    (latitude && longitude 
      ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${naziv}, ${adresa}, ${grad}`)}`
    );

  const hasCoordinates = latitude && longitude;

  const getMarkerIcon = () => {
    return new Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColor}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Lokacija
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasCoordinates ? (
          <div className="rounded-lg overflow-hidden border h-[250px]">
            <MapContainer
              center={[latitude, longitude]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[latitude, longitude]} icon={getMarkerIcon()}>
                <Popup>
                  <div className="p-1">
                    <p className="font-semibold">{naziv}</p>
                    <p className="text-sm text-gray-600">{adresa}, {grad}</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        ) : (
          <div className="bg-muted/30 rounded-lg p-6 text-center">
            <MapPin className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {adresa}, {grad}
            </p>
          </div>
        )}

        <Button 
          asChild 
          className="w-full" 
          variant="outline"
        >
          <a 
            href={mapsLink} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Vodi me do lokacije
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

export default LocationMapCard;
