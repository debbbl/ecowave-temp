/*
  # Add SYSTEM to entity_type enum

  1. Problem
    - The entity_type enum is missing 'SYSTEM' as a valid value
    - Application is trying to log SYSTEM actions but database rejects them
    - Error: invalid input value for enum entity_type: "SYSTEM"

  2. Solution
    - Safely add 'SYSTEM' to the entity_type enum
    - Handle all possible scenarios (enum exists/doesn't exist, value exists/doesn't exist)
    - Ensure all required entity types are present

  3. Safety
    - Use proper error handling for all scenarios
    - Check for enum existence before modification
    - Only add values that don't already exist
*/

-- Add SYSTEM to the entity_type enum if it doesn't exist
DO $$
DECLARE
    enum_exists BOOLEAN := FALSE;
    system_exists BOOLEAN := FALSE;
BEGIN
    -- Check if entity_type_enum exists
    SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'entity_type_enum'
    ) INTO enum_exists;
    
    IF enum_exists THEN
        RAISE NOTICE 'entity_type_enum exists';
        
        -- Check if SYSTEM value already exists
        SELECT EXISTS (
            SELECT 1 
            FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'entity_type_enum' 
            AND e.enumlabel = 'SYSTEM'
        ) INTO system_exists;
        
        IF system_exists THEN
            RAISE NOTICE 'SYSTEM value already exists in entity_type_enum';
        ELSE
            RAISE NOTICE 'Adding SYSTEM value to entity_type_enum';
            ALTER TYPE entity_type_enum ADD VALUE 'SYSTEM';
        END IF;
        
        -- Ensure all other required values exist
        DECLARE
            required_values TEXT[] := ARRAY['USER', 'EVENT', 'REWARD', 'FEEDBACK'];
            val TEXT;
            val_exists BOOLEAN;
        BEGIN
            FOREACH val IN ARRAY required_values
            LOOP
                SELECT EXISTS (
                    SELECT 1 
                    FROM pg_enum e
                    JOIN pg_type t ON e.enumtypid = t.oid
                    WHERE t.typname = 'entity_type_enum' 
                    AND e.enumlabel = val
                ) INTO val_exists;
                
                IF NOT val_exists THEN
                    EXECUTE format('ALTER TYPE entity_type_enum ADD VALUE %L', val);
                    RAISE NOTICE 'Added % to entity_type_enum', val;
                END IF;
            END LOOP;
        END;
        
    ELSE
        RAISE NOTICE 'entity_type_enum does not exist - creating it with all required values';
        -- Create the enum with all required values
        CREATE TYPE entity_type_enum AS ENUM ('USER', 'EVENT', 'REWARD', 'FEEDBACK', 'SYSTEM');
    END IF;
END $$;

-- Also check for action_type_enum and ensure it has all required values
DO $$
DECLARE
    enum_exists BOOLEAN := FALSE;
BEGIN
    -- Check if action_type_enum exists
    SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'action_type_enum'
    ) INTO enum_exists;
    
    IF enum_exists THEN
        RAISE NOTICE 'action_type_enum exists';
        
        -- Ensure all required action type values exist
        DECLARE
            required_values TEXT[] := ARRAY['CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN', 'LOGOUT'];
            val TEXT;
            val_exists BOOLEAN;
        BEGIN
            FOREACH val IN ARRAY required_values
            LOOP
                SELECT EXISTS (
                    SELECT 1 
                    FROM pg_enum e
                    JOIN pg_type t ON e.enumtypid = t.oid
                    WHERE t.typname = 'action_type_enum' 
                    AND e.enumlabel = val
                ) INTO val_exists;
                
                IF NOT val_exists THEN
                    EXECUTE format('ALTER TYPE action_type_enum ADD VALUE %L', val);
                    RAISE NOTICE 'Added % to action_type_enum', val;
                END IF;
            END LOOP;
        END;
        
    ELSE
        RAISE NOTICE 'action_type_enum does not exist - creating it with all required values';
        -- Create the enum with all required values
        CREATE TYPE action_type_enum AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN', 'LOGOUT');
    END IF;
END $$;

-- Update the admin_activity_log table to use the correct enum types if needed
DO $$
BEGIN
    -- Check if the table exists and update column types if necessary
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_activity_log') THEN
        -- Check if columns are using the correct enum types
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'admin_activity_log' 
            AND column_name = 'action_type' 
            AND udt_name != 'action_type_enum'
        ) THEN
            RAISE NOTICE 'Updating action_type column to use action_type_enum';
            ALTER TABLE admin_activity_log ALTER COLUMN action_type TYPE action_type_enum USING action_type::text::action_type_enum;
        END IF;
        
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'admin_activity_log' 
            AND column_name = 'entity_type' 
            AND udt_name != 'entity_type_enum'
        ) THEN
            RAISE NOTICE 'Updating entity_type column to use entity_type_enum';
            ALTER TABLE admin_activity_log ALTER COLUMN entity_type TYPE entity_type_enum USING entity_type::text::entity_type_enum;
        END IF;
    END IF;
END $$;

-- Verify the final state
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entity_type_enum') THEN
        RAISE NOTICE 'Final entity_type_enum values:';
        FOR rec IN 
            SELECT e.enumlabel 
            FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'entity_type_enum'
            ORDER BY e.enumsortorder
        LOOP
            RAISE NOTICE '  - %', rec.enumlabel;
        END LOOP;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'action_type_enum') THEN
        RAISE NOTICE 'Final action_type_enum values:';
        FOR rec IN 
            SELECT e.enumlabel 
            FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'action_type_enum'
            ORDER BY e.enumsortorder
        LOOP
            RAISE NOTICE '  - %', rec.enumlabel;
        END LOOP;
    END IF;
END $$;