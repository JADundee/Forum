import { useState } from 'react';
import { useGetNotesQuery } from './notesApiSlice';
import DataTable from '../../components/DataTable';
import Note from './Note';
import filterAndSort from '../../hooks/useSearch';

const NoteActivity = ({ userId, username, show }) => {
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

    const [notesSearch, setNotesSearch] = useState("");
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

    let sortedAndFilteredNoteIds = [];
    if (notesSuccess && notesData) {
        sortedAndFilteredNoteIds = filterAndSort.run(
            notesData.ids,
            notesData.entities,
            notesSearch,
            sortConfig,
            username
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
