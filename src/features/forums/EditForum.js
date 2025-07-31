import { useParams } from 'react-router-dom'
import EditForumForm from './EditForumForm'
import { useGetForumsQuery } from './forumsApiSlice'
import { useGetUsersQuery } from '../users/usersApiSlice'
import useAuth from '../../hooks/useAuth'
import PulseLoader from 'react-spinners/PulseLoader'
import useTitle from '../../hooks/useTitle'

const EditForum = () => {
    useTitle('techForums: Edit Forum')

    const { id } = useParams()

    const { username, isAdmin } = useAuth()

    const { forum } = useGetForumsQuery("forumsList", {
        selectFromResult: ({ data }) => ({
            forum: data?.entities[id]
        }),
    })

    const { users } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            users: data?.ids.map(id => data?.entities[id])
        }),
    })

    if (!forum || !users?.length) return <PulseLoader color={"#FFF"} />


    if ( !isAdmin ) {
        if (forum.username !== username) {
            return <p className="errmsg">No access</p>
        }
    }

    const content = <EditForumForm forum={forum} users={users} />

    return content
}
export default EditForum