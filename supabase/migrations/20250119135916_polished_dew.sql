/*
  # Simplify company policies and remove materialized view dependency

  1. Changes
    - Drop materialized view and related objects
    - Create simple, direct policies for companies table
    - Update get_user_companies function to use direct queries
*/

-- Drop materialized view and related objects
DROP MATERIALIZED VIEW IF EXISTS user_permissions CASCADE;
DROP FUNCTION IF EXISTS refresh_user_permissions() CASCADE;
DROP TRIGGER IF EXISTS refresh_user_permissions_companies ON companies;
DROP TRIGGER IF EXISTS refresh_user_permissions_members ON company_members;

-- Drop existing policies
DROP POLICY IF EXISTS "company_select" ON companies;
DROP POLICY IF EXISTS "company_insert" ON companies;
DROP POLICY IF EXISTS "company_update" ON companies;
DROP POLICY IF EXISTS "company_delete" ON companies;

-- Create simplified policies
CREATE POLICY "company_select"
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

CREATE POLICY "company_insert"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "company_update"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "company_delete"
  ON companies
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Update get_user_companies function to use direct queries
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