-- =====================================================
-- ORDERS & CUSTOMER MANAGEMENT
-- =====================================================

-- Extend the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- CUSTOMER MANAGEMENT
-- =====================================================

-- Customer profiles
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_number VARCHAR(100) UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) UNIQUE,
    phone_verified BOOLEAN DEFAULT false,
    date_of_birth DATE,
    gender VARCHAR(10), -- male, female, other
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Asia/Riyadh',
    is_active BOOLEAN DEFAULT true,
    is_blacklisted BOOLEAN DEFAULT false,
    blacklist_reason TEXT,
    blacklisted_at TIMESTAMP,
    blacklisted_by UUID REFERENCES users(id),
    notes TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Customer addresses
CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    address_type VARCHAR(50) DEFAULT 'home', -- home, work, other
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Saudi Arabia',
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Customer tags
CREATE TABLE customer_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    name_ar VARCHAR(100),
    color VARCHAR(7), -- hex color
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Customer tag assignments
CREATE TABLE customer_tag_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES customer_tags(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_customer_tag UNIQUE(customer_id, tag_id)
);

-- Customer notes
CREATE TABLE customer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    note_type VARCHAR(50) DEFAULT 'general', -- general, order, complaint, preference
    title VARCHAR(255),
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Customer loyalty points
CREATE TABLE customer_loyalty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    points_balance INT DEFAULT 0,
    total_earned INT DEFAULT 0,
    total_redeemed INT DEFAULT 0,
    tier_level VARCHAR(50) DEFAULT 'bronze', -- bronze, silver, gold, platinum
    tier_expiry_date DATE,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_customer_loyalty UNIQUE(customer_id)
);

-- Loyalty transactions
CREATE TABLE loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- earn, redeem, expire, adjust
    points_amount INT NOT NULL,
    order_id UUID, -- Will reference orders table
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ORDER MANAGEMENT
-- =====================================================

-- Main orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(100) UNIQUE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    order_type VARCHAR(50) NOT NULL, -- pos, call_center, online, delivery, pickup, dine_in
    order_source VARCHAR(50) NOT NULL, -- pos, call_center, website, mobile_app, third_party
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, preparing, ready, delivered, cancelled, refunded
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    subtotal DECIMAL(12, 2) DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    service_charge DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) DEFAULT 0,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    change_amount DECIMAL(10, 2) DEFAULT 0,
    customer_notes TEXT,
    kitchen_notes TEXT,
    receipt_notes TEXT,
    estimated_preparation_time INT, -- in minutes
    actual_preparation_time INT, -- in minutes
    estimated_delivery_time TIMESTAMP,
    actual_delivery_time TIMESTAMP,
    scheduled_time TIMESTAMP,
    created_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    confirmed_by UUID REFERENCES users(id),
    confirmed_at TIMESTAMP,
    cancelled_by UUID REFERENCES users(id),
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Order items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variation_id UUID REFERENCES product_variations(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_price DECIMAL(10, 2) GENERATED ALWAYS AS (total_price - discount_amount) STORED,
    notes TEXT,
    is_prepared BOOLEAN DEFAULT false,
    prepared_at TIMESTAMP,
    prepared_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Order item modifiers
CREATE TABLE order_item_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    modifier_id UUID NOT NULL REFERENCES modifiers(id) ON DELETE CASCADE,
    modifier_option_id UUID NOT NULL REFERENCES modifier_options(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Order status history
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    previous_status VARCHAR(50),
    notes TEXT,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DELIVERY MANAGEMENT
-- =====================================================

-- Delivery zones
CREATE TABLE delivery_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
    estimated_delivery_time INT, -- in minutes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Zone coordinates (for mapping)
CREATE TABLE zone_coordinates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID NOT NULL REFERENCES delivery_zones(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    sequence_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Drivers
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    driver_number VARCHAR(100) UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) UNIQUE,
    vehicle_type VARCHAR(50), -- car, motorcycle, bicycle
    vehicle_number VARCHAR(50),
    license_number VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    is_available BOOLEAN DEFAULT true,
    current_location_lat DECIMAL(10, 8),
    current_location_lng DECIMAL(11, 8),
    last_location_update TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Driver assignments
CREATE TABLE driver_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'assigned', -- assigned, picked_up, delivered, cancelled
    pickup_time TIMESTAMP,
    delivery_time TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Delivery tracking
CREATE TABLE delivery_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    tracking_status VARCHAR(50) NOT NULL, -- assigned, picked_up, in_transit, delivered, failed
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_accuracy DECIMAL(5, 2),
    estimated_arrival TIMESTAMP,
    actual_arrival TIMESTAMP,
    notes TEXT,
    tracked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- PAYMENT MANAGEMENT
-- =====================================================

-- Payment methods
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    code VARCHAR(50) UNIQUE NOT NULL, -- cash, card, mobile_payment, etc.
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Order payments
CREATE TABLE order_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SAR',
    transaction_id VARCHAR(255),
    transaction_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
    payment_gateway VARCHAR(100),
    gateway_response JSONB,
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Payment refunds
CREATE TABLE payment_refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_payment_id UUID NOT NULL REFERENCES order_payments(id) ON DELETE CASCADE,
    refund_amount DECIMAL(12, 2) NOT NULL,
    refund_reason VARCHAR(255),
    refund_method VARCHAR(50),
    transaction_id VARCHAR(255),
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- DISCOUNT & PROMOTION MANAGEMENT
-- =====================================================

-- Discount types
CREATE TABLE discount_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    code VARCHAR(50) UNIQUE,
    description TEXT,
    discount_type VARCHAR(50) NOT NULL, -- percentage, fixed_amount, buy_x_get_y
    discount_value DECIMAL(10, 2) NOT NULL,
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
    maximum_discount_amount DECIMAL(10, 2),
    applies_to VARCHAR(50) DEFAULT 'order', -- order, item, category
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    usage_limit INT,
    usage_count INT DEFAULT 0,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Discount usage tracking
CREATE TABLE discount_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discount_type_id UUID NOT NULL REFERENCES discount_types(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDICES FOR PERFORMANCE
-- =====================================================

-- Customer indices
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_active ON customers(is_active) WHERE is_active = true;
CREATE INDEX idx_customers_blacklisted ON customers(is_blacklisted) WHERE is_blacklisted = true;

-- Customer addresses indices
CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX idx_customer_addresses_default ON customer_addresses(is_default) WHERE is_default = true;

-- Customer tags indices
CREATE INDEX idx_customer_tag_assignments_customer_id ON customer_tag_assignments(customer_id);
CREATE INDEX idx_customer_tag_assignments_tag_id ON customer_tag_assignments(tag_id);

-- Customer notes indices
CREATE INDEX idx_customer_notes_customer_id ON customer_notes(customer_id);
CREATE INDEX idx_customer_notes_type ON customer_notes(note_type);

-- Customer loyalty indices
CREATE INDEX idx_customer_loyalty_customer_id ON customer_loyalty(customer_id);
CREATE INDEX idx_customer_loyalty_tier ON customer_loyalty(tier_level);

-- Loyalty transactions indices
CREATE INDEX idx_loyalty_transactions_customer_id ON loyalty_transactions(customer_id);
CREATE INDEX idx_loyalty_transactions_type ON loyalty_transactions(transaction_type);

-- Orders indices
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_branch_id ON orders(branch_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_type ON orders(order_type);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_scheduled_time ON orders(scheduled_time);

-- Order items indices
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Order item modifiers indices
CREATE INDEX idx_order_item_modifiers_order_item_id ON order_item_modifiers(order_item_id);
CREATE INDEX idx_order_item_modifiers_modifier_id ON order_item_modifiers(modifier_id);

-- Order status history indices
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_status ON order_status_history(status);
CREATE INDEX idx_order_status_history_changed_at ON order_status_history(changed_at);

-- Delivery zones indices
CREATE INDEX idx_delivery_zones_active ON delivery_zones(is_active) WHERE is_active = true;

-- Zone coordinates indices
CREATE INDEX idx_zone_coordinates_zone_id ON zone_coordinates(zone_id);

-- Drivers indices
CREATE INDEX idx_drivers_phone ON drivers(phone);
CREATE INDEX idx_drivers_active ON drivers(is_active) WHERE is_active = true;
CREATE INDEX idx_drivers_available ON drivers(is_available) WHERE is_available = true;

-- Driver assignments indices
CREATE INDEX idx_driver_assignments_driver_id ON driver_assignments(driver_id);
CREATE INDEX idx_driver_assignments_order_id ON driver_assignments(order_id);
CREATE INDEX idx_driver_assignments_status ON driver_assignments(status);

-- Delivery tracking indices
CREATE INDEX idx_delivery_tracking_order_id ON delivery_tracking(order_id);
CREATE INDEX idx_delivery_tracking_driver_id ON delivery_tracking(driver_id);
CREATE INDEX idx_delivery_tracking_status ON delivery_tracking(tracking_status);

-- Payment methods indices
CREATE INDEX idx_payment_methods_code ON payment_methods(code);
CREATE INDEX idx_payment_methods_active ON payment_methods(is_active) WHERE is_active = true;

-- Order payments indices
CREATE INDEX idx_order_payments_order_id ON order_payments(order_id);
CREATE INDEX idx_order_payments_method_id ON order_payments(payment_method_id);
CREATE INDEX idx_order_payments_status ON order_payments(transaction_status);

-- Payment refunds indices
CREATE INDEX idx_payment_refunds_order_payment_id ON payment_refunds(order_payment_id);

-- Discount types indices
CREATE INDEX idx_discount_types_code ON discount_types(code);
CREATE INDEX idx_discount_types_active ON discount_types(is_active) WHERE is_active = true;
CREATE INDEX idx_discount_types_valid_until ON discount_types(valid_until);

-- Discount usage indices
CREATE INDEX idx_discount_usage_discount_type_id ON discount_usage(discount_type_id);
CREATE INDEX idx_discount_usage_order_id ON discount_usage(order_id);
CREATE INDEX idx_discount_usage_customer_id ON discount_usage(customer_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON customer_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_tags_updated_at BEFORE UPDATE ON customer_tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_tag_assignments_updated_at BEFORE UPDATE ON customer_tag_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_notes_updated_at BEFORE UPDATE ON customer_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_loyalty_updated_at BEFORE UPDATE ON customer_loyalty FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_item_modifiers_updated_at BEFORE UPDATE ON order_item_modifiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_zones_updated_at BEFORE UPDATE ON delivery_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_zone_coordinates_updated_at BEFORE UPDATE ON zone_coordinates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_driver_assignments_updated_at BEFORE UPDATE ON driver_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_tracking_updated_at BEFORE UPDATE ON delivery_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_payments_updated_at BEFORE UPDATE ON order_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_refunds_updated_at BEFORE UPDATE ON payment_refunds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discount_types_updated_at BEFORE UPDATE ON discount_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Sample customer tags
INSERT INTO customer_tags (name, name_ar, color, description) VALUES
('VIP', 'عميل مميز', '#FFD700', 'Very Important Customer'),
('Staff', 'موظف', '#4CAF50', 'Staff member'),
('Regular', 'عميل منتظم', '#2196F3', 'Regular customer'),
('New', 'عميل جديد', '#FF9800', 'New customer');

-- Sample payment methods
INSERT INTO payment_methods (name, name_ar, code, description) VALUES
('Cash', 'نقداً', 'cash', 'Cash payment'),
('Card', 'بطاقة ائتمان', 'card', 'Credit/Debit card'),
('Mobile Payment', 'دفع إلكتروني', 'mobile_payment', 'Mobile payment apps'),
('Online', 'دفع إلكتروني', 'online', 'Online payment');

-- Sample delivery zones
INSERT INTO delivery_zones (name, name_ar, delivery_fee, minimum_order_amount, estimated_delivery_time) VALUES
('Central Riyadh', 'وسط الرياض', 15.00, 50.00, 30),
('North Riyadh', 'شمال الرياض', 20.00, 75.00, 45),
('South Riyadh', 'جنوب الرياض', 25.00, 100.00, 60);

-- Sample customers
INSERT INTO customers (customer_number, first_name, last_name, email, phone) VALUES
('CUST-001', 'Ahmed', 'Al-Rashid', 'ahmed@example.com', '+966501234567'),
('CUST-002', 'Fatima', 'Al-Zahra', 'fatima@example.com', '+966507654321'),
('CUST-003', 'Mohammed', 'Al-Saud', 'mohammed@example.com', '+966509876543');
