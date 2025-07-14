// Import necessary dependencies from React and Font Awesome
import { useEffect, useState, useMemo, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faFileCirclePlus,
    faFilePen,
    faUserGear,
    faRightFromBracket,
    faFile,
    faBell,
    faUser
} from "@fortawesome/free-solid-svg-icons"

// Import necessary hooks from React Router and Redux
import { useNavigate, Link, useLocation, useParams } from 'react-router-dom'
import { useSendLogoutMutation } from '../features/auth/authApiSlice'
import {useGetNotesQuery, useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation} from '../features/notes/notesApiSlice'
import useAuth from '../hooks/useAuth'
import NotificationDropdown from '../features/notifications/NotificationDropdown'

// Define regular expressions for matching dashboard routes
const NOTES_REGEX = /^\/dash\/notes(\/)?$/
const USERS_REGEX = /^\/dash\/users(\/)?$/


// Define the DashHeader component
const DashHeader = () => {
    // Get user authentication data from useAuth hook
    const { isAdmin, username, userId } = useAuth()
    const { id } = useParams(); 
    
    // Get navigate function from React Router
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const handleNavigate = (path) => () => navigate(path);

    // Get notifications data from useGetNotificationsQuery hook
    const { data: notificationsData, isLoading: notificationsLoading, isError: notificationsError } = useGetNotificationsQuery();
    const [markNotificationRead] = useMarkNotificationReadMutation();
    const [markAllNotificationsRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

    // Use notificationsData directly, but memoize to avoid ESLint warning
    const notifications = useMemo(() => notificationsData || [], [notificationsData]);

    // Get notes data from useGetNotesQuery hook
    const { data, isLoading: notesLoading } = useGetNotesQuery("notesList");

    // Memoized all notes
    const allNotes = useMemo(() => {
        if (!notesLoading && data && data.entities) {
            return Object.values(data.entities);
        }
        return [];
    }, [data, notesLoading]);

    // Optimize notification mapping with noteMap (all notes)
    const noteMap = useMemo(() => {
        const map = {};
        allNotes.forEach(note => { map[note.id] = note.title; });
        return map;
    }, [allNotes]);

    // Filter out notifications for deleted notes
    const filteredNotifications = useMemo(() => notifications.filter(n => !n.noteId || noteMap[n.noteId]), [notifications, noteMap]);

    const notificationsWithTitles = useMemo(() => filteredNotifications.map(n => ({
        ...n,
        noteTitle: noteMap[n.noteId]
    })), [filteredNotifications, noteMap]);

    // Initialize state for notification dropdown
    const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

    // Pathname/regex checks as booleans
    const isDash = pathname === '/dash';
    const isNotes = useMemo(() => NOTES_REGEX.test(pathname), [pathname]);
    const isUsers = useMemo(() => USERS_REGEX.test(pathname), [pathname]);
    const isNotificationsAll = pathname.includes('/dash/users/notifications/all');
    const isNoteExpand = useMemo(() => pathname.includes(`/dash/notes/${id}/expand`), [pathname, id]);

    // Add refs for notification button and dropdown
    const notificationButtonRef = useRef(null);
    const notificationDropdownRef = useRef(null);

    // Effect to close notification dropdown on outside click
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
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [notificationDropdownOpen]);

    // Get sendLogout mutation function from useSendLogoutMutation hook
    const [sendLogout, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useSendLogoutMutation()

   // Define logout handler function to handle logout functionality
    const logoutHandler = async () => {
        // Targeted clearing of auth-related storage before async call
        sessionStorage.removeItem('token');
        localStorage.removeItem('persist');
        try {
            await sendLogout().unwrap();
            navigate('/', { replace: true });
        } catch (error) {
            console.log(error);
        }
    }

    // Effect hook to navigate to home page when logout is successful
    useEffect(() => {
        if (isSuccess) navigate('/')
    }, [isSuccess, navigate])

    // Count unread notifications (for existing notes only)
    const unreadCount = filteredNotifications.filter(n => !n.read && n.username !== username).length;

    // Handler for marking all as read (to be implemented with backend support)
    const onMarkAllAsRead = async () => {
        if (unreadCount > 0) {
            await markAllNotificationsRead();
        }
    };

    // Define onNotificationClicked before it is used
    const onNotificationClicked = async (notification) => {
        // Mark notification as read
        if (!notification.read) {
            await markNotificationRead(notification.id);
        }
        // Optionally, navigate to the note or reply
        if (notification.noteId) {
            // If replyId exists, pass it in location state for highlighting
            if (notification.replyId) {
                navigate(`/dash/notes/${notification.noteId}/expand`, { state: { replyId: notification.replyId } });
            } else {
                navigate(`/dash/notes/${notification.noteId}/expand`);
            }
            setNotificationDropdownOpen(false);
        }
    };

    // Define notification button element
    let notificationButton = null;

    // Check if current pathname does not match "/dash/users/notifications/all"
    if (!isNotificationsAll) {
        notificationButton = (
            <div ref={notificationButtonRef} style={{ position: 'relative' }}>
                <button
                    className="icon-button notification-button"
                    title="Notifications"
                    onClick={e => { e.stopPropagation(); setNotificationDropdownOpen(prev => !prev); }}
                >
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
                    onSeeAll={() => navigate('/dash/users/notifications/all')}
                    username={username}
                    onDropdownClick={e => e.stopPropagation()}
                    isOpen={notificationDropdownOpen}
                />
            </div>
        );
    }

    // Define profile button element
    const isProfilePage = pathname === '/dash/profile';
    const profileButton = !isProfilePage && (
        <button
            className="icon-button"
            title="Profile"
            onClick={handleNavigate('/dash/profile')}
        >
            <FontAwesomeIcon icon={faUser} />
        </button>
    )

    // Define logout button element
    const logoutButton = (
        <button
            className="icon-button"
            title="Logout"
            onClick={logoutHandler}
        >
            <FontAwesomeIcon icon={faRightFromBracket} />
        </button>
    )

    // Define variable to store error message class
    const errClass = isError ? "errmsg" : "offscreen"

    // Button render helpers (move these above buttonContent logic)
    const renderNewNoteButton = () => (
        <button className="icon-button" title="New Note" onClick={handleNavigate('/dash/notes/new')}>
            <FontAwesomeIcon icon={faFileCirclePlus} />
        </button>
    );

    const renderNotesButton = () => (
        <button className="icon-button" title="Notes" onClick={handleNavigate('/dash/notes')}>
            <FontAwesomeIcon icon={faFile} />
        </button>
    );

    const renderEditNoteButton = () => (
        <button className="icon-button" title="Edit Note" onClick={handleNavigate(`/dash/notes/${id}/edit`)}>
            <FontAwesomeIcon icon={faFilePen} />
        </button>
    );

    const renderUsersButton = () => (
        <button className="icon-button" title="Users" onClick={handleNavigate('/dash/users')}>
            <FontAwesomeIcon icon={faUserGear} />
        </button>
    );

    // Define variable to store button content
    let buttonContent

    // Check if logout is in progress
    if (isLoading) {
        // If true, display loading message
        buttonContent = <p>Logging Out...</p>
    } else {
        // Otherwise, display navigation buttons
        buttonContent = (
            <>
                {isNotes && renderNewNoteButton()}
                {!isNotes && pathname.startsWith('/dash') && renderNotesButton()}
                {isNoteExpand && (isAdmin || allNotes.find(note => note.id === id)?.username === username) && renderEditNoteButton()}
                {isAdmin && !isUsers && renderUsersButton()}
                {notificationButton}
                {profileButton}
                {logoutButton}
            </>
        )
    }

    // Define JSX element for DashHeader component
    const content = (
        <>
            <p className={errClass}>{error?.data?.message}</p>

            <header className="dash-header">
                <div className={`dash-header__container ${isDash ? '' : 'dash-header__container--small'}`}>
                    {isDash ? (
                        <h1 className="dash-header__title dash-header__title--disabled">theForum</h1>
                    ) : (
                        <Link to="/dash">
                            <h1 className="dash-header__title">theForum</h1>
                        </Link>
                    )}
                    <nav className="dash-header__nav">
                        {buttonContent}
                    </nav>
                </div>
            </header>
        </>
    )

    return content
}

export default DashHeader