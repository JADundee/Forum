import React from 'react'
import { useGetUsersQuery } from '../users/usersApiSlice';
import { useDeleteReplyMutation, useGetRepliesQuery } from './notesApiSlice';
import useAuth from '../../hooks/useAuth';

const RepliesList = ({ replies }) => {
  const { data: users } = useGetUsersQuery('usersList');
  const [deleteReply, { isLoading }] = useDeleteReplyMutation()
  const { userId } = useAuth()

  const handleDeleteReply = async (replyId) => {
    await deleteReply({ replyId })
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

const Reply = ({ reply, users, userId, handleDeleteReply }) => {
  return (
    <div className="reply">
      <div className="reply-header">
        <span className="username">{users?.entities[reply.user]?.username}</span>
        <span className="timestamp">{reply.createdAt}</span>
        {userId === reply.user && (
          <button
            className="delete-button"
            title="Delete Reply"
            onClick={() => handleDeleteReply(reply.id)}
          >
            Delete
          </button>
        )}
      </div>
      <div className="reply-content">
        <p>{reply.text}</p>
      </div>
    </div>
  );
};

export default RepliesList