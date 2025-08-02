import { useEffect, useState, useMemo, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileCirclePlus,
  faFilePen,
  faUserGear,
  faRightFromBracket,
  faFile,
  faBell,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

// Import necessary hooks from React Router and Redux
import { useNavigate, Link, useLocation, useParams } from "react-router-dom";
import { useSendLogoutMutation } from "../features/auth/authApiSlice";
import {
  useGetForumsQuery,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "../features/forums/forumsApiSlice";
import useAuth from "../hooks/useAuth";
import NotificationDropdown from "../features/notifications/NotificationDropdown";

const FORUMS_REGEX = /^\/dash\/forums(\/)?$/;
const USERS_REGEX = /^\/dash\/users(\/)?$/;

/**
 * Dashboard header component for navigation, branding, and user actions.
 * Handles notification dropdown, navigation buttons, and logout logic.
 */
const DashHeader = () => {
  // Get user and admin status from authentication hook
  const { isAdmin, username } = useAuth();
  const { id } = useParams();

  // React Router navigation and location hooks
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const handleNavigate = (path) => () => navigate(path);

  // Notification and forum data hooks
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    isError: notificationsError,
  } = useGetNotificationsQuery();
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [markAllNotificationsRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();

  // Memoize notifications to avoid unnecessary re-renders
  const notifications = useMemo(
    () => notificationsData || [],
    [notificationsData]
  );

  // Get forums data for mapping forum IDs to titles
  const { data, isLoading: forumsLoading } = useGetForumsQuery("forumsList");
  const allForums = useMemo(() => {
    if (!forumsLoading && data && data.entities) {
      return Object.values(data.entities);
    }
    return [];
  }, [data, forumsLoading]);

  // Create a map of forum IDs to forum titles
  const forumMap = useMemo(() => {
    const map = {};
    allForums.forEach((forum) => {
      map[forum.id] = forum.title;
    });
    return map;
  }, [allForums]);

  // Filter out notifications for deleted forums
  const filteredNotifications = useMemo(
    () => notifications.filter((n) => !n.forumId || forumMap[n.forumId]),
    [notifications, forumMap]
  );

  // Add forum titles to notifications for display
  const notificationsWithTitles = useMemo(
    () =>
      filteredNotifications.map((n) => ({
        ...n,
        forumTitle: forumMap[n.forumId],
      })),
    [filteredNotifications, forumMap]
  );

  // State for notification dropdown
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);

  // Route checks for conditional rendering
  const isDash = pathname === "/dash";
  const isForums = useMemo(() => FORUMS_REGEX.test(pathname), [pathname]);
  const isUsers = useMemo(() => USERS_REGEX.test(pathname), [pathname]);
  const isNotificationsAll = pathname.includes("/dash/users/notifications/all");
  const isWelcomePage = pathname === "/dash";
  const isProfilePage = pathname === "/dash/profile";
  const isForumExpand = useMemo(
    () => pathname.includes(`/dash/forums/${id}/expand`),
    [pathname, id]
  );

  // Refs for notification dropdown and button
  const notificationButtonRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Effect to close notification dropdown when clicking outside
  useEffect(() => {
    if (!notificationDropdownOpen) return;
    function handleClickOutside(event) {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target)
      ) {
        setNotificationDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationDropdownOpen]);

  // Logout mutation hook
  const [sendLogout, { isLoading, isSuccess, isError, error }] =
    useSendLogoutMutation();

   // Handles user logout by clearing storage and navigating to login page.
  const logoutHandler = async () => {
    sessionStorage.removeItem("token");
    localStorage.removeItem("persist");
    try {
      await sendLogout().unwrap();
      navigate("/", { replace: true });
    } catch (error) {
      console.log(error);
    }
  };

  // Effect to redirect after successful logout
  useEffect(() => {
    if (isSuccess) navigate("/");
  }, [isSuccess, navigate]);

  // Count unread notifications for badge
  const unreadCount = filteredNotifications.filter(
    (n) => !n.read && n.username !== username
  ).length;

   // Marks all notifications as read if there are any unread.
  const onMarkAllAsRead = async () => {
    if (unreadCount > 0) {
      await markAllNotificationsRead();
    }
  };

   // Handles clicking a notification, marking it as read and navigating to the relevant forum/reply.
  const onNotificationClicked = async (notification) => {
    if (!notification.read) {
      await markNotificationRead(notification.id);
    }
    if (notification.forumId) {
      if (notification.replyId) {
        navigate(`/dash/forums/${notification.forumId}/expand`, {
          state: { replyId: notification.replyId },
        });
      } else {
        navigate(`/dash/forums/${notification.forumId}/expand`);
      }
      setNotificationDropdownOpen(false);
    }
  };

  // Render notification button and dropdown if not on notifications-all page
  let notificationButton = null;
  if (!isNotificationsAll) {
    notificationButton = (
      <div ref={notificationButtonRef} style={{ position: "relative" }}>
        <button
          className="icon-button notification-button"
          title="Notifications"
          onClick={(e) => {
            e.stopPropagation();
            setNotificationDropdownOpen((prev) => !prev);
          }}>
          <FontAwesomeIcon icon={faBell} />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>
        <NotificationDropdown
          ref={notificationDropdownRef}
          notifications={notificationsWithTitles}
          notificationsLoading={notificationsLoading}
          notificationsError={notificationsError}
          unreadCount={unreadCount}
          isMarkingAll={isMarkingAll}
          onNotificationClicked={onNotificationClicked}
          onMarkAllAsRead={onMarkAllAsRead}
          onSeeAll={() => navigate("/dash/users/notifications/all")}
          username={username}
          onDropdownClick={(e) => e.stopPropagation()}
          isOpen={notificationDropdownOpen}
        />
      </div>
    );
  }

   // Renders the Users button for navigation to the users page (admin only).
  const renderUsersButton = isWelcomePage && (
    <button
      className="icon-button"
      title="Users"
      onClick={handleNavigate("/dash/users")}>
      <FontAwesomeIcon icon={faUserGear} />
    </button>
  );

   // Renders the Profile button for navigation to the user's profile page.
  const profileButton = !isProfilePage && (
    <button
      className="icon-button"
      title="Profile"
      onClick={handleNavigate("/dash/profile")}>
      <FontAwesomeIcon icon={faUser} />
    </button>
  );

   // Renders the Logout button to trigger user logout.
  const logoutButton = (
    <button className="icon-button" title="Logout" onClick={logoutHandler}>
      <FontAwesomeIcon icon={faRightFromBracket} />
    </button>
  );

  const errClass = isError ? "errmsg" : "offscreen";

   // Renders the New Forum button for navigation to the new forum creation page.
  const renderNewForumButton = () => (
    <button
      className="icon-button"
      title="New Forum"
      onClick={handleNavigate("/dash/forums/new")}>
      <FontAwesomeIcon icon={faFileCirclePlus} />
    </button>
  );

   // Renders the Forums button for navigation to the forums list page.
  const renderForumsButton = () => (
    <button
      className="icon-button"
      title="Forums"
      onClick={handleNavigate("/dash/forums")}>
      <FontAwesomeIcon icon={faFile} />
    </button>
  );

   // Renders the Edit Forum button for navigation to the forum edit page.
  const renderEditForumButton = () => (
    <button
      className="icon-button"
      title="Edit Forum"
      onClick={handleNavigate(`/dash/forums/${id}/edit`)}>
      <FontAwesomeIcon icon={faFilePen} />
    </button>
  );

  let buttonContent;

  // Check if logout is in progress
  if (isLoading) {
    // If true, display loading message
    buttonContent = <p>Logging Out...</p>;
  } else {
    // Otherwise, display navigation buttons
    buttonContent = (
      <>
        {isForums && renderNewForumButton()}
        {!isForums && pathname.startsWith("/dash") && renderForumsButton()}
        {isForumExpand &&
          (isAdmin ||
            allForums.find((forum) => forum.id === id)?.username ===
              username) &&
          renderEditForumButton()}
        {isAdmin && !isUsers && renderUsersButton}
        {notificationButton}
        {profileButton}
        {logoutButton}
      </>
    );
  }
  
   // Renders the header content including error messages, branding, and navigation buttons.
  const content = (
    <>
      {/* Display error message if present */}
      <p className={errClass}>{error?.data?.message}</p>

      <header className="dash-header">
        <div
          className={`dash-header__container ${
            isDash ? "" : "dash-header__container--small"
          }`}>
          {/* Branding: Forum title, links to dashboard if not on main dash */}
          {isDash ? (
            <h1 className="dash-header__title dash-header__title--disabled">
              Forum
            </h1>
          ) : (
            <Link to="/dash">
              <h1 className="dash-header__title">Forum</h1>
            </Link>
          )}
          {/* Navigation buttons: forums, new forum, edit, users, notifications, profile, logout */}
          <nav className="dash-header__nav">{buttonContent}</nav>
        </div>
      </header>
    </>
  );

  return content;
};

export default DashHeader;
