/*
  # Update IoT devices table policies

  1. Changes
    - Drop existing policies on iot_devices table
    - Add new policies that allow:
      - Admins to read all devices
      - Regular users to read only their own devices
      - Users to manage their own devices
  
  2. Security
    - Maintains RLS on iot_devices table
    - Uses is_admin() function to check admin status
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own devices" ON iot_devices;
DROP POLICY IF EXISTS "Users can create devices" ON iot_devices;
DROP POLICY IF EXISTS "Users can update own devices" ON iot_devices;
DROP POLICY IF EXISTS "Users can delete own devices" ON iot_devices;

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