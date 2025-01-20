/*
  # Update roles table policies

  1. Changes
    - Drop existing policies on roles table
    - Add new policy that only allows admins to read roles
  
  2. Security
    - Maintains RLS on roles table
    - Uses is_admin() function to check admin status
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read roles" ON roles;

-- Policy for reading roles (only admins can read)
CREATE POLICY "Admins can read roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy for managing roles (only admins can manage)
CREATE POLICY "Admins can manage roles"
  ON roles
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());