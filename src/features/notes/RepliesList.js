import React from 'react'
import { useGetUsersQuery } from '../users/usersApiSlice';

const RepliesList = ({ replies }) => {
  const { data: users } = useGetUsersQuery('usersList');

  const getUserUsername = (userId) => {
    const user = users?.entities[userId];
    return user?.username;
  };

  if (Array.isArray(replies)) {
    const content = (
      <div className="replies-list">
        {replies.map((reply, index) => (
          <div key={index} className="reply">
            <div className="reply-header">
              <span className="username">{getUserUsername(reply.user)}</span>
              <span className="timestamp">{reply.createdAt}</span>
            </div>
            <div className="reply-content">
              <p>{reply.text}</p>
            </div>
          </div>
        ))}
      </div>
    )
    return content
  } else {
    return <p>No replies found</p>;
  }
}

export default RepliesList