/*
  # Create spins tracking table for Deliciosa Spin & Win

  1. New Tables
    - `spins`
      - `id` (uuid, primary key) - Unique identifier for each spin
      - `name` (text) - User's name
      - `phone` (text) - User's phone number
      - `prize` (text) - The prize they won
      - `created_at` (timestamptz) - When the spin occurred
      - `ip_address` (text, optional) - For additional tracking
  
  2. Security
    - Enable RLS on `spins` table
    - Add policy for public insert access (anyone can spin)
    - Add policy for authenticated users to read all data (for admin)
  
  3. Notes
    - This table tracks all spin attempts for marketing and analytics
    - Public insert allows the app to record spins without authentication
    - Only authenticated users (admin) can view the data
*/

CREATE TABLE IF NOT EXISTS spins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  prize text NOT NULL,
  created_at timestamptz DEFAULT now(),
  ip_address text
);

ALTER TABLE spins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a spin"
  ON spins
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all spins"
  ON spins
  FOR SELECT
  TO authenticated
  USING (true);