import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const ReplyActivity = ({ userId, token, show }) => {
    const [userReplies, setUserReplies] = useState([]);
    const [repliesLoading, setRepliesLoading] = useState(false);
    const [repliesError, setRepliesError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
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

    // DRY sorting utility
    function getSortedData(arr, config, keyMap) {
        return [...arr].sort((a, b) => {
            let valA = keyMap[config.key](a);
            let valB = keyMap[config.key](b);
            if (config.key === 'createdAt') {
                return config.direction === 'desc' ? valB - valA : valA - valB;
            } else {
                return config.direction === 'desc'
                    ? valB.localeCompare(valA)
                    : valA.localeCompare(valB);
            }
        });
    }

    const sortedReplies = getSortedData(userReplies, sortConfig, {
        noteTitle: r => r.noteTitle.toLowerCase(),
        text: r => r.text.toLowerCase(),
        createdAt: r => new Date(r.createdAt)
    });

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
            {repliesLoading && <p>Loading...</p>}
            {repliesError && <p className="errmsg">{repliesError}</p>}
            {!repliesLoading && !repliesError && (
                <div className="table-scroll-wrapper">
                    <DataTable
                        columns={repliesColumns}
                        data={sortedReplies}
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
