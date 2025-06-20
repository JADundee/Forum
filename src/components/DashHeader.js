// Import necessary dependencies from React and Font Awesome
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faFileCirclePlus,
    faFilePen,
    faUserGear,
    faRightFromBracket,
    faFile,
    faBell
} from "@fortawesome/free-solid-svg-icons"

// Import moment library for date and time formatting
import moment from 'moment'

// Import necessary hooks from React Router and Redux
import { useNavigate, Link, useLocation, useParams } from 'react-router-dom'
import { useSendLogoutMutation } from '../features/auth/authApiSlice'
import {useGetNotesQuery, useGetNotificationsQuery} from '../features/notes/notesApiSlice'
import useAuth from '../hooks/useAuth'

// Define regular expressions for matching dashboard routes
const DASH_REGEX = /^\/dash(\/)?$/
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

    // Get dropdown element for notifications
    const dropdown = document.querySelector('.notification-dropdown')

    // Get notifications data from useGetNotificationsQuery hook
    const { data: notificationsData, isLoading: notificationsLoading, isError: notificationsError } = useGetNotificationsQuery();
    
    // Initialize state for notifications
    const [notifications, setNotifications] = useState([]);

    // Effect hook to update notifications state when data is received
    useEffect(() => {
        if (!notificationsLoading && notificationsData) {
            setNotifications(notificationsData);
        }
    }, [notificationsData, notificationsLoading]);

    // Get notes data from useGetNotesQuery hook
    const { data, isLoading: notesLoading } = useGetNotesQuery("notesList");

    // Initialize state for notes
    const [notes, setNotes] = useState([]);

    // Effect hook to update notes state when data is received
    useEffect(() => {
        if (!notesLoading && data && data.entities) {
            setNotes(Object.values(data.entities).filter(note => note.user === userId));
        }
    }, [data, notesLoading, userId]);

    // Extract user IDs and titles from notes
    const notesUserId = notes.map(note => note.user);
    const notesTitle = notes.map(note => note.title);

    // Log notes data for debugging
    console.log(notes)
    console.log(typeof notes)
    console.log(notesUserId)
    console.log(userId)
    console.log(notesTitle)
    
    // Get sendLogout mutation function from useSendLogoutMutation hook
    const [sendLogout, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useSendLogoutMutation()

   // Define logout handler function to handle logout functionality
    const logoutHandler = async () => {
        try {
            // Call sendLogout mutation function to log out user
            await sendLogout().unwrap()
            // Navigate to home page after logout
            navigate('/', {replace: true})
        } catch(error) {
            // Log any errors that occur during logout
            console.log(error)
        }
    }

    // Effect hook to navigate to home page when logout is successful
    useEffect(() => {
        if (isSuccess) navigate('/')
    }, [isSuccess, navigate])

    // Define navigation handler functions for different routes
    const onNewNoteClicked = () => navigate('/dash/notes/new')
    const onNotesClicked = () => navigate('/dash/notes')
    const onUsersClicked = () => navigate('/dash/users')
    const onEditNoteClicked = () => navigate(`/dash/notes/${id}/edit`)

    const handleOutsideClick = (e) => {
    if (!dropdown.contains(e.target) && !e.target.classList.contains('icon-button') && !e.target.classList.contains('notification-button')) {
        dropdown.classList.remove('show')
        document.removeEventListener('click', handleOutsideClick)
    }
    }

    // Define notification-related handler functions
    const onNotificationButtonClicked = () => {
        dropdown.classList.toggle('show')
        if (dropdown.classList.contains('show')) {
            setTimeout(() => {
            document.addEventListener('click', handleOutsideClick)
            }, 100)
        } else {
            document.removeEventListener('click', handleOutsideClick)
        }
    }

    const onNotificationClicked = (noteId) => {
        // Get notification element
        const notificationElement = document.querySelector('.notification-dropdown .notification-item')
        // Add 'old-notification' class to notification element
        notificationElement.classList.add('old-notification')
        // Navigate to note page
        navigate(`/dash/notes/${noteId}/expand`)
    }
    
   // Define variable to store class name for dash header container
    let dashClass = null

    // Check if current pathname does not match any of the defined regex patterns
    if (!DASH_REGEX.test(pathname) && !NOTES_REGEX.test(pathname) && !USERS_REGEX.test(pathname)) {
        // If true, set dashClass to "dash-header__container--small"
        dashClass = "dash-header__container--small"
    }

    // Define variable to store new note button element
    let newNoteButton = null

    // Check if current pathname matches NOTES_REGEX pattern
    if (NOTES_REGEX.test(pathname)) {
        // If true, create new note button element
        newNoteButton = (
            <button
                className="icon-button"
                title="New Note"
                onClick={onNewNoteClicked}
            >
                <FontAwesomeIcon icon={faFileCirclePlus} />
            </button>
        )
    }

    // Define variable to store user button element
    let userButton = null

    // Check if user is admin and current pathname does not match USERS_REGEX pattern
    if (isAdmin) {
        if (!USERS_REGEX.test(pathname) && pathname.includes('/dash')) {
            // If true, create user button element
            userButton = (
                <button
                    className="icon-button"
                    title="Users"
                    onClick={onUsersClicked}
                >
                    <FontAwesomeIcon icon={faUserGear} />
                </button>
            )
        }
    }

    // Define variable to store notes button element
    let notesButton = null

    // Check if current pathname does not match NOTES_REGEX pattern and does not include "/dash/notes/:id/expand"
    if (!NOTES_REGEX.test(pathname) && !pathname.includes(`/dash/notes/${id}/expand`) && pathname.includes('/dash')) {
        // If true, create notes button element
        notesButton = (
            <button
                className="icon-button"
                title="Notes"
                onClick={onNotesClicked}
            >
                <FontAwesomeIcon icon={faFile} />
            </button>
        )
    }

    // Define variable to store edit note button element
    let editNoteButton = null

    // Check if current pathname includes "/dash/notes/:id/expand" and note username matches current user's username
    if (pathname.includes(`/dash/notes/${id}/expand`) && notes?.username === username) {
        // If true, create edit note button element
        editNoteButton = (
            <button
                className="icon-button"
                title="Edit Note"
                onClick={onEditNoteClicked}
            >
                <FontAwesomeIcon icon={faFilePen} />
            </button>
        )
    }

    // Define notification button element
    const notificationButton = (
        <button
            className="icon-button notification-button"
            title="Notifications"
            onClick={onNotificationButtonClicked}
        >
            <FontAwesomeIcon icon={faBell} />
            <div className="notification-dropdown">
                {notificationsLoading ? (
                    <p className="notification-item">Loading...</p>
                ) : notificationsError ? (
                    <p className="notification-item">Error fetching notifications</p>
                ) : (
                    notifications &&
                    notifications
                        .filter((notification) => {
                            return notification.username !== username;
                        })
                        .map((notification) => {
                            const note = notes.find((note) => note.id === notification.noteId);
                            return (
                                <div
                                    key={notification.id}
                                    className="notification-item"
                                    data-note-id={notification.noteId}
                                    onClick={() => onNotificationClicked(notification.noteId)}
                                >
                                    {note && (
                                        <p className="notification-title">New Reply on: {note.title}</p>
                                    )}
                                    <p>From: {notification.username}</p>
                                    <p>"{notification.replyText}"</p>
                                    <p>{moment(notification.createdAt).fromNow()}</p>
                                </div>
                            );
                        })
                )}
                <button
                    className="see-all-button"
                    onClick={() => navigate('/notifications/all')}
                >
                    See All Notifications
                </button>
            </div>
        </button>
    );

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
                {newNoteButton}
                {notesButton}
                {editNoteButton}
                {userButton}
                {notificationButton}
                {logoutButton}
            </>
        )
    }

    // Define JSX element for DashHeader component
    const content = (
        <>
            <p className={errClass}>{error?.data?.message}</p>

            <header className="dash-header">
                <div className={`dash-header__container ${dashClass}`}>
                    <Link to="/dash">
                        <h1 className="dash-header__title">theForum</h1>
                    </Link>
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