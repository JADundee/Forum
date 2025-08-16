import { useState, useEffect } from "react";
import { useUpdateUserMutation, useDeleteUserMutation } from "./usersApiSlice";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../../config/roles";

// Username must be 3-20 alphabetic characters
const USER_REGEX = /^[A-z]{3,20}$/;
// Password must be 4-12 characters, allowing letters, numbers, and special characters
const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/;

// EditUserForm component for editing and deleting a user
const EditUserForm = ({ user }) => {
  // Mutation hook for updating a user
  const [updateUser, { isLoading, isSuccess, isError, error }] =
    useUpdateUserMutation();

  // Mutation hook for deleting a user
  const [
    deleteUser,
    { isSuccess: isDelSuccess, isError: isDelError, error: delerror },
  ] = useDeleteUserMutation();

  // Navigation hook
  const navigate = useNavigate();

  // State for form fields and validation
  const [username, setUsername] = useState(user.username);
  const [validUsername, setValidUsername] = useState(false);
  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);
  const [roles, setRoles] = useState(user.roles);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Validate username whenever it changes
  useEffect(() => {
    setValidUsername(USER_REGEX.test(username));
  }, [username]);

  // Validate password whenever it changes
  useEffect(() => {
    setValidPassword(PWD_REGEX.test(password));
  }, [password]);

  // Reset form and navigate away on successful update or delete
  useEffect(() => {
    console.log(isSuccess);
    if (isSuccess || isDelSuccess) {
      setUsername("");
      setPassword("");
      setRoles([]);
      navigate("/dash/users");
    }
  }, [isSuccess, isDelSuccess, navigate]);

  // Handlers for form field changes
  const onUsernameChanged = (e) => setUsername(e.target.value);
  const onPasswordChanged = (e) => setPassword(e.target.value);

  // Handler for roles selection change
  const onRolesChanged = (e) => {
    const values = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setRoles(values);
  };

  // Handler for saving user changes (update)
  // If password is provided, include it in the update; otherwise, only update username and roles
  const onSaveUserClicked = async (e) => {
    if (password) {
      await updateUser({ id: user.id, username, password, roles });
    } else {
      await updateUser({ id: user.id, username, roles });
    }
  };

  // Handler for deleting the user
  const onDeleteUserClicked = async () => {
    await deleteUser({ id: user.id });
  };

  // Generate <option> elements for each available role
  const options = Object.values(ROLES).map((role) => {
    return (
      <option key={role} value={role}>
        {" "}
        {role}
      </option>
    );
  });

  // Determine if the save button should be enabled
  // If password is being changed, require valid password; otherwise, only require valid username and roles
  let canSave;
  if (password) {
    canSave =
      [roles.length, validUsername, validPassword].every(Boolean) && !isLoading;
  } else {
    canSave = [roles.length, validUsername].every(Boolean) && !isLoading;
  }

  // CSS class for error message visibility
  const errClass = isError || isDelError ? "errmsg" : "offscreen";
  // CSS class for invalid username input
  const validUserClass = !validUsername ? "form__input--incomplete" : "";
  // CSS class for invalid password input (only if password is being changed)
  const validPwdClass =
    password && !validPassword ? "form__input--incomplete" : "";
  // CSS class for invalid roles selection
  const validRolesClass = !Boolean(roles.length)
    ? "form__input--incomplete"
    : "";

  // Error message content from update or delete operations
  const errContent = (error?.data?.message || delerror?.data?.message) ?? "";

  // Save button: only shown if not confirming delete
  let saveButton = null;
  saveButton = !showDeleteConfirm && (
    <button
      className="button"
      title="Save"
      onClick={onSaveUserClicked}
      disabled={!canSave}>
      Save
    </button>
  );

  // Delete button: shows confirmation dialog when clicked
  let deleteButton = null;
  deleteButton = !showDeleteConfirm ? (
    <button
      className="button button--delete"
      title="Delete"
      onClick={() => setShowDeleteConfirm(true)}>
      Delete
    </button>
  ) : (
    // Confirmation dialog for delete action
    <div className="confirm-delete">
      <span className="confirm-delete__text">
        Are you sure?
      </span>
      <button className="button button--delete" onClick={onDeleteUserClicked}>
        Yes, Delete
      </button>
      <button className="button" onClick={() => setShowDeleteConfirm(false)}>
        Cancel
      </button>
    </div>
  );

  // Cancel button: only shown if not confirming delete
  let cancelButton = null;
  cancelButton = !showDeleteConfirm && (
    <button
      type="button"
      className="button button--delete"
      onClick={() => navigate(-1)}>
      Cancel
    </button>
  );

  // Main form content for editing a user
  // Includes error message, form fields, and action buttons
  const content = (
    <>
      {/* Error message for update/delete failures */}
      <p className={errClass}>{errContent}</p>

      {/* User edit form */}
      <form className="form" onSubmit={(e) => e.preventDefault()}>
        <div className="form__title-row">
          {/* Form title */}
          <h2>Edit User</h2>
        </div>
        {/* Username input field */}
        <label className="form__label" htmlFor="username">
          Username: <span className="nowrap">[3-20 letters]</span>
        </label>
        <input
          className={`form__input ${validUserClass}`}
          id="username"
          name="username"
          type="text"
          autoComplete="off"
          value={username}
          onChange={onUsernameChanged}
        />
        {/* Password input field (optional) */}
        <label className="form__label" htmlFor="password">
          Password: <span className="nowrap">[empty = no change]</span>{" "}
          <span className="nowrap">[4-12 chars incl. !@#$%]</span>
        </label>
        <input
          className={`form__input ${validPwdClass}`}
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={onPasswordChanged}
        />
        {/* Roles selection dropdown */}
        <label className="form__label" htmlFor="roles">
          ASSIGNED ROLES:
        </label>
        <select
          id="roles"
          name="roles"
          className={`form__check ${validRolesClass}`}
          value={roles}
          onChange={onRolesChanged}>
          {options}
        </select>
        {/* Action buttons: Save, Delete, Cancel */}
        <div className="form__actions">
          {saveButton}
          {deleteButton}
          {cancelButton}
        </div>
      </form>
    </>
  );

  // Render the form content
  return content;
};
export default EditUserForm;
