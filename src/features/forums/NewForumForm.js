import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAddNewForumMutation } from "./forumsApiSlice";

/**
 * Form component for creating a new forum.
 * Handles form state, validation, and submission.
 */
const NewForumForm = ({ users }) => {
  const [addNewForum, { isLoading, isSuccess, isError, error }] =
    useAddNewForumMutation();

  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const [userId, setUserId] = useState(users[0].id);

  // Effect to reset form and navigate on successful forum creation.
  useEffect(() => {
    if (isSuccess) {
      setTitle("");
      setText("");
      setUserId("");
      navigate("/dash/forums");
    }
  }, [isSuccess, navigate]);

  // Handlers for input changes.
  const onTitleChanged = (e) => setTitle(e.target.value);
  const onTextChanged = (e) => setText(e.target.value);

  const canSave = [title, text, userId].every(Boolean) && !isLoading;

  // Handles form submission to create a new forum.
  const onSaveForumClicked = async (e) => {
    e.preventDefault();
    if (canSave) {
      await addNewForum({
        user: userId,
        title: title.trim(),
        text: text.trim(),
      });
    }
  };

  const errClass = isError ? "errmsg" : "offscreen";
  const validTitleClass = !title ? "form__input--incomplete" : "";
  const validTextClass = !text ? "form__input--incomplete" : "";

  // Renders the new forum form content.
  const content = (
    <>
      <p className={errClass}>{error?.data?.message}</p>

      <form className="form" onSubmit={onSaveForumClicked}>
        <div className="form__title-row">
          <h2>New Forum</h2>
        </div>
        <label className="form__label" htmlFor="title">
          Title:
        </label>
        <input
          className={`form__input ${validTitleClass}`}
          id="title"
          name="title"
          type="text"
          autoComplete="off"
          value={title}
          placeholder="Enter a title for this post"
          onChange={onTitleChanged}
        />

        <label className="form__label" htmlFor="text">
          Text:
        </label>
        <textarea
          className={`form__input form__input--text ${validTextClass}`}
          id="text"
          name="text"
          value={text}
          placeholder="Enter text for this post"
          onChange={onTextChanged}
        />
        <div className="form__action-buttons">
          <button className="button" title="Save" disabled={!canSave}>
            <p className="icon-text">Create </p>
          </button>
        </div>
      </form>
    </>
  );

  return content;
};

export default NewForumForm;
