/*
  # Fix company policies

  1. Changes
    - Simplify company policies to ensure users can create companies
    - Remove unnecessary complexity from materialized views
    - Add explicit insert policy for companies

  2. Security
    - Maintain RLS for all tables
    - Ensure proper access control for company operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "companies_access" ON companies;

-- Create separate policies for different operations
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
  WITH CHECK (
    owner_id = auth.uid()
  );

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

-- Refresh the materialized view to ensure it's up to date
REFRESH MATERIALIZED VIEW CONCURRENTLY user_permissions;