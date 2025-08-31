-- Test all possible auth functions in your Nhost setup
DO $$
DECLARE
    test_result text;
BEGIN
    RAISE NOTICE 'Testing available auth functions...';

    -- Test 1: auth.uid()
    BEGIN
        EXECUTE 'SELECT auth.uid()';
        RAISE NOTICE '✅ auth.uid() is available';
    EXCEPTION
        WHEN undefined_function THEN
            RAISE NOTICE '❌ auth.uid() is not available';
        WHEN OTHERS THEN
            RAISE NOTICE '❌ auth.uid() error: %', SQLERRM;
    END;

    -- Test 2: auth.role()
    BEGIN
        EXECUTE 'SELECT auth.role()';
        RAISE NOTICE '✅ auth.role() is available';
    EXCEPTION
        WHEN undefined_function THEN
            RAISE NOTICE '❌ auth.role() is not available';
        WHEN OTHERS THEN
            RAISE NOTICE '❌ auth.role() error: %', SQLERRM;
    END;

    -- Test 3: auth.jwt()
    BEGIN
        EXECUTE 'SELECT auth.jwt()';
        RAISE NOTICE '✅ auth.jwt() is available';
    EXCEPTION
        WHEN undefined_function THEN
            RAISE NOTICE '❌ auth.jwt() is not available';
        WHEN OTHERS THEN
            RAISE NOTICE '❌ auth.jwt() error: %', SQLERRM;
    END;

    -- Test 4: current_user
    BEGIN
        EXECUTE 'SELECT current_user';
        RAISE NOTICE '✅ current_user is available';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ current_user error: %', SQLERRM;
    END;

    -- Test 5: session_user
    BEGIN
        EXECUTE 'SELECT session_user';
        RAISE NOTICE '✅ session_user is available';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ session_user error: %', SQLERRM;
    END;

    -- Test 6: Check available schemas
    RAISE NOTICE 'Available schemas:';
    FOR test_result IN
        SELECT schema_name FROM information_schema.schemata
        WHERE schema_name LIKE '%auth%'
        ORDER BY schema_name
    LOOP
        RAISE NOTICE '  - %', test_result;
    END LOOP;

    -- Test 7: Check auth schema functions if it exists
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
        RAISE NOTICE 'Functions in auth schema:';
        FOR test_result IN
            SELECT routine_name FROM information_schema.routines
            WHERE routine_schema = 'auth'
            ORDER BY routine_name
        LOOP
            RAISE NOTICE '  - %', test_result;
        END LOOP;
    END IF;

END $$;
