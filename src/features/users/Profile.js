import useAuth from '../../hooks/useAuth'
import { useState } from 'react'
import { useUpdateUserMutation, useGetUsersQuery, useDeleteUserMutation } from './usersApiSlice'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logOut } from '../auth/authSlice'
import { selectCurrentToken } from '../auth/authSlice'
import LikeActivity from '../likes/LikeActivity';
import NoteActivity from '../notes/NoteActivity';
import ReplyActivity from '../replies/ReplyActivity';

const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/;


// --- MAIN COMPONENT ---
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

    // Centralized handlers for toggling UI states
    const handleActivitySelect = (activity) => {
        setShowActivity(true);
        setSelectedActivity(activity);
        setShowChangePwd(false);
    };

    const handleShowActivityToggle = () => {
        setShowActivity(v => !v);
        setSelectedActivity(null);
        setShowChangePwd(false);
    };

    const handleShowChangePwdToggle = () => {
        setShowChangePwd(v => !v);
        setShowActivity(false);
        setSelectedActivity(null);
    };

    // Fetch user data to get email
    const { user } = useGetUsersQuery('usersList', {
        selectFromResult: ({ data }) => ({
            user: data?.entities[userId]
        })
    })
    const email = user?.email

    // Fetch all notes for the notes table
    // const {
    //     data: notesData,
    //     isLoading: notesLoading,
    //     isError: notesError,
    //     error: notesErrorObj,
    //     isSuccess: notesSuccess
    // } = useGetNotesQuery('notesList', {
    //     pollingInterval: 15000,
    //     refetchOnFocus: true,
    //     refetchOnMountOrArgChange: true
    // })

    // State for search in notes table
    // const [notesSearch, setNotesSearch] = useState("");

    // State for user replies aggregation
    // const [userReplies, setUserReplies] = useState([])
    // const [repliesLoading, setRepliesLoading] = useState(false)
    // const [repliesError, setRepliesError] = useState(null)
    // Sorting hooks for replies
    // const [repliesSortConfig, handleRepliesSort] = useSortableData({ key: 'createdAt', direction: 'desc' });
    // For replies sorting
    // const sortedReplies = getSortedData(userReplies, repliesSortConfig, ...)
    // Table columns for replies
    // const repliesColumns = [...];
    // Activity buttons: userRepliesCount
    // const userRepliesCount = userReplies.length;
    // ... existing code ...

    // Fetch liked notes and replies
    // const { data: likedNotes = [], isLoading: likedNotesLoading, isError: likedNotesError } = useGetLikedNotesQuery(userId);
    // const { data: likedReplies = [], isLoading: likedRepliesLoading, isError: likedRepliesError } = useGetLikedRepliesQuery(userId);
    // const showLikesContent = useShowWithTimeout(showActivity && selectedActivity === 'likes');
    // Handler for clicking a like
    // const handleLikeClick = (like) => { ... }

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

    // For notes sorting and filtering
    // let sortedAndFilteredNoteIds = [];
    // if (notesSuccess && notesData) {
    //     sortedAndFilteredNoteIds = notesData.ids
    //         .filter(noteId => notesData.entities[noteId].username === username)
    //         .filter(noteId => {
    //             const note = notesData.entities[noteId];
    //             const searchLower = notesSearch.toLowerCase();
    //             return note.title.toLowerCase().includes(searchLower);
    //         });
    //     sortedAndFilteredNoteIds = getSortedData(
    //         sortedAndFilteredNoteIds,
    //         notesSortConfig,
    //         {
    //             title: id => notesData.entities[id].title.toLowerCase(),
    //             username: id => notesData.entities[id].username.toLowerCase(),
    //             createdAt: id => new Date(notesData.entities[id].createdAt),
    //             updatedAt: id => new Date(notesData.entities[id].updatedAt)
    //         }
    //     );
    // }

    // For replies sorting
    // const sortedReplies = getSortedData(userReplies, repliesSortConfig, {
    //     noteTitle: r => r.noteTitle.toLowerCase(),
    //     text: r => r.text.toLowerCase(),
    //     createdAt: r => new Date(r.createdAt)
    // });

    // Table columns
    // const notesColumns = [
    //     { key: 'title', label: 'Title', className: 'table__title', sortable: true },
    //     { key: 'username', label: 'Owner', className: 'table__username', sortable: true },
    //     { key: 'createdAt', label: 'Created', className: 'note__created', sortable: true },
    //     { key: 'updatedAt', label: 'Updated', className: 'note__updated', sortable: true }
    // ];
    // const repliesColumns = [
    //     { key: 'noteTitle', label: 'Note Title', sortable: true },
    //     { key: 'text', label: 'Reply', sortable: true },
    //     { key: 'createdAt', label: 'Date', sortable: true }
    // ];

    // Activity buttons
    // const userNotesCount = notesSuccess && notesData
    //     ? notesData.ids.filter(noteId => notesData.entities[noteId].username === username).length
    //     : 0;
    // const userRepliesCount = userReplies.length;
    const activities = [
        { key: 'notes', label: 'Notes', count: 0 },
        { key: 'replies', label: 'Replies', count: 0 },
        { key: 'likes', label: 'Likes' }
    ];

    // DRY helper for activity label with badge
    const renderActivityLabel = (label, count) => (
        <>
            {label}
            {count > 0 && <span className='notification-counter'>{count}</span>}
        </>
    );

    // DRY helpers for password error messages
    const getPwdError = () => {
        if (!pwdValid && pwdTouched) return "Password must be 4-12 characters and only contain letters, numbers, and !@#$%";
        return "";
    };
    const getConfirmError = () => {
        if (confirmTouched && !passwordsMatch) return "Passwords do not match";
        return "";
    };

    // Handler for clicking a like item
    // const handleLikeClick = (like) => { ... }

    return (
        <section className="profile">
            {!showActivity && (
                <div>
                    <h2>My Profile</h2>
                    <p><strong>Username:</strong> {username}</p>
                    {email && <p><strong>Email:</strong> {email}</p>}
                    <p><strong>Roles:</strong> {roles && roles.length ? roles.join(', ') : 'None'}</p>
                </div>
            )}
            <div>
                {/* User Activity Button */}
                <div>
                    <button className="button" onClick={handleShowActivityToggle}>
                        {showActivity ? 'Hide User Activity' : 'Show User Activity'}
                    </button>
                    {/* Activity buttons always rendered, visibility controlled by class */}
                    <div
                        className={`profile-buttons-transition${showActivity && !selectedActivity ? ' show' : ''}`}
                        aria-hidden={!showActivity || !!selectedActivity}
                    >
                        {activities.map(act => (
                            <button
                                key={act.key}
                                className="button profile-btn"
                                type="button"
                                tabIndex={showActivity ? 0 : -1}
                                onClick={() => handleActivitySelect(act.key)}
                            >
                                {renderActivityLabel(act.label, act.count)}
                            </button>
                        ))}
                    </div>
                    {/* Show notes table if Notes activity is selected */}
                    <div className={`profile-buttons-transition${showActivity && selectedActivity === 'notes' ? ' show' : ''}`}>
                        <NoteActivity userId={userId} username={username} show={showActivity && selectedActivity === 'notes'} />
                    </div>

                {/* Show replies table if Replies activity is selected */}
                <div className={`profile-buttons-transition${showActivity && selectedActivity === 'replies' ? ' show' : ''}`}>
                    <ReplyActivity userId={userId} token={token} show={showActivity && selectedActivity === 'replies'} />
                </div>

                {/* Show likes if Likes activity is selected */}
                <div className={`profile-buttons-transition${showActivity && selectedActivity === 'likes' ? ' show' : ''}`}>
                    <LikeActivity userId={userId} show={showActivity && selectedActivity === 'likes'} />
                </div>

                {/* Change Password button and form always visible */}
                {!showActivity && (
                  <div>
                      <button className="button" onClick={handleShowChangePwdToggle}>
                          {showChangePwd ? 'Cancel' : 'Change Password'}
                      </button>
                      <div className={`profile-buttons-transition${showChangePwd ? ' show' : ''}`}>
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
                              {/* successMsg moved out of form */}
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
                              {getPwdError() && <p className="errmsg">{getPwdError()}</p>}
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
                              {getConfirmError() && <p className="errmsg">{getConfirmError()}</p>}
                              <div className="form__action-buttons">
                                  <button className="button" type="submit" disabled={isLoading || !pwdValid || !passwordsMatch || !user}>
                                      {isLoading ? 'Updating...' : 'Set New Password'}
                                  </button>
                              </div>
                          </form>
                      </div>
                  </div>
                )}
                {/* Move successMsg here, above the horizontal rule */}
                {successMsg && <p className="msgmsg">{successMsg}</p>}
                {!showActivity && <hr />}
            </div>
            {/* Close main profile content div */}
            </div>
            {/* Delete button always at the bottom when visible */}
            {!showActivity && (
                <div>
            <button className="button delete-button" onClick={() => setShowDeleteConfirm(true)} disabled={isDeleting}>
                Delete My Account
            </button>
            <div className={`profile-buttons-transition${showDeleteConfirm ? ' show' : ''}`}>
            {(
                <>
                    <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                    <div>
                        <button className="delete-button form__action-buttons" onClick={handleDeleteAccount} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                        </button>
                        <button className="button form__action-buttons" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                            Cancel
                        </button>
                    </div>
                    {isDeleteError && <p className="errmsg">{deleteError?.data?.message || 'Error deleting account'}</p>}
                </>
            )}
            </div>
                </div>
            )}
        </section>
    )
}

export default Profile 