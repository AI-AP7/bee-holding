-- Black Excellence Enterprises Database Schema
-- Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vehicle fleet configuration
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('stretch_limo', 'suv', 'sedan')),
  description TEXT,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  luggage_capacity INTEGER NOT NULL CHECK (luggage_capacity >= 0),
  hourly_rate_local DECIMAL(10,2) NOT NULL CHECK (hourly_rate_local > 0),
  hourly_rate_distance DECIMAL(10,2) NOT NULL CHECK (hourly_rate_distance > 0),
  four_hour_block_local DECIMAL(10,2) CHECK (four_hour_block_local > 0),
  four_hour_block_distance DECIMAL(10,2) CHECK (four_hour_block_distance > 0),
  image_url TEXT,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Availability blocks (blocks booking slots including buffer time)
CREATE TABLE availability_blocks (
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
CREATE TABLE service_areas (
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
CREATE TABLE reviews (
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
CREATE TABLE booking_references (
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
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  square_customer_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_availability_vehicle_date ON availability_blocks(vehicle_id, block_date);
CREATE INDEX idx_availability_blocks_date ON availability_blocks(block_date);
CREATE INDEX idx_vehicles_active ON vehicles(is_active) WHERE is_active = true;
CREATE INDEX idx_vehicles_type ON vehicles(type);
CREATE INDEX idx_booking_references_date ON booking_references(booking_date);
CREATE INDEX idx_booking_references_vehicle ON booking_references(vehicle_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved) WHERE is_approved = true;
CREATE INDEX idx_service_areas_active ON service_areas(is_active) WHERE is_active = true;

-- Row Level Security (RLS) policies

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_references ENABLE ROW LEVEL SECURITY;

-- Public read access for vehicles, service areas (for booking page)
CREATE POLICY "Public can view active vehicles"
  ON vehicles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view service areas"
  ON service_areas FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

-- Service role has full access (for API routes)
CREATE POLICY "Service role full access vehicles"
  ON vehicles FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access availability"
  ON availability_blocks FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access service_areas"
  ON service_areas FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access reviews"
  ON reviews FOR ALL
  USING (auth.role() = 'service_role');

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

CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

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
  
  -- Check if there are any non-available blocks for this date
  SELECT COUNT(*) INTO v_blocks
  FROM availability_blocks
  WHERE vehicle_id = p_vehicle_id
    AND block_date = p_date
    AND block_type NOT IN ('unavailable');
  
  IF v_blocks > 0 THEN
    RETURN jsonb_build_object(
      'available', false,
      'vehicle', v_vehicle_record.name,
      'status', 'reserved'
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
INSERT INTO vehicles (name, slug, type, description, capacity, luggage_capacity, hourly_rate_local, hourly_rate_distance, four_hour_block_local, four_hour_block_distance, image_url, features, display_order) VALUES
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
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
  '["Leather interior", "Privacy partition", "Champagne bar", "Premium sound system", "LED mood lighting", "Tinted windows"]',
  1
),
(
  'White Stretch Limo',
  'white-stretch-limo',
  'stretch_limo',
  'The elegant white stretch limousine combines classic sophistication with modern amenities. Ideal for bridal parties and luxury transportation.',
  8,
  4,
  140.00,
  170.00,
  510.00,
  680.00,
  'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80',
  '["Leather interior", "Privacy partition", "Champagne bar", "Premium sound system", "Fiber optic lighting", "Tinted windows"]',
  2
),
(
  'Escalade ESV',
  'escalade-esv',
  'suv',
  'The Cadillac Escalade ESV provides expansive luxury with extra cargo space. Perfect for larger groups or those needing additional luggage capacity.',
  6,
  6,
  170.00,
  200.00,
  600.00,
  750.00,
  'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80',
  '["Plush leather seats", "Third row seating", "Entertainment system", "Extra luggage space", "Climate control", "WiFi hotspot"]',
  3
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
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
  '["Premium leather seats", "Panoramic sunroof", "Entertainment system", "Ample luggage space", "Advanced safety features"]',
  4
),
(
  'Mercedes S-Class',
  'mercedes-s-class',
  'sedan',
  'The Mercedes S-Class represents the pinnacle of luxury sedan engineering. Perfect for executive transportation and intimate celebrations.',
  4,
  3,
  140.00,
  170.00,
  510.00,
  680.00,
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
  '["Executive leather interior", "Massage seats", "Premium sound system", "Privacy glass", "Climate control", "USB charging"]',
  5
);

-- Seed data: Service areas
INSERT INTO service_areas (state_code, state_name, base_fee) VALUES
('MD', 'Maryland', 0),
('DC', 'District of Columbia', 25),
('VA', 'Virginia', 50),
('PA', 'Pennsylvania', 75);

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
