/*
  # Add admin-specific policies for IoT devices

  1. Changes
    - Add explicit admin policies for IoT devices table
    - Ensures admins have full CRUD access to all devices
    
  2. Security
    - Policies use is_admin() function to check admin status
    - Admins have unrestricted access to all devices
    - Maintains existing user policies
*/

-- Add explicit admin policies for complete control
CREATE POLICY "Admins can read all devices"
  ON iot_devices
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert any device"
  ON iot_devices
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update all devices"
  ON iot_devices
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete all devices"
  ON iot_devices
  FOR DELETE
  TO authenticated
  USING (is_admin());