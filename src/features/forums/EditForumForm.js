import { useState, useEffect } from "react";
import {
  useUpdateForumMutation,
  useDeleteForumMutation,
} from "./forumsApiSlice";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../hooks/useAuth";

const getInputClass = (value) => (value ? "" : "form__input--incomplete");

const ActionButton = ({ onClick, disabled, title, icon, className }) => (
  <button
    className={`button${className ? " " + className : ""}`}
    title={title}
    onClick={onClick}
    disabled={disabled}>
    {title} <FontAwesomeIcon icon={icon} />
  </button>
);

/**
 * Form component for editing an existing forum.
 * Handles form state, validation, update, and delete actions.
 */
const EditForumForm = ({ forum }) => {
  const { isAdmin, userId: currentUserId } = useAuth();
  const [updateForum, { isLoading, isSuccess, isError, error }] =
    useUpdateForumMutation();
  const [
    deleteForum,
    { isSuccess: isDelSuccess, isError: isDelError, error: delerror },
  ] = useDeleteForumMutation();
  const navigate = useNavigate();
  const [title, setTitle] = useState(forum.title);
  const [text, setText] = useState(forum.text);
  const [ownerId, setOwnerId] = useState(forum.user);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Effect to reset form and navigate on successful update or delete.
  useEffect(() => {
    if (isSuccess || isDelSuccess) {
      setTitle("");
      setText("");
      setOwnerId("");
      navigate("/dash/forums");
    }
  }, [isSuccess, isDelSuccess, navigate]);

  // Handlers for input changes.
  const onTitleChanged = (e) => setTitle(e.target.value);
  const onTextChanged = (e) => setText(e.target.value);
  const canSave = [title, text, ownerId].every(Boolean) && !isLoading;
  const canEdit = isAdmin || currentUserId === String(forum.user);

  // Handles form submission to update the forum.
  const onSaveForumClicked = async (e) => {
    if (canSave) {
      await updateForum({ id: forum.id, user: ownerId, title, text });
    }
  };

  // Handles delete button click to delete the forum.
  const onDeleteForumClicked = async () => {
    await deleteForum({ id: forum.id });
  };

  const created = new Date(forum.createdAt).toLocaleString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
  const updated = new Date(forum.updatedAt).toLocaleString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

  const errClass = isError || isDelError ? "errmsg" : "offscreen";
  const errContent = (error?.data?.message || delerror?.data?.message) ?? "";

  const content = (
    <>
      <p className={errClass}>{errContent}</p>
      <form className="form" onSubmit={(e) => e.preventDefault()}>
        <div className="form__title-row">
          <h2>Edit Forum: {forum.title}</h2>
        </div>
        <label className="form__label" htmlFor="forum-title">
          Title:
        </label>
        <input
          className={`form__input ${getInputClass(title)}`}
          id="forum-title"
          name="title"
          type="text"
          autoComplete="off"
          value={title}
          onChange={onTitleChanged}
        />
        <label className="form__label" htmlFor="forum-text">
          Text:
        </label>
        <textarea
          className={`form__input form__input--text ${getInputClass(text)}`}
          id="forum-text"
          name="text"
          value={text}
          onChange={onTextChanged}
        />
        <div>
          <p>
            Created:
            <br />
            {created}
          </p>
          <p>
            Updated:
            <br />
            {updated}
          </p>
        </div>
        <div
          className="form__action-buttons"
          style={{ flexDirection: "column", alignItems: "flex-end" }}>
          {canEdit && (
            <>
              <div
                style={{ display: "flex", flexDirection: "row", gap: "0.5em" }}>
                {!showDeleteConfirm && (
                  <>
                    <ActionButton
                      onClick={onSaveForumClicked}
                      disabled={!canSave}
                      title="Save"
                    />
                    <ActionButton
                      onClick={() => setShowDeleteConfirm(true)}
                      title="Delete"
                      className="delete-button"
                    />
                    <button
                      type="button"
                      className="button delete-button"
                      onClick={() => navigate(-1)}>
                      Cancel
                    </button>
                  </>
                )}
              </div>
              {showDeleteConfirm && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    alignItems: "flex-end",
                    marginTop: "0.5em",
                  }}>
                  <span
                    style={{
                      padding: "0.5rem 0",
                      color: "var(--ERROR)",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}>
                    Are you sure?
                  </span>
                  <ActionButton
                    onClick={onDeleteForumClicked}
                    title="Yes, Delete"
                    icon={faTrashCan}
                    className="delete-button"
                  />
                  <ActionButton
                    onClick={() => setShowDeleteConfirm(false)}
                    title="Cancel"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </form>
    </>
  );
  return content;
};

export default EditForumForm;
