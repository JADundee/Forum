import useAuth from '../../hooks/useAuth'
import { useState } from 'react'
import { useUpdateUserMutation, useGetUsersQuery, useDeleteUserMutation } from './usersApiSlice'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logOut } from '../auth/authSlice'

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
    const navigate = useNavigate()
    const dispatch = useDispatch()

    // Fetch user data to get email
    const { user } = useGetUsersQuery('usersList', {
        selectFromResult: ({ data }) => ({
            user: data?.entities[userId]
        })
    })
    const email = user?.email

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

    return (
        <section className="profile">
            <h2>My Profile</h2>
            <p><strong>Username:</strong> {username}</p>
            {email && <p><strong>Email:</strong> {email}</p>}
            <p><strong>Roles:</strong> {roles && roles.length ? roles.join(', ') : 'None'}</p>
            <button className="button" onClick={() => setShowChangePwd(v => !v)}>
                {showChangePwd ? 'Cancel' : 'Change Password'}
            </button>
            {showChangePwd && (
                <form className="form" onSubmit={handleChangePassword} style={{ marginTop: '1em' }}>
                    <label htmlFor="new-password">
                        New Password: <span className="nowrap">[4-12 characters. Letters, numbers, !@#$% only]</span>
                    </label>
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
                    <button className="button" type="submit" disabled={isLoading || !pwdValid || !passwordsMatch || !user}>
                        {isLoading ? 'Updating...' : 'Set New Password'}
                    </button>
                    {isError && <p className="errmsg">{error?.data?.message || 'Error updating password'}</p>}
                </form>
            )}
            {successMsg && <p className="msgmsg">{successMsg}</p>}
            <hr style={{ margin: '2em 0' }} />
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
        </section>
    )
}

export default Profile 