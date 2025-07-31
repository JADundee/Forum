import { useGetForumsQuery } from "./forumsApiSlice"
import Forum from "./Forum"
import { useState } from "react"
import useAuth from '../../hooks/useAuth'
import DataTable from '../../components/DataTable'
import useSort from '../../hooks/useSort'

const ForumsList = () => {
    const [search, setSearch] = useState("");
    const [showMine, setShowMine] = useState(false);
    const { username } = useAuth();
    const { sortConfig, handleSort, sortData } = useSort('updatedAt', 'desc');

    const {
        data: forums,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetForumsQuery('forumsList', {
        pollingInterval: 15000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    let content

    if (isLoading) content = <p>Loading...</p>

    if (isError) {
        content = <p className="errmsg">{error?.data?.message}</p>
    }

    if (isSuccess) {
        const { ids, entities } = forums
        // Filter first, then sort
        let filteredIds = ids.filter(id => {
            const forum = entities[id];
            const matchesSearch = forum.title.toLowerCase().includes(search.toLowerCase()) ||
                                  forum.username.toLowerCase().includes(search.toLowerCase());
            const matchesMine = !showMine || (username && forum.username === username);
            return matchesSearch && matchesMine;
        });
        filteredIds = sortData(filteredIds, entities);

        const columns = [
            { key: 'title', label: 'Title', sortable: true },
            { key: 'username', label: 'Owner', sortable: true },
            { key: 'createdAt', label: 'Created', sortable: true },
            { key: 'updatedAt', label: 'Updated', sortable: true },
        ];

        const renderRow = (forumId) => <Forum key={forumId} forumId={forumId} />

        content = (
            <>
                <div className="search-filter">
                    <input
                        type="text"
                        placeholder="Search by title or owner..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="table__search"
                    />
                    <button
                        className="button"
                        style={{ backgroundColor: showMine ? '#236323' : undefined }}
                        onClick={() => setShowMine(m => !m)}
                    >
                        {showMine ? 'Show All Forums' : 'Show My Forums'}
                    </button>
                </div>
                <div className="table-scroll-wrapper">
                    <DataTable
                        columns={columns}
                        data={filteredIds}
                        emptyMsg="0 Search results"
                        renderRow={renderRow}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                        tableClassName="table"
                    />
                </div>
            </>
        )
    }

    return content
}
export default ForumsList