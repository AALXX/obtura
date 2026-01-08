'use client'
import React, { useState, useEffect, useRef } from 'react'
import { CheckCircle2, XCircle, Terminal, Loader2, GitBranch, Package, Clock } from 'lucide-react'
import { BuildStatus, Build } from './BuildCard'
import axios from 'axios'

interface BuildLogsViewerProps {
    build: Build
    onClose: () => void
}

const BuildLogsViewer: React.FC<BuildLogsViewerProps> = ({ build, onClose }) => {
    const [logs, setLogs] = useState<Array<{ time: string; message: string; type: 'info' | 'success' | 'error' | 'warning' }>>([])
    const [isLoading, setIsLoading] = useState(true)
    const logsEndRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    useEffect(() => {
        const fetchBuildLogs = async () => {
            setIsLoading(true)
            try {
                const resp = await axios.get<{ logs: any[] }>(`${process.env.NEXT_PUBLIC_BUILD_SERVICE_URL}/builds/${build.id}/logs`)
                if (resp.status !== 200) {
                    throw new Error('Failed to fetch build logs')
                }

                const transformedLogs = resp.data.logs.map((log: any) => ({
                    time: new Date(log.created_at).toLocaleTimeString('en-US', { hour12: false }),
                    message: log.message,
                    type: log.log_type as 'info' | 'success' | 'error' | 'warning'
                }))

                setLogs(transformedLogs)
            } catch (error) {
                console.error('Error fetching build logs:', error)
                setLogs([
                    {
                        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
                        message: 'Failed to load build logs',
                        type: 'error'
                    }
                ])
            } finally {
                setIsLoading(false)
            }
        }

        fetchBuildLogs()
    }, [build.id])

    const getStatusDisplay = () => {
        switch (build.status) {
            case 'queued':
                return { icon: Clock, text: 'Queued', color: 'text-blue-500', bgColor: 'bg-blue-500/10' }
            case 'cloning':
                return { icon: GitBranch, text: 'Cloning Repository', color: 'text-blue-500', bgColor: 'bg-blue-500/10' }
            case 'installing':
                return { icon: Package, text: 'Installing Dependencies', color: 'text-blue-500', bgColor: 'bg-blue-500/10' }
            case 'building':
                return { icon: Loader2, text: 'Building Application', color: 'text-orange-500', bgColor: 'bg-orange-500/10' }
            case 'success':
                return { icon: CheckCircle2, text: 'Build Successful', color: 'text-green-500', bgColor: 'bg-green-500/10' }
            case 'failed':
                return { icon: XCircle, text: 'Build Failed', color: 'text-red-500', bgColor: 'bg-red-500/10' }
            case 'cancelled':
                return { icon: XCircle, text: 'Build Cancelled', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' }
            default:
                return { icon: Terminal, text: 'Unknown Status', color: 'text-gray-500', bgColor: 'bg-gray-500/10' }
        }
    }

    const statusDisplay = getStatusDisplay()
    const StatusIcon = statusDisplay.icon
    const isBuilding = ['queued', 'cloning', 'installing', 'building'].includes(build.status)

    return (
        <div className="flex h-full w-full flex-col">
            {/* Header */}
            <div className="border-b border-zinc-800 p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${statusDisplay.bgColor}`}>
                            <StatusIcon className={`${statusDisplay.color} ${isBuilding ? 'animate-spin' : ''}`} size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Build #{build.id}</h2>
                            <p className="text-sm text-zinc-400">
                                {statusDisplay.text} • {build.branch}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="border-b border-zinc-800 bg-zinc-900/50 p-5">
                <div className="flex items-center justify-between">
                    {(['cloning', 'installing', 'building'] as const).map((step, idx) => {
                        const stepIndex = ['queued', 'cloning', 'installing', 'building', 'success', 'failed', 'cancelled'].indexOf(build.status)
                        const currentStepIndex = ['queued', 'cloning', 'installing', 'building', 'success', 'failed', 'cancelled'].indexOf(step)
                        const isComplete = stepIndex > currentStepIndex || build.status === 'success'
                        const isCurrent = build.status === step
                        const isFailed = build.status === 'failed' && currentStepIndex <= stepIndex

                        return (
                            <React.Fragment key={step}>
                                <div className="flex flex-col items-center gap-2">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 ${
                                            isFailed ? 'border-red-500 bg-red-500/20 text-red-500' : isComplete ? 'border-green-500 bg-green-500/20 text-green-500' : isCurrent ? 'border-orange-500 bg-orange-500/20 text-orange-500' : 'border-zinc-700 bg-zinc-900 text-zinc-500'
                                        }`}
                                    >
                                        {isFailed ? <XCircle size={18} /> : isComplete ? <CheckCircle2 size={18} /> : isCurrent ? <Loader2 size={18} className="animate-spin" /> : idx + 1}
                                    </div>
                                    <span className={`text-xs capitalize ${isCurrent ? 'font-medium text-white' : isComplete ? 'text-zinc-400' : 'text-zinc-500'}`}>{step}</span>
                                </div>
                                {idx < 2 && <div className={`h-0.5 flex-1 ${isComplete ? 'bg-green-500' : isFailed ? 'bg-red-500' : 'bg-zinc-800'}`} />}
                            </React.Fragment>
                        )
                    })}
                </div>
            </div>

            {/* Success Banner */}
            {build.status === 'success' && (
                <div className="border-b border-zinc-800 bg-green-500/5 p-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-green-500" size={20} />
                        <div>
                            <div className="text-sm font-semibold text-green-500">Build Successful!</div>
                            <div className="text-sm text-zinc-400">Build completed in {build.duration}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Logs Terminal */}
            <div className="flex-1 overflow-hidden p-5">
                <div className="mb-3 flex items-center gap-2 text-sm text-zinc-400">
                    <Terminal size={16} />
                    <span className="font-medium">Build Logs</span>
                </div>
                <div className="h-[calc(100%-2rem)] overflow-y-auto rounded-lg border border-zinc-800 bg-black p-4 font-mono text-xs">
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Loader2 className="animate-spin" size={16} />
                            <span>Loading build logs...</span>
                        </div>
                    ) : (
                        <>
                            {logs.map((log, idx) => (
                                <div key={idx} className="mb-1.5 flex gap-3">
                                    <span className="text-zinc-600">[{log.time}]</span>
                                    <span className={log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : log.type === 'warning' ? 'text-yellow-400' : 'text-zinc-400'}>{log.message}</span>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900/50 p-5">
                <div className="text-sm text-zinc-400">
                    {build.status === 'failed' && (
                        <span className="flex items-center gap-2 text-red-400">
                            <XCircle size={16} />
                            Build failed. Check logs for details.
                        </span>
                    )}
                    {build.status === 'success' && (
                        <span className="flex items-center gap-2 text-green-400">
                            <CheckCircle2 size={16} />
                            Build completed in {build.duration}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800">
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BuildLogsViewer
