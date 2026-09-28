import React from 'react';
import { Ride } from '../types/ride';
import { 
  Car, 
  Bike, 
  MapPin, 
  Navigation, 
  Clock, 
  Calendar, 
  Star, 
  Users, 
  ArrowRight,
  Compass,
  ImageIcon
} from 'lucide-react';

interface RideCardProps {
  ride: Ride;
  onRequestRide: (ride: Ride) => void;
  onViewMap: (ride: Ride) => void;
}

export const RideCard: React.FC<RideCardProps> = ({ ride, onRequestRide, onViewMap }) => {
  const isBike = ride.vehicleType === 'bike';

  return (
    <div className="liquid-glass rounded-[1.25rem] p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:border-white/20 group">
      {/* Top Header: Driver info & Vehicle badge */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={ride.driver.avatar}
                alt={ride.driver.name}
                className="w-11 h-11 rounded-full object-cover ring-1 ring-white/20 group-hover:ring-white/40 transition-all"
              />
              <span className="absolute -bottom-1 -right-1 bg-black rounded-full px-1 py-0.2 flex items-center gap-0.5 border border-white/20 text-[10px] text-amber-300 font-semibold">
                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                {ride.driver.rating}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base leading-snug flex items-center gap-1.5 font-body">
                {ride.driver.name}
                <span className="text-[11px] text-white/60 font-normal">
                  ({ride.driver.totalTrips} trips)
                </span>
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-white/60 mt-0.5 font-body">
                <span>{ride.vehicleModel}</span>
                {ride.vehicleNumberPlate && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white/80 font-mono">
                    {ride.vehicleNumberPlate}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle & Seats Badge */}
          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-body ${
                isBike
                  ? 'bg-amber-400/10 text-amber-300 border border-amber-400/25'
                  : 'bg-indigo-400/10 text-indigo-300 border border-indigo-400/25'
              }`}
            >
              {isBike ? <Bike className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
              <span>{isBike ? 'Bike Pool' : 'Car Pool'}</span>
            </span>

            <div className="flex items-center gap-1 text-[11px] text-white/60 font-body">
              <Users className="w-3 h-3 text-white/50" />
              <span>
                <strong className="text-white font-medium">{ride.seatsAvailable}</strong> {ride.seatsAvailable === 1 ? 'seat' : 'seats'} left
              </span>
            </div>
          </div>
        </div>

        {/* Departure Time & Date + Map Trigger */}
        <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white/80 mb-4 font-body">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-white font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{ride.departureTime}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <div className="flex items-center gap-1.5 text-white/70">
              <Calendar className="w-3.5 h-3.5" />
              <span>{ride.date}</span>
            </div>
          </div>

          <button
            onClick={() => onViewMap(ride)}
            title="View route map & Google Maps navigation"
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-[11px] text-white font-medium transition-colors cursor-pointer"
          >
            <Compass className="w-3 h-3 text-emerald-400" />
            <span>Map</span>
          </button>
        </div>

        {/* Optional Uploaded Vehicle Image Preview Thumbnail */}
        {ride.vehicleImage && (
          <div className="relative mb-4 rounded-xl overflow-hidden border border-white/15 h-36 bg-black/40">
            <img
              src={ride.vehicleImage}
              alt={ride.vehicleModel}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] text-white font-medium flex items-center gap-1 border border-white/20">
              <ImageIcon className="w-3 h-3 text-emerald-400" />
              <span>Verified Vehicle</span>
            </div>
          </div>
        )}

        {/* Route Details */}
        <div className="space-y-2 mb-4">
          {/* Pickup */}
          <div className="flex items-start gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1.5 shrink-0 shadow-sm shadow-emerald-400/50" />
            <div className="text-sm text-white/95 font-medium leading-tight font-body">
              {ride.origin}
            </div>
          </div>

          {/* Intermediate Waypoints */}
          {ride.intermediateStops && ride.intermediateStops.length > 0 && (
            <div className="pl-1 border-l border-dashed border-white/20 ml-1 py-1 space-y-1.5">
              <div className="text-[11px] text-white/50 pl-3 font-body">
                Via (Can drop you along the way):
              </div>
              <div className="flex flex-wrap gap-1.5 pl-3">
                {ride.intermediateStops.map((stop, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/80 font-body"
                  >
                    <Navigation className="w-2.5 h-2.5 text-emerald-400 rotate-45" />
                    {stop}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Destination */}
          <div className="flex items-start gap-2.5">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-sm text-white/95 font-medium leading-tight font-body">
              {ride.destination}
            </div>
          </div>
        </div>

        {/* Rider Notes */}
        {ride.notes && (
          <p className="text-xs text-white/60 bg-white/[0.02] p-2.5 rounded-lg border border-white/5 mb-4 italic font-body">
            "{ride.notes}"
          </p>
        )}
      </div>

      {/* Footer: Price and CTA button */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 mt-2">
        <div>
          <div className="text-[11px] text-white/60 font-body">
            {ride.pricingModel === 'negotiable' ? 'Suggested Base' : 'Rider Fare'}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-heading italic text-white tracking-tight">₹{ride.fare}</span>
            <span className="text-xs text-white/60 font-body">/ seat</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewMap(ride)}
            className="p-2 rounded-full border border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="View Route Map"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={() => onRequestRide(ride)}
            className="liquid-glass-strong rounded-full px-4 py-2 flex items-center gap-1.5 text-xs font-semibold text-white hover:bg-white/15 transition-all group/btn cursor-pointer"
          >
            <span>Request / Bargain</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
