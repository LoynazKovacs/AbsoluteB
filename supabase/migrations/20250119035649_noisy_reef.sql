/*
  # Update IoT devices policies
  
  1. Changes
    - Drop all existing policies from iot_devices table
    - Create new policies for user and admin access:
      - Users can only read and manage their own devices
      - Admins can read and manage all devices
  
  2. Security
    - Policies use is_admin() function to check admin status
    - Regular users are restricted to their own devices
    - Admins have full access to all devices
*/

-- First, drop all existing policies
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

-- Policy for creating devices
CREATE POLICY "Users can create devices"
  ON iot_devices
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

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