import { useGetUsersQuery } from "./usersApiSlice"
import User from './User'
import DataTable from '../../components/DataTable'
import useSort from '../../hooks/useSort'

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

    const { sortConfig, handleSort, sortData } = useSort('username', 'asc');

    let content

    if (isLoading) content = <p>Loading...</p>

    if (isError) {
        content = <p className="errmsg">{error?.data?.message}</p>
    }

    if (isSuccess) {
        const { ids, entities } = users

        const columns = [
            { key: 'username', label: 'Username', sortable: true },
            { key: 'roles', label: 'Roles' },
            { key: 'edit', label: 'Edit' },
        ]

        const data = sortData(ids, entities);

        const renderRow = (userId) => <User key={userId} userId={userId} />

        content = (
            <DataTable
                columns={columns}
                data={data}
                emptyMsg="No users found."
                renderRow={renderRow}
                sortConfig={sortConfig}
                onSort={handleSort}
                tableClassName="table table--users"
            />
        )
    }

    return content
}
export default UsersList