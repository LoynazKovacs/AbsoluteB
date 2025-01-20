/*
  # Create IoT Devices Table

  1. New Tables
    - `iot_devices`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `type` (text, not null)
      - `raw_value` (numeric)
      - `owner_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `iot_devices` table
    - Add policies for authenticated users to manage their own devices
    - Allow reading all devices

  3. Test Data
    - Insert sample IoT devices with different types
*/

-- Create the iot_devices table
CREATE TABLE IF NOT EXISTS iot_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  raw_value numeric,
  owner_id uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read all devices"
  ON iot_devices
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own devices"
  ON iot_devices
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own devices"
  ON iot_devices
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own devices"
  ON iot_devices
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Create a trigger for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER iot_devices_updated_at
  BEFORE UPDATE ON iot_devices
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Insert sample data
INSERT INTO iot_devices (name, type, raw_value)
VALUES 
  ('Kitchen Scale', 'scale', 245.5),
  ('Living Room Light Sensor', 'light', 850),
  ('Bedroom Thermometer', 'thermometer', 22.5),
  ('Bathroom Humidity Sensor', 'humidity', 65),
  ('Garden Soil Moisture', 'moisture', 42),
  ('Office CO2 Sensor', 'co2', 450),
  ('Garage Motion Sensor', 'motion', 0),
  ('Basement Water Leak Detector', 'water', 0),
  ('Attic Temperature Sensor', 'thermometer', 28.3),
  ('Front Door Light Sensor', 'light', 1200);