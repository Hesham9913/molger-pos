-- =====================================================
-- SYSTEM SETTINGS & CONFIGURATION
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
-- SYSTEM SETTINGS
-- =====================================================

-- Global system settings
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    description_ar TEXT,
    category VARCHAR(100) DEFAULT 'general',
    is_public BOOLEAN DEFAULT false,
    is_required BOOLEAN DEFAULT false,
    validation_rules JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Branch-specific settings
CREATE TABLE branch_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_branch_setting UNIQUE(branch_id, setting_key)
);

-- User preferences
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preference_key VARCHAR(255) NOT NULL,
    preference_value TEXT,
    preference_type VARCHAR(50) DEFAULT 'string',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_user_preference UNIQUE(user_id, preference_key)
);

-- =====================================================
-- REFERENCE DATA
-- =====================================================

-- Countries
CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    code VARCHAR(3) UNIQUE NOT NULL, -- ISO 3166-1 alpha-3
    code_2 VARCHAR(2), -- ISO 3166-1 alpha-2
    phone_code VARCHAR(10),
    currency_code VARCHAR(3),
    currency_symbol VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- States/Provinces
CREATE TABLE states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    code VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Cities
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id UUID REFERENCES states(id) ON DELETE CASCADE,
    country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Currencies
CREATE TABLE currencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    code VARCHAR(3) UNIQUE NOT NULL, -- ISO 4217
    symbol VARCHAR(10),
    decimal_places INT DEFAULT 2,
    exchange_rate DECIMAL(15, 6) DEFAULT 1.000000,
    is_base_currency BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Languages
CREATE TABLE languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_native VARCHAR(255),
    code VARCHAR(10) UNIQUE NOT NULL, -- ISO 639-1
    code_3 VARCHAR(3), -- ISO 639-2
    direction VARCHAR(3) DEFAULT 'ltr', -- ltr, rtl
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Time zones
CREATE TABLE timezones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    offset VARCHAR(10) NOT NULL, -- +03:00, -05:00, etc.
    offset_minutes INT NOT NULL, -- 180, -300, etc.
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Units of measurement
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    symbol VARCHAR(20),
    unit_type VARCHAR(50), -- weight, volume, length, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- BUSINESS CONFIGURATION
-- =====================================================

-- Business hours templates
CREATE TABLE business_hours_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Business hours
CREATE TABLE business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES business_hours_templates(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL, -- 0=Sunday, 1=Monday, etc.
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT false,
    is_24_hours BOOLEAN DEFAULT false,
    break_start_time TIME,
    break_end_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Tax configurations
CREATE TABLE tax_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    tax_rate DECIMAL(5, 2) NOT NULL,
    tax_type VARCHAR(50) DEFAULT 'percentage', -- percentage, fixed
    applies_to VARCHAR(50) DEFAULT 'all', -- all, food, beverages, services
    is_compound BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Payment gateway configurations
CREATE TABLE payment_gateways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    gateway_code VARCHAR(50) UNIQUE NOT NULL, -- stripe, paypal, mada, etc.
    is_active BOOLEAN DEFAULT true,
    is_test_mode BOOLEAN DEFAULT true,
    config JSONB,
    supported_currencies JSONB,
    supported_countries JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- INTEGRATION SETTINGS
-- =====================================================

-- Third-party integrations
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    integration_type VARCHAR(50) NOT NULL, -- payment, delivery, accounting, etc.
    provider VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    config JSONB,
    webhook_url VARCHAR(500),
    api_key VARCHAR(255),
    api_secret VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Webhook configurations
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    events JSONB NOT NULL, -- array of event types
    is_active BOOLEAN DEFAULT true,
    secret_key VARCHAR(255),
    retry_count INT DEFAULT 3,
    timeout_seconds INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- API configurations
CREATE TABLE api_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    api_secret VARCHAR(255),
    permissions JSONB,
    rate_limit_per_minute INT DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- NOTIFICATION SETTINGS
-- =====================================================

-- Email service configurations
CREATE TABLE email_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(100) NOT NULL, -- smtp, sendgrid, mailgun, etc.
    host VARCHAR(255),
    port INT,
    username VARCHAR(255),
    password VARCHAR(255),
    encryption VARCHAR(20), -- tls, ssl, none
    from_email VARCHAR(255),
    from_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- SMS service configurations
CREATE TABLE sms_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(100) NOT NULL, -- twilio, nexmo, etc.
    account_sid VARCHAR(255),
    auth_token VARCHAR(255),
    from_number VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Push notification configurations
CREATE TABLE push_notification_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(100) NOT NULL, -- firebase, onesignal, etc.
    server_key VARCHAR(500),
    app_id VARCHAR(255),
    app_secret VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- SECURITY SETTINGS
-- =====================================================

-- Security policies
CREATE TABLE security_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_name VARCHAR(255) NOT NULL,
    policy_type VARCHAR(50) NOT NULL, -- password, session, ip_whitelist, etc.
    policy_value JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- IP whitelist/blacklist
CREATE TABLE ip_access_control (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address INET NOT NULL,
    ip_range VARCHAR(50),
    access_type VARCHAR(20) NOT NULL, -- whitelist, blacklist
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- BACKUP & MAINTENANCE
-- =====================================================

-- Backup configurations
CREATE TABLE backup_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    backup_type VARCHAR(50) NOT NULL, -- database, files, full
    storage_provider VARCHAR(50), -- local, s3, gcs, etc.
    storage_config JSONB,
    schedule_cron VARCHAR(100),
    retention_days INT DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    last_backup_at TIMESTAMP,
    next_backup_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Maintenance schedules
CREATE TABLE maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    maintenance_type VARCHAR(50) NOT NULL, -- system, database, backup, etc.
    schedule_cron VARCHAR(100),
    duration_minutes INT,
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- INDICES FOR PERFORMANCE
-- =====================================================

-- System settings indices
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE INDEX idx_system_settings_public ON system_settings(is_public) WHERE is_public = true;

-- Branch settings indices
CREATE INDEX idx_branch_settings_branch_id ON branch_settings(branch_id);
CREATE INDEX idx_branch_settings_key ON branch_settings(setting_key);
CREATE INDEX idx_branch_settings_active ON branch_settings(is_active) WHERE is_active = true;

-- User preferences indices
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_key ON user_preferences(preference_key);

-- Reference data indices
CREATE INDEX idx_countries_code ON countries(code);
CREATE INDEX idx_countries_active ON countries(is_active) WHERE is_active = true;
CREATE INDEX idx_states_country_id ON states(country_id);
CREATE INDEX idx_cities_country_id ON cities(country_id);
CREATE INDEX idx_cities_state_id ON cities(state_id);
CREATE INDEX idx_currencies_code ON currencies(code);
CREATE INDEX idx_currencies_base ON currencies(is_base_currency) WHERE is_base_currency = true;
CREATE INDEX idx_languages_code ON languages(code);
CREATE INDEX idx_languages_default ON languages(is_default) WHERE is_default = true;
CREATE INDEX idx_timezones_default ON timezones(is_default) WHERE is_default = true;

-- Business configuration indices
CREATE INDEX idx_business_hours_template_id ON business_hours(template_id);
CREATE INDEX idx_business_hours_branch_id ON business_hours(branch_id);
CREATE INDEX idx_business_hours_day ON business_hours(day_of_week);

-- Tax settings indices
CREATE INDEX idx_tax_settings_active ON tax_settings(is_active) WHERE is_active = true;
CREATE INDEX idx_tax_settings_type ON tax_settings(tax_type);

-- Payment gateways indices
CREATE INDEX idx_payment_gateways_code ON payment_gateways(gateway_code);
CREATE INDEX idx_payment_gateways_active ON payment_gateways(is_active) WHERE is_active = true;

-- Integrations indices
CREATE INDEX idx_integrations_type ON integrations(integration_type);
CREATE INDEX idx_integrations_active ON integrations(is_active) WHERE is_active = true;

-- Webhooks indices
CREATE INDEX idx_webhooks_active ON webhooks(is_active) WHERE is_active = true;

-- API configurations indices
CREATE INDEX idx_api_configurations_key ON api_configurations(api_key);
CREATE INDEX idx_api_configurations_active ON api_configurations(is_active) WHERE is_active = true;

-- Email configurations indices
CREATE INDEX idx_email_configurations_provider ON email_configurations(provider);
CREATE INDEX idx_email_configurations_active ON email_configurations(is_active) WHERE is_active = true;
CREATE INDEX idx_email_configurations_default ON email_configurations(is_default) WHERE is_default = true;

-- SMS configurations indices
CREATE INDEX idx_sms_configurations_provider ON sms_configurations(provider);
CREATE INDEX idx_sms_configurations_active ON sms_configurations(is_active) WHERE is_active = true;

-- Push notification configurations indices
CREATE INDEX idx_push_notification_configurations_provider ON push_notification_configurations(provider);
CREATE INDEX idx_push_notification_configurations_active ON push_notification_configurations(is_active) WHERE is_active = true;

-- Security policies indices
CREATE INDEX idx_security_policies_type ON security_policies(policy_type);
CREATE INDEX idx_security_policies_active ON security_policies(is_active) WHERE is_active = true;

-- IP access control indices
CREATE INDEX idx_ip_access_control_ip ON ip_access_control(ip_address);
CREATE INDEX idx_ip_access_control_type ON ip_access_control(access_type);
CREATE INDEX idx_ip_access_control_active ON ip_access_control(is_active) WHERE is_active = true;

-- Backup configurations indices
CREATE INDEX idx_backup_configurations_type ON backup_configurations(backup_type);
CREATE INDEX idx_backup_configurations_active ON backup_configurations(is_active) WHERE is_active = true;

-- Maintenance schedules indices
CREATE INDEX idx_maintenance_schedules_type ON maintenance_schedules(maintenance_type);
CREATE INDEX idx_maintenance_schedules_active ON maintenance_schedules(is_active) WHERE is_active = true;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branch_settings_updated_at BEFORE UPDATE ON branch_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_states_updated_at BEFORE UPDATE ON states FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON cities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_currencies_updated_at BEFORE UPDATE ON currencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_languages_updated_at BEFORE UPDATE ON languages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timezones_updated_at BEFORE UPDATE ON timezones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_hours_templates_updated_at BEFORE UPDATE ON business_hours_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_hours_updated_at BEFORE UPDATE ON business_hours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_settings_updated_at BEFORE UPDATE ON tax_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_gateways_updated_at BEFORE UPDATE ON payment_gateways FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_configurations_updated_at BEFORE UPDATE ON api_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_configurations_updated_at BEFORE UPDATE ON email_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sms_configurations_updated_at BEFORE UPDATE ON sms_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_push_notification_configurations_updated_at BEFORE UPDATE ON push_notification_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_security_policies_updated_at BEFORE UPDATE ON security_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ip_access_control_updated_at BEFORE UPDATE ON ip_access_control FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_backup_configurations_updated_at BEFORE UPDATE ON backup_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_schedules_updated_at BEFORE UPDATE ON maintenance_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Sample system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category) VALUES
('app_name', 'H POS System', 'string', 'Application name', 'general'),
('app_version', '1.0.0', 'string', 'Application version', 'general'),
('default_language', 'en', 'string', 'Default language', 'localization'),
('default_currency', 'SAR', 'string', 'Default currency', 'financial'),
('timezone', 'Asia/Riyadh', 'string', 'Default timezone', 'localization'),
('maintenance_mode', 'false', 'boolean', 'Maintenance mode', 'system'),
('max_file_upload_size', '10485760', 'number', 'Maximum file upload size in bytes', 'system'),
('session_timeout_minutes', '480', 'number', 'Session timeout in minutes', 'security');

-- Sample countries
INSERT INTO countries (name, name_ar, code, code_2, phone_code, currency_code, currency_symbol) VALUES
('Saudi Arabia', 'المملكة العربية السعودية', 'SAU', 'SA', '+966', 'SAR', 'ر.س'),
('United Arab Emirates', 'الإمارات العربية المتحدة', 'ARE', 'AE', '+971', 'AED', 'د.إ'),
('Kuwait', 'الكويت', 'KWT', 'KW', '+965', 'KWD', 'د.ك'),
('Qatar', 'قطر', 'QAT', 'QA', '+974', 'QAR', 'ر.ق'),
('Bahrain', 'البحرين', 'BHR', 'BH', '+973', 'BHD', 'د.ب'),
('Oman', 'عمان', 'OMN', 'OM', '+968', 'OMR', 'ر.ع');

-- Sample currencies
INSERT INTO currencies (name, name_ar, code, symbol, is_base_currency) VALUES
('Saudi Riyal', 'الريال السعودي', 'SAR', 'ر.س', true),
('US Dollar', 'الدولار الأمريكي', 'USD', '$', false),
('Euro', 'اليورو', 'EUR', '€', false),
('UAE Dirham', 'الدرهم الإماراتي', 'AED', 'د.إ', false),
('Kuwaiti Dinar', 'الدينار الكويتي', 'KWD', 'د.ك', false);

-- Sample languages
INSERT INTO languages (name, name_native, code, direction, is_active, is_default) VALUES
('English', 'English', 'en', 'ltr', true, true),
('Arabic', 'العربية', 'ar', 'rtl', true, false),
('French', 'Français', 'fr', 'ltr', true, false),
('Spanish', 'Español', 'es', 'ltr', true, false);

-- Sample timezones
INSERT INTO timezones (name, offset, offset_minutes, is_active, is_default) VALUES
('Asia/Riyadh', '+03:00', 180, true, true),
('UTC', '+00:00', 0, true, false),
('America/New_York', '-05:00', -300, true, false),
('Europe/London', '+00:00', 0, true, false);

-- Sample units
INSERT INTO units (name, name_ar, symbol, unit_type) VALUES
('Kilogram', 'كيلوغرام', 'kg', 'weight'),
('Gram', 'غرام', 'g', 'weight'),
('Liter', 'لتر', 'L', 'volume'),
('Milliliter', 'مليلتر', 'ml', 'volume'),
('Piece', 'قطعة', 'pc', 'count'),
('Box', 'صندوق', 'box', 'count');

-- Sample payment gateways
INSERT INTO payment_gateways (name, name_ar, gateway_code, is_active, supported_currencies) VALUES
('Stripe', 'سترايب', 'stripe', true, '["SAR", "USD", "EUR"]'),
('PayPal', 'باي بال', 'paypal', true, '["USD", "EUR", "GBP"]'),
('Mada', 'مدى', 'mada', true, '["SAR"]'),
('Apple Pay', 'آبل باي', 'apple_pay', true, '["SAR", "USD", "EUR"]'),
('Google Pay', 'جوجل باي', 'google_pay', true, '["SAR", "USD", "EUR"]');

-- Sample security policies
INSERT INTO security_policies (policy_name, policy_type, policy_value) VALUES
('Password Policy', 'password', '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_numbers": true, "require_special": true}'),
('Session Policy', 'session', '{"timeout_minutes": 480, "max_concurrent_sessions": 5}'),
('Login Policy', 'login', '{"max_attempts": 5, "lockout_duration_minutes": 30}');
