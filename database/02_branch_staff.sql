-- =====================================================
-- 02. BRANCH & STAFF MANAGEMENT
-- =====================================================
-- This file contains all tables related to branch management,
-- staff records, shifts, time tracking, and staff assignments.

-- =====================================================
-- BRANCHES TABLE
-- =====================================================
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'SAR',
    language VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT TRUE,
    is_main_branch BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- BRANCH HOURS TABLE
-- =====================================================
CREATE TABLE branch_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    is_24_hours BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(branch_id, day_of_week)
);

-- =====================================================
-- BRANCH SETTINGS TABLE
-- =====================================================
CREATE TABLE branch_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB,
    setting_type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(branch_id, setting_key)
);

-- =====================================================
-- STAFF TABLE
-- =====================================================
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    hire_date DATE NOT NULL,
    termination_date DATE,
    position VARCHAR(100),
    department VARCHAR(100),
    salary DECIMAL(10, 2),
    hourly_rate DECIMAL(8, 2),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    is_full_time BOOLEAN DEFAULT TRUE,
    max_hours_per_week INTEGER,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- STAFF BRANCHES (Many-to-Many)
-- =====================================================
CREATE TABLE staff_branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_primary BOOLEAN DEFAULT FALSE,
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(staff_id, branch_id, role_id)
);

-- =====================================================
-- SHIFTS TABLE
-- =====================================================
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration_minutes INTEGER DEFAULT 0,
    color VARCHAR(7), -- Hex color code
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- SHIFT SCHEDULES TABLE
-- =====================================================
CREATE TABLE shift_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    break_start_time TIMESTAMP WITH TIME ZONE,
    break_end_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- SHIFT LOGS TABLE
-- =====================================================
CREATE TABLE shift_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_schedule_id UUID NOT NULL REFERENCES shift_schedules(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    log_type VARCHAR(20) NOT NULL, -- clock_in, clock_out, break_start, break_end
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    device_info JSONB,
    location_info JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- STAFF ROLES TABLE
-- =====================================================
CREATE TABLE staff_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(staff_id, role_id, branch_id)
);

-- =====================================================
-- STAFF PERMISSIONS TABLE
-- =====================================================
CREATE TABLE staff_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(staff_id, permission_id, branch_id)
);

-- =====================================================
-- STAFF ATTENDANCE TABLE
-- =====================================================
CREATE TABLE staff_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clock_in_time TIMESTAMP WITH TIME ZONE,
    clock_out_time TIMESTAMP WITH TIME ZONE,
    total_hours DECIMAL(5, 2),
    break_duration_minutes INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'present', -- present, absent, late, half_day
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(staff_id, date)
);

-- =====================================================
-- STAFF LEAVE REQUESTS TABLE
-- =====================================================
CREATE TABLE staff_leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL, -- vacation, sick, personal, other
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    total_days DECIMAL(3, 1),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, cancelled
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- STAFF PERFORMANCE TABLE
-- =====================================================
CREATE TABLE staff_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    evaluation_date DATE NOT NULL,
    evaluator_id UUID NOT NULL REFERENCES users(id),
    performance_score DECIMAL(3, 2), -- 0.00 to 5.00
    attendance_score DECIMAL(3, 2),
    quality_score DECIMAL(3, 2),
    teamwork_score DECIMAL(3, 2),
    overall_score DECIMAL(3, 2),
    strengths TEXT,
    areas_for_improvement TEXT,
    goals TEXT,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- INDICES FOR PERFORMANCE
-- =====================================================

-- Branches table indices
CREATE INDEX idx_branches_active ON branches(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_branches_main ON branches(is_main_branch) WHERE deleted_at IS NULL;
CREATE INDEX idx_branches_city ON branches(city) WHERE deleted_at IS NULL;
CREATE INDEX idx_branches_country ON branches(country) WHERE deleted_at IS NULL;

-- Branch hours indices
CREATE INDEX idx_branch_hours_branch_id ON branch_hours(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_branch_hours_day ON branch_hours(day_of_week) WHERE deleted_at IS NULL;

-- Branch settings indices
CREATE INDEX idx_branch_settings_branch_id ON branch_settings(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_branch_settings_key ON branch_settings(setting_key) WHERE deleted_at IS NULL;

-- Staff table indices
CREATE INDEX idx_staff_user_id ON staff(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_employee_id ON staff(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_email ON staff(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_active ON staff(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_hire_date ON staff(hire_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_position ON staff(position) WHERE deleted_at IS NULL;

-- Staff branches indices
CREATE INDEX idx_staff_branches_staff_id ON staff_branches(staff_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_branches_branch_id ON staff_branches(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_branches_role_id ON staff_branches(role_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_branches_primary ON staff_branches(is_primary) WHERE deleted_at IS NULL;

-- Shifts indices
CREATE INDEX idx_shifts_branch_id ON shifts(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_shifts_active ON shifts(is_active) WHERE deleted_at IS NULL;

-- Shift schedules indices
CREATE INDEX idx_shift_schedules_staff_id ON shift_schedules(staff_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_shift_schedules_branch_id ON shift_schedules(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_shift_schedules_date ON shift_schedules(scheduled_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_shift_schedules_status ON shift_schedules(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_shift_schedules_start_time ON shift_schedules(start_time) WHERE deleted_at IS NULL;

-- Shift logs indices
CREATE INDEX idx_shift_logs_staff_id ON shift_logs(staff_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_shift_logs_branch_id ON shift_logs(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_shift_logs_timestamp ON shift_logs(timestamp) WHERE deleted_at IS NULL;
CREATE INDEX idx_shift_logs_type ON shift_logs(log_type) WHERE deleted_at IS NULL;

-- Staff roles indices
CREATE INDEX idx_staff_roles_staff_id ON staff_roles(staff_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_roles_branch_id ON staff_roles(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_roles_active ON staff_roles(is_active) WHERE deleted_at IS NULL;

-- Staff permissions indices
CREATE INDEX idx_staff_permissions_staff_id ON staff_permissions(staff_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_permissions_branch_id ON staff_permissions(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_permissions_expires ON staff_permissions(expires_at) WHERE deleted_at IS NULL;

-- Staff attendance indices
CREATE INDEX idx_staff_attendance_staff_id ON staff_attendance(staff_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_attendance_branch_id ON staff_attendance(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_attendance_date ON staff_attendance(date) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_attendance_status ON staff_attendance(status) WHERE deleted_at IS NULL;

-- Staff leave requests indices
CREATE INDEX idx_staff_leave_requests_staff_id ON staff_leave_requests(staff_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_leave_requests_status ON staff_leave_requests(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_leave_requests_date_range ON staff_leave_requests(start_date, end_date) WHERE deleted_at IS NULL;

-- Staff performance indices
CREATE INDEX idx_staff_performance_staff_id ON staff_performance(staff_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_performance_branch_id ON staff_performance(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_performance_date ON staff_performance(evaluation_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_performance_score ON staff_performance(overall_score) WHERE deleted_at IS NULL;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Create triggers for all tables
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branch_hours_updated_at BEFORE UPDATE ON branch_hours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branch_settings_updated_at BEFORE UPDATE ON branch_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_branches_updated_at BEFORE UPDATE ON staff_branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shift_schedules_updated_at BEFORE UPDATE ON shift_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shift_logs_updated_at BEFORE UPDATE ON shift_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_roles_updated_at BEFORE UPDATE ON staff_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_permissions_updated_at BEFORE UPDATE ON staff_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_attendance_updated_at BEFORE UPDATE ON staff_attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_leave_requests_updated_at BEFORE UPDATE ON staff_leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_performance_updated_at BEFORE UPDATE ON staff_performance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert sample branches
INSERT INTO branches (name, code, description, address, city, state, country, phone, email, is_main_branch) VALUES
('Main Branch', 'MB001', 'Primary restaurant location', '123 King Fahd Road, Riyadh', 'Riyadh', 'Riyadh Province', 'Saudi Arabia', '+966501234567', 'main@restaurant.com', TRUE),
('Downtown Branch', 'DT001', 'Downtown location', '456 Olaya Street, Riyadh', 'Riyadh', 'Riyadh Province', 'Saudi Arabia', '+966501234568', 'downtown@restaurant.com', FALSE),
('Mall Branch', 'ML001', 'Shopping mall location', '789 Mall Boulevard, Riyadh', 'Riyadh', 'Riyadh Province', 'Saudi Arabia', '+966501234569', 'mall@restaurant.com', FALSE);

-- Insert sample shifts
INSERT INTO shifts (branch_id, name, description, start_time, end_time, break_duration_minutes, color) VALUES
((SELECT id FROM branches WHERE code = 'MB001'), 'Morning Shift', 'Early morning shift', '06:00:00', '14:00:00', 30, '#4CAF50'),
((SELECT id FROM branches WHERE code = 'MB001'), 'Afternoon Shift', 'Afternoon shift', '14:00:00', '22:00:00', 30, '#2196F3'),
((SELECT id FROM branches WHERE code = 'MB001'), 'Night Shift', 'Late night shift', '22:00:00', '06:00:00', 30, '#9C27B0');

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE branches IS 'Restaurant branch locations and information';
COMMENT ON TABLE branch_hours IS 'Operating hours for each branch';
COMMENT ON TABLE branch_settings IS 'Branch-specific configuration settings';
COMMENT ON TABLE staff IS 'Employee records and information';
COMMENT ON TABLE staff_branches IS 'Many-to-many relationship between staff and branches with roles';
COMMENT ON TABLE shifts IS 'Work shift definitions for scheduling';
COMMENT ON TABLE shift_schedules IS 'Scheduled shifts for staff';
COMMENT ON TABLE shift_logs IS 'Clock in/out logs for staff attendance tracking';
COMMENT ON TABLE staff_roles IS 'Role assignments for staff at specific branches';
COMMENT ON TABLE staff_permissions IS 'Permission assignments for staff at specific branches';
COMMENT ON TABLE staff_attendance IS 'Daily attendance records for staff';
COMMENT ON TABLE staff_leave_requests IS 'Leave requests and approvals';
COMMENT ON TABLE staff_performance IS 'Performance evaluations and reviews';

COMMENT ON COLUMN branches.settings IS 'JSON object containing branch-specific settings';
COMMENT ON COLUMN staff.preferences IS 'JSON object containing staff preferences';
COMMENT ON COLUMN staff_branches.permissions IS 'JSON array of specific permissions for this staff-branch-role combination';
COMMENT ON COLUMN shift_logs.device_info IS 'JSON object containing device information for clock in/out';
COMMENT ON COLUMN shift_logs.location_info IS 'JSON object containing location information for clock in/out';
