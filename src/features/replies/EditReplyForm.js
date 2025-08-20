import { useState } from "react";

const EditReplyForm = ({ initialText, onSave, onCancel, loading }) => {
  /**
   * Component for editing an existing reply.
   * Handles form state, submission, and validation.
   */
  const [text, setText] = useState(initialText);
  // State for reply text
  const isUnchanged = text.trim() === initialText.trim();
  const canSave = text.trim() !== "" && !isUnchanged && !loading;

  const handleSubmit = (e) => {
    // Handles form submission for saving the edited reply.
    e.preventDefault();
    if (canSave) {
      onSave(text.trim());
    }
  };

  return (
    // Render the edit reply form
    <form onSubmit={handleSubmit} className="reply__edit-form">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="reply__edit-textarea"
        disabled={loading}
      />
      <div className="reply__edit-buttons">
        <button
          type="submit"
          className="button button--confirm"
          disabled={!canSave}>
          Save
        </button>
        <button
          type="button"
          className="button--cancel"
          onClick={onCancel}
          disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditReplyForm;
