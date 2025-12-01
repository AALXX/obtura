
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES users(id),
    
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    
    -- Billing
    billing_email VARCHAR(255),
    vat_number VARCHAR(50),
    
    -- Address
    address_line1 VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(2) DEFAULT 'RO',
    
    -- GDPR Essential (just 2 fields!)
    data_region data_region DEFAULT 'eu-central',
    dpa_signed BOOLEAN DEFAULT false, -- Data Processing Agreement
    
    -- Subscription
    max_users INT DEFAULT 5,
    max_projects INT DEFAULT 50,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
