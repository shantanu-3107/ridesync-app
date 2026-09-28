import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ride, RideRequest, UserProfile, PastRide, AppTheme } from './types/ride';
import { initialRides, initialRequests } from './data/mockRides';
import { Navbar } from './components/Navbar';
import { RideCard } from './components/RideCard';
import { BargainModal } from './components/BargainModal';
import { PostRideModal } from './components/PostRideModal';
import { NegotiationsPanel } from './components/NegotiationsPanel';
import { RouteMapModal } from './components/RouteMapModal';
import { UserProfileDrawer } from './components/UserProfileDrawer';
import { GoogleMapsLocationPickerModal } from './components/GoogleMapsLocationPickerModal';
import { sendDataToEmail } from './services/notificationService';
import { FadingVideo } from './components/FadingVideo';
import { BlurText } from './components/BlurText';
import { 
  ArrowUpRight, 
  Play, 
  ClockIcon, 
  GlobeIcon, 
  ImageIcon, 
  MovieIcon, 
  LightbulbIcon 
} from './components/Icons';
import { 
  MapPin, 
  Car, 
  Bike, 
  Sparkles, 
  PlusCircle, 
  CheckCircle2,
  ChevronDown,
  Compass,
  Zap
} from 'lucide-react';

const fadeInUp = (delay: number) => ({
  initial: { filter: 'blur(10px)', opacity: 0, y: 20 },
  animate: { filter: 'blur(0px)', opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: 'easeOut' },
});

// Safe LocalStorage helpers
function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const defaultUser: UserProfile = {
  name: 'Aarav Sharma',
  email: 'aarav.sharma@example.com',
  phone: '+91 98765 43210',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  rating: 4.95,
  totalTripsCompleted: 24,
  isVerified: true,
  drivingLicenseVerified: true,
  defaultRole: 'rider',
  vehicle: {
    type: 'bike',
    model: 'Royal Enfield Classic 350',
    plateNumber: 'KA 01 MJ 4821',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=300&auto=format&fit=crop&q=80',
  },
};

const defaultPastRides: PastRide[] = [
  {
    id: 'past-1',
    role: 'rider',
    origin: 'Koramangala 5th Block',
    destination: 'Whitefield ITPL',
    date: 'Yesterday, 07:00 PM',
    vehicleType: 'bike',
    vehicleModel: 'Royal Enfield Classic 350',
    companionName: 'Rohan Mehta',
    fare: 180,
    status: 'completed',
  },
  {
    id: 'past-2',
    role: 'rider',
    origin: 'HSR Layout Sector 2',
    destination: 'Electronic City Phase 1',
    date: '10 Sep 2026',
    vehicleType: 'bike',
    vehicleModel: 'Royal Enfield Classic 350',
    companionName: 'Sneha Patel',
    fare: 120,
    status: 'completed',
  },
  {
    id: 'past-3',
    role: 'passenger',
    origin: 'Indiranagar Metro',
    destination: 'Kempegowda Airport BLR',
    date: '08 Sep 2026',
    vehicleType: 'car',
    vehicleModel: 'Tata Nexon EV',
    companionName: 'Vikram Singh',
    fare: 350,
    status: 'completed',
  },
  {
    id: 'past-4',
    role: 'rider',
    origin: 'Manyata Tech Park',
    destination: 'Jayanagar 4th Block',
    date: '05 Sep 2026',
    vehicleType: 'bike',
    vehicleModel: 'Royal Enfield Classic 350',
    companionName: 'Anand Verma',
    fare: 220,
    status: 'completed',
  },
];

export default function App() {
  const [rides, setRides] = useState<Ride[]>(() =>
    getStorageItem('ridepartner_rides', initialRides)
  );
  const [requests, setRequests] = useState<RideRequest[]>(() =>
    getStorageItem('ridepartner_requests', initialRequests)
  );
  const [activeTab, setActiveTab] = useState<'browse' | 'negotiations'>('browse');

  // Account, Past Rides, and Theme state
  const [user, setUser] = useState<UserProfile>(() =>
    getStorageItem('ridepartner_user', defaultUser)
  );
  const [pastRides, setPastRides] = useState<PastRide[]>(() =>
    getStorageItem('ridepartner_past_rides', defaultPastRides)
  );
  const [theme, setTheme] = useState<AppTheme>(() =>
    getStorageItem('ridepartner_theme', 'cinematic-black')
  );

  // Sync to local storage
  useEffect(() => {
    setStorageItem('ridepartner_rides', rides);
  }, [rides]);

  useEffect(() => {
    setStorageItem('ridepartner_requests', requests);
  }, [requests]);

  useEffect(() => {
    setStorageItem('ridepartner_user', user);
  }, [user]);

  useEffect(() => {
    setStorageItem('ridepartner_past_rides', pastRides);
  }, [pastRides]);

  useEffect(() => {
    setStorageItem('ridepartner_theme', theme);
  }, [theme]);

  // Search & Filter State
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState<'all' | 'bike' | 'car'>('all');
  const [bargainOnly, setBargainOnly] = useState(false);

  // Modals & Notifications
  const [selectedRideForBargain, setSelectedRideForBargain] = useState<Ride | null>(null);
  const [isPostRideOpen, setIsPostRideOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mapModalRide, setMapModalRide] = useState<Ride | null>(null);
  const [searchMapPicker, setSearchMapPicker] = useState<'origin' | 'destination' | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Lock body scroll when any modal is open
  const isAnyModalOpen =
    isPostRideOpen ||
    isProfileOpen ||
    selectedRideForBargain !== null ||
    mapModalRide !== null ||
    searchMapPicker !== null;

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAnyModalOpen]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleResetData = () => {
    localStorage.removeItem('ridepartner_rides');
    localStorage.removeItem('ridepartner_requests');
    localStorage.removeItem('ridepartner_user');
    localStorage.removeItem('ridepartner_past_rides');
    localStorage.removeItem('ridepartner_theme');
    setRides(initialRides);
    setRequests(initialRequests);
    setUser(defaultUser);
    setPastRides(defaultPastRides);
    setTheme('cinematic-black');
    setIsProfileOpen(false);
    showToast('All local data cleared and reset to defaults!');
  };

  const handleSeedDemoRide = () => {
    const demoRide: Ride = {
      id: `demo-${Date.now()}`,
      driver: {
        name: 'Devansh Roy',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        rating: 4.9,
        totalTrips: 38,
      },
      origin: 'Koramangala 5th Block, Bangalore',
      destination: 'Kempegowda International Airport (BLR)',
      intermediateStops: ['Indiranagar Metro', 'Hebbal Flyover', 'Yelahanka Bypass'],
      date: 'Today',
      departureTime: '06:30 PM',
      vehicleType: 'car',
      vehicleModel: 'Tata Nexon EV (AC)',
      vehicleNumberPlate: 'KA 03 MX 9021',
      vehicleImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&auto=format&fit=crop&q=80',
      seatsAvailable: 3,
      totalSeats: 3,
      fare: 280,
      pricingModel: 'negotiable',
      notes: 'Heading to airport terminal after office. Clean AC ride, boot space for 2 bags. Helmets not needed for car.',
    };
    setRides([demoRide, ...rides]);
    showToast('Sample airport corridor lift loaded!');
  };

  // Filter rides based on search criteria
  const filteredRides = useMemo(() => {
    return rides.filter((ride) => {
      if (vehicleFilter !== 'all' && ride.vehicleType !== vehicleFilter) {
        return false;
      }
      if (bargainOnly && ride.pricingModel !== 'negotiable') {
        return false;
      }
      if (searchOrigin.trim()) {
        const originMatch = ride.origin.toLowerCase().includes(searchOrigin.toLowerCase());
        if (!originMatch) return false;
      }
      if (searchDestination.trim()) {
        const destLower = searchDestination.toLowerCase();
        const destMatch = ride.destination.toLowerCase().includes(destLower);
        const intermediateMatch = ride.intermediateStops.some((s) =>
          s.toLowerCase().includes(destLower)
        );
        if (!destMatch && !intermediateMatch) return false;
      }
      return true;
    });
  }, [rides, searchOrigin, searchDestination, vehicleFilter, bargainOnly]);

  const getAdminEmail = () => {
    return localStorage.getItem('ridepartner_admin_email') || 'shantanumohature@gmail.com';
  };

  // Request & Negotiation Handlers
  const handleCreateRequest = (
    newReqData: Omit<RideRequest, 'id' | 'createdAt' | 'history'>
  ) => {
    const newRequest: RideRequest = {
      ...newReqData,
      id: `req-${Date.now()}`,
      createdAt: 'Just now',
      history: [
        {
          sender: 'passenger',
          text: newReqData.message || `Offered ₹${newReqData.offeredFare} for drop at ${newReqData.requestedDropoff}`,
          amount: newReqData.offeredFare,
          timestamp: 'Just now',
        },
      ],
    };

    setRequests([newRequest, ...requests]);
    showToast(`Your ride offer of ₹${newReqData.offeredFare} was sent!`);
    setActiveTab('negotiations');

    const relatedRide = rides.find((r) => r.id === newReqData.rideId);

    // Auto dispatch email notification to user's specified inbox
    sendDataToEmail({
      eventType: 'NEW_RIDE_REQUEST',
      title: `New Companion Request: ₹${newReqData.offeredFare} for ${newReqData.requestedDropoff}`,
      recipientEmail: getAdminEmail(),
      data: {
        requestId: newRequest.id,
        passengerName: newReqData.passengerName,
        pickupPoint: newReqData.pickupLocation,
        requestedDropoff: newReqData.requestedDropoff,
        isCustomDropoff: newReqData.isCustomDropoff ? 'Yes (En-route custom spot)' : 'No (Direct drop)',
        offeredFare: `₹${newReqData.offeredFare} (Original: ₹${newReqData.originalFare})`,
        message: newReqData.message || 'No extra note provided',
        relatedRideRoute: relatedRide ? `${relatedRide.origin} ➔ ${relatedRide.destination}` : 'Unknown Route',
        driverName: relatedRide ? relatedRide.driver.name : 'Unknown Driver',
      },
    }).catch((err) => console.error('Failed to dispatch request notification:', err));
  };

  const handlePostRide = (newRide: Ride) => {
    setRides([newRide, ...rides]);
    showToast(`Lift from ${newRide.origin} to ${newRide.destination} published!`);
    setActiveTab('browse');
    const el = document.getElementById('rides-feed');
    if (el) el.scrollIntoView({ behavior: 'smooth' });

    // Auto dispatch email notification to user's specified inbox
    sendDataToEmail({
      eventType: 'NEW_RIDE_OFFERED',
      title: `New Lift Offered: ${newRide.origin} ➔ ${newRide.destination} (₹${newRide.fare})`,
      recipientEmail: getAdminEmail(),
      data: {
        rideId: newRide.id,
        driver: newRide.driver.name,
        driverPhone: newRide.driver.phone || 'N/A',
        origin: newRide.origin,
        destination: newRide.destination,
        intermediateStops: (newRide.intermediateStops || []).join(' | ') || 'Direct non-stop',
        departureSchedule: `${newRide.date} at ${newRide.departureTime}`,
        vehicle: `${newRide.vehicleType.toUpperCase()} - ${newRide.vehicleModel} (${newRide.vehicleNumberPlate || 'N/A'})`,
        fare: `₹${newRide.fare} (${newRide.pricingModel})`,
        seatsAvailable: `${newRide.seatsAvailable} of ${newRide.totalSeats}`,
        notes: newRide.notes || 'None',
      },
    }).catch((err) => console.error('Failed to dispatch ride notification:', err));
  };

  const handleAcceptRequest = (requestId: string) => {
    const targetReq = requests.find((r) => r.id === requestId);
    const relatedRide = targetReq ? rides.find((r) => r.id === targetReq.rideId) : null;

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'accepted',
            history: [
              ...req.history,
              {
                sender: 'driver',
                text: `Rider accepted your offer of ₹${req.offeredFare}. Lift confirmed!`,
                timestamp: 'Just now',
              },
            ],
          };
        }
        return req;
      })
    );

    // If accepted, add to past rides & income log
    if (targetReq && relatedRide) {
      const finalFare = targetReq.counterOfferFare || targetReq.offeredFare;
      const newPastRide: PastRide = {
        id: `past-${Date.now()}`,
        role: 'rider',
        origin: relatedRide.origin,
        destination: targetReq.requestedDropoff,
        date: 'Today, Just now',
        vehicleType: relatedRide.vehicleType,
        vehicleModel: relatedRide.vehicleModel,
        companionName: targetReq.passengerName,
        fare: finalFare,
        status: 'completed',
      };
      setPastRides([newPastRide, ...pastRides]);

      // Auto dispatch email notification
      sendDataToEmail({
        eventType: 'RIDE_ACCEPTED',
        title: `Lift Accepted & Confirmed: ${targetReq.passengerName} (₹${finalFare})`,
        recipientEmail: getAdminEmail(),
        data: {
          requestId,
          passengerName: targetReq.passengerName,
          driverName: relatedRide.driver.name,
          driverContact: relatedRide.driver.phone || 'N/A',
          pickupPoint: targetReq.pickupLocation,
          dropoffPoint: targetReq.requestedDropoff,
          confirmedFare: `₹${finalFare}`,
          status: 'Confirmed & Seat Reserved',
        },
      }).catch((err) => console.error('Failed to dispatch accept notification:', err));
    }

    showToast('Accepted companion request! Seat locked & income updated.');
  };

  const handleDeclineRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'declined',
            history: [
              ...req.history,
              {
                sender: 'driver',
                text: 'Request declined.',
                timestamp: 'Just now',
              },
            ],
          };
        }
        return req;
      })
    );
    showToast('Request declined.');
  };

  const handleCounterOffer = (requestId: string, amount: number, note: string) => {
    const targetReq = requests.find((r) => r.id === requestId);
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'countered',
            counterOfferFare: amount,
            history: [
              ...req.history,
              {
                sender: 'driver',
                text: note ? `Counter-offer: ₹${amount} (${note})` : `Counter-offer: ₹${amount}`,
                amount,
                timestamp: 'Just now',
              },
            ],
          };
        }
        return req;
      })
    );
    showToast(`Counter-offer of ₹${amount} sent to companion.`);

    // Auto dispatch email notification
    sendDataToEmail({
      eventType: 'COUNTER_OFFER',
      title: `Fare Counter-Offer Sent: ₹${amount} for Request #${requestId}`,
      recipientEmail: getAdminEmail(),
      data: {
        requestId,
        passengerName: targetReq ? targetReq.passengerName : 'N/A',
        counterOfferFare: `₹${amount}`,
        note: note || 'None provided',
      },
    }).catch((err) => console.error('Failed to dispatch counter notification:', err));
  };

  const handlePassengerAcceptCounter = (requestId: string) => {
    const targetReq = requests.find((r) => r.id === requestId);
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'accepted',
            offeredFare: req.counterOfferFare || req.offeredFare,
            history: [
              ...req.history,
              {
                sender: 'passenger',
                text: `Passenger agreed to counter-offer of ₹${req.counterOfferFare}. Confirmed!`,
                timestamp: 'Just now',
              },
            ],
          };
        }
        return req;
      })
    );
    showToast('Agreed to counter-offer! Ride confirmed.');

    if (targetReq) {
      sendDataToEmail({
        eventType: 'RIDE_ACCEPTED',
        title: `Passenger Accepted Counter-Offer: ₹${targetReq.counterOfferFare} for Request #${requestId}`,
        recipientEmail: getAdminEmail(),
        data: {
          requestId,
          passengerName: targetReq.passengerName,
          agreedFare: `₹${targetReq.counterOfferFare}`,
          status: 'Confirmed by Passenger',
        },
      }).catch((err) => console.error('Failed to dispatch counter accept notification:', err));
    }
  };

  const pendingCount = requests.filter(
    (r) => r.status === 'pending' || r.status === 'countered'
  ).length;

  const scrollToRides = () => {
    setActiveTab('browse');
    const el = document.getElementById('rides-feed');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Theme container class mapping
  const themeClass = 
    theme === 'cinematic-black' 
      ? 'bg-black text-white' 
      : theme === 'midnight-slate' 
      ? 'bg-[#090d16] text-slate-100' 
      : 'bg-[#051311] text-emerald-50';

  return (
    <div className={`min-h-screen ${themeClass} selection:bg-white selection:text-black font-body transition-colors duration-500`}>
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 max-w-md liquid-glass-strong text-white px-4 py-3 rounded-2xl shadow-2xl font-medium text-sm flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-200 border border-white/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Floating Liquid-Glass Navbar with Profile Left Button & Clock */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPostRide={() => setIsPostRideOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        pendingOffersCount={pendingCount}
      />

      {activeTab === 'negotiations' ? (
        /* Negotiations Hub Page */
        <NegotiationsPanel
          requests={requests}
          rides={rides}
          onAcceptRequest={handleAcceptRequest}
          onDeclineRequest={handleDeclineRequest}
          onCounterOffer={handleCounterOffer}
          onPassengerAcceptCounter={handlePassengerAcceptCounter}
        />
      ) : (
        <>
          {/* ========================================================================= */}
          {/* SECTION 1: HERO (Cinematic FadingVideo + Staggered Motions)                */}
          {/* ========================================================================= */}
          <section className="relative min-h-screen overflow-hidden flex flex-col justify-between">
            {/* Background Fading Video */}
            <FadingVideo
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260619_191346_9d19d66e-86a4-47f7-8dc6-712c1788c3b2.mp4"
              className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
              style={{ width: '120%', height: '120%' }}
            />

            {/* Hero Main Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center pt-28 pb-12 px-4 sm:px-8 text-center max-w-5xl mx-auto">
              {/* 1. Badge Pill */}
              <motion.div
                {...fadeInUp(0.4)}
                className="liquid-glass rounded-full px-3.5 py-1.5 flex items-center gap-2 text-xs sm:text-sm font-body text-white/90"
              >
                <span className="bg-white text-black text-xs font-semibold px-2 py-0.5 rounded-full">
                  New
                </span>
                <span>Ride Companion • Real-Time Car & Bike Pooling with Fair Bargaining</span>
              </motion.div>

              {/* 2. Headline via BlurText */}
              <div className="mt-6 max-w-4xl">
                <BlurText
                  text="Find a Companion on Your Route. Share the Ride, Split the Fare."
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.85] tracking-[-3px]"
                />
              </div>

              {/* 3. Subtext */}
              <motion.p
                {...fadeInUp(0.8)}
                className="text-sm md:text-base text-white/90 max-w-2xl font-body font-light leading-tight mt-5"
              >
                Going from Place A to Place B? Hop on with riders traveling your way. Ask for custom drop-offs at stops along the route or bargain a fare you can afford. On a bike or in a car — human travel with zero platform cuts.
              </motion.p>

              {/* 4. CTA Buttons */}
              <motion.div
                {...fadeInUp(1.1)}
                className="mt-7 flex items-center justify-center gap-4 sm:gap-6 flex-wrap"
              >
                <button
                  onClick={scrollToRides}
                  className="liquid-glass-strong rounded-full px-6 py-3 flex items-center gap-2 text-sm font-medium text-white hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <span>Explore Available Lifts</span>
                  <ArrowUpRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>

                <button
                  onClick={() => setIsPostRideOpen(true)}
                  className="bg-white text-black rounded-full px-6 py-3 text-sm font-medium font-body flex items-center gap-2 hover:bg-white/90 transition-all cursor-pointer shadow-lg"
                >
                  <PlusCircle className="w-4 h-4 text-black" />
                  <span>Offer a Lift as Rider</span>
                </button>

                <button
                  type="button"
                  onClick={scrollToRides}
                  className="flex items-center gap-2 text-sm text-white/80 hover:text-white font-medium font-body transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-white" />
                  <span>How Bargaining Works</span>
                </button>
              </motion.div>

              {/* 5. Stats Cards */}
              <motion.div
                {...fadeInUp(1.3)}
                className="mt-8 flex items-center justify-center gap-4 flex-wrap"
              >
                {/* Card 1 */}
                <div className="liquid-glass p-4 sm:p-5 w-[190px] sm:w-[210px] rounded-[1.25rem] text-left flex flex-col justify-between">
                  <ClockIcon className="w-5 h-5 text-white/80" />
                  <div>
                    <div className="text-3xl sm:text-4xl font-heading italic tracking-[-1px] leading-none mt-3">
                      6 Mins
                    </div>
                    <div className="text-xs text-white/70 font-body mt-1">
                      Average Route Match Time
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="liquid-glass p-4 sm:p-5 w-[190px] sm:w-[210px] rounded-[1.25rem] text-left flex flex-col justify-between">
                  <GlobeIcon className="w-5 h-5 text-white/80" />
                  <div>
                    <div className="text-3xl sm:text-4xl font-heading italic tracking-[-1px] leading-none mt-3">
                      140+
                    </div>
                    <div className="text-xs text-white/70 font-body mt-1">
                      Daily Commute Corridors
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="liquid-glass p-4 sm:p-5 w-[190px] sm:w-[210px] rounded-[1.25rem] text-left flex flex-col justify-between">
                  <Bike className="w-5 h-5 text-amber-300" />
                  <div>
                    <div className="text-3xl sm:text-4xl font-heading italic tracking-[-1px] leading-none mt-3">
                      Bike & Car
                    </div>
                    <div className="text-xs text-white/70 font-body mt-1">
                      Solo Pillions & Group Pools
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Indicator */}
            <motion.div
              {...fadeInUp(1.4)}
              className="relative z-10 pb-6 flex flex-col items-center gap-2 cursor-pointer"
              onClick={scrollToRides}
            >
              <span className="text-[11px] text-white/60 tracking-wider uppercase">
                Scroll to Explore Lifts
              </span>
              <ChevronDown className="w-4 h-4 text-white/60 animate-bounce" />
            </motion.div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 2: HOW IT WORKS & CAPABILITIES (Liquid-Glass Grid)                */}
          {/* ========================================================================= */}
          <section
            id="how-it-works"
            className="relative min-h-screen overflow-hidden flex flex-col justify-center py-24"
          >
            {/* Background Fading Video */}
            <FadingVideo
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4"
              className="absolute inset-0 w-full h-full object-cover z-0"
            />

            {/* Section Content */}
            <div className="relative z-10 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto w-full">
              {/* Header */}
              <div className="mb-14">
                <p className="text-sm font-body text-white/70 mb-4 tracking-wider">// How It Works</p>
                <h2 className="font-heading italic text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[0.9] tracking-[-3px] text-white">
                  Companion Travel,
                  <br />
                  made human
                </h2>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Route Matching */}
                <div className="liquid-glass rounded-[1.25rem] p-6 min-h-[340px] flex flex-col justify-between hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="liquid-glass h-11 w-11 rounded-[0.75rem] flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5 text-white/90" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {['Place A to B', 'Waypoint Matching', 'Verified Companions'].map((tag) => (
                        <span
                          key={tag}
                          className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1" />

                  <div className="mt-4">
                    <h3 className="font-heading italic text-3xl md:text-4xl tracking-[-1px] leading-none text-white">
                      Route Matching
                    </h3>
                    <p className="text-sm text-white/90 font-body font-light leading-snug max-w-[32ch] mt-3">
                      Drivers publish their exact itinerary with intermediate highway or city stops. Companions heading along that corridor can hop on seamlessly.
                    </p>
                  </div>
                </div>

                {/* Card 2: Bike or Car */}
                <div className="liquid-glass rounded-[1.25rem] p-6 min-h-[340px] flex flex-col justify-between hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="liquid-glass h-11 w-11 rounded-[0.75rem] flex items-center justify-center shrink-0">
                      <MovieIcon className="w-5 h-5 text-white/90" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {['Bike Pool (1 Seat)', 'Car Pool', 'Helmets Provided', 'AC Cars'].map((tag) => (
                        <span
                          key={tag}
                          className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1" />

                  <div className="mt-4">
                    <h3 className="font-heading italic text-3xl md:text-4xl tracking-[-1px] leading-none text-white">
                      Bike & Car Pools
                    </h3>
                    <p className="text-sm text-white/90 font-body font-light leading-snug max-w-[32ch] mt-3">
                      Choose between quick solo pillion bike rides to weave through peak traffic or comfortable shared car pools with boot space.
                    </p>
                  </div>
                </div>

                {/* Card 3: Dynamic Bargaining */}
                <div className="liquid-glass rounded-[1.25rem] p-6 min-h-[340px] flex flex-col justify-between hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="liquid-glass h-11 w-11 rounded-[0.75rem] flex items-center justify-center shrink-0">
                      <LightbulbIcon className="w-5 h-5 text-white/90" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {['Open to Offers', 'Custom Drop-Off', 'Counter-Bids', '0% Middleman'].map((tag) => (
                        <span
                          key={tag}
                          className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1" />

                  <div className="mt-4">
                    <h3 className="font-heading italic text-3xl md:text-4xl tracking-[-1px] leading-none text-white">
                      Fair Bargaining
                    </h3>
                    <p className="text-sm text-white/90 font-body font-light leading-snug max-w-[32ch] mt-3">
                      Only traveling halfway? Bargain down the fare or propose what you can pay. Riders can counter-offer or accept with zero platform commissions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 3: LIVE COMPANION FEED & SEARCH                                   */}
          {/* ========================================================================= */}
          <section id="rides-feed" className="py-20 px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto w-full space-y-8">
            {/* Header & Search Bar Container */}
            <div className="space-y-4">
              <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-heading italic text-white tracking-tight">
                    Live Available Rides & Companions
                  </h2>
                  <p className="text-sm text-white/70 mt-1 font-body">
                    Search your route, check the map, select intermediate drop-offs, and request a lift at a fair price.
                  </p>
                </div>

                <button
                  onClick={() => setIsPostRideOpen(true)}
                  className="bg-white text-black rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5 hover:bg-white/90 transition-all shadow-md cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Offer a Lift</span>
                </button>
              </div>

              {/* Liquid-Glass Search Box */}
              <div className="liquid-glass-strong rounded-[1.5rem] p-4 sm:p-5 border border-white/15 shadow-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  {/* Origin */}
                  <div className="md:col-span-5 relative">
                    <span className="absolute left-3.5 top-3.5 w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
                    <input
                      type="text"
                      placeholder="Leaving from (e.g. Koramangala / HSR)"
                      value={searchOrigin}
                      onChange={(e) => setSearchOrigin(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white transition-colors font-body"
                    />
                    <button
                      type="button"
                      onClick={() => setSearchMapPicker('origin')}
                      title="Select on Google Maps"
                      className="absolute right-2.5 top-2 p-1 rounded-lg text-emerald-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <Compass className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Destination */}
                  <div className="md:col-span-5 relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-rose-400" />
                    <input
                      type="text"
                      placeholder="Going to or stop along route (e.g. Airport / Whitefield)"
                      value={searchDestination}
                      onChange={(e) => setSearchDestination(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white transition-colors font-body"
                    />
                    <button
                      type="button"
                      onClick={() => setSearchMapPicker('destination')}
                      title="Select on Google Maps"
                      className="absolute right-2.5 top-2 p-1 rounded-lg text-rose-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <Compass className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Reset Filters */}
                  <div className="md:col-span-2">
                    <button
                      onClick={() => {
                        setSearchOrigin('');
                        setSearchDestination('');
                        setVehicleFilter('all');
                        setBargainOnly(false);
                      }}
                      className="w-full h-full py-2.5 px-4 rounded-xl liquid-glass border border-white/15 hover:border-white/30 text-white/80 hover:text-white text-xs font-semibold transition-all flex items-center justify-center cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>

                {/* Filter Chips: Vehicle Type & Bargainable */}
                <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2 flex-wrap font-body">
                    <span className="text-xs font-medium text-white/60 mr-1">Filter Vehicle:</span>
                    
                    <button
                      onClick={() => setVehicleFilter('all')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        vehicleFilter === 'all'
                          ? 'bg-white text-black font-semibold'
                          : 'liquid-glass border border-white/10 text-white/70 hover:border-white/25'
                      }`}
                    >
                      All Vehicles ({rides.length})
                    </button>

                    <button
                      onClick={() => setVehicleFilter('bike')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        vehicleFilter === 'bike'
                          ? 'bg-amber-300 text-black font-semibold'
                          : 'liquid-glass border border-white/10 text-white/70 hover:border-white/25'
                      }`}
                    >
                      <Bike className="w-3.5 h-3.5" />
                      <span>Bike Pool (1 Seat)</span>
                    </button>

                    <button
                      onClick={() => setVehicleFilter('car')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        vehicleFilter === 'car'
                          ? 'bg-white text-black font-semibold'
                          : 'liquid-glass border border-white/10 text-white/70 hover:border-white/25'
                      }`}
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>Car Pool</span>
                    </button>
                  </div>

                  {/* Toggle for Bargainable / Open to Offers */}
                  <button
                    onClick={() => setBargainOnly(!bargainOnly)}
                    className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      bargainOnly
                        ? 'bg-amber-400/20 border-amber-400/60 text-amber-300'
                        : 'liquid-glass border-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Open to Offers Only</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Rides Grid */}
            {filteredRides.length === 0 ? (
              <div className="text-center py-20 liquid-glass rounded-[1.5rem] p-8 max-w-lg mx-auto">
                <div className="flex items-center justify-center gap-2 text-white/40 mb-3">
                  <Bike className="w-8 h-8" />
                  <span className="text-white/20">•</span>
                  <Car className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-heading italic text-white mb-2">
                  {rides.length === 0 ? 'No Rides Posted Yet' : 'No Matching Lifts Found'}
                </h3>
                <p className="text-xs text-white/60 max-w-sm mx-auto mb-6 font-body leading-relaxed">
                  {rides.length === 0
                    ? 'Start the companion pool! Post your route from Place A to Place B, set your bike or car, and let companions join your journey.'
                    : 'Try resetting your search query or filters to see all available companion lifts.'}
                </p>

                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      if (rides.length === 0) {
                        setIsPostRideOpen(true);
                      } else {
                        setSearchOrigin('');
                        setSearchDestination('');
                        setVehicleFilter('all');
                        setBargainOnly(false);
                      }
                    }}
                    className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 cursor-pointer shadow-lg active:scale-95 transition-all"
                  >
                    {rides.length === 0 ? 'Offer a Lift as Rider' : 'Reset Search Filters'}
                  </button>

                  {rides.length === 0 && (
                    <button
                      onClick={handleSeedDemoRide}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-full liquid-glass border border-white/20 text-emerald-400 hover:text-white hover:bg-white/10 text-xs font-semibold cursor-pointer transition-all shadow-md"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Load Demo Corridor</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRides.map((ride) => (
                  <RideCard
                    key={ride.id}
                    ride={ride}
                    onRequestRide={(r) => setSelectedRideForBargain(r)}
                    onViewMap={(r) => setMapModalRide(r)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ========================================================================= */}
          {/* SECTION 4: PUBLISH-READY FOOTER & TRUST/SAFETY                            */}
          {/* ========================================================================= */}
          <footer className="border-t border-white/10 mt-20 pt-16 pb-24 md:pb-12 px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto w-full text-white/80 font-body">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <div className="md:col-span-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="h-9 w-9 rounded-full liquid-glass flex items-center justify-center font-heading italic text-xl text-white">r</span>
                  <span className="font-heading italic text-2xl text-white">RidePartner</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  Community-driven companion ride sharing. Connect with daily commuters, travel with verified companions, and share fuel costs seamlessly.
                </p>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Verified Peer Network • Zero Platform Fees</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Community Travel</h4>
                <ul className="space-y-2 text-xs text-white/60">
                  <li><button onClick={scrollToRides} className="hover:text-white transition-colors cursor-pointer">Explore City Corridors</button></li>
                  <li><button onClick={() => setIsPostRideOpen(true)} className="hover:text-white transition-colors cursor-pointer">Offer Bike / Car Lift</button></li>
                  <li><button onClick={() => setActiveTab('negotiations')} className="hover:text-white transition-colors cursor-pointer">Fair Fare Bargaining</button></li>
                  <li><button onClick={() => setIsProfileOpen(true)} className="hover:text-white transition-colors cursor-pointer">Earnings & Income Calculator</button></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Safety & Trust</h4>
                <ul className="space-y-2 text-xs text-white/60">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Govt ID Verification</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Driving License Verification</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> On-Route Waypoints</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Real-time Google Maps Navigation</li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Legal & Community</h4>
                <p className="text-[11px] text-white/50 leading-relaxed mb-3">
                  RidePartner facilitates non-commercial carpooling and bikepooling between companions traveling on identical routes to reduce city congestion and carbon footprint.
                </p>
                <div className="text-[11px] text-white/40">
                  © 2026 RidePartner Inc. All rights reserved.
                </div>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Passenger Bargain & Booking Modal */}
      <BargainModal
        ride={selectedRideForBargain}
        onClose={() => setSelectedRideForBargain(null)}
        onSubmitRequest={handleCreateRequest}
        user={user}
      />

      {/* Rider Post Lift Modal */}
      <PostRideModal
        isOpen={isPostRideOpen}
        onClose={() => setIsPostRideOpen(false)}
        onPostRide={handlePostRide}
        userAvatar={user.avatar}
        userName={user.name}
      />

      {/* Route & Google Maps Modal */}
      <RouteMapModal
        ride={mapModalRide}
        onClose={() => setMapModalRide(null)}
      />

      {/* Search Route Location Picker Modal */}
      {searchMapPicker !== null && (
        <GoogleMapsLocationPickerModal
          isOpen={searchMapPicker !== null}
          onClose={() => setSearchMapPicker(null)}
          title={
            searchMapPicker === 'origin'
              ? 'Select Place A (Origin) on Google Maps'
              : 'Select Place B (Destination) on Google Maps'
          }
          initialValue={searchMapPicker === 'origin' ? searchOrigin : searchDestination}
          onSelectLocation={(selectedLoc) => {
            if (searchMapPicker === 'origin') {
              setSearchOrigin(selectedLoc);
            } else {
              setSearchDestination(selectedLoc);
            }
            setSearchMapPicker(null);
          }}
        />
      )}

      {/* User Profile, Sign-In, Theme & Income Drawer (Left Button) */}
      <UserProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateUser={(updated) => {
          setUser(updated);
          showToast('Profile updated!');
        }}
        pastRides={pastRides}
        rides={rides}
        requests={requests}
        currentTheme={theme}
        onSelectTheme={(newTheme) => {
          setTheme(newTheme);
          showToast(`Theme switched to ${newTheme.replace('-', ' ')}!`);
        }}
        onResetData={handleResetData}
      />
    </div>
  );
}
