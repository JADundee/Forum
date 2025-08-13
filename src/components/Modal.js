
const Modal = ({
  isOpen,
  onCancel,
  onConfirm,
  message,
  confirmText,
  cancelText,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Confirm Delete</h2>
        <p>{message}</p>
        <button className="button delete-button" onClick={onConfirm}>
          {confirmText}
        </button>
        <button className="button" onClick={onCancel}>
          {cancelText}
        </button>
      </div>
    </div>
  );
};

export default Modal;