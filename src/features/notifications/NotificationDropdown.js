import { forwardRef } from "react";
import { createPortal } from "react-dom";
import NotificationItem from "./NotificationItem";

/**
 * Dropdown component to display notifications in a floating panel.
 * Handles loading, error, marking as read, and navigation.
 */
const NotificationDropdown = forwardRef(
  (
    {
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
    },
    ref
  ) => {
    // Render the dropdown content for notifications
    const dropdownContent = (
      <div
        ref={ref}
        className={`notification-dropdown${isOpen ? " show" : ""}`}
        onClick={onDropdownClick}>
        {notificationsLoading ? (
          <p className="notification-item">Loading...</p>
        ) : notificationsError ? (
          <p className="notification-item">Error fetching notifications</p>
        ) : (
          <>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item${
                  notification.read ? " notification-read" : ""
                }`}
                onClick={() => onNotificationClicked(notification)}>
                <NotificationItem notification={notification} />
              </div>
            ))}
            <button
              className="button alt-button"
              onClick={onMarkAllAsRead}
              disabled={unreadCount === 0 || isMarkingAll}>
              Mark all as read
            </button>
          </>
        )}
        <button className="button" onClick={onSeeAll}>
          See All Notifications
        </button>
      </div>
    );

    // Use React portal to render dropdown in the document body
    return createPortal(dropdownContent, document.body);
  }
);

export default NotificationDropdown;
