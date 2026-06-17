-- Migration: Add published_at to blogs table for scheduling
ALTER TABLE blogs ADD COLUMN published_at TIMESTAMPTZ DEFAULT NOW();
