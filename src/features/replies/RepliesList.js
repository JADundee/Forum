import { useGetUsersQuery } from '../users/usersApiSlice';
import { useDeleteReplyMutation, useEditReplyMutation, useToggleLikeMutation, useGetLikeCountQuery, useGetUserLikeQuery } from '../forums/forumsApiSlice';
import useAuth from '../../hooks/useAuth';
import moment from 'moment';
import { useEffect, useRef, useState, useCallback } from 'react';
import EditReplyForm from './EditReplyForm';
import MenuButton from '../../components/MenuButton';

const RepliesList = ({ replies, refetchReplies, highlightReplyId, editReplyId }) => {
  const { data: users } = useGetUsersQuery('usersList');
  const [deleteReply ] = useDeleteReplyMutation()
  const [editReply, { isLoading: editLoading }] = useEditReplyMutation();
  const { userId } = useAuth()
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editText, setEditText] = useState('');

  const lastReplyRef = useRef(null);

  const handleDeleteReply = useCallback(async (replyId) => {
    await deleteReply({ replyId })
    refetchReplies()
  }, [deleteReply, refetchReplies]);

  const handleEditClick = (reply) => {
    setEditingReplyId(reply._id);
    setEditText(reply.text);
  };

  const handleEditCancel = () => {
    setEditingReplyId(null);
    setEditText('');
  };

  const handleEditSave = async (replyId, newText) => {
    await editReply({ replyId, replyText: newText });
    setEditingReplyId(null);
    setEditText('');
    refetchReplies();
  };

  useEffect(() => {
    if (highlightReplyId && lastReplyRef.current) {
      lastReplyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightReplyId, replies]);

  useEffect(() => {
    if (editReplyId) {
      setEditingReplyId(editReplyId);
    }
  }, [editReplyId]);

  if (!Array.isArray(replies)) {
    return <p>No replies found</p>;
  }

  return (
    <div className="replies-list">
      {replies.map((reply) => (
        <Reply
          key={reply._id}
          reply={reply}
          username={users?.entities[reply.user]?.username}
          userId={userId}
          handleDeleteReply={handleDeleteReply}
          refProp={reply._id === highlightReplyId ? lastReplyRef : null}
          highlight={reply._id === highlightReplyId}
          isEditing={editingReplyId === reply._id}
          editText={editText}
          setEditText={setEditText}
          onEditClick={() => handleEditClick(reply)}
          onEditCancel={handleEditCancel}
          onEditSave={(newText) => handleEditSave(reply._id, newText)}
          editLoading={editLoading}
        />
      ))}
    </div>
  );
};

function highlightTags(text) {
  return text.split(/(@\w+)/g).map((part, i) => {
    if (/^@\w+$/.test(part)) {
      return <span key={i} className="tagged-username">{part}</span>;
    }
    return part;
  });
}

function formatTimestamp(timestamp) {
  return moment(timestamp).format('MMMM D, YYYY h:mm A');
}

const Reply = ({ reply, username, userId, handleDeleteReply, refProp, highlight, isEditing, editText, setEditText, onEditClick, onEditCancel, onEditSave, editLoading }) => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [toggleLike] = useToggleLikeMutation();
  const { data: likeCountData, refetch: refetchLikeCount } = useGetLikeCountQuery({ targetId: reply._id, targetType: 'reply' });
  const { data: userLikeData, refetch: refetchUserLike } = useGetUserLikeQuery({ targetId: reply._id, targetType: 'reply' });
  const [likeLoading, setLikeLoading] = useState(false);
  const handleLike = async () => {
    setLikeLoading(true);
    try {
      await toggleLike({ targetId: reply._id, targetType: 'reply' }).unwrap();
      refetchLikeCount();
      refetchUserLike();
    } finally {
      setLikeLoading(false);
    }
  };
  const hasLiked = userLikeData?.liked;
  const likeCount = likeCountData?.count || 0;
  useEffect(() => {
    if (highlight) {
      setIsHighlighted(true);
      const timeout = setTimeout(() => setIsHighlighted(false), 1200);
      return () => clearTimeout(timeout);
    }
  }, [highlight]);
  const wasEdited = reply.updatedAt && reply.updatedAt !== reply.createdAt;
  return (
    <div className={`reply${isHighlighted ? ' reply--highlight' : ''}`} ref={refProp}>
      <div className="reply-header">
        <span className="username">{username}
          <span className='username-text'> Replied:</span>
        </span>
        {userId === reply.user && !isEditing && (
          <MenuButton
            onEdit={onEditClick}
            onDelete={() => handleDeleteReply(reply._id)}
          />
        )}
      </div>
      <div className="reply-content">
        {isEditing ? (
          <EditReplyForm
            initialText={reply.text}
            onSave={onEditSave}
            onCancel={onEditCancel}
            loading={editLoading}
          />
        ) : (
          <p>{highlightTags(reply.text)}</p>
        )}
      </div>
        <div className="like-button-container">
          <button
            className={`like-button${hasLiked ? ' liked' : ''}`}
            onClick={handleLike}
            disabled={likeLoading}
            aria-pressed={hasLiked}
            title={`${likeCount} like${likeCount !== 1 ? 's' : ''}`}
          >
            {hasLiked ? '♥' : '♡'}
          </button>
          <span className="like-count">{likeCount} like{likeCount !== 1 ? 's' : ''}</span>
        </div>
      <span className="timestamp">
        Replied on {formatTimestamp(reply.createdAt)}
        {wasEdited && (
          <span> (edited on {formatTimestamp(reply.updatedAt)})</span>
        )}
      </span>
    </div>
  );
};

export default RepliesList