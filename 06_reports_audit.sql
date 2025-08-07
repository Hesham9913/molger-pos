-- =====================================================
-- REPORTS & AUDIT MANAGEMENT
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
-- AUDIT TRAIL SYSTEM
-- =====================================================

-- Audit trail for all major system changes
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES login_sessions(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- create, update, delete, login, logout, etc.
    resource_type VARCHAR(100) NOT NULL, -- users, orders, products, etc.
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    location_info JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System events and notifications
CREATE TABLE system_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL, -- order_created, stock_low, payment_failed, etc.
    event_level VARCHAR(20) DEFAULT 'info', -- info, warning, error, critical
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(100),
    resource_id UUID,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    metadata JSONB,
    is_read BOOLEAN DEFAULT false,
    read_by UUID REFERENCES users(id) ON DELETE SET NULL,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Error logs for system debugging
CREATE TABLE error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type VARCHAR(100) NOT NULL,
    error_code VARCHAR(50),
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES login_sessions(id) ON DELETE SET NULL,
    request_url TEXT,
    request_method VARCHAR(10),
    request_body JSONB,
    response_status INT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- REPORTING SYSTEM
-- =====================================================

-- Report definitions
CREATE TABLE report_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    report_type VARCHAR(50) NOT NULL, -- sales, inventory, customer, financial, etc.
    query_template TEXT NOT NULL,
    parameters JSONB,
    is_scheduled BOOLEAN DEFAULT false,
    schedule_cron VARCHAR(100),
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Generated reports
CREATE TABLE generated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_definition_id UUID REFERENCES report_definitions(id) ON DELETE SET NULL,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500),
    file_size BIGINT,
    file_format VARCHAR(20), -- pdf, excel, csv, json
    parameters JSONB,
    status VARCHAR(50) DEFAULT 'processing', -- processing, completed, failed
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    download_count INT DEFAULT 0,
    last_downloaded_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Report subscriptions
CREATE TABLE report_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_definition_id UUID NOT NULL REFERENCES report_definitions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    schedule VARCHAR(100), -- daily, weekly, monthly
    schedule_time TIME DEFAULT '09:00:00',
    is_active BOOLEAN DEFAULT true,
    last_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_user_report_subscription UNIQUE(user_id, report_definition_id)
);

-- =====================================================
-- ANALYTICS & METRICS
-- =====================================================

-- Daily metrics aggregation
CREATE TABLE daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- sales, orders, customers, etc.
    metric_value DECIMAL(15, 2),
    metric_count INT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_branch_date_metric UNIQUE(branch_id, metric_date, metric_type)
);

-- Hourly metrics for real-time analytics
CREATE TABLE hourly_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    metric_datetime TIMESTAMP NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(15, 2),
    metric_count INT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_branch_datetime_metric UNIQUE(branch_id, metric_datetime, metric_type)
);

-- Customer analytics
CREATE TABLE customer_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    average_order_value DECIMAL(10, 2) DEFAULT 0,
    last_order_date DATE,
    first_order_date DATE,
    favorite_category VARCHAR(100),
    favorite_product VARCHAR(100),
    order_frequency_days DECIMAL(5, 2),
    lifetime_value DECIMAL(12, 2) DEFAULT 0,
    churn_risk_score DECIMAL(3, 2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_customer_analytics UNIQUE(customer_id)
);

-- Product analytics
CREATE TABLE product_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    total_sold INT DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    average_rating DECIMAL(3, 2),
    review_count INT DEFAULT 0,
    popularity_score DECIMAL(5, 2),
    last_sold_date DATE,
    first_sold_date DATE,
    daily_average_sales DECIMAL(8, 2),
    weekly_average_sales DECIMAL(8, 2),
    monthly_average_sales DECIMAL(8, 2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_product_analytics UNIQUE(product_id)
);

-- =====================================================
-- DASHBOARD WIDGETS
-- =====================================================

-- Dashboard configurations
CREATE TABLE dashboard_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dashboard_name VARCHAR(255) NOT NULL,
    layout JSONB,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Dashboard widgets
CREATE TABLE dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL REFERENCES dashboard_configurations(id) ON DELETE CASCADE,
    widget_type VARCHAR(50) NOT NULL, -- chart, table, metric, etc.
    widget_title VARCHAR(255) NOT NULL,
    widget_config JSONB,
    position_x INT DEFAULT 0,
    position_y INT DEFAULT 0,
    width INT DEFAULT 4,
    height INT DEFAULT 2,
    is_active BOOLEAN DEFAULT true,
    refresh_interval INT, -- in seconds
    last_refresh_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- EXPORT & IMPORT LOGS
-- =====================================================

-- Data export logs
CREATE TABLE export_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    export_type VARCHAR(50) NOT NULL, -- orders, customers, products, etc.
    file_path VARCHAR(500),
    file_size BIGINT,
    file_format VARCHAR(20), -- csv, excel, json, pdf
    filters JSONB,
    status VARCHAR(50) DEFAULT 'processing', -- processing, completed, failed
    total_records INT,
    processed_records INT DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Data import logs
CREATE TABLE import_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    import_type VARCHAR(50) NOT NULL, -- products, customers, orders, etc.
    file_path VARCHAR(500),
    file_size BIGINT,
    file_format VARCHAR(20),
    status VARCHAR(50) DEFAULT 'processing', -- processing, completed, failed
    total_records INT,
    processed_records INT DEFAULT 0,
    successful_records INT DEFAULT 0,
    failed_records INT DEFAULT 0,
    error_log TEXT,
    validation_errors JSONB,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- SYSTEM MONITORING
-- =====================================================

-- System health checks
CREATE TABLE system_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    check_type VARCHAR(50) NOT NULL, -- database, api, external_service, etc.
    check_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL, -- healthy, warning, critical
    response_time_ms INT,
    error_message TEXT,
    metadata JSONB,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance metrics
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15, 4),
    metric_unit VARCHAR(20), -- ms, mb, count, percentage
    component VARCHAR(50), -- database, api, frontend, etc.
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API usage logs
CREATE TABLE api_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INT NOT NULL,
    response_time_ms INT,
    request_size_bytes INT,
    response_size_bytes INT,
    ip_address INET,
    user_agent TEXT,
    request_body JSONB,
    response_body JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- NOTIFICATION SYSTEM
-- =====================================================

-- Notification templates
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    type VARCHAR(50) NOT NULL, -- email, sms, push, in_app
    subject VARCHAR(255),
    subject_ar VARCHAR(255),
    content TEXT NOT NULL,
    content_ar TEXT,
    variables JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- email, sms, push, in_app
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255),
    message TEXT NOT NULL,
    message_ar TEXT,
    data JSONB,
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, failed
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Notification preferences
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- order_updates, promotions, system_alerts, etc.
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    push_enabled BOOLEAN DEFAULT true,
    in_app_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_user_notification_type UNIQUE(user_id, notification_type)
);

-- =====================================================
-- INDICES FOR PERFORMANCE
-- =====================================================

-- Audit logs indices
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- System events indices
CREATE INDEX idx_system_events_type ON system_events(event_type);
CREATE INDEX idx_system_events_level ON system_events(event_level);
CREATE INDEX idx_system_events_user_id ON system_events(user_id);
CREATE INDEX idx_system_events_branch_id ON system_events(branch_id);
CREATE INDEX idx_system_events_read ON system_events(is_read) WHERE is_read = false;

-- Error logs indices
CREATE INDEX idx_error_logs_type ON error_logs(error_type);
CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at);

-- Report definitions indices
CREATE INDEX idx_report_definitions_type ON report_definitions(report_type);
CREATE INDEX idx_report_definitions_active ON report_definitions(is_active) WHERE is_active = true;
CREATE INDEX idx_report_definitions_scheduled ON report_definitions(is_scheduled) WHERE is_scheduled = true;

-- Generated reports indices
CREATE INDEX idx_generated_reports_type ON generated_reports(report_type);
CREATE INDEX idx_generated_reports_status ON generated_reports(status);
CREATE INDEX idx_generated_reports_generated_by ON generated_reports(generated_by);
CREATE INDEX idx_generated_reports_created_at ON generated_reports(created_at);

-- Report subscriptions indices
CREATE INDEX idx_report_subscriptions_user_id ON report_subscriptions(user_id);
CREATE INDEX idx_report_subscriptions_active ON report_subscriptions(is_active) WHERE is_active = true;

-- Metrics indices
CREATE INDEX idx_daily_metrics_branch_date ON daily_metrics(branch_id, metric_date);
CREATE INDEX idx_daily_metrics_type ON daily_metrics(metric_type);
CREATE INDEX idx_hourly_metrics_branch_datetime ON hourly_metrics(branch_id, metric_datetime);
CREATE INDEX idx_hourly_metrics_type ON hourly_metrics(metric_type);

-- Analytics indices
CREATE INDEX idx_customer_analytics_customer_id ON customer_analytics(customer_id);
CREATE INDEX idx_customer_analytics_lifetime_value ON customer_analytics(lifetime_value);
CREATE INDEX idx_product_analytics_product_id ON product_analytics(product_id);
CREATE INDEX idx_product_analytics_popularity ON product_analytics(popularity_score);

-- Dashboard indices
CREATE INDEX idx_dashboard_configurations_user_id ON dashboard_configurations(user_id);
CREATE INDEX idx_dashboard_widgets_dashboard_id ON dashboard_widgets(dashboard_id);

-- Export/Import logs indices
CREATE INDEX idx_export_logs_user_id ON export_logs(user_id);
CREATE INDEX idx_export_logs_type ON export_logs(export_type);
CREATE INDEX idx_export_logs_status ON export_logs(status);
CREATE INDEX idx_import_logs_user_id ON import_logs(user_id);
CREATE INDEX idx_import_logs_type ON import_logs(import_type);
CREATE INDEX idx_import_logs_status ON import_logs(status);

-- System monitoring indices
CREATE INDEX idx_system_health_checks_type ON system_health_checks(check_type);
CREATE INDEX idx_system_health_checks_status ON system_health_checks(status);
CREATE INDEX idx_system_health_checks_checked_at ON system_health_checks(checked_at);

-- Performance metrics indices
CREATE INDEX idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_component ON performance_metrics(component);
CREATE INDEX idx_performance_metrics_recorded_at ON performance_metrics(recorded_at);

-- API usage indices
CREATE INDEX idx_api_usage_logs_user_id ON api_usage_logs(user_id);
CREATE INDEX idx_api_usage_logs_endpoint ON api_usage_logs(endpoint);
CREATE INDEX idx_api_usage_logs_status_code ON api_usage_logs(status_code);
CREATE INDEX idx_api_usage_logs_created_at ON api_usage_logs(created_at);

-- Notification indices
CREATE INDEX idx_notification_templates_type ON notification_templates(type);
CREATE INDEX idx_notification_templates_active ON notification_templates(is_active) WHERE is_active = true;

-- Notifications indices
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Notification preferences indices
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX idx_notification_preferences_type ON notification_preferences(notification_type);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_system_events_updated_at BEFORE UPDATE ON system_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_definitions_updated_at BEFORE UPDATE ON report_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_generated_reports_updated_at BEFORE UPDATE ON generated_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_subscriptions_updated_at BEFORE UPDATE ON report_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_metrics_updated_at BEFORE UPDATE ON daily_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hourly_metrics_updated_at BEFORE UPDATE ON hourly_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_analytics_updated_at BEFORE UPDATE ON customer_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_analytics_updated_at BEFORE UPDATE ON product_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_configurations_updated_at BEFORE UPDATE ON dashboard_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_widgets_updated_at BEFORE UPDATE ON dashboard_widgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_export_logs_updated_at BEFORE UPDATE ON export_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_import_logs_updated_at BEFORE UPDATE ON import_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Sample notification templates
INSERT INTO notification_templates (name, name_ar, type, subject, subject_ar, content, content_ar) VALUES
('Order Confirmation', 'تأكيد الطلب', 'email', 'Order Confirmed', 'تم تأكيد طلبك', 'Your order #{order_number} has been confirmed and is being prepared.', 'تم تأكيد طلبك رقم {order_number} ويتم تحضيره الآن.'),
('Order Ready', 'الطلب جاهز', 'sms', 'Order Ready for Pickup', 'الطلب جاهز للاستلام', 'Your order #{order_number} is ready for pickup.', 'طلبك رقم {order_number} جاهز للاستلام.'),
('Low Stock Alert', 'تنبيه انخفاض المخزون', 'in_app', 'Low Stock Alert', 'تنبيه انخفاض المخزون', 'Product {product_name} is running low on stock.', 'المنتج {product_name} منخفض في المخزون.');

-- Sample report definitions
INSERT INTO report_definitions (name, name_ar, description, report_type, query_template, is_active) VALUES
('Daily Sales Report', 'تقرير المبيعات اليومية', 'Daily sales summary by branch', 'sales', 'SELECT * FROM orders WHERE DATE(created_at) = :date', true),
('Customer Analytics', 'تحليلات العملاء', 'Customer behavior and preferences', 'customer', 'SELECT * FROM customer_analytics WHERE customer_id = :customer_id', true),
('Inventory Status', 'حالة المخزون', 'Current inventory levels and alerts', 'inventory', 'SELECT * FROM stock_levels WHERE available_stock < min_stock_level', true);

-- Sample system events
INSERT INTO system_events (event_type, event_level, title, description) VALUES
('order_created', 'info', 'New Order Created', 'A new order has been created'),
('stock_low', 'warning', 'Low Stock Alert', 'Product stock is running low'),
('payment_failed', 'error', 'Payment Failed', 'A payment transaction has failed'),
('system_maintenance', 'info', 'System Maintenance', 'Scheduled system maintenance');
