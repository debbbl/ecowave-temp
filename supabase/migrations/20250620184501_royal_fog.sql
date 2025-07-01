/*
  # Create Admin Activity Log Table

  1. New Tables
    - `admin_activity_log`
      - `log_id` (integer, primary key, auto-increment)
      - `admin_id` (integer, foreign key to users.user_id)
      - `action_type` (user-defined enum: CREATE, UPDATE, DELETE, EXPORT, LOGIN, LOGOUT)
      - `entity_type` (user-defined enum: USER, EVENT, REWARD, FEEDBACK, SYSTEM)
      - `entity_id` (integer, nullable)
      - `details` (text, required)
      - `created_at` (timestamp with timezone, default CURRENT_TIMESTAMP)

  2. Security
    - Enable RLS on `admin_activity_log` table
    - Add policy for admins to read all activity logs
    - Add policy for admins to insert activity logs

  3. Indexes
    - Index on admin_id for performance
    - Index on created_at for chronological queries
    - Index on entity_type and entity_id for entity-specific queries
    - Index on action_type for filtering by action
*/

-- Create the admin_activity_log table with log_id as primary key (matching your schema)
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  log_id integer NOT NULL DEFAULT nextval('admin_activity_log_log_id_seq'::regclass),
  admin_id integer,
  action_type USER-DEFINED NOT NULL,
  entity_type USER-DEFINED NOT NULL,
  entity_id integer NOT NULL,
  details text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT admin_activity_log_pkey PRIMARY KEY (log_id),
  CONSTRAINT admin_activity_log_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(user_id)
);

-- Create the sequence if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS admin_activity_log_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Set the sequence owner
ALTER SEQUENCE admin_activity_log_log_id_seq OWNED BY admin_activity_log.log_id;

-- Create custom types for action_type and entity_type if they don't exist
DO $$
BEGIN
    -- Create action_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'action_type_enum') THEN
        CREATE TYPE action_type_enum AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN', 'LOGOUT');
    END IF;
    
    -- Create entity_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entity_type_enum') THEN
        CREATE TYPE entity_type_enum AS ENUM ('USER', 'EVENT', 'REWARD', 'FEEDBACK', 'SYSTEM');
    END IF;
END $$;

-- Update the table to use the proper enum types if needed
DO $$
BEGIN
    -- Check if we need to update the column types
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_activity_log' 
        AND column_name = 'action_type' 
        AND data_type = 'USER-DEFINED'
    ) THEN
        -- The columns already exist with USER-DEFINED type, which is correct
        RAISE NOTICE 'admin_activity_log table already has correct column types';
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can read all activity logs" ON admin_activity_log;
DROP POLICY IF EXISTS "Admins can insert activity logs" ON admin_activity_log;

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

-- Add comments to document the table structure
COMMENT ON TABLE admin_activity_log IS 'Tracks all administrative actions performed in the EcoWave Hub system';
COMMENT ON COLUMN admin_activity_log.log_id IS 'Unique identifier for each activity log entry (primary key)';
COMMENT ON COLUMN admin_activity_log.admin_id IS 'ID of the admin user who performed the action (foreign key to users.user_id)';
COMMENT ON COLUMN admin_activity_log.action_type IS 'Type of action performed (CREATE, UPDATE, DELETE, EXPORT, LOGIN, LOGOUT)';
COMMENT ON COLUMN admin_activity_log.entity_type IS 'Type of entity that was affected by the action (USER, EVENT, REWARD, FEEDBACK, SYSTEM)';
COMMENT ON COLUMN admin_activity_log.entity_id IS 'ID of the specific entity that was affected (required)';
COMMENT ON COLUMN admin_activity_log.details IS 'Human-readable description of what was done';
COMMENT ON COLUMN admin_activity_log.created_at IS 'Timestamp when the action was performed';

-- Insert some sample data for testing (optional)
DO $$
BEGIN
    -- Only insert sample data if the table is empty
    IF NOT EXISTS (SELECT 1 FROM admin_activity_log LIMIT 1) THEN
        -- Get the first admin user ID
        IF EXISTS (SELECT 1 FROM users WHERE role = 'admin' LIMIT 1) THEN
            INSERT INTO admin_activity_log (admin_id, action_type, entity_type, entity_id, details, created_at)
            SELECT 
                (SELECT user_id FROM users WHERE role = 'admin' LIMIT 1),
                'CREATE'::action_type_enum,
                'SYSTEM'::entity_type_enum,
                1,
                'Admin activity logging system initialized and ready for use',
                CURRENT_TIMESTAMP;
            
            RAISE NOTICE 'Sample admin activity log entry created';
        END IF;
    END IF;
END $$;