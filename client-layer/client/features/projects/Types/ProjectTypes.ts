export interface ApiResponse {
    error: boolean
    data: ProjectData
}

export interface ProjectData {
    id: string
    name: string
    slug: string
    teamName: string
    framework: string
    isMonorepo: boolean
    frameworks: FrameworkConfig[]
    status: 'active' | 'inactive' | 'paused' | string
    production: EnvironmentDeployment
    staging: EnvironmentDeployment
    preview: PreviewDeployment[]
    metrics: ProjectMetrics
    gitRepoUrl: string
    builds: BuildData[] // Add this
}

export interface BuildData {
    id: string
    commit: string
    branch: string
    status: 'queued' | 'cloning' | 'installing' | 'building' | 'deploying' | 'completed' | 'failed' | 'cancelled' | 'timeout'
    buildTime: string | null
    framework: string | null
    initiatedBy: string | null
    createdAt: string
    errorMessage: string | null
}

export interface FrameworkConfig {
    Name: string
    Path: string
    Port: number
    Runtime: string
    Version: string
    BuildCmd: string
}

export interface EnvironmentDeployment {
    url: string | null
    status: string | null
    lastDeployment: string
    commit: string | null
    branch: string | null
    buildTime: string | null
    framework: string | null
}

export interface PreviewDeployment {
    url?: string
    status?: string
    createdAt?: string
    commit?: string
    branch?: string
}

export interface ProjectMetrics {
    uptime: string
    avgResponseTime: string
    requests24h: string
    errors24h: string
}

export interface ProjectResponse {
    id: string
    projectName: string
    createdAt: string
    slug: string
    teamName: string
    memberCount: number
}

export type BuildStatus = 'queued' | 'cloning' | 'installing' | 'building' | 'running'| 'deploying' | 'success' | 'failed' | 'cancelled'

export interface Build {
    id: string
    status: BuildStatus
    branch: string
    commit: string
    startTime: string
    endTime?: string
    duration?: string
    deploymentUrl?: string
    framework?: string
    initiatedBy?: string
    errorMessage?: string
}
