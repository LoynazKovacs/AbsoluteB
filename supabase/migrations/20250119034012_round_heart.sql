/*
  # Add role management

  1. New Tables
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes
    - Add `role` column to `profiles` table
    - Add default roles (admin, user)
    - Add RLS policies for roles table

  3. Security
    - Enable RLS on `roles` table
    - Add policies for reading roles
*/

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default roles first
INSERT INTO roles (name, description) 
VALUES 
  ('admin', 'Administrator with full access'),
  ('user', 'Regular user with limited access')
ON CONFLICT (name) DO NOTHING;

-- Now add role column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text;

-- Add foreign key constraint after column exists and data is present
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_fkey 
  FOREIGN KEY (role) 
  REFERENCES roles(name);

-- Set default role for existing profiles
UPDATE profiles SET role = 'user' WHERE role IS NULL;

-- Now set the default for new rows
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'user';

-- Enable RLS on roles table
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read roles
CREATE POLICY "Authenticated users can read roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;