'use client'
import React, { useState } from 'react'
import { UserPlus, Search, ArrowLeft, Edit2, Users, MoreHorizontal, MoreVertical } from 'lucide-react'
import DialogCanvas from '@/common-components/DialogCanvas'
import InviteMemberDialog from './components/InviteMembersDialog'
import { TeamMemberData } from './types/TeamTypes'
import MemberActionMenu from './components/TeammembersMenu'
import Link from 'next/link'
import axios from 'axios'

const TeamDetails: React.FC<{ members: TeamMemberData[]; teamId: string; teamName: string; accessToken: string }> = ({ members: initialMembers, teamId, teamName: initialTeamName, accessToken }) => {
    const [members, setMembers] = useState<TeamMemberData[]>(initialMembers)
    const [searchQuery, setSearchQuery] = useState('')
    const [teamName, setTeamName] = useState(initialTeamName)
    const [isEditingName, setIsEditingName] = useState(false)
    const [showInviteMembersDialog, setShowInviteMembersDialog] = useState(false)

    // Check if current user is a team leader
    const currentUser = members.find(m => m.is_you)
    const isTeamLeader = currentUser?.role === 'owner'

    const getInitials = (name: string): string => {
        const nameParts = name.trim().split(' ')
        if (nameParts.length === 1) {
            return nameParts[0].charAt(0).toUpperCase()
        }
        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
    }

    const handleRemoveMember = async (memberId: string) => {
        const resp = await axios.request({
            method: 'DELETE',
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/teams-manager/remove-member`,
            data: {
                accessToken: accessToken,
                teamId: teamId,
                userId: memberId
            }
        })

        if (resp.status !== 200) {
            window.alert('Failed to remove member')
            return
        }
        setMembers(members.filter(m => m.id !== memberId))
    }

    const handlePromoteMember = async (memberId: string) => {
        const resp = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/teams-manager/promote-member`, {
            accessToken: accessToken,
            teamId: teamId,
            userId: memberId,
            role: 'owner'
        })

        if (resp.status !== 200) {
            window.alert('Failed to promote member')
            return
        }

        setMembers(members.map(m => (m.id === memberId ? { ...m, role: 'owner' } : m)))
    }

    const handleDemoteMember = async (memberId: string) => {
        const resp = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/teams-manager/promote-member`, {
            accessToken: accessToken,
            teamId: teamId,
            userId: memberId,
            role: 'member'
        })

        if (resp.status !== 200) {
            window.alert('Failed to promote member')
            return
        }
        setMembers(members.map(m => (m.id === memberId ? { ...m, role: 'Member' } : m)))
    }

    const filteredMembers = members.filter(member => member.name.toLowerCase().includes(searchQuery.toLowerCase()) || member.email.toLowerCase().includes(searchQuery.toLowerCase()))

    const teamLeaders = members.filter(m => m.role === 'owner').length
    const regularMembers = members.filter(m => m.role === 'member').length

    return (
        <div className="min-h-screen p-8 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/team" className="mb-6 flex cursor-pointer items-center text-gray-400 transition-colors hover:text-white">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        All Teams
                    </Link>

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
                            {isTeamLeader && (
                                <button onClick={() => setIsEditingName(true)} className="text-gray-400 transition-colors hover:text-white">
                                    <Edit2 className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                        {isTeamLeader && (
                            <button className="flex cursor-pointer items-center gap-2 rounded-lg bg-orange-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-orange-600" onClick={() => setShowInviteMembersDialog(true)}>
                                <UserPlus className="h-4 w-4" />
                                Add Member
                            </button>
                        )}
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-sm">
                        <div className="flex items-center text-gray-400">
                            <Users className="mr-2 h-4 w-4" />
                            {members.length} members
                        </div>
                        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">Active</span>
                    </div>
                </div>

                {showInviteMembersDialog && (
                    <DialogCanvas closeDialog={() => setShowInviteMembersDialog(false)}>
                        <InviteMemberDialog accessToken={accessToken} teamId={teamId} />
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
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-sm font-semibold text-orange-500">{getInitials(member.name)}</div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-white">{member.name}</h3>
                                        {member.is_you && <span className="text-sm text-gray-500">(you)</span>}
                                    </div>
                                    <p className="text-sm text-gray-400">{member.email}</p>
                                </div>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                {member.role === 'owner' ? <span className="rounded-lg bg-orange-500 px-4 py-1.5 text-sm font-medium text-white">Team Leader</span> : <span className="rounded-lg bg-zinc-800 px-4 py-1.5 text-sm text-gray-400">Member</span>}
                                {!member.is_you && isTeamLeader && <MemberActionMenu member={member} onRemove={handleRemoveMember} onPromote={handlePromoteMember} onDemote={handleDemoteMember} />}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="rounded-lg border border-zinc-800 bg-[#1b1b1b] p-8">
                    <div className="grid grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="mb-2 text-3xl font-bold text-white">{members.length}</div>
                            <div className="text-sm text-gray-400">Total Teammates</div>
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
