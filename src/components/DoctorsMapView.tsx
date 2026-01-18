import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatRating } from '@/utils/formatters';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Create custom colored markers for better visibility
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">🏥</div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

interface Doctor {
  id: string;
  slug?: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  location: string;
  phone: string;
  acceptsOnline: boolean;
  latitude?: number;
  longitude?: number;
}

interface DoctorsMapViewProps {
  doctors: Doctor[];
  className?: string;
}

// Approximate coordinates for major cities in Bosnia and Herzegovina
const cityCoordinates: Record<string, [number, number]> = {
  'Sarajevo': [43.8563, 18.4131],
  'Banja Luka': [44.7722, 17.1910],
  'Tuzla': [44.5384, 18.6697],
  'Zenica': [44.2034, 17.9072],
  'Mostar': [43.3438, 17.8078],
  'Bihać': [44.8169, 15.8708],
  'Brčko': [44.8720, 18.8108],
  'Prijedor': [44.9799, 16.7142],
  'Trebinje': [42.7125, 18.3439],
  'Bijeljina': [44.7586, 19.2142],
  'Cazin': [44.9667, 15.9428],
  'Gradačac': [44.8786, 18.4289],
  'Gračanica': [44.7031, 18.3111],
  'Živinice': [44.4489, 18.6486],
  'Lukavac': [44.5378, 18.5281],
  'Kakanj': [44.1322, 18.1211],
  'Visoko': [43.9892, 18.1797],
  'Goražde': [43.6678, 18.9761],
  'Konjic': [43.6519, 17.9619],
  'Travnik': [44.2256, 17.6656],
};

export function DoctorsMapView({ doctors, className = '' }: DoctorsMapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map centered on Bosnia and Herzegovina
    const map = L.map(containerRef.current).setView([43.9159, 17.6791], 8);
    mapRef.current = map;

    // Add OpenStreetMap tiles with a nice style
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each doctor with coordinates
    doctors.forEach((doctor) => {
      let lat: number;
      let lng: number;

      // Use doctor's actual coordinates if available, otherwise fallback to city coordinates
      if (doctor.latitude && doctor.longitude) {
        lat = doctor.latitude;
        lng = doctor.longitude;
      } else {
        const coords = cityCoordinates[doctor.location];
        if (!coords) return;
        [lat, lng] = coords;
        // Add small random offset when using city coordinates to prevent overlap
        lat += (Math.random() - 0.5) * 0.01;
        lng += (Math.random() - 0.5) * 0.01;
      }

      // Ensure rating is a number
      const rating = Number(doctor.rating) || 0;
      const reviewCount = Number(doctor.reviewCount) || 0;
      
      const color = rating >= 4.5 ? '#10b981' : rating >= 4 ? '#3b82f6' : '#8b5cf6';
      const marker = L.marker([lat, lng], {
        icon: createCustomIcon(color),
      }).addTo(mapRef.current!);

      const profileUrl = doctor.slug ? `/doktor/${doctor.slug}` : `/doctor/${doctor.id}`;

      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
            ${doctor.name}
          </h3>
          <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
            ${doctor.specialty}
          </p>
          <div style="display: flex; align-items: center; gap: 4px; margin: 8px 0;">
            <span style="color: #f59e0b; font-size: 16px;">⭐</span>
            <span style="font-weight: 600; color: #1f2937;">${formatRating(rating)}</span>
            <span style="color: #9ca3af; font-size: 12px;">(${reviewCount})</span>
          </div>
          <p style="margin: 4px 0; color: #6b7280; font-size: 13px;">
            📍 ${doctor.location}
          </p>
          <p style="margin: 4px 0; color: #6b7280; font-size: 13px;">
            📞 ${doctor.phone}
          </p>
          ${doctor.acceptsOnline ? 
            '<span style="display: inline-block; background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-top: 4px;">💻 Online konsultacije</span>' 
            : ''
          }
          <button 
            onclick="window.location.href='${profileUrl}'"
            style="
              width: 100%;
              margin-top: 12px;
              padding: 8px 16px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 500;
              font-size: 14px;
              transition: transform 0.2s;
            "
            onmouseover="this.style.transform='scale(1.02)'"
            onmouseout="this.style.transform='scale(1)'"
          >
            Pogledaj profil
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers if there are any
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [doctors, navigate]);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={containerRef} 
        className="w-full h-[600px] rounded-lg shadow-strong border border-border"
      />
      <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm p-3 rounded-lg shadow-medium border border-border z-[1000]">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-foreground">Ocjena 4.5+</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-foreground">Ocjena 4.0+</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-foreground">Ocjena {'<'} 4.0</span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-medium border border-border z-[1000]">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{doctors.length}</span> doktora na mapi
        </p>
      </div>
    </div>
  );
}
