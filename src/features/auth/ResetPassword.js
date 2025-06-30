import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PublicHeader from '../../components/PublicHeader'

const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/

const ResetPassword = () => {
    const { token } = useParams()
    const [password, setPassword] = useState('')
    const [validPassword, setValidPassword] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState('')
    const [validConfirm, setValidConfirm] = useState(false)
    const [passwordsMatch, setPasswordsMatch] = useState(true)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handlePasswordChange = (e) => {
        const value = e.target.value
        setPassword(value)
        setValidPassword(PWD_REGEX.test(value))
        setPasswordsMatch(value === confirmPassword)
    }

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value
        setConfirmPassword(value)
        setValidConfirm(PWD_REGEX.test(value))
        setPasswordsMatch(password === value)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')
        try {
            const response = await fetch('http://localhost:3500/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            })
            const data = await response.json()
            if (response.ok) {
                setMessage(data.message)
            } else {
                setError(data.message || 'Something went wrong')
            }
        } catch (err) {
            setError('Network error')
        } finally {
            setLoading(false)
        }
    }

    const validPwdClass = !validPassword ? 'form__input--incomplete' : ''
    const validConfirmClass = !validConfirm ? 'form__input--incomplete' : ''
    const canSubmit = validPassword && validConfirm && passwordsMatch && !loading

    return (
        <section className="public">
            <PublicHeader />
            <h2>Reset Password</h2>
            <main className="login">
                {message && <>
                    <p className="msgmsg">{message}</p>
                    <div className="form__action-buttons">
                        <button className="button" type="button" onClick={() => navigate('/')}>Return to Login</button>
                    </div>
                </>}
                {error && <p className="errmsg">{error}</p>}
                {!message && (
                    <form className="form" onSubmit={handleSubmit}>
                        <label htmlFor="password">New Password: <span className="nowrap">[4-12 characters. Include a symbol]</span></label>
                        <input
                            className={`form__input ${validPwdClass}`}
                            type="password"
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        />
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <input
                            className={`form__input ${validConfirmClass}`}
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            required
                        />
                        {!passwordsMatch && <p className="errmsg">Passwords do not match</p>}
                        <div className="form__action-buttons">
                            <button className={`button form__login-button`} type="submit" disabled={!canSubmit}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                            <button className="button" type="button" onClick={() => navigate('/')}>Back to Login</button>
                        </div>
                    </form>
                )}
            </main>
        </section>
    )
}

export default ResetPassword 