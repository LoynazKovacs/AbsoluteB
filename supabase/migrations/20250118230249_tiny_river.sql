/*
  # Add get_tables function

  1. New Functions
    - `get_tables`: Returns a list of all tables in the public schema
  2. Security
    - Function is accessible only to authenticated users
*/

-- Function to get all tables in the public schema
create or replace function get_tables()
returns text[]
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  tables text[];
begin
  select array_agg(tablename::text)
  into tables
  from pg_tables
  where schemaname = 'public';
  
  return tables;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function get_tables to authenticated;