-- =====================================================
-- DEVICES & IOT MANAGEMENT
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
-- DEVICE MANAGEMENT
-- =====================================================

-- Device types and categories
CREATE TABLE device_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    category VARCHAR(100) NOT NULL, -- pos, printer, scanner, display, sensor, etc.
    description TEXT,
    specifications JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Device inventory
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_type_id UUID NOT NULL REFERENCES device_types(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    device_name VARCHAR(255) NOT NULL,
    device_code VARCHAR(100) UNIQUE,
    serial_number VARCHAR(255),
    model_number VARCHAR(255),
    manufacturer VARCHAR(255),
    mac_address VARCHAR(17),
    ip_address INET,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, maintenance, retired
    last_online TIMESTAMP,
    last_offline TIMESTAMP,
    firmware_version VARCHAR(100),
    software_version VARCHAR(100),
    configuration JSONB,
    notes TEXT,
    purchased_date DATE,
    warranty_expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Device assignments
CREATE TABLE device_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unassigned_at TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Device maintenance logs
CREATE TABLE device_maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL, -- preventive, repair, upgrade, cleaning
    description TEXT NOT NULL,
    performed_by UUID REFERENCES users(id),
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cost DECIMAL(10, 2),
    next_maintenance_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- POS TERMINALS
-- =====================================================

-- POS terminal configurations
CREATE TABLE pos_terminals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    terminal_id VARCHAR(100) UNIQUE NOT NULL,
    terminal_type VARCHAR(50) NOT NULL, -- counter, mobile, kiosk, tablet
    is_active BOOLEAN DEFAULT true,
    is_online BOOLEAN DEFAULT false,
    last_transaction_at TIMESTAMP,
    daily_transaction_count INT DEFAULT 0,
    daily_transaction_amount DECIMAL(12, 2) DEFAULT 0,
    configuration JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- POS terminal sessions
CREATE TABLE pos_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    terminal_id UUID NOT NULL REFERENCES pos_terminals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP,
    opening_amount DECIMAL(10, 2),
    closing_amount DECIMAL(10, 2),
    total_sales DECIMAL(12, 2) DEFAULT 0,
    total_refunds DECIMAL(12, 2) DEFAULT 0,
    transaction_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active', -- active, closed, suspended
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- PRINTERS & RECEIPTS
-- =====================================================

-- Printer configurations
CREATE TABLE printers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    printer_name VARCHAR(255) NOT NULL,
    printer_type VARCHAR(50) NOT NULL, -- receipt, kitchen, label, barcode
    connection_type VARCHAR(50) NOT NULL, -- usb, network, bluetooth, wifi
    ip_address INET,
    port INT,
    model VARCHAR(255),
    paper_size VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    is_online BOOLEAN DEFAULT false,
    last_print_at TIMESTAMP,
    print_count INT DEFAULT 0,
    configuration JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Receipt templates
CREATE TABLE receipt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    template_type VARCHAR(50) NOT NULL, -- customer, kitchen, delivery, etc.
    content TEXT NOT NULL,
    content_ar TEXT,
    variables JSONB,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Print jobs
CREATE TABLE print_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    printer_id UUID NOT NULL REFERENCES printers(id) ON DELETE CASCADE,
    template_id UUID REFERENCES receipt_templates(id) ON DELETE SET NULL,
    job_type VARCHAR(50) NOT NULL, -- receipt, label, report
    content TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, printing, completed, failed
    priority INT DEFAULT 0,
    print_count INT DEFAULT 1,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    printed_at TIMESTAMP,
    error_message TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- SCANNERS & BARCODES
-- =====================================================

-- Scanner configurations
CREATE TABLE scanners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    scanner_name VARCHAR(255) NOT NULL,
    scanner_type VARCHAR(50) NOT NULL, -- barcode, qr, rfid, camera
    connection_type VARCHAR(50) NOT NULL, -- usb, bluetooth, wifi
    supported_formats JSONB,
    is_active BOOLEAN DEFAULT true,
    is_online BOOLEAN DEFAULT false,
    last_scan_at TIMESTAMP,
    scan_count INT DEFAULT 0,
    configuration JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Barcode configurations
CREATE TABLE barcode_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    barcode_type VARCHAR(50) NOT NULL, -- code128, code39, ean13, qr, etc.
    prefix VARCHAR(10),
    suffix VARCHAR(10),
    length INT,
    check_digit BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- DISPLAYS & KIOSKS
-- =====================================================

-- Display configurations
CREATE TABLE displays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    display_name VARCHAR(255) NOT NULL,
    display_type VARCHAR(50) NOT NULL, -- customer, kitchen, menu, advertising
    screen_size VARCHAR(50),
    resolution VARCHAR(50),
    orientation VARCHAR(20) DEFAULT 'landscape', -- portrait, landscape
    is_active BOOLEAN DEFAULT true,
    is_online BOOLEAN DEFAULT false,
    current_content_id UUID,
    configuration JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Display content
CREATE TABLE display_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- menu, advertising, information
    content_data JSONB,
    media_files JSONB,
    schedule_start TIMESTAMP,
    schedule_end TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- IOT SENSORS & MONITORING
-- =====================================================

-- IoT sensor types
CREATE TABLE sensor_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    sensor_category VARCHAR(100) NOT NULL, -- temperature, humidity, motion, weight, etc.
    unit_of_measurement VARCHAR(50),
    min_value DECIMAL(10, 4),
    max_value DECIMAL(10, 4),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- IoT sensors
CREATE TABLE sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    sensor_type_id UUID NOT NULL REFERENCES sensor_types(id) ON DELETE CASCADE,
    sensor_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_online BOOLEAN DEFAULT false,
    last_reading_at TIMESTAMP,
    current_value DECIMAL(10, 4),
    alert_threshold_min DECIMAL(10, 4),
    alert_threshold_max DECIMAL(10, 4),
    configuration JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Sensor readings
CREATE TABLE sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
    reading_value DECIMAL(10, 4) NOT NULL,
    reading_unit VARCHAR(50),
    reading_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_alert BOOLEAN DEFAULT false,
    alert_type VARCHAR(50), -- high, low, offline
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- NETWORK & CONNECTIVITY
-- =====================================================

-- Network configurations
CREATE TABLE network_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    network_type VARCHAR(50) NOT NULL, -- wifi, ethernet, cellular, bluetooth
    ssid VARCHAR(255),
    ip_address INET,
    mac_address VARCHAR(17),
    subnet_mask VARCHAR(15),
    gateway VARCHAR(15),
    dns_servers JSONB,
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Network connectivity logs
CREATE TABLE network_connectivity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    network_config_id UUID REFERENCES network_configurations(id) ON DELETE SET NULL,
    connection_status VARCHAR(50) NOT NULL, -- connected, disconnected, failed
    ip_address INET,
    signal_strength INT, -- for wifi
    connection_speed DECIMAL(10, 2), -- in Mbps
    error_message TEXT,
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    disconnected_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DEVICE ALERTS & NOTIFICATIONS
-- =====================================================

-- Device alerts
CREATE TABLE device_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- offline, error, maintenance, low_supply
    alert_level VARCHAR(20) DEFAULT 'info', -- info, warning, error, critical
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Device alert rules
CREATE TABLE device_alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_type_id UUID REFERENCES device_types(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    condition_type VARCHAR(50) NOT NULL, -- threshold, status, time
    condition_value JSONB,
    notification_channels JSONB, -- email, sms, push, in_app
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- DEVICE ANALYTICS
-- =====================================================

-- Device usage analytics
CREATE TABLE device_usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    usage_hours DECIMAL(5, 2) DEFAULT 0,
    transaction_count INT DEFAULT 0,
    total_amount DECIMAL(12, 2) DEFAULT 0,
    error_count INT DEFAULT 0,
    downtime_minutes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_device_date_analytics UNIQUE(device_id, date)
);

-- Device performance metrics
CREATE TABLE device_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15, 4),
    metric_unit VARCHAR(50),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDICES FOR PERFORMANCE
-- =====================================================

-- Device types indices
CREATE INDEX idx_device_types_category ON device_types(category);
CREATE INDEX idx_device_types_active ON device_types(is_active) WHERE is_active = true;

-- Devices indices
CREATE INDEX idx_devices_type_id ON devices(device_type_id);
CREATE INDEX idx_devices_branch_id ON devices(branch_id);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_online ON devices(last_online);
CREATE INDEX idx_devices_code ON devices(device_code);

-- Device assignments indices
CREATE INDEX idx_device_assignments_device_id ON device_assignments(device_id);
CREATE INDEX idx_device_assignments_user_id ON device_assignments(user_id);
CREATE INDEX idx_device_assignments_branch_id ON device_assignments(branch_id);

-- Device maintenance indices
CREATE INDEX idx_device_maintenance_logs_device_id ON device_maintenance_logs(device_id);
CREATE INDEX idx_device_maintenance_logs_type ON device_maintenance_logs(maintenance_type);
CREATE INDEX idx_device_maintenance_logs_date ON device_maintenance_logs(performed_at);

-- POS terminals indices
CREATE INDEX idx_pos_terminals_device_id ON pos_terminals(device_id);
CREATE INDEX idx_pos_terminals_terminal_id ON pos_terminals(terminal_id);
CREATE INDEX idx_pos_terminals_active ON pos_terminals(is_active) WHERE is_active = true;
CREATE INDEX idx_pos_terminals_online ON pos_terminals(is_online) WHERE is_online = true;

-- POS sessions indices
CREATE INDEX idx_pos_sessions_terminal_id ON pos_sessions(terminal_id);
CREATE INDEX idx_pos_sessions_user_id ON pos_sessions(user_id);
CREATE INDEX idx_pos_sessions_status ON pos_sessions(status);
CREATE INDEX idx_pos_sessions_start ON pos_sessions(session_start);

-- Printers indices
CREATE INDEX idx_printers_device_id ON printers(device_id);
CREATE INDEX idx_printers_type ON printers(printer_type);
CREATE INDEX idx_printers_active ON printers(is_active) WHERE is_active = true;
CREATE INDEX idx_printers_online ON printers(is_online) WHERE is_online = true;

-- Receipt templates indices
CREATE INDEX idx_receipt_templates_type ON receipt_templates(template_type);
CREATE INDEX idx_receipt_templates_active ON receipt_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_receipt_templates_default ON receipt_templates(is_default) WHERE is_default = true;

-- Print jobs indices
CREATE INDEX idx_print_jobs_printer_id ON print_jobs(printer_id);
CREATE INDEX idx_print_jobs_status ON print_jobs(status);
CREATE INDEX idx_print_jobs_created_at ON print_jobs(created_at);

-- Scanners indices
CREATE INDEX idx_scanners_device_id ON scanners(device_id);
CREATE INDEX idx_scanners_type ON scanners(scanner_type);
CREATE INDEX idx_scanners_active ON scanners(is_active) WHERE is_active = true;

-- Barcode configurations indices
CREATE INDEX idx_barcode_configurations_type ON barcode_configurations(barcode_type);
CREATE INDEX idx_barcode_configurations_active ON barcode_configurations(is_active) WHERE is_active = true;

-- Displays indices
CREATE INDEX idx_displays_device_id ON displays(device_id);
CREATE INDEX idx_displays_type ON displays(display_type);
CREATE INDEX idx_displays_active ON displays(is_active) WHERE is_active = true;

-- Display content indices
CREATE INDEX idx_display_content_type ON display_content(content_type);
CREATE INDEX idx_display_content_active ON display_content(is_active) WHERE is_active = true;
CREATE INDEX idx_display_content_schedule ON display_content(schedule_start, schedule_end);

-- Sensor types indices
CREATE INDEX idx_sensor_types_category ON sensor_types(sensor_category);
CREATE INDEX idx_sensor_types_active ON sensor_types(is_active) WHERE is_active = true;

-- Sensors indices
CREATE INDEX idx_sensors_device_id ON sensors(device_id);
CREATE INDEX idx_sensors_type_id ON sensors(sensor_type_id);
CREATE INDEX idx_sensors_active ON sensors(is_active) WHERE is_active = true;
CREATE INDEX idx_sensors_online ON sensors(is_online) WHERE is_online = true;

-- Sensor readings indices
CREATE INDEX idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX idx_sensor_readings_timestamp ON sensor_readings(reading_timestamp);
CREATE INDEX idx_sensor_readings_alert ON sensor_readings(is_alert) WHERE is_alert = true;

-- Network configurations indices
CREATE INDEX idx_network_configurations_device_id ON network_configurations(device_id);
CREATE INDEX idx_network_configurations_type ON network_configurations(network_type);
CREATE INDEX idx_network_configurations_active ON network_configurations(is_active) WHERE is_active = true;

-- Network connectivity logs indices
CREATE INDEX idx_network_connectivity_logs_device_id ON network_connectivity_logs(device_id);
CREATE INDEX idx_network_connectivity_logs_status ON network_connectivity_logs(connection_status);
CREATE INDEX idx_network_connectivity_logs_connected_at ON network_connectivity_logs(connected_at);

-- Device alerts indices
CREATE INDEX idx_device_alerts_device_id ON device_alerts(device_id);
CREATE INDEX idx_device_alerts_type ON device_alerts(alert_type);
CREATE INDEX idx_device_alerts_level ON device_alerts(alert_level);
CREATE INDEX idx_device_alerts_resolved ON device_alerts(is_resolved) WHERE is_resolved = false;

-- Device alert rules indices
CREATE INDEX idx_device_alert_rules_device_type_id ON device_alert_rules(device_type_id);
CREATE INDEX idx_device_alert_rules_type ON device_alert_rules(alert_type);
CREATE INDEX idx_device_alert_rules_active ON device_alert_rules(is_active) WHERE is_active = true;

-- Device analytics indices
CREATE INDEX idx_device_usage_analytics_device_id ON device_usage_analytics(device_id);
CREATE INDEX idx_device_usage_analytics_date ON device_usage_analytics(date);

-- Device performance metrics indices
CREATE INDEX idx_device_performance_metrics_device_id ON device_performance_metrics(device_id);
CREATE INDEX idx_device_performance_metrics_name ON device_performance_metrics(metric_name);
CREATE INDEX idx_device_performance_metrics_recorded_at ON device_performance_metrics(recorded_at);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_device_types_updated_at BEFORE UPDATE ON device_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_device_assignments_updated_at BEFORE UPDATE ON device_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_device_maintenance_logs_updated_at BEFORE UPDATE ON device_maintenance_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pos_terminals_updated_at BEFORE UPDATE ON pos_terminals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pos_sessions_updated_at BEFORE UPDATE ON pos_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_printers_updated_at BEFORE UPDATE ON printers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_receipt_templates_updated_at BEFORE UPDATE ON receipt_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_print_jobs_updated_at BEFORE UPDATE ON print_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scanners_updated_at BEFORE UPDATE ON scanners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_barcode_configurations_updated_at BEFORE UPDATE ON barcode_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_displays_updated_at BEFORE UPDATE ON displays FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_display_content_updated_at BEFORE UPDATE ON display_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sensor_types_updated_at BEFORE UPDATE ON sensor_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sensors_updated_at BEFORE UPDATE ON sensors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_network_configurations_updated_at BEFORE UPDATE ON network_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_network_connectivity_logs_updated_at BEFORE UPDATE ON network_connectivity_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_device_alerts_updated_at BEFORE UPDATE ON device_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_device_alert_rules_updated_at BEFORE UPDATE ON device_alert_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_device_usage_analytics_updated_at BEFORE UPDATE ON device_usage_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Sample device types
INSERT INTO device_types (name, name_ar, category, description) VALUES
('POS Terminal', 'جهاز نقاط البيع', 'pos', 'Point of Sale terminal for processing transactions'),
('Receipt Printer', 'طابعة الإيصالات', 'printer', 'Thermal printer for printing receipts'),
('Barcode Scanner', 'قارئ الباركود', 'scanner', 'Barcode scanner for product scanning'),
('Customer Display', 'شاشة العميل', 'display', 'Display screen for customer information'),
('Kitchen Display', 'شاشة المطبخ', 'display', 'Display screen for kitchen orders'),
('Temperature Sensor', 'مستشعر درجة الحرارة', 'sensor', 'Temperature monitoring sensor'),
('Weight Scale', 'ميزان إلكتروني', 'sensor', 'Digital weight scale for products');

-- Sample sensor types
INSERT INTO sensor_types (name, name_ar, sensor_category, unit_of_measurement, min_value, max_value) VALUES
('Temperature', 'درجة الحرارة', 'temperature', '°C', -40.0, 100.0),
('Humidity', 'الرطوبة', 'humidity', '%', 0.0, 100.0),
('Weight', 'الوزن', 'weight', 'kg', 0.0, 1000.0),
('Motion', 'الحركة', 'motion', 'boolean', 0.0, 1.0),
('Light', 'الإضاءة', 'light', 'lux', 0.0, 10000.0);

-- Sample receipt templates
INSERT INTO receipt_templates (name, name_ar, template_type, content, is_default) VALUES
('Standard Receipt', 'الإيصال القياسي', 'customer', 'Thank you for your order!', true),
('Kitchen Receipt', 'إيصال المطبخ', 'kitchen', 'Kitchen order details', false),
('Delivery Receipt', 'إيصال التوصيل', 'delivery', 'Delivery order information', false);

-- Sample barcode configurations
INSERT INTO barcode_configurations (name, barcode_type, prefix, length, check_digit) VALUES
('Product Barcode', 'code128', 'P', 12, true),
('Inventory Barcode', 'code39', 'I', 10, false),
('QR Code', 'qr', 'Q', 20, false);
