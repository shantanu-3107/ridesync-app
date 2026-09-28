import React, { useState, useEffect } from 'react';
import { Ride, RideRequest, UserProfile } from '../types/ride';
import { 
  X, 
  MapPin, 
  Navigation, 
  Bike, 
  Car, 
  Send
} from 'lucide-react';

interface BargainModalProps {
  ride: Ride | null;
  onClose: () => void;
  onSubmitRequest: (request: Omit<RideRequest, 'id' | 'createdAt' | 'history'>) => void;
  user: UserProfile;
}

export const BargainModal: React.FC<BargainModalProps> = ({
  ride,
  onClose,
  onSubmitRequest,
  user,
}) => {
  if (!ride) return null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Drop-off selection
  const [dropoffType, setDropoffType] = useState<'destination' | 'intermediate' | 'custom'>('destination');
  const [selectedIntermediate, setSelectedIntermediate] = useState(
    ride.intermediateStops[0] || ''
  );
  const [customDropoff, setCustomDropoff] = useState('');

  // Fare negotiation
  const [isBargaining, setIsBargaining] = useState(ride.pricingModel === 'negotiable');
  const [offeredFare, setOfferedFare] = useState<number>(
    ride.pricingModel === 'negotiable' ? Math.round(ride.fare * 0.85) : ride.fare
  );
  const [pickupNote, setPickupNote] = useState(ride.origin);
  const [message, setMessage] = useState('');

  const finalDropoff = 
    dropoffType === 'destination' 
      ? ride.destination 
      : dropoffType === 'intermediate'
      ? selectedIntermediate
      : customDropoff.trim() || ride.destination;

  const isCustomDrop = dropoffType !== 'destination';

  // Quick discount buttons
  const applyDiscount = (percentage: number) => {
    const discounted = Math.max(20, Math.round(ride.fare * (1 - percentage / 100)));
    setOfferedFare(discounted);
    setIsBargaining(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmitRequest({
      rideId: ride.id,
      passengerName: user.name || 'You (Passenger)',
      passengerAvatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      passengerRating: user.rating || 5.0,
      pickupLocation: pickupNote || ride.origin,
      requestedDropoff: finalDropoff,
      isCustomDropoff: isCustomDrop,
      offeredFare: isBargaining ? offeredFare : ride.fare,
      originalFare: ride.fare,
      pricingModel: ride.pricingModel,
      status: 'pending',
      message: message.trim() || (isBargaining ? `Offered ₹${offeredFare} for lift to ${finalDropoff}` : 'Ready to join ride at your posted fare!'),
    });

    onClose();
  };

  const savings = ride.fare - offeredFare;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-[1.5rem] liquid-glass-strong p-6 sm:p-7 text-white my-8 border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <img
              src={ride.driver.avatar}
              alt={ride.driver.name}
              className="w-12 h-12 rounded-full object-cover ring-1 ring-white/30"
            />
            <div>
              <h2 className="text-lg font-heading italic text-white flex items-center gap-2">
                Join {ride.driver.name}'s Lift
              </h2>
              <div className="flex items-center gap-2 text-xs text-white/70 font-body">
                <span className="flex items-center gap-1">
                  {ride.vehicleType === 'bike' ? <Bike className="w-3.5 h-3.5 text-amber-300" /> : <Car className="w-3.5 h-3.5 text-indigo-300" />}
                  {ride.vehicleModel}
                </span>
                <span>•</span>
                <span className="text-white font-medium">{ride.departureTime}</span>
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

        <form onSubmit={handleSubmit} className="space-y-5 font-body">
          {/* Section 1: Drop-off Location */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider flex items-center justify-between">
              <span>Where should the rider drop you?</span>
              <span className="text-[11px] text-emerald-400 font-normal">Along the route</span>
            </label>

            {/* Drop-off options radio */}
            <div className="space-y-2">
              {/* Option 1: Destination */}
              <label 
                onClick={() => setDropoffType('destination')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  dropoffType === 'destination'
                    ? 'bg-white/15 border-white/40 text-white'
                    : 'bg-white/[0.02] border-white/10 text-white/70 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2.5 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Final Destination: {ride.destination}</span>
                </div>
                <input
                  type="radio"
                  name="dropoff"
                  checked={dropoffType === 'destination'}
                  onChange={() => setDropoffType('destination')}
                  className="accent-white"
                />
              </label>

              {/* Option 2: Intermediate stop along route */}
              {ride.intermediateStops && ride.intermediateStops.length > 0 && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                  <label 
                    onClick={() => setDropoffType('intermediate')}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 text-sm font-medium text-white/90">
                      <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Drop me at a stop along the route</span>
                    </div>
                    <input
                      type="radio"
                      name="dropoff"
                      checked={dropoffType === 'intermediate'}
                      onChange={() => setDropoffType('intermediate')}
                      className="accent-white"
                    />
                  </label>

                  {dropoffType === 'intermediate' && (
                    <div className="pt-2 pl-6 flex flex-wrap gap-1.5">
                      {ride.intermediateStops.map((stop) => (
                        <button
                          key={stop}
                          type="button"
                          onClick={() => setSelectedIntermediate(stop)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            selectedIntermediate === stop
                              ? 'bg-white text-black font-semibold'
                              : 'bg-white/10 text-white/80 hover:bg-white/20'
                          }`}
                        >
                          {stop}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Option 3: Custom on-route landmark */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                <label 
                  onClick={() => setDropoffType('custom')}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 text-sm font-medium text-white/90">
                    <Navigation className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>Custom landmark / street along the way</span>
                  </div>
                  <input
                    type="radio"
                    name="dropoff"
                    checked={dropoffType === 'custom'}
                    onChange={() => setDropoffType('custom')}
                    className="accent-white"
                  />
                </label>

                {dropoffType === 'custom' && (
                  <div className="pt-2 pl-6">
                    <input
                      type="text"
                      placeholder="e.g. Near Metro Gate 2, or Flyover Junction"
                      value={customDropoff}
                      onChange={(e) => setCustomDropoff(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white"
                      required={dropoffType === 'custom'}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Fare & Bargaining */}
          <div className="space-y-3 p-4 rounded-xl liquid-glass border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Rider's Fare
                </span>
                <div className="text-xl font-heading italic text-white">₹{ride.fare}</div>
              </div>

              {/* Bargaining toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/80">Bargain / Propose Fare:</span>
                <button
                  type="button"
                  onClick={() => setIsBargaining(!isBargaining)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    isBargaining ? 'bg-white justify-end' : 'bg-white/20 justify-start'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full shadow-md ${isBargaining ? 'bg-black' : 'bg-white'}`} />
                </button>
              </div>
            </div>

            {/* Bargain Controls */}
            {isBargaining ? (
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/80">Your Offered Price:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-heading italic text-white">₹{offeredFare}</span>
                    {savings > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 font-medium">
                        Save ₹{savings}
                      </span>
                    )}
                  </div>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min={Math.round(ride.fare * 0.4)}
                  max={ride.fare + 50}
                  step={10}
                  value={offeredFare}
                  onChange={(e) => setOfferedFare(Number(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                />

                {/* Quick discount chips */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-[11px] text-white/60">Quick Bargain:</span>
                  <button
                    type="button"
                    onClick={() => applyDiscount(10)}
                    className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white"
                  >
                    -10% (₹{Math.round(ride.fare * 0.9)})
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDiscount(20)}
                    className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white"
                  >
                    -20% (₹{Math.round(ride.fare * 0.8)})
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDiscount(30)}
                    className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white"
                  >
                    -30% (₹{Math.round(ride.fare * 0.7)})
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/60 pt-1 border-t border-white/10">
                You will pay the rider's requested fare of <strong className="text-white">₹{ride.fare}</strong> upon drop-off.
              </p>
            )}
          </div>

          {/* Section 3: Note to Driver */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider">
              Pickup Point & Message for Driver
            </label>
            <input
              type="text"
              placeholder={`Exact pickup spot (Default: ${ride.origin})`}
              value={pickupNote}
              onChange={(e) => setPickupNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white"
            />
            <textarea
              rows={2}
              placeholder="e.g. 'Hey, I will be standing near the metro gate with a small backpack.'"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-white/20 text-sm text-white/70 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black font-bold text-sm hover:bg-white/90 active:scale-95 transition-all shadow-lg"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isBargaining ? `Send Offer (₹${offeredFare})` : `Request Lift (₹${ride.fare})`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
