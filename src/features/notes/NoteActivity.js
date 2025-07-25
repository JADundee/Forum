import { useState } from 'react';
import { useGetNotesQuery } from './notesApiSlice';
import DataTable from '../../components/DataTable';
import Note from './Note';

const NoteActivity = ({ userId, username, show }) => {
    // Fetch all notes
    const {
        data: notesData,
        isLoading: notesLoading,
        isError: notesError,
        error: notesErrorObj,
        isSuccess: notesSuccess
    } = useGetNotesQuery('notesList', {
        pollingInterval: 15000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    });

    // State for search in notes table
    const [notesSearch, setNotesSearch] = useState("");

    // Sorting state
    const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', direction: 'desc' });
    const handleSort = (key) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'desc' ? 'asc' : 'desc' };
            } else {
                return { key, direction: 'desc' };
            }
        });
    };

    // DRY sorting utility
    function getSortedData(arr, config, keyMap) {
        return [...arr].sort((a, b) => {
            let valA = keyMap[config.key](a);
            let valB = keyMap[config.key](b);
            if (config.key === 'createdAt' || config.key === 'updatedAt') {
                return config.direction === 'desc' ? valB - valA : valA - valB;
            } else {
                return config.direction === 'desc'
                    ? valB.localeCompare(valA)
                    : valA.localeCompare(valB);
            }
        });
    }

    // For notes sorting and filtering
    let sortedAndFilteredNoteIds = [];
    if (notesSuccess && notesData) {
        sortedAndFilteredNoteIds = notesData.ids
            .filter(noteId => notesData.entities[noteId].username === username)
            .filter(noteId => {
                const note = notesData.entities[noteId];
                const searchLower = notesSearch.toLowerCase();
                return note.title.toLowerCase().includes(searchLower);
            });
        sortedAndFilteredNoteIds = getSortedData(
            sortedAndFilteredNoteIds,
            sortConfig,
            {
                title: id => notesData.entities[id].title.toLowerCase(),
                username: id => notesData.entities[id].username.toLowerCase(),
                createdAt: id => new Date(notesData.entities[id].createdAt),
                updatedAt: id => new Date(notesData.entities[id].updatedAt)
            }
        );
    }

    const notesColumns = [
        { key: 'title', label: 'Title', className: 'table__title', sortable: true },
        { key: 'username', label: 'Owner', className: 'table__username', sortable: true },
        { key: 'createdAt', label: 'Created', className: 'note__created', sortable: true },
        { key: 'updatedAt', label: 'Updated', className: 'note__updated', sortable: true }
    ];

    if (!show) return null;

    return (
        <>
            <div className="all-notifications__header">
                <h1>My Notes</h1>
            </div>
            <div className="notes-filter-bar">
                <input
                    type="text"
                    placeholder="Search by title or owner..."
                    value={notesSearch}
                    onChange={e => setNotesSearch(e.target.value)}
                />
            </div>
            {notesLoading && <p>Loading...</p>}
            {notesError && <p className="errmsg">{notesErrorObj?.data?.message || 'Error loading notes'}</p>}
            {notesSuccess && notesData && (
                <div className="table-scroll-wrapper">
                    <DataTable
                        columns={notesColumns}
                        data={sortedAndFilteredNoteIds}
                        emptyMsg="No notes found"
                        renderRow={noteId => <Note key={noteId} noteId={noteId} />}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                        tableClassName="table"
                        theadClassName="table__thead"
                    />
                </div>
            )}
        </>
    );
};

export default NoteActivity;
