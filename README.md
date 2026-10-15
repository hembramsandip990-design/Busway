# BUSWAY — Your Smart Shuttle Partner

A production-ready full-stack office commuter shuttle booking platform designed for Kolkata tech corridors (Sector V, New Town, Ecospace), inspired by the BUSWAY mobile UI design.

---

## 🚌 Features & Architecture

### 1. Passenger Mobile & Desktop Application
- **Home Dashboard**: Modern dark navy theme (`#102A43`), bright orange primary CTA (`#F28C28`), blue accents (`#3B82F6`), Kolkata Vidyasagar Setu hero banner, quick actions (My Bookings, Passes, Wallet, Support), and live upcoming shuttle card.
- **Shuttle Search & Booking Engine**: One-way/return toggle, origin/destination inputs with swap button, travel date, seat passenger count stepper, and popular route tags (`Bally → Sector V`, `Sonarpur → New Town`, `Garia → Sector V`, `Barrackpore → Sector V`, `Serampore → Ecospace`).
- **Atomic Concurrency-Safe Holds**: 5-minute seat reservation TTL (`/api/v1/bookings/holds`), atomic capacity decrement with rollback on expiration or cancellation, and automatic seat assignment (`14A`, `14B`, etc.).
- **Trips Activity & Ride History**: Segmented views matching reference mockups with date badge (`08-OCT-26 THU 08:30 AM`), West Bengal yellow license badge (`WB 25 3751`), blue booking reference (`BW02NDE0MUZN6R67U6GB`), status badges (`Booked`, `Cancelled`, `Completed`), and repeat booking action.
- **Digital Ticket Details**: Checkmark banner, white ticket cutout card with scannable cryptographic QR code (rendered via `qrcode`), vehicle plate badge, seat numbers, fare breakdown, and instant download/share buttons.
- **Live Ride Tracking**: Real-time animated Kolkata route map with live moving shuttle bus marker between Bally and Sector V, pickup/drop pins, re-center button, driver card with avatar (`Ramesh Kumar`, ⭐ 4.8), vehicle badge, and phone/chat communication.
- **Digital Wallet & Immutable Ledger**: Available balance (`₹82.00`), promotional credits, one-click sandbox top-up with preset amounts (₹100, ₹200, ₹500, ₹1000), and complete debit/credit transaction history ledger.
- **Commuter Passes & Subscriptions**: Monthly & weekly discount passes with remaining rides counter and validity tracking.
- **Comprehensive Support Desk**: Issue reporting, refund requests with instant wallet credit, lost-item reports, feedback, and interactive FAQs.
- **Profile & Persona Switcher**: User management with avatar (`Sandip Hembram`), saved pickup locations, notification preferences, and seamless persona switching (Passenger, Driver, Operator, Admin).
- **All Routes Catalog**: Searchable route catalog with corridor filters (`All`, `Sector V`, `New Town`, `Ecospace`).

---

### 2. Driver Portal & Concurrency-Safe Ticket Scanner
- Assigned daily manifests with total passenger counts.
- Real-time QR Code Scanner / Manual Token verification with `/api/v1/tickets/verify`, preventing double-scans and unauthorized boarding.
- Trip status toggle (Start Trip / In Progress) and live GPS coordinates broadcasting simulator.

---

### 3. Fleet & Operator Portal
- Operator compliance verification (`Bengal Transit Link Fleet Co.`).
- Fleet roster with vehicle badges (`WB 25 3751`, `WB 25 4021`, `WB 25 8192`).
- Regulatory document monitoring (Fitness Certificate, Commercial Permit, Insurance) with expiration alerts.
- New vehicle registration and route proposal submission.

---

### 4. Admin Operations & Superadministrator Console
- Real-time KPI analytics (Total Revenue, Seat Occupancy %, On-Time Performance %, Active Bookings).
- Live booking ledger stream.
- Mandatory reason-backed Manual Financial Adjustment tool with immutable audit logging.
- Audit trail inspector (`/api/v1/admin/audit-logs`).
- 1-click CSV report export for financial and operational reconciliation.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, QRCode.
- **Backend**: Express 4.x running on Port 3000 alongside Vite middlewares (`tsx server.ts`).
- **REST API**: Documented `/api/v1` endpoints with JSON schemas, concurrency-safe holds, and idempotency protection.
- **Testing**: Automated concurrency testing script (`scripts/test-booking-concurrency.ts`) and k6 load-testing script (`scripts/load-test-k6.js`).

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start full-stack development server (Express + Vite)
npm run dev

# 3. Compile & Typecheck
npm run build
npm run lint
```

---

## 🧪 Running Concurrency Verification

```bash
# Run simultaneous inventory hold test to verify no overbooking
npx tsx scripts/test-booking-concurrency.ts
```
