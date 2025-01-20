/*
  # Fix Company Policies Recursion

  This migration fixes the infinite recursion issue in company policies by:
  1. Dropping existing policies that may cause recursion
  2. Creating simplified policies with direct conditions
  3. Separating owner and member policies clearly
  4. Avoiding nested subqueries that could cause circular references
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view owned companies" ON companies;
DROP POLICY IF EXISTS "Users can view companies they are members of" ON companies;
DROP POLICY IF EXISTS "Users can create companies" ON companies;
DROP POLICY IF EXISTS "Only owners can update their companies" ON companies;
DROP POLICY IF EXISTS "Only owners can delete their companies" ON companies;
DROP POLICY IF EXISTS "Users can view members of owned companies" ON company_members;
DROP POLICY IF EXISTS "Members can view their company members" ON company_members;
DROP POLICY IF EXISTS "Company owners can manage members" ON company_members;

-- Simple, direct company policies
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
    SELECT 1 FROM company_members
    WHERE company_id = companies.id
    AND user_id = auth.uid()
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

-- Simple, direct company members policies
CREATE POLICY "View owned company members"
  ON company_members
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM companies
    WHERE id = company_members.company_id
    AND owner_id = auth.uid()
  ));

CREATE POLICY "View own memberships"
  ON company_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Manage owned company members"
  ON company_members
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM companies
    WHERE id = company_members.company_id
    AND owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM companies
    WHERE id = company_members.company_id
    AND owner_id = auth.uid()
  ));

-- Update the get_user_companies function to use simpler queries
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
  LEFT JOIN company_members cm ON c.id = cm.company_id
  WHERE 
    c.owner_id = auth.uid()
    OR cm.user_id = auth.uid()
  ORDER BY c.id, c.name;
END;
$$;