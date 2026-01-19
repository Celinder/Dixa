/*
  # Initial Database Schema for Dixa Tools Hub

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text) - Category name
      - `slug` (text, unique) - URL-friendly identifier
      - `description` (text) - Category description
      - `icon` (text) - Emoji icon for display
      - `display_order` (integer) - Sort order
      - `created_at` (timestamptz)
    
    - `tools`
      - `id` (uuid, primary key)
      - `name` (text) - Tool name
      - `description` (text) - Tool description
      - `url` (text) - Link to tool/artifact/repo
      - `type` (text) - Tool type: artifact, repo, webapp, external
      - `category_id` (uuid) - Foreign key to categories
      - `icon` (text) - Emoji icon
      - `tags` (text[]) - Array of tags
      - `status` (text) - active, inactive, archived
      - `view_count` (integer) - Number of views
      - `created_by` (uuid) - Foreign key to auth.users
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `tool_views`
      - `id` (uuid, primary key)
      - `tool_id` (uuid) - Foreign key to tools
      - `user_id` (uuid) - Foreign key to auth.users
      - `viewed_at` (timestamptz)
    
    - `profiles`
      - `id` (uuid, primary key) - Foreign key to auth.users
      - `email` (text)
      - `full_name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own data
    - Public read access for tools and categories
    - Restricted write access for tools to authenticated users
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '📁',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create tools table
CREATE TABLE IF NOT EXISTS tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  url text NOT NULL,
  type text NOT NULL DEFAULT 'external',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  icon text DEFAULT '🔧',
  tags text[] DEFAULT '{}',
  status text DEFAULT 'active',
  view_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tool_views table for analytics
CREATE TABLE IF NOT EXISTS tool_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at timestamptz DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tools_category_id ON tools(category_id);
CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status);
CREATE INDEX IF NOT EXISTS idx_tools_created_by ON tools(created_by);
CREATE INDEX IF NOT EXISTS idx_tool_views_tool_id ON tool_views(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_views_user_id ON tool_views(user_id);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, authenticated write)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Tools policies (public read, authenticated write)
CREATE POLICY "Anyone can view active tools"
  ON tools FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can insert tools"
  ON tools FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tools"
  ON tools FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own tools"
  ON tools FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Tool views policies
CREATE POLICY "Users can view their own tool views"
  ON tool_views FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert tool views"
  ON tool_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_tools_updated_at
  BEFORE UPDATE ON tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, display_order)
VALUES 
  ('Sales Tools', 'sales-tools', 'Tools for SDRs and AEs', '⚔️', 1),
  ('Content Generation', 'content-generation', 'Generate content for demos and presentations', '✍️', 2),
  ('Competitive Intelligence', 'competitive-intelligence', 'Battlecards and competitor insights', '🎯', 3),
  ('Demo Resources', 'demo-resources', 'Tools for preparing and running demos', '🚀', 4),
  ('Integrations', 'integrations', 'Customer integration examples', '🔌', 5),
  ('Analytics & Reporting', 'analytics-reporting', 'Data analysis and reporting tools', '📊', 6)
ON CONFLICT (slug) DO NOTHING;