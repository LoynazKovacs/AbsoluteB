/*
  # Add RLS policies for scales table

  1. Changes
    - Enable RLS on scales table
    - Add policies for authenticated users to:
      - Read all scales
      - Create new scales
      - Update their own scales
      - Delete their own scales
    - Add owner_id column to track record ownership
  
  2. Security
    - Only authenticated users can access the table
    - Users can read all scales
    - Users can only modify their own records
*/

-- Add owner_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scales' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE scales ADD COLUMN owner_id uuid REFERENCES auth.users(id);
    ALTER TABLE scales ALTER COLUMN owner_id SET DEFAULT auth.uid();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE scales ENABLE ROW LEVEL SECURITY;

-- Policy for reading scales (all authenticated users can read)
CREATE POLICY "Users can read all scales"
  ON scales
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for inserting scales (authenticated users can create)
CREATE POLICY "Users can create scales"
  ON scales
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Policy for updating scales (users can update their own)
CREATE POLICY "Users can update own scales"
  ON scales
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Policy for deleting scales (users can delete their own)
CREATE POLICY "Users can delete own scales"
  ON scales
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);