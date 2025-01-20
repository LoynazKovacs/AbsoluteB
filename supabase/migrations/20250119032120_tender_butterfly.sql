/*
  # Add user ownership to IoT devices

  1. Changes
    - Add owner_id column to iot_devices table
    - Enable RLS on iot_devices table
    - Add policies for user access control

  2. Security
    - Enable RLS
    - Add policies for CRUD operations based on ownership
*/

-- Add owner_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'iot_devices' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE iot_devices ADD COLUMN owner_id uuid REFERENCES auth.users(id);
    ALTER TABLE iot_devices ALTER COLUMN owner_id SET DEFAULT auth.uid();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;

-- Policy for reading devices (users can only read their own)
CREATE POLICY "Users can read own devices"
  ON iot_devices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

-- Policy for inserting devices (users can create with their ID)
CREATE POLICY "Users can create devices"
  ON iot_devices
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Policy for updating devices (users can update their own)
CREATE POLICY "Users can update own devices"
  ON iot_devices
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Policy for deleting devices (users can delete their own)
CREATE POLICY "Users can delete own devices"
  ON iot_devices
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);