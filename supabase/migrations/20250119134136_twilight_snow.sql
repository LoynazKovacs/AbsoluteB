/*
  # Fix recursive policies with optimized queries

  1. Changes
    - Create materialized view for user permissions
    - Simplify policies to use direct lookups
    - Add indexes for better query performance
    - Optimize access patterns
  
  2. Security
    - Maintain same security model with more efficient implementation
    - Ensure proper access control for owners and members
*/

-- Create materialized view for user permissions
CREATE MATERIALIZED VIEW user_permissions AS
SELECT DISTINCT
    u.id as user_id,
    c.id as company_id,
    CASE 
        WHEN c.owner_id = u.id THEN true
        ELSE false
    END as is_owner
FROM auth.users u
CROSS JOIN companies c
LEFT JOIN company_members cm ON c.id = cm.company_id AND u.id = cm.user_id
WHERE c.owner_id = u.id OR cm.user_id = u.id;

-- Create indexes for the materialized view
CREATE UNIQUE INDEX user_permissions_idx ON user_permissions (user_id, company_id);
CREATE INDEX user_permissions_company_idx ON user_permissions (company_id);
CREATE INDEX user_permissions_user_idx ON user_permissions (user_id);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_user_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_permissions;
    RETURN NULL;
END;
$$;

-- Create triggers to refresh the materialized view
CREATE TRIGGER refresh_user_permissions_companies
    AFTER INSERT OR UPDATE OR DELETE ON companies
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_user_permissions();

CREATE TRIGGER refresh_user_permissions_members
    AFTER INSERT OR UPDATE OR DELETE ON company_members
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_user_permissions();

-- Drop existing policies
DROP POLICY IF EXISTS "companies_select" ON companies;
DROP POLICY IF EXISTS "companies_insert" ON companies;
DROP POLICY IF EXISTS "companies_owner_write" ON companies;
DROP POLICY IF EXISTS "members_select" ON company_members;
DROP POLICY IF EXISTS "members_owner_write" ON company_members;
DROP POLICY IF EXISTS "devices_select" ON iot_devices;
DROP POLICY IF EXISTS "devices_insert" ON iot_devices;
DROP POLICY IF EXISTS "devices_update" ON iot_devices;
DROP POLICY IF EXISTS "devices_owner_delete" ON iot_devices;

-- Create optimized policies using the materialized view
CREATE POLICY "companies_access"
    ON companies
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_permissions
            WHERE company_id = id
            AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_permissions
            WHERE company_id = id
            AND user_id = auth.uid()
            AND is_owner = true
        )
    );

CREATE POLICY "members_access"
    ON company_members
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_permissions
            WHERE company_id = company_members.company_id
            AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_permissions
            WHERE company_id = company_members.company_id
            AND user_id = auth.uid()
            AND is_owner = true
        )
    );

CREATE POLICY "devices_access"
    ON iot_devices
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_permissions
            WHERE company_id = iot_devices.company_id
            AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_permissions
            WHERE company_id = iot_devices.company_id
            AND user_id = auth.uid()
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
    SELECT
        c.id,
        c.name,
        c.description,
        c.owner_id,
        up.is_owner,
        c.created_at,
        c.updated_at
    FROM companies c
    JOIN user_permissions up ON c.id = up.company_id
    WHERE up.user_id = auth.uid()
    ORDER BY c.name;
$$;