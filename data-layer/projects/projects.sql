CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    
    -- Config
    runtime VARCHAR(50), -- 'nodejs', 'python', 'php'
    framework VARCHAR(100),
    
    -- Environment variables (encrypt in app layer)
    env_variables JSONB,
    
    -- GDPR Essential
    data_region data_region DEFAULT 'eu-central',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    UNIQUE(team_id, slug)
);

-- ============================================================================
-- DEPLOYMENTS (Simplified)
-- ============================================================================

CREATE TABLE deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Git info
    commit_hash VARCHAR(40) NOT NULL,
    branch VARCHAR(255),
    
    -- Status
    status VARCHAR(50) DEFAULT 'queued',
    
    -- Who triggered
    triggered_by_user_id UUID REFERENCES users(id),
    
    -- URLs
    deployment_url TEXT,
    build_log_url TEXT, -- S3 URL, auto-expire after 90 days
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_deployments_project_id ON deployments(project_id);

-- ============================================================================
-- AUDIT LOG (Simplified - ONE table for everything)
-- ============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Who did what
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    
    -- What happened
    action VARCHAR(100) NOT NULL, -- 'user.login', 'project.created', 'data.exported'
    resource_type VARCHAR(50), -- 'user', 'project', 'team'
    resource_id UUID,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- Result
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    
    -- GDPR special tracking
    is_gdpr_action BOOLEAN DEFAULT false, -- Flag for exports/deletions
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_gdpr ON audit_logs(is_gdpr_action) WHERE is_gdpr_action = true;

-- Auto-delete audit logs older than 1 year (except GDPR actions)
-- Handle this in application code or pg_cron------