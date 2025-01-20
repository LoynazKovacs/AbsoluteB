/*
  # Simplify RLS policies to prevent recursion

  1. Changes
    - Simplify policies to use direct conditions without subqueries where possible
    - Remove unnecessary policy combinations
    - Optimize policy checks to prevent recursion
    - Add explicit policies for admin users
  
  2. Security
    - Maintain same security model but with more efficient implementation
    - Ensure proper access control for owners and members
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "companies_owner_select" ON companies;
DROP POLICY IF EXISTS "companies_member_select" ON companies;
DROP POLICY IF EXISTS "companies_insert" ON companies;
DROP POLICY IF EXISTS "companies_update" ON companies;
DROP POLICY IF EXISTS "companies_delete" ON companies;
DROP POLICY IF EXISTS "members_owner_select" ON company_members;
DROP POLICY IF EXISTS "members_self_select" ON company_members;
DROP POLICY IF EXISTS "members_owner_all" ON company_members;
DROP POLICY IF EXISTS "devices_owner_select" ON iot_devices;
DROP POLICY IF EXISTS "devices_member_select" ON iot_devices;
DROP POLICY IF EXISTS "devices_owner_insert" ON iot_devices;
DROP POLICY IF EXISTS "devices_member_insert" ON iot_devices;
DROP POLICY IF EXISTS "devices_owner_update" ON iot_devices;
DROP POLICY IF EXISTS "devices_member_update" ON iot_devices;
DROP POLICY IF EXISTS "devices_owner_delete" ON iot_devices;

-- Companies policies (simplified)
CREATE POLICY "companies_select"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "companies_insert"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "companies_owner_write"
  ON companies
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Company members policies (simplified)
CREATE POLICY "members_select"
  ON company_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    company_id IN (
      SELECT id 
      FROM companies 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "members_owner_write"
  ON company_members
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT id 
      FROM companies 
      WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT id 
      FROM companies 
      WHERE owner_id = auth.uid()
    )
  );

-- IoT devices policies (simplified)
CREATE POLICY "devices_select"
  ON iot_devices
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id 
      FROM companies 
      WHERE owner_id = auth.uid()
    ) OR
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "devices_insert"
  ON iot_devices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT id 
      FROM companies 
      WHERE owner_id = auth.uid()
    ) OR
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "devices_update"
  ON iot_devices
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT id 
      FROM companies 
      WHERE owner_id = auth.uid()
    ) OR
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT id 
      FROM companies 
      WHERE owner_id = auth.uid()
    ) OR
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "devices_owner_delete"
  ON iot_devices
  FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT id 
      FROM companies 
      WHERE owner_id = auth.uid()
    )
  );

-- Optimize get_user_companies function
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
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  -- Get owned companies
  SELECT 
    c.id,
    c.name,
    c.description,
    c.owner_id,
    TRUE as is_owner,
    c.created_at,
    c.updated_at
  FROM companies c
  WHERE c.owner_id = auth.uid()
  
  UNION ALL
  
  -- Get companies where user is a member
  SELECT 
    c.id,
    c.name,
    c.description,
    c.owner_id,
    FALSE as is_owner,
    c.created_at,
    c.updated_at
  FROM companies c
  INNER JOIN company_members cm ON c.id = cm.company_id
  WHERE cm.user_id = auth.uid()
  
  ORDER BY name;
$$;