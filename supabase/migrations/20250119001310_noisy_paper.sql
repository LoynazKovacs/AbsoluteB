/*
  # Update get_table_columns function to include foreign key information

  1. Changes
    - Drop existing function
    - Recreate function with additional columns for foreign key information
    - Add foreign_table_name and foreign_column_name to return type
  
  2. Security
    - Maintain existing security settings (SECURITY DEFINER)
    - Function remains accessible to authenticated users
*/

-- First drop the existing function
DROP FUNCTION IF EXISTS get_table_columns(text);

-- Recreate the function with the new return type
CREATE FUNCTION get_table_columns(p_table_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable boolean,
  column_default text,
  foreign_table_name text,
  foreign_column_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.column_name::text,
    c.data_type::text,
    c.is_nullable::boolean,
    c.column_default::text,
    fc.foreign_table_name::text,
    fc.foreign_column_name::text
  FROM
    information_schema.columns c
    LEFT JOIN (
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = p_table_name
    ) fc ON c.column_name = fc.column_name
  WHERE
    c.table_schema = 'public'
    AND c.table_name = p_table_name
  ORDER BY
    c.ordinal_position;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_table_columns(text) TO authenticated;