/*
  # Fix company policies and add owner_id trigger

  1. Changes
    - Add trigger to automatically set owner_id on company creation
    - Simplify company policies
    - Ensure proper owner_id handling

  2. Security
    - Maintain RLS for all tables
    - Ensure proper access control
*/

-- Create trigger function to set owner_id
CREATE OR REPLACE FUNCTION set_company_owner_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.owner_id := auth.uid();
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS set_company_owner_id_trigger ON companies;
CREATE TRIGGER set_company_owner_id_trigger
  BEFORE INSERT ON companies
  FOR EACH ROW
  EXECUTE FUNCTION set_company_owner_id();

-- Drop existing policies
DROP POLICY IF EXISTS "companies_select" ON companies;
DROP POLICY IF EXISTS "companies_insert" ON companies;
DROP POLICY IF EXISTS "companies_update" ON companies;
DROP POLICY IF EXISTS "companies_delete" ON companies;

-- Create simplified policies
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
  WITH CHECK (true);  -- The trigger will handle setting owner_id

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

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW CONCURRENTLY user_permissions;