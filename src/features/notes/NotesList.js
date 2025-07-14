import { useGetNotesQuery } from "./notesApiSlice"
import Note from "./Note"
import { useState } from "react"
import useAuth from '../../hooks/useAuth'
import DataTable from '../../components/DataTable'

const NotesList = () => {
    // Add state for search query
    const [search, setSearch] = useState("");
    // Add state for sorting
    const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', direction: 'desc' });
    // Add state for filtering by current user
    const [showMine, setShowMine] = useState(false);
    // Get current user
    const { username } = useAuth();

    const {
        data: notes,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetNotesQuery('notesList', {
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
        const { ids, entities } = notes

        let filteredIds = ids.filter(noteId => entities[noteId].username)
        
        // Filter by current user if showMine is true
        if (showMine && username) {
            filteredIds = filteredIds.filter(noteId => entities[noteId].username === username);
        }
        
        // Filter by search query (case-insensitive, by title or owner)
        const searchLower = search.toLowerCase();
        filteredIds = filteredIds.filter(noteId => {
            const note = entities[noteId];
            return (
                note.title.toLowerCase().includes(searchLower) ||
                note.username.toLowerCase().includes(searchLower)
            );
        });
        
        // Sorting logic
        filteredIds.sort((a, b) => {
            const noteA = entities[a];
            const noteB = entities[b];
            let valA, valB;
            if (sortConfig.key === 'createdAt') {
                valA = new Date(noteA.createdAt);
                valB = new Date(noteB.createdAt);
            } else if (sortConfig.key === 'updatedAt') {
                valA = new Date(noteA.updatedAt);
                valB = new Date(noteB.updatedAt);
            } else if (sortConfig.key === 'title') {
                valA = noteA.title.toLowerCase();
                valB = noteB.title.toLowerCase();
            } else if (sortConfig.key === 'username') {
                valA = noteA.username.toLowerCase();
                valB = noteB.username.toLowerCase();
            }
            if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
                if (sortConfig.direction === 'desc') {
                    return valB - valA;
                } else {
                    return valA - valB;
                }
            } else {
                if (sortConfig.direction === 'desc') {
                    return valB.localeCompare(valA);
                } else {
                    return valA.localeCompare(valB);
                }
            }
        });

        // Sorting header click handlers
        const handleSort = (key) => {
            setSortConfig(prev => {
                if (prev.key === key) {
                    // Toggle direction
                    return { key, direction: prev.direction === 'desc' ? 'asc' : 'desc' };
                } else {
                    // New sort key, default to descending
                    return { key, direction: 'desc' };
                }
            });
        };

        // Define columns for DataTable
        const columns = [
            { key: 'title', label: 'Title', sortable: true },
            { key: 'username', label: 'Owner', sortable: true },
            { key: 'createdAt', label: 'Created', sortable: true },
            { key: 'updatedAt', label: 'Updated', sortable: true },
        ];

        // Render row using the existing Note component
        const renderRow = (noteId) => <Note key={noteId} noteId={noteId} />

        content = (
            <>
                <div className="notes-filter-bar">
                    <input
                        type="text"
                        placeholder="Search by title or owner..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button
                        className="button"
                        style={{ backgroundColor: showMine ? '#236323' : undefined }}
                        onClick={() => setShowMine(m => !m)}
                    >
                        {showMine ? 'Show All Notes' : 'Show My Notes'}
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
export default NotesList