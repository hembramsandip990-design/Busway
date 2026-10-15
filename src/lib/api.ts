import {
  UserProfile,
  BusRoute,
  TripInstance,
  BookingHold,
  Booking,
  WalletAccount,
  CommuterPass,
  SupportTicket,
  Vehicle,
} from '../types/busway';

const BASE_URL = '/api/v1';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // User
  getProfile: () => request<UserProfile>('/user/profile'),
  updateProfile: (data: { name: string; phone: string; email: string }) =>
    request<{ success: boolean; user: UserProfile }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Routes & Search
  getRoutes: (corridor?: string) =>
    request<BusRoute[]>(`/routes${corridor ? `?corridor=${encodeURIComponent(corridor)}` : ''}`),
  searchTrips: (origin?: string, destination?: string) => {
    const params = new URLSearchParams();
    if (origin) params.append('origin', origin);
    if (destination) params.append('destination', destination);
    return request<TripInstance[]>(`/trips/search?${params.toString()}`);
  },

  // Bookings & Concurrency Holds
  createHold: (tripId: string, passengerCount: number) =>
    request<BookingHold & { seatsRemaining: number }>('/bookings/holds', {
      method: 'POST',
      body: JSON.stringify({ tripId, passengerCount }),
    }),
  confirmBooking: (holdToken: string, paymentMethod: string, idempotencyKey?: string) =>
    request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify({ holdToken, paymentMethod, idempotencyKey }),
    }),
  getBookings: (status?: string) =>
    request<Booking[]>(`/bookings${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  getBookingById: (id: string) => request<Booking>(`/bookings/${id}`),
  cancelBooking: (id: string) =>
    request<{ success: boolean; message: string; booking: Booking }>(`/bookings/${id}/cancel`, {
      method: 'POST',
    }),

  // Tickets & Verification
  verifyTicket: (qrToken: string) =>
    request<{
      valid: boolean;
      message: string;
      passengerName: string;
      seatNumbers: string[];
      origin: string;
      destination: string;
      bookingNumber: string;
      vehicleRegistration: string;
    }>('/tickets/verify', {
      method: 'POST',
      body: JSON.stringify({ qrToken }),
    }),

  // Wallet
  getWallet: () => request<WalletAccount>('/wallet'),
  topupWallet: (amount: number) =>
    request<{ success: boolean; newBalance: number; transaction: any }>('/wallet/topup', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  // Passes
  getPasses: () => request<CommuterPass[]>('/passes'),
  buyPass: (passId: string) =>
    request<{ success: boolean; pass: CommuterPass }>('/passes/buy', {
      method: 'POST',
      body: JSON.stringify({ passId }),
    }),

  // Driver
  getDriverManifest: (tripId: string) =>
    request<{
      trip: TripInstance;
      totalBooked: number;
      boardedCount: number;
      passengers: any[];
    }>(`/driver/manifest/${tripId}`),
  updateDriverLocation: (tripId: string, lat: number, lng: number, heading: number) =>
    request<{ success: boolean; location: any }>('/driver/location', {
      method: 'POST',
      body: JSON.stringify({ tripId, lat, lng, heading }),
    }),

  // Operator
  getOperatorFleet: () => request<{ operator: any; vehicles: Vehicle[]; drivers: any[] }>('/operator/fleet'),
  addVehicle: (registrationNumber: string, model: string, totalCapacity: number) =>
    request<Vehicle>('/operator/vehicles', {
      method: 'POST',
      body: JSON.stringify({ registrationNumber, model, totalCapacity }),
    }),

  // Admin
  getAdminAnalytics: () =>
    request<{
      kpis: any;
      recentBookings: Booking[];
      vehicles: Vehicle[];
      auditLogs: any[];
    }>('/admin/analytics'),
  adminManualAdjustment: (amount: number, reason: string) =>
    request<{ success: boolean; balance: number; auditLog: any }>('/admin/manual-adjustment', {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    }),

  // Support
  getSupportTickets: () => request<SupportTicket[]>('/support/tickets'),
  createSupportTicket: (data: { category: string; title: string; description: string; bookingNumber?: string }) =>
    request<SupportTicket>('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
