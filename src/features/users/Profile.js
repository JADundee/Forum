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
const Profile = () => {
  const { username, roles, userId } = useAuth();
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updateUser, { isLoading, isError, error }] = useUpdateUserMutation();
  const [
    deleteUser,
    { isLoading: isDeleting, isError: isDeleteError, error: deleteError },
  ] = useDeleteUserMutation();
  const [successMsg, setSuccessMsg] = useState("");
  const [pwdValid, setPwdValid] = useState(false);
  const [pwdTouched, setPwdTouched] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector(selectCurrentToken);

  // Fetch forums count for this user
  const { data: forumsData } = useGetForumsQuery("forumsList");
  const forumsCount = forumsData
    ? forumsData.ids.filter((id) => forumsData.entities[id].username === username)
        .length
    : 0;

  // Fetch replies count for this user
  const { data: repliesCount = 0 } = useGetRepliesCountByUserQuery(userId, {
    skip: !userId,
  });

  // Centralized handlers for toggling UI states
  const handleActivitySelect = (activity) => {
    setShowActivity(true);
    setSelectedActivity(activity);
    setShowChangePwd(false);
  };

  const handleShowActivityToggle = () => {
    setShowActivity((v) => !v);
    setSelectedActivity(null);
    setShowChangePwd(false);
  };

  const handleShowChangePwdToggle = () => {
    setShowChangePwd((v) => !v);
    setShowActivity(false);
    setSelectedActivity(null);
  };

  // Fetch user data to get email
  const { user } = useGetUsersQuery("usersList", {
    selectFromResult: ({ data }) => ({
      user: data?.entities[userId],
    }),
  });
  const email = user?.email;

  // Guard: if user is not loaded, show loading message
  if (!user) return <p>Loading profile...</p>;

  const handlePwdChange = (e) => {
    const val = e.target.value;
    setNewPassword(val);
    setPwdTouched(true);
    setPwdValid(PWD_REGEX.test(val));
  };

  const handleConfirmChange = (e) => {
    setConfirmPassword(e.target.value);
    setConfirmTouched(true);
  };

  const passwordsMatch = newPassword === confirmPassword;

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

  const handleDeleteAccount = async () => {
    try {
      await deleteUser({ id: userId }).unwrap();
      dispatch(logOut());
      navigate("/");
    } catch (err) {
      // error handled by isDeleteError
    }
  };

  // Update activities array to use real counts
  const activities = [
    { key: "forums", label: "Forums", count: forumsCount },
    { key: "replies", label: "Replies", count: repliesCount },
    { key: "likes", label: "Likes" },
  ];

  // DRY helper for activity label with badge
  const renderActivityLabel = (label, count) => (
    <>
      {label}
      {count > 0 && <span className="activity-counter-badge">{count}</span>}
    </>
  );

  // DRY helpers for password error messages
  const getPwdError = () => {
    if (!pwdValid && pwdTouched)
      return "Password must be 4-12 characters and only contain letters, numbers, and !@#$%";
    return "";
  };
  const getConfirmError = () => {
    if (confirmTouched && !passwordsMatch) return "Passwords do not match";
    return "";
  };

  return (
    <section className="profile">
      {!showActivity && (
        <div>
          <h2>My Profile</h2>
          <p>
            <strong>Username:</strong> {username}
          </p>
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
          <button className="button" onClick={handleShowActivityToggle}>
            {showActivity ? "Hide User Activity" : "Show User Activity"}
          </button>
          <div
            className={`profile-buttons-transition${
              showActivity && !selectedActivity ? " show" : ""
            }`}
            aria-hidden={!showActivity || !!selectedActivity}>
            {activities.map((act) => (
              <button
                key={act.key}
                className="button profile-btn"
                type="button"
                tabIndex={showActivity ? 0 : -1}
                onClick={() => handleActivitySelect(act.key)}>
                {renderActivityLabel(act.label, act.count)}
              </button>
            ))}
          </div>

          <div
            className={`profile-buttons-transition${
              showActivity && selectedActivity === "forums" ? " show" : ""
            }`}>
            <ForumActivity
              userId={userId}
              username={username}
              show={showActivity && selectedActivity === "forums"}
            />
          </div>

          <div
            className={`profile-buttons-transition${
              showActivity && selectedActivity === "replies" ? " show" : ""
            }`}>
            <ReplyActivity
              userId={userId}
              token={token}
              show={showActivity && selectedActivity === "replies"}
            />
          </div>

          <div
            className={`profile-buttons-transition${
              showActivity && selectedActivity === "likes" ? " show" : ""
            }`}>
            <LikeActivity
              userId={userId}
              show={showActivity && selectedActivity === "likes"}
            />
          </div>

          {!showActivity && (
            <div>
              <button
                className="button change-password-btn"
                onClick={handleShowChangePwdToggle}>
                {showChangePwd ? "Cancel" : "Change Password"}
              </button>
              <div
                className={`profile-buttons-transition${
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
                  {isError && (
                    <p className="errmsg">
                      {error?.data?.message || "Error updating password"}
                    </p>
                  )}
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
                  />
                  {getPwdError() && <p className="errmsg">{getPwdError()}</p>}
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
                  />
                  {getConfirmError() && (
                    <p className="errmsg">{getConfirmError()}</p>
                  )}
                  <div className="form__action-buttons">
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
          {successMsg && <p className="msgmsg">{successMsg}</p>}
          {!showActivity && <hr />}
        </div>
      </div>
      {!showActivity && (
        <div>
          <button
            className="button delete-button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}>
            Delete My Account
          </button>
          <div
            className={`profile-buttons-transition${
              showDeleteConfirm ? " show" : ""
            }`}>
            {
              <>
                <p>
                  Are you sure you want to delete your account? This action
                  cannot be undone.
                </p>
                <div>
                  <button
                    className="delete-button form__action-buttons"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
                  </button>
                  <button
                    className="button form__action-buttons"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}>
                    Cancel
                  </button>
                </div>
                {isDeleteError && (
                  <p className="errmsg">
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