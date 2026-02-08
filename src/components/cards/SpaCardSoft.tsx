import { Link } from 'react-router-dom';
import { MapPin, Star, Droplet, Heart, Phone, Globe, Bed, Calendar } from 'lucide-react';
import { Banja } from '@/types/spa';

interface SpaCardSoftProps {
  banja: Banja;
}

export default function SpaCardSoft({ banja }: SpaCardSoftProps) {
  return (
    <Link
      to={`/banja/${banja.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-cyan-50 to-teal-50">
        {banja.featured_slika ? (
          <img
            src={banja.featured_slika}
            alt={banja.naziv}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Droplet className="w-16 h-16 text-cyan-300" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {banja.verifikovan && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-lg">
              <Heart className="w-3 h-3" />
              Verifikovano
            </span>
          )}
          {banja.medicinski_nadzor && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-500 text-white text-xs font-medium rounded-full shadow-lg">
              Medicinski nadzor
            </span>
          )}
        </div>

        {/* Rating - Disabled for now, can be enabled later */}
        {/* {banja.broj_recenzija > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-900">
              {Number(banja.prosjecna_ocjena).toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">
              ({banja.broj_recenzija})
            </span>
          </div>
        )} */}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors line-clamp-1">
          {banja.naziv}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{banja.grad}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {banja.opis}
        </p>

        {/* Vrste */}
        {banja.vrste && banja.vrste.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {banja.vrste.slice(0, 3).map((vrsta) => (
              <span
                key={vrsta.id}
                className="inline-flex items-center px-2.5 py-1 bg-cyan-50 text-cyan-700 text-xs font-medium rounded-lg"
              >
                {vrsta.naziv}
              </span>
            ))}
            {banja.vrste.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                +{banja.vrste.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Features */}
        <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
          {banja.ima_smjestaj && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Bed className="w-4 h-4" />
              <span>Smještaj</span>
            </div>
          )}
          {banja.online_rezervacija && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Online rezervacija</span>
            </div>
          )}
          {banja.telefon && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Phone className="w-4 h-4" />
              <span>Kontakt</span>
            </div>
          )}
          {banja.website && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Globe className="w-4 h-4" />
              <span>Website</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
