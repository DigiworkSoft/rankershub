-- ============================================================
-- RankersHub Local PostgreSQL Schema
-- ============================================================

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enquiries table
CREATE TABLE IF NOT EXISTS enquiries (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  batch TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  duration TEXT,
  timing TEXT,
  benefits TEXT,
  syllabus TEXT,
  syllabus_details TEXT,
  next_batch_starts TEXT,
  fees NUMERIC(10, 2),
  discount_percent NUMERIC(5, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'Admin',
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- YouTube Videos table
CREATE TABLE IF NOT EXISTS youtube_videos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admission Enquiries table
CREATE TABLE IF NOT EXISTS admission_enquiries (
  id SERIAL PRIMARY KEY,
  student_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  course TEXT NOT NULL,
  school_name TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Admission FAQs',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Seed admin accounts
-- ============================================================
INSERT INTO admins (username, password_hash)
VALUES 
  ('admin', '$2b$10$84VN.6LPuK6L/eBSD.IX7.vcSAQQb5.K6vxXq5V4zL7UHUxNRSboW')
ON CONFLICT (username) DO NOTHING;
