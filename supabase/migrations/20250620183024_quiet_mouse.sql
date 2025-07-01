/*
  # Fix action_type enum to include UPDATE value

  1. Problem
    - The action_type enum is missing 'UPDATE' as a valid value
    - Application is trying to log UPDATE actions but database rejects them
    - Previous migration may not have been applied successfully

  2. Solution
    - Safely add 'UPDATE' to the action_type enum
    - Handle all possible scenarios (enum exists/doesn't exist, value exists/doesn't exist)
    - Ensure all required action types are present

  3. Safety
    - Use proper error handling for all scenarios
    - Check for enum existence before modification
    - Only add values that don't already exist
*/

-- First, let's check if the enum exists and what values it currently has
DO $$
DECLARE
    enum_exists BOOLEAN := FALSE;
    update_exists BOOLEAN := FALSE;
BEGIN
    -- Check if action_type enum exists
    SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'action_type'
    ) INTO enum_exists;
    
    IF enum_exists THEN
        RAISE NOTICE 'action_type enum exists';
        
        -- Check if UPDATE value already exists
        SELECT EXISTS (
            SELECT 1 
            FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'action_type' 
            AND e.enumlabel = 'UPDATE'
        ) INTO update_exists;
        
        IF update_exists THEN
            RAISE NOTICE 'UPDATE value already exists in action_type enum';
        ELSE
            RAISE NOTICE 'Adding UPDATE value to action_type enum';
            ALTER TYPE action_type ADD VALUE 'UPDATE';
        END IF;
        
        -- Ensure all other required values exist
        DECLARE
            required_values TEXT[] := ARRAY['CREATE', 'DELETE', 'EXPORT', 'LOGIN', 'LOGOUT'];
            val TEXT;
            val_exists BOOLEAN;
        BEGIN
            FOREACH val IN ARRAY required_values
            LOOP
                SELECT EXISTS (
                    SELECT 1 
                    FROM pg_enum e
                    JOIN pg_type t ON e.enumtypid = t.oid
                    WHERE t.typname = 'action_type' 
                    AND e.enumlabel = val
                ) INTO val_exists;
                
                IF NOT val_exists THEN
                    EXECUTE format('ALTER TYPE action_type ADD VALUE %L', val);
                    RAISE NOTICE 'Added % to action_type enum', val;
                END IF;
            END LOOP;
        END;
        
    ELSE
        RAISE NOTICE 'action_type enum does not exist - this suggests the table structure is different than expected';
        -- If enum doesn't exist, let's check if admin_activity_log table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_activity_log') THEN
            RAISE NOTICE 'admin_activity_log table exists but action_type enum does not - checking column type';
            -- This would indicate the column might be TEXT with CHECK constraint instead of ENUM
        ELSE
            RAISE NOTICE 'admin_activity_log table does not exist';
        END IF;
    END IF;
END $$;

-- Verify the final state
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'action_type') THEN
        RAISE NOTICE 'Final action_type enum values:';
        FOR rec IN 
            SELECT e.enumlabel 
            FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'action_type'
            ORDER BY e.enumsortorder
        LOOP
            RAISE NOTICE '  - %', rec.enumlabel;
        END LOOP;
    END IF;
END $$;