-- =====================================================
-- PRICING & INVENTORY MANAGEMENT
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
-- PRICING MANAGEMENT
-- =====================================================

-- Base pricing for products
CREATE TABLE product_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variation_id UUID REFERENCES product_variations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    price_type VARCHAR(50) NOT NULL DEFAULT 'regular', -- regular, sale, wholesale, bulk
    base_price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    wholesale_price DECIMAL(10, 2),
    bulk_price DECIMAL(10, 2),
    bulk_quantity INT,
    currency VARCHAR(3) DEFAULT 'SAR',
    effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    effective_until TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_product_variation_branch_price UNIQUE(product_id, variation_id, branch_id, price_type)
);

-- Price history for tracking changes
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variation_id UUID REFERENCES product_variations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    old_price DECIMAL(10, 2),
    new_price DECIMAL(10, 2),
    price_type VARCHAR(50) NOT NULL,
    change_reason VARCHAR(255),
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tax configurations
CREATE TABLE tax_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    description TEXT,
    description_ar TEXT,
    tax_rate DECIMAL(5, 2) NOT NULL,
    tax_type VARCHAR(50) NOT NULL DEFAULT 'percentage', -- percentage, fixed
    is_compound BOOLEAN DEFAULT false,
    applies_to VARCHAR(50) DEFAULT 'all', -- all, food, beverages, services
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Product tax assignments
CREATE TABLE product_tax_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tax_id UUID NOT NULL REFERENCES tax_configurations(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_product_tax UNIQUE(product_id, tax_id)
);

-- =====================================================
-- INVENTORY MANAGEMENT
-- =====================================================

-- Inventory items (ingredients, raw materials)
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    category VARCHAR(100),
    unit VARCHAR(50) NOT NULL, -- kg, liters, pieces, etc.
    unit_cost DECIMAL(10, 2),
    supplier_id UUID, -- Will reference suppliers table
    barcode VARCHAR(100),
    min_stock_level DECIMAL(10, 3) DEFAULT 0,
    max_stock_level DECIMAL(10, 3),
    reorder_point DECIMAL(10, 3),
    is_active BOOLEAN DEFAULT true,
    is_tracked BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Stock levels per branch
CREATE TABLE stock_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    current_stock DECIMAL(10, 3) DEFAULT 0,
    reserved_stock DECIMAL(10, 3) DEFAULT 0,
    available_stock DECIMAL(10, 3) GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_item_branch_stock UNIQUE(inventory_item_id, branch_id)
);

-- Stock movements (in/out transactions)
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL, -- in, out, adjustment, transfer, wastage
    quantity DECIMAL(10, 3) NOT NULL,
    unit_cost DECIMAL(10, 2),
    total_cost DECIMAL(10, 2),
    reference_type VARCHAR(50), -- order, purchase, adjustment, transfer
    reference_id UUID,
    notes TEXT,
    performed_by UUID REFERENCES users(id),
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Stock transfers between branches
CREATE TABLE stock_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_number VARCHAR(100) UNIQUE,
    from_branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    to_branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, in_transit, completed, cancelled
    transfer_date TIMESTAMP,
    expected_delivery_date TIMESTAMP,
    actual_delivery_date TIMESTAMP,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Stock transfer items
CREATE TABLE stock_transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity DECIMAL(10, 3) NOT NULL,
    unit_cost DECIMAL(10, 2),
    total_cost DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Stock wastage tracking
CREATE TABLE stock_wastage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    wastage_type VARCHAR(50) NOT NULL, -- expired, damaged, spillage, theft
    quantity DECIMAL(10, 3) NOT NULL,
    unit_cost DECIMAL(10, 2),
    total_cost DECIMAL(10, 2),
    reason TEXT,
    reported_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    wastage_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Stock alerts and notifications
CREATE TABLE stock_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- low_stock, out_of_stock, overstock
    threshold_value DECIMAL(10, 3),
    current_value DECIMAL(10, 3),
    is_active BOOLEAN DEFAULT true,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- RECIPE & INGREDIENT MANAGEMENT
-- =====================================================

-- Recipe ingredients (links products to inventory items)
CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity DECIMAL(10, 3) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    cost_per_unit DECIMAL(10, 2),
    total_cost DECIMAL(10, 2),
    is_optional BOOLEAN DEFAULT false,
    notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Recipe costs tracking
CREATE TABLE recipe_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    total_cost DECIMAL(10, 2),
    cost_per_serving DECIMAL(10, 2),
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- SUPPLIER MANAGEMENT
-- =====================================================

-- Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    tax_number VARCHAR(100),
    payment_terms VARCHAR(255),
    credit_limit DECIMAL(12, 2),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Supplier items (what each supplier provides)
CREATE TABLE supplier_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    supplier_sku VARCHAR(100),
    unit_price DECIMAL(10, 2),
    minimum_order_quantity DECIMAL(10, 3),
    lead_time_days INT,
    is_preferred BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_supplier_item UNIQUE(supplier_id, inventory_item_id)
);

-- =====================================================
-- PURCHASE ORDERS
-- =====================================================

-- Purchase orders
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(100) UNIQUE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'draft', -- draft, sent, confirmed, received, cancelled
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_delivery_date TIMESTAMP,
    actual_delivery_date TIMESTAMP,
    subtotal DECIMAL(12, 2) DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Purchase order items
CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    supplier_item_id UUID REFERENCES supplier_items(id) ON DELETE SET NULL,
    quantity DECIMAL(10, 3) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    received_quantity DECIMAL(10, 3) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- INDICES FOR PERFORMANCE
-- =====================================================

-- Product prices indices
CREATE INDEX idx_product_prices_product_id ON product_prices(product_id);
CREATE INDEX idx_product_prices_branch_id ON product_prices(branch_id);
CREATE INDEX idx_product_prices_variation_id ON product_prices(variation_id);
CREATE INDEX idx_product_prices_active ON product_prices(is_active) WHERE is_active = true;

-- Price history indices
CREATE INDEX idx_price_history_product_id ON price_history(product_id);
CREATE INDEX idx_price_history_changed_at ON price_history(changed_at);

-- Tax indices
CREATE INDEX idx_product_tax_assignments_product_id ON product_tax_assignments(product_id);
CREATE INDEX idx_product_tax_assignments_tax_id ON product_tax_assignments(tax_id);

-- Inventory indices
CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_items_active ON inventory_items(is_active) WHERE is_active = true;

-- Stock levels indices
CREATE INDEX idx_stock_levels_item_branch ON stock_levels(inventory_item_id, branch_id);
CREATE INDEX idx_stock_levels_available ON stock_levels(available_stock) WHERE available_stock > 0;

-- Stock movements indices
CREATE INDEX idx_stock_movements_item_id ON stock_movements(inventory_item_id);
CREATE INDEX idx_stock_movements_branch_id ON stock_movements(branch_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_date ON stock_movements(movement_date);

-- Stock transfers indices
CREATE INDEX idx_stock_transfers_from_branch ON stock_transfers(from_branch_id);
CREATE INDEX idx_stock_transfers_to_branch ON stock_transfers(to_branch_id);
CREATE INDEX idx_stock_transfers_status ON stock_transfers(status);

-- Stock wastage indices
CREATE INDEX idx_stock_wastage_item_id ON stock_wastage(inventory_item_id);
CREATE INDEX idx_stock_wastage_branch_id ON stock_wastage(branch_id);
CREATE INDEX idx_stock_wastage_date ON stock_wastage(wastage_date);

-- Stock alerts indices
CREATE INDEX idx_stock_alerts_item_branch ON stock_alerts(inventory_item_id, branch_id);
CREATE INDEX idx_stock_alerts_active ON stock_alerts(is_active) WHERE is_active = true;

-- Recipe ingredients indices
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_item_id ON recipe_ingredients(inventory_item_id);

-- Suppliers indices
CREATE INDEX idx_suppliers_active ON suppliers(is_active) WHERE is_active = true;

-- Supplier items indices
CREATE INDEX idx_supplier_items_supplier_id ON supplier_items(supplier_id);
CREATE INDEX idx_supplier_items_item_id ON supplier_items(inventory_item_id);

-- Purchase orders indices
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_branch_id ON purchase_orders(branch_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_date ON purchase_orders(order_date);

-- Purchase order items indices
CREATE INDEX idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_purchase_order_items_item_id ON purchase_order_items(inventory_item_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_product_prices_updated_at BEFORE UPDATE ON product_prices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_history_updated_at BEFORE UPDATE ON price_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_configurations_updated_at BEFORE UPDATE ON tax_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_tax_assignments_updated_at BEFORE UPDATE ON product_tax_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_levels_updated_at BEFORE UPDATE ON stock_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_movements_updated_at BEFORE UPDATE ON stock_movements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_transfers_updated_at BEFORE UPDATE ON stock_transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_transfer_items_updated_at BEFORE UPDATE ON stock_transfer_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_wastage_updated_at BEFORE UPDATE ON stock_wastage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_alerts_updated_at BEFORE UPDATE ON stock_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipe_ingredients_updated_at BEFORE UPDATE ON recipe_ingredients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipe_costs_updated_at BEFORE UPDATE ON recipe_costs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supplier_items_updated_at BEFORE UPDATE ON supplier_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_order_items_updated_at BEFORE UPDATE ON purchase_order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Sample tax configurations
INSERT INTO tax_configurations (name, name_ar, description, tax_rate, tax_type, applies_to) VALUES
('VAT', 'ضريبة القيمة المضافة', 'Value Added Tax', 15.00, 'percentage', 'all'),
('Service Tax', 'ضريبة الخدمة', 'Service tax for dine-in orders', 5.00, 'percentage', 'services');

-- Sample inventory items
INSERT INTO inventory_items (sku, name, name_ar, unit, unit_cost, min_stock_level) VALUES
('INV-001', 'Chicken Breast', 'صدر دجاج', 'kg', 25.00, 10.0),
('INV-002', 'Rice', 'أرز', 'kg', 8.00, 20.0),
('INV-003', 'Tomatoes', 'طماطم', 'kg', 5.00, 15.0),
('INV-004', 'Cooking Oil', 'زيت طبخ', 'liter', 12.00, 5.0);

-- Sample suppliers
INSERT INTO suppliers (name, name_ar, contact_person, email, phone) VALUES
('Al-Rajhi Foods', 'الأغذية الراجحي', 'Ahmed Al-Rajhi', 'ahmed@alrajhi.com', '+966501234567'),
('Fresh Market', 'السوق الطازج', 'Mohammed Ali', 'mohammed@freshmarket.com', '+966507654321');
