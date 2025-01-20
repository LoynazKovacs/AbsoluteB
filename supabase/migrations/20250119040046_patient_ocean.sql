/*
  # Re-establish IoT devices policies

  1. Changes
    - Drop any existing policies for iot_devices table
    - Create new policies for:
      - Reading devices (admins see all, users see own)
      - Creating devices (users can only create with their ID)
      - Updating devices (admins update all, users update own)
      - Deleting devices (admins delete all, users delete own)
    
  2. Security
    - Enable RLS on iot_devices table
    - Policies use is_admin() function to check admin status
    - Regular users can only access their own devices
    - Admins have full access to all devices
*/

-- First, ensure RLS is enabled
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can read devices" ON iot_devices;
DROP POLICY IF EXISTS "Users can create devices" ON iot_devices;
DROP POLICY IF EXISTS "Users can update devices" ON iot_devices;
DROP POLICY IF EXISTS "Users can delete devices" ON iot_devices;

-- Policy for reading devices (admins can read all, users can read own)
CREATE POLICY "Users can read devices"
  ON iot_devices
  FOR SELECT
  TO authenticated
  USING (
    is_admin() OR  -- Admins can read all devices
    auth.uid() = owner_id -- Users can read their own devices
  );

-- Policy for creating devices (users can only create with their ID)
CREATE POLICY "Users can create devices"
  ON iot_devices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id -- Users can only create devices they own
  );

-- Policy for updating devices (admins can update all, users can update own)
CREATE POLICY "Users can update devices"
  ON iot_devices
  FOR UPDATE
  TO authenticated
  USING (
    is_admin() OR  -- Admins can update all devices
    auth.uid() = owner_id -- Users can update their own devices
  )
  WITH CHECK (
    is_admin() OR  -- Admins can update all devices
    auth.uid() = owner_id -- Users can update their own devices
  );

-- Policy for deleting devices (admins can delete all, users can delete own)
CREATE POLICY "Users can delete devices"
  ON iot_devices
  FOR DELETE
  TO authenticated
  USING (
    is_admin() OR  -- Admins can delete all devices
    auth.uid() = owner_id -- Users can delete their own devices
  );