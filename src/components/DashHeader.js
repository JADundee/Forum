import { useEffect } from 'react'
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
    const { isAdmin, username } = useAuth()
    const { id } = useParams(); 
    
    const navigate = useNavigate()
    const { pathname } = useLocation()

    const dropdown = document.querySelector('.notification-dropdown')

    const { data: notifications, isLoading: notificationsLoading, isError: notificationsError } = useGetNotificationsQuery();
    
    const uniqueNotifications = notifications && notifications.filter((notification, index, self) => self.findIndex(n => n.id === notification.id) === index);

    const { note } = useGetNotesQuery("notesList", {
        selectFromResult: ({ data }) => ({
            note: data?.entities[id]
        }),
    })

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
    const onNotificationClicked = () => dropdown.classList.toggle('show')
    
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
    if (pathname.includes(`/dash/notes/${id}/expand`) && note?.username === username) {
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
    console.log(notifications);
    console.log(note);
    const notificationButton = (
        <button
            className="icon-button notification-button"
            title="Notifications"
            onClick={onNotificationClicked}
        >
            <FontAwesomeIcon icon={faBell} />
            <div className="notification-dropdown">
                {notificationsLoading ? 
                    (<p className="notification-item">Loading...</p>) 
                : notificationsError ? 
                    ( <p className="notification-item">Error fetching notifications</p> ) 
                : (
                    uniqueNotifications.map((notification) => (
                        <div key={notification.id} className="notification-item">
                            <p className='notification-title'>New Notification on: </p>
                            <p>From: {notification.username}</p>
                            <p>"{notification.replyText}"</p>
                            <p>{moment(notification.createdAt).fromNow()}</p>
                        </div>
                    ))
                )}
    </div>
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