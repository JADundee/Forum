import React from 'react';
import moment from 'moment';

const NotificationItem = ({ notification }) => (
  <>
    {notification.type === 'reply' && (
      <>
        <p className="all-notifications__text">
          <span className="username">{notification.username}</span> replied to your note: <span className="note-title">{notification.noteTitle}</span>
        </p>
        <p className="all-notifications__text">
          <span className="reply-text">"{notification.replyText}"</span>
        </p>
      </>
    )}
    {notification.type === 'like-note' && (
      <p className="all-notifications__text">
        <span className="username">{notification.username}</span> liked your note: <span className="note-title">{notification.noteTitle}</span>
      </p>
    )}
    {notification.type === 'like-reply' && (
      <p className="all-notifications__text">
        <span className="username">{notification.username}</span> liked your reply: <span className="reply-text">"{notification.replyText}"</span>
        {notification.noteTitle && <span> on <span className="note-title">{notification.noteTitle}</span></span>}
      </p>
    )}
    <p className="all-notifications__timestamp">
      <span className="timestamp">{moment(notification.createdAt).fromNow()}</span>
    </p>
  </>
);

export default NotificationItem; 