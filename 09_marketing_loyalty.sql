-- =====================================================
-- MARKETING & LOYALTY MANAGEMENT
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
-- MARKETING CAMPAIGNS
-- =====================================================

-- Marketing campaigns
CREATE TABLE marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    campaign_type VARCHAR(50) NOT NULL, -- email, sms, push, social, in_app
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, paused, completed, cancelled
    target_audience JSONB, -- customer segments, demographics, etc.
    campaign_settings JSONB,
    budget DECIMAL(12, 2),
    spent_amount DECIMAL(12, 2) DEFAULT 0,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Campaign content
CREATE TABLE campaign_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- subject, body, image, video
    content_data TEXT,
    content_ar TEXT,
    media_url VARCHAR(500),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Campaign recipients
CREATE TABLE campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    email VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, opened, clicked, failed
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Campaign analytics
CREATE TABLE campaign_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- sent, delivered, opened, clicked, converted
    metric_value INT DEFAULT 0,
    metric_rate DECIMAL(5, 2), -- percentage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_campaign_date_metric UNIQUE(campaign_id, metric_date, metric_type)
);

-- =====================================================
-- PROMOTIONS & DISCOUNTS
-- =====================================================

-- Promotion campaigns
CREATE TABLE promotion_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    promotion_type VARCHAR(50) NOT NULL, -- percentage, fixed_amount, buy_x_get_y, free_shipping
    discount_value DECIMAL(10, 2) NOT NULL,
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
    maximum_discount_amount DECIMAL(10, 2),
    applies_to VARCHAR(50) DEFAULT 'all', -- all, specific_products, specific_categories
    applicable_products JSONB,
    applicable_categories JSONB,
    customer_segments JSONB,
    usage_limit_per_customer INT,
    total_usage_limit INT,
    current_usage_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Promotion codes
CREATE TABLE promotion_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_campaign_id UUID NOT NULL REFERENCES promotion_campaigns(id) ON DELETE CASCADE,
    code VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    usage_limit INT,
    usage_count INT DEFAULT 0,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Promotion usage tracking
CREATE TABLE promotion_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_campaign_id UUID NOT NULL REFERENCES promotion_campaigns(id) ON DELETE CASCADE,
    promotion_code_id UUID REFERENCES promotion_codes(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    discount_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- LOYALTY PROGRAM
-- =====================================================

-- Loyalty program configuration
CREATE TABLE loyalty_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    points_per_currency DECIMAL(10, 4) DEFAULT 1.0, -- points per 1 currency unit
    currency_value_per_point DECIMAL(10, 4) DEFAULT 0.01, -- currency value per 1 point
    minimum_points_redemption INT DEFAULT 100,
    maximum_points_redemption_per_order INT,
    points_expiry_days INT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Loyalty tiers
CREATE TABLE loyalty_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loyalty_program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
    tier_name VARCHAR(100) NOT NULL,
    tier_name_ar VARCHAR(100),
    tier_level INT NOT NULL, -- 1=Bronze, 2=Silver, 3=Gold, 4=Platinum
    minimum_points INT DEFAULT 0,
    points_multiplier DECIMAL(3, 2) DEFAULT 1.0, -- bonus multiplier for this tier
    benefits JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Customer loyalty accounts
CREATE TABLE customer_loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    loyalty_program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
    current_tier_id UUID REFERENCES loyalty_tiers(id) ON DELETE SET NULL,
    points_balance INT DEFAULT 0,
    total_points_earned INT DEFAULT 0,
    total_points_redeemed INT DEFAULT 0,
    total_points_expired INT DEFAULT 0,
    tier_upgrade_date DATE,
    last_activity_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_customer_loyalty_program UNIQUE(customer_id, loyalty_program_id)
);

-- Loyalty transactions
CREATE TABLE loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_loyalty_account_id UUID NOT NULL REFERENCES customer_loyalty_accounts(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- earn, redeem, expire, adjust, bonus
    points_amount INT NOT NULL,
    currency_value DECIMAL(10, 2),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    description TEXT,
    reference_type VARCHAR(50), -- order, promotion, manual, bonus
    reference_id UUID,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loyalty rewards
CREATE TABLE loyalty_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loyalty_program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
    reward_name VARCHAR(255) NOT NULL,
    reward_name_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    reward_type VARCHAR(50) NOT NULL, -- discount, free_item, free_shipping, bonus_points
    points_cost INT NOT NULL,
    reward_value DECIMAL(10, 2),
    reward_data JSONB,
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Loyalty reward redemptions
CREATE TABLE loyalty_reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_loyalty_account_id UUID NOT NULL REFERENCES customer_loyalty_accounts(id) ON DELETE CASCADE,
    loyalty_reward_id UUID NOT NULL REFERENCES loyalty_rewards(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    points_spent INT NOT NULL,
    reward_value DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'active', -- active, used, expired, cancelled
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- CUSTOMER SEGMENTS
-- =====================================================

-- Customer segments
CREATE TABLE customer_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    segment_type VARCHAR(50) NOT NULL, -- demographic, behavioral, geographic, custom
    segment_criteria JSONB,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Customer segment assignments
CREATE TABLE customer_segment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    segment_id UUID NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_customer_segment UNIQUE(customer_id, segment_id)
);

-- =====================================================
-- EMAIL MARKETING
-- =====================================================

-- Email templates
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    subject_ar VARCHAR(255),
    content TEXT NOT NULL,
    content_ar TEXT,
    template_type VARCHAR(50) NOT NULL, -- welcome, order_confirmation, promotion, newsletter
    variables JSONB,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Email campaigns
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    subject VARCHAR(255),
    subject_ar VARCHAR(255),
    content TEXT,
    content_ar TEXT,
    target_segment_id UUID REFERENCES customer_segments(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, sending, completed, cancelled
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    total_recipients INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    opened_count INT DEFAULT 0,
    clicked_count INT DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Email campaign recipients
CREATE TABLE email_campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, opened, clicked, bounced, unsubscribed
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    bounce_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- SMS MARKETING
-- =====================================================

-- SMS templates
CREATE TABLE sms_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    content TEXT NOT NULL,
    content_ar TEXT,
    template_type VARCHAR(50) NOT NULL, -- order_update, promotion, reminder, verification
    variables JSONB,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- SMS campaigns
CREATE TABLE sms_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    template_id UUID REFERENCES sms_templates(id) ON DELETE SET NULL,
    content TEXT,
    content_ar TEXT,
    target_segment_id UUID REFERENCES customer_segments(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, sending, completed, cancelled
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    total_recipients INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    delivered_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- SMS campaign recipients
CREATE TABLE sms_campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sms_campaign_id UUID NOT NULL REFERENCES sms_campaigns(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    phone VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, failed
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- PUSH NOTIFICATIONS
-- =====================================================

-- Push notification templates
CREATE TABLE push_notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255),
    message TEXT NOT NULL,
    message_ar TEXT,
    template_type VARCHAR(50) NOT NULL, -- order_update, promotion, reminder, general
    action_url VARCHAR(500),
    image_url VARCHAR(500),
    variables JSONB,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Push notification campaigns
CREATE TABLE push_notification_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    template_id UUID REFERENCES push_notification_templates(id) ON DELETE SET NULL,
    title VARCHAR(255),
    title_ar VARCHAR(255),
    message TEXT,
    message_ar TEXT,
    action_url VARCHAR(500),
    image_url VARCHAR(500),
    target_segment_id UUID REFERENCES customer_segments(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, sending, completed, cancelled
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    total_recipients INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    delivered_count INT DEFAULT 0,
    opened_count INT DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- MARKETING ANALYTICS
-- =====================================================

-- Marketing campaign analytics
CREATE TABLE marketing_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID,
    campaign_type VARCHAR(50) NOT NULL, -- email, sms, push, promotion
    metric_date DATE NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- sent, delivered, opened, clicked, converted
    metric_value INT DEFAULT 0,
    metric_rate DECIMAL(5, 2), -- percentage
    revenue_generated DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Customer engagement analytics
CREATE TABLE customer_engagement_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    engagement_date DATE NOT NULL,
    email_opens INT DEFAULT 0,
    email_clicks INT DEFAULT 0,
    sms_delivered INT DEFAULT 0,
    push_delivered INT DEFAULT 0,
    push_opens INT DEFAULT 0,
    website_visits INT DEFAULT 0,
    app_opens INT DEFAULT 0,
    orders_placed INT DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_customer_engagement_date UNIQUE(customer_id, engagement_date)
);

-- =====================================================
-- INDICES FOR PERFORMANCE
-- =====================================================

-- Marketing campaigns indices
CREATE INDEX idx_marketing_campaigns_type ON marketing_campaigns(campaign_type);
CREATE INDEX idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX idx_marketing_campaigns_dates ON marketing_campaigns(start_date, end_date);

-- Campaign content indices
CREATE INDEX idx_campaign_content_campaign_id ON campaign_content(campaign_id);
CREATE INDEX idx_campaign_content_type ON campaign_content(content_type);
CREATE INDEX idx_campaign_content_active ON campaign_content(is_active) WHERE is_active = true;

-- Campaign recipients indices
CREATE INDEX idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_customer_id ON campaign_recipients(customer_id);
CREATE INDEX idx_campaign_recipients_status ON campaign_recipients(status);

-- Campaign analytics indices
CREATE INDEX idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);
CREATE INDEX idx_campaign_analytics_date ON campaign_analytics(metric_date);
CREATE INDEX idx_campaign_analytics_type ON campaign_analytics(metric_type);

-- Promotion campaigns indices
CREATE INDEX idx_promotion_campaigns_type ON promotion_campaigns(promotion_type);
CREATE INDEX idx_promotion_campaigns_active ON promotion_campaigns(is_active) WHERE is_active = true;
CREATE INDEX idx_promotion_campaigns_dates ON promotion_campaigns(valid_from, valid_until);

-- Promotion codes indices
CREATE INDEX idx_promotion_codes_code ON promotion_codes(code);
CREATE INDEX idx_promotion_codes_active ON promotion_codes(is_active) WHERE is_active = true;
CREATE INDEX idx_promotion_codes_dates ON promotion_codes(valid_from, valid_until);

-- Promotion usage indices
CREATE INDEX idx_promotion_usage_campaign_id ON promotion_usage(promotion_campaign_id);
CREATE INDEX idx_promotion_usage_customer_id ON promotion_usage(customer_id);
CREATE INDEX idx_promotion_usage_order_id ON promotion_usage(order_id);

-- Loyalty programs indices
CREATE INDEX idx_loyalty_programs_active ON loyalty_programs(is_active) WHERE is_active = true;

-- Loyalty tiers indices
CREATE INDEX idx_loyalty_tiers_program_id ON loyalty_tiers(loyalty_program_id);
CREATE INDEX idx_loyalty_tiers_level ON loyalty_tiers(tier_level);
CREATE INDEX idx_loyalty_tiers_active ON loyalty_tiers(is_active) WHERE is_active = true;

-- Customer loyalty accounts indices
CREATE INDEX idx_customer_loyalty_accounts_customer_id ON customer_loyalty_accounts(customer_id);
CREATE INDEX idx_customer_loyalty_accounts_program_id ON customer_loyalty_accounts(loyalty_program_id);
CREATE INDEX idx_customer_loyalty_accounts_tier_id ON customer_loyalty_accounts(current_tier_id);

-- Loyalty transactions indices
CREATE INDEX idx_loyalty_transactions_account_id ON loyalty_transactions(customer_loyalty_account_id);
CREATE INDEX idx_loyalty_transactions_type ON loyalty_transactions(transaction_type);
CREATE INDEX idx_loyalty_transactions_order_id ON loyalty_transactions(order_id);

-- Loyalty rewards indices
CREATE INDEX idx_loyalty_rewards_program_id ON loyalty_rewards(loyalty_program_id);
CREATE INDEX idx_loyalty_rewards_type ON loyalty_rewards(reward_type);
CREATE INDEX idx_loyalty_rewards_active ON loyalty_rewards(is_active) WHERE is_active = true;

-- Loyalty reward redemptions indices
CREATE INDEX idx_loyalty_reward_redemptions_account_id ON loyalty_reward_redemptions(customer_loyalty_account_id);
CREATE INDEX idx_loyalty_reward_redemptions_reward_id ON loyalty_reward_redemptions(loyalty_reward_id);
CREATE INDEX idx_loyalty_reward_redemptions_status ON loyalty_reward_redemptions(status);

-- Customer segments indices
CREATE INDEX idx_customer_segments_type ON customer_segments(segment_type);
CREATE INDEX idx_customer_segments_active ON customer_segments(is_active) WHERE is_active = true;

-- Customer segment assignments indices
CREATE INDEX idx_customer_segment_assignments_customer_id ON customer_segment_assignments(customer_id);
CREATE INDEX idx_customer_segment_assignments_segment_id ON customer_segment_assignments(segment_id);
CREATE INDEX idx_customer_segment_assignments_active ON customer_segment_assignments(is_active) WHERE is_active = true;

-- Email templates indices
CREATE INDEX idx_email_templates_type ON email_templates(template_type);
CREATE INDEX idx_email_templates_active ON email_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_email_templates_default ON email_templates(is_default) WHERE is_default = true;

-- Email campaigns indices
CREATE INDEX idx_email_campaigns_template_id ON email_campaigns(template_id);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled ON email_campaigns(scheduled_at);

-- Email campaign recipients indices
CREATE INDEX idx_email_campaign_recipients_campaign_id ON email_campaign_recipients(email_campaign_id);
CREATE INDEX idx_email_campaign_recipients_customer_id ON email_campaign_recipients(customer_id);
CREATE INDEX idx_email_campaign_recipients_status ON email_campaign_recipients(status);

-- SMS templates indices
CREATE INDEX idx_sms_templates_type ON sms_templates(template_type);
CREATE INDEX idx_sms_templates_active ON sms_templates(is_active) WHERE is_active = true;

-- SMS campaigns indices
CREATE INDEX idx_sms_campaigns_template_id ON sms_campaigns(template_id);
CREATE INDEX idx_sms_campaigns_status ON sms_campaigns(status);
CREATE INDEX idx_sms_campaigns_scheduled ON sms_campaigns(scheduled_at);

-- SMS campaign recipients indices
CREATE INDEX idx_sms_campaign_recipients_campaign_id ON sms_campaign_recipients(sms_campaign_id);
CREATE INDEX idx_sms_campaign_recipients_customer_id ON sms_campaign_recipients(customer_id);
CREATE INDEX idx_sms_campaign_recipients_status ON sms_campaign_recipients(status);

-- Push notification templates indices
CREATE INDEX idx_push_notification_templates_type ON push_notification_templates(template_type);
CREATE INDEX idx_push_notification_templates_active ON push_notification_templates(is_active) WHERE is_active = true;

-- Push notification campaigns indices
CREATE INDEX idx_push_notification_campaigns_template_id ON push_notification_campaigns(template_id);
CREATE INDEX idx_push_notification_campaigns_status ON push_notification_campaigns(status);
CREATE INDEX idx_push_notification_campaigns_scheduled ON push_notification_campaigns(scheduled_at);

-- Marketing analytics indices
CREATE INDEX idx_marketing_analytics_campaign_id ON marketing_analytics(campaign_id);
CREATE INDEX idx_marketing_analytics_type ON marketing_analytics(campaign_type);
CREATE INDEX idx_marketing_analytics_date ON marketing_analytics(metric_date);

-- Customer engagement analytics indices
CREATE INDEX idx_customer_engagement_analytics_customer_id ON customer_engagement_analytics(customer_id);
CREATE INDEX idx_customer_engagement_analytics_date ON customer_engagement_analytics(engagement_date);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_marketing_campaigns_updated_at BEFORE UPDATE ON marketing_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_content_updated_at BEFORE UPDATE ON campaign_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_recipients_updated_at BEFORE UPDATE ON campaign_recipients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_analytics_updated_at BEFORE UPDATE ON campaign_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promotion_campaigns_updated_at BEFORE UPDATE ON promotion_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promotion_codes_updated_at BEFORE UPDATE ON promotion_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loyalty_programs_updated_at BEFORE UPDATE ON loyalty_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loyalty_tiers_updated_at BEFORE UPDATE ON loyalty_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_loyalty_accounts_updated_at BEFORE UPDATE ON customer_loyalty_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loyalty_rewards_updated_at BEFORE UPDATE ON loyalty_rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loyalty_reward_redemptions_updated_at BEFORE UPDATE ON loyalty_reward_redemptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_segments_updated_at BEFORE UPDATE ON customer_segments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_segment_assignments_updated_at BEFORE UPDATE ON customer_segment_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_campaign_recipients_updated_at BEFORE UPDATE ON email_campaign_recipients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sms_templates_updated_at BEFORE UPDATE ON sms_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sms_campaigns_updated_at BEFORE UPDATE ON sms_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sms_campaign_recipients_updated_at BEFORE UPDATE ON sms_campaign_recipients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_push_notification_templates_updated_at BEFORE UPDATE ON push_notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_push_notification_campaigns_updated_at BEFORE UPDATE ON push_notification_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketing_analytics_updated_at BEFORE UPDATE ON marketing_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_engagement_analytics_updated_at BEFORE UPDATE ON customer_engagement_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Sample loyalty program
INSERT INTO loyalty_programs (name, name_ar, description, points_per_currency, currency_value_per_point, minimum_points_redemption) VALUES
('H POS Rewards', 'مكافآت إتش بوز', 'Earn points on every purchase and redeem for discounts', 1.0, 0.01, 100);

-- Sample loyalty tiers
INSERT INTO loyalty_tiers (loyalty_program_id, tier_name, tier_name_ar, tier_level, minimum_points, points_multiplier, benefits) VALUES
(gen_random_uuid(), 'Bronze', 'برونزي', 1, 0, 1.0, '{"discount_percentage": 5}'),
(gen_random_uuid(), 'Silver', 'فضي', 2, 1000, 1.2, '{"discount_percentage": 10, "free_shipping": true}'),
(gen_random_uuid(), 'Gold', 'ذهبي', 3, 5000, 1.5, '{"discount_percentage": 15, "free_shipping": true, "priority_support": true}'),
(gen_random_uuid(), 'Platinum', 'بلاتيني', 4, 10000, 2.0, '{"discount_percentage": 20, "free_shipping": true, "priority_support": true, "exclusive_offers": true}');

-- Sample customer segments
INSERT INTO customer_segments (name, name_ar, description, segment_type, segment_criteria) VALUES
('VIP Customers', 'العملاء المميزون', 'High-value customers with significant spending', 'behavioral', '{"min_total_spent": 1000, "min_order_count": 10}'),
('New Customers', 'العملاء الجدد', 'Customers who joined in the last 30 days', 'behavioral', '{"registration_days": 30}'),
('Inactive Customers', 'العملاء غير النشطين', 'Customers with no activity in the last 90 days', 'behavioral', '{"inactive_days": 90}'),
('Frequent Buyers', 'المشترون المتكررون', 'Customers who order frequently', 'behavioral', '{"min_orders_per_month": 3}');

-- Sample email templates
INSERT INTO email_templates (name, name_ar, subject, subject_ar, content, template_type, is_default) VALUES
('Welcome Email', 'رسالة الترحيب', 'Welcome to H POS!', 'مرحباً بك في إتش بوز!', 'Thank you for joining our loyalty program!', 'welcome', true),
('Order Confirmation', 'تأكيد الطلب', 'Your order has been confirmed', 'تم تأكيد طلبك', 'Your order #{order_number} has been confirmed and is being prepared.', 'order_confirmation', true),
('Promotion Email', 'رسالة الترويج', 'Special offer just for you!', 'عرض خاص لك!', 'Don''t miss out on our special promotion!', 'promotion', false);

-- Sample SMS templates
INSERT INTO sms_templates (name, name_ar, content, content_ar, template_type, is_default) VALUES
('Order Update', 'تحديث الطلب', 'Your order #{order_number} is ready for pickup!', 'طلبك رقم {order_number} جاهز للاستلام!', 'order_update', true),
('Promotion SMS', 'رسالة ترويجية', 'Get 20% off on your next order! Use code: SAVE20', 'احصل على خصم 20% على طلبك القادم! استخدم الكود: SAVE20', 'promotion', false),
('Reminder SMS', 'رسالة تذكير', 'Don''t forget your scheduled order!', 'لا تنس طلبك المجدول!', 'reminder', false);

-- Sample push notification templates
INSERT INTO push_notification_templates (name, name_ar, title, title_ar, message, message_ar, template_type, is_default) VALUES
('Order Ready', 'الطلب جاهز', 'Your order is ready!', 'طلبك جاهز!', 'Your order #{order_number} is ready for pickup.', 'طلبك رقم {order_number} جاهز للاستلام.', 'order_update', true),
('Promotion Push', 'ترويج', 'Special offer!', 'عرض خاص!', 'Get 20% off on your next order!', 'احصل على خصم 20% على طلبك القادم!', 'promotion', false);
