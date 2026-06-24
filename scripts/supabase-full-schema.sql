-- ============================================================
-- RankersHub — Complete Supabase Database Schema
-- Run this ONCE in Supabase SQL Editor before deployment
-- ============================================================

-- ===================== 1. CORE TABLES =====================

-- Admins
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enquiries
CREATE TABLE IF NOT EXISTS enquiries (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  batch TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses
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
  ranking INT DEFAULT 0,
  syllabus_pdf VARCHAR(255) NULL,
  mode_of_learning TEXT DEFAULT 'Offline (Hybrid )',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fee Plans
CREATE TABLE IF NOT EXISTS fee_plans (
  id SERIAL PRIMARY KEY,
  course_id INT REFERENCES courses(id) ON DELETE CASCADE,
  duration TEXT NOT NULL,
  fees NUMERIC(10, 2) NOT NULL,
  discount_percent NUMERIC(5, 2) DEFAULT 0,
  mode_of_learning TEXT DEFAULT 'Offline (Hybrid )',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_course_duration_mode UNIQUE (course_id, duration, mode_of_learning)
);

-- Blogs
CREATE TABLE IF NOT EXISTS blogs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'Admin',
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  geo_region TEXT,
  geo_placename TEXT,
  geo_position TEXT,
  icbm TEXT,
  bypass_layout BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- YouTube Videos
CREATE TABLE IF NOT EXISTS youtube_videos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admission Enquiries
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

-- FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Admission FAQs',
  meta_title TEXT,
  meta_description TEXT,
  geo_region TEXT,
  geo_placename TEXT,
  geo_position TEXT,
  icbm TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Popups
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

-- ===================== 2. RESOURCE TABLES =====================

-- Resource Categories
CREATE TABLE IF NOT EXISTS resource_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  ranking INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resource Links
CREATE TABLE IF NOT EXISTS resource_links (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES resource_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  group_name TEXT,
  ranking INT DEFAULT 0,
  content TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  geo_region TEXT,
  geo_placename TEXT,
  geo_position TEXT,
  icbm TEXT,
  bypass_layout BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== 3. BANNERS TABLE =====================

CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  desktop_image_url TEXT NOT NULL,
  mobile_image_url TEXT NOT NULL,
  page TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  ranking INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== 4. SEED DATA =====================

-- Seed admin (password: admin123)
INSERT INTO admins (username, password_hash)
VALUES ('admin', '$2b$10$84VN.6LPuK6L/eBSD.IX7.vcSAQQb5.K6vxXq5V4zL7UHUxNRSboW')
ON CONFLICT (username) DO NOTHING;

-- Seed resource categories
INSERT INTO resource_categories (name, ranking)
SELECT v.name, v.ranking FROM (
  VALUES 
    ('11th Commerce', 1),
    ('12th Commerce', 2),
    ('CA Foundation', 3),
    ('CSEET', 4)
) AS v(name, ranking)
WHERE NOT EXISTS (
  SELECT 1 FROM resource_categories WHERE resource_categories.name = v.name
);

-- Seed default banners (only if empty)
INSERT INTO banners (title, desktop_image_url, mobile_image_url, page, ranking, is_active)
SELECT * FROM (
  VALUES
    ('Default Home Banner', '/assets/photos/banner.webp', '/assets/photos/banner2.webp', 'index', 1, TRUE),
    ('Default Batches Banner', '/assets/photos/batch.webp', '/assets/photos/batch2.webp', 'batches', 1, TRUE)
) AS v(title, desktop_image_url, mobile_image_url, page, ranking, is_active)
WHERE NOT EXISTS (SELECT 1 FROM banners);
