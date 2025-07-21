-- Deutsche Retro Werbung - Supabase Schema
-- Run these commands in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  amazon_id VARCHAR(50) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  price VARCHAR(50),
  original_price VARCHAR(50),
  image TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'Allgemein',
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  discount INTEGER,
  tags TEXT[] DEFAULT '{}',
  link TEXT NOT NULL,
  click_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banners Table
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_amazon_id ON products(amazon_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);

-- RLS (Row Level Security) policies - optional for additional security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict this later)
CREATE POLICY "Enable all operations for products" ON products FOR ALL USING (true);
CREATE POLICY "Enable all operations for banners" ON banners FOR ALL USING (true);

-- Update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add click_count column to existing products table (if not exists)
ALTER TABLE products ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;

-- Create index for click tracking
CREATE INDEX IF NOT EXISTS idx_products_click_count ON products(click_count DESC);
