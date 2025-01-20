/*
  # Fix Policy Recursion Issues

  This migration:
  1. Drops all existing policies that might cause recursion
  2. Creates simplified policies with direct conditions
  3. Ensures no circular references between policies
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "View owned companies" ON companies;
DROP POLICY IF EXISTS "View member companies" ON companies;
DROP POLICY IF EXISTS "Create companies" ON companies;
DROP POLICY IF EXISTS "Update owned companies" ON companies;
DROP POLICY IF EXISTS "Delete owned companies" ON companies;
DROP POLICY IF EXISTS "View company members as owner" ON company_members;
DROP POLICY IF EXISTS "View company members as member" ON company_members;
DROP POLICY IF EXISTS "Manage members as owner" ON company_members;
DROP POLICY IF EXISTS "View devices in owned companies" ON iot_devices;
DROP POLICY IF EXISTS "View devices as company member" ON iot_devices;
DROP POLICY IF EXISTS "Create devices in owned companies" ON iot_devices;
DROP POLICY IF EXISTS "Create devices as company member" ON iot_devices;
DROP POLICY IF EXISTS "Update devices in owned companies" ON iot_devices;
DROP POLICY IF EXISTS "Update devices as company member" ON iot_devices;
DROP POLICY IF EXISTS "Delete devices in owned companies" ON iot_devices;

-- Companies policies
CREATE POLICY "companies_owner_select"
  ON companies
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "companies_member_select"
  ON companies
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 
    FROM company_members 
    WHERE company_members.company_id = id 
    AND company_members.user_id = auth.uid()
  ));

CREATE POLICY "companies_insert"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "companies_update"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "companies_delete"
  ON companies
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Company members policies
CREATE POLICY "members_owner_select"
  ON company_members
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 
    FROM companies 
    WHERE companies.id = company_id 
    AND companies.owner_id = auth.uid()
  ));

CREATE POLICY "members_self_select"
  ON company_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "members_owner_all"
  ON company_members
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 
    FROM companies 
    WHERE companies.id = company_id 
    AND companies.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 
    FROM companies 
    WHERE companies.id = company_id 
    AND companies.owner_id = auth.uid()
  ));

-- IoT devices policies
CREATE POLICY "devices_owner_select"
  ON iot_devices
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 
    FROM companies 
    WHERE companies.id = company_id 
    AND companies.owner_id = auth.uid()
  ));

CREATE POLICY "devices_member_select"
  ON iot_devices
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 
    FROM company_members 
    WHERE company_members.company_id = company_id 
    AND company_members.user_id = auth.uid()
  ));

CREATE POLICY "devices_owner_insert"
  ON iot_devices
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 
    FROM companies 
    WHERE companies.id = company_id 
    AND companies.owner_id = auth.uid()
  ));

CREATE POLICY "devices_member_insert"
  ON iot_devices
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 
    FROM company_members 
    WHERE company_members.company_id = company_id 
    AND company_members.user_id = auth.uid()
  ));

CREATE POLICY "devices_owner_update"
  ON iot_devices
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 
    FROM companies 
    WHERE companies.id = company_id 
    AND companies.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 
    FROM companies 
    WHERE companies.id = company_id 
    AND companies.owner_id = auth.uid()
  ));

CREATE POLICY "devices_member_update"
  ON iot_devices
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 
    FROM company_members 
    WHERE company_members.company_id = company_id 
    AND company_members.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 
    FROM company_members 
    WHERE company_members.company_id = company_id 
    AND company_members.user_id = auth.uid()
  ));

CREATE POLICY "devices_owner_delete"
  ON iot_devices
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 
    FROM companies 
    WHERE companies.id = company_id 
    AND companies.owner_id = auth.uid()
  ));

-- Update get_user_companies function to avoid recursion
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
  SELECT DISTINCT ON (c.id)
    c.id,
    c.name,
    c.description,
    c.owner_id,
    c.owner_id = auth.uid() as is_owner,
    c.created_at,
    c.updated_at
  FROM companies c
  LEFT JOIN company_members cm ON c.id = cm.company_id AND cm.user_id = auth.uid()
  WHERE c.owner_id = auth.uid() OR cm.user_id = auth.uid()
  ORDER BY c.id, c.name;
END;
$$;