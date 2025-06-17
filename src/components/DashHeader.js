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
import moment from 'moment'
import { useNavigate, Link, useLocation, useParams } from 'react-router-dom'
import { useSendLogoutMutation } from '../features/auth/authApiSlice'
import {useGetNotesQuery, useGetNotificationsQuery} from '../features/notes/notesApiSlice'
import useAuth from '../hooks/useAuth'

const DASH_REGEX = /^\/dash(\/)?$/
const NOTES_REGEX = /^\/dash\/notes(\/)?$/
const USERS_REGEX = /^\/dash\/users(\/)?$/



const DashHeader = () => {
    const { isAdmin, username, userId } = useAuth()
    const { id } = useParams(); 
    
    const navigate = useNavigate()
    const { pathname } = useLocation()

    const dropdown = document.querySelector('.notification-dropdown')

    const { data: notificationsData, isLoading: notificationsLoading, isError: notificationsError } = useGetNotificationsQuery();
    
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
    if (!notificationsLoading && notificationsData) {
        setNotifications(notificationsData);
    }
    }, [notificationsData, notificationsLoading]);

    const uniqueNotifications = notifications && notifications.filter((notification, index, self) => self.findIndex(n => n.id === notification.id) === index);

    const noteId = uniqueNotifications && uniqueNotifications.length > 0 ? uniqueNotifications[0].noteId : null;

    
    const { data, isLoading: notesLoading } = useGetNotesQuery("notesList");

    const [notes, setNotes] = useState([]);

    useEffect(() => {
    if (!notesLoading && data && data.entities) {
        setNotes(Object.values(data.entities).filter(note => note.user === userId));
    }
    }, [data, notesLoading, userId]);


    const notesUserId = notes.map(note => note.user);
    const notesTitle = notes.map(note => note.title);

    console.log(notes)
    console.log(typeof notes)
    console.log(notesUserId)
    console.log(userId)
    console.log(notesTitle)
    

    const [sendLogout, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useSendLogoutMutation()

    const logoutHandler = async () => {
        try {
            await sendLogout().unwrap()
            navigate('/', {replace: true})
        } catch(error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (isSuccess) navigate('/')
    }, [isSuccess, navigate])

    const onNewNoteClicked = () => navigate('/dash/notes/new')
    const onNotesClicked = () => navigate('/dash/notes')
    const onUsersClicked = () => navigate('/dash/users')
    const onEditNoteClicked = () => navigate(`/dash/notes/${id}/edit`)
    const onNotificationButtonClicked = () => dropdown.classList.toggle('show')
    const onNotificationClicked = () => {
        const notificationElement = document.querySelector('.notification-dropdown .notification-item')
        notificationElement.classList.add('old-notification')
        navigate(`/dash/notes/${noteId}/expand`)
    }
    
    let dashClass = null
    if (!DASH_REGEX.test(pathname) && !NOTES_REGEX.test(pathname) && !USERS_REGEX.test(pathname)) {
        dashClass = "dash-header__container--small"
    }

    let newNoteButton = null
    if (NOTES_REGEX.test(pathname)) {
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

    let userButton = null
     if ( isAdmin ) { 
        if (!USERS_REGEX.test(pathname) && pathname.includes('/dash')) {
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

    let notesButton = null
    if (!NOTES_REGEX.test(pathname) && !pathname.includes(`/dash/notes/${id}/expand`) && pathname.includes('/dash')) {
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
    
    let editNoteButton = null
    if (pathname.includes(`/dash/notes/${id}/expand`) && notes?.username === username) {
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
                        onClick={onNotificationClicked}
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
    </div>
    </button>
    );
    

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

    let buttonContent
    if (isLoading) {
        buttonContent = <p>Logging Out...</p>
    } else {
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