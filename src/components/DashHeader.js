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
import {useGetForumsQuery, useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation} from '../features/forums/forumsApiSlice'
import useAuth from '../hooks/useAuth'
import NotificationDropdown from '../features/notifications/NotificationDropdown'

const FORUMS_REGEX = /^\/dash\/forums(\/)?$/
const USERS_REGEX = /^\/dash\/users(\/)?$/


const DashHeader = () => {
    const { isAdmin, username } = useAuth()
    const { id } = useParams(); 
    
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const handleNavigate = (path) => () => navigate(path);
    const { data: notificationsData, isLoading: notificationsLoading, isError: notificationsError } = useGetNotificationsQuery();
    const [markNotificationRead] = useMarkNotificationReadMutation();
    const [markAllNotificationsRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

    // Use notificationsData directly, but memoize to avoid ESLint warning
    const notifications = useMemo(() => notificationsData || [], [notificationsData]);

    const { data, isLoading: forumsLoading } = useGetForumsQuery("forumsList");

    const allForums = useMemo(() => {
        if (!forumsLoading && data && data.entities) {
            return Object.values(data.entities);
        }
        return [];
    }, [data, forumsLoading]);

    const forumMap = useMemo(() => {
        const map = {};
        allForums.forEach(forum => { map[forum.id] = forum.title; });
        return map;
    }, [allForums]);

    // Filter out notifications for deleted forums
    const filteredNotifications = useMemo(() => notifications.filter(n => !n.forumId || forumMap[n.forumId]), [notifications, forumMap]);

    const notificationsWithTitles = useMemo(() => filteredNotifications.map(n => ({
        ...n,
        forumTitle: forumMap[n.forumId]
    })), [filteredNotifications, forumMap]);

    const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

    const isDash = pathname === '/dash';
    const isForums = useMemo(() => FORUMS_REGEX.test(pathname), [pathname]);
    const isUsers = useMemo(() => USERS_REGEX.test(pathname), [pathname]);
    const isNotificationsAll = pathname.includes('/dash/users/notifications/all');
    const isWelcomePage = pathname === ('/dash');
    const isProfilePage = pathname === '/dash/profile';
    const isForumExpand = useMemo(() => pathname.includes(`/dash/forums/${id}/expand`), [pathname, id]);

    const notificationButtonRef = useRef(null);
    const notificationDropdownRef = useRef(null);

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

    const [sendLogout, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useSendLogoutMutation()

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

    useEffect(() => {
        if (isSuccess) navigate('/')
    }, [isSuccess, navigate])

    const unreadCount = filteredNotifications.filter(n => !n.read && n.username !== username).length;

    const onMarkAllAsRead = async () => {
        if (unreadCount > 0) {
            await markAllNotificationsRead();
        }
    };

    const onNotificationClicked = async (notification) => {
        if (!notification.read) {
            await markNotificationRead(notification.id);
        }
        if (notification.forumId) {
            if (notification.replyId) {
                navigate(`/dash/forums/${notification.forumId}/expand`, { state: { replyId: notification.replyId } });
            } else {
                navigate(`/dash/forums/${notification.forumId}/expand`);
            }
            setNotificationDropdownOpen(false);
        }
    };

    let notificationButton = null;

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

    const renderUsersButton = isWelcomePage && (
        <button 
        className="icon-button" 
        title="Users" 
        onClick={handleNavigate('/dash/users')}
        >
            <FontAwesomeIcon icon={faUserGear} />
        </button>
    );

    const profileButton = !isProfilePage && (
        <button
            className="icon-button"
            title="Profile"
            onClick={handleNavigate('/dash/profile')}
        >
            <FontAwesomeIcon icon={faUser} />
        </button>
    )

    const logoutButton = (
        <button
            className="icon-button"
            title="Logout"
            onClick={logoutHandler}
        >
            <FontAwesomeIcon icon={faRightFromBracket} />
        </button>
    )

    const errClass = isError ? "errmsg" : "offscreen"

    const renderNewForumButton = () => (
        <button className="icon-button" title="New Forum" onClick={handleNavigate('/dash/forums/new')}>
            <FontAwesomeIcon icon={faFileCirclePlus} />
        </button>
    );

    const renderForumsButton = () => (
        <button className="icon-button" title="Forums" onClick={handleNavigate('/dash/forums')}>
            <FontAwesomeIcon icon={faFile} />
        </button>
    );

    const renderEditForumButton = () => (
        <button className="icon-button" title="Edit Forum" onClick={handleNavigate(`/dash/forums/${id}/edit`)}>
            <FontAwesomeIcon icon={faFilePen} />
        </button>
    );

    let buttonContent

    // Check if logout is in progress
    if (isLoading) {
        // If true, display loading message
        buttonContent = <p>Logging Out...</p>
    } else {
        // Otherwise, display navigation buttons
        buttonContent = (
            <>
                {isForums && renderNewForumButton()}
                {!isForums && pathname.startsWith('/dash') && renderForumsButton()}
                {isForumExpand && (isAdmin || allForums.find(forum => forum.id === id)?.username === username) && renderEditForumButton()}
                {isAdmin && !isUsers && renderUsersButton}
                {notificationButton}
                {profileButton}
                {logoutButton}
            </>
        )
    }

    const content = (
        <>
            <p className={errClass}>{error?.data?.message}</p>

            <header className="dash-header">
                <div className={`dash-header__container ${isDash ? '' : 'dash-header__container--small'}`}>
                    {isDash ? (
                        <h1 className="dash-header__title dash-header__title--disabled">Forum</h1>
                    ) : (
                        <Link to="/dash">
                            <h1 className="dash-header__title">Forum</h1>
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