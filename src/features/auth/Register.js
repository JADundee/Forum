import { useState, useEffect } from "react";
import { useAddNewUserMutation } from "../users/usersApiSlice";
import { useNavigate } from "react-router-dom";
import PublicHeader from "../../components/PublicHeader";

const USER_REGEX = /^[A-z]{3,20}$/;
const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INITIAL_STATE = {
  username: "",
  password: "",
  email: "",
  roles: ["Member"],
};

/**
 * Registration page for new users.
 * Handles form validation, submission, and navigation on success.
 */
const Register = () => {
  // RTK Query mutation hook for registering a new user
  const [addNewUser, { isLoading, isSuccess, isError, error }] = useAddNewUserMutation();

  // Navigation hook for redirecting after registration
  const navigate = useNavigate();

  // State for form fields (username, password, email, roles)
  const [form, setForm] = useState(INITIAL_STATE);
  // State for field validation status
  const [valid, setValid] = useState({
    username: false,
    password: false,
    email: false,
  });

  // Effect: validate form fields whenever they change
  useEffect(() => {
    setValid({
      username: USER_REGEX.test(form.username),
      password: PWD_REGEX.test(form.password),
      email: EMAIL_REGEX.test(form.email),
    });
  }, [form.username, form.password, form.email]);

  // Effect: reset form and navigate to login on successful registration
  useEffect(() => {
    if (isSuccess) {
      setForm(INITIAL_STATE);
      navigate("/");
      alert("Registration completed. Please login with your credentials.");
    }
  }, [isSuccess, navigate]);

  // Handler: update form state on input change
  const onInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Check if form can be saved
  const canSave =
    [form.roles.length, valid.username, valid.password, valid.email].every(
      Boolean
    ) && !isLoading;

  /**
   * Handles form submission to register a new user.
   */
  const onSaveUserClicked = async (e) => {
    e.preventDefault();
    if (canSave) {
      await addNewUser({
        username: form.username,
        email: form.email,
        password: form.password,
        roles: form.roles,
      });
    }
  };

  const navigateHome = () => navigate("/");

  const errClass = isError ? "errmsg" : "offscreen";
  const getInputClass = (field) =>
    !valid[field] ? "form__input--incomplete" : "";

  const content = (
    <section className="public">
      <PublicHeader />
      <main className="login">
        <p className={errClass}>{error?.data?.message}</p>
        <form className="form" onSubmit={onSaveUserClicked}>
          <div className="form__title-row">
            <h2>Create New Account</h2>
          </div>
          <label className="form__label" htmlFor="username">
            Username: <span className="nowrap">[3-20 letters]</span>
          </label>
          <input
            className={`form__input ${getInputClass("username")}`}
            id="username"
            name="username"
            type="text"
            autoComplete="off"
            value={form.username}
            onChange={onInputChange}
          />

          <label className="form__label" htmlFor="password">
            Password:{" "}
            <span className="nowrap">[4-12 characters. Include a symbol]</span>
          </label>
          <input
            className={`form__input ${getInputClass("password")}`}
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={onInputChange}
          />

          <label className="form__label" htmlFor="email">
            Email:
          </label>
          <input
            className={`form__input ${getInputClass("email")}`}
            id="email"
            name="email"
            type="email"
            autoComplete="off"
            value={form.email}
            onChange={onInputChange}
          />

          <div className="form__actions">
            <button className="button" title="Save" disabled={!canSave}>
              Create Account
            </button>
            <button className="button" type="button" onClick={navigateHome}>
              Back to Login
            </button>
          </div>
        </form>
      </main>
    </section>
  );

    return content;
};

export default Register;