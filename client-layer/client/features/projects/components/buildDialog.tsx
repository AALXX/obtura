'use client'
import React, { useState, useEffect, useRef } from 'react'
import { GitBranch, GitCommit, Hammer, CheckCircle2, XCircle, Clock, Terminal, ChevronDown, AlertCircle } from 'lucide-react'

interface BuildDialogProps {
    accessToken: string
    projectId: string
    onClose: () => void
    onBuildComplete?: () => void
    gitRepoUrl: string // Add this prop
}

interface GitBranch {
    name: string
    commit: {
        sha: string
        url: string
    }
}

interface GitCommit {
    sha: string
    commit: {
        message: string
        author: {
            name: string
            date: string
        }
    }
}

const BuildDialog: React.FC<BuildDialogProps> = ({ accessToken, projectId, onClose, onBuildComplete, gitRepoUrl }) => {
    const [branches, setBranches] = useState<Array<{ name: string; lastCommit: string }>>([])
    const [commits, setCommits] = useState<Array<{ hash: string; message: string; author: string; time: string }>>([])
    const [selectedBranch, setSelectedBranch] = useState('')
    const [selectedCommit, setSelectedCommit] = useState('')
    const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'success' | 'error'>('idle')
    const [logs, setLogs] = useState<Array<{ type: string; message: string; timestamp: string }>>([])
    const [showBranchDropdown, setShowBranchDropdown] = useState(false)
    const [showCommitDropdown, setShowCommitDropdown] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const logsEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [logs])

    const parseGitUrl = (url: string): { provider: 'github' | 'gitlab'; owner: string; repo: string } | null => {
        const githubMatch = url.match(/github\.com[\/:]([^\/]+)\/([^\/\.]+)(\.git)?/)
        const gitlabMatch = url.match(/gitlab\.com[\/:]([^\/]+)\/([^\/\.]+)(\.git)?/)

        if (githubMatch) {
            return { provider: 'github', owner: githubMatch[1], repo: githubMatch[2] }
        } else if (gitlabMatch) {
            return { provider: 'gitlab', owner: gitlabMatch[1], repo: gitlabMatch[2] }
        }
        return null
    }

    const getRelativeTime = (dateString: string): string => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        return `${diffDays}d ago`
    }

    useEffect(() => {
        fetchBranches()
    }, [gitRepoUrl])

    useEffect(() => {
        if (selectedBranch) {
            fetchCommits(selectedBranch)
        }
    }, [selectedBranch])

    const fetchBranches = async () => {
        setLoading(true)
        setError('')

        const parsed = parseGitUrl(gitRepoUrl)
        if (!parsed) {
            setError('Invalid Git repository URL')
            setLoading(false)
            return
        }

        try {
            let apiUrl: string
            if (parsed.provider === 'github') {
                apiUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/branches`
            } else {
                const projectId = encodeURIComponent(`${parsed.owner}/${parsed.repo}`)
                apiUrl = `https://gitlab.com/api/v4/projects/${projectId}/repository/branches`
            }

            const response = await fetch(apiUrl)

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Repository not found')
                } else if (response.status === 403) {
                    throw new Error('Rate limit exceeded or private repository')
                } else {
                    throw new Error('Failed to fetch branches')
                }
            }

            const data: GitBranch[] = await response.json()
            const branchesData = data.map(branch => ({
                name: branch.name,
                lastCommit: branch.commit?.sha?.substring(0, 7) || 'N/A'
            }))

            setBranches(branchesData)

            // Auto-select main/master branch
            const defaultBranch = branchesData.find(b => b.name === 'main') || branchesData.find(b => b.name === 'master') || branchesData[0]
            if (defaultBranch) {
                setSelectedBranch(defaultBranch.name)
            }
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    const fetchCommits = async (branch: string) => {
        const parsed = parseGitUrl(gitRepoUrl)
        if (!parsed) return

        try {
            let apiUrl: string
            if (parsed.provider === 'github') {
                apiUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/commits?sha=${branch}&per_page=10`
            } else {
                const projectId = encodeURIComponent(`${parsed.owner}/${parsed.repo}`)
                apiUrl = `https://gitlab.com/api/v4/projects/${projectId}/repository/commits?ref_name=${branch}&per_page=10`
            }

            const response = await fetch(apiUrl)

            if (!response.ok) {
                throw new Error('Failed to fetch commits')
            }

            const data: GitCommit[] = await response.json()
            const commitsData = data.map(commit => ({
                hash: commit.sha.substring(0, 7),
                message: commit.commit.message.split('\n')[0], // First line only
                author: commit.commit.author.name,
                time: getRelativeTime(commit.commit.author.date)
            }))

            setCommits(commitsData)

            // Auto-select first commit
            if (commitsData.length > 0) {
                setSelectedCommit(commitsData[0].hash)
            }
        } catch (err) {
            console.error('Failed to fetch commits:', err)
        }
    }

    const addLog = (type: string, message: string) => {
        const timestamp = new Date().toLocaleTimeString()
        setLogs(prev => [...prev, { type, message, timestamp }])
    }

    const simulateBuild = async () => {
        setBuildStatus('building')
        setLogs([])

        const buildSteps = [
            { type: 'info', message: `Starting build for branch: ${selectedBranch}`, delay: 100 },
            { type: 'info', message: `Commit: ${selectedCommit}`, delay: 200 },
            { type: 'info', message: 'Cloning repository...', delay: 800 },
            { type: 'success', message: 'Repository cloned successfully', delay: 1000 },
            { type: 'info', message: 'Installing dependencies...', delay: 500 },
            { type: 'info', message: 'npm install --production', delay: 1500 },
            { type: 'success', message: 'Dependencies installed (234 packages)', delay: 800 },
            { type: 'info', message: 'Running build script...', delay: 500 },
            { type: 'info', message: 'npm run build', delay: 1200 },
            { type: 'info', message: 'Compiling TypeScript...', delay: 1000 },
            { type: 'info', message: 'Bundling assets...', delay: 1500 },
            { type: 'success', message: 'Build completed successfully', delay: 800 },
            { type: 'info', message: 'Creating Docker image...', delay: 1000 },
            { type: 'success', message: 'Docker image created', delay: 800 },
            { type: 'info', message: 'Pushing to registry...', delay: 1200 },
            { type: 'success', message: 'Image pushed successfully', delay: 500 }
        ]

        for (const step of buildSteps) {
            await new Promise(resolve => setTimeout(resolve, step.delay))
            addLog(step.type, step.message)
        }

        const success = Math.random() > 0.1

        await new Promise(resolve => setTimeout(resolve, 500))

        if (success) {
            addLog('success', '✓ Build completed successfully!')
            setBuildStatus('success')
            onBuildComplete?.()
        } else {
            addLog('error', '✗ Build failed: Module not found')
            setBuildStatus('error')
        }
    }

    const handleStartBuild = () => {
        simulateBuild()
    }

    const getLogColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'text-green-500'
            case 'error':
                return 'text-red-500'
            case 'warn':
                return 'text-yellow-500'
            default:
                return 'text-zinc-400'
        }
    }

    if (loading) {
        return (
            <div className="w-full max-w-4xl border-zinc-800 bg-[#1b1b1b] text-white">
                <div className="flex items-center justify-center p-12">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                        <p className="text-sm text-zinc-400">Loading repository data...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-full max-w-4xl border-zinc-800 bg-[#1b1b1b] text-white">
                <div className="p-6">
                    <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                        <AlertCircle className="text-red-500" size={20} />
                        <div>
                            <div className="font-semibold text-red-500">Failed to load repository</div>
                            <div className="text-sm text-red-400">{error}</div>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button onClick={onClose} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-[#0f0f0f]">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl border-zinc-800 bg-[#1b1b1b] text-white">
            <div className="border-b border-zinc-800 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                            <Hammer className="text-orange-500" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Start New Build</h2>
                            <p className="text-sm text-zinc-400">Select branch and commit to build</p>
                        </div>
                    </div>
                    {buildStatus === 'building' && (
                        <div className="flex items-center gap-2 text-sm text-orange-500">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                            Building...
                        </div>
                    )}
                    {buildStatus === 'success' && (
                        <div className="flex items-center gap-2 text-sm text-green-500">
                            <CheckCircle2 size={16} />
                            Success
                        </div>
                    )}
                    {buildStatus === 'error' && (
                        <div className="flex items-center gap-2 text-sm text-red-500">
                            <XCircle size={16} />
                            Failed
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6">
                {buildStatus === 'idle' && (
                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-300">Select Branch</label>
                            <div className="relative">
                                <button onClick={() => setShowBranchDropdown(!showBranchDropdown)} className="flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-[#0f0f0f] px-4 py-3 text-left text-sm text-white hover:border-zinc-700">
                                    <div className="flex items-center gap-2">
                                        <GitBranch size={16} className="text-zinc-400" />
                                        <span>{selectedBranch || 'Select a branch'}</span>
                                    </div>
                                    <ChevronDown size={16} className="text-zinc-400" />
                                </button>

                                {showBranchDropdown && (
                                    <div className="absolute z-10 mt-2 w-full rounded-lg border border-zinc-800 bg-[#0f0f0f] shadow-lg">
                                        {branches.map(branch => (
                                            <button
                                                key={branch.name}
                                                onClick={() => {
                                                    setSelectedBranch(branch.name)
                                                    setShowBranchDropdown(false)
                                                }}
                                                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-zinc-800"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <GitBranch size={14} className="text-zinc-400" />
                                                    <span>{branch.name}</span>
                                                </div>
                                                <span className="text-xs text-zinc-500">{branch.lastCommit}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-300">Select Commit</label>
                            <div className="relative">
                                <button
                                    onClick={() => setShowCommitDropdown(!showCommitDropdown)}
                                    disabled={!selectedBranch || commits.length === 0}
                                    className="flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-[#0f0f0f] px-4 py-3 text-left text-sm text-white hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-2">
                                        <GitCommit size={16} className="text-zinc-400" />
                                        <span className="font-mono">{selectedCommit || 'Select a commit'}</span>
                                    </div>
                                    <ChevronDown size={16} className="text-zinc-400" />
                                </button>

                                {showCommitDropdown && commits.length > 0 && (
                                    <div className="absolute z-10 mt-2 max-h-96 w-full overflow-y-auto rounded-lg border border-zinc-800 bg-[#0f0f0f] shadow-lg">
                                        {commits.map(commit => (
                                            <button
                                                key={commit.hash}
                                                onClick={() => {
                                                    setSelectedCommit(commit.hash)
                                                    setShowCommitDropdown(false)
                                                }}
                                                className="w-full px-4 py-3 text-left hover:bg-zinc-800"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <GitCommit size={14} className="mt-0.5 text-zinc-400" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-xs text-orange-500">{commit.hash}</span>
                                                            <span className="text-xs text-zinc-500">{commit.time}</span>
                                                        </div>
                                                        <div className="mt-1 text-sm text-white">{commit.message}</div>
                                                        <div className="mt-1 text-xs text-zinc-500">{commit.author}</div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={onClose} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-[#0f0f0f]">
                                Cancel
                            </button>
                            <button onClick={handleStartBuild} disabled={!selectedBranch || !selectedCommit} className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">
                                <Hammer size={16} />
                                Start Build
                            </button>
                        </div>
                    </div>
                )}

                {buildStatus !== 'idle' && (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-zinc-800 bg-[#0f0f0f]/50 p-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-zinc-400">Branch</div>
                                    <div className="mt-1 flex items-center gap-2 font-medium">
                                        <GitBranch size={14} />
                                        {selectedBranch}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-zinc-400">Commit</div>
                                    <div className="mt-1 flex items-center gap-2 font-mono text-sm font-medium">
                                        <GitCommit size={14} />
                                        {selectedCommit}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-zinc-800 bg-black">
                            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
                                <Terminal size={16} className="text-zinc-400" />
                                <span className="text-sm font-medium">Build Logs</span>
                            </div>
                            <div className="h-96 overflow-y-auto p-4 font-mono text-xs">
                                {logs.map((log, idx) => (
                                    <div key={idx} className="mb-1 flex items-start gap-3">
                                        <span className="text-zinc-600">{log.timestamp}</span>
                                        <span className={getLogColor(log.type)}>{log.message}</span>
                                    </div>
                                ))}
                                <div ref={logsEndRef} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            {buildStatus === 'building' ? (
                                <button disabled className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-500">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
                                    Building...
                                </button>
                            ) : (
                                <>
                                    <button onClick={onClose} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-[#0f0f0f]">
                                        Close
                                    </button>
                                    {buildStatus === 'error' && (
                                        <button
                                            onClick={() => {
                                                setBuildStatus('idle')
                                                setLogs([])
                                            }}
                                            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                                        >
                                            <Hammer size={16} />
                                            Retry Build
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BuildDialog
