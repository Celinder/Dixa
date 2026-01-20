-- ============================================
-- End Users Table for Conversation Generator
-- ============================================

CREATE TABLE IF NOT EXISTS end_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  additional_emails TEXT[],
  additional_phone_numbers TEXT[],
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_names TEXT[],
  avatar_url TEXT,
  external_id TEXT,
  dixa_user_id TEXT, -- Store the ID returned from Dixa API after creation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_end_users_email ON end_users(email);
CREATE INDEX idx_end_users_dixa_id ON end_users(dixa_user_id);

-- Enable RLS (all authenticated users can read)
ALTER TABLE end_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view end users"
  ON end_users FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can update end users"
  ON end_users FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Seed 20 diverse end users
INSERT INTO end_users (display_name, email, phone_number, additional_emails, additional_phone_numbers, first_name, last_name, middle_names, avatar_url, external_id) VALUES
('Emma Johnson', 'emma.johnson@example.com', '+14155552671', ARRAY['emma.j@secondary.com'], ARRAY['+14155558901'], 'Emma', 'Johnson', ARRAY[]::TEXT[], 'https://i.pravatar.cc/150?img=1', 'EXT-001'),
('Liam Chen', 'liam.chen@example.com', '+442071234567', ARRAY['lchen@alt.com'], ARRAY['+442079876543'], 'Liam', 'Chen', ARRAY[]::TEXT[], 'https://i.pravatar.cc/150?img=2', 'EXT-002'),
('Sophia Rodriguez', 'sophia.rodriguez@example.com', '+34912345678', ARRAY['srodriguez@mail.com'], ARRAY['+34687654321'], 'Sophia', 'Rodriguez', ARRAY[]::TEXT[], 'https://i.pravatar.cc/150?img=3', 'EXT-003'),
('Noah Anderson', 'noah.anderson@example.com', '+61298765432', ARRAY['noah.a@inbox.com'], ARRAY['+61412345678'], 'Noah', 'Anderson', ARRAY[]::TEXT[], 'https://i.pravatar.cc/150?img=4', 'EXT-004'),
('Olivia Martinez', 'olivia.martinez@example.com', '+5511987654321', ARRAY['omartinez@email.com'], ARRAY['+5511876543210'], 'Olivia', 'Martinez', ARRAY[]::TEXT[], 'https://i.pravatar.cc/150?img=5', 'EXT-005'),
('Ethan Brown', 'ethan.brown@example.com', '+14165551234', ARRAY['ebrown@mail.com'], ARRAY['+14165559876'], 'Ethan', 'Brown', ARRAY[]::TEXT[], 'https://i.pravatar.cc/150?img=6', 'EXT-006'),
('Ava Wilson', 'ava.wilson@example.com', '+4531234567', ARRAY['ava.w@email.com'], ARRAY['+4523456789'], 'Ava', 'Wilson', ARRAY[]::TEXT[], 'https://i.pravatar.cc/150?img=7', 'EXT-007'),
('Mason Taylor', 'mason.taylor@example.com', '+33142345678', ARRAY['mtaylor@post.com'], ARRAY['+33687654321'], 'Mason', 'Taylor', ARRAY[]::TEXT[], 'https://i.pravatar.cc/150?img=8', 'EXT-008'),
('Isabella Thomas', 'isabella.thomas@example.com', '+4921234567890', ARRAY['ithomas@web.com'], ARRAY['+491701234567'], 'Isabella', 'Thomas', ARRAY[]::TEXT[], 'https://i.pravatar.cc/150?img=9', 'EXT-009'),
('James Lee', 'james.lee@example.com', '+6591234567', ARRAY['james.lee@alt.com'], ARRAY['+6587654321'], 'James', 'Lee', ARRAY[]::TEXT[], 'https://i.pravatar.cc/150?img=10', 'EXT-010'),
('Mia Garcia', 'mia.garcia@example.com', '+5255123456789', ARRAY['mgarcia@mail.com'], ARRAY['+5255987654321'], 'Mia', 'Garcia', ARRAY[]::TEXT[], 'https://i.pravatar.cc/150?img=11', 'EXT-011'),
('Benjamin White', 'benjamin.white@example.com', '+27211234567', ARRAY['bwhite@email.com'], ARRAY['+27821234567'], 'Benjamin', 'White', ARRAY[]::TEXT[], 'https://i.pravatar.cc/150?img=12', 'EXT-012'),
('Charlotte Moore', 'charlotte.moore@example.com', '+353871234567', ARRAY['cmoore@inbox.com'], ARRAY['+353861234567'], 'Charlotte', 'Moore', ARRAY[]::TEXT[], 'https://i.pravatar.cc/150?img=13', 'EXT-013'),
('Lucas Harris', 'lucas.harris@example.com', '+31612345678', ARRAY['lharris@post.com'], ARRAY['+31687654321'], 'Lucas', 'Harris', ARRAY[]::TEXT[], 'https://i.pravatar.cc/150?img=14', 'EXT-014'),
('Amelia Martin', 'amelia.martin@example.com', '+46701234567', ARRAY['amartin@mail.com'], ARRAY['+46709876543'], 'Amelia', 'Martin', ARRAY[]::TEXT[], 'https://i.pravatar.cc/150?img=15', 'EXT-015'),
('Oliver Thompson', 'oliver.thompson@example.com', '+4122345678', ARRAY['othompson@email.com'], ARRAY['+41791234567'], 'Oliver', 'Thompson', ARRAY[]::TEXT[], 'https://i.pravatar.cc/150?img=16', 'EXT-016'),
('Harper Davis', 'harper.davis@example.com', '+8201012345678', ARRAY['hdavis@web.com'], ARRAY['+821012345679'], 'Harper', 'Davis', ARRAY[]::TEXT[], 'https://i.pravatar.cc/150?img=17', 'EXT-017'),
('Elijah Lopez', 'elijah.lopez@example.com', '+351211234567', ARRAY['elopez@mail.com'], ARRAY['+351961234567'], 'Elijah', 'Lopez', ARRAY[]::TEXT[], 'https://i.pravatar.cc/150?img=18', 'EXT-018'),
('Evelyn Clark', 'evelyn.clark@example.com', '+3222345678', ARRAY['eclark@inbox.com'], ARRAY['+32471234567'], 'Evelyn', 'Clark', ARRAY[]::TEXT[], 'https://i.pravatar.cc/150?img=19', 'EXT-019'),
('Alexander Kim', 'alexander.kim@example.com', '+81312345678', ARRAY['akim@email.com'], ARRAY['+819012345678'], 'Alexander', 'Kim', ARRAY[]::TEXT[], 'https://i.pravatar.cc/150?img=20', 'EXT-020');
