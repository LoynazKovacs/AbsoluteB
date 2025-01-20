/*
  # Fix IoT Devices Policies

  This migration fixes the infinite recursion issue in IoT devices policies by:
  1. Dropping existing policies that may cause recursion
  2. Creating simplified policies with direct conditions
  3. Using EXISTS instead of IN for better performance
  4. Separating owner and member policies clearly
*/

-- Drop existing IoT devices policies
DROP POLICY IF EXISTS "Users can read owned company devices" ON iot_devices;
DROP POLICY IF EXISTS "Members can read company devices" ON iot_devices;
DROP POLICY IF EXISTS "Users can create devices in owned companies" ON iot_devices;
DROP POLICY IF EXISTS "Members can create devices in their companies" ON iot_devices;
DROP POLICY IF EXISTS "Users can update devices in owned companies" ON iot_devices;
DROP POLICY IF EXISTS "Members can update devices in their companies" ON iot_devices;
DROP POLICY IF EXISTS "Users can delete company devices" ON iot_devices;

-- Simple, direct IoT devices policies
CREATE POLICY "View devices in owned companies"
  ON iot_devices
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM companies
    WHERE id = iot_devices.company_id
    AND owner_id = auth.uid()
  ));

CREATE POLICY "View devices as company member"
  ON iot_devices
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = iot_devices.company_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Create devices in owned companies"
  ON iot_devices
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM companies
    WHERE id = iot_devices.company_id
    AND owner_id = auth.uid()
  ));

CREATE POLICY "Create devices as company member"
  ON iot_devices
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = iot_devices.company_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Update devices in owned companies"
  ON iot_devices
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM companies
    WHERE id = iot_devices.company_id
    AND owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM companies
    WHERE id = iot_devices.company_id
    AND owner_id = auth.uid()
  ));

CREATE POLICY "Update devices as company member"
  ON iot_devices
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = iot_devices.company_id
    AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = iot_devices.company_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Delete devices in owned companies"
  ON iot_devices
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM companies
    WHERE id = iot_devices.company_id
    AND owner_id = auth.uid()
  ));