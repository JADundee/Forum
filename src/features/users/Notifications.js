// src/features/notifications/Notifications.js
import React from 'react';
import { useGetNotificationsQuery } from '../notes/notesApiSlice';
import moment from 'moment';

const Notifications = () => {
    const { data: notificationsData, isLoading, isError } = useGetNotificationsQuery();

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (isError) {
        return <p>Error fetching notifications</p>;
    }

    return (
        <div>
            <h1>All Notifications</h1>
            <ul>
                {notificationsData.map((notification) => (
                    <li key={notification.id}>
                        <p>{notification.username} replied to {notification.noteId}</p>
                        <p>{notification.replyText}</p>
                        <p>{moment(notification.createdAt).fromNow()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Notifications;