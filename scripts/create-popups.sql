-- Create popups table
CREATE TABLE IF NOT EXISTS popups (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  ranking INTEGER NOT NULL DEFAULT 1,
  duration INTEGER NOT NULL CHECK (duration >= 3 AND duration <= 60),
  locations TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
