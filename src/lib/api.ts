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
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('busway_auth_token') : null;

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  // Authentication & Account
  login: (identifier: string, pass: string) =>
    request<{ success: boolean; user: UserProfile; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password: pass }),
    }),
  signup: (data: { name: string; email: string; phone: string; password?: string }) =>
    request<{ success: boolean; user: UserProfile; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logout: () =>
    request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  forgotPassword: (identifier: string) =>
    request<{ success: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    }),
  resetPassword: (identifier: string, otp: string, newPass: string) =>
    request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ identifier, otp, newPassword: newPass }),
    }),
  exportUserData: () =>
    request<{ success: boolean; data: any }>('/auth/export-data'),
  deleteUserAccount: () =>
    request<{ success: boolean; message: string }>('/auth/delete-account', {
      method: 'POST',
    }),

  // User Profile
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
  getTripLiveTracking: (tripId: string) =>
    request<{
      trip: TripInstance;
      location: any;
      isStale: boolean;
    }>(`/trips/${tripId}/live-tracking`),

  // Operator
  getOperatorFleet: () => request<{ operator: any; vehicles: Vehicle[]; drivers: any[] }>('/operator/fleet'),
  addVehicle: (registrationNumber: string, model: string, totalCapacity: number) =>
    request<Vehicle>('/operator/vehicles', {
      method: 'POST',
      body: JSON.stringify({ registrationNumber, model, totalCapacity }),
    }),

  // Admin & Operations Control
  getAdminAnalytics: () =>
    request<{
      kpis: any;
      recentBookings: Booking[];
      vehicles: Vehicle[];
      auditLogs: any[];
      isBookingsPaused: boolean;
      emergencyPauseNotice?: string;
    }>('/admin/analytics'),
  adminManualAdjustment: (amount: number, reason: string) =>
    request<{ success: boolean; balance: number; auditLog: any }>('/admin/manual-adjustment', {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    }),
  toggleEmergencyPause: (paused: boolean, reason: string) =>
    request<{ success: boolean; isBookingsPaused: boolean; notice: string }>('/admin/emergency-pause', {
      method: 'POST',
      body: JSON.stringify({ paused, reason }),
    }),
  toggleRoutePublish: (routeId: string, publish: boolean) =>
    request<{ success: boolean; route: BusRoute }>('/admin/routes/publish', {
      method: 'POST',
      body: JSON.stringify({ routeId, publish }),
    }),

  // Support
  getSupportTickets: () => request<SupportTicket[]>('/support/tickets'),
  createSupportTicket: (data: { category: string; title: string; description: string; bookingNumber?: string }) =>
    request<SupportTicket>('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
