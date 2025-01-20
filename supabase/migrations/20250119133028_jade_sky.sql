/*
  # Fix Remaining Policy Issues

  This migration:
  1. Drops and recreates company member policies to avoid recursion
  2. Ensures all policies use direct conditions without circular references
  3. Simplifies policy logic for better performance
*/

-- Drop existing company member policies
DROP POLICY IF EXISTS "View owned company members" ON company_members;
DROP POLICY IF EXISTS "View own memberships" ON company_members;
DROP POLICY IF EXISTS "Manage owned company members" ON company_members;

-- Create simplified company member policies
CREATE POLICY "View company members as owner"
  ON company_members
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 
    FROM companies 
    WHERE companies.id = company_members.company_id 
    AND companies.owner_id = auth.uid()
  ));

CREATE POLICY "View company members as member"
  ON company_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Manage members as owner"
  ON company_members
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 
    FROM companies 
    WHERE companies.id = company_members.company_id 
    AND companies.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 
    FROM companies 
    WHERE companies.id = company_members.company_id 
    AND companies.owner_id = auth.uid()
  ));

-- Update get_user_companies function for better performance
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
  -- Get all relevant companies in one query
  RETURN QUERY
  WITH user_companies AS (
    -- Companies user owns
    SELECT 
      c.*,
      true as is_owner
    FROM companies c
    WHERE c.owner_id = auth.uid()
    
    UNION
    
    -- Companies user is a member of
    SELECT 
      c.*,
      false as is_owner
    FROM companies c
    JOIN company_members cm ON c.id = cm.company_id
    WHERE cm.user_id = auth.uid()
  )
  SELECT
    uc.id,
    uc.name,
    uc.description,
    uc.owner_id,
    uc.is_owner,
    uc.created_at,
    uc.updated_at
  FROM user_companies uc
  ORDER BY uc.name;
END;
$$;