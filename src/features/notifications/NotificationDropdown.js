import React, { forwardRef } from 'react';
import moment from 'moment';

const NotificationDropdown = forwardRef(({
    notifications,
    notificationsLoading,
    notificationsError,
    unreadCount,
    isMarkingAll,
    onNotificationClicked,
    onMarkAllAsRead,
    onSeeAll,
    username,
    onDropdownClick,
    isOpen,
}, ref) => {
    return (
        <div ref={ref} className={`notification-dropdown${isOpen ? ' show' : ''}`} onClick={onDropdownClick}>
            {notificationsLoading ? (
                <p className="notification-item">Loading...</p>
            ) : notificationsError ? (
                <p className="notification-item">Error fetching notifications</p>
            ) : (
                <>
                {notifications
                    .filter((notification) => notification.username !== username)
                    .map((notification) => (
                        <div
                            key={notification.id}
                            className={`notification-item ${notification.read ? 'notification-read' : 'notification-unread'}`}
                            data-note-id={notification.noteId}
                            onClick={() => onNotificationClicked(notification)}
                        >
                            {notification.noteTitle && (
                                <p className="notification-title">
                                    <span className="notification-header">New Reply on: </span>
                                    {notification.noteTitle}
                                </p>
                            )}
                            <p>
                                From: 
                                <span className="username"> {notification.username}</span>
                            </p>
                            <p>"{notification.replyText}"</p>
                            <p>{moment(notification.createdAt).fromNow()}</p>
                        </div>
                    ))}
                <button
                    className="button mark-all-read-btn"
                    onClick={onMarkAllAsRead}
                    disabled={unreadCount === 0 || isMarkingAll}
                >
                    Mark all as read
                </button>
                </>
            )}
            <button
                className="button"
                onClick={onSeeAll}
            >
                See All Notifications
            </button>
        </div>
    );
});

export default NotificationDropdown; 