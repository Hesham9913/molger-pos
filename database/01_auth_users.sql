-- =====================================================
-- 01. AUTHENTICATION & USER MANAGEMENT
-- =====================================================
-- This file contains all tables related to user authentication,
-- roles, permissions, API tokens, and user management.

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ROLES TABLE
-- =====================================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PERMISSIONS TABLE
-- =====================================================
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    resource VARCHAR(50) NOT NULL, -- e.g., 'orders', 'products', 'customers'
    action VARCHAR(50) NOT NULL,   -- e.g., 'create', 'read', 'update', 'delete'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- USER ROLES (Many-to-Many)
-- =====================================================
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, role_id)
);

-- =====================================================
-- USER PERMISSIONS (Many-to-Many)
-- =====================================================
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, permission_id)
);

-- =====================================================
-- API TOKENS TABLE
-- =====================================================
CREATE TABLE api_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    token_salt VARCHAR(255) NOT NULL,
    permissions JSONB DEFAULT '[]',
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PASSWORD RESETS TABLE
-- =====================================================
CREATE TABLE password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    token_salt VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- LOGIN SESSIONS TABLE
-- =====================================================
CREATE TABLE login_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token_hash VARCHAR(255) NOT NULL UNIQUE,
    session_token_salt VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    location_info JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- USER ACTIVITY LOGS TABLE
-- =====================================================
CREATE TABLE user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES login_sessions(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDICES FOR PERFORMANCE
-- =====================================================

-- Users table indices
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_last_login ON users(last_login_at) WHERE deleted_at IS NULL;

-- User roles indices
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_roles_expires ON user_roles(expires_at) WHERE deleted_at IS NULL;

-- User permissions indices
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_permissions_permission_id ON user_permissions(permission_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_permissions_expires ON user_permissions(expires_at) WHERE deleted_at IS NULL;

-- API tokens indices
CREATE INDEX idx_api_tokens_user_id ON api_tokens(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_api_tokens_expires ON api_tokens(expires_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_api_tokens_last_used ON api_tokens(last_used_at) WHERE deleted_at IS NULL;

-- Password resets indices
CREATE INDEX idx_password_resets_email ON password_resets(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_password_resets_expires ON password_resets(expires_at) WHERE deleted_at IS NULL;

-- Login sessions indices
CREATE INDEX idx_login_sessions_user_id ON login_sessions(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_login_sessions_active ON login_sessions(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_login_sessions_expires ON login_sessions(expires_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_login_sessions_last_activity ON login_sessions(last_activity_at) WHERE deleted_at IS NULL;

-- Activity logs indices
CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX idx_user_activity_logs_action ON user_activity_logs(action);
CREATE INDEX idx_user_activity_logs_resource ON user_activity_logs(resource_type, resource_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_permissions_updated_at BEFORE UPDATE ON user_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_tokens_updated_at BEFORE UPDATE ON api_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_password_resets_updated_at BEFORE UPDATE ON password_resets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_login_sessions_updated_at BEFORE UPDATE ON login_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert default roles
INSERT INTO roles (name, display_name, description, is_system_role) VALUES
('super_admin', 'Super Administrator', 'Full system access with all permissions', TRUE),
('admin', 'Administrator', 'Branch and system management access', TRUE),
('manager', 'Manager', 'Branch management and staff oversight', TRUE),
('cashier', 'Cashier', 'POS operations and order management', TRUE),
('call_center', 'Call Center Agent', 'Call center order management', TRUE),
('kitchen', 'Kitchen Staff', 'Kitchen order management and preparation', TRUE),
('driver', 'Delivery Driver', 'Delivery order management', TRUE);

-- Insert default permissions
INSERT INTO permissions (name, display_name, description, resource, action) VALUES
-- User management
('users.create', 'Create Users', 'Create new user accounts', 'users', 'create'),
('users.read', 'View Users', 'View user profiles and information', 'users', 'read'),
('users.update', 'Update Users', 'Update user information', 'users', 'update'),
('users.delete', 'Delete Users', 'Delete user accounts', 'users', 'delete'),

-- Order management
('orders.create', 'Create Orders', 'Create new orders', 'orders', 'create'),
('orders.read', 'View Orders', 'View order details', 'orders', 'read'),
('orders.update', 'Update Orders', 'Update order information', 'orders', 'update'),
('orders.delete', 'Delete Orders', 'Delete orders', 'orders', 'delete'),

-- Product management
('products.create', 'Create Products', 'Create new products', 'products', 'create'),
('products.read', 'View Products', 'View product information', 'products', 'read'),
('products.update', 'Update Products', 'Update product information', 'products', 'update'),
('products.delete', 'Delete Products', 'Delete products', 'products', 'delete'),

-- Customer management
('customers.create', 'Create Customers', 'Create new customer profiles', 'customers', 'create'),
('customers.read', 'View Customers', 'View customer information', 'customers', 'read'),
('customers.update', 'Update Customers', 'Update customer information', 'customers', 'update'),
('customers.delete', 'Delete Customers', 'Delete customer profiles', 'customers', 'delete'),

-- Reports and analytics
('reports.view', 'View Reports', 'Access to all reports and analytics', 'reports', 'read'),
('reports.export', 'Export Reports', 'Export report data', 'reports', 'export'),

-- System settings
('settings.manage', 'Manage Settings', 'Manage system settings and configuration', 'settings', 'update');

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE roles IS 'User roles for access control and permissions';
COMMENT ON TABLE permissions IS 'Granular permissions for fine-grained access control';
COMMENT ON TABLE users IS 'User accounts with authentication and profile information';
COMMENT ON TABLE user_roles IS 'Many-to-many relationship between users and roles';
COMMENT ON TABLE user_permissions IS 'Many-to-many relationship between users and permissions';
COMMENT ON TABLE api_tokens IS 'API authentication tokens for external integrations';
COMMENT ON TABLE password_resets IS 'Password reset requests and tokens';
COMMENT ON TABLE login_sessions IS 'Active user login sessions for security tracking';
COMMENT ON TABLE user_activity_logs IS 'Audit trail of user actions and activities';

COMMENT ON COLUMN users.password_hash IS 'BCrypt hashed password';
COMMENT ON COLUMN users.password_salt IS 'Salt used for password hashing';
COMMENT ON COLUMN users.preferences IS 'JSON object containing user preferences';
COMMENT ON COLUMN api_tokens.token_hash IS 'Hashed API token for security';
COMMENT ON COLUMN password_resets.token_hash IS 'Hashed reset token for security';
COMMENT ON COLUMN login_sessions.session_token_hash IS 'Hashed session token for security';
