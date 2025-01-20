/*
  # Add get_table_columns function

  1. New Functions
    - `get_table_columns`: Returns column information for a specified table
  2. Security
    - Function is accessible only to authenticated users
*/

create or replace function get_table_columns(table_name text)
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
    and c.table_name = table_name
  order by
    c.ordinal_position;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function get_table_columns to authenticated;