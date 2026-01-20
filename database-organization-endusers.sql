-- ============================================
-- Organization End Users - Per-Org Test Users
-- ============================================

-- Add flag to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS end_users_created BOOLEAN DEFAULT FALSE;

-- Create table to store organization-specific end user mappings
CREATE TABLE IF NOT EXISTS organization_end_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  base_end_user_id UUID REFERENCES end_users(id) ON DELETE CASCADE NOT NULL,
  dixa_user_id TEXT NOT NULL, -- The Dixa ID for this user in this specific organization
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX idx_org_end_users_org ON organization_end_users(organization_id);
CREATE INDEX idx_org_end_users_dixa_id ON organization_end_users(dixa_user_id);

-- Enable RLS
ALTER TABLE organization_end_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view end users for their organizations"
  ON organization_end_users FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage end users for their organizations"
  ON organization_end_users FOR ALL
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE created_by = auth.uid()
    )
  );
