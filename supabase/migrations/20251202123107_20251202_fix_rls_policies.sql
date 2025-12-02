/*
  # Fix RLS Policies for Service Role Access

  Fixes RLS policies to allow edge functions using service role key to insert data.
  
  Changes:
  - Update INSERT policy to allow unrestricted inserts (service role bypasses RLS)
  - Keep SELECT policy for public visibility
*/

DROP POLICY IF EXISTS "Anyone can record their spin" ON user_spins;
DROP POLICY IF EXISTS "Anyone can check if they've spun" ON user_spins;

CREATE POLICY "Allow service role to insert spins"
  ON user_spins FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Allow public to read spins"
  ON user_spins FOR SELECT
  TO authenticated, anon
  USING (true);
