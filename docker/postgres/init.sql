-- CapitalCoa Database Initialization Script
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Create a user for the application (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'capitalcoa_app') THEN
        CREATE ROLE capitalcoa_app WITH LOGIN PASSWORD 'capitalcoa_app_password';
    END IF;
END
$$;

-- Grant privileges to the application user
GRANT ALL PRIVILEGES ON DATABASE capitalcoa TO capitalcoa_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO capitalcoa_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO capitalcoa_app;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO capitalcoa_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO capitalcoa_app; 