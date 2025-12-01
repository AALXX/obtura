import { auth } from '@/features/account/auth/auth'
import AuthRequired from '@/common-components/AuthRequredForm'
import axios from 'axios'
import { UserResponse } from '@/features/account/types/AccoutTypes'
import UserProjects from '@/features/projects/UserProjects'

const Projects = async () => {
    const session = await auth()

    try {
        if (!session || !session.user) {
            return <AuthRequired featureAccess="account" />
        }

        // const resp = await axios.get<UserResponse>(`${process.env.BACKEND_URL}/account-manager/get-account-projects/${session.backendToken}`)
        // if (resp.status !== 200) {
        //     return <AuthRequired featureAccess="account" />
        // }

        return (
            <div>
                <UserProjects />
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

export default Projects
