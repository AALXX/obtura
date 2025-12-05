'use client'
import React, { useState } from 'react'
import { UserPlus, Search, ArrowLeft, Edit2, Users, MoreHorizontal, MoreVertical } from 'lucide-react'
import DialogCanvas from '@/common-components/DialogCanvas'
import InviteMemberDialog from './components/InviteMembersDialog'

const TeamDetails = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [teamName, setTeamName] = useState('S3RBVN Development Team')
    const [isEditingName, setIsEditingName] = useState(false)
    const [showInviteMembersDialog, setShowInviteMembersDialog] = useState(false)

    const teamMembers = [
        {
            id: 1,
            name: 'Serban Alexandru',
            email: 's3rbmedia@gmail.com',
            initials: 'SA',
            role: 'Team Leader',
            isYou: true
        },
        {
            id: 2,
            name: 'Maria Popescu',
            email: 'maria.popescu@company.com',
            initials: 'MP',
            role: 'Member',
            isYou: false
        },
        {
            id: 3,
            name: 'Ion Gheorghe',
            email: 'ion.gheorghe@company.com',
            initials: 'IG',
            role: 'Member',
            isYou: false
        },
        {
            id: 4,
            name: 'Elena Ionescu',
            email: 'elena.ionescu@company.com',
            initials: 'EI',
            role: 'Member',
            isYou: false
        }
    ]

    const filteredMembers = teamMembers.filter(member => member.name.toLowerCase().includes(searchQuery.toLowerCase()) || member.email.toLowerCase().includes(searchQuery.toLowerCase()))

    const teamLeaders = teamMembers.filter(m => m.role === 'Team Leader').length
    const regularMembers = teamMembers.filter(m => m.role === 'Member').length

    return (
        <div className="min-h-screen p-8 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button className="mb-6 flex items-center text-gray-400 transition-colors hover:text-white">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        All Teams
                    </button>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {isEditingName ? (
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={e => setTeamName(e.target.value)}
                                    onBlur={() => setIsEditingName(false)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            setIsEditingName(false)
                                        }
                                    }}
                                    autoFocus
                                    className="rounded-lg border border-zinc-700 bg-[#1b1b1b] px-3 py-1 text-3xl font-bold transition-colors focus:border-orange-500 focus:outline-none"
                                />
                            ) : (
                                <h1 className="text-3xl font-bold">{teamName}</h1>
                            )}
                            <button onClick={() => setIsEditingName(true)} className="text-gray-400 transition-colors hover:text-white">
                                <Edit2 className="h-5 w-5" />
                            </button>
                        </div>
                        <button className="flex cursor-pointer items-center gap-2 rounded-lg bg-orange-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-orange-600" onClick={() => setShowInviteMembersDialog(true)}>
                            <UserPlus className="h-4 w-4" />
                            Add Member
                        </button>
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-sm">
                        <div className="flex items-center text-gray-400">
                            <Users className="mr-2 h-4 w-4" />4 members
                        </div>
                        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">Active</span>
                    </div>
                </div>

                {showInviteMembersDialog && (
                    <DialogCanvas closeDialog={() => setShowInviteMembersDialog(false)}>
                        <InviteMemberDialog />
                    </DialogCanvas>
                )}

                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-500" />
                        <input type="text" placeholder="Search members..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full rounded-lg border border-zinc-800 bg-[#1b1b1b] py-3 pr-4 pl-12 text-white placeholder-gray-500 transition-colors focus:border-zinc-700 focus:outline-none" />
                    </div>
                </div>

                <div className="mb-8 space-y-4">
                    {filteredMembers.map(member => (
                        <div key={member.id} className="flex items-center rounded-lg border border-zinc-800 bg-[#1b1b1b] p-6 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-sm font-semibold text-orange-500">{member.initials}</div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-white">{member.name}</h3>
                                        {member.isYou && <span className="text-sm text-gray-500">(you)</span>}
                                    </div>
                                    <p className="text-sm text-gray-400">{member.email}</p>
                                </div>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                {member.role === 'Team Leader' ? <span className="rounded-lg bg-orange-500 px-4 py-1.5 text-sm font-medium text-white">Team Leader</span> : <span className="rounded-lg bg-zinc-800 px-4 py-1.5 text-sm text-gray-400">Member</span>}
                                <MoreVertical className="h-5 w-5 text-gray-400 transition-colors hover:text-white cursor-pointer" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="rounded-lg border border-zinc-800 bg-[#1b1b1b] p-8">
                    <div className="grid grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="mb-2 text-3xl font-bold text-white">{teamMembers.length}</div>
                            <div className="text-sm text-gray-400">Total Members</div>
                        </div>
                        <div className="text-center">
                            <div className="mb-2 text-3xl font-bold text-orange-500">{teamLeaders}</div>
                            <div className="text-sm text-gray-400">Team Leaders</div>
                        </div>
                        <div className="text-center">
                            <div className="mb-2 text-3xl font-bold text-white">{regularMembers}</div>
                            <div className="text-sm text-gray-400">Members</div>
                        </div>
                        <div className="text-center">
                            <div className="mb-2 text-3xl font-bold text-green-500">Active</div>
                            <div className="text-sm text-gray-400">Team Status</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TeamDetails
