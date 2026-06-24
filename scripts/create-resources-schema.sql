-- Resource Categories table
CREATE TABLE IF NOT EXISTS resource_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  ranking INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resource Links table
CREATE TABLE IF NOT EXISTS resource_links (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES resource_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  group_name TEXT, -- Optional heading for grouping links, e.g. "Score Vs Percentile"
  ranking INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed defaults (compatible with PG 9.4)
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

-- Seed default links (only if links table is empty, compatible with PG 9.4)
INSERT INTO resource_links (category_id, title, url, group_name, ranking)
SELECT id, 'Board Syllabus', '/batches', NULL, 1 FROM resource_categories WHERE name = '11th Commerce' AND NOT EXISTS (SELECT 1 FROM resource_links)
UNION ALL
SELECT id, 'Study Materials', '/batches', NULL, 2 FROM resource_categories WHERE name = '11th Commerce' AND NOT EXISTS (SELECT 1 FROM resource_links)
UNION ALL
SELECT id, 'Board Syllabus', '/batches', NULL, 1 FROM resource_categories WHERE name = '12th Commerce' AND NOT EXISTS (SELECT 1 FROM resource_links)
UNION ALL
SELECT id, 'Previous Year Papers', '/batches', NULL, 2 FROM resource_categories WHERE name = '12th Commerce' AND NOT EXISTS (SELECT 1 FROM resource_links)
UNION ALL
SELECT id, 'ICAI Study Material', 'https://www.icai.org', NULL, 1 FROM resource_categories WHERE name = 'CA Foundation' AND NOT EXISTS (SELECT 1 FROM resource_links)
UNION ALL
SELECT id, 'Mock Test Series', '/batches', NULL, 2 FROM resource_categories WHERE name = 'CA Foundation' AND NOT EXISTS (SELECT 1 FROM resource_links)
UNION ALL
SELECT id, 'CSEET Prep Material', 'https://www.icsi.edu', NULL, 1 FROM resource_categories WHERE name = 'CSEET' AND NOT EXISTS (SELECT 1 FROM resource_links);
