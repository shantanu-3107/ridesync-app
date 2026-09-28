import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Search, 
  Navigation, 
  Compass, 
  ExternalLink, 
  Check, 
  LocateFixed, 
  Building2, 
  Plane, 
  Train 
} from 'lucide-react';

interface GoogleMapsLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialValue?: string;
  onSelectLocation: (selectedLocation: string) => void;
}

// Popular Transit & Commute Hubs categorized for convenience
const POPULAR_HUBS = [
  {
    category: 'Tech Parks & IT Corridors',
    icon: Building2,
    places: [
      'Manyata Tech Park, Bangalore',
      'Electronic City Phase 1, Bangalore',
      'DLF Cyber City, Gurugram',
      'HITEC City, Hyderabad',
      'Bandra Kurla Complex (BKC), Mumbai',
    ],
  },
  {
    category: 'Airports & Terminals',
    icon: Plane,
    places: [
      'Kempegowda International Airport (BLR)',
      'Indira Gandhi International Airport (DEL)',
      'Chhatrapati Shivaji Maharaj Airport (BOM)',
      'Rajiv Gandhi International Airport (HYD)',
    ],
  },
  {
    category: 'Metro & Railway Junctions',
    icon: Train,
    places: [
      'Indiranagar Metro Station, Bangalore',
      'Krantivira Sangolli Rayanna Railway Station, Bangalore',
      'Rajiv Chowk Metro Station, New Delhi',
      'Chhatrapati Shivaji Maharaj Terminus (CSMT), Mumbai',
    ],
  },
  {
    category: 'Popular Urban Hubs',
    icon: Compass,
    places: [
      'Koramangala 5th Block, Bangalore',
      'HSR Layout Sector 1, Bangalore',
      'Connaught Place, New Delhi',
      'Bandra Bandstand, Mumbai',
      'Jubilee Hills Check Post, Hyderabad',
    ],
  },
];

export const GoogleMapsLocationPickerModal: React.FC<GoogleMapsLocationPickerModalProps> = ({
  isOpen,
  onClose,
  title,
  initialValue = '',
  onSelectLocation,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [activeLocation, setActiveLocation] = useState(
    initialValue.trim() || 'Koramangala, Bangalore'
  );
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (initialValue.trim()) {
      setSearchQuery(initialValue);
      setActiveLocation(initialValue);
    }
  }, [initialValue]);

  // Handle address search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveLocation(searchQuery.trim());
      setLocateError(null);
    }
  };

  // Browser GPS Geolocation detection
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const coordsStr = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        const locationName = `Current Location (${coordsStr})`;
        setSearchQuery(locationName);
        setActiveLocation(`${latitude},${longitude}`);
      },
      (err) => {
        setIsLocating(false);
        setLocateError(`Unable to fetch location: ${err.message}. Please search manually.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Confirm and deliver back to caller
  const handleConfirm = () => {
    const finalLocation = searchQuery.trim() || activeLocation;
    if (finalLocation) {
      onSelectLocation(finalLocation);
      onClose();
    }
  };

  // Embedded Google Maps URL
  const embedMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    activeLocation
  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    activeLocation
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-body">
      <div className="relative w-full max-w-2xl rounded-[1.5rem] liquid-glass-strong border border-white/20 shadow-2xl p-5 sm:p-6 text-white my-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-heading italic text-white flex items-center gap-2">
                {title}
              </h2>
              <p className="text-xs text-white/60">
                Search, pick transit hubs, or detect your location with live Google Maps preview.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Search & GPS Location Bar */}
          <form onSubmit={handleSearch} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-white/50 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search landmark, street, colony, or station..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs sm:text-sm hover:bg-white/90 transition-colors whitespace-nowrap cursor-pointer"
              >
                Search
              </button>
            </div>

            {/* Detect Location Button */}
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={handleDetectCurrentLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 transition-all cursor-pointer"
              >
                <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Detecting GPS...' : 'Use My Current Location'}</span>
              </button>

              <a
                href={externalMapUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-white/60 hover:text-white transition-colors text-[11px]"
              >
                <span>Open in full Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {locateError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg">
                {locateError}
              </p>
            )}
          </form>

          {/* Interactive Google Maps Preview Frame */}
          <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black/40 shadow-inner h-60 sm:h-72">
            <iframe
              title="Google Map Location Preview"
              src={embedMapUrl}
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
              loading="lazy"
              allowFullScreen
            />
            {/* Overlay Pin Indicator */}
            <div className="absolute top-3 left-3 pointer-events-none liquid-glass-strong px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 border border-white/20 shadow-lg max-w-[85%] truncate">
              <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate font-medium text-white">{activeLocation}</span>
            </div>
          </div>

          {/* Popular Commute Hotspots & Hubs */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Popular Route Hubs & Landmarks
              </span>
              <span className="text-[11px] text-white/50">Click to preview & select</span>
            </div>

            <div className="space-y-2.5">
              {POPULAR_HUBS.map((category) => {
                const IconComponent = category.icon;
                return (
                  <div key={category.category} className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-white/60 font-medium">
                      <IconComponent className="w-3.5 h-3.5 text-white/70" />
                      <span>{category.category}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {category.places.map((place) => (
                        <button
                          key={place}
                          type="button"
                          onClick={() => {
                            setSearchQuery(place);
                            setActiveLocation(place);
                          }}
                          className={`px-2.5 py-1 text-xs rounded-lg border transition-all text-left truncate max-w-xs cursor-pointer ${
                            searchQuery === place || activeLocation === place
                              ? 'bg-white text-black font-semibold border-white shadow'
                              : 'bg-white/[0.04] border-white/10 text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {place}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="border-t border-white/10 pt-4 mt-4 flex items-center justify-between shrink-0">
          <div className="text-xs text-white/70 truncate max-w-[55%]">
            Selected: <strong className="text-white">{searchQuery || activeLocation}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full liquid-glass border border-white/15 text-xs font-medium text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 rounded-full bg-white text-black font-semibold text-xs sm:text-sm hover:bg-white/90 transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Check className="w-4 h-4 text-black" />
              <span>Confirm Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
