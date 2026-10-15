import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_USER,
  INITIAL_OPERATOR,
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_ROUTES,
  INITIAL_TRIPS,
  INITIAL_BOOKINGS,
  INITIAL_WALLET,
  INITIAL_PASSES,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_AUDIT_LOGS,
} from './src/data/mockData';
import {
  Booking,
  BookingHold,
  TripInstance,
  WalletTransaction,
  SupportTicket,
  AuditLogEntry,
  Vehicle,
  BusRoute,
} from './src/types/busway';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-Memory Database store with concurrency controls
interface DatabaseState {
  user: typeof INITIAL_USER;
  operator: typeof INITIAL_OPERATOR;
  vehicles: Vehicle[];
  drivers: typeof INITIAL_DRIVERS;
  routes: BusRoute[];
  trips: TripInstance[];
  bookings: Booking[];
  wallet: typeof INITIAL_WALLET;
  passes: typeof INITIAL_PASSES;
  supportTickets: SupportTicket[];
  auditLogs: AuditLogEntry[];
  activeHolds: Map<string, BookingHold>;
  processedIdempotencyKeys: Set<string>;
}

const db: DatabaseState = {
  user: { ...INITIAL_USER },
  operator: { ...INITIAL_OPERATOR },
  vehicles: [...INITIAL_VEHICLES],
  drivers: [...INITIAL_DRIVERS],
  routes: [...INITIAL_ROUTES],
  trips: [...INITIAL_TRIPS],
  bookings: [...INITIAL_BOOKINGS],
  wallet: { ...INITIAL_WALLET, transactions: [...INITIAL_WALLET.transactions] },
  passes: [...INITIAL_PASSES],
  supportTickets: [...INITIAL_SUPPORT_TICKETS],
  auditLogs: [...INITIAL_AUDIT_LOGS],
  activeHolds: new Map<string, BookingHold>(),
  processedIdempotencyKeys: new Set<string>(),
};

// Periodic cleanup of expired inventory holds (every 30 seconds)
setInterval(() => {
  const now = Date.now();
  for (const [token, hold] of db.activeHolds.entries()) {
    if (new Date(hold.expiresAt).getTime() < now) {
      // Release held capacity back to trip
      const trip = db.trips.find(t => t.id === hold.tripId);
      if (trip) {
        trip.availableCapacity += hold.passengerCount;
      }
      db.activeHolds.delete(token);
    }
  }
}, 30000);

// --- REST API: /api/v1 ---

// Health & System Info
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    platform: 'BUSWAY - Your Smart Shuttle Partner',
    market: 'Kolkata, West Bengal, India',
    timezone: 'Asia/Kolkata',
    timestamp: new Date().toISOString(),
    concurrencySafe: true,
  });
});

// User Profile
app.get('/api/v1/user/profile', (req: Request, res: Response) => {
  res.json(db.user);
});

app.put('/api/v1/user/profile', (req: Request, res: Response) => {
  const { name, phone, email } = req.body;
  if (name) db.user.name = name;
  if (phone) db.user.phone = phone;
  if (email) db.user.email = email;
  res.json({ success: true, user: db.user });
});

// Routes & Stops
app.get('/api/v1/routes', (req: Request, res: Response) => {
  const corridor = req.query.corridor as string | undefined;
  if (corridor && corridor !== 'All') {
    return res.json(db.routes.filter(r => r.corridor.toLowerCase() === corridor.toLowerCase()));
  }
  res.json(db.routes);
});

// Search Published Trips
app.get('/api/v1/trips/search', (req: Request, res: Response) => {
  const { origin, destination } = req.query;

  let results = db.trips.filter(t => t.status !== 'CANCELLED');

  if (origin && typeof origin === 'string') {
    results = results.filter(t => t.origin.toLowerCase().includes(origin.toLowerCase()));
  }

  if (destination && typeof destination === 'string') {
    results = results.filter(t => t.destination.toLowerCase().includes(destination.toLowerCase()));
  }

  res.json(results);
});

// Booking Hold Creation (Concurrency safe, row lock simulation)
app.post('/api/v1/bookings/holds', (req: Request, res: Response) => {
  const { tripId, passengerCount = 1 } = req.body;

  const trip = db.trips.find(t => t.id === tripId);
  if (!trip) {
    return res.status(404).json({ error: 'Trip instance not found' });
  }

  if (trip.availableCapacity < passengerCount) {
    return res.status(409).json({
      error: 'Insufficient capacity available on this shuttle',
      available: trip.availableCapacity,
    });
  }

  // Atomically hold capacity
  trip.availableCapacity -= passengerCount;

  const holdToken = `HOLD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes TTL
  const totalFare = trip.fare * passengerCount;

  const hold: BookingHold = {
    holdToken,
    tripId,
    passengerCount,
    expiresAt,
    totalFare,
  };

  db.activeHolds.set(holdToken, hold);

  res.status(201).json({
    holdToken,
    tripId,
    passengerCount,
    totalFare,
    expiresAt,
    seatsRemaining: trip.availableCapacity,
  });
});

// Confirm Booking from Hold
app.post('/api/v1/bookings', (req: Request, res: Response) => {
  const { holdToken, paymentMethod, idempotencyKey } = req.body;

  if (idempotencyKey && db.processedIdempotencyKeys.has(idempotencyKey)) {
    return res.status(400).json({ error: 'Duplicate request detected (idempotent)' });
  }

  const hold = db.activeHolds.get(holdToken);
  if (!hold) {
    return res.status(400).json({ error: 'Booking hold expired or invalid. Please search again.' });
  }

  if (new Date(hold.expiresAt).getTime() < Date.now()) {
    // Release hold
    const trip = db.trips.find(t => t.id === hold.tripId);
    if (trip) trip.availableCapacity += hold.passengerCount;
    db.activeHolds.delete(holdToken);
    return res.status(410).json({ error: 'Booking hold has expired. Capacity released.' });
  }

  const trip = db.trips.find(t => t.id === hold.tripId);
  if (!trip) {
    return res.status(404).json({ error: 'Associated trip not found' });
  }

  // Payment Check
  if (paymentMethod === 'WALLET') {
    if (db.wallet.availableBalance < hold.totalFare) {
      return res.status(402).json({
        error: 'Insufficient wallet balance',
        availableBalance: db.wallet.availableBalance,
        required: hold.totalFare,
      });
    }

    // Deduct from wallet and append immutable ledger entry
    db.wallet.availableBalance -= hold.totalFare;
    const tx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      type: 'RIDE_DEBIT',
      amount: hold.totalFare,
      description: 'Paid for BUSWAY ride',
      date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
      timestamp: Date.now(),
      balanceAfter: db.wallet.availableBalance,
      referenceId: '',
    };
    db.wallet.transactions.unshift(tx);
  }

  // Allocate seat numbers automatically (e.g. 14A, 14B)
  const seatLetters = ['A', 'B', 'C', 'D'];
  const assignedSeats: string[] = [];
  const startRow = Math.floor(Math.random() * 8) + 10;
  for (let i = 0; i < hold.passengerCount; i++) {
    assignedSeats.push(`${startRow}${seatLetters[i % seatLetters.length]}`);
  }

  const bookingNumber = `BW02NDE0MUZ${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const ticketQrToken = `BW-QR-${bookingNumber}-${trip.vehicleRegistration.replace(/\s+/g, '')}-${Date.now()}`;

  // Update transaction referenceId
  if (paymentMethod === 'WALLET' && db.wallet.transactions[0]) {
    db.wallet.transactions[0].referenceId = bookingNumber;
  }

  const newBooking: Booking = {
    id: `bk_${Date.now()}`,
    bookingNumber,
    userId: db.user.id,
    userName: db.user.name,
    userPhone: db.user.phone,
    tripId: trip.id,
    routeId: trip.routeId,
    origin: trip.origin,
    destination: trip.destination,
    departureDate: trip.departureDate,
    departureTime: trip.departureTime,
    arrivalTime: trip.estimatedArrivalTime,
    vehicleRegistration: trip.vehicleRegistration,
    vehicleModel: 'Tata Starbus',
    driverName: trip.driverName,
    driverPhone: '+91 98310 99412',
    driverRating: trip.driverRating,
    seatNumbers: assignedSeats,
    passengerCount: hold.passengerCount,
    fare: hold.totalFare,
    paymentStatus: 'SUCCESS',
    bookingStatus: 'CONFIRMED',
    paymentMethod: paymentMethod || 'WALLET',
    ticketQrToken,
    createdAt: new Date().toISOString(),
    isCheckedIn: false,
  };

  db.bookings.unshift(newBooking);
  db.activeHolds.delete(holdToken);

  if (idempotencyKey) {
    db.processedIdempotencyKeys.add(idempotencyKey);
  }

  res.status(201).json(newBooking);
});

// Bookings List
app.get('/api/v1/bookings', (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  if (status) {
    return res.json(db.bookings.filter(b => b.bookingStatus === status));
  }
  res.json(db.bookings);
});

// Booking Details
app.get('/api/v1/bookings/:id', (req: Request, res: Response) => {
  const booking = db.bookings.find(b => b.id === req.params.id || b.bookingNumber === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking);
});

// Cancel Booking & Process Instant Refund to Wallet
app.post('/api/v1/bookings/:id/cancel', (req: Request, res: Response) => {
  const booking = db.bookings.find(b => b.id === req.params.id || b.bookingNumber === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (booking.bookingStatus === 'CANCELLED') {
    return res.status(400).json({ error: 'Booking is already cancelled' });
  }

  if (booking.bookingStatus === 'COMPLETED') {
    return res.status(400).json({ error: 'Cannot cancel a completed ride' });
  }

  booking.bookingStatus = 'CANCELLED';
  booking.paymentStatus = 'REFUNDED';
  booking.refundAmount = booking.fare;

  // Release seat capacity back to trip
  const trip = db.trips.find(t => t.id === booking.tripId);
  if (trip) {
    trip.availableCapacity += booking.passengerCount;
  }

  // Credit refund amount back to wallet
  db.wallet.availableBalance += booking.fare;
  const refundTx: WalletTransaction = {
    id: `tx_${Date.now()}`,
    type: 'REFUND',
    amount: booking.fare,
    description: `Refund for cancelled trip ${booking.bookingNumber}`,
    date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
    timestamp: Date.now(),
    balanceAfter: db.wallet.availableBalance,
    referenceId: booking.bookingNumber,
  };
  db.wallet.transactions.unshift(refundTx);

  res.json({
    success: true,
    message: 'Booking cancelled successfully. Refund credited to BUSWAY wallet.',
    booking,
  });
});

// Ticket Verification Endpoint (Used by Driver / Conductor QR Scanner)
app.post('/api/v1/tickets/verify', (req: Request, res: Response) => {
  const { qrToken } = req.body;
  if (!qrToken) return res.status(400).json({ error: 'Missing QR Token' });

  const booking = db.bookings.find(b => b.ticketQrToken === qrToken);
  if (!booking) {
    return res.status(404).json({ valid: false, error: 'Invalid or fraudulent ticket token' });
  }

  if (booking.bookingStatus === 'CANCELLED') {
    return res.status(400).json({ valid: false, error: 'Ticket is CANCELLED and refunded' });
  }

  if (booking.isCheckedIn) {
    return res.status(409).json({
      valid: false,
      error: `Ticket already scanned and boarded at ${booking.checkedInAt}`,
      booking,
    });
  }

  booking.isCheckedIn = true;
  booking.checkedInAt = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });

  res.json({
    valid: true,
    message: 'Passenger ticket verified & boarded successfully',
    passengerName: booking.userName,
    seatNumbers: booking.seatNumbers,
    origin: booking.origin,
    destination: booking.destination,
    bookingNumber: booking.bookingNumber,
    vehicleRegistration: booking.vehicleRegistration,
  });
});

// Wallet & Sandbox Top-Up
app.get('/api/v1/wallet', (req: Request, res: Response) => {
  res.json(db.wallet);
});

app.post('/api/v1/wallet/topup', (req: Request, res: Response) => {
  const { amount } = req.body;
  const topupAmount = parseFloat(amount);
  if (isNaN(topupAmount) || topupAmount <= 0) {
    return res.status(400).json({ error: 'Invalid amount for top-up' });
  }

  db.wallet.availableBalance += topupAmount;
  const tx: WalletTransaction = {
    id: `tx_${Date.now()}`,
    type: 'TOPUP',
    amount: topupAmount,
    description: 'Added to Wallet',
    date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
    timestamp: Date.now(),
    balanceAfter: db.wallet.availableBalance,
    referenceId: `PAY-RZP-${Math.floor(10000000 + Math.random() * 90000000)}`,
  };

  db.wallet.transactions.unshift(tx);

  res.json({
    success: true,
    newBalance: db.wallet.availableBalance,
    transaction: tx,
  });
});

// Passes Catalog & Purchase
app.get('/api/v1/passes', (req: Request, res: Response) => {
  res.json(db.passes);
});

app.post('/api/v1/passes/buy', (req: Request, res: Response) => {
  const { passId } = req.body;
  const pass = db.passes.find(p => p.id === passId);
  if (!pass) return res.status(404).json({ error: 'Pass not found' });

  if (db.wallet.availableBalance < pass.price) {
    return res.status(402).json({ error: 'Insufficient balance to purchase pass' });
  }

  db.wallet.availableBalance -= pass.price;
  pass.isActive = true;
  pass.remainingRides = pass.totalRides;

  const tx: WalletTransaction = {
    id: `tx_${Date.now()}`,
    type: 'RIDE_DEBIT',
    amount: pass.price,
    description: `Purchased ${pass.title}`,
    date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
    timestamp: Date.now(),
    balanceAfter: db.wallet.availableBalance,
    referenceId: `PASS-${Date.now()}`,
  };
  db.wallet.transactions.unshift(tx);

  res.json({ success: true, pass });
});

// Driver Manifest & Operations
app.get('/api/v1/driver/manifest/:tripId', (req: Request, res: Response) => {
  const trip = db.trips.find(t => t.id === req.params.tripId);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const passengers = db.bookings
    .filter(b => b.tripId === trip.id && b.bookingStatus !== 'CANCELLED')
    .map(b => ({
      bookingNumber: b.bookingNumber,
      passengerName: b.userName,
      phone: b.userPhone,
      seatNumbers: b.seatNumbers,
      pickupStop: b.origin,
      dropStop: b.destination,
      isCheckedIn: b.isCheckedIn,
      ticketQrToken: b.ticketQrToken,
    }));

  res.json({
    trip,
    totalBooked: passengers.length,
    boardedCount: passengers.filter(p => p.isCheckedIn).length,
    passengers,
  });
});

// Driver Location Update Simulation
app.post('/api/v1/driver/location', (req: Request, res: Response) => {
  const { tripId, lat, lng, heading } = req.body;
  const trip = db.trips.find(t => t.id === tripId);
  if (trip) {
    trip.currentLocation = {
      lat: lat || trip.currentLocation?.lat || 22.6515,
      lng: lng || trip.currentLocation?.lng || 88.3475,
      heading: heading || 115,
      lastUpdated: 'Just now',
    };
    return res.json({ success: true, location: trip.currentLocation });
  }
  res.status(404).json({ error: 'Trip not found' });
});

// Operator Fleet & Compliance
app.get('/api/v1/operator/fleet', (req: Request, res: Response) => {
  res.json({
    operator: db.operator,
    vehicles: db.vehicles,
    drivers: db.drivers,
  });
});

app.post('/api/v1/operator/vehicles', (req: Request, res: Response) => {
  const { registrationNumber, model, totalCapacity } = req.body;
  const newVeh: Vehicle = {
    id: `veh_${Date.now()}`,
    registrationNumber: registrationNumber || 'WB 25 ' + Math.floor(1000 + Math.random() * 9000),
    model: model || 'Tata Starbus Ultra AC',
    color: 'White & Blue',
    totalCapacity: totalCapacity || 32,
    operatorId: db.operator.id,
    fitnessValidUntil: '2027-10-15',
    insuranceValidUntil: '2027-10-15',
    permitValidUntil: '2027-04-15',
    isCompliant: true,
  };
  db.vehicles.push(newVeh);
  db.operator.totalVehicles += 1;
  res.status(201).json(newVeh);
});

// Admin Analytics & Controls
app.get('/api/v1/admin/analytics', (req: Request, res: Response) => {
  const totalRevenue = db.bookings
    .filter(b => b.paymentStatus === 'SUCCESS')
    .reduce((sum, b) => sum + b.fare, 0);

  const totalBookings = db.bookings.length;
  const completedRides = db.bookings.filter(b => b.bookingStatus === 'COMPLETED').length;
  const cancelledRides = db.bookings.filter(b => b.bookingStatus === 'CANCELLED').length;
  const activeBookings = db.bookings.filter(b => b.bookingStatus === 'CONFIRMED').length;

  res.json({
    kpis: {
      totalRevenue: totalRevenue + 12840, // baseline synthetic volume
      totalBookings: totalBookings + 142,
      completedRides: completedRides + 130,
      cancelledRides: cancelledRides + 5,
      activeBookings,
      onTimePerformanceRate: 98.4,
      avgSeatOccupancyPercent: 86.2,
      activeShuttlesOnRoad: 14,
    },
    recentBookings: db.bookings.slice(0, 10),
    vehicles: db.vehicles,
    auditLogs: db.auditLogs.slice(0, 15),
  });
});

// Admin Manual Wallet Adjustment with mandatory audit log
app.post('/api/v1/admin/manual-adjustment', (req: Request, res: Response) => {
  const { amount, reason, actorEmail = 'admin@busway.in' } = req.body;
  if (!reason || reason.trim().length < 5) {
    return res.status(400).json({ error: 'A specific reason is mandatory for financial adjustments' });
  }

  const adjAmount = parseFloat(amount);
  if (isNaN(adjAmount)) return res.status(400).json({ error: 'Invalid adjustment amount' });

  const prev = db.wallet.availableBalance;
  db.wallet.availableBalance += adjAmount;

  const log: AuditLogEntry = {
    id: `aud_${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail,
    actorRole: 'finance',
    action: 'MANUAL_FINANCIAL_ADJUSTMENT',
    targetResource: db.user.id,
    reason,
    previousValue: `₹${prev.toFixed(2)}`,
    newValue: `₹${db.wallet.availableBalance.toFixed(2)}`,
  };
  db.auditLogs.unshift(log);

  res.json({ success: true, balance: db.wallet.availableBalance, auditLog: log });
});

// Support Tickets
app.get('/api/v1/support/tickets', (req: Request, res: Response) => {
  res.json(db.supportTickets);
});

app.post('/api/v1/support/tickets', (req: Request, res: Response) => {
  const { category, title, description, bookingNumber } = req.body;
  const newTicket: SupportTicket = {
    id: `tic_${Date.now()}`,
    userId: db.user.id,
    category: category || 'GENERAL',
    title: title || 'Support Inquiry',
    description: description || '',
    bookingNumber,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  };
  db.supportTickets.unshift(newTicket);
  res.status(201).json(newTicket);
});

// Start Full-Stack Server with Vite Middlewares
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BUSWAY] Production server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[BUSWAY] Server initialization failed:', err);
  process.exit(1);
});
