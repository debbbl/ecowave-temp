/*
  # Fix admin_activity_log action_type ENUM

  1. Problem
    - The action_type column is an ENUM type in the database
    - The ENUM is missing 'UPDATE' as a valid value
    - This causes errors when trying to log UPDATE actions

  2. Solution
    - Add 'UPDATE' to the existing action_type ENUM
    - Ensure all required action types are available

  3. Safety
    - Use IF NOT EXISTS equivalent for ENUM values
    - Handle case where ENUM might already have the value
*/

-- Add UPDATE to the action_type enum if it doesn't exist
DO $$
BEGIN
    -- Check if the enum type exists and add UPDATE if not present
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'action_type' 
        AND e.enumlabel = 'UPDATE'
    ) THEN
        ALTER TYPE action_type ADD VALUE 'UPDATE';
    END IF;
EXCEPTION
    WHEN undefined_object THEN
        -- If action_type enum doesn't exist, it might be a TEXT column with CHECK constraint
        -- In that case, this migration is not needed
        RAISE NOTICE 'action_type enum does not exist, skipping UPDATE value addition';
END $$;

-- Ensure all required enum values exist
DO $$
DECLARE
    required_values TEXT[] := ARRAY['CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN', 'LOGOUT'];
    val TEXT;
BEGIN
    FOREACH val IN ARRAY required_values
    LOOP
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'action_type' 
            AND e.enumlabel = val
        ) THEN
            BEGIN
                EXECUTE format('ALTER TYPE action_type ADD VALUE %L', val);
                RAISE NOTICE 'Added % to action_type enum', val;
            EXCEPTION
                WHEN undefined_object THEN
                    RAISE NOTICE 'action_type enum does not exist, cannot add %', val;
                    EXIT; -- Exit the loop if enum doesn't exist
            END;
        END IF;
    END LOOP;
END $$;