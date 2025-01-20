/*
  # Fix get_table_columns function

  1. Changes
    - Drop existing function to allow parameter name change
    - Recreate function with renamed parameter
    - Maintain same functionality with better naming
*/

-- First drop the existing function
drop function if exists get_table_columns(text);

-- Recreate the function with the new parameter name
create function get_table_columns(p_table_name text)
returns table (
  column_name text,
  data_type text,
  is_nullable boolean,
  column_default text
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  return query
  select
    c.column_name::text,
    c.data_type::text,
    c.is_nullable::boolean,
    c.column_default::text
  from
    information_schema.columns c
  where
    c.table_schema = 'public'
    and c.table_name = p_table_name
  order by
    c.ordinal_position;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function get_table_columns to authenticated;