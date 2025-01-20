/*
  # Update profiles table policies

  1. Changes
    - Drop existing policies on profiles table
    - Add new policies that:
      - Allow admins to read all profiles
      - Allow regular users to only read their own profile
      - Allow users to update their own profile only
  
  2. Security
    - Maintains RLS on profiles table
    - Uses is_admin() function to check admin status
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;

-- Policy for reading profiles (admins can read all, users can read own)
CREATE POLICY "Users can read profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    is_admin() OR  -- Admins can read all profiles
    auth.uid() = id -- Users can read their own profile
  );

-- Policy for updating profiles (users can only update their own)
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy for inserting profiles (users can only insert their own)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);