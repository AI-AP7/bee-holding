-- Black Excellence Enterprises Database Schema
-- Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vehicle fleet configuration
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('stretch_limo', 'suv', 'sedan', 'party_bus')),
  description TEXT,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  luggage_capacity INTEGER NOT NULL CHECK (luggage_capacity >= 0),
  hourly_rate_local DECIMAL(10,2) NOT NULL CHECK (hourly_rate_local > 0),
  hourly_rate_distance DECIMAL(10,2) NOT NULL CHECK (hourly_rate_distance > 0),
  four_hour_block_local DECIMAL(10,2) CHECK (four_hour_block_local > 0),
  four_hour_block_distance DECIMAL(10,2) CHECK (four_hour_block_distance > 0),
  min_hours INTEGER DEFAULT 1,
  image_url TEXT,
  features JSONB DEFAULT '[]',
  square_service_variation_id TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add is_active column if it doesn't exist (for existing databases)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'is_active') THEN
    ALTER TABLE vehicles ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'square_service_variation_id') THEN
    ALTER TABLE vehicles ADD COLUMN square_service_variation_id TEXT UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'min_hours') THEN
    ALTER TABLE vehicles ADD COLUMN min_hours INTEGER DEFAULT 1;
  END IF;
  
  -- Update type constraint if necessary
  ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_type_check;
  ALTER TABLE vehicles ADD CONSTRAINT vehicles_type_check CHECK (type IN ('stretch_limo', 'suv', 'sedan', 'party_bus'));
END $$;

-- Availability blocks (blocks booking slots including buffer time)
CREATE TABLE IF NOT EXISTS availability_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  block_date DATE NOT NULL,
  block_type TEXT NOT NULL CHECK (block_type IN ('booking', 'reserved', 'maintenance', 'unavailable')),
  square_booking_id TEXT,
  start_time TIME,
  end_time TIME,
  buffer_minutes INTEGER DEFAULT 60,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vehicle_id, block_date, square_booking_id)
);

-- Service area configuration
CREATE TABLE IF NOT EXISTS service_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state_code TEXT NOT NULL CHECK (state_code IN ('MD', 'DC', 'VA', 'PA')),
  state_name TEXT NOT NULL,
  county TEXT,
  base_fee DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(state_code, county)
);

-- Reviews and testimonials
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  source TEXT DEFAULT 'website' CHECK (source IN ('google', 'yelp', 'facebook', 'website', 'other')),
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking references (links to Square, tracks our internal metadata)
CREATE TABLE IF NOT EXISTS booking_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  square_booking_id TEXT UNIQUE NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  service_type TEXT CHECK (service_type IN ('hourly', 'point_to_point')),
  service_area TEXT,
  pickup_location TEXT,
  dropoff_location TEXT,
  total_hours DECIMAL(4,2),
  total_price DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'pending_payment', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  square_customer_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  ALTER TABLE booking_references DROP CONSTRAINT IF EXISTS booking_references_status_check;
  ALTER TABLE booking_references ADD CONSTRAINT booking_references_status_check
    CHECK (status IN ('pending', 'pending_payment', 'confirmed', 'in_progress', 'completed', 'cancelled'));
END $$;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_availability_vehicle_date ON availability_blocks(vehicle_id, block_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_availability_vehicle_date_unique_block
  ON availability_blocks(vehicle_id, block_date);
CREATE INDEX IF NOT EXISTS idx_availability_blocks_date ON availability_blocks(block_date);
CREATE INDEX IF NOT EXISTS idx_vehicles_active ON vehicles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type);
CREATE INDEX IF NOT EXISTS idx_booking_references_date ON booking_references(booking_date);
CREATE INDEX IF NOT EXISTS idx_booking_references_vehicle ON booking_references(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_service_areas_active ON service_areas(is_active) WHERE is_active = true;

-- Row Level Security (RLS) policies

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_references ENABLE ROW LEVEL SECURITY;

-- Public read access for vehicles, service areas (for booking page)
DROP POLICY IF EXISTS "Public can view active vehicles" ON vehicles;
CREATE POLICY "Public can view active vehicles"
  ON vehicles FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Public can view service areas" ON service_areas;
CREATE POLICY "Public can view service areas"
  ON service_areas FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Public can view approved reviews" ON reviews;
CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

DROP POLICY IF EXISTS "Public can view availability blocks" ON availability_blocks;
CREATE POLICY "Public can view availability blocks"
  ON availability_blocks FOR SELECT
  USING (true);

-- Service role has full access (for API routes)
DROP POLICY IF EXISTS "Service role full access vehicles" ON vehicles;
CREATE POLICY "Service role full access vehicles"
  ON vehicles FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access availability" ON availability_blocks;
CREATE POLICY "Service role full access availability"
  ON availability_blocks FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access service_areas" ON service_areas;
CREATE POLICY "Service role full access service_areas"
  ON service_areas FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access reviews" ON reviews;
CREATE POLICY "Service role full access reviews"
  ON reviews FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access booking_references" ON booking_references;
CREATE POLICY "Service role full access booking_references"
  ON booking_references FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vehicles_updated_at ON vehicles;
CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS booking_references_updated_at ON booking_references;
CREATE TRIGGER booking_references_updated_at
  BEFORE UPDATE ON booking_references
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to check vehicle availability for a date
CREATE OR REPLACE FUNCTION check_vehicle_availability(p_vehicle_id UUID, p_date DATE)
RETURNS JSONB AS $$
DECLARE
  v_blocks INTEGER;
  v_vehicle_record RECORD;
  v_status TEXT;
BEGIN
  -- Get vehicle info
  SELECT * INTO v_vehicle_record FROM vehicles WHERE id = p_vehicle_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('available', false, 'reason', 'Vehicle not found');
  END IF;
  
  -- Any availability block means the vehicle cannot be booked for this date.
  SELECT
    COUNT(*),
    CASE
      WHEN COUNT(*) FILTER (WHERE block_type = 'booking') > 0 THEN 'booking'
      ELSE MAX(block_type)
    END
  INTO v_blocks, v_status
  FROM availability_blocks
  WHERE vehicle_id = p_vehicle_id
    AND block_date = p_date;
  
  IF v_blocks > 0 THEN
    RETURN jsonb_build_object(
      'available', false,
      'vehicle', v_vehicle_record.name,
      'status', CASE WHEN v_status = 'booking' THEN 'reserved' ELSE 'unavailable' END
    );
  ELSE
    RETURN jsonb_build_object(
      'available', true,
      'vehicle', v_vehicle_record.name,
      'status', 'ready'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed data: Vehicles
INSERT INTO vehicles (name, slug, type, description, capacity, luggage_capacity, hourly_rate_local, hourly_rate_distance, four_hour_block_local, four_hour_block_distance, image_url, features, display_order, is_active, min_hours) VALUES
(
  'Black Stretch Limo',
  'black-stretch-limo',
  'stretch_limo',
  'Our flagship black stretch limousine offers an unparalleled luxury experience. Perfect for weddings, proms, corporate events, and special occasions.',
  8,
  4,
  140.00,
  170.00,
  510.00,
  680.00,
  '/black_stretch.jpg',
  '["Leather interior", "Privacy partition", "Champagne bar", "Premium sound system", "LED mood lighting", "Tinted windows"]',
  1,
  true,
  1
),
(
  'White Stretch Limo',
  'white-stretch-limo',
  'stretch_limo',
  'The elegant white stretch limousine combines classic sophistication with modern amenities. Ideal for bridal parties and luxury transportation.',
  12,
  4,
  160.00,
  190.00,
  560.00,
  720.00,
  '/white_stretch.webp',
  '["Leather interior", "Privacy partition", "Champagne bar", "Premium sound system", "Fiber optic lighting", "Tinted windows"]',
  2,
  true,
  4
),
(
  'Escalade',
  'escalade-esv',
  'suv',
  'The Cadillac Escalade provides expansive luxury with extra cargo space. Perfect for larger groups or those needing additional luggage capacity.',
  6,
  6,
  170.00,
  200.00,
  600.00,
  750.00,
  '/cadilac_esv.jpg',
  '["Plush leather seats", "Third row seating", "Entertainment system", "Extra luggage space", "Climate control", "WiFi hotspot"]',
  3,
  true,
  4
),
(
  'Escalade V',
  'escalade-v',
  'suv',
  'The standard wheelbase Cadillac Escalade delivers refined luxury with sporty handling. Great for airport transfers and city tours.',
  6,
  5,
  165.00,
  195.00,
  580.00,
  720.00,
  '/cad_v.jpeg',
  '["Premium leather seats", "Panoramic sunroof", "Entertainment system", "Ample luggage space", "Advanced safety features"]',
  4,
  false,
  4
),
(
  'Mercedes S-Class',
  'mercedes-s-class',
  'sedan',
  'The Mercedes S-Class represents the pinnacle of luxury sedan engineering. Perfect for executive transportation and intimate celebrations.',
  4,
  3,
  160.00,
  190.00,
  560.00,
  680.00,
  '/s-class.webp',
  '["Executive leather interior", "Massage seats", "Premium sound system", "Privacy glass", "Climate control", "USB charging"]',
  5,
  true,
  4
),
(
  'Party Bus',
  'party-bus',
  'party_bus',
  'Our luxury party bus accommodates up to 20 passengers with a full entertainment system, LED lighting, and premium sound. Perfect for bachelor/bachelorette parties, group celebrations, and night-on-the-town events.',
  20,
  10,
  230.00,
  270.00,
  820.00,
  1000.00,
  '/party-bus.jpg',
  '["Premium sound system", "LED mood lighting", "Dance floor", "Privacy partition", "Bar area", "Climate control", "Entertainment system"]',
  6,
  true,
  4
)
ON CONFLICT (slug) DO UPDATE SET
  hourly_rate_local = EXCLUDED.hourly_rate_local,
  four_hour_block_local = EXCLUDED.four_hour_block_local,
  min_hours = EXCLUDED.min_hours;

-- Seed data: Service areas
INSERT INTO service_areas (state_code, state_name, base_fee) VALUES
('MD', 'Maryland', 0),
('DC', 'District of Columbia', 25),
('VA', 'Virginia', 50),
('PA', 'Pennsylvania', 75)
ON CONFLICT (state_code, county) DO NOTHING;

-- Seed data: Sample approved reviews
INSERT INTO reviews (vehicle_id, reviewer_name, rating, comment, source, is_approved, is_featured)
SELECT 
  v.id,
  'Michael T.',
  5,
  'Absolutely exceptional service! The black stretch limo was immaculate and the driver was professional. Made our wedding day even more special.',
  'google',
  true,
  true
FROM vehicles v WHERE v.slug = 'black-stretch-limo';

INSERT INTO reviews (vehicle_id, reviewer_name, rating, comment, source, is_approved, is_featured)
SELECT 
  v.id,
  'Jennifer L.',
  5,
  'Used the Escalade for airport pickup. The driver was waiting with a sign, helped with luggage, and the ride was incredibly smooth. Will definitely book again!',
  'google',
  true,
  true
FROM vehicles v WHERE v.slug = 'escalade-esv';

INSERT INTO reviews (vehicle_id, reviewer_name, rating, comment, source, is_approved, is_featured)
SELECT 
  v.id,
  'David R.',
  5,
  'Booked the Mercedes for a business meeting. Top-notch service from start to finish. The car was perfect and the driver was punctual and discreet.',
  'yelp',
  true,
  true
FROM vehicles v WHERE v.slug = 'mercedes-s-class';
