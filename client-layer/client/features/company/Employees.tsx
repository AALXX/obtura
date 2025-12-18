'use client'
import React, { useState } from 'react'
import { Search, Users, Plus, Mail, Phone, Building2 } from 'lucide-react'
import { EmployeeData } from './types/EmplyeesTypes'
import EmployeeCard from './components/EmplyeeCard'
import DialogCanvas from '@/common-components/DialogCanvas'
import InviteEmployeeDialog from './components/InviteEmployeeDialog'

const Employees: React.FC<{ employeesInitial: EmployeeData[]; accessToken: string }> = ({ employeesInitial, accessToken }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [employees] = useState<EmployeeData[]>(employeesInitial)
    const [showCreateDialog, setShowCreateDialog] = useState(false)

    const filteredEmployees = employees.filter(employee => employee.name.toLowerCase().includes(searchQuery.toLowerCase()) || employee.email.toLowerCase().includes(searchQuery.toLowerCase()) || employee.rolename.toLowerCase().includes(searchQuery.toLowerCase()) || employee.teamname!.toLowerCase().includes(searchQuery.toLowerCase()))

    return (
        <div className="ztext-white min-h-screen">
            <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="mb-2 text-4xl font-bold">Employees</h1>
                        <p className="text-lg text-gray-400">Manage and organize your employees</p>
                    </div>
                    <button onClick={() => setShowCreateDialog(true)} className="flex cursor-pointer items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600">
                        <Plus size={20} />
                        New Employee
                    </button>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute top-1/2 left-4 -translate-y-1/2 transform text-gray-400" size={20} />
                    <input type="text" placeholder="Search employees..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full rounded-lg border border-zinc-800 bg-[#1b1b1b] py-3 pr-4 pl-12 text-white placeholder-gray-500 focus:border-zinc-700 focus:outline-none" />
                </div>

                {showCreateDialog && (
                    <DialogCanvas closeDialog={() => setShowCreateDialog(false)}>
                        <InviteEmployeeDialog accessToken={accessToken} />
                    </DialogCanvas>
                )}

                <div className="space-y-4">
                    {filteredEmployees.map(employee => (
                        <EmployeeCard key={employee.id} {...employee} />
                    ))}

                    {filteredEmployees.length === 0 && (
                        <div className="py-12 text-center text-gray-400">
                            <Users size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No employees found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Employees
