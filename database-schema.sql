-- ============================================
-- Dixa Conversation Generator Database Schema
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Organizations Table
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subdomain TEXT NOT NULL,
  dixa_org_id TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  api_token_encrypted TEXT NOT NULL, -- Encrypted API token
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_organizations_created_by ON organizations(created_by);
CREATE INDEX idx_organizations_status ON organizations(status);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own organizations"
  ON organizations FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own organizations"
  ON organizations FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own organizations"
  ON organizations FOR DELETE
  USING (auth.uid() = created_by);

-- ============================================
-- Email Integrations Table (Relational)
-- ============================================
CREATE TABLE IF NOT EXISTS email_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  integration_id TEXT NOT NULL, -- The Dixa email integration ID (e.g., "my-integration@email.dixa.io")
  name TEXT NOT NULL,
  type TEXT DEFAULT 'Email',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_email_integrations_org ON email_integrations(organization_id);

-- Enable RLS
ALTER TABLE email_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view integrations for their organizations"
  ON email_integrations FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage integrations for their organizations"
  ON email_integrations FOR ALL
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE created_by = auth.uid()
    )
  );

-- ============================================
-- Conversation Templates Table (Global, Fixed Data)
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vertical TEXT NOT NULL,
  subject TEXT NOT NULL,
  message_content TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (allow all authenticated users to read)
ALTER TABLE conversation_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view templates"
  ON conversation_templates FOR SELECT
  USING (auth.role() = 'authenticated');

-- Seed conversation templates (1 per vertical)
INSERT INTO conversation_templates (vertical, subject, message_content) VALUES
('E-commerce', 'Question about my order #12345', 'Hi, I placed an order last week but haven''t received any tracking information yet. Can you help me find out where my package is? My order number is #12345. Thank you!'),
('SaaS', 'Cannot log into my account', 'I''ve been trying to log into my account for the past hour but keep getting an error message saying "Invalid credentials" even though I''m sure my password is correct. Can you help me reset my password or check what''s wrong?'),
('Financial Services', 'Question about recent transaction', 'I see a transaction on my account for $127.50 that I don''t recognize. It was processed on January 15th. Can you provide more details about this charge and help me understand what it''s for?'),
('Healthcare', 'Appointment rescheduling request', 'I need to reschedule my appointment scheduled for next Tuesday at 2pm due to an unexpected work conflict. Are there any available slots earlier in the week or later in the afternoon? Thank you for your help.'),
('Travel', 'Flight cancellation and refund', 'My flight (booking reference: ABC123) was cancelled and I need to rebook for the same destination. What are my options and will I get a full refund for the cancelled flight? I need to travel within the next week.'),
('Telecom', 'Internet connection issues', 'My internet has been very slow for the past three days and keeps disconnecting every few hours. I''ve tried restarting the router multiple times but it hasn''t helped. Can you check if there''s an issue with my connection?');

-- ============================================
-- Helper Functions
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_integrations_updated_at
  BEFORE UPDATE ON email_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Encryption Helper Functions (Server-side only)
-- ============================================

-- Function to encrypt API token (use pgcrypto)
-- Note: In production, you should use a proper encryption key from env variables
-- For MVP, we'll use a simple encryption method
CREATE OR REPLACE FUNCTION encrypt_api_token(token TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Using pgcrypto's pgp_sym_encrypt with a key
  -- In production, replace 'your-secret-key' with an environment variable
  RETURN encode(pgp_sym_encrypt(token, 'dixa-encryption-key-2026'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt API token (server-side only)
CREATE OR REPLACE FUNCTION decrypt_api_token(encrypted_token TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(decode(encrypted_token, 'base64'), 'dixa-encryption-key-2026');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Notes
-- ============================================
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. The encryption key ('dixa-encryption-key-2026') should be changed to an environment variable in production
-- 3. API tokens are encrypted at rest for security
-- 4. Email integrations are stored after fetching from Dixa API
-- 5. Templates are pre-populated with one template per vertical
-- 6. All tables have RLS enabled for security
