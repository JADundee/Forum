import useAuth from '../../hooks/useAuth'
import { useState, useEffect } from 'react'
import { useUpdateUserMutation, useGetUsersQuery, useDeleteUserMutation } from './usersApiSlice'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logOut } from '../auth/authSlice'
import { useGetNotesQuery } from '../notes/notesApiSlice'
import Note from '../notes/Note'
import moment from 'moment'
import { selectCurrentToken } from '../auth/authSlice'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExpand } from '@fortawesome/free-solid-svg-icons'

const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/;

const Profile = () => {
    const { username, roles, userId } = useAuth()
    const [showChangePwd, setShowChangePwd] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [updateUser, { isLoading, isError, error }] = useUpdateUserMutation()
    const [deleteUser, { isLoading: isDeleting, isError: isDeleteError, error: deleteError }] = useDeleteUserMutation()
    const [successMsg, setSuccessMsg] = useState('')
    const [pwdValid, setPwdValid] = useState(false)
    const [pwdTouched, setPwdTouched] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [confirmTouched, setConfirmTouched] = useState(false)
    const [showActivity, setShowActivity] = useState(false)
    const [selectedActivity, setSelectedActivity] = useState(null)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const token = useSelector(selectCurrentToken)

    // Fetch user data to get email
    const { user } = useGetUsersQuery('usersList', {
        selectFromResult: ({ data }) => ({
            user: data?.entities[userId]
        })
    })
    const email = user?.email

    // Fetch all notes for the notes table
    const {
        data: notesData,
        isLoading: notesLoading,
        isError: notesError,
        error: notesErrorObj,
        isSuccess: notesSuccess
    } = useGetNotesQuery('notesList', {
        pollingInterval: 15000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    // State for search and sorting in notes table
    const [notesSearch, setNotesSearch] = useState("");
    const [notesSortConfig, setNotesSortConfig] = useState({ key: 'updatedAt', direction: 'desc' });

    // Calculate the number of notes for the current user
    const userNotesCount = notesSuccess && notesData
        ? notesData.ids.filter(noteId => notesData.entities[noteId].username === username).length
        : 0;

    // State for user replies aggregation
    const [userReplies, setUserReplies] = useState([])
    const [repliesLoading, setRepliesLoading] = useState(false)
    const [repliesError, setRepliesError] = useState(null)

    useEffect(() => {
        const fetchUserReplies = async () => {
            if (showActivity && selectedActivity === 'replies' && userId && token) {
                setRepliesLoading(true)
                setRepliesError(null)
                try {
                    const res = await fetch(`http://localhost:3500/notes/replies-by-user?userId=${userId}`,
                        { headers: { 'Authorization': `Bearer ${token}` } })
                    if (!res.ok) throw new Error('Failed to fetch')
                    const replies = await res.json()
                    setUserReplies(replies)
                } catch (err) {
                    setRepliesError('Failed to load replies')
                } finally {
                    setRepliesLoading(false)
                }
            }
        }
        fetchUserReplies()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showActivity, selectedActivity, userId, token])

    // Guard: if user is not loaded, show loading message
    if (!user) return <p>Loading profile...</p>

    const handlePwdChange = (e) => {
        const val = e.target.value
        setNewPassword(val)
        setPwdTouched(true)
        setPwdValid(PWD_REGEX.test(val))
    }

    const handleConfirmChange = (e) => {
        setConfirmPassword(e.target.value)
        setConfirmTouched(true)
    }

    const passwordsMatch = newPassword === confirmPassword

    const handleChangePassword = async (e) => {
        e.preventDefault()
        setSuccessMsg('')
        if (!pwdValid || !passwordsMatch) return
        try {
            await updateUser({
                id: userId,
                username: user.username,
                roles: user.roles,
                active: user.active,
                email: user.email,
                password: newPassword
            }).unwrap()
            setSuccessMsg('Password updated successfully!')
            setShowChangePwd(false)
            setNewPassword('')
            setConfirmPassword('')
            setPwdTouched(false)
            setPwdValid(false)
            setConfirmTouched(false)
        } catch (err) {
            // error handled by isError
        }
    }

    const handleDeleteAccount = async () => {
        try {
            await deleteUser({ id: userId }).unwrap()
            dispatch(logOut())
            navigate('/')
        } catch (err) {
            // error handled by isDeleteError
        }
    }

    // Filter, search, and sort notes for the user's table
    let sortedAndFilteredNoteIds = [];
    if (notesSuccess && notesData) {
        sortedAndFilteredNoteIds = notesData.ids
            .filter(noteId => notesData.entities[noteId].username === username)
            .filter(noteId => {
                const note = notesData.entities[noteId];
                const searchLower = notesSearch.toLowerCase();
                return note.title.toLowerCase().includes(searchLower);
            });
        // Sorting logic
        sortedAndFilteredNoteIds.sort((a, b) => {
            const noteA = notesData.entities[a];
            const noteB = notesData.entities[b];
            let valA, valB;
            if (notesSortConfig.key === 'createdAt') {
                valA = new Date(noteA.createdAt);
                valB = new Date(noteB.createdAt);
            } else if (notesSortConfig.key === 'updatedAt') {
                valA = new Date(noteA.updatedAt);
                valB = new Date(noteB.updatedAt);
            } else if (notesSortConfig.key === 'title') {
                valA = noteA.title.toLowerCase();
                valB = noteB.title.toLowerCase();
            } else if (notesSortConfig.key === 'username') {
                valA = noteA.username.toLowerCase();
                valB = noteB.username.toLowerCase();
            }
            if (notesSortConfig.key === 'createdAt' || notesSortConfig.key === 'updatedAt') {
                if (notesSortConfig.direction === 'desc') {
                    return valB - valA;
                } else {
                    return valA - valB;
                }
            } else {
                if (notesSortConfig.direction === 'desc') {
                    return valB.localeCompare(valA);
                } else {
                    return valA.localeCompare(valB);
                }
            }
        });
    }

    // Sorting header click handler
    function handleNotesSort(key) {
        setNotesSortConfig(prev => {
            if (prev.key === key) {
                // Toggle direction
                return { key, direction: prev.direction === 'desc' ? 'asc' : 'desc' };
            } else {
                // New sort key, default to descending
                return { key, direction: 'desc' };
            }
        });
    }

    return (
        <section className="profile" style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
            <div style={{ flex: 1 }}>
            <h2>My Profile</h2>
            <p><strong>Username:</strong> {username}</p>
            {email && <p><strong>Email:</strong> {email}</p>}
            <p><strong>Roles:</strong> {roles && roles.length ? roles.join(', ') : 'None'}</p>

                {/* User Activity Button */}
                <div style={{ margin: '1.5em 0' }}>
                    <button className="button profile-wide-btn" onClick={() => {
                        setShowActivity(v => !v)
                        setSelectedActivity(null)
                        setShowChangePwd(false)
                    }}>
                        {showActivity ? 'Hide User Activity' : 'Show User Activity'}
                    </button>
                    {/* Activity buttons always rendered, visibility controlled by class */}
                    <div
                        className={`profile-buttons-transition${showActivity && !selectedActivity ? ' show' : ''}`}
                        style={{ display: 'flex', flexDirection: 'column', gap: '1em', marginTop: '1em' }}
                        aria-hidden={!showActivity || !!selectedActivity}
                    >
                        <button className="button profile-btn" type="button" tabIndex={showActivity ? 0 : -1} style={{ pointerEvents: showActivity ? 'auto' : 'none' }} onClick={() => setSelectedActivity('notes')}>
                            Notes {userNotesCount > 0 && <span style={{ marginLeft: 8, background: '#236323', color: '#fff', borderRadius: '12px', padding: '2px 8px', fontSize: '0.9em' }}>{userNotesCount}</span>}
                        </button>
                        <button className="button profile-btn" type="button" tabIndex={showActivity ? 0 : -1} style={{ pointerEvents: showActivity ? 'auto' : 'none' }} onClick={() => setSelectedActivity('replies')}>Replies</button>
                        <button className="button profile-btn" type="button" tabIndex={showActivity ? 0 : -1} style={{ pointerEvents: showActivity ? 'auto' : 'none' }} onClick={() => setSelectedActivity('likes')}>Likes</button>
                    </div>
                    {/* Show notes table if Notes activity is selected */}
                    {showActivity && selectedActivity === 'notes' && (
                        <div style={{ marginTop: '1.5em' }}>
                            {/* Search Bar */}
                            <div className="notes-filter-bar">
                                <input
                                    type="text"
                                    placeholder="Search by title or owner..."
                                    value={notesSearch}
                                    onChange={e => setNotesSearch(e.target.value)}
                                />
                            </div>
                            {/* Notes Table */}
                            {notesLoading && <p>Loading...</p>}
                            {notesError && <p className="errmsg">{notesErrorObj?.data?.message || 'Error loading notes'}</p>}
                            {notesSuccess && notesData && (
                                <table className="table table--notes">
                                    <thead className="table__thead">
                                        <tr>
                                            <th
                                                className="table__th table__title"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleNotesSort('title')}
                                            >
                                                <span>Title</span>{' '}
                                                {notesSortConfig.key === 'title' ? (
                                                    <span className="sort-arrow">{notesSortConfig.direction === 'desc' ? '▼' : '▲'}</span>
                                                ) : ''}
                                            </th>
                                            <th
                                                className="table__th table__username"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleNotesSort('username')}
                                            >
                                                <span>Owner</span>{' '}
                                                {notesSortConfig.key === 'username' ? (
                                                    <span className="sort-arrow">{notesSortConfig.direction === 'desc' ? '▼' : '▲'}</span>
                                                ) : ''}
                                            </th>
                                            <th
                                                className="table__th note__created"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleNotesSort('createdAt')}
                                            >
                                                <span className="table__created">Created</span>{' '}
                                                {notesSortConfig.key === 'createdAt' ? (
                                                    <span className="sort-arrow">{notesSortConfig.direction === 'desc' ? '▼' : '▲'}</span>
                                                ) : ''}
                                            </th>
                                            <th
                                                className="table__th note__updated"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleNotesSort('updatedAt')}
                                            >
                                                <span className="table__updated">Updated</span>{' '}
                                                {notesSortConfig.key === 'updatedAt' ? (
                                                    <span className="sort-arrow">{notesSortConfig.direction === 'desc' ? '▼' : '▲'}</span>
                                                ) : ''}
                                            </th>
                                            <th className="table__th note__expand">Expand</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedAndFilteredNoteIds.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center' }}>No notes found</td>
                                            </tr>
                                        ) : (
                                            sortedAndFilteredNoteIds.map(noteId => <Note key={noteId} noteId={noteId} />)
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>

                {/* Show replies table if Replies activity is selected */}
                {showActivity && selectedActivity === 'replies' && (
                    <div style={{ marginTop: '1.5em' }}>
                        {repliesLoading && <p>Loading...</p>}
                        {repliesError && <p className="errmsg">{repliesError}</p>}
                        {!repliesLoading && !repliesError && (
                            <table className="table table--replies">
                                <thead className="table__thead">
                                    <tr>
                                        <th className="table__th">Note Title</th>
                                        <th className="table__th">Reply</th>
                                        <th className="table__th">Date</th>
                                        <th className="table__th note__expand">Expand</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userReplies.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center' }}>No replies found</td>
                                        </tr>
                                    ) : (
                                        userReplies.map(reply => (
                                            <tr key={reply._id} className="table__row">
                                                <td className="table__cell">{reply.noteTitle}</td>
                                                <td className="table__cell">{reply.text}</td>
                                                <td className="table__cell">{moment(reply.createdAt).format('MMMM D, YYYY h:mm A')}</td>
                                                <td className="table__cell">
                                                    <button
                                                        className="icon-button table__button"
                                                        title="Expand Note"
                                                        onClick={() => navigate(`/dash/notes/${reply.note._id}/expand`, { state: { replyId: reply._id } })}
                                                    >
                                                        <FontAwesomeIcon icon={faExpand} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Change Password button and form always visible */}
                <div style={{ margin: '2em 0 0 0' }}>
                    <button className="button profile-wide-btn" onClick={() => {
                        setShowChangePwd(v => !v)
                        setShowActivity(false)
                        setSelectedActivity(null)
                    }}>
                        {showChangePwd ? 'Cancel' : 'Change Password'}
                    </button>
                    <div className={`profile-buttons-transition${showChangePwd ? ' show' : ''}`} style={{ marginTop: '1em' }}>
                        <form
                            className="form"
                            onSubmit={handleChangePassword}
                            aria-hidden={!showChangePwd}
                            tabIndex={showChangePwd ? 0 : -1}
                        >
                            <div className="form__title-row">
                                <h2>Change Password</h2>
                            </div>
                            {isError && <p className="errmsg">{error?.data?.message || 'Error updating password'}</p>}
                            {successMsg && <p className="msgmsg">{successMsg}</p>}
                            <label htmlFor="new-password">New Password: <span className="nowrap">[4-12 characters. Letters, numbers, !@#$% only]</span></label>
                            <input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={handlePwdChange}
                                onBlur={() => setPwdTouched(true)}
                                placeholder='Enter your new password'
                                required
                                className="form__input"
                            />
                            {!pwdValid && pwdTouched && (
                                <p className="errmsg">Password must be 4-12 characters and only contain letters, numbers, and !@#$%</p>
                            )}
                            <label htmlFor="confirm-password">Confirm New Password:</label>
                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={handleConfirmChange}
                                onBlur={() => setConfirmTouched(true)}
                                placeholder='Re-enter your new password'
                                required
                                className="form__input"
                            />
                            {confirmTouched && !passwordsMatch && (
                                <p className="errmsg">Passwords do not match</p>
                            )}
                            <div className="form__action-buttons">
                                <button className="button form__login-button" type="submit" disabled={isLoading || !pwdValid || !passwordsMatch || !user}>
                                    {isLoading ? 'Updating...' : 'Set New Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <hr style={{ margin: '2em 0' }} />
            </div>
            {/* Delete button always at the bottom when visible */}
            {!selectedActivity && (
                <div style={{ marginTop: 'auto' }}>
            <button className="button delete-button" onClick={() => setShowDeleteConfirm(true)} disabled={isDeleting}>
                Delete My Account
            </button>
            {showDeleteConfirm && (
                <div style={{ marginTop: '1em' }}>
                    <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                    <button className="button delete-button" onClick={handleDeleteAccount} disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                    </button>
                    <button className="button" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                        Cancel
                    </button>
                    {isDeleteError && <p className="errmsg">{deleteError?.data?.message || 'Error deleting account'}</p>}
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}

export default Profile 