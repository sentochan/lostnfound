-- Migration Script for Boost and Admin Features
-- Run this in the Supabase SQL Editor to update your existing tables

-- 1. Update 'items' table
ALTER TABLE items ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT FALSE;
ALTER TABLE items ADD COLUMN IF NOT EXISTS boost_expiry TIMESTAMP WITH TIME ZONE;
ALTER TABLE items ADD COLUMN IF NOT EXISTS admin_hidden BOOLEAN DEFAULT FALSE;

-- 2. Update 'profiles' table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 3. Optional: Set yourself as admin (Replace with your actual User ID if known, or run manually later)
-- UPDATE profiles SET is_admin = TRUE WHERE id = 'YOUR_USER_ID_HERE';
