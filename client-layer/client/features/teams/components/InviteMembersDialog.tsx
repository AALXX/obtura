import React, { useState } from 'react'
import { Mail, X, UserPlus, Loader2, Shield, User } from 'lucide-react'
import axios from 'axios'

interface InviteMember {
    email: string
    role: 'owner' | 'member'
    id: string
}

const InviteMemberDialog: React.FC<{ accessToken: string; teamId: string }> = ({ accessToken, teamId }) => {
    const [emails, setEmails] = useState<InviteMember[]>([])
    const [currentEmail, setCurrentEmail] = useState('')
    const [currentRole, setCurrentRole] = useState<'owner' | 'member'>('member')
    const [emailError, setEmailError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const handleAddEmail = () => {
        setEmailError('')
        setSuccessMessage('')

        if (!currentEmail.trim()) {
            setEmailError('Please enter an email address')
            return
        }

        if (!validateEmail(currentEmail)) {
            setEmailError('Please enter a valid email address')
            return
        }

        if (emails.some(e => e.email.toLowerCase() === currentEmail.toLowerCase())) {
            setEmailError('This email has already been added')
            return
        }

        setEmails([...emails, { email: currentEmail, role: currentRole, id: Date.now().toString() }])
        setCurrentEmail('')
        setCurrentRole('member')
    }

    const handleRemoveEmail = (id: string) => {
        setEmails(emails.filter(e => e.id !== id))
        setSuccessMessage('')
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddEmail()
        }
    }

    const handleSendInvitations = async () => {
        if (emails.length === 0) {
            setEmailError('Please add at least one email address')
            return
        }

        setIsLoading(true)
        setSuccessMessage('')

        try {
            const resp = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/teams-manager/invite-members`, {
                accessToken: accessToken,
                teamId: teamId,
                invitations: emails.map(e => ({
                    email: e.email,
                    role: e.role
                }))
            })

            if (resp.status !== 200) {
                setEmailError('Something went wrong while sending invitations')
                setIsLoading(false)
                return
            }

            setIsLoading(false)
            setSuccessMessage(`Invitation${emails.length > 1 ? 's' : ''} sent successfully to ${emails.length} member${emails.length > 1 ? 's' : ''}!`)

            setTimeout(() => {
                setEmails([])
                setSuccessMessage('')
            }, 2000)
        } catch (error) {
            setEmailError('Failed to send invitations. Please try again.')
            setIsLoading(false)
        }
    }

    return (
        <div className="flex h-full w-full flex-col">
            <div className="pb-4">
                <div className="flex items-center gap-2 text-2xl font-bold text-white">
                    <UserPlus className="h-6 w-6" />
                    Invite Team Members
                </div>
                <p className="text-gray-300">Send invitations to join your team</p>
            </div>

            <div className="my-4 h-px w-full border-b border-neutral-800" />

            <div className="flex-1 space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="mb-2 block text-white">Email Address</label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="email"
                                placeholder="colleague@company.com"
                                value={currentEmail}
                                onChange={e => {
                                    setCurrentEmail(e.target.value)
                                    setEmailError('')
                                }}
                                onKeyPress={handleKeyPress}
                                className="w-full rounded-md bg-[#0a0a0a] py-2 pr-3 pl-10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-white">Role</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setCurrentRole('member')} className={`flex items-center gap-3 rounded-md border p-4 transition-all ${currentRole === 'member' ? 'border-orange-500 bg-orange-500/10' : 'border-neutral-800 bg-[#0a0a0a] hover:border-neutral-700'}`}>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${currentRole === 'member' ? 'bg-orange-500/20' : 'bg-neutral-800'}`}>
                                    <User className={currentRole === 'member' ? 'text-orange-500' : 'text-gray-400'} size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-white">Member</p>
                                    <p className="text-xs text-gray-400">Standard access</p>
                                </div>
                            </button>

                            <button onClick={() => setCurrentRole('owner')} className={`flex items-center gap-3 rounded-md border p-4 transition-all ${currentRole === 'owner' ? 'border-orange-500 bg-orange-500/10' : 'border-neutral-800 bg-[#0a0a0a] hover:border-neutral-700'}`}>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${currentRole === 'owner' ? 'bg-orange-500/20' : 'bg-neutral-800'}`}>
                                    <Shield className={currentRole === 'owner' ? 'text-orange-500' : 'text-gray-400'} size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-white">Team Leader</p>
                                    <p className="text-xs text-gray-400">Full access</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <button onClick={handleAddEmail} className="w-full cursor-pointer rounded-md border border-white px-6 py-2 text-white transition-colors hover:bg-[#ffffff1a]">
                        Add Member
                    </button>

                    {emailError && <p className="text-sm text-red-400">{emailError}</p>}
                </div>

                {emails.length > 0 && (
                    <div className="flex-1">
                        <div className="mb-3">
                            <p className="text-white">
                                {emails.length} member{emails.length > 1 ? 's' : ''} to invite
                            </p>
                        </div>
                        <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-md bg-[#0a0a0a] p-4">
                            {emails.map(member => (
                                <div key={member.id} className="flex items-center justify-between rounded-md border border-neutral-800 bg-[#1b1b1b] p-3 transition-colors hover:border-neutral-700">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${member.role === 'owner' ? 'bg-orange-500/10' : 'bg-blue-500/10'}`}>{member.role === 'owner' ? <Shield className="text-orange-500" size={16} /> : <User className="text-blue-500" size={16} />}</div>
                                        <div>
                                            <p className="text-white">{member.email}</p>
                                            <p className="text-xs text-gray-400">{member.role === 'owner' ? 'Team Leader' : 'Member'}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveEmail(member.id)} className="rounded p-1 text-gray-400 transition-colors hover:bg-neutral-800 hover:text-white">
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {successMessage && (
                    <div className="rounded-md border border-green-500/20 bg-green-500/10 p-3">
                        <p className="text-sm text-green-400">{successMessage}</p>
                    </div>
                )}
            </div>

            <div className="mt-auto space-y-4 pt-6">
                <div className="my-4 h-px w-full border-b border-neutral-800" />

                <div className="flex justify-end gap-3">
                    <button
                        className="cursor-pointer rounded-md border border-white px-6 py-2 text-white transition-colors hover:bg-[#ffffff1a]"
                        onClick={() => {
                            setEmails([])
                            setCurrentEmail('')
                            setCurrentRole('member')
                            setEmailError('')
                            setSuccessMessage('')
                        }}
                    >
                        Cancel
                    </button>
                    <button onClick={handleSendInvitations} disabled={isLoading || emails.length === 0} className="flex cursor-pointer items-center gap-2 rounded-md bg-orange-500 px-6 py-2 text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70">
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Mail size={18} />
                                Send Invitation{emails.length > 1 ? 's' : ''}
                            </>
                        )}
                    </button>
                </div>

                <div className="rounded-md bg-[#0a0a0a] p-4">
                    <p className="text-sm text-gray-400">
                        <span className="font-medium text-white">Note:</span> Invited members will receive an email with instructions to join your team. Invitations expire after 7 days.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default InviteMemberDialog
