import React, { useState } from 'react';
import { RideRequest, Ride } from '../types/ride';
import { 
  MessageSquare, 
  MapPin, 
  Check, 
  X, 
  Send, 
  CheckCircle2, 
  Phone
} from 'lucide-react';

interface NegotiationsPanelProps {
  requests: RideRequest[];
  rides: Ride[];
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  onCounterOffer: (requestId: string, amount: number, note: string) => void;
  onPassengerAcceptCounter: (requestId: string) => void;
}

export const NegotiationsPanel: React.FC<NegotiationsPanelProps> = ({
  requests,
  rides,
  onAcceptRequest,
  onDeclineRequest,
  onCounterOffer,
  onPassengerAcceptCounter,
}) => {
  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    requests[0]?.id || ''
  );
  const [counterPrice, setCounterPrice] = useState<number>(250);
  const [counterNote, setCounterNote] = useState<string>('');
  const [viewRole, setViewRole] = useState<'driver' | 'passenger'>('driver');

  const selectedRequest = requests.find((r) => r.id === selectedRequestId) || requests[0];
  const relatedRide = selectedRequest ? rides.find((r) => r.id === selectedRequest.rideId) : null;

  const handleSendCounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    onCounterOffer(selectedRequest.id, counterPrice, counterNote);
    setCounterNote('');
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-20 liquid-glass rounded-[1.5rem] p-8 max-w-xl mx-auto my-12">
        <MessageSquare className="w-12 h-12 text-white/30 mx-auto mb-3" />
        <h3 className="text-lg font-heading italic text-white mb-1">No Active Negotiations Yet</h3>
        <p className="text-sm text-white/60 mb-6 font-body">
          When companions request lifts or bargain on fares, the offers and counter-offers will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-24 font-body max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Role Perspective Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-[1.25rem] liquid-glass border border-white/15">
        <div>
          <h2 className="text-xl font-heading italic text-white flex items-center gap-2">
            <span>Bargaining & Lift Requests Hub</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/20 font-body">
              Interactive Mode
            </span>
          </h2>
          <p className="text-xs text-white/70 mt-0.5 font-body">
            Test how companion requests, custom drop-offs, and fare bargains work from both perspectives.
          </p>
        </div>

        {/* Perspective toggle */}
        <div className="flex items-center bg-black/60 p-1 rounded-full border border-white/20 text-xs font-medium">
          <button
            onClick={() => setViewRole('driver')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              viewRole === 'driver'
                ? 'bg-white text-black font-bold shadow'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Driver Perspective
          </button>
          <button
            onClick={() => setViewRole('passenger')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              viewRole === 'passenger'
                ? 'bg-white text-black font-bold shadow'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Passenger Perspective
          </button>
        </div>
      </div>

      {/* Main 2-Column Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of Requests */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-white/60 uppercase tracking-wider px-1">
            Active Requests ({requests.length})
          </div>

          {requests.map((req) => {
            const ride = rides.find((r) => r.id === req.rideId);
            const isSelected = req.id === selectedRequestId;
            const diff = req.originalFare - req.offeredFare;

            return (
              <div
                key={req.id}
                onClick={() => {
                  setSelectedRequestId(req.id);
                  setCounterPrice(req.counterOfferFare || Math.round((req.originalFare + req.offeredFare) / 2));
                }}
                className={`p-4 rounded-[1.25rem] cursor-pointer border transition-all ${
                  isSelected
                    ? 'liquid-glass-strong border-white/40 shadow-xl'
                    : 'liquid-glass hover:border-white/20 text-white/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={req.passengerAvatar}
                      alt={req.passengerName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-white/20"
                    />
                    <div>
                      <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                        <span>{req.passengerName}</span>
                        <span className="text-[10px] text-white/50">({req.createdAt})</span>
                      </div>
                      <div className="text-xs text-white/60 flex items-center gap-1 mt-0.5">
                        <span>Ride with {ride?.driver.name || 'Driver'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {req.status === 'pending' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/25">
                        Pending Offer
                      </span>
                    )}
                    {req.status === 'countered' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-400/15 text-indigo-300 border border-indigo-400/25">
                        Countered (₹{req.counterOfferFare})
                      </span>
                    )}
                    {req.status === 'accepted' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/15 text-emerald-300 border border-emerald-400/25 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        Accepted
                      </span>
                    )}
                    {req.status === 'declined' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-400/15 text-rose-300 border border-rose-400/25">
                        Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Drop-off & Price snippet */}
                <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-white/80 truncate max-w-[200px]">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{req.requestedDropoff}</span>
                    {req.isCustomDropoff && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-white/90 border border-white/15">
                        On Route
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-white text-sm">₹{req.offeredFare}</span>
                    {diff > 0 ? (
                      <span className="text-[10px] text-emerald-300 ml-1.5">
                        (Rider asked ₹{req.originalFare})
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/50 ml-1.5">
                        (Full fare)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Negotiation Details & Action Pane */}
        {selectedRequest && (
          <div className="lg:col-span-7 liquid-glass-strong rounded-[1.5rem] border border-white/20 p-5 sm:p-6 space-y-5">
            {/* Header: Passenger & Route Details */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={selectedRequest.passengerAvatar}
                  alt={selectedRequest.passengerName}
                  className="w-12 h-12 rounded-full object-cover ring-1 ring-white/30"
                />
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    {selectedRequest.passengerName}
                    <span className="text-xs font-normal text-white/60">
                      ★ {selectedRequest.passengerRating}
                    </span>
                  </h3>
                  <div className="text-xs text-white/70 mt-0.5">
                    Requested lift for route: <strong className="text-white">{relatedRide?.origin} → {relatedRide?.destination}</strong>
                  </div>
                </div>
              </div>

              {/* Status indicator */}
              <div className="text-right">
                <div className="text-xs text-white/50">Current Status</div>
                <div className="font-bold text-sm capitalize text-white mt-0.5">
                  {selectedRequest.status}
                </div>
              </div>
            </div>

            {/* Route & Dropoff comparison card */}
            <div className="p-4 rounded-xl liquid-glass border border-white/10 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Rider's Route:</span>
                <span className="text-white/90 font-medium">
                  {relatedRide?.origin} → {relatedRide?.destination}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Requested Pickup:</span>
                <span className="text-white font-medium">
                  {selectedRequest.pickupLocation}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Requested Drop-off:</span>
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <span>{selectedRequest.requestedDropoff}</span>
                  {selectedRequest.isCustomDropoff && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 text-white border border-white/20">
                      Intermediate Stop
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bargain Numbers breakdown */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl liquid-glass border border-white/10">
                <div className="text-[11px] text-white/60">Original Fare</div>
                <div className="text-base font-bold text-white mt-1">
                  ₹{selectedRequest.originalFare}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/10 border border-white/20">
                <div className="text-[11px] text-white/80 font-medium">Passenger Offer</div>
                <div className="text-lg font-bold text-white mt-1">
                  ₹{selectedRequest.offeredFare}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] text-white/60 font-medium">Driver Counter</div>
                <div className="text-base font-bold text-white mt-1">
                  {selectedRequest.counterOfferFare ? `₹${selectedRequest.counterOfferFare}` : 'None yet'}
                </div>
              </div>
            </div>

            {/* Negotiation History & Messages */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                Offer Discussion & Timeline
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-black/60 border border-white/10">
                {selectedRequest.history.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col text-xs p-2.5 rounded-lg ${
                      item.sender === 'passenger'
                        ? 'bg-white/5 text-white/90 mr-8 border border-white/10'
                        : 'bg-white/15 text-white ml-8 border border-white/25'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-white/50 mb-1">
                      <span className="font-semibold capitalize text-white/80">
                        {item.sender === 'passenger' ? selectedRequest.passengerName : relatedRide?.driver.name || 'Driver'}
                      </span>
                      <span>{item.timestamp}</span>
                    </div>
                    <div>{item.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons based on Active Role & Status */}
            {selectedRequest.status === 'accepted' ? (
              <div className="p-4 rounded-xl bg-white/10 border border-white/25 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-bold text-sm">Ride Lift Confirmed!</div>
                    <div className="text-xs text-white/70">
                      Final Agreed Fare: ₹{selectedRequest.counterOfferFare || selectedRequest.offeredFare} • Ready for departure
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Calling companion at +91 98765 43210`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Companion</span>
                </button>
              </div>
            ) : selectedRequest.status === 'declined' ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
                This request was declined. No further negotiation.
              </div>
            ) : viewRole === 'driver' ? (
              /* Driver Actions */
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="text-xs font-semibold text-white/80">
                  Driver Response Options:
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  {/* Accept offer as-is */}
                  <button
                    onClick={() => onAcceptRequest(selectedRequest.id)}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-white/90 text-black font-bold text-xs transition-all shadow-md"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Accept ₹{selectedRequest.offeredFare}</span>
                  </button>

                  {/* Decline */}
                  <button
                    onClick={() => onDeclineRequest(selectedRequest.id)}
                    className="px-4 py-2.5 rounded-full border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Counter offer subform */}
                <form onSubmit={handleSendCounter} className="p-3.5 rounded-xl liquid-glass border border-white/10 space-y-2.5">
                  <div className="text-xs font-medium text-white/80 flex items-center justify-between">
                    <span>Or Propose a Counter-Offer:</span>
                    <span className="text-white font-bold">₹{counterPrice}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step={10}
                      value={counterPrice}
                      onChange={(e) => setCounterPrice(Number(e.target.value))}
                      className="w-28 px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-xs font-bold text-white focus:outline-none focus:border-white"
                    />
                    <input
                      type="text"
                      placeholder="Optional note e.g. 'Heavy traffic on route'"
                      value={counterNote}
                      onChange={(e) => setCounterNote(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1 shrink-0"
                    >
                      <Send className="w-3 h-3" />
                      <span>Counter</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Passenger Actions */
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="text-xs font-semibold text-white/80">
                  Passenger Decision:
                </div>

                {selectedRequest.status === 'countered' && selectedRequest.counterOfferFare ? (
                  <div className="p-4 rounded-xl liquid-glass border border-white/20 space-y-3">
                    <div className="text-xs text-white/80">
                      The rider proposed a counter-offer of <strong className="text-white text-sm">₹{selectedRequest.counterOfferFare}</strong>.
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onPassengerAcceptCounter(selectedRequest.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-white/90 text-black font-bold text-xs"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Agree to ₹{selectedRequest.counterOfferFare}</span>
                      </button>
                      <button
                        onClick={() => onDeclineRequest(selectedRequest.id)}
                        className="px-3 py-2 rounded-full border border-white/20 text-white/70 text-xs hover:bg-white/10"
                      >
                        Pass
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl liquid-glass border border-white/10 text-xs text-white/70 flex items-center justify-between">
                    <span>Waiting for rider to review your offer of ₹{selectedRequest.offeredFare}...</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 font-semibold text-[10px]">
                      Pending
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
