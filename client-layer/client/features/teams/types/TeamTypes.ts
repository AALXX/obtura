export interface TeamData {
    id: string
    name: string
    updated_at: string
    memberCount: number
    is_active: boolean
}

export interface TeamMemberData {
    id: string
    email: string
    name: string
    role: string
    is_you: boolean
    teamname: string
}

export interface TeamCard {
    id: string
    name: string
    description: string
}

export interface InvitationData {
    type: string
    teamId: string
    invitedEmail: string
    invitedBy: string
    role: string
    companyName: string
    iat: number
    exp: number
}