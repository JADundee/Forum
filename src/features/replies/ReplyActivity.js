import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import filterAndSort from '../../hooks/useSearch';

const ReplyActivity = ({ userId, token, show }) => {
    const [userReplies, setUserReplies] = useState([]);
    const [repliesLoading, setRepliesLoading] = useState(false);
    const [repliesError, setRepliesError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserReplies = async () => {
            if (userId && token) {
                setRepliesLoading(true);
                setRepliesError(null);
                try {
                    const res = await fetch(`http://localhost:3500/notes/replies-by-user?userId=${userId}`,
                        { headers: { 'Authorization': `Bearer ${token}` } });
                    if (!res.ok) throw new Error('Failed to fetch');
                    const replies = await res.json();
                    setUserReplies(replies);
                } catch (err) {
                    setRepliesError('Failed to load replies');
                } finally {
                    setRepliesLoading(false);
                }
            }
        };
        fetchUserReplies();
    }, [userId, token]);

    const sortedAndFilteredReplies = filterAndSort.runReplies(userReplies, search, sortConfig);

    const repliesColumns = [
        { key: 'noteTitle', label: 'Note Title', sortable: true },
        { key: 'text', label: 'Reply', sortable: true },
        { key: 'createdAt', label: 'Date', sortable: true }
    ];

    const handleSort = (key) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'desc' ? 'asc' : 'desc' };
            } else {
                return { key, direction: 'desc' };
            }
        });
    };

    if (!show) return null;

    return (
        <>
            <div className="all-notifications__header">
                <h1>My Replies</h1>
            </div>
            <div className="notes-filter-bar">
                <input
                    type="text"
                    placeholder="Search by note title or reply text..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            {repliesLoading && <p>Loading...</p>}
            {repliesError && <p className="errmsg">{repliesError}</p>}
            {!repliesLoading && !repliesError && (
                <div className="table-scroll-wrapper">
                    <DataTable
                        columns={repliesColumns}
                        data={sortedAndFilteredReplies}
                        emptyMsg="No replies found"
                        renderRow={reply => (
                            <tr 
                                key={reply._id} 
                                className="table__row"
                                onClick={() => navigate(`/dash/notes/${reply.note._id}/expand`, { state: { replyId: reply._id } })}
                            >
                                <td className="table__cell">{reply.noteTitle}</td>
                                <td className="table__cell">{reply.text}</td>
                                <td className="table__cell">{moment(reply.createdAt).format('MMMM D, YYYY h:mm A')}</td>
                            </tr>
                        )}
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

export default ReplyActivity;
