import { useState} from 'react';
import DataTable from '../../components/DataTable';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import useSort from '../../hooks/useSort';
import filterAndSort from '../../hooks/useSearch';
import MenuButton from '../../components/MenuButton';
import { useGetRepliesByUserQuery, useDeleteReplyMutation } from '../forums/forumsApiSlice';

const ReplyActivity = ({ userId, show }) => {
    const {
        data: userReplies = { ids: [], entities: {} },
        isLoading: repliesLoading,
        isError: repliesError,
        refetch
    } = useGetRepliesByUserQuery(userId, { skip: !userId });

    const [search, setSearch] = useState("");
    const { sortConfig, handleSort } = useSort('createdAt', 'desc');
    const navigate = useNavigate();
    const [deleteReply] = useDeleteReplyMutation();

    const sortedAndFilteredReplies = filterAndSort.runRepliesById(
        userReplies?.ids || [],
        userReplies?.entities || {},
        search,
        sortConfig
    );

    const repliesColumns = [
        { key: 'forumTitle', label: 'Forum Title', sortable: true },
        { key: 'text', label: 'Reply', sortable: true },
        { key: 'createdAt', label: 'Date', sortable: true },
        { key: 'settings', label: 'Settings' }
    ];

    if (!show) return null;

    const handleDelete = async (replyId) => {
        await deleteReply({ replyId });
        refetch();
    };

    const handleEdit = (reply) => {
        navigate(`/dash/forums/${reply.forum._id}/expand`, {
            state: { replyId: reply._id, editReply: true }
        });
    };

    return (
        <>
            <div className="all-notifications__header">
                <h1>My Replies</h1>
            </div>
            <div className="forums-filter-bar">
                <input
                    type="text"
                    placeholder="Search by forum title or reply text..."
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
                                    onClick={() => navigate(`/dash/forums/${reply.forum._id}/expand`, { state: { replyId: reply._id } })}
                                >
                                    <td className="table__cell">{reply.forumTitle}</td>
                                    <td className="table__cell">{reply.text}</td>
                                    <td className="table__cell">{moment(reply.createdAt).format('MMMM D, YYYY h:mm A')}</td>
                                    <td
                                        className="table__cell"
                                        style={{ position: 'relative' }}
                                        onClick={e => e.stopPropagation()} // <-- Prevents row click when clicking menu
                                    >
                                        <MenuButton
                                          onEdit={() => handleEdit(reply)}
                                          onDelete={() => handleDelete(reply._id)}
                                          variant="profile-activity-menu-button"
                                        />
                                    </td>
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