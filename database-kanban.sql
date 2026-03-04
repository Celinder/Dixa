-- Kanban Board Feature - Database Schema
-- Personal Kanban boards with cards, swimlanes, and tags
-- All tables have RLS to ensure user isolation

-- =====================================================
-- TABLES
-- =====================================================

-- Kanban Boards (users can have multiple boards)
CREATE TABLE IF NOT EXISTS kanban_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Board',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Swimlanes (custom groupings within a board)
CREATE TABLE IF NOT EXISTS kanban_swimlanes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cards (main Kanban items)
CREATE TABLE IF NOT EXISTS kanban_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
  swimlane_id UUID REFERENCES kanban_swimlanes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Todo' CHECK (status IN ('Todo', 'Doing', 'Awaiting Reply', 'Done')),
  position INTEGER NOT NULL DEFAULT 0,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags (reusable labels)
CREATE TABLE IF NOT EXISTS kanban_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(board_id, name)
);

-- Card-Tag relationship (many-to-many)
CREATE TABLE IF NOT EXISTS kanban_card_tags (
  card_id UUID NOT NULL REFERENCES kanban_cards(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES kanban_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, tag_id)
);

-- =====================================================
-- INDEXES for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_kanban_boards_user_id ON kanban_boards(user_id);
CREATE INDEX IF NOT EXISTS idx_kanban_swimlanes_board_id ON kanban_swimlanes(board_id);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_board_id ON kanban_cards(board_id);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_status ON kanban_cards(status);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_swimlane_id ON kanban_cards(swimlane_id);
CREATE INDEX IF NOT EXISTS idx_kanban_tags_board_id ON kanban_tags(board_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE kanban_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_swimlanes ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_card_tags ENABLE ROW LEVEL SECURITY;

-- Boards: Users can only see/modify their own boards
CREATE POLICY "Users can view their own boards"
  ON kanban_boards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own boards"
  ON kanban_boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards"
  ON kanban_boards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards"
  ON kanban_boards FOR DELETE
  USING (auth.uid() = user_id);

-- Swimlanes: Users can manage swimlanes in their own boards
CREATE POLICY "Users can view swimlanes in their boards"
  ON kanban_swimlanes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM kanban_boards
    WHERE kanban_boards.id = kanban_swimlanes.board_id
    AND kanban_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert swimlanes in their boards"
  ON kanban_swimlanes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM kanban_boards
    WHERE kanban_boards.id = kanban_swimlanes.board_id
    AND kanban_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can update swimlanes in their boards"
  ON kanban_swimlanes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM kanban_boards
    WHERE kanban_boards.id = kanban_swimlanes.board_id
    AND kanban_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete swimlanes in their boards"
  ON kanban_swimlanes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM kanban_boards
    WHERE kanban_boards.id = kanban_swimlanes.board_id
    AND kanban_boards.user_id = auth.uid()
  ));

-- Cards: Users can manage cards in their own boards
CREATE POLICY "Users can view cards in their boards"
  ON kanban_cards FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM kanban_boards
    WHERE kanban_boards.id = kanban_cards.board_id
    AND kanban_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert cards in their boards"
  ON kanban_cards FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM kanban_boards
    WHERE kanban_boards.id = kanban_cards.board_id
    AND kanban_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can update cards in their boards"
  ON kanban_cards FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM kanban_boards
    WHERE kanban_boards.id = kanban_cards.board_id
    AND kanban_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete cards in their boards"
  ON kanban_cards FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM kanban_boards
    WHERE kanban_boards.id = kanban_cards.board_id
    AND kanban_boards.user_id = auth.uid()
  ));

-- Tags: Users can manage tags in their own boards
CREATE POLICY "Users can view tags in their boards"
  ON kanban_tags FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM kanban_boards
    WHERE kanban_boards.id = kanban_tags.board_id
    AND kanban_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert tags in their boards"
  ON kanban_tags FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM kanban_boards
    WHERE kanban_boards.id = kanban_tags.board_id
    AND kanban_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can update tags in their boards"
  ON kanban_tags FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM kanban_boards
    WHERE kanban_boards.id = kanban_tags.board_id
    AND kanban_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete tags in their boards"
  ON kanban_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM kanban_boards
    WHERE kanban_boards.id = kanban_tags.board_id
    AND kanban_boards.user_id = auth.uid()
  ));

-- Card Tags: Users can manage card-tag relationships in their boards
CREATE POLICY "Users can view card tags in their boards"
  ON kanban_card_tags FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM kanban_cards
    JOIN kanban_boards ON kanban_boards.id = kanban_cards.board_id
    WHERE kanban_cards.id = kanban_card_tags.card_id
    AND kanban_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert card tags in their boards"
  ON kanban_card_tags FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM kanban_cards
    JOIN kanban_boards ON kanban_boards.id = kanban_cards.board_id
    WHERE kanban_cards.id = kanban_card_tags.card_id
    AND kanban_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete card tags in their boards"
  ON kanban_card_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM kanban_cards
    JOIN kanban_boards ON kanban_boards.id = kanban_cards.board_id
    WHERE kanban_cards.id = kanban_card_tags.card_id
    AND kanban_boards.user_id = auth.uid()
  ));

-- =====================================================
-- TRIGGERS for updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kanban_boards_updated_at
  BEFORE UPDATE ON kanban_boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kanban_cards_updated_at
  BEFORE UPDATE ON kanban_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
