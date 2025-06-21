import { useGetUsersQuery } from '../users/usersApiSlice';
import { useDeleteReplyMutation } from './notesApiSlice';
import useAuth from '../../hooks/useAuth';
import moment from 'moment';

const RepliesList = ({ replies, refetchReplies }) => {
  const { data: users } = useGetUsersQuery('usersList');
  const [deleteReply ] = useDeleteReplyMutation()
  const { userId } = useAuth()

  const handleDeleteReply = async (replyId) => {
    await deleteReply({ replyId })
    refetchReplies()
  }

    if (!Array.isArray(replies)) {
    return <p>No replies found</p>;
  }

  return (
    <div className="replies-list">
      {replies.map((reply, index) => (
        <Reply key={index} reply={reply} users={users} userId={userId} handleDeleteReply={handleDeleteReply} />
      ))}
    </div>
  );
};

const formatTimestamp = (timestamp) => {
  return moment(timestamp).format('MMMM D, YYYY h:mm A');
};

const Reply = ({ reply, users, userId, handleDeleteReply }) => {
  return (
    <div className="reply">
      <div className="reply-header">
        <span className="username">{users?.entities[reply.user]?.username}
          <span className='username-text'> Replied:</span>
        </span>
        {userId === reply.user && (
          <button
            className="delete-button"
            title="Delete Reply"
            onClick={() => handleDeleteReply(reply._id)}
          >
            Delete
          </button>
        )}
      </div>
      <div className="reply-content">
        <p>{reply.text}</p>
      </div>
        <span className="timestamp">Replied on {formatTimestamp(reply.createdAt)}</span>
    </div>
  );
};

export default RepliesList