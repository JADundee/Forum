import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../features/auth/authSlice'
import { useLoginMutation } from '../features/auth/authApiSlice'
import usePersist from '../hooks/usePersist'
import useTitle from '../hooks/useTitle'
import PublicHeader from './PublicHeader'

const Public = () => {
    useTitle('Employee Login')
    
    const userRef = useRef()
    const errRef = useRef()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errMsg, setErrMsg] = useState('')
    const [persist, setPersist] = usePersist()

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [login, { isLoading }] = useLoginMutation()

    const canLogin = username.trim() !== '' && password.trim() !== ''

    useEffect(() => {
        userRef.current.focus()
    }, [])

    useEffect(() => {
        setErrMsg('');
    }, [username, password])


    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { accessToken } = await login({ username, password }).unwrap()
            dispatch(setCredentials({ accessToken, persist }))
            setUsername('')
            setPassword('')
            navigate('/dash')
        } catch (err) {
            if (!err.status) {
                setErrMsg('No Server Response');
            } else if (err.status === 400) {
                setErrMsg('Missing Username and/or Password');
            } else if (err.status === 401) {
                setErrMsg('Invalid Username and/or Password');
            } else {
                setErrMsg(err.data?.message);
            }
        }
    }

    const errClass = errMsg ? "errmsg" : "offscreen"

    const handleUserInput = (e) => setUsername(e.target.value)
    const handlePwdInput = (e) => setPassword(e.target.value)
    const handleToggle = () => setPersist(prev => !prev)

    const onNewUserClicked = () => navigate('/register')
    const onForgotPasswordClicked = () => navigate('/forgot-password')

    if (isLoading) return <p>Loading...</p>

    const content = (
        <section className="public">
            <PublicHeader />
            <main className="login">
                <p ref={errRef} className={errClass} aria-live="assertive">{errMsg}</p>

                <form className="form" onSubmit={handleSubmit}>
                    <label htmlFor="username">Username or Email:</label>
                    <input
                        className="form__input"
                        type="text"
                        id="username"
                        ref={userRef}
                        value={username}
                        onChange={handleUserInput}
                        autoComplete="off"
                        placeholder='Enter your username or email'
                        required
                    />

                    <label htmlFor="password">Password:</label>
                    <input
                        className="form__input"
                        type="password"
                        id="password"
                        onChange={handlePwdInput}
                        value={password}
                        placeholder='Enter your password'
                        required
                    />
                    <label htmlFor="persist" className="form__persist">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            id="persist"
                            onChange={handleToggle}
                            checked={persist}
                        />
                        Trust This Device
                    </label>
                    <button className="button" disabled={!canLogin}>Sign In</button>
                    <button className="button delete-button" type="button" onClick={onForgotPasswordClicked}>
                            Forgot Password?
                    </button>
                    <p>New to the Forum?</p>
                    <button className="button alt-button" onClick={onNewUserClicked}>
                            Register
                        </button>
                </form>
            </main>
            <footer>
                
            </footer>
        </section>

    )
    return content
}
export default Public