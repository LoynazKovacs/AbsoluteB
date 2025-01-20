/*
  # Update Company and IoT Device Policies

  This migration updates the policies for companies, company members, and IoT devices
  to prevent recursion issues while maintaining proper access control.

  1. Companies Policies
    - Split into separate policies for owners and members
    - Simplified policy conditions
  2. Company Members Policies
    - Separate policies for viewing owned and member companies
    - Simplified management policies
  3. IoT Devices Policies
    - Split into separate policies for owners and members
    - Simplified access control conditions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view companies they own or are members of" ON companies;
DROP POLICY IF EXISTS "Users can view members of their companies" ON company_members;
DROP POLICY IF EXISTS "Users can read company devices" ON iot_devices;
DROP POLICY IF EXISTS "Users can create company devices" ON iot_devices;
DROP POLICY IF EXISTS "Users can update company devices" ON iot_devices;

-- Companies policies
CREATE POLICY "Users can view owned companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can view companies they are members of"
  ON companies
  FOR SELECT
  TO authenticated
  USING (id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()));

-- Company members policies
CREATE POLICY "Users can view members of owned companies"
  ON company_members
  FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Members can view their company members"
  ON company_members
  FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()));

-- IoT devices policies
CREATE POLICY "Users can read owned company devices"
  ON iot_devices
  FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Members can read company devices"
  ON iot_devices
  FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can create devices in owned companies"
  ON iot_devices
  FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Members can create devices in their companies"
  ON iot_devices
  FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update devices in owned companies"
  ON iot_devices
  FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Members can update devices in their companies"
  ON iot_devices
  FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()));