export type VehicleType = 'bike' | 'car';

export interface Driver {
  name: string;
  avatar: string;
  rating: number;
  totalTrips: number;
  phone?: string;
}

export interface Ride {
  id: string;
  driver: Driver;
  origin: string;
  destination: string;
  intermediateStops: string[];
  date: string;
  departureTime: string;
  vehicleType: VehicleType;
  vehicleModel: string;
  vehicleNumberPlate?: string;
  vehicleImage?: string; // Optional uploaded vehicle image
  seatsAvailable: number;
  totalSeats: number;
  fare: number;
  pricingModel: 'fixed' | 'negotiable';
  notes?: string;
  isInstantBooking?: boolean;
}

export type RequestStatus = 'pending' | 'countered' | 'accepted' | 'declined';

export interface RideRequest {
  id: string;
  rideId: string;
  passengerName: string;
  passengerAvatar: string;
  passengerRating: number;
  pickupLocation: string;
  requestedDropoff: string;
  isCustomDropoff: boolean;
  offeredFare: number;
  originalFare: number;
  pricingModel: 'fixed' | 'negotiable';
  status: RequestStatus;
  counterOfferFare?: number;
  message?: string;
  createdAt: string;
  history: Array<{
    sender: 'passenger' | 'driver';
    text: string;
    amount?: number;
    timestamp: string;
  }>;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  rating: number;
  totalTripsCompleted: number;
  isVerified: boolean;
  drivingLicenseVerified: boolean;
  defaultRole: 'rider' | 'passenger';
  vehicle?: {
    type: VehicleType;
    model: string;
    plateNumber: string;
    image?: string;
  };
}

export interface PastRide {
  id: string;
  role: 'rider' | 'passenger';
  origin: string;
  destination: string;
  date: string;
  vehicleType: VehicleType;
  vehicleModel: string;
  companionName: string;
  fare: number;
  status: 'completed' | 'cancelled';
}

export type AppTheme = 'cinematic-black' | 'midnight-slate' | 'cyber-emerald';
