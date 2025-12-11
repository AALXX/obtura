import { auth } from '@/features/account/auth/auth'
import AuthRequired from '@/common-components/AuthRequredForm'
import axios from 'axios'
import CompanyRequired from '@/common-components/CompayRequired'
import { TeamData, TeamMemberData } from '@/features/teams/types/TeamTypes'
import TeamDetails from '@/features/teams/TeamDetails'

const getCompanyTeamData = async ({ accessToken, teamId }: { accessToken: string; teamId: string }): Promise<{ members: TeamMemberData[] }> => {
    try {
        const response = await axios.get<{ members: TeamMemberData[] }>(`${process.env.BACKEND_URL}/teams-manager/get-team-data/${accessToken}/${teamId}`)

        if (response.status === 401) {
            throw new Error('Unauthorized')
        }

        return response.data
    } catch (error) {
        console.error('Error getting company teams:', error)
        throw error
    }
}

const TeamDetailsPage: React.FC<{ params: { TeamId: string } }> = async ({ params }) => {
    const session = await auth()
    const { TeamId } = await params

    try {
        if (!session || !session.user) {
            return <AuthRequired featureAccess="projects" />
        }
        const response = await axios.get<{ hasCompany: boolean }>(`${process.env.BACKEND_URL}/account-manager/check-company-status/${session.backendToken}`)

        const teamData = await getCompanyTeamData({ accessToken: session.backendToken!, teamId: TeamId })
        console.log(teamData)
        if (!response.data.hasCompany) {
            return <CompanyRequired featureAccess="projects" />
        }

        return (
            <div>
                <TeamDetails members={teamData.members} accessToken={session.backendToken!} teamId={TeamId} teamName={teamData.members[0].teamname} />
            </div>
        )
    } catch (error) {
        return (
            <div>
                <h1>Something went wrong</h1>
            </div>
        )
    }
}

export default TeamDetailsPage
