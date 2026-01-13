-- =============================================
-- CORE TABLES
-- =============================================

-- Users table (freelancers using the system)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    stripe_customer_id VARCHAR(255),
    subscription_tier VARCHAR(20) DEFAULT 'free', -- free, basic, premium
    subscription_status VARCHAR(20) DEFAULT 'active', -- active, cancelled, past_due
    subscription_expires_at TIMESTAMP,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- Refresh Tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL, -- Secure random token
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE
);

-- Clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    tax_number VARCHAR(100),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, archived
    client_category VARCHAR(50), -- e.g., recurring, one-time, prospect
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, on_hold, cancelled
    hourly_rate DECIMAL(10,2),
    fixed_price DECIMAL(10,2),
    start_date DATE,
    end_date DATE,
    due_date DATE,
    tags VARCHAR(255)[], -- Array of tags for categorization
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- QUOTES & PROPOSALS
-- =============================================

-- Quotes/Proposals table
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    status VARCHAR(20) DEFAULT 'draft', -- draft, sent, accepted, rejected, expired
    valid_until DATE,
    terms_and_conditions TEXT,
    notes TEXT,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    sent_at TIMESTAMP,
    accepted_at TIMESTAMP,
    viewed_at TIMESTAMP,
    pdf_url TEXT,
    public_hash VARCHAR(64) UNIQUE, -- For public shareable links
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quote line items
CREATE TABLE quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    discount DECIMAL(5,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quote history (for tracking changes)
CREATE TABLE quote_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- created, updated, sent, viewed, accepted, rejected
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INVOICES & PAYMENTS
-- =============================================

-- Invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft', -- draft, sent, viewed, partial, paid, overdue, cancelled
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    payment_terms VARCHAR(100), -- Net 30, Due on receipt, etc.
    notes TEXT,
    terms TEXT,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    amount_paid DECIMAL(10,2) DEFAULT 0.00,
    balance_due DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    sent_at TIMESTAMP,
    viewed_at TIMESTAMP,
    pdf_url TEXT,
    public_hash VARCHAR(64) UNIQUE, -- For public shareable links
    payment_link TEXT, -- Stripe/PayPal payment link
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice line items
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    discount DECIMAL(5,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice payments
CREATE TABLE invoice_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL, -- stripe, paypal, bank_transfer, cash, check
    transaction_id VARCHAR(255), -- External payment ID
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_date DATE NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'completed', -- pending, completed, failed, refunded
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- FILES & DOCUMENTS
-- =============================================

-- Project files
CREATE TABLE project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    filepath TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    description TEXT,
    category VARCHAR(50), -- contract, design, specification, etc.
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- REMINDERS & NOTIFICATIONS
-- =============================================

-- Reminders table
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    related_type VARCHAR(50), -- invoice, quote, project, client
    related_id UUID, -- ID of related entity
    due_date DATE,
    due_time TIME,
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, cancelled
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50), -- daily, weekly, monthly
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- AUDIT LOG
-- =============================================

-- Activity log
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- client, project, quote, invoice
    entity_id UUID,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_tier, subscription_status);

-- Indexes for performance
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Clients indexes
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_email ON clients(email);

-- Projects indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Quotes indexes
CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_client_id ON quotes(client_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX idx_quotes_public_hash ON quotes(public_hash);

-- Invoices indexes
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_public_hash ON invoices(public_hash);

-- Payments indexes
CREATE INDEX idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX idx_invoice_payments_status ON invoice_payments(status);

-- Reminders indexes
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_due_date ON reminders(due_date);
CREATE INDEX idx_reminders_status ON reminders(status);

-- Activity log indexes
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    month_part TEXT;
    seq_number INTEGER;
    new_number VARCHAR(50);
BEGIN
    -- Get current year and month
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    month_part := LPAD(EXTRACT(MONTH FROM CURRENT_DATE)::TEXT, 2, '0');
    
    -- Get next sequence number for this month
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '^INV-\d{6}-(\d+)$') AS INTEGER)), 0) + 1
    INTO seq_number
    FROM invoices
    WHERE invoice_number LIKE 'INV-' || year_part || month_part || '-%';
    
    -- Format: INV-YYYYMM-001
    new_number := 'INV-' || year_part || month_part || '-' || LPAD(seq_number::TEXT, 3, '0');
    
    NEW.invoice_number := new_number;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for invoice number generation (for new invoices without number)
CREATE TRIGGER set_invoice_number BEFORE INSERT ON invoices
    FOR EACH ROW
    WHEN (NEW.invoice_number IS NULL)
    EXECUTE FUNCTION generate_invoice_number();

-- Function to generate quote number
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    month_part TEXT;
    seq_number INTEGER;
    new_number VARCHAR(50);
BEGIN
    -- Get current year and month
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    month_part := LPAD(EXTRACT(MONTH FROM CURRENT_DATE)::TEXT, 2, '0');
    
    -- Get next sequence number for this month
    SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM '^QUO-\d{6}-(\d+)$') AS INTEGER)), 0) + 1
    INTO seq_number
    FROM quotes
    WHERE quote_number LIKE 'QUO-' || year_part || month_part || '-%';
    
    -- Format: QUO-YYYYMM-001
    new_number := 'QUO-' || year_part || month_part || '-' || LPAD(seq_number::TEXT, 3, '0');
    
    NEW.quote_number := new_number;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for quote number generation
CREATE TRIGGER set_quote_number BEFORE INSERT ON quotes
    FOR EACH ROW
    WHEN (NEW.quote_number IS NULL)
    EXECUTE FUNCTION generate_quote_number();

-- Function to update invoice totals
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
    invoice_total DECIMAL(10,2);
    paid_total DECIMAL(10,2);
BEGIN
    -- Calculate subtotal from items
    SELECT COALESCE(SUM(total), 0)
    INTO invoice_total
    FROM invoice_items
    WHERE invoice_id = NEW.id;
    
    -- Calculate total paid
    SELECT COALESCE(SUM(amount), 0)
    INTO paid_total
    FROM invoice_payments
    WHERE invoice_id = NEW.id AND status = 'completed';
    
    -- Update invoice
    UPDATE invoices
    SET 
        subtotal = invoice_total,
        total_amount = invoice_total + COALESCE(tax_amount, 0) - COALESCE(discount_amount, 0),
        amount_paid = paid_total,
        balance_due = (invoice_total + COALESCE(tax_amount, 0) - COALESCE(discount_amount, 0)) - paid_total,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for invoice totals update
CREATE TRIGGER update_invoice_totals_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_totals();

-- Trigger for payment updates
CREATE TRIGGER update_invoice_payments_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON invoice_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_totals();

-- Function to update quote totals
CREATE OR REPLACE FUNCTION update_quote_totals()
RETURNS TRIGGER AS $$
DECLARE
    quote_total DECIMAL(10,2);
BEGIN
    -- Calculate total from items
    SELECT COALESCE(SUM(total), 0)
    INTO quote_total
    FROM quote_items
    WHERE quote_id = NEW.id;
    
    -- Update quote
    UPDATE quotes
    SET 
        subtotal = quote_total,
        total_amount = quote_total + COALESCE(tax_amount, 0) - COALESCE(discount_amount, 0),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for quote totals update
CREATE TRIGGER update_quote_totals_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON quote_items
    FOR EACH ROW
    EXECUTE FUNCTION update_quote_totals();

-- =============================================
-- VIEWS FOR REPORTING
-- =============================================

-- View for client dashboard
CREATE VIEW client_summary AS
SELECT 
    c.id,
    c.user_id,
    c.company_name,
    c.contact_name,
    c.email,
    c.status,
    COUNT(DISTINCT p.id) as project_count,
    COUNT(DISTINCT q.id) as quote_count,
    COUNT(DISTINCT i.id) as invoice_count,
    COALESCE(SUM(i.total_amount), 0) as total_invoiced,
    COALESCE(SUM(ip.amount), 0) as total_paid,
    MAX(i.issue_date) as last_invoice_date
FROM clients c
LEFT JOIN projects p ON p.client_id = c.id
LEFT JOIN quotes q ON q.client_id = c.id
LEFT JOIN invoices i ON i.client_id = c.id
LEFT JOIN invoice_payments ip ON ip.invoice_id = i.id AND ip.status = 'completed'
GROUP BY c.id, c.user_id, c.company_name, c.contact_name, c.email, c.status;

-- View for invoice aging report
CREATE VIEW invoice_aging_report AS
SELECT 
    i.id,
    i.invoice_number,
    i.client_id,
    c.contact_name,
    c.company_name,
    i.issue_date,
    i.due_date,
    i.total_amount,
    i.amount_paid,
    i.balance_due,
    i.status,
    CASE 
        WHEN i.balance_due <= 0 THEN 'Paid'
        WHEN i.due_date >= CURRENT_DATE THEN 'Current'
        WHEN i.due_date >= CURRENT_DATE - INTERVAL '30 days' THEN '1-30 Days'
        WHEN i.due_date >= CURRENT_DATE - INTERVAL '60 days' THEN '31-60 Days'
        WHEN i.due_date >= CURRENT_DATE - INTERVAL '90 days' THEN '61-90 Days'
        ELSE 'Over 90 Days'
    END as aging_category
FROM invoices i
JOIN clients c ON c.id = i.client_id
WHERE i.status NOT IN ('draft', 'cancelled');

-- View for monthly revenue (alternative solution)
CREATE VIEW monthly_revenue AS
SELECT 
    DATE_TRUNC('month', ip.payment_date) as month,
    EXTRACT(YEAR FROM ip.payment_date) as year,
    EXTRACT(MONTH FROM ip.payment_date) as month_number,
    COUNT(DISTINCT ip.invoice_id) as invoice_count,
    SUM(ip.amount) as total_revenue,
    AVG(ip.amount) as average_payment
FROM invoice_payments ip
WHERE ip.status = 'completed'
GROUP BY 
    DATE_TRUNC('month', ip.payment_date),
    EXTRACT(YEAR FROM ip.payment_date),
    EXTRACT(MONTH FROM ip.payment_date)
ORDER BY month DESC;
