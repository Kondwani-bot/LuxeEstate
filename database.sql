-- Supabase SQL Schema for Lumina Real Estate

-- Create the properties table
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price BIGINT NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  submitted_by TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  features TEXT[] NOT NULL DEFAULT '{}'
);

-- Enable Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policies

-- 1. Public can view approved properties
CREATE POLICY "Public can view approved properties" ON properties
  FOR SELECT
  USING (status = 'Approved');

-- 2. Authenticated users can view their own properties (including pending/rejected)
CREATE POLICY "Users can view their own properties" ON properties
  FOR SELECT
  TO authenticated
  USING (submitted_by = auth.uid()::text);

-- 3. Authenticated users can insert properties
CREATE POLICY "Users can insert properties" ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 4. Admin users can view all properties (assuming admin check can be added later or we allow all authenticated users viewing for now based on your app logic)
CREATE POLICY "Admin can view all properties" ON properties
  FOR SELECT
  TO authenticated
  USING (true); -- In a production app, restrict this to users with an 'admin' role

-- Insert Mock Data
INSERT INTO properties (title, description, price, location, image_url, images, type, status, submitted_by, features) VALUES
('Modern Minimalist Villa', 'A stunning modern villa with floor-to-ceiling windows, private infinity pool, and panoramic ocean views...', 4500000, 'Malibu, California', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200', ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200'], 'Villa', 'Approved', 'John Member', ARRAY['Infinity Pool', 'Home Theater', 'Smart Home System', 'Wine Cellar']),
('Historic European Estate', 'This meticulously restored 18th-century estate combines classic elegance with modern amenities...', 12000000, 'Tuscany, Italy', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200', ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200'], 'Villa', 'Approved', 'Jane Member', ARRAY['Private Vineyard', 'Guest House', 'Historic Architecture', 'Formal Gardens']);
