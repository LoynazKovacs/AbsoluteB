/*
  # Fix profile table RLS policies

  1. Changes
    - Add policy for users to insert their own profile
    - Add policy for users to update their own profile
    - Ensure policies use proper auth checks

  2. Security
    - Maintains row-level security
    - Only allows users to manage their own profile data
*/

-- Drop existing policies to recreate them with correct permissions
drop policy if exists "Users can read own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

-- Create comprehensive policies for profile management
create policy "Users can manage own profile"
  on profiles
  for all -- Allows SELECT, INSERT, UPDATE
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Ensure RLS is enabled
alter table profiles enable row level security;