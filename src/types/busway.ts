export type UserRole = 
  | 'passenger' 
  | 'driver' 
  | 'operator' 
  | 'support' 
  | 'operations' 
  | 'finance' 
  | 'superadmin';

export type BookingStatus = 
  | 'PENDING_PAYMENT' 
  | 'CONFIRMED' 
  | 'CANCELLED' 
  | 'COMPLETED' 
  | 'EXPIRED' 
  | 'REFUND_PENDING';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type TransactionType = 'TOPUP' | 'RIDE_DEBIT' | 'PROMO_CREDIT' | 'REFUND';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  savedLocations: {
    label: string;
    address: string;
  }[];
}

export interface Stop {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  landmark?: string;
}

export interface RouteStop {
  stopId: string;
  stopName: string;
  scheduledMinuteFromStart: number;
  isPickupAllowed: boolean;
  isDropAllowed: boolean;
}

export interface BusRoute {
  id: string;
  code: string;
  origin: string;
  destination: string;
  corridor: string; // e.g. "Sector V", "New Town", "Ecospace"
  baseFare: number;
  totalDistanceKm: number;
  estimatedDurationMins: number;
  stops: RouteStop[];
  isActive: boolean;
  operatorId: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string; // e.g. "WB 25 3751"
  model: string; // e.g. "Tata Starbus Ultra AC"
  color: string; // e.g. "White & Blue"
  totalCapacity: number;
  operatorId: string;
  fitnessValidUntil: string;
  insuranceValidUntil: string;
  permitValidUntil: string;
  isCompliant: boolean;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  rating: number;
  totalRides: number;
  licenseNumber: string;
  avatarUrl?: string;
  currentVehicleId?: string;
}

export interface TripInstance {
  id: string;
  routeId: string;
  routeCode: string;
  origin: string;
  destination: string;
  departureTime: string; // "08:30 AM"
  departureDate: string; // "2026-10-08" or "2026-10-16"
  estimatedArrivalTime: string; // "10:10 AM"
  vehicleId: string;
  vehicleRegistration: string;
  driverId: string;
  driverName: string;
  driverRating: number;
  totalCapacity: number;
  availableCapacity: number;
  fare: number;
  status: 'SCHEDULED' | 'ON_ROUTE' | 'COMPLETED' | 'CANCELLED';
  currentLocation?: {
    lat: number;
    lng: number;
    heading: number;
    lastUpdated: string;
  };
}

export interface BookingHold {
  holdToken: string;
  tripId: string;
  passengerCount: number;
  expiresAt: string; // ISO string 5 mins
  totalFare: number;
}

export interface Booking {
  id: string;
  bookingNumber: string; // e.g. "BW02NDE0MUZN6R67U6GB"
  userId: string;
  userName: string;
  userPhone: string;
  tripId: string;
  routeId: string;
  origin: string;
  destination: string;
  departureDate: string; // "08-OCT-26 THU"
  departureTime: string; // "08:30 AM"
  arrivalTime: string; // "10:10 AM (approx)"
  vehicleRegistration: string;
  vehicleModel: string;
  driverName: string;
  driverPhone: string;
  driverRating: number;
  seatNumbers: string[]; // ["14A"]
  passengerCount: number;
  fare: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  paymentMethod: 'WALLET' | 'RAZORPAY_SANDBOX' | 'PASS';
  ticketQrToken: string;
  createdAt: string;
  isCheckedIn: boolean;
  checkedInAt?: string;
  refundAmount?: number;
}

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  timestamp: number;
  balanceAfter: number;
  referenceId: string;
}

export interface WalletAccount {
  userId: string;
  availableBalance: number;
  promotionalCredit: number;
  transactions: WalletTransaction[];
}

export interface CommuterPass {
  id: string;
  title: string;
  routeCode: string;
  origin: string;
  destination: string;
  price: number;
  validDays: number;
  totalRides: number;
  remainingRides: number;
  validUntil: string;
  isActive: boolean;
  discountPercentage: number;
}

export interface SupportTicket {
  id: string;
  userId: string;
  category: 'ISSUE' | 'REFUND' | 'LOST_ITEM' | 'FEEDBACK' | 'GENERAL';
  title: string;
  description: string;
  bookingNumber?: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  resolvedAt?: string;
}

export interface Operator {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  tradeLicenseNumber: string;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
  totalVehicles: number;
  activeTrips: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  targetResource: string;
  reason: string;
  previousValue?: string;
  newValue?: string;
}
