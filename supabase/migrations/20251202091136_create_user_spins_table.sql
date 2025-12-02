/*
  # Create user_spins table for tracking individual spin records

  1. New Tables
    - `user_spins`
      - `id` (uuid, primary key)
      - `phone` (text, unique, not null) - Phone number of the spinner
      - `name` (text, not null) - Name of the spinner
      - `prize` (text, not null) - Prize won from the spin
      - `spun_at` (timestamptz, default: now()) - When the spin occurred
      - `created_at` (timestamptz, default: now()) - Record creation time

  2. Security
    - Enable RLS on `user_spins` table
    - Add policy to allow public read access for checking spin history
    - Add policy to allow service role to insert records

  3. Indexes
    - Unique constraint on phone column to prevent duplicate spins
    - Index on created_at for efficient sorting

  IMPORTANT NOTES:
    1. The phone column has a UNIQUE constraint to enforce single-spin-per-phone
    2. RLS is enabled but allows public read access for the application to check history
    3. Service role writes are used by edge functions to record spins
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

CREATE POLICY "Allow public read for spin history"
  ON user_spins
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow service role to insert spins"
  ON user_spins
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_user_spins_phone ON user_spins(phone);
CREATE INDEX IF NOT EXISTS idx_user_spins_created_at ON user_spins(created_at);
