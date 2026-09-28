import React from 'react';
import { Ride } from '../types/ride';
import { 
  X, 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Car, 
  Bike, 
  Clock, 
  Compass
} from 'lucide-react';

interface RouteMapModalProps {
  ride: Ride | null;
  onClose: () => void;
}

export const RouteMapModal: React.FC<RouteMapModalProps> = ({ ride, onClose }) => {
  if (!ride) return null;

  // Format Google Maps Direction URL
  const waypointsParam =
    ride.intermediateStops && ride.intermediateStops.length > 0
      ? `&waypoints=${encodeURIComponent(ride.intermediateStops.join('|'))}`
      : '';

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    ride.origin
  )}&destination=${encodeURIComponent(ride.destination)}${waypointsParam}`;

  // Iframe search query for embedded map view
  const embedQuery = encodeURIComponent(`${ride.origin} to ${ride.destination}`);
  const embedMapUrl = `https://maps.google.com/maps?q=${embedQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-body">
      <div className="relative w-full max-w-2xl rounded-[1.5rem] liquid-glass-strong border border-white/20 shadow-2xl p-5 sm:p-7 text-white my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl liquid-glass border border-white/15 text-emerald-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-heading italic text-white flex items-center gap-2">
                Route & Navigation Map
              </h2>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <span className="flex items-center gap-1 font-medium">
                  {ride.vehicleType === 'bike' ? (
                    <Bike className="w-3.5 h-3.5 text-amber-300" />
                  ) : (
                    <Car className="w-3.5 h-3.5 text-indigo-300" />
                  )}
                  {ride.vehicleModel}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Clock className="w-3 h-3" />
                  {ride.departureTime} ({ride.date})
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Embedded Interactive Google Map */}
        <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-white/15 bg-black/80 mb-5 shadow-inner">
          <iframe
            title="Route Map"
            src={embedMapUrl}
            className="w-full h-full border-0 filter invert contrast-125 opacity-80"
            loading="lazy"
            allowFullScreen
          />
          <div className="absolute top-3 right-3 z-10">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all shadow-md"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3 h-3 text-emerald-400" />
            </a>
          </div>
        </div>

        {/* Route Waypoint Timeline */}
        <div className="space-y-3 p-4 rounded-xl liquid-glass border border-white/10 mb-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/70">
            Route Stations & Drop-Off Waypoints
          </div>

          <div className="space-y-2.5">
            {/* Origin */}
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 mt-1 shrink-0 ring-4 ring-emerald-400/20" />
              <div>
                <div className="text-xs text-white/50">Starting Point (Place A)</div>
                <div className="text-sm font-semibold text-white">{ride.origin}</div>
              </div>
            </div>

            {/* Intermediate stops */}
            {ride.intermediateStops && ride.intermediateStops.length > 0 && (
              <div className="pl-1.5 border-l border-dashed border-white/25 ml-1.5 py-1 space-y-2">
                <div className="text-[11px] text-white/50 pl-3.5">
                  Intermediate Route Waypoints:
                </div>
                {ride.intermediateStops.map((stop, idx) => (
                  <div key={idx} className="flex items-center gap-2 pl-3.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400 rotate-45 shrink-0" />
                    <span className="text-xs text-white/90 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                      {stop}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Destination */}
            <div className="flex items-start gap-3">
              <MapPin className="w-3.5 h-3.5 text-rose-400 mt-1 shrink-0" />
              <div>
                <div className="text-xs text-white/50">Final Destination (Place B)</div>
                <div className="text-sm font-semibold text-white">{ride.destination}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Vehicle Image & Driver Card */}
        {ride.vehicleImage && (
          <div className="p-3.5 rounded-xl liquid-glass border border-white/10 mb-5 flex items-center gap-4">
            <img
              src={ride.vehicleImage}
              alt={ride.vehicleModel}
              className="w-20 h-16 object-cover rounded-lg border border-white/20 shadow-md"
            />
            <div>
              <div className="text-xs text-white/60">Verified Vehicle Photo</div>
              <div className="text-sm font-bold text-white">{ride.vehicleModel}</div>
              {ride.vehicleNumberPlate && (
                <div className="text-xs text-white/80 font-mono mt-0.5">{ride.vehicleNumberPlate}</div>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-white/60">
            Fare: <strong className="text-white text-sm font-heading italic">₹{ride.fare}</strong> / seat
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-white/20 text-xs text-white/80 hover:bg-white/10 transition-colors"
            >
              Close
            </button>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 transition-all shadow-lg"
            >
              <span>Start Navigation in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
