import { useGetUsersQuery } from "./usersApiSlice"
import User from './User'
import DataTable from '../../components/DataTable'

const UsersList = () => {

    const {
        data: users,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetUsersQuery('usersList', {
        pollingInterval: 60000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    let content

    if (isLoading) content = <p>Loading...</p>

    if (isError) {
        content = <p className="errmsg">{error?.data?.message}</p>
    }

    if (isSuccess) {
        const { ids } = users

        // Define columns to match the current table
        const columns = [
            { key: 'username', label: 'Username' },
            { key: 'roles', label: 'Roles' },
            { key: 'edit', label: 'Edit' },
        ]

        // Data is just the array of user IDs
        const data = ids || []

        // Render row using the existing User component
        const renderRow = (userId) => <User key={userId} userId={userId} />

        content = (
            <DataTable
                columns={columns}
                data={data}
                emptyMsg="No users found."
                renderRow={renderRow}
                // Pass the same className for styling
                tableClassName="table table--users"
            />
        )
    }

    return content
}
export default UsersList