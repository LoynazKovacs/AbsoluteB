/*
  # Add company model and relationships

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `owner_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `company_members`
      - `id` (uuid, primary key)
      - `company_id` (uuid, references companies)
      - `user_id` (uuid, references auth.users)
      - `role` (text)
      - `created_at` (timestamp)
  
  2. Changes
    - Add company_id to iot_devices table
    - Add company_id to profiles table
  
  3. Security
    - Enable RLS on all tables
    - Add policies for company owners and members
*/

-- Create companies table
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create company_members table
CREATE TABLE company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- Add company_id to iot_devices
ALTER TABLE iot_devices ADD COLUMN company_id uuid REFERENCES companies(id);

-- Add company_id to profiles for default company context
ALTER TABLE profiles ADD COLUMN current_company_id uuid REFERENCES companies(id);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can view companies they own or are members of"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
      UNION
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Only owners can update their companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Only owners can delete their companies"
  ON companies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Company members policies
CREATE POLICY "Users can view members of their companies"
  ON company_members
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
      UNION
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can manage members"
  ON company_members
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

-- Update IoT devices policies to include company context
DROP POLICY IF EXISTS "Users can read devices" ON iot_devices;
DROP POLICY IF EXISTS "Users can create devices" ON iot_devices;
DROP POLICY IF EXISTS "Users can update devices" ON iot_devices;
DROP POLICY IF EXISTS "Users can delete devices" ON iot_devices;

CREATE POLICY "Users can read company devices"
  ON iot_devices
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
      UNION
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create company devices"
  ON iot_devices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
      UNION
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update company devices"
  ON iot_devices
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
      UNION
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
      UNION
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete company devices"
  ON iot_devices
  FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

-- Function to get user's companies
CREATE OR REPLACE FUNCTION get_user_companies()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  owner_id uuid,
  is_owner boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.description,
    c.owner_id,
    c.owner_id = auth.uid() as is_owner,
    c.created_at,
    c.updated_at
  FROM companies c
  WHERE 
    c.owner_id = auth.uid()
    OR c.id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    )
  ORDER BY c.name;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_companies TO authenticated;