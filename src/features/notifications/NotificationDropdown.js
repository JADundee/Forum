// NotificationDropdown.js
import { forwardRef } from "react";
import { createPortal } from "react-dom";
import NotificationsList from "./NotificationsList";

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
      onDropdownClick,
      isOpen,
    },
    ref
  ) => {
    const content = (
      <div
        ref={ref}
        className={`notification-dropdown${isOpen ? " show" : ""}`}
        onClick={onDropdownClick}
      >
        {notificationsLoading ? (
          <p className="notification__item">Loading...</p>
        ) : notificationsError ? (
          <p className="notification__item">Error fetching notifications</p>
        ) : (
          <NotificationsList
            notifications={notifications}
            onNotificationClicked={onNotificationClicked}
            unreadCount={unreadCount}
            isMarkingAll={isMarkingAll}
            onMarkAllAsRead={onMarkAllAsRead}
            onSeeAll={onSeeAll}
            isDropdown
          />
        )}
      </div>
    );

    return createPortal(content, document.body);
  }
);

export default NotificationDropdown;
