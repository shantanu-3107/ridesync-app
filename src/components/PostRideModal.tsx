import React, { useState } from 'react';
import { Ride, VehicleType } from '../types/ride';
import { 
  X, 
  Car, 
  Bike, 
  MapPin, 
  Navigation, 
  Plus, 
  Trash2, 
  Check,
  Upload,
  Clock,
  ImageIcon,
  Compass
} from 'lucide-react';
import { GoogleMapsLocationPickerModal } from './GoogleMapsLocationPickerModal';

interface PostRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostRide: (ride: Ride) => void;
  userAvatar?: string;
  userName?: string;
}

export const PostRideModal: React.FC<PostRideModalProps> = ({
  isOpen,
  onClose,
  onPostRide,
  userAvatar,
  userName,
}) => {
  if (!isOpen) return null;

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [intermediateStops, setIntermediateStops] = useState<string[]>(['']);
  const [vehicleType, setVehicleType] = useState<VehicleType>('bike');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumberPlate, setVehicleNumberPlate] = useState('');
  const [vehicleImage, setVehicleImage] = useState<string>('');
  const [seatsAvailable, setSeatsAvailable] = useState<number>(1);
  
  // Departure Clock state
  const [depHour, setDepHour] = useState('06');
  const [depMinute, setDepMinute] = useState('30');
  const [depPeriod, setDepPeriod] = useState<'AM' | 'PM'>('PM');
  const [date, setDate] = useState('Today');
  const [pricingModel, setPricingModel] = useState<'fixed' | 'negotiable'>('fixed');
  const [fare, setFare] = useState<number>(150);
  const [notes, setNotes] = useState('');

  // Google Maps Location Picker state
  const [mapPickerTarget, setMapPickerTarget] = useState<
    'origin' | 'destination' | { stopIndex: number } | null
  >(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mapPickerTarget !== null) {
          setMapPickerTarget(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, mapPickerTarget]);

  const getPickerTitle = () => {
    if (mapPickerTarget === 'origin') return 'Select Place A (Starting Point) on Google Maps';
    if (mapPickerTarget === 'destination') return 'Select Place B (Final Destination) on Google Maps';
    if (typeof mapPickerTarget === 'object' && mapPickerTarget !== null) {
      return `Select Route Stop #${mapPickerTarget.stopIndex + 1} on Google Maps`;
    }
    return 'Select Location on Google Maps';
  };

  const getPickerInitialValue = () => {
    if (mapPickerTarget === 'origin') return origin;
    if (mapPickerTarget === 'destination') return destination;
    if (typeof mapPickerTarget === 'object' && mapPickerTarget !== null) {
      return intermediateStops[mapPickerTarget.stopIndex] || '';
    }
    return '';
  };

  const handleConfirmLocation = (loc: string) => {
    if (mapPickerTarget === 'origin') {
      setOrigin(loc);
    } else if (mapPickerTarget === 'destination') {
      setDestination(loc);
    } else if (typeof mapPickerTarget === 'object' && mapPickerTarget !== null) {
      handleUpdateStop(mapPickerTarget.stopIndex, loc);
    }
    setMapPickerTarget(null);
  };

  const departureTime = `${depHour}:${depMinute} ${depPeriod}`;

  // Vehicle image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVehicleImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const vehiclePresets = vehicleType === 'bike' ? [
    { name: 'Classic 350', url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=300&auto=format&fit=crop&q=80' },
    { name: 'Duke / Sport', url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=300&auto=format&fit=crop&q=80' },
    { name: 'City Scooter', url: 'https://images.unsplash.com/photo-1593764592116-bfb2a97c642a?w=300&auto=format&fit=crop&q=80' },
  ] : [
    { name: 'Modern SUV', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=300&auto=format&fit=crop&q=80' },
    { name: 'Sedan', url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=300&auto=format&fit=crop&q=80' },
    { name: 'Hatchback', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=300&auto=format&fit=crop&q=80' },
  ];

  // Handle waypoint additions & deletions
  const handleAddStop = () => {
    setIntermediateStops([...intermediateStops, '']);
  };

  const handleUpdateStop = (index: number, val: string) => {
    const updated = [...intermediateStops];
    updated[index] = val;
    setIntermediateStops(updated);
  };

  const handleRemoveStop = (index: number) => {
    setIntermediateStops(intermediateStops.filter((_, i) => i !== index));
  };

  // Handle vehicle type change
  const handleVehicleChange = (type: VehicleType) => {
    setVehicleType(type);
    if (type === 'bike') {
      setSeatsAvailable(1);
      if (!vehicleModel) setVehicleModel('Royal Enfield Classic');
    } else {
      setSeatsAvailable(3);
      if (!vehicleModel) setVehicleModel('Hyundai Creta');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!origin.trim() || !destination.trim()) return;

    const validStops = intermediateStops
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newRide: Ride = {
      id: `ride-${Date.now()}`,
      driver: {
        name: userName || 'You (Rider)',
        avatar: userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        rating: 5.0,
        totalTrips: 1,
      },
      origin: origin.trim(),
      destination: destination.trim(),
      intermediateStops: validStops,
      date,
      departureTime,
      vehicleType,
      vehicleModel: vehicleModel.trim() || (vehicleType === 'bike' ? 'Motorcycle' : 'Sedan Car'),
      vehicleNumberPlate: vehicleNumberPlate.trim() || undefined,
      vehicleImage: vehicleImage || undefined,
      seatsAvailable,
      totalSeats: seatsAvailable,
      fare: Number(fare) || 100,
      pricingModel,
      notes: notes.trim() || (vehicleType === 'bike' ? 'Helmet provided for companion.' : 'Comfortable AC ride.'),
    };

    onPostRide(newRide);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-body">
      <div className="relative w-full max-w-xl rounded-[1.5rem] liquid-glass-strong border border-white/20 shadow-2xl p-6 sm:p-7 text-white my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div>
            <h2 className="text-xl font-heading italic text-white flex items-center gap-2">
              <span>Offer a Lift as Rider</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/25">
                Rider Mode
              </span>
            </h2>
            <p className="text-xs text-white/60 mt-0.5">
              Share your route, upload vehicle details, and pick up verified companions.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vehicle Selection: Bike or Car */}
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              Select Your Vehicle
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Bike Option */}
              <button
                type="button"
                onClick={() => handleVehicleChange('bike')}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${
                  vehicleType === 'bike'
                    ? 'bg-white/15 border-white/40 text-white shadow-lg'
                    : 'bg-white/[0.02] border-white/10 text-white/70 hover:border-white/20'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${vehicleType === 'bike' ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">Bike / Scooter</div>
                  <div className="text-[11px] text-white/60">1 Companion Seat</div>
                </div>
              </button>

              {/* Car Option */}
              <button
                type="button"
                onClick={() => handleVehicleChange('car')}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${
                  vehicleType === 'car'
                    ? 'bg-white/15 border-white/40 text-white shadow-lg'
                    : 'bg-white/[0.02] border-white/10 text-white/70 hover:border-white/20'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${vehicleType === 'car' ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">Car Pool</div>
                  <div className="text-[11px] text-white/60">1 to 4 Companion Seats</div>
                </div>
              </button>
            </div>
          </div>

          {/* Vehicle Model, Plate & Available Seats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Vehicle Model
              </label>
              <input
                type="text"
                placeholder={vehicleType === 'bike' ? 'e.g. Royal Enfield 350' : 'e.g. Hyundai Creta'}
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Number Plate (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. KA 01 AB 1234"
                value={vehicleNumberPlate}
                onChange={(e) => setVehicleNumberPlate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Available Seats
              </label>
              {vehicleType === 'bike' ? (
                <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white/60 font-medium text-center">
                  1 Seat (Pillion)
                </div>
              ) : (
                <select
                  value={seatsAvailable}
                  onChange={(e) => setSeatsAvailable(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-sm text-white focus:outline-none focus:border-white"
                >
                  <option value={1}>1 Seat</option>
                  <option value={2}>2 Seats</option>
                  <option value={3}>3 Seats</option>
                  <option value={4}>4 Seats</option>
                </select>
              )}
            </div>
          </div>

          {/* Optional Vehicle Image Upload Section */}
          <div className="p-3.5 rounded-xl liquid-glass border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Upload Vehicle Photo (Optional)</span>
              </label>
              {vehicleImage && (
                <button
                  type="button"
                  onClick={() => setVehicleImage('')}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  Remove Photo
                </button>
              )}
            </div>

            {vehicleImage ? (
              <div className="flex items-center gap-3">
                <img
                  src={vehicleImage}
                  alt="Vehicle preview"
                  className="w-24 h-16 object-cover rounded-lg border border-white/20 shadow-md"
                />
                <span className="text-xs text-white/70">Photo attached for companions!</span>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/25 hover:border-white/50 cursor-pointer text-xs text-white/70 hover:text-white transition-colors bg-white/[0.02]">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Choose file from device...</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 pt-1 text-[11px] text-white/60">
                  <span>Or use preset:</span>
                  {vehiclePresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setVehicleImage(preset.url)}
                      className="px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Route: Origin & Destination with Google Maps Picker */}
          <div className="space-y-3 p-3.5 rounded-xl liquid-glass border border-white/10">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Place A (Starting Point)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMapPickerTarget('origin')}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 transition-all cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Select on Google Maps</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Koramangala 5th Block, Bangalore"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white"
                />
              </div>

              {/* Quick starting presets */}
              <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto text-[11px] text-white/50">
                <span className="shrink-0">Quick Pick:</span>
                {['Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'Electronic City'].map((place) => (
                  <button
                    key={place}
                    type="button"
                    onClick={() => setOrigin(place)}
                    className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors shrink-0 cursor-pointer"
                  >
                    {place}
                  </button>
                ))}
              </div>
            </div>

            {/* Intermediate Stops */}
            <div className="space-y-1.5 pl-3 border-l border-dashed border-white/20 ml-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">
                  Route Stops (Where companions can join/drop)
                </span>
                <button
                  type="button"
                  onClick={handleAddStop}
                  className="text-xs text-white hover:text-white/80 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Stop</span>
                </button>
              </div>

              {intermediateStops.map((stop, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0 rotate-45" />
                  <input
                    type="text"
                    placeholder={`Stop #${idx + 1} (e.g. Silk Board / Metro Station)`}
                    value={stop}
                    onChange={(e) => handleUpdateStop(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white"
                  />
                  <button
                    type="button"
                    onClick={() => setMapPickerTarget({ stopIndex: idx })}
                    title="Select on Google Maps"
                    className="p-1.5 rounded-lg liquid-glass border border-white/15 text-emerald-400 hover:text-white cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                  </button>
                  {intermediateStops.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(idx)}
                      className="p-1 text-white/40 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Place B (Final Destination)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMapPickerTarget('destination')}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 transition-all cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Select on Google Maps</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Kempegowda Airport BLR / Manyata Tech Park"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white"
                />
              </div>

              {/* Quick destination presets */}
              <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto text-[11px] text-white/50">
                <span className="shrink-0">Quick Pick:</span>
                {['Kempegowda Airport (BLR)', 'Manyata Tech Park', 'Electronic City', 'DLF Cyber City'].map((place) => (
                  <button
                    key={place}
                    type="button"
                    onClick={() => setDestination(place)}
                    className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors shrink-0 cursor-pointer"
                  >
                    {place}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date & Interactive Timing Clock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl liquid-glass border border-white/10">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Departure Date
              </label>
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-sm text-white focus:outline-none focus:border-white"
              >
                <option value="Today">Today</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="This Weekend">This Weekend</option>
              </select>
            </div>

            {/* Visual Departure Clock Picker */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Departure Clock Time</span>
              </label>
              <div className="flex items-center gap-1.5">
                <select
                  value={depHour}
                  onChange={(e) => setDepHour(e.target.value)}
                  className="flex-1 px-2.5 py-2 rounded-lg bg-black/80 border border-white/15 text-xs text-white font-mono"
                >
                  {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="text-white/60 font-bold">:</span>
                <select
                  value={depMinute}
                  onChange={(e) => setDepMinute(e.target.value)}
                  className="flex-1 px-2.5 py-2 rounded-lg bg-black/80 border border-white/15 text-xs text-white font-mono"
                >
                  {['00', '15', '30', '45'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <div className="flex rounded-lg overflow-hidden border border-white/15">
                  <button
                    type="button"
                    onClick={() => setDepPeriod('AM')}
                    className={`px-2 py-1.5 text-xs font-bold ${depPeriod === 'AM' ? 'bg-white text-black' : 'bg-black text-white/60'}`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepPeriod('PM')}
                    className={`px-2 py-1.5 text-xs font-bold ${depPeriod === 'PM' ? 'bg-white text-black' : 'bg-black text-white/60'}`}
                  >
                    PM
                  </button>
                </div>
              </div>
              <div className="text-[10px] text-emerald-400 mt-1">
                Departs at: <strong className="font-mono">{departureTime}</strong>
              </div>
            </div>
          </div>

          {/* Pricing Preference: Fixed vs Open to offers */}
          <div className="p-4 rounded-xl liquid-glass border border-white/10 space-y-3">
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider">
              Fare & Pricing Strategy
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label 
                onClick={() => setPricingModel('fixed')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-medium transition-all ${
                  pricingModel === 'fixed'
                    ? 'bg-white/15 border-white/40 text-white'
                    : 'bg-black/40 border-white/10 text-white/60'
                }`}
              >
                <input
                  type="radio"
                  name="pricing"
                  checked={pricingModel === 'fixed'}
                  onChange={() => setPricingModel('fixed')}
                  className="accent-white"
                />
                <span>Set Fixed Fare (₹)</span>
              </label>

              <label 
                onClick={() => setPricingModel('negotiable')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-medium transition-all ${
                  pricingModel === 'negotiable'
                    ? 'bg-white/15 border-white/40 text-white'
                    : 'bg-black/40 border-white/10 text-white/60'
                }`}
              >
                <input
                  type="radio"
                  name="pricing"
                  checked={pricingModel === 'negotiable'}
                  onChange={() => setPricingModel('negotiable')}
                  className="accent-white"
                />
                <span>Open to Offers / Bids</span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="w-1/2">
                <span className="text-xs text-white/60">
                  {pricingModel === 'fixed' ? 'Fixed Price per Seat (₹)' : 'Suggested Base Fare (₹)'}:
                </span>
                <input
                  type="number"
                  min={20}
                  step={10}
                  value={fare}
                  onChange={(e) => setFare(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-sm font-bold text-white focus:outline-none focus:border-white"
                />
              </div>
              <div className="w-1/2 text-xs text-white/60">
                {pricingModel === 'negotiable' ? (
                  <span className="text-amber-300">
                    Companions can propose what they can afford for this route.
                  </span>
                ) : (
                  <span>
                    Companions can join at this price or propose a minor discount for shorter drop-offs.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              Ride Guidelines / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. 'Can carry 1 helmet. Non-smoking ride. Heading home after work.'"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white"
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
              className="flex items-center gap-2 px-6 py-2 rounded-full bg-white text-black font-bold text-sm hover:bg-white/90 active:scale-95 transition-all shadow-lg"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Publish Ride</span>
            </button>
          </div>
        </form>

        {/* Location Picker Modal */}
        {mapPickerTarget !== null && (
          <GoogleMapsLocationPickerModal
            isOpen={mapPickerTarget !== null}
            onClose={() => setMapPickerTarget(null)}
            title={getPickerTitle()}
            initialValue={getPickerInitialValue()}
            onSelectLocation={handleConfirmLocation}
          />
        )}
      </div>
    </div>
  );
};
