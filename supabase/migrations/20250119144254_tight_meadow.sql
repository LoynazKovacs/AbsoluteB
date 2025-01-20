/*
  # Fix device access policies

  1. Changes
    - Drop existing device policies
    - Create new simplified policies that allow:
      - Company owners to manage all devices in their companies
      - Company members to view and manage devices in their companies
      - Remove admin-specific checks
*/

-- Drop existing device policies
DROP POLICY IF EXISTS "devices_select" ON iot_devices;
DROP POLICY IF EXISTS "devices_insert" ON iot_devices;
DROP POLICY IF EXISTS "devices_update" ON iot_devices;
DROP POLICY IF EXISTS "devices_owner_delete" ON iot_devices;

-- Create new simplified policies
CREATE POLICY "devices_select"
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

CREATE POLICY "devices_insert"
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

CREATE POLICY "devices_update"
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

CREATE POLICY "devices_delete"
  ON iot_devices
  FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
      UNION
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );