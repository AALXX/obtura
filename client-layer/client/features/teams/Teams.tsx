'use client'
import React, { useState } from 'react'
import { Search, Users, Plus } from 'lucide-react'

const Teams = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [teams, setTeams] = useState([
        {
            id: 1,
            name: 'S3RBVN Development Team',
            members: 4,
            updatedAt: 'yesterday',
            status: 'Active'
        },
        {
            id: 2,
            name: 'Marketing Team',
            members: 2,
            updatedAt: '5 days ago',
            status: 'Active'
        },
        {
            id: 3,
            name: 'Design Team',
            members: 1,
            updatedAt: '1 months ago',
            status: 'Paused'
        }
    ])

    const filteredTeams = teams.filter(team => team.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const handleNewTeam = () => {
        alert('New Team creation would open here')
    }

    return (
        <div className="container mx-auto  px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="mb-2 text-4xl font-bold">Teams</h1>
                    <p className="text-lg text-gray-400">Manage and organize your teams</p>
                </div>
                <button onClick={handleNewTeam} className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600  cursor-pointer ">
                    <Plus size={20} />
                    New Team
                </button>
            </div>

            <div className="relative mb-6">
                <Search className="absolute top-1/2 left-4 -translate-y-1/2 transform text-gray-400" size={20} />
                <input type="text" placeholder="Search teams..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-3 pr-4 pl-12 text-white placeholder-gray-500 focus:border-zinc-700 focus:outline-none" />
            </div>

            <div className="space-y-4">
                {filteredTeams.map(team => (
                    <div key={team.id} className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-opacity-20 rounded-lg bg-orange-500/10 p-3">
                                    <Users className="text-orange-500" size={24} />
                                </div>

                                <div>
                                    <h3 className="mb-1 text-xl font-semibold">{team.name}</h3>
                                    <p className="text-sm text-gray-400">
                                        {team.members} members · Updated {team.updatedAt}
                                    </p>
                                </div>
                            </div>

                            <span className={`rounded-full px-4 py-1 text-sm font-medium ${team.status === 'Active' ? 'bg-opacity-20 bg-green-500/10 text-green-500' : 'bg-opacity-20 bg-gray-500 text-gray-400'}`}>{team.status}</span>
                        </div>
                    </div>
                ))}

                {filteredTeams.length === 0 && (
                    <div className="py-12 text-center text-gray-400">
                        <Users size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No teams found</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Teams
