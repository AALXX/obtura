'use client'
import React, { useState, useEffect, useRef } from 'react'
import { X, CheckCircle2, XCircle, Clock, Terminal, Loader2, GitBranch, Package, WifiOff, Wifi } from 'lucide-react'

type BuildStatus = 'queued' | 'cloning' | 'installing' | 'building' | 'completed' | 'failed' | 'timeout' | 'rejected'

interface BuildDialogProps {
    accessToken: string
    projectId: string
    gitRepoUrl: string
    buildId: string
    onBuildStatusChange: (buildData: { id: string; status: BuildStatus; branch: string; commit: string; startTime: string; endTime?: string; duration: string }) => void
    onClose: () => void
}

interface LogEntry {
    time: string
    message: string
    type: 'info' | 'success' | 'error' | 'warn'
}

const BuildDialog: React.FC<BuildDialogProps> = ({ accessToken, projectId, gitRepoUrl, buildId, onBuildStatusChange, onClose }) => {
    const [status, setStatus] = useState<BuildStatus>('queued')
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [buildTime, setBuildTime] = useState(0)
    const [isConnected, setIsConnected] = useState(false)
    const [connectionError, setConnectionError] = useState<string | null>(null)
    const logsEndRef = useRef<HTMLDivElement>(null)
    const startTimeRef = useRef<number>(Date.now())
    const eventSourceRef = useRef<EventSource | null>(null)

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    useEffect(() => {
        if (!['completed', 'failed', 'timeout', 'rejected'].includes(status)) {
            const interval = setInterval(() => {
                setBuildTime(Math.floor((Date.now() - startTimeRef.current) / 1000))
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [status])

    useEffect(() => {
        const buildServiceUrl = process.env.NEXT_PUBLIC_BUILD_SERVICE_URL || 'http://localhost:5050'
        const eventSource = new EventSource(`${buildServiceUrl}/builds/${buildId}/logs/stream`)
        eventSourceRef.current = eventSource

        console.log(`🔌 Connecting to SSE: ${buildServiceUrl}/builds/${buildId}/logs/stream`)

        eventSource.onopen = () => {
            setIsConnected(true)
            setConnectionError(null)
        }

        eventSource.addEventListener('connected', event => {
            setIsConnected(true)
        })

        eventSource.addEventListener('log', event => {
            try {
                const data = JSON.parse((event as MessageEvent).data)
                const time = new Date(data.timestamp).toLocaleTimeString('en-US', { hour12: false })

                setLogs(prev => [
                    ...prev,
                    {
                        time,
                        message: data.message,
                        type: data.type as 'info' | 'success' | 'error' | 'warn'
                    }
                ])
            } catch (error) {
                console.error('Error parsing log message:', error)
            }
        })

        eventSource.addEventListener('status', event => {
            try {
                const data = JSON.parse((event as MessageEvent).data)

                if (data.status === 'queued') setStatus('queued')
                else if (data.status === 'cloning') setStatus('cloning')
                else if (data.status === 'installing') setStatus('installing')
                else if (data.status === 'building') setStatus('building')
                else if (data.status === 'completed') setStatus('completed')
                else if (data.status === 'failed') setStatus('failed')
                else if (data.status === 'timeout') setStatus('timeout')
                else if (data.status === 'rejected') setStatus('rejected')
            } catch (error) {
                console.error('Error parsing status message:', error)
            }
        })

        eventSource.addEventListener('complete', event => {
            try {
                const data = JSON.parse((event as MessageEvent).data)

                const finalDuration = formatBuildTime(Math.floor((Date.now() - startTimeRef.current) / 1000))

                onBuildStatusChange({
                    id: buildId,
                    status: data.status === 'completed' ? 'completed' : 'failed',
                    branch: 'main',
                    commit: 'latest',
                    startTime: new Date(startTimeRef.current).toISOString(),
                    endTime: new Date().toISOString(),
                    duration: finalDuration
                })

            } catch (error) {
                console.error('Error parsing completion message:', error)
            }
        })

        eventSource.addEventListener('heartbeat', event => {
        })

        eventSource.onerror = error => {
            console.error('❌ SSE error:', error)

            if (isConnected) {
                setIsConnected(false)
                setConnectionError('Connection lost')
            }
        }

        return () => {
            console.log('🧹 Cleaning up SSE connection')
            if (eventSourceRef.current) {
                eventSourceRef.current.close()
                eventSourceRef.current = null
            }
        }
    }, [buildId, onBuildStatusChange, isConnected])

    const formatBuildTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
    }

    const getStatusDisplay = () => {
        switch (status) {
            case 'queued':
                return { icon: Clock, text: 'Queued', color: 'text-blue-500', bgColor: 'bg-blue-500/10' }
            case 'cloning':
                return { icon: GitBranch, text: 'Cloning Repository', color: 'text-blue-500', bgColor: 'bg-blue-500/10' }
            case 'installing':
                return { icon: Package, text: 'Installing Dependencies', color: 'text-blue-500', bgColor: 'bg-blue-500/10' }
            case 'building':
                return { icon: Loader2, text: 'Building Application', color: 'text-orange-500', bgColor: 'bg-orange-500/10' }
            case 'completed':
                return { icon: CheckCircle2, text: 'Build Successful', color: 'text-green-500', bgColor: 'bg-green-500/10' }
            case 'failed':
                return { icon: XCircle, text: 'Build Failed', color: 'text-red-500', bgColor: 'bg-red-500/10' }
            case 'timeout':
                return { icon: XCircle, text: 'Build Timeout', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' }
            case 'rejected':
                return { icon: XCircle, text: 'Build Rejected', color: 'text-red-500', bgColor: 'bg-red-500/10' }
        }
    }

    const statusDisplay = getStatusDisplay()
    const StatusIcon = statusDisplay.icon
    const isBuilding = !['completed', 'failed', 'timeout', 'rejected'].includes(status)

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
                            <h2 className="text-xl font-semibold text-white">{statusDisplay.text}</h2>
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <span>Build time: {formatBuildTime(buildTime)}</span>
                                <span>•</span>
                                <span className="font-mono text-xs">{buildId.slice(0, 8)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Connection Status */}
                        {connectionError ? (
                            <span className="flex items-center gap-2 text-xs text-red-400">
                                <WifiOff size={14} />
                                {connectionError}
                            </span>
                        ) : isConnected ? (
                            <span className="flex items-center gap-2 text-xs text-green-500">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                                Live
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 text-xs text-zinc-500">
                                <Loader2 size={14} className="animate-spin" />
                                Connecting...
                            </span>
                        )}

                        <button onClick={onClose} className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white">
                            <X size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="border-b border-zinc-800 bg-zinc-900/50 p-5">
                <div className="flex items-center justify-between">
                    {(['cloning', 'installing', 'building'] as const).map((step, idx) => {
                        const steps: BuildStatus[] = ['queued', 'cloning', 'installing', 'building', 'completed']
                        const currentStepIndex = steps.indexOf(status)
                        const stepIndex = steps.indexOf(step)

                        const isErrorState = ['failed', 'timeout', 'rejected'].includes(status)

                        const isComplete = !isErrorState && currentStepIndex > stepIndex
                        const isCurrent = !isErrorState && currentStepIndex === stepIndex

                        return (
                            <React.Fragment key={step}>
                                <div className="flex flex-col items-center gap-2">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all duration-300 ${
                                            isErrorState ? 'border-zinc-700 bg-zinc-900 text-zinc-500' : isComplete ? 'border-green-500 bg-green-500/20 text-green-500' : isCurrent ? 'border-orange-500 bg-orange-500/20 text-orange-500' : 'border-zinc-700 bg-zinc-900 text-zinc-500'
                                        }`}
                                    >
                                        {isErrorState ? idx + 1 : isComplete ? <CheckCircle2 size={18} /> : isCurrent ? <Loader2 size={18} className="animate-spin" /> : idx + 1}
                                    </div>
                                    <span className={`text-xs capitalize transition-colors duration-300 ${isCurrent ? 'font-medium text-white' : isComplete ? 'text-zinc-400' : 'text-zinc-500'}`}>{step}</span>
                                </div>
                                {idx < 2 && <div className={`h-0.5 flex-1 transition-all duration-500 ${isErrorState ? 'bg-zinc-800' : isComplete ? 'bg-green-500' : 'bg-zinc-800'}`} />}
                            </React.Fragment>
                        )
                    })}
                </div>
            </div>

            {/* Success Banner */}
            {status === 'completed' && (
                <div className="border-b border-zinc-800 bg-green-500/5 p-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-green-500" size={20} />
                        <div>
                            <div className="text-sm font-semibold text-green-500">Build Successful!</div>
                            <div className="text-sm text-zinc-400">Ready for deployment</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Banner */}
            {(status === 'failed' || status === 'timeout') && (
                <div className="border-b border-zinc-800 bg-red-500/5 p-4">
                    <div className="flex items-center gap-3">
                        <XCircle className="text-red-500" size={20} />
                        <div>
                            <div className="text-sm font-semibold text-red-500">{status === 'timeout' ? 'Build Timeout' : 'Build Failed'}</div>
                            <div className="text-sm text-zinc-400">Check logs below for details</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Logs Terminal - Flexible to fill remaining space */}
            <div className="flex-1 overflow-hidden p-5">
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Terminal size={16} />
                        <span className="font-medium">Build Logs</span>
                        {logs.length > 0 && <span className="text-xs text-zinc-600">({logs.length} entries)</span>}
                    </div>
                </div>
                <div className="h-[calc(100%-2rem)] overflow-y-auto rounded-lg border border-zinc-800 bg-black p-4 font-mono text-xs">
                    {logs.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-zinc-500">
                            <Loader2 size={24} className="mb-3 animate-spin" />
                            <p className="flex items-center gap-2">
                                <Clock size={16} />
                                Waiting for build logs...
                            </p>
                            {!isConnected && <p className="mt-2 text-xs text-zinc-600">Establishing connection to build service...</p>}
                        </div>
                    ) : (
                        <>
                            {logs.map((log, idx) => (
                                <div key={idx} className="mb-1.5 flex gap-3">
                                    <span className="text-zinc-600">[{log.time}]</span>
                                    <span className={log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : log.type === 'warn' ? 'text-yellow-400' : 'text-zinc-300'}>{log.message}</span>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                            {isBuilding && (
                                <div className="mt-3 flex items-center gap-2 text-orange-400">
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-orange-400" />
                                    <span>Processing...</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900/50 p-5">
                <div className="text-sm text-zinc-400">
                    {status === 'failed' && (
                        <span className="flex items-center gap-2 text-red-400">
                            <XCircle size={16} />
                            Build failed. Check logs for details.
                        </span>
                    )}
                    {status === 'timeout' && (
                        <span className="flex items-center gap-2 text-yellow-400">
                            <Clock size={16} />
                            Build exceeded time limit.
                        </span>
                    )}
                    {status === 'rejected' && (
                        <span className="flex items-center gap-2 text-red-400">
                            <XCircle size={16} />
                            Build was rejected (quota exceeded).
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {isBuilding && (
                        <button onClick={onClose} className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
                            Close and Run in Background
                        </button>
                    )}
                    {status === 'completed' && (
                        <button onClick={onClose} className="rounded-lg bg-green-500 px-5 py-2 text-sm font-medium text-white hover:bg-green-600">
                            Done
                        </button>
                    )}
                    {(status === 'failed' || status === 'timeout' || status === 'rejected') && (
                        <button onClick={onClose} className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BuildDialog
