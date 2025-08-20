import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PublicHeader from "../../components/PublicHeader";
import { useResetPasswordMutation } from "./authApiSlice";

const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/;

/**
 * Reset password page for users with a valid reset token.
 * Handles password validation, confirmation, and submission.
 */
const ResetPassword = () => {
  // Get the reset token from the URL params
  const { token } = useParams();
  // State for new password and its validation
  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);
  // State for confirm password and its validation
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validConfirm, setValidConfirm] = useState(false);
  // State to check if passwords match
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  // State for user feedback messages
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // State for loading indicator
  const [loading, setLoading] = useState(false);
  // Navigation hook
  const navigate = useNavigate();
  // RTK Query mutation hook for resetting password
  const [resetPassword] = useResetPasswordMutation();

  // Handler: update password state and validation on input change
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setValidPassword(PWD_REGEX.test(value));
    setPasswordsMatch(value === confirmPassword);
  };

  // Handler: update confirm password state and validation on input change
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setValidConfirm(PWD_REGEX.test(value));
    setPasswordsMatch(password === value);
  };

  // Handler: submit the form to reset the password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await resetPassword({ token, password }).unwrap();
      setMessage(result.message);
    } catch (err) {
      setError(err?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const validPwdClass = !validPassword ? "form__input--incomplete" : "";
  const validConfirmClass = !validConfirm ? "form__input--incomplete" : "";
  const canSubmit = validPassword && validConfirm && passwordsMatch && !loading;

  return (
    <section className="public">
      <PublicHeader />
      <h2>Reset Password</h2>
      <main className="login">
        {message && (
          <>
            <p className="success-message">{message}</p>
            <div className="form__actions">
              <button
                className="button"
                type="button"
                onClick={() => navigate("/")}>
                Return to Login
              </button>
            </div>
          </>
        )}
        {error && <p className="error-message">{error}</p>}
        {!message && (
          <form className="form" onSubmit={handleSubmit}>
            <label htmlFor="password">
              New Password:{" "}
              <span className="nowrap">
                [4-12 characters. Include a symbol]
              </span>
            </label>
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
            {!passwordsMatch && (
              <p className="error-message">Passwords do not match</p>
            )}
            <div className="form__actions">
              <button className={`button`} type="submit" disabled={!canSubmit}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              <button
                className="button"
                type="button"
                onClick={() => navigate("/")}>
                Back to Login
              </button>
            </div>
          </form>
        )}
      </main>
    </section>
  );
};

export default ResetPassword;
