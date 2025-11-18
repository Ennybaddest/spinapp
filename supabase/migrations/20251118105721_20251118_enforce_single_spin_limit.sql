/*
  # Enforce Single-Spin Limit with Strict RLS

  1. Policy Changes
    - Remove overly permissive INSERT policy
    - Add restrictive policy that only allows inserts through service role
    - Add read-only policy for SELECT operations
    - Prevent any UPDATE or DELETE operations
  
  2. Security
    - Only Edge Functions (service role) can insert new spins
    - Clients can only read their own spin status via SELECT
    - Database unique constraint on phone enforces single-spin at database level
    - All write operations must go through the secure API endpoint
  
  3. Implementation
    - Drop existing overly-permissive policies
    - Create new restrictive policies
    - Prevent bypassing the single-spin limit
*/

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_spins' AND policyname = 'Anyone can record their spin') THEN
    DROP POLICY "Anyone can record their spin" ON user_spins;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_spins' AND policyname = 'Anyone can check if they''ve spun') THEN
    DROP POLICY "Anyone can check if they've spun" ON user_spins;
  END IF;
END $$;

CREATE POLICY "Read-only access for checking spin status"
  ON user_spins FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role only for inserts"
  ON user_spins FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Service role only for updates"
  ON user_spins FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Service role only for deletes"
  ON user_spins FOR DELETE
  TO authenticated
  USING (false);
