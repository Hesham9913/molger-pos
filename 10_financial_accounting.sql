-- =====================================================
-- FINANCIAL & ACCOUNTING MANAGEMENT
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
-- ACCOUNTING CHART OF ACCOUNTS
-- =====================================================

-- Chart of accounts
CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code VARCHAR(50) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_name_ar VARCHAR(255),
    account_type VARCHAR(50) NOT NULL, -- asset, liability, equity, revenue, expense
    account_category VARCHAR(100) NOT NULL, -- cash, accounts_receivable, inventory, etc.
    parent_account_id UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    is_system_account BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Account balances
CREATE TABLE account_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    balance_date DATE NOT NULL,
    opening_balance DECIMAL(15, 2) DEFAULT 0,
    closing_balance DECIMAL(15, 2) DEFAULT 0,
    debit_total DECIMAL(15, 2) DEFAULT 0,
    credit_total DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT unique_account_branch_date UNIQUE(account_id, branch_id, balance_date)
);

-- =====================================================
-- FINANCIAL TRANSACTIONS
-- =====================================================

-- General ledger transactions
CREATE TABLE general_ledger_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number VARCHAR(100) UNIQUE NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- sale, purchase, payment, receipt, adjustment, transfer
    reference_type VARCHAR(50), -- order, purchase_order, payment, etc.
    reference_id UUID,
    description TEXT,
    total_amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SAR',
    exchange_rate DECIMAL(10, 6) DEFAULT 1.000000,
    is_posted BOOLEAN DEFAULT false,
    posted_at TIMESTAMP,
    posted_by UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- General ledger entries
CREATE TABLE general_ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES general_ledger_transactions(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
    entry_type VARCHAR(10) NOT NULL, -- debit, credit
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- CASH MANAGEMENT
-- =====================================================

-- Cash registers
CREATE TABLE cash_registers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    register_name VARCHAR(255) NOT NULL,
    register_name_ar VARCHAR(255),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    register_type VARCHAR(50) NOT NULL, -- main, secondary, mobile
    opening_balance DECIMAL(12, 2) DEFAULT 0,
    current_balance DECIMAL(12, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_online BOOLEAN DEFAULT false,
    last_reconciliation_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Cash transactions
CREATE TABLE cash_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    register_id UUID NOT NULL REFERENCES cash_registers(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- opening, closing, sale, refund, adjustment, transfer
    amount DECIMAL(12, 2) NOT NULL,
    reference_type VARCHAR(50), -- order, payment, etc.
    reference_id UUID,
    description TEXT,
    performed_by UUID REFERENCES users(id),
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Cash reconciliation
CREATE TABLE cash_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    register_id UUID NOT NULL REFERENCES cash_registers(id) ON DELETE CASCADE,
    reconciliation_date DATE NOT NULL,
    expected_balance DECIMAL(12, 2) NOT NULL,
    actual_balance DECIMAL(12, 2) NOT NULL,
    difference_amount DECIMAL(12, 2) DEFAULT 0,
    notes TEXT,
    reconciled_by UUID REFERENCES users(id),
    reconciled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- BANKING & RECONCILIATION
-- =====================================================

-- Bank accounts
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_name VARCHAR(255) NOT NULL,
    account_name_ar VARCHAR(255),
    bank_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100),
    iban VARCHAR(50),
    swift_code VARCHAR(20),
    currency VARCHAR(3) DEFAULT 'SAR',
    opening_balance DECIMAL(15, 2) DEFAULT 0,
    current_balance DECIMAL(15, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Bank transactions
CREATE TABLE bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- deposit, withdrawal, transfer, fee, interest
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    reference_number VARCHAR(100),
    is_reconciled BOOLEAN DEFAULT false,
    reconciled_at TIMESTAMP,
    reconciled_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Bank reconciliation
CREATE TABLE bank_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
    reconciliation_date DATE NOT NULL,
    book_balance DECIMAL(15, 2) NOT NULL,
    bank_balance DECIMAL(15, 2) NOT NULL,
    difference_amount DECIMAL(15, 2) DEFAULT 0,
    notes TEXT,
    reconciled_by UUID REFERENCES users(id),
    reconciled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- ACCOUNTS RECEIVABLE & PAYABLE
-- =====================================================

-- Customer invoices
CREATE TABLE customer_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    balance_amount DECIMAL(12, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status VARCHAR(50) DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
    payment_terms VARCHAR(100),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Customer payments
CREATE TABLE customer_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES customer_invoices(id) ON DELETE SET NULL,
    payment_date DATE NOT NULL,
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Supplier invoices
CREATE TABLE supplier_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    balance_amount DECIMAL(12, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status VARCHAR(50) DEFAULT 'draft', -- draft, received, paid, overdue, cancelled
    payment_terms VARCHAR(100),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Supplier payments
CREATE TABLE supplier_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES supplier_invoices(id) ON DELETE SET NULL,
    payment_date DATE NOT NULL,
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- TAX MANAGEMENT
-- =====================================================

-- Tax periods
CREATE TABLE tax_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_name VARCHAR(255) NOT NULL,
    period_name_ar VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_closed BOOLEAN DEFAULT false,
    closed_at TIMESTAMP,
    closed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Tax calculations
CREATE TABLE tax_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_period_id UUID NOT NULL REFERENCES tax_periods(id) ON DELETE CASCADE,
    calculation_date DATE NOT NULL,
    tax_type VARCHAR(50) NOT NULL, -- vat, income_tax, corporate_tax
    taxable_amount DECIMAL(15, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) NOT NULL,
    tax_amount DECIMAL(15, 2) NOT NULL,
    reference_type VARCHAR(50), -- sale, purchase, etc.
    reference_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Tax returns
CREATE TABLE tax_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_period_id UUID NOT NULL REFERENCES tax_periods(id) ON DELETE CASCADE,
    return_type VARCHAR(50) NOT NULL, -- vat_return, income_tax_return
    filing_date DATE,
    due_date DATE,
    total_taxable_amount DECIMAL(15, 2) DEFAULT 0,
    total_tax_amount DECIMAL(15, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft', -- draft, filed, approved, rejected
    notes TEXT,
    filed_by UUID REFERENCES users(id),
    filed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- FINANCIAL REPORTS
-- =====================================================

-- Financial report templates
CREATE TABLE financial_report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(255) NOT NULL,
    report_name_ar VARCHAR(255),
    report_type VARCHAR(50) NOT NULL, -- income_statement, balance_sheet, cash_flow, trial_balance
    template_config JSONB,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Generated financial reports
CREATE TABLE financial_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES financial_report_templates(id) ON DELETE SET NULL,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    report_period_start DATE,
    report_period_end DATE,
    report_data JSONB,
    file_path VARCHAR(500),
    file_size BIGINT,
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- BUDGETING & FORECASTING
-- =====================================================

-- Budget periods
CREATE TABLE budget_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_name VARCHAR(255) NOT NULL,
    period_name_ar VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget_type VARCHAR(50) NOT NULL, -- annual, quarterly, monthly
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Budget categories
CREATE TABLE budget_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(255) NOT NULL,
    category_name_ar VARCHAR(255),
    category_type VARCHAR(50) NOT NULL, -- revenue, expense, capital
    parent_category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Budget allocations
CREATE TABLE budget_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_period_id UUID NOT NULL REFERENCES budget_periods(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    budgeted_amount DECIMAL(15, 2) NOT NULL,
    actual_amount DECIMAL(15, 2) DEFAULT 0,
    variance_amount DECIMAL(15, 2) GENERATED ALWAYS AS (budgeted_amount - actual_amount) STORED,
    variance_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (CASE WHEN budgeted_amount > 0 THEN ((budgeted_amount - actual_amount) / budgeted_amount) * 100 ELSE 0 END) STORED,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- COST CENTERS & PROFIT CENTERS
-- =====================================================

-- Cost centers
CREATE TABLE cost_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_code VARCHAR(50) UNIQUE NOT NULL,
    center_name VARCHAR(255) NOT NULL,
    center_name_ar VARCHAR(255),
    description TEXT,
    parent_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Profit centers
CREATE TABLE profit_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_code VARCHAR(50) UNIQUE NOT NULL,
    center_name VARCHAR(255) NOT NULL,
    center_name_ar VARCHAR(255),
    description TEXT,
    parent_center_id UUID REFERENCES profit_centers(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- INDICES FOR PERFORMANCE
-- =====================================================

-- Chart of accounts indices
CREATE INDEX idx_chart_of_accounts_code ON chart_of_accounts(account_code);
CREATE INDEX idx_chart_of_accounts_type ON chart_of_accounts(account_type);
CREATE INDEX idx_chart_of_accounts_category ON chart_of_accounts(account_category);
CREATE INDEX idx_chart_of_accounts_active ON chart_of_accounts(is_active) WHERE is_active = true;

-- Account balances indices
CREATE INDEX idx_account_balances_account_id ON account_balances(account_id);
CREATE INDEX idx_account_balances_branch_id ON account_balances(branch_id);
CREATE INDEX idx_account_balances_date ON account_balances(balance_date);

-- General ledger transactions indices
CREATE INDEX idx_general_ledger_transactions_number ON general_ledger_transactions(transaction_number);
CREATE INDEX idx_general_ledger_transactions_date ON general_ledger_transactions(transaction_date);
CREATE INDEX idx_general_ledger_transactions_type ON general_ledger_transactions(transaction_type);
CREATE INDEX idx_general_ledger_transactions_posted ON general_ledger_transactions(is_posted) WHERE is_posted = true;

-- General ledger entries indices
CREATE INDEX idx_general_ledger_entries_transaction_id ON general_ledger_entries(transaction_id);
CREATE INDEX idx_general_ledger_entries_account_id ON general_ledger_entries(account_id);
CREATE INDEX idx_general_ledger_entries_type ON general_ledger_entries(entry_type);

-- Cash registers indices
CREATE INDEX idx_cash_registers_branch_id ON cash_registers(branch_id);
CREATE INDEX idx_cash_registers_active ON cash_registers(is_active) WHERE is_active = true;
CREATE INDEX idx_cash_registers_online ON cash_registers(is_online) WHERE is_online = true;

-- Cash transactions indices
CREATE INDEX idx_cash_transactions_register_id ON cash_transactions(register_id);
CREATE INDEX idx_cash_transactions_type ON cash_transactions(transaction_type);
CREATE INDEX idx_cash_transactions_date ON cash_transactions(performed_at);

-- Cash reconciliations indices
CREATE INDEX idx_cash_reconciliations_register_id ON cash_reconciliations(register_id);
CREATE INDEX idx_cash_reconciliations_date ON cash_reconciliations(reconciliation_date);

-- Bank accounts indices
CREATE INDEX idx_bank_accounts_active ON bank_accounts(is_active) WHERE is_active = true;

-- Bank transactions indices
CREATE INDEX idx_bank_transactions_account_id ON bank_transactions(bank_account_id);
CREATE INDEX idx_bank_transactions_date ON bank_transactions(transaction_date);
CREATE INDEX idx_bank_transactions_type ON bank_transactions(transaction_type);
CREATE INDEX idx_bank_transactions_reconciled ON bank_transactions(is_reconciled) WHERE is_reconciled = false;

-- Bank reconciliations indices
CREATE INDEX idx_bank_reconciliations_account_id ON bank_reconciliations(bank_account_id);
CREATE INDEX idx_bank_reconciliations_date ON bank_reconciliations(reconciliation_date);

-- Customer invoices indices
CREATE INDEX idx_customer_invoices_number ON customer_invoices(invoice_number);
CREATE INDEX idx_customer_invoices_customer_id ON customer_invoices(customer_id);
CREATE INDEX idx_customer_invoices_date ON customer_invoices(invoice_date);
CREATE INDEX idx_customer_invoices_status ON customer_invoices(status);

-- Customer payments indices
CREATE INDEX idx_customer_payments_customer_id ON customer_payments(customer_id);
CREATE INDEX idx_customer_payments_invoice_id ON customer_payments(invoice_id);
CREATE INDEX idx_customer_payments_date ON customer_payments(payment_date);

-- Supplier invoices indices
CREATE INDEX idx_supplier_invoices_number ON supplier_invoices(invoice_number);
CREATE INDEX idx_supplier_invoices_supplier_id ON supplier_invoices(supplier_id);
CREATE INDEX idx_supplier_invoices_date ON supplier_invoices(invoice_date);
CREATE INDEX idx_supplier_invoices_status ON supplier_invoices(status);

-- Supplier payments indices
CREATE INDEX idx_supplier_payments_supplier_id ON supplier_payments(supplier_id);
CREATE INDEX idx_supplier_payments_invoice_id ON supplier_payments(invoice_id);
CREATE INDEX idx_supplier_payments_date ON supplier_payments(payment_date);

-- Tax periods indices
CREATE INDEX idx_tax_periods_dates ON tax_periods(start_date, end_date);
CREATE INDEX idx_tax_periods_closed ON tax_periods(is_closed) WHERE is_closed = false;

-- Tax calculations indices
CREATE INDEX idx_tax_calculations_period_id ON tax_calculations(tax_period_id);
CREATE INDEX idx_tax_calculations_date ON tax_calculations(calculation_date);
CREATE INDEX idx_tax_calculations_type ON tax_calculations(tax_type);

-- Tax returns indices
CREATE INDEX idx_tax_returns_period_id ON tax_returns(tax_period_id);
CREATE INDEX idx_tax_returns_type ON tax_returns(return_type);
CREATE INDEX idx_tax_returns_status ON tax_returns(status);

-- Financial report templates indices
CREATE INDEX idx_financial_report_templates_type ON financial_report_templates(report_type);
CREATE INDEX idx_financial_report_templates_active ON financial_report_templates(is_active) WHERE is_active = true;

-- Financial reports indices
CREATE INDEX idx_financial_reports_type ON financial_reports(report_type);
CREATE INDEX idx_financial_reports_period ON financial_reports(report_period_start, report_period_end);

-- Budget periods indices
CREATE INDEX idx_budget_periods_dates ON budget_periods(start_date, end_date);
CREATE INDEX idx_budget_periods_type ON budget_periods(budget_type);
CREATE INDEX idx_budget_periods_active ON budget_periods(is_active) WHERE is_active = true;

-- Budget categories indices
CREATE INDEX idx_budget_categories_type ON budget_categories(category_type);
CREATE INDEX idx_budget_categories_active ON budget_categories(is_active) WHERE is_active = true;

-- Budget allocations indices
CREATE INDEX idx_budget_allocations_period_id ON budget_allocations(budget_period_id);
CREATE INDEX idx_budget_allocations_category_id ON budget_allocations(category_id);
CREATE INDEX idx_budget_allocations_account_id ON budget_allocations(account_id);

-- Cost centers indices
CREATE INDEX idx_cost_centers_code ON cost_centers(center_code);
CREATE INDEX idx_cost_centers_active ON cost_centers(is_active) WHERE is_active = true;

-- Profit centers indices
CREATE INDEX idx_profit_centers_code ON profit_centers(center_code);
CREATE INDEX idx_profit_centers_active ON profit_centers(is_active) WHERE is_active = true;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE UPDATE ON chart_of_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_account_balances_updated_at BEFORE UPDATE ON account_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_general_ledger_transactions_updated_at BEFORE UPDATE ON general_ledger_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_general_ledger_entries_updated_at BEFORE UPDATE ON general_ledger_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cash_registers_updated_at BEFORE UPDATE ON cash_registers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cash_transactions_updated_at BEFORE UPDATE ON cash_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cash_reconciliations_updated_at BEFORE UPDATE ON cash_reconciliations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_transactions_updated_at BEFORE UPDATE ON bank_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_reconciliations_updated_at BEFORE UPDATE ON bank_reconciliations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_invoices_updated_at BEFORE UPDATE ON customer_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_payments_updated_at BEFORE UPDATE ON customer_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supplier_invoices_updated_at BEFORE UPDATE ON supplier_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supplier_payments_updated_at BEFORE UPDATE ON supplier_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_periods_updated_at BEFORE UPDATE ON tax_periods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_calculations_updated_at BEFORE UPDATE ON tax_calculations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_returns_updated_at BEFORE UPDATE ON tax_returns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_report_templates_updated_at BEFORE UPDATE ON financial_report_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_reports_updated_at BEFORE UPDATE ON financial_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_periods_updated_at BEFORE UPDATE ON budget_periods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_categories_updated_at BEFORE UPDATE ON budget_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_allocations_updated_at BEFORE UPDATE ON budget_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cost_centers_updated_at BEFORE UPDATE ON cost_centers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profit_centers_updated_at BEFORE UPDATE ON profit_centers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Sample chart of accounts
INSERT INTO chart_of_accounts (account_code, account_name, account_name_ar, account_type, account_category) VALUES
('1000', 'Cash', 'النقد', 'asset', 'cash'),
('1100', 'Bank Accounts', 'الحسابات البنكية', 'asset', 'bank'),
('1200', 'Accounts Receivable', 'الذمم المدينة', 'asset', 'accounts_receivable'),
('1300', 'Inventory', 'المخزون', 'asset', 'inventory'),
('1400', 'Fixed Assets', 'الأصول الثابتة', 'asset', 'fixed_assets'),
('2000', 'Accounts Payable', 'الذمم الدائنة', 'liability', 'accounts_payable'),
('2100', 'Tax Payable', 'الضرائب المستحقة', 'liability', 'tax_payable'),
('3000', 'Owner Equity', 'حقوق الملكية', 'equity', 'owner_equity'),
('4000', 'Sales Revenue', 'إيرادات المبيعات', 'revenue', 'sales'),
('5000', 'Cost of Goods Sold', 'تكلفة البضائع المباعة', 'expense', 'cost_of_goods_sold'),
('5100', 'Operating Expenses', 'المصروفات التشغيلية', 'expense', 'operating_expenses');

-- Sample budget categories
INSERT INTO budget_categories (category_name, category_name_ar, category_type) VALUES
('Sales Revenue', 'إيرادات المبيعات', 'revenue'),
('Food Cost', 'تكلفة الطعام', 'expense'),
('Labor Cost', 'تكلفة العمالة', 'expense'),
('Rent Expense', 'مصروف الإيجار', 'expense'),
('Utilities', 'المرافق', 'expense'),
('Marketing', 'التسويق', 'expense'),
('Equipment', 'المعدات', 'capital');

-- Sample cost centers
INSERT INTO cost_centers (center_code, center_name, center_name_ar) VALUES
('CC001', 'Kitchen', 'المطبخ'),
('CC002', 'Service', 'الخدمة'),
('CC003', 'Management', 'الإدارة'),
('CC004', 'Marketing', 'التسويق'),
('CC005', 'IT', 'تقنية المعلومات');

-- Sample profit centers
INSERT INTO profit_centers (center_code, center_name, center_name_ar) VALUES
('PC001', 'Dine-in Sales', 'مبيعات الجلوس'),
('PC002', 'Takeaway Sales', 'مبيعات الطلبات الخارجية'),
('PC003', 'Delivery Sales', 'مبيعات التوصيل'),
('PC004', 'Catering', 'الخدمات الخارجية');
