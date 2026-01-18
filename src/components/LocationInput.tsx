import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ExternalLink, Navigation, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LocationInputProps {
  latitude?: number | null;
  longitude?: number | null;
  googleMapsLink?: string | null;
  onLocationChange: (data: {
    latitude: number | null;
    longitude: number | null;
    google_maps_link: string | null;
  }) => void;
  disabled?: boolean;
}

export function LocationInput({
  latitude,
  longitude,
  googleMapsLink,
  onLocationChange,
  disabled = false,
}: LocationInputProps) {
  const [lat, setLat] = useState<string>(latitude?.toString() || '');
  const [lng, setLng] = useState<string>(longitude?.toString() || '');
  const [mapsLink, setMapsLink] = useState<string>(googleMapsLink || '');
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLat(latitude?.toString() || '');
    setLng(longitude?.toString() || '');
    setMapsLink(googleMapsLink || '');
  }, [latitude, longitude, googleMapsLink]);

  // Extract coordinates from Google Maps link
  const extractFromGoogleMaps = () => {
    setError(null);
    setSuccess(null);
    setExtracting(true);

    try {
      if (!mapsLink) {
        setError('Unesite Google Maps link');
        setExtracting(false);
        return;
      }

      // Try different Google Maps URL formats
      let extractedLat: number | null = null;
      let extractedLng: number | null = null;

      // Format 1: @lat,lng,zoom
      const atMatch = mapsLink.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (atMatch) {
        extractedLat = parseFloat(atMatch[1]);
        extractedLng = parseFloat(atMatch[2]);
      }

      // Format 2: ?q=lat,lng or place/lat,lng
      if (!extractedLat) {
        const qMatch = mapsLink.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (qMatch) {
          extractedLat = parseFloat(qMatch[1]);
          extractedLng = parseFloat(qMatch[2]);
        }
      }

      // Format 3: /place/.../@lat,lng
      if (!extractedLat) {
        const placeMatch = mapsLink.match(/place\/[^/]+\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (placeMatch) {
          extractedLat = parseFloat(placeMatch[1]);
          extractedLng = parseFloat(placeMatch[2]);
        }
      }

      // Format 4: ll=lat,lng
      if (!extractedLat) {
        const llMatch = mapsLink.match(/ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (llMatch) {
          extractedLat = parseFloat(llMatch[1]);
          extractedLng = parseFloat(llMatch[2]);
        }
      }

      // Format 5: !3d lat !4d lng (embedded format)
      if (!extractedLat) {
        const embeddedMatch = mapsLink.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
        if (embeddedMatch) {
          extractedLat = parseFloat(embeddedMatch[1]);
          extractedLng = parseFloat(embeddedMatch[2]);
        }
      }

      if (extractedLat && extractedLng) {
        // Validate coordinates
        if (extractedLat >= -90 && extractedLat <= 90 && extractedLng >= -180 && extractedLng <= 180) {
          setLat(extractedLat.toFixed(6));
          setLng(extractedLng.toFixed(6));
          setSuccess('Koordinate uspješno izvučene iz linka!');
          
          onLocationChange({
            latitude: extractedLat,
            longitude: extractedLng,
            google_maps_link: mapsLink,
          });
        } else {
          setError('Izvučene koordinate nisu validne');
        }
      } else {
        setError('Nije moguće izvući koordinate iz ovog linka. Pokušajte kopirati link direktno sa Google Maps.');
      }
    } catch (e) {
      setError('Greška pri obradi linka');
    } finally {
      setExtracting(false);
    }
  };

  // Get current location using browser geolocation
  const getCurrentLocation = () => {
    setError(null);
    setSuccess(null);

    if (!navigator.geolocation) {
      setError('Vaš browser ne podržava geolokaciju');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = position.coords.latitude.toFixed(6);
        const newLng = position.coords.longitude.toFixed(6);
        setLat(newLat);
        setLng(newLng);
        setSuccess('Lokacija uspješno dohvaćena!');
        
        onLocationChange({
          latitude: parseFloat(newLat),
          longitude: parseFloat(newLng),
          google_maps_link: mapsLink || null,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Pristup lokaciji je odbijen. Omogućite pristup u postavkama browsera.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Informacije o lokaciji nisu dostupne.');
            break;
          case error.TIMEOUT:
            setError('Zahtjev za lokaciju je istekao.');
            break;
          default:
            setError('Greška pri dohvaćanju lokacije.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handle manual coordinate input
  const handleCoordinateChange = (field: 'lat' | 'lng', value: string) => {
    setError(null);
    setSuccess(null);

    if (field === 'lat') {
      setLat(value);
    } else {
      setLng(value);
    }

    const newLat = field === 'lat' ? value : lat;
    const newLng = field === 'lng' ? value : lng;

    const parsedLat = parseFloat(newLat);
    const parsedLng = parseFloat(newLng);

    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      onLocationChange({
        latitude: parsedLat,
        longitude: parsedLng,
        google_maps_link: mapsLink || null,
      });
    }
  };

  // Handle Google Maps link change
  const handleMapsLinkChange = (value: string) => {
    setMapsLink(value);
    setError(null);
    setSuccess(null);
  };

  // Open location in Google Maps
  const openInGoogleMaps = () => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    }
  };

  const hasValidCoordinates = lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Lokacija na mapi
        </CardTitle>
        <CardDescription>
          Unesite koordinate ručno, izvucite iz Google Maps linka ili koristite trenutnu lokaciju
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google Maps Link */}
        <div className="space-y-2">
          <Label htmlFor="google_maps_link">Google Maps Link</Label>
          <div className="flex gap-2">
            <Input
              id="google_maps_link"
              placeholder="https://www.google.com/maps/place/..."
              value={mapsLink}
              onChange={(e) => handleMapsLinkChange(e.target.value)}
              disabled={disabled}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={extractFromGoogleMaps}
              disabled={disabled || extracting || !mapsLink}
            >
              {extracting ? 'Izvlačim...' : 'Izvuci koordinate'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Kopirajte link sa Google Maps i kliknite "Izvuci koordinate"
          </p>
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude (širina)</Label>
            <Input
              id="latitude"
              type="text"
              placeholder="43.8563"
              value={lat}
              onChange={(e) => handleCoordinateChange('lat', e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude (dužina)</Label>
            <Input
              id="longitude"
              type="text"
              placeholder="18.4131"
              value={lng}
              onChange={(e) => handleCoordinateChange('lng', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            disabled={disabled}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Koristi moju lokaciju
          </Button>
          
          {hasValidCoordinates && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openInGoogleMaps}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Otvori na mapi
            </Button>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Preview */}
        {hasValidCoordinates && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Trenutne koordinate:</p>
            <p className="text-sm text-muted-foreground font-mono">
              {lat}, {lng}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LocationInput;
