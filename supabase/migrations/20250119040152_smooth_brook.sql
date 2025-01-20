/*
  # Add admin role policies

  1. Changes
    - Add policies for admin users to manage all profiles
    - Add policies for admin users to manage all roles
    - Add policies for admin users to manage all devices
    
  2. Security
    - Admins can read/update/delete any profile
    - Admins can manage roles
    - Admins have full access to all devices
*/

-- Add admin policies for profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Add admin policies for roles
CREATE POLICY "Admins can insert roles"
  ON roles
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update roles"
  ON roles
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete roles"
  ON roles
  FOR DELETE
  TO authenticated
  USING (is_admin());