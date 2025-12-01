CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    
    -- Ownership
    owner_user_id UUID NOT NULL REFERENCES users(id),
    
    -- GDPR Essential
    data_region data_region DEFAULT 'eu-central',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- TEAM MEMBERS
-- ============================================================================

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    role team_role DEFAULT 'member',
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(team_id, user_id)
);