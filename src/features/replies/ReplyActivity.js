import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import useSort from '../../hooks/useSort';

const ReplyActivity = ({ userId, token, show }) => {
    const [userReplies, setUserReplies] = useState({ ids: [], entities: {} });
    const [repliesLoading, setRepliesLoading] = useState(false);
    const [repliesError, setRepliesError] = useState(null);
    const [search, setSearch] = useState("");
    const { sortConfig, handleSort, sortData } = useSort('createdAt', 'desc');
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
                    const ids = Array.isArray(replies) ? replies.map(r => r._id) : [];
                    const entities = {};
                    if (Array.isArray(replies)) {
                        replies.forEach(r => { entities[r._id] = r; });
                    }
                    setUserReplies({ ids, entities });
                } catch (err) {
                    setRepliesError('Failed to load replies');
                } finally {
                    setRepliesLoading(false);
                }
            }
        };
        fetchUserReplies();
    }, [userId, token]);

    const sortedAndFilteredReplies = (() => {
        const { ids, entities } = userReplies;
        let filteredIds = ids.filter(id => {
            const reply = entities[id];
            return (
                reply.noteTitle.toLowerCase().includes(search.toLowerCase()) ||
                reply.text.toLowerCase().includes(search.toLowerCase())
            );
        });
        return sortData(filteredIds, entities);
    })();

    const repliesColumns = [
        { key: 'noteTitle', label: 'Note Title', sortable: true },
        { key: 'text', label: 'Reply', sortable: true },
        { key: 'createdAt', label: 'Date', sortable: true }
    ];

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
                        renderRow={replyId => {
                            const reply = userReplies.entities[replyId];
                            return (
                                <tr 
                                    key={reply._id} 
                                    className="table__row"
                                    onClick={() => navigate(`/dash/notes/${reply.note._id}/expand`, { state: { replyId: reply._id } })}
                                >
                                    <td className="table__cell">{reply.noteTitle}</td>
                                    <td className="table__cell">{reply.text}</td>
                                    <td className="table__cell">{moment(reply.createdAt).format('MMMM D, YYYY h:mm A')}</td>
                                </tr>
                            );
                        }}
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
