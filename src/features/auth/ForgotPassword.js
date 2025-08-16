import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicHeader from "../../components/PublicHeader";
import { useForgotPasswordMutation } from "./authApiSlice";

/**
 * Forgot password page for users to request a password reset link.
 * Handles email input, submission, and displays messages.
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [forgotPassword] = useForgotPasswordMutation();

  // Handles form submission to request a password reset link.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await forgotPassword({ email }).unwrap();
      setMessage(result.message);
    } catch (err) {
      setError(err?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="public">
      <PublicHeader />
      <h2>Forgot Password</h2>
      <main className="login">
        {message && <p className="msgmsg">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        {!message && (
          <form className="form" onSubmit={handleSubmit}>
            <label htmlFor="email">Enter your email address:</label>
            <input
              className="form__input"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="form__actions">
              <button className="button" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <button
                className="button"
                type="button"
                onClick={() => navigate("/")}>
                Return to Login
              </button>
            </div>
          </form>
        )}
      </main>
    </section>
  );
};

export default ForgotPassword;
