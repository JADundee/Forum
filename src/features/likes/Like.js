import React from 'react';
import moment from 'moment';

const LikeItem = ({ like, type, onClick }) => {
  if (type === 'note') {
    return (
      <div className="like-item-clickable" onClick={onClick} style={{ cursor: 'pointer' }}>
        <p className="all-notifications__text">
          You liked the note: <span className="note-title">{like.title}</span>
          {like.user?.username && (
            <span> by <span className="username">{like.user.username}</span></span>
          )}
        </p>
        <p className="all-notifications__timestamp">
          <span className="timestamp">{moment(like.createdAt).fromNow()}</span>
        </p>
      </div>
    );
  }
  if (type === 'reply') {
    return (
      <div className="like-item-clickable" onClick={onClick} style={{ cursor: 'pointer' }}>
        <p className="all-notifications__text">
          You liked a reply: <span className="reply-text">"{like.text}"</span>
          {like.user?.username && (
            <span> by <span className="username">{like.user.username}</span></span>
          )}
          {like.note?.title && (
            <span> on <span className="note-title">{like.note.title}</span></span>
          )}
        </p>
        <p className="all-notifications__timestamp">
          <span className="timestamp">{moment(like.createdAt).fromNow()}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default LikeItem; 