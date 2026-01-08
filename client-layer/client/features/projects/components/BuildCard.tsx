'use client'
import React from 'react'
import { CheckCircle2, XCircle, Clock, GitBranch, Calendar, Eye, Loader2 } from 'lucide-react'

export type BuildStatus = 'queued' | 'cloning' | 'installing' | 'building' | 'deploying' | 'success' | 'failed' | 'cancelled'

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

interface BuildCardProps {
    build: Build
    onViewLogs: () => void
}

const BuildCard: React.FC<BuildCardProps> = ({ build, onViewLogs }) => {
    const getStatusDisplay = () => {
        switch (build.status) {
            case 'queued':
                return { icon: Clock, text: 'Queued', color: 'text-blue-500', bgColor: 'bg-blue-500/10' }
            case 'cloning':
                return { icon: Loader2, text: 'Cloning', color: 'text-blue-500', bgColor: 'bg-blue-500/10', spin: true }
            case 'installing':
                return { icon: Loader2, text: 'Installing', color: 'text-blue-500', bgColor: 'bg-blue-500/10', spin: true }
            case 'building':
                return { icon: Loader2, text: 'Building', color: 'text-blue-500', bgColor: 'bg-blue-500/10', spin: true }
            case 'deploying':
                return { icon: Loader2, text: 'Deploying', color: 'text-orange-500', bgColor: 'bg-orange-500/10', spin: true }
            case 'success':
                return { icon: CheckCircle2, text: 'Success', color: 'text-green-500', bgColor: 'bg-green-500/10' }
            case 'failed':
                return { icon: XCircle, text: 'Failed', color: 'text-red-500', bgColor: 'bg-red-500/10' }
            case 'cancelled':
                return { icon: XCircle, text: 'Cancelled', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' }
        }
    }

    const statusDisplay = getStatusDisplay()
    const StatusIcon = statusDisplay.icon
    const isBuilding = ['queued', 'cloning', 'installing', 'building', 'deploying'].includes(build.status)

    return (
        <div className="rounded-lg border border-zinc-800 bg-[#1b1b1b] p-5 transition-all hover:border-zinc-700">
            <div className="flex items-start justify-between">
                <div className="flex flex-1 items-start gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${statusDisplay.bgColor}`}>
                        <StatusIcon className={`${statusDisplay.color} ${statusDisplay.spin ? 'animate-spin' : ''}`} size={24} />
                    </div>

                    <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            <h3 className="font-semibold text-white">Build #{build.id.substring(0, 8)}</h3>
                            <span className={`rounded-full ${statusDisplay.bgColor} px-2 py-0.5 text-xs ${statusDisplay.color}`}>{statusDisplay.text}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                            <div>
                                <div className="text-zinc-400">Branch</div>
                                <div className="flex items-center gap-1.5 font-medium text-white">
                                    <GitBranch size={14} />
                                    {build.branch}
                                </div>
                            </div>
                            <div>
                                <div className="text-zinc-400">Commit</div>
                                <div className="font-mono text-xs font-medium text-white">{build.commit.substring(0, 7)}</div>
                            </div>
                            {build.framework && (
                                <div>
                                    <div className="text-zinc-400">Framework</div>
                                    <div className="font-medium text-white">{build.framework}</div>
                                </div>
                            )}
                            <div>
                                <div className="text-zinc-400">Started</div>
                                <div className="flex items-center gap-1.5 font-medium text-white">
                                    <Calendar size={14} />
                                    {build.startTime}
                                </div>
                            </div>
                            {build.duration && (
                                <div>
                                    <div className="text-zinc-400">Duration</div>
                                    <div className="font-medium text-white">{build.duration}</div>
                                </div>
                            )}
                            {build.initiatedBy && (
                                <div>
                                    <div className="text-zinc-400">Initiated By</div>
                                    <div className="font-medium text-white">{build.initiatedBy}</div>
                                </div>
                            )}
                        </div>

                        {build.errorMessage && build.status === 'failed' && <div className="mt-3 rounded-lg bg-red-500/10 p-2 text-sm text-red-400">{build.errorMessage}</div>}

                        {isBuilding && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-orange-400">
                                <div className="h-2 w-2 animate-pulse rounded-full bg-orange-400" />
                                <span>Build in progress...</span>
                            </div>
                        )}
                    </div>
                </div>

                <button onClick={onViewLogs} className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
                    <Eye size={16} />
                    View Logs
                </button>
            </div>
        </div>
    )
}
export default BuildCard
