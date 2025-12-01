'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAccountStore } from '@/lib/store/accountStore'
import { FolderKanban, Rocket, Users, Menu, X } from 'lucide-react'

const NavBar = () => {
    const { user, authenticated, status, fetchAccount } = useAccountStore()
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        if (status === 'idle') {
            fetchAccount()
        }
    }, [status, fetchAccount])

    const navItems = [
        { href: '/projects', label: 'Projects', icon: FolderKanban },
        { href: '/deployments', label: 'Deployments', icon: Rocket },
        { href: '/team', label: 'Team', icon: Users }
    ]

    return (
        <>
            <nav className="bg-navbar-grey flex h-24 w-full grow-0 items-center  border-b-2 px-4" >
                <div className="z-20 text-white">
                    <h1 className="text-lg font-bold">Obtura</h1>
                </div>

                <div className="hidden gap-1 md:flex ml-12">
                    {navItems.map(item => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link key={item.href} href={item.href} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'}`}>
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        )
                    })}
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    {authenticated ? <>{user?.name ? <h1 className="hidden self-center text-lg font-bold text-white sm:block">{user.name}</h1> : <h1 className="hidden text-lg font-bold text-white sm:block">Loading...</h1>}</> : null}

                    <Link href="/account">{authenticated ? <Image className="z-10 h-12 w-12 rounded-full" src={user?.image || `/no_account_icon.svg`} alt="User Avatar" width={48} height={48} /> : <Image className="z-10 h-12 w-12 rounded-full" src={`/no_account_icon.svg`} alt="User Avatar" width={48} height={48} />}</Link>

                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-md p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white md:hidden">
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {mobileMenuOpen && (
                <div className="bg-navbar-grey border-b-2 md:hidden">
                    <div className="space-y-1 px-4 py-3">
                        {navItems.map(item => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors ${isActive ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'}`}>
                                    <Icon size={20} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </>
    )
}

export default NavBar
