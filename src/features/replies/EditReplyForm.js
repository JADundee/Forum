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
    <form onSubmit={handleSubmit} className="edit-reply-form">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="edit-reply-textarea"
        disabled={loading}
      />
      <div className="edit-reply-buttons">
        <button
          type="submit"
          className="button edit-reply__submit"
          disabled={!canSave}>
          Save
        </button>
        <button
          type="button"
          className="button edit-reply__cancel"
          onClick={onCancel}
          disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditReplyForm;
