-- =====================================================
-- 03. PRODUCTS & MENU MANAGEMENT
-- =====================================================
-- This file contains all tables related to product management,
-- categories, modifiers, menus, and product variations.

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100), -- Arabic name
    description TEXT,
    description_ar TEXT, -- Arabic description
    image_url TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color code
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE,
    name VARCHAR(200) NOT NULL,
    name_ar VARCHAR(200), -- Arabic name
    description TEXT,
    description_ar TEXT, -- Arabic description
    short_description VARCHAR(500),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    brand VARCHAR(100),
    barcode VARCHAR(100),
    weight DECIMAL(8, 3), -- in grams
    dimensions JSONB, -- {length, width, height}
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_available_online BOOLEAN DEFAULT TRUE,
    is_available_pos BOOLEAN DEFAULT TRUE,
    is_available_call_center BOOLEAN DEFAULT TRUE,
    preparation_time_minutes INTEGER DEFAULT 0,
    allergens JSONB DEFAULT '[]',
    nutritional_info JSONB,
    tags JSONB DEFAULT '[]',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PRODUCT VARIATIONS TABLE
-- =====================================================
CREATE TABLE product_variations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100), -- Arabic name
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    description TEXT,
    description_ar TEXT, -- Arabic description
    weight DECIMAL(8, 3),
    dimensions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PRODUCT IMAGES TABLE
-- =====================================================
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variation_id UUID REFERENCES product_variations(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text VARCHAR(200),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PRODUCT TAGS TABLE
-- =====================================================
CREATE TABLE product_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    name_ar VARCHAR(50), -- Arabic name
    color VARCHAR(7), -- Hex color code
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PRODUCT TAG ASSIGNMENTS (Many-to-Many)
-- =====================================================
CREATE TABLE product_tag_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES product_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(product_id, tag_id)
);

-- =====================================================
-- MODIFIERS TABLE
-- =====================================================
CREATE TABLE modifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100), -- Arabic name
    description TEXT,
    description_ar TEXT, -- Arabic description
    type VARCHAR(20) DEFAULT 'single', -- single, multiple, quantity
    min_selections INTEGER DEFAULT 0,
    max_selections INTEGER,
    is_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- MODIFIER OPTIONS TABLE
-- =====================================================
CREATE TABLE modifier_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    modifier_id UUID NOT NULL REFERENCES modifiers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100), -- Arabic name
    description TEXT,
    description_ar TEXT, -- Arabic description
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PRODUCT MODIFIERS (Many-to-Many)
-- =====================================================
CREATE TABLE product_modifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    modifier_id UUID NOT NULL REFERENCES modifiers(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(product_id, modifier_id)
);

-- =====================================================
-- COMBOS TABLE
-- =====================================================
CREATE TABLE combos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    name_ar VARCHAR(200), -- Arabic name
    description TEXT,
    description_ar TEXT, -- Arabic description
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- COMBO ITEMS TABLE
-- =====================================================
CREATE TABLE combo_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    combo_id UUID NOT NULL REFERENCES combos(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_variation_id UUID REFERENCES product_variations(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- MENUS TABLE
-- =====================================================
CREATE TABLE menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100), -- Arabic name
    description TEXT,
    description_ar TEXT, -- Arabic description
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- MENU GROUPS TABLE
-- =====================================================
CREATE TABLE menu_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100), -- Arabic name
    description TEXT,
    description_ar TEXT, -- Arabic description
    image_url TEXT,
    color VARCHAR(7), -- Hex color code
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- MENU ITEMS TABLE
-- =====================================================
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    menu_group_id UUID NOT NULL REFERENCES menu_groups(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_variation_id UUID REFERENCES product_variations(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(menu_id, product_id, product_variation_id)
);

-- =====================================================
-- RECIPES TABLE
-- =====================================================
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_variation_id UUID REFERENCES product_variations(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    name_ar VARCHAR(200), -- Arabic name
    description TEXT,
    description_ar TEXT, -- Arabic description
    instructions TEXT,
    instructions_ar TEXT, -- Arabic instructions
    preparation_time_minutes INTEGER DEFAULT 0,
    cooking_time_minutes INTEGER DEFAULT 0,
    servings INTEGER DEFAULT 1,
    difficulty_level VARCHAR(20) DEFAULT 'medium', -- easy, medium, hard
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- RECIPE ITEMS TABLE
-- =====================================================
CREATE TABLE recipe_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(100) NOT NULL,
    ingredient_name_ar VARCHAR(100), -- Arabic name
    quantity DECIMAL(10, 3) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- grams, kg, ml, liters, pieces, etc.
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PRODUCT ALLERGENS TABLE
-- =====================================================
CREATE TABLE product_allergens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    name_ar VARCHAR(100), -- Arabic name
    description TEXT,
    description_ar TEXT, -- Arabic description
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PRODUCT ALLERGEN ASSIGNMENTS (Many-to-Many)
-- =====================================================
CREATE TABLE product_allergen_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    allergen_id UUID NOT NULL REFERENCES product_allergens(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(product_id, allergen_id)
);

-- =====================================================
-- INDICES FOR PERFORMANCE
-- =====================================================

-- Categories table indices
CREATE INDEX idx_categories_active ON categories(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_featured ON categories(is_featured) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_parent ON categories(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_sort ON categories(sort_order) WHERE deleted_at IS NULL;

-- Products table indices
CREATE INDEX idx_products_sku ON products(sku) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_category ON products(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_active ON products(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_featured ON products(is_featured) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_online ON products(is_available_online) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_pos ON products(is_available_pos) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_call_center ON products(is_available_call_center) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_sort ON products(sort_order) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_barcode ON products(barcode) WHERE deleted_at IS NULL;

-- Product variations indices
CREATE INDEX idx_product_variations_product_id ON product_variations(product_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_product_variations_active ON product_variations(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_product_variations_default ON product_variations(is_default) WHERE deleted_at IS NULL;
CREATE INDEX idx_product_variations_sku ON product_variations(sku) WHERE deleted_at IS NULL;
CREATE INDEX idx_product_variations_barcode ON product_variations(barcode) WHERE deleted_at IS NULL;

-- Product images indices
CREATE INDEX idx_product_images_product_id ON product_images(product_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_product_images_variation_id ON product_images(variation_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_product_images_primary ON product_images(is_primary) WHERE deleted_at IS NULL;
CREATE INDEX idx_product_images_sort ON product_images(sort_order) WHERE deleted_at IS NULL;

-- Product tags indices
CREATE INDEX idx_product_tags_active ON product_tags(is_active) WHERE deleted_at IS NULL;

-- Product tag assignments indices
CREATE INDEX idx_product_tag_assignments_product_id ON product_tag_assignments(product_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_product_tag_assignments_tag_id ON product_tag_assignments(tag_id) WHERE deleted_at IS NULL;

-- Modifiers indices
CREATE INDEX idx_modifiers_active ON modifiers(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_modifiers_type ON modifiers(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_modifiers_sort ON modifiers(sort_order) WHERE deleted_at IS NULL;

-- Modifier options indices
CREATE INDEX idx_modifier_options_modifier_id ON modifier_options(modifier_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_modifier_options_active ON modifier_options(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_modifier_options_sort ON modifier_options(sort_order) WHERE deleted_at IS NULL;

-- Product modifiers indices
CREATE INDEX idx_product_modifiers_product_id ON product_modifiers(product_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_product_modifiers_modifier_id ON product_modifiers(modifier_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_product_modifiers_sort ON product_modifiers(sort_order) WHERE deleted_at IS NULL;

-- Combos indices
CREATE INDEX idx_combos_active ON combos(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_combos_featured ON combos(is_featured) WHERE deleted_at IS NULL;
CREATE INDEX idx_combos_sort ON combos(sort_order) WHERE deleted_at IS NULL;

-- Combo items indices
CREATE INDEX idx_combo_items_combo_id ON combo_items(combo_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_combo_items_product_id ON combo_items(product_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_combo_items_sort ON combo_items(sort_order) WHERE deleted_at IS NULL;

-- Menus indices
CREATE INDEX idx_menus_active ON menus(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_menus_default ON menus(is_default) WHERE deleted_at IS NULL;
CREATE INDEX idx_menus_sort ON menus(sort_order) WHERE deleted_at IS NULL;

-- Menu groups indices
CREATE INDEX idx_menu_groups_menu_id ON menu_groups(menu_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_menu_groups_active ON menu_groups(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_menu_groups_sort ON menu_groups(sort_order) WHERE deleted_at IS NULL;

-- Menu items indices
CREATE INDEX idx_menu_items_menu_id ON menu_items(menu_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_menu_items_group_id ON menu_items(menu_group_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_menu_items_product_id ON menu_items(product_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_menu_items_active ON menu_items(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_menu_items_sort ON menu_items(sort_order) WHERE deleted_at IS NULL;

-- Recipes indices
CREATE INDEX idx_recipes_product_id ON recipes(product_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_recipes_variation_id ON recipes(product_variation_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_recipes_active ON recipes(is_active) WHERE deleted_at IS NULL;

-- Recipe items indices
CREATE INDEX idx_recipe_items_recipe_id ON recipe_items(recipe_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_recipe_items_sort ON recipe_items(sort_order) WHERE deleted_at IS NULL;

-- Product allergens indices
CREATE INDEX idx_product_allergens_active ON product_allergens(is_active) WHERE deleted_at IS NULL;

-- Product allergen assignments indices
CREATE INDEX idx_product_allergen_assignments_product_id ON product_allergen_assignments(product_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_product_allergen_assignments_allergen_id ON product_allergen_assignments(allergen_id) WHERE deleted_at IS NULL;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Create triggers for all tables
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variations_updated_at BEFORE UPDATE ON product_variations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_images_updated_at BEFORE UPDATE ON product_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_tags_updated_at BEFORE UPDATE ON product_tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_tag_assignments_updated_at BEFORE UPDATE ON product_tag_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modifiers_updated_at BEFORE UPDATE ON modifiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modifier_options_updated_at BEFORE UPDATE ON modifier_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_modifiers_updated_at BEFORE UPDATE ON product_modifiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_combos_updated_at BEFORE UPDATE ON combos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_combo_items_updated_at BEFORE UPDATE ON combo_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_groups_updated_at BEFORE UPDATE ON menu_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipe_items_updated_at BEFORE UPDATE ON recipe_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_allergens_updated_at BEFORE UPDATE ON product_allergens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_allergen_assignments_updated_at BEFORE UPDATE ON product_allergen_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert sample categories
INSERT INTO categories (name, name_ar, description, color, sort_order) VALUES
('Burgers', 'برجر', 'Delicious burger selection', '#FF5722', 1),
('Pizza', 'بيتزا', 'Fresh pizza varieties', '#F44336', 2),
('Drinks', 'مشروبات', 'Refreshing beverages', '#2196F3', 3),
('Sides', 'أطباق جانبية', 'Perfect side dishes', '#4CAF50', 4),
('Desserts', 'حلويات', 'Sweet treats', '#9C27B0', 5);

-- Insert sample products
INSERT INTO products (sku, name, name_ar, description, category_id, is_active, preparation_time_minutes) VALUES
('BURG001', 'Beef Burger', 'برجر لحم', 'Premium beef patty with fresh vegetables', (SELECT id FROM categories WHERE name = 'Burgers'), TRUE, 15),
('BURG002', 'Chicken Burger', 'برجر دجاج', 'Grilled chicken breast with signature sauce', (SELECT id FROM categories WHERE name = 'Burgers'), TRUE, 12),
('PIZZ001', 'Margherita Pizza', 'بيتزا مارجريتا', 'Classic tomato sauce with mozzarella', (SELECT id FROM categories WHERE name = 'Pizza'), TRUE, 20),
('DRNK001', 'Coca Cola', 'كوكا كولا', 'Refreshing carbonated beverage', (SELECT id FROM categories WHERE name = 'Drinks'), TRUE, 2);

-- Insert sample modifiers
INSERT INTO modifiers (name, name_ar, description, type, is_required) VALUES
('Extra Toppings', 'إضافات إضافية', 'Additional toppings for your order', 'multiple', FALSE),
('Size', 'الحجم', 'Choose your preferred size', 'single', TRUE),
('Spice Level', 'مستوى التوابل', 'Select your preferred spice level', 'single', FALSE);

-- Insert sample modifier options
INSERT INTO modifier_options (modifier_id, name, name_ar, price_adjustment) VALUES
((SELECT id FROM modifiers WHERE name = 'Size'), 'Small', 'صغير', 0),
((SELECT id FROM modifiers WHERE name = 'Size'), 'Medium', 'متوسط', 5.00),
((SELECT id FROM modifiers WHERE name = 'Size'), 'Large', 'كبير', 10.00),
((SELECT id FROM modifiers WHERE name = 'Spice Level'), 'Mild', 'خفيف', 0),
((SELECT id FROM modifiers WHERE name = 'Spice Level'), 'Medium', 'متوسط', 0),
((SELECT id FROM modifiers WHERE name = 'Spice Level'), 'Hot', 'حار', 2.00);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE categories IS 'Product categories for organization';
COMMENT ON TABLE products IS 'Main product records with all product information';
COMMENT ON TABLE product_variations IS 'Product variations (size, color, etc.)';
COMMENT ON TABLE product_images IS 'Product images and media';
COMMENT ON TABLE product_tags IS 'Tags for product categorization and filtering';
COMMENT ON TABLE product_tag_assignments IS 'Many-to-many relationship between products and tags';
COMMENT ON TABLE modifiers IS 'Product modifiers (toppings, extras, etc.)';
COMMENT ON TABLE modifier_options IS 'Specific options for modifiers';
COMMENT ON TABLE product_modifiers IS 'Many-to-many relationship between products and modifiers';
COMMENT ON TABLE combos IS 'Product combinations and meal deals';
COMMENT ON TABLE combo_items IS 'Items within combos';
COMMENT ON TABLE menus IS 'Menu definitions';
COMMENT ON TABLE menu_groups IS 'Menu grouping and organization';
COMMENT ON TABLE menu_items IS 'Menu item assignments';
COMMENT ON TABLE recipes IS 'Product recipes and preparation instructions';
COMMENT ON TABLE recipe_items IS 'Recipe ingredients and quantities';
COMMENT ON TABLE product_allergens IS 'Allergen definitions';
COMMENT ON TABLE product_allergen_assignments IS 'Many-to-many relationship between products and allergens';

COMMENT ON COLUMN products.allergens IS 'JSON array of allergen IDs';
COMMENT ON COLUMN products.nutritional_info IS 'JSON object containing nutritional information';
COMMENT ON COLUMN products.tags IS 'JSON array of tag IDs';
COMMENT ON COLUMN products.dimensions IS 'JSON object containing product dimensions';
COMMENT ON COLUMN product_variations.dimensions IS 'JSON object containing variation dimensions';
COMMENT ON COLUMN recipes.difficulty_level IS 'Recipe difficulty: easy, medium, hard';
