import { useGetUsersQuery } from '../users/usersApiSlice';
import { useDeleteReplyMutation } from './notesApiSlice';
import useAuth from '../../hooks/useAuth';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';

const RepliesList = ({ replies, refetchReplies, highlightReplyId }) => {
  const { data: users } = useGetUsersQuery('usersList');
  const [deleteReply ] = useDeleteReplyMutation()
  const { userId } = useAuth()

  const lastReplyRef = useRef(null);

  useEffect(() => {
    if (highlightReplyId && lastReplyRef.current) {
      lastReplyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightReplyId, replies]);

  const handleDeleteReply = async (replyId) => {
    await deleteReply({ replyId })
    refetchReplies()
  }

  if (!Array.isArray(replies)) {
    return <p>No replies found</p>;
  }

  return (
    <div className="replies-list">
      {replies.map((reply) => (
        <Reply
          key={reply._id}
          reply={reply}
          users={users}
          userId={userId}
          handleDeleteReply={handleDeleteReply}
          refProp={reply._id === highlightReplyId ? lastReplyRef : null}
          highlight={reply._id === highlightReplyId}
        />
      ))}
    </div>
  );
};

const formatTimestamp = (timestamp) => {
  return moment(timestamp).format('MMMM D, YYYY h:mm A');
};

const Reply = ({ reply, users, userId, handleDeleteReply, refProp, highlight }) => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  useEffect(() => {
    if (highlight) {
      setIsHighlighted(true);
      const timeout = setTimeout(() => setIsHighlighted(false), 1200);
      return () => clearTimeout(timeout);
    }
  }, [highlight]);
  return (
    <div className={`reply${isHighlighted ? ' reply--highlight' : ''}`} ref={refProp}>
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