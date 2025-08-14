import { useState, forwardRef, useImperativeHandle } from "react";

const Modal = forwardRef(
  (
    {
      message = "Are you sure you want to delete this item?",
      confirmText = "Yes, delete",
      cancelText = "Cancel",
      deleteAction, // async function to run on confirm
      afterDelete, // optional callback after deletion
    },
    ref // Forwarded ref so parent can programmatically open/close the modal
  ) => {
    const [isOpen, setIsOpen] = useState(false); // Tracks whether the modal is visible
    const [itemId, setItemId] = useState(null);  // Stores the ID of the item to delete
    const [loading, setLoading] = useState(false); // Tracks if the delete action is in progress

    // Expose functions to parent components through the ref
    useImperativeHandle(ref, () => ({
      open: (id) => {
        setItemId(id);
        setIsOpen(true);
      },
      close: () => {
        setIsOpen(false);
        setItemId(null);
      },
    }));

     const handleConfirm = async () => {
    if (!deleteAction || !itemId) return;
    setLoading(true);
    try {
      await deleteAction(itemId);
      afterDelete?.();
    } finally {
      setLoading(false);
      setIsOpen(false);
      setItemId(null);
    }
  };

    if (!isOpen) return null;

    return (
      <div className="modal-overlay" onClick={() => setIsOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
         Confirm Delete
        </div>
        <p>{message}</p>
        <div className="modal-actions">
          <button
            className="confirm-btn"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : confirmText || "Yes, delete"}
          </button>
          <button
            className="cancel-btn"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            {cancelText || "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
  }
);

export default Modal;
