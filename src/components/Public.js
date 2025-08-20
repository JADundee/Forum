import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
import { useLoginMutation } from "../features/auth/authApiSlice";
import usePersist from "../hooks/usePersist";
import useTitle from "../hooks/useTitle";
import PublicHeader from "./PublicHeader";

/**
 * Public landing/login page component for unauthenticated users.
 * Handles login form, error display, and navigation to registration/forgot password.
 */
const Public = () => {
  useTitle("Employee Login");

  // Refs for input focus and error message
  const userRef = useRef();
  const errRef = useRef();

  // State for login form fields and error message
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [persist, setPersist] = usePersist();

  // Navigation and Redux hooks
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Login mutation hook
  const [login, { isLoading }] = useLoginMutation();

  // Check if login form can be submitted
  const canLogin = username.trim() !== "" && password.trim() !== "";

  // Focus username input on mount
  useEffect(() => {
    userRef.current.focus();
  }, []);

  // Clear error message when username or password changes
  useEffect(() => {
    setErrMsg("");
  }, [username, password]);

  /**
   * Handles login form submission, sets credentials, and navigates on success.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { accessToken } = await login({ username, password }).unwrap();
      dispatch(setCredentials({ accessToken, persist }));
      setUsername("");
      setPassword("");
      navigate("/dash");
    } catch (err) {
      if (!err.status) {
        setErrMsg("No Server Response");
      } else if (err.status === 400) {
        setErrMsg("Missing Username and/or Password");
      } else if (err.status === 401) {
        setErrMsg("Invalid Username and/or Password");
      } else {
        setErrMsg(err.data?.message);
      }
    }
  };

  // Error message class for accessibility
  const errClass = errMsg ? "error-message" : "offscreen";

  // Handlers for input changes
  const handleUserInput = (e) => setUsername(e.target.value);
  const handlePwdInput = (e) => setPassword(e.target.value);
  const handleToggle = () => setPersist((prev) => !prev);

  const onNewUserClicked = () => navigate("/register");
  const onForgotPasswordClicked = () => navigate("/forgot-password");

  if (isLoading) return <p>Loading...</p>;

  // Main content for the public login/landing page, including login form, error display, and navigation actions
  const content = (
    <section className="public">
      {/* Public page header component */}
      <PublicHeader />
      <main className="login">
        {/* Error message display for login failures, uses aria-live for accessibility */}
        <p ref={errRef} className={errClass} aria-live="assertive">
          {errMsg}
        </p>

        {/* Login form for username/email and password */}
        <form className="form" onSubmit={handleSubmit}>
          {/* Username or email input field */}
          <label htmlFor="username">Username or Email:</label>
          <input
            className="form__input"
            type="text"
            id="username"
            ref={userRef}
            value={username}
            onChange={handleUserInput}
            autoComplete="off"
            placeholder="Enter your username or email"
            required
          />

          {/* Password input field */}
          <label htmlFor="password">Password:</label>
          <input
            className="form__input"
            type="password"
            id="password"
            onChange={handlePwdInput}
            value={password}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          {/* Persist login (remember me) checkbox */}
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

          {/* Sign In button, disabled if form is incomplete */}
          <button className="button" disabled={!canLogin}>
            Sign In
          </button>

          {/* Forgot Password button, navigates to reset page */}
          <button
            className="button button--delete"
            type="button"
            onClick={onForgotPasswordClicked}>
            Forgot Password?
          </button>

          {/* Registration prompt and button for new users */}
          <p>New to the Forum?</p>
          <button className="button button--alt" onClick={onNewUserClicked}>
            Register
          </button>
        </form>
      </main>
      {/* Footer section (currently empty, can be used for copyright/info) */}
      <footer></footer>
    </section>
  );
  return content;
};
export default Public;
