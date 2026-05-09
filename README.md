# Black Excellence Enterprises (BEE)

Digital home for Black Excellence Enterprises holding company and its subsidiaries:

- **UFirst Limos** — Premium limousine service (Maryland, DC, Virginia, Pennsylvania)
- **K & J Sound Company** — Professional audio and event production

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + BEE Design System
- **Database:** Supabase (PostgreSQL)
- **Payments/CRM/Bookings:** Square Appointments API
- **Deployment:** Vercel

---

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. npm or yarn package manager
3. Square Developer account (see setup below)
4. Supabase account (free tier)

### Square Developer Account Setup

1. **Create Square Developer Account**
   - Go to [developer.squareup.com](https://developer.squareup.com)
   - Sign in with your Square Seller account or create a new one

2. **Enable the Appointments API**
   - In the Square Developer Dashboard, go to **Applications**
   - Select your application (or create a new one)
   - Navigate to **Products** → **Appointments**
   - Click "Enable"

3. **Get Your Credentials**
   - Go to **Credentials** in your application
   - Copy the **Production** or **Sandbox** access token
   - Copy the **Application ID** and **Location ID**

4. **Configure Webhooks (for calendar sync)**
   - Go to **Webhooks** in your application
   - Click **Add Webhook**
   - Set the URL to: `https://your-domain.com/api/square/webhook`
   - Subscribe to events:
     - `booking.created`
     - `booking.updated`
     - `booking.cancelled`

### Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project (free tier)
   - Choose a region near your users

2. **Get Your API Keys**
   - In Supabase Dashboard, go to **Settings** → **API**
   - Copy the `Project URL`, `anon public` key, and `service_role` key

3. **Run Database Migrations**
   - Open the Supabase SQL Editor
   - Copy the contents of `/supabase/schema.sql`
   - Run the SQL to create all tables, indexes, and seed data

### Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# Also accepted: SUPABASE_SERVICE_KEY

# Square
NEXT_PUBLIC_SQUARE_ENVIRONMENT=sandbox
SQUARE_ACCESS_TOKEN=your-access-token
# Also accepted: SQUARE_ACCESS_KEY
SQUARE_APPLICATION_ID=your-app-id
SQUARE_LOCATION_ID=your-location-id
SQUARE_TEAM_MEMBER_ID=optional-default-bookable-team-member-id
SQUARE_WEBHOOK_SIGNATURE_KEY=your-webhook-key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_LIMO_URL=http://localhost:3000/limo
```

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

- **Holding Company:** [http://localhost:3000](http://localhost:3000)
- **UFirst Limos:** [http://localhost:3000/limo](http://localhost:3000/limo)

---

## API Reference

### Booking Endpoints

#### `POST /api/booking` — Create Booking

Creates a new booking in Supabase and returns confirmation.

**Request:**
```json
{
  "vehicleId": "uuid",
  "vehicleSlug": "black-stretch-limo",
  "date": "2026-04-15",
  "time": "14:00",
  "serviceType": "hourly",
  "serviceArea": "MD",
  "customerName": "John Smith",
  "customerEmail": "john@example.com",
  "customerPhone": "+14155551234",
  "pickupLocation": "BWI Airport",
  "dropoffLocation": "123 Main St",
  "specialRequests": "Champagne service"
}
```

**Response:**
```json
{
  "success": true,
  "booking": { ... },
  "message": "Booking request received. We'll contact you shortly."
}
```

#### `GET /api/booking?id=xxx` — Get Booking

Fetch a booking by ID or customer email.

```
GET /api/booking?id=booking-uuid
GET /api/booking?email=john@example.com
```

---

### Availability Endpoints

#### `POST /api/availability` — Check Single Date

```json
POST /api/availability
{
  "vehicleId": "uuid",
  "date": "2026-04-15"
}
```

#### `GET /api/availability` — Check Date Range

```
GET /api/availability?vehicleIds=uuid1,uuid2&startDate=2026-04-01&endDate=2026-04-30
```

**Response:**
```json
{
  "success": true,
  "availability": {
    "uuid1": {
      "2026-04-15": { "available": false, "status": "reserved" }
    }
  }
}
```

---

### Square Webhooks

#### `POST /api/square/webhook` — Webhook Handler

Receives events from Square for booking sync.

**Events Handled:**
- `booking.created` — Creates availability block
- `booking.updated` — Updates booking status
- `booking.cancelled` — Removes availability block

**Setup in Square Dashboard:**
1. Go to **Webhooks**
2. Add webhook URL: `https://your-domain.com/api/square/webhook`
3. Subscribe to booking events

---

### Square API Routes

#### `POST /api/square/customer` — Create/Get Customer

```json
POST /api/square/customer
{
  "emailAddress": "customer@example.com",
  "givenName": "John",
  "familyName": "Smith",
  "phoneNumber": "+14155551234"
}
```

#### `POST /api/square/booking` — Create Square Booking

```json
POST /api/square/booking
{
  "customerId": "square-customer-id",
  "startAt": "2026-04-15T14:00:00Z",
  "serviceVariationId": "your-service-variation-id",
  "customerNote": "Champagne service requested"
}
```

---

## Project Structure

```
bee-holding/
├── app/
│   ├── page.tsx              # Holding company (/)
│   ├── limo/page.tsx         # UFirst Limos (/limo)
│   └── api/
│       ├── booking/           # Booking CRUD
│       ├── availability/      # Calendar queries
│       └── square/            # Square integration
│           ├── webhook/       # Webhook handler
│           ├── booking/        # Square booking API
│           └── customer/       # Square customer API
├── components/
│   ├── modals/               # About, Companies, Contact
│   ├── holding-company/      # Hero, Navigation
│   └── limo/                # Fleet, Booking, Reviews
├── lib/
│   ├── supabase.ts          # Supabase client + types
│   ├── store.ts             # Zustand state
│   └── schemas.ts           # JSON-LD schemas
└── supabase/
    └── schema.sql           # Database schema + seed data
```

---

## Design System

See [BEE_DESIGN.md](./BEE_DESIGN.md) for the full design system.

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#0e0e0e` | Base background |
| Surface | `#131313` | Section backgrounds |
| Surface High | `#1f2020` | Card backgrounds |
| Primary | `#c6c6c6` | Headlines, text |
| Tertiary | `#9cff93` | Status indicators |
| Lime | `#BDDB37` | UFirst Limo CTAs |

### Typography

- **Display:** Space Grotesk (headlines)
- **Body:** Manrope (paragraphs)
- **Mono:** JetBrains Mono (technical)

---

## Fleet & Pricing

| Vehicle | Type | Capacity | Hourly (Local) | Hourly (Distance) |
|---------|------|----------|----------------|------------------|
| Black Stretch Limo | Stretch Limo | 8 | $140 | $170 |
| White Stretch Limo | Stretch Limo | 8 | $140 | $170 |
| Escalade ESV | SUV | 6 | $170 | $200 |
| Escalade V | SUV | 6 | $165 | $195 |
| Mercedes S-Class | Sedan | 4 | $140 | $170 |

**4-Hour Block:** $510 (local) / $680 (distance)

### Service Areas

| State | Base Fee |
|-------|----------|
| Maryland | $0 |
| DC | +$25 |
| Virginia | +$50 |
| Pennsylvania | +$75 |

---

## Deployment

```bash
# Deploy to Vercel
npm i -g vercel
vercel
```

Set environment variables in Vercel dashboard: **Settings** → **Environment Variables**.

---

## License

Proprietary — Black Excellence Enterprises
