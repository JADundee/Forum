// NotificationsList.js
import NotificationItem from "./NotificationItem";

/**
 * Shared notifications renderer for dropdown and full-page list.
 */
const NotificationsList = ({
  notifications,
  onNotificationClicked,
  onDeleteNotification,
  showDelete = false,
  unreadCount = 0,
  isMarkingAll = false,
  onMarkAllAsRead,
  onSeeAll,
  isDropdown = false,
}) => {
  return (
    <>
      {/* Header (only for full page) */}
      {!isDropdown && (
        <div className="notifications-page__header">
          <h1>All Notifications</h1>
          <button
            className="button notifications-page__mark-all-read"
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0 || isMarkingAll}
          >
            Mark all as read
          </button>
        </div>
      )}

      {/* Notifications list */}
      <ul
        className={
          isDropdown ? "notification-dropdown__list" : "notifications-page__content"
        }
      >
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`notification__item ${
              n.read ? "notification__item--read" : ""
            }`}
            onClick={() => onNotificationClicked(n)}
          >
            <NotificationItem notification={n} />

            {showDelete && (
              <button
                className="button button--delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNotification(n.id);
                }}
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Footer actions (only in dropdown) */}
      {isDropdown && (
        <>
          <button
            className="button button--alt"
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0 || isMarkingAll}
          >
            Mark all as read
          </button>
          <button className="button" onClick={onSeeAll}>
            See All Notifications
          </button>
        </>
      )}
    </>
  );
};

export default NotificationsList;
