import useAuth from '../../hooks/useAuth'
import { useState, useEffect, useRef } from 'react'
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
import DataTable from '../../components/DataTable'

const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/;

// --- DRY HELPERS ---
function useShowWithTimeout(show, timeout = 1500) {
    const [showContent, setShowContent] = useState(false);
    const timeoutRef = useRef(null);
    useEffect(() => {
        if (show) {
            setShowContent(true);
        } else {
            timeoutRef.current = setTimeout(() => setShowContent(false), timeout);
        }
        return () => clearTimeout(timeoutRef.current);
    }, [show, timeout]);
    return showContent;
}

function useSortableData(initialConfig) {
    const [sortConfig, setSortConfig] = useState(initialConfig);
    const handleSort = (key) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'desc' ? 'asc' : 'desc' };
            } else {
                return { key, direction: 'desc' };
            }
        });
    };
    return [sortConfig, handleSort];
}

// DRY sorting utility
function getSortedData(arr, config, keyMap) {
    return [...arr].sort((a, b) => {
        let valA = keyMap[config.key](a);
        let valB = keyMap[config.key](b);
        if (config.key === 'createdAt' || config.key === 'updatedAt') {
            return config.direction === 'desc' ? valB - valA : valA - valB;
        } else {
            return config.direction === 'desc'
                ? valB.localeCompare(valA)
                : valA.localeCompare(valB);
        }
    });
}

// DRY empty row renderer
const renderEmptyRow = (colCount, message) => (
    <tr>
        <td colSpan={colCount} style={{ textAlign: 'center' }}>{message}</td>
    </tr>
);

function renderStatus({ loading, error, errorMsg }) {
    if (loading) return <p>Loading...</p>;
    if (error) return <p className="errmsg">{errorMsg}</p>;
    return null;
}

function TableHeader({ columns, sortConfig, onSort }) {
    return (
        <tr>
            {columns.map(col => (
                <th
                    key={col.key}
                    className={col.className}
                    style={col.sortable ? { cursor: 'pointer' } : undefined}
                    onClick={col.sortable ? () => onSort(col.key) : undefined}
                >
                    <span className="header-text">{col.label}</span>
                    {col.sortable && sortConfig.key === col.key ? (
                        <span className="sort-arrow">{sortConfig.direction === 'desc' ? '▼' : '▲'}</span>
                    ) : ''}
                </th>
            ))}
        </tr>
    );
}

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

    // State for search in notes table
    const [notesSearch, setNotesSearch] = useState("");

    // State for user replies aggregation
    const [userReplies, setUserReplies] = useState([])
    const [repliesLoading, setRepliesLoading] = useState(false)
    const [repliesError, setRepliesError] = useState(null)

    // Sorting hooks for notes and replies
    const [notesSortConfig, handleNotesSort] = useSortableData({ key: 'updatedAt', direction: 'desc' });
    const [repliesSortConfig, handleRepliesSort] = useSortableData({ key: 'createdAt', direction: 'desc' });

    // Show/hide transitions
    const showNotesContent = useShowWithTimeout(showActivity && selectedActivity === 'notes');
    const showRepliesContent = useShowWithTimeout(showActivity && selectedActivity === 'replies');
    const showDeleteConfirmContent = useShowWithTimeout(showDeleteConfirm);

    // Fetch user replies as soon as userId and token are available
    useEffect(() => {
        const fetchUserReplies = async () => {
            if (userId && token) {
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
    }, [userId, token])

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
    let sortedAndFilteredNoteIds = [];
    if (notesSuccess && notesData) {
        sortedAndFilteredNoteIds = notesData.ids
            .filter(noteId => notesData.entities[noteId].username === username)
            .filter(noteId => {
                const note = notesData.entities[noteId];
                const searchLower = notesSearch.toLowerCase();
                return note.title.toLowerCase().includes(searchLower);
            });
        sortedAndFilteredNoteIds = getSortedData(
            sortedAndFilteredNoteIds,
            notesSortConfig,
            {
                title: id => notesData.entities[id].title.toLowerCase(),
                username: id => notesData.entities[id].username.toLowerCase(),
                createdAt: id => new Date(notesData.entities[id].createdAt),
                updatedAt: id => new Date(notesData.entities[id].updatedAt)
            }
        );
    }

    // For replies sorting
    const sortedReplies = getSortedData(userReplies, repliesSortConfig, {
        noteTitle: r => r.noteTitle.toLowerCase(),
        text: r => r.text.toLowerCase(),
        createdAt: r => new Date(r.createdAt)
    });

    // Table columns
    const notesColumns = [
        { key: 'title', label: 'Title', className: 'table__th table__title', sortable: true },
        { key: 'username', label: 'Owner', className: 'table__th table__username', sortable: true },
        { key: 'createdAt', label: 'Created', className: 'table__th note__created', sortable: true },
        { key: 'updatedAt', label: 'Updated', className: 'table__th note__updated', sortable: true },
        { key: 'expand', label: 'Expand', className: 'table__th note__expand', sortable: false }
    ];
    const repliesColumns = [
        { key: 'noteTitle', label: 'Note Title', className: 'table__th', sortable: true },
        { key: 'text', label: 'Reply', className: 'table__th', sortable: true },
        { key: 'createdAt', label: 'Date', className: 'table__th', sortable: true },
        { key: 'expand', label: 'Expand', className: 'table__th note__expand', sortable: false }
    ];

    // Activity buttons
    const userNotesCount = notesSuccess && notesData
        ? notesData.ids.filter(noteId => notesData.entities[noteId].username === username).length
        : 0;
    const userRepliesCount = userReplies.length;
    const badgeStyle = { marginLeft: 8, background: '#236323', color: '#fff', borderRadius: '12px', padding: '2px 8px', fontSize: '0.9em', display: 'inline-block' };
    const activities = [
        { key: 'notes', label: 'Notes', count: userNotesCount },
        { key: 'replies', label: 'Replies', count: userRepliesCount },
        { key: 'likes', label: 'Likes' }
    ];

    // DRY helper for activity label with badge
    const renderActivityLabel = (label, count) => (
        <>
            {label}
            {count > 0 && <span style={badgeStyle}>{count}</span>}
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

    return (
        <section className="profile">
            <div>
            <h2>My Profile</h2>
            <p><strong>Username:</strong> {username}</p>
            {email && <p><strong>Email:</strong> {email}</p>}
            <p><strong>Roles:</strong> {roles && roles.length ? roles.join(', ') : 'None'}</p>

                {/* User Activity Button */}
                <div>
                    <button className="button profile-wide-btn" onClick={handleShowActivityToggle}>
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
                                style={{ pointerEvents: showActivity ? 'auto' : 'none' }}
                                onClick={() => handleActivitySelect(act.key)}
                            >
                                {renderActivityLabel(act.label, act.count)}
                            </button>
                        ))}
                    </div>
                    {/* Show notes table if Notes activity is selected */}
                    <div className={`profile-buttons-transition${showActivity && selectedActivity === 'notes' ? ' show' : ''}`}>
                    {showNotesContent && (
                        <>
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
                            {renderStatus({ loading: notesLoading, error: notesError, errorMsg: notesErrorObj?.data?.message || 'Error loading notes' })}
                            {notesSuccess && notesData && (
                                <DataTable
                                    columns={notesColumns}
                                    data={sortedAndFilteredNoteIds}
                                    emptyMsg="No notes found"
                                    renderRow={noteId => <Note key={noteId} noteId={noteId} />}
                                    sortConfig={notesSortConfig}
                                    onSort={handleNotesSort}
                                    tableClassName="table table--notes"
                                    theadClassName="table__thead"
                                />
                            )}
                        </>
                    )}
                    </div>
                </div>

                {/* Show replies table if Replies activity is selected */}
                <div className={`profile-buttons-transition${showActivity && selectedActivity === 'replies' ? ' show' : ''}`}>
                {showRepliesContent && (
                    <>
                    {renderStatus({ loading: repliesLoading, error: repliesError, errorMsg: repliesError })}
                    {!repliesLoading && !repliesError && (
                        <DataTable
                            columns={repliesColumns}
                            data={sortedReplies}
                            emptyMsg="No replies found"
                            renderRow={reply => (
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
                            )}
                            sortConfig={repliesSortConfig}
                            onSort={handleRepliesSort}
                            tableClassName="table table--replies"
                            theadClassName="table__thead"
                        />
                    )}
                    </>
                )}
                </div>

                {/* Change Password button and form always visible */}
                {selectedActivity === null && (
                  <div>
                      <button className="button profile-wide-btn" onClick={handleShowChangePwdToggle}>
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
                                  <button className="button form__login-button" type="submit" disabled={isLoading || !pwdValid || !passwordsMatch || !user}>
                                      {isLoading ? 'Updating...' : 'Set New Password'}
                                  </button>
                              </div>
                          </form>
                      </div>
                  </div>
                )}
                <hr />
            </div>
            {/* Delete button always at the bottom when visible */}
            {!selectedActivity && (
                <div>
            <button className="button delete-button" onClick={() => setShowDeleteConfirm(true)} disabled={isDeleting}>
                Delete My Account
            </button>
            <div className={`profile-buttons-transition${showDeleteConfirm ? ' show' : ''}`}>
            {showDeleteConfirmContent && (
                <>
                    <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                    <div className="delete-confirm-actions">
                        <button className="button delete-button" onClick={handleDeleteAccount} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                        </button>
                        <button className="button" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
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