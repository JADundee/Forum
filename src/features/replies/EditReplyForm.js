import { useState } from 'react';

const EditReplyForm = ({ initialText, onSave, onCancel, loading }) => {
  const [text, setText] = useState(initialText);
  const isUnchanged = text.trim() === initialText.trim();
  const canSave = text.trim() !== '' && !isUnchanged && !loading;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSave) {
      onSave(text.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="edit-reply-form">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        className="edit-reply-textarea"
        disabled={loading}
      />
      <div className="edit-reply-buttons">
        <button type="submit" className="button edit-reply-action-button" disabled={!canSave}>Save</button>
        <button type="button" className="button edit-reply-action-button" onClick={onCancel} disabled={loading}>Cancel</button>
      </div>
    </form>
  );
};

export default EditReplyForm; 