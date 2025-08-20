import useAuth from "../../hooks/useAuth";
import { useState } from "react";
import {
  useUpdateUserMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
} from "./usersApiSlice";
import {
  useGetForumsQuery,
  useGetRepliesCountByUserQuery,
} from "../forums/forumsApiSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../auth/authSlice";
import { selectCurrentToken } from "../auth/authSlice";
import LikeActivity from "../likes/LikeActivity";
import ForumActivity from "../forums/ForumActivity";
import ReplyActivity from "../replies/ReplyActivity";

const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/;

// --- MAIN COMPONENT ---
// Profile component for displaying and managing the current user's profile, password, and activity
const Profile = () => {
  // Get current user authentication info (username, roles, userId)
  const { username, roles, userId } = useAuth();
  // State for toggling the password change form
  const [showChangePwd, setShowChangePwd] = useState(false);
  // State for new password and confirmation fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Mutation hook for updating user (used for password change)
  const [updateUser, { isLoading, isError, error }] = useUpdateUserMutation();
  // Mutation hook for deleting user (used for account deletion)
  const [
    deleteUser,
    { isLoading: isDeleting, isError: isDeleteError, error: deleteError },
  ] = useDeleteUserMutation();
  // State for displaying a success message after password change
  const [successMsg, setSuccessMsg] = useState("");
  // State for password validation and whether the field has been touched
  const [pwdValid, setPwdValid] = useState(false);
  const [pwdTouched, setPwdTouched] = useState(false);
  // State for showing the delete confirmation dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // State for whether the confirm password field has been touched
  const [confirmTouched, setConfirmTouched] = useState(false);
  // State for toggling the user activity section
  const [showActivity, setShowActivity] = useState(false);
  // State for which activity type is selected (forums, replies, likes)
  const [selectedActivity, setSelectedActivity] = useState(null);
  // Navigation and Redux hooks for routing and authentication
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector(selectCurrentToken);

  // Fetch all forums to count how many the user has created
  const { data: forumsData } = useGetForumsQuery("forumsList", {refetchOnMountOrArgChange: true});
  // Calculate the number of forums created by the user
  const forumsCount = forumsData
    ? forumsData.ids.filter(
        (id) => forumsData.entities[id].username === username
      ).length
    : 0;

  // Fetch the number of replies by the user
  const { data: repliesCount = 0 } = useGetRepliesCountByUserQuery(userId, {
    skip: !userId,
    refetchOnMountOrArgChange: true,
  });

  // Handler for selecting a user activity type (forums, replies, likes)
  const handleActivitySelect = (activity) => {
    setShowActivity(true);
    setSelectedActivity(activity);
    setShowChangePwd(false);
  };

  // Handler for toggling the user activity section
  const handleShowActivityToggle = () => {
    setShowActivity((v) => !v);
    setSelectedActivity(null);
    setShowChangePwd(false);
  };

  // Handler for toggling the password change form
  const handleShowChangePwdToggle = () => {
    setShowChangePwd((v) => !v);
    setShowActivity(false);
    setSelectedActivity(null);
  };

  // Fetch the current user object from the users list
  const { user } = useGetUsersQuery("usersList", {
    selectFromResult: ({ data }) => ({
      user: data?.entities[userId],
    }),
  });
  // Get the user's email if available
  const email = user?.email;

  // Show loading message if user data is not yet available
  if (!user) return <p>Loading profile...</p>;

  // Handler for new password input change
  // Validates password and marks field as touched
  const handlePwdChange = (e) => {
    const val = e.target.value;
    setNewPassword(val);
    setPwdTouched(true);
    setPwdValid(PWD_REGEX.test(val));
  };

  // Handler for confirm password input change
  // Marks confirm field as touched
  const handleConfirmChange = (e) => {
    setConfirmPassword(e.target.value);
    setConfirmTouched(true);
  };

  // Check if new password and confirmation match
  const passwordsMatch = newPassword === confirmPassword;

  // Handler for submitting the password change form
  // Only submits if password is valid and matches confirmation
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    if (!pwdValid || !passwordsMatch) return;
    try {
      await updateUser({
        id: userId,
        username: user.username,
        roles: user.roles,
        active: user.active,
        email: user.email,
        password: newPassword,
      }).unwrap();
      setSuccessMsg("Password updated successfully!");
      setShowChangePwd(false);
      setNewPassword("");
      setConfirmPassword("");
      setPwdTouched(false);
      setPwdValid(false);
      setConfirmTouched(false);
    } catch (err) {
      // error handled by isError
    }
  };

  // Handler for deleting the user's account
  // Logs out and navigates to home on success
  const handleDeleteAccount = async () => {
    try {
      await deleteUser({ id: userId }).unwrap();
      dispatch(logOut());
      navigate("/");
    } catch (err) {
      // error handled by isDeleteError
    }
  };

  // List of user activities for the activity section
  const activities = [
    { key: "forums", label: "Forums", count: forumsCount },
    { key: "replies", label: "Replies", count: repliesCount },
    { key: "likes", label: "Likes" },
  ];

  // Render the label for an activity button, including a badge if there is a count
  const renderActivityLabel = (label, count) => (
    <>
      {label}
      {count > 0 && <span className="activity-counter-badge">{count}</span>}
    </>
  );

  // Get error message for password field
  const getPwdError = () => {
    if (!pwdValid && pwdTouched)
      return "Password must be 4-12 characters and only contain letters, numbers, and !@#$%";
    return "";
  };
  // Get error message for confirm password field
  const getConfirmError = () => {
    if (confirmTouched && !passwordsMatch) return "Passwords do not match";
    return "";
  };

  // --- RENDER PROFILE UI ---
  return (
    <section className="profile">
      {/* Profile info section, only shown if not viewing activity */}
      {!showActivity && (
        <div>
          <h2>My Profile</h2>
          <p>
            <strong>Username:</strong> {username}
          </p>
          {/* Show email if available */}
          {email && (
            <p>
              <strong>Email:</strong> {email}
            </p>
          )}
          <p>
            <strong>Roles:</strong>{" "}
            {roles && roles.length ? roles.join(", ") : "None"}
          </p>
        </div>
      )}
      <div>
        <div>
          {/* Button to toggle user activity section */}
          <button className="button" onClick={handleShowActivityToggle}>
            {showActivity ? "Hide User Activity" : "Show User Activity"}
          </button>
          {/* Activity type selection buttons, shown when activity section is open and no activity is selected */}
          <div
            className={`profile__buttons-transition${
              showActivity && !selectedActivity ? " show" : ""
            }`}
          >
            {activities.map((act) => (
              <button
                key={act.key}
                className="button profile__button"
                type="button"
                tabIndex={showActivity ? 0 : -1}
                onClick={() => handleActivitySelect(act.key)}>
                {renderActivityLabel(act.label, act.count)}
              </button>
            ))}
          </div>

          {/* Forums activity section */}
          <div
            className={`profile__buttons-transition${
              showActivity && selectedActivity === "forums" ? " show" : ""
            }`}>
            <ForumActivity
              userId={userId}
              username={username}
              show={showActivity && selectedActivity === "forums"}
            />
          </div>

          {/* Replies activity section */}
          <div
            className={`profile__buttons-transition${
              showActivity && selectedActivity === "replies" ? " show" : ""
            }`}>
            <ReplyActivity
              userId={userId}
              token={token}
              show={showActivity && selectedActivity === "replies"}
            />
          </div>

          {/* Likes activity section */}
          <div
            className={`profile__buttons-transition${
              showActivity && selectedActivity === "likes" ? " show" : ""
            }`}>
            <LikeActivity
              userId={userId}
              show={showActivity && selectedActivity === "likes"}
            />
          </div>

          {/* Password change form, only shown if not viewing activity */}
          {!showActivity && (
            <div>
              <button
                className="button"
                onClick={handleShowChangePwdToggle}>
                {showChangePwd ? "Cancel" : "Change Password"}
              </button>
              <div
                className={`profile__buttons-transition${
                  showChangePwd ? " show" : ""
                }`}>
                <form
                  className="form"
                  onSubmit={handleChangePassword}
                  aria-hidden={!showChangePwd}
                  tabIndex={showChangePwd ? 0 : -1}>
                  <div className="form__title-row">
                    <h2>Change Password</h2>
                  </div>
                  {/* Error message for password update */}
                  {isError && (
                    <p className="error-message">
                      {error?.data?.message || "Error updating password"}
                    </p>
                  )}
                  {/* Read-only username input for accessibility */}
                  <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={username || ""}
                    readOnly
                    tabIndex={-1}
                    aria-hidden="true"
                    className="offscreen"
                  />
                  {/* New password input */}
                  <label htmlFor="new-password">
                    New Password:{" "}
                    <span className="nowrap">
                      [4-12 characters. Letters, numbers, !@#$% only]
                    </span>
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={handlePwdChange}
                    onBlur={() => setPwdTouched(true)}
                    placeholder="Enter your new password"
                    required
                    className="form__input"
                    autoComplete="new-password"
                  />
                  {/* Password validation error */}
                  {getPwdError() && <p className="error-message">{getPwdError()}</p>}
                  {/* Confirm password input */}
                  <label htmlFor="confirm-password">
                    Confirm New Password:
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmChange}
                    onBlur={() => setConfirmTouched(true)}
                    placeholder="Re-enter your new password"
                    required
                    className="form__input"
                    autoComplete="new-password"
                  />
                  {/* Confirm password validation error */}
                  {getConfirmError() && (
                    <p className="error-message">{getConfirmError()}</p>
                  )}
                  <div className="form__actions">
                    <button
                      className="button"
                      type="submit"
                      disabled={
                        isLoading || !pwdValid || !passwordsMatch || !user
                      }>
                      {isLoading ? "Updating..." : "Set New Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Success message after password change */}
          {successMsg && <p className="success-message">{successMsg}</p>}
          {/* Divider below profile actions */}
          {!showActivity && <hr />}
        </div>
      </div>
      {/* Account deletion section, only shown if not viewing activity */}
      {!showActivity && (
        <div>
          <button
            className="button button--delete"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}>
            Delete My Account
          </button>
          <div
            className={`profile__buttons-transition${
              showDeleteConfirm ? " show" : ""
            }`}>
            {/* Delete confirmation dialog */}
            {
              <>
                <p>
                  Are you sure you want to delete your account? This action
                  cannot be undone.
                </p>
                <div>
                  <button
                    className="button button--delete form__actions"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
                  </button>
                  <button
                    className="button form__actions"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}>
                    Cancel
                  </button>
                </div>
                {/* Error message for account deletion */}
                {isDeleteError && (
                  <p className="error-message">
                    {deleteError?.data?.message || "Error deleting account"}
                  </p>
                )}
              </>
            }
          </div>
        </div>
      )}
    </section>
  );
};

export default Profile;
