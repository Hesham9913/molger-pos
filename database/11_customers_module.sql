-- =====================================================
-- CUSTOMERS MODULE - Complete Implementation
-- =====================================================

-- Delivery Zones Table
CREATE TABLE delivery_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    delivery_fee DECIMAL(10,2) DEFAULT 0.00,
    minimum_order_amount DECIMAL(10,2) DEFAULT 0.00,
    estimated_delivery_time INTEGER DEFAULT 30, -- in minutes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Customer Tags Table
CREATE TABLE customer_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#1976d2', -- hex color code
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Enhanced Customers Table (extending existing if needed)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE, -- Enforced unique constraint
    email VARCHAR(255) NULL,
    notes TEXT NULL,
    
    -- Business Logic Fields
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    total_discounts DECIMAL(12,2) DEFAULT 0.00,
    account_balance DECIMAL(12,2) DEFAULT 0.00,
    last_order_at TIMESTAMP WITH TIME ZONE NULL,
    
    -- Favorite tracking
    favorite_product_id UUID NULL,
    favorite_branch_id UUID NULL,
    
    -- Account Management
    house_account_enabled BOOLEAN DEFAULT false,
    is_blacklisted BOOLEAN DEFAULT false,
    blacklist_reason TEXT NULL,
    blacklisted_at TIMESTAMP WITH TIME ZONE NULL,
    blacklisted_by UUID NULL,
    
    -- Customer Preferences
    preferred_language VARCHAR(5) DEFAULT 'en',
    marketing_consent BOOLEAN DEFAULT true,
    sms_consent BOOLEAN DEFAULT true,
    email_consent BOOLEAN DEFAULT true,
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by UUID NULL,
    updated_by UUID NULL,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_customers_favorite_product FOREIGN KEY (favorite_product_id) REFERENCES products(id),
    CONSTRAINT fk_customers_favorite_branch FOREIGN KEY (favorite_branch_id) REFERENCES branches(id),
    CONSTRAINT fk_customers_blacklisted_by FOREIGN KEY (blacklisted_by) REFERENCES users(id),
    CONSTRAINT fk_customers_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_customers_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Customer Addresses Table
CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    delivery_zone_id UUID NOT NULL,
    
    -- Address Details
    name VARCHAR(100) NULL, -- e.g., "Home", "Office", "Work"
    detailed_address TEXT NOT NULL,
    additional_info TEXT NULL, -- Floor, apartment, special instructions
    
    -- Location Data
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    
    -- Address Metadata
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by UUID NULL,
    updated_by UUID NULL,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_customer_addresses_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_customer_addresses_delivery_zone FOREIGN KEY (delivery_zone_id) REFERENCES delivery_zones(id),
    CONSTRAINT fk_customer_addresses_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_customer_addresses_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Customer Tag Assignments (Many-to-Many)
CREATE TABLE customer_tag_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    assigned_by UUID NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_customer_tag_assignments_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_customer_tag_assignments_tag FOREIGN KEY (tag_id) REFERENCES customer_tags(id) ON DELETE CASCADE,
    CONSTRAINT fk_customer_tag_assignments_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id),
    
    -- Unique constraint to prevent duplicate assignments
    CONSTRAINT uk_customer_tag_assignments UNIQUE (customer_id, tag_id)
);

-- Customer Activity Log (for audit trail)
CREATE TABLE customer_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'blacklisted', 'address_added', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'customer', 'address', 'tag'
    entity_id UUID NULL, -- ID of the affected entity
    old_values JSONB NULL,
    new_values JSONB NULL,
    notes TEXT NULL,
    performed_by UUID NULL,
    ip_address INET NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_customer_activity_logs_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_customer_activity_logs_performed_by FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Customers table indexes
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_total_orders ON customers(total_orders);
CREATE INDEX idx_customers_last_order_at ON customers(last_order_at);
CREATE INDEX idx_customers_account_balance ON customers(account_balance);
CREATE INDEX idx_customers_is_blacklisted ON customers(is_blacklisted);
CREATE INDEX idx_customers_house_account_enabled ON customers(house_account_enabled);
CREATE INDEX idx_customers_created_at ON customers(created_at);
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);

-- Customer addresses indexes
CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX idx_customer_addresses_delivery_zone_id ON customer_addresses(delivery_zone_id);
CREATE INDEX idx_customer_addresses_is_default ON customer_addresses(is_default);
CREATE INDEX idx_customer_addresses_deleted_at ON customer_addresses(deleted_at);

-- Customer tags indexes
CREATE INDEX idx_customer_tags_name ON customer_tags(name);
CREATE INDEX idx_customer_tags_is_active ON customer_tags(is_active);

-- Customer tag assignments indexes
CREATE INDEX idx_customer_tag_assignments_customer_id ON customer_tag_assignments(customer_id);
CREATE INDEX idx_customer_tag_assignments_tag_id ON customer_tag_assignments(tag_id);

-- Delivery zones indexes
CREATE INDEX idx_delivery_zones_name ON delivery_zones(name);
CREATE INDEX idx_delivery_zones_is_active ON delivery_zones(is_active);

-- Activity logs indexes
CREATE INDEX idx_customer_activity_logs_customer_id ON customer_activity_logs(customer_id);
CREATE INDEX idx_customer_activity_logs_action ON customer_activity_logs(action);
CREATE INDEX idx_customer_activity_logs_created_at ON customer_activity_logs(created_at);

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- =====================================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON customer_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_tags_updated_at BEFORE UPDATE ON customer_tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_tag_assignments_updated_at BEFORE UPDATE ON customer_tag_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_zones_updated_at BEFORE UPDATE ON delivery_zones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample delivery zones
INSERT INTO delivery_zones (name, description, delivery_fee, minimum_order_amount, estimated_delivery_time) VALUES
('Zone 1 - Downtown', 'Downtown and city center area', 5.00, 15.00, 25),
('Zone 2 - Suburbs North', 'Northern suburban areas', 7.50, 20.00, 35),
('Zone 3 - Suburbs South', 'Southern suburban areas', 7.50, 20.00, 35),
('Zone 4 - Industrial', 'Industrial and business districts', 10.00, 25.00, 45),
('Zone 5 - Outskirts', 'Far suburban and rural areas', 15.00, 30.00, 60);

-- Insert sample customer tags
INSERT INTO customer_tags (name, color, description) VALUES
('VIP', '#FFD700', 'Very Important Person - Premium customers'),
('Regular', '#4CAF50', 'Regular customers with consistent orders'),
('New Customer', '#2196F3', 'Recently registered customers'),
('High Value', '#9C27B0', 'Customers with high order values'),
('Frequent Buyer', '#FF5722', 'Customers who order frequently'),
('Corporate', '#795548', 'Corporate or business customers'),
('Special Dietary', '#607D8B', 'Customers with special dietary requirements');

-- Insert sample customers
INSERT INTO customers (name, phone, email, notes, total_orders, total_spent, account_balance, house_account_enabled) VALUES
('#7734', '+20 106 550 0679', NULL, NULL, 1, 575.00, 0.00, false),
('Mohamed Sakka', '+20 347 8728', NULL, NULL, 1, 450.00, 0.00, false),
('Ehab Ebrahem', '+112 841 4126', NULL, NULL, 1, 320.00, 0.00, false),
('#7731', '+20 444 3006', NULL, NULL, 1, 280.00, 0.00, false),
('#7730', '+222 693 7247', NULL, NULL, 1, 195.00, 0.00, false),
('Amr Hammad', '+100 181 9650', NULL, NULL, 1, 380.00, 0.00, false),
('#7724', '+228 909 0723', NULL, NULL, 1, 220.00, 0.00, false),
('#7722', '+114 420 2566', NULL, NULL, 1, 165.00, 0.00, false);

-- Update last_order_at for sample customers
UPDATE customers SET last_order_at = CURRENT_TIMESTAMP - INTERVAL '2 hours' WHERE phone = '+20 106 550 0679';
UPDATE customers SET last_order_at = CURRENT_TIMESTAMP - INTERVAL '4 hours' WHERE phone = '+20 347 8728';
UPDATE customers SET last_order_at = CURRENT_TIMESTAMP - INTERVAL '6 hours' WHERE phone = '+112 841 4126';
UPDATE customers SET last_order_at = CURRENT_TIMESTAMP - INTERVAL '8 hours' WHERE phone = '+20 444 3006';
UPDATE customers SET last_order_at = CURRENT_TIMESTAMP - INTERVAL '10 hours' WHERE phone = '+222 693 7247';
UPDATE customers SET last_order_at = CURRENT_TIMESTAMP - INTERVAL '12 hours' WHERE phone = '+100 181 9650';
UPDATE customers SET last_order_at = CURRENT_TIMESTAMP - INTERVAL '14 hours' WHERE phone = '+228 909 0723';
UPDATE customers SET last_order_at = CURRENT_TIMESTAMP - INTERVAL '16 hours' WHERE phone = '+114 420 2566';

COMMENT ON TABLE customers IS 'Customer master data with business logic fields';
COMMENT ON TABLE customer_addresses IS 'Customer delivery addresses linked to delivery zones';
COMMENT ON TABLE delivery_zones IS 'Delivery zones with pricing and timing information';
COMMENT ON TABLE customer_tags IS 'Tags for categorizing customers';
COMMENT ON TABLE customer_tag_assignments IS 'Many-to-many relationship between customers and tags';
COMMENT ON TABLE customer_activity_logs IS 'Audit trail for all customer-related activities';
