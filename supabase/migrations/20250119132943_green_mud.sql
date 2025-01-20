/*
  # Fix Companies Policies

  This migration fixes the infinite recursion issue in companies policies by:
  1. Dropping existing policies that may cause recursion
  2. Creating simplified policies with direct conditions
  3. Using EXISTS instead of IN for better performance
  4. Separating owner and member policies clearly
*/

-- Drop existing companies policies
DROP POLICY IF EXISTS "View owned companies" ON companies;
DROP POLICY IF EXISTS "View member companies" ON companies;
DROP POLICY IF EXISTS "Create companies" ON companies;
DROP POLICY IF EXISTS "Update owned companies" ON companies;
DROP POLICY IF EXISTS "Delete owned companies" ON companies;

-- Create simplified company policies
CREATE POLICY "View owned companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "View member companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 
    FROM company_members 
    WHERE company_members.company_id = companies.id 
    AND company_members.user_id = auth.uid()
  ));

CREATE POLICY "Create companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Update owned companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Delete owned companies"
  ON companies
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Update get_user_companies function to use simpler queries
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
  -- First get companies user owns
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.description,
    c.owner_id,
    true as is_owner,
    c.created_at,
    c.updated_at
  FROM companies c
  WHERE c.owner_id = auth.uid()
  
  UNION
  
  -- Then get companies user is a member of
  SELECT 
    c.id,
    c.name,
    c.description,
    c.owner_id,
    false as is_owner,
    c.created_at,
    c.updated_at
  FROM companies c
  INNER JOIN company_members cm ON c.id = cm.company_id
  WHERE cm.user_id = auth.uid()
  
  ORDER BY name;
END;
$$;