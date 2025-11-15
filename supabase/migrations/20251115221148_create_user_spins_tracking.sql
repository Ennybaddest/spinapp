/*
  # Create user spins tracking table

  1. New Tables
    - `user_spins` - Track one spin per user
      - `id` (uuid, primary key)
      - `phone` (text, unique) - Phone number as unique identifier
      - `name` (text) - User name
      - `prize` (text) - Prize won
      - `spun_at` (timestamp) - When the spin happened
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `user_spins` table
    - Add public select policy for checking spin status
    - Add public insert policy for new spins
*/

CREATE TABLE IF NOT EXISTS user_spins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,
  name text NOT NULL,
  prize text NOT NULL,
  spun_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_spins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can check if they've spun"
  ON user_spins FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can record their spin"
  ON user_spins FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
