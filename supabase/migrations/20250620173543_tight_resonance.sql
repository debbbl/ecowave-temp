/*
  # Create Admin Activity Log Table

  1. New Tables
    - `admin_activity_log`
      - `activity_id` (serial, primary key)
      - `admin_id` (integer, references users table)
      - `action_type` (text, type of action performed)
      - `entity_type` (text, type of entity affected)
      - `entity_id` (integer, ID of affected entity)
      - `details` (text, description of the action)
      - `metadata` (jsonb, additional data about the action)
      - `created_at` (timestamptz, when action was performed)

  2. Security
    - Enable RLS on `admin_activity_log` table
    - Add policy for admins to read all activity logs
    - Add policy for admins to insert new activity logs

  3. Indexes
    - Index on admin_id for efficient queries by admin
    - Index on created_at for time-based queries
    - Index on entity_type and entity_id for entity-based queries
*/

-- Create admin activity log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  activity_id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN', 'LOGOUT')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('USER', 'EVENT', 'REWARD', 'FEEDBACK', 'SYSTEM')),
  entity_id INTEGER,
  details TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint to users table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    ALTER TABLE admin_activity_log 
    ADD CONSTRAINT admin_activity_log_admin_id_fkey 
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to read all activity logs
CREATE POLICY "Admins can read all activity logs"
  ON admin_activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = admin_activity_log.admin_id 
      AND users.role = 'admin'
    )
  );

-- Create policy for admins to insert activity logs
CREATE POLICY "Admins can insert activity logs"
  ON admin_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = admin_activity_log.admin_id 
      AND users.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_entity ON admin_activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action_type ON admin_activity_log(action_type);

-- Add comment to table
COMMENT ON TABLE admin_activity_log IS 'Tracks all administrative actions performed in the system';
COMMENT ON COLUMN admin_activity_log.activity_id IS 'Unique identifier for each activity log entry';
COMMENT ON COLUMN admin_activity_log.admin_id IS 'ID of the admin user who performed the action';
COMMENT ON COLUMN admin_activity_log.action_type IS 'Type of action performed (CREATE, UPDATE, DELETE, etc.)';
COMMENT ON COLUMN admin_activity_log.entity_type IS 'Type of entity that was affected by the action';
COMMENT ON COLUMN admin_activity_log.entity_id IS 'ID of the specific entity that was affected';
COMMENT ON COLUMN admin_activity_log.details IS 'Human-readable description of what was done';
COMMENT ON COLUMN admin_activity_log.metadata IS 'Additional structured data about the action';
COMMENT ON COLUMN admin_activity_log.created_at IS 'Timestamp when the action was performed';