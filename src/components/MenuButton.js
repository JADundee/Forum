import { useState, useRef, useEffect } from "react";

/**
 * Button component for toggling menus or navigation drawers.
 * Handles edit and delete actions with confirmation.
 */
const MenuButton = ({ onEdit, onDelete, variant = "" }) => {
  // State for menu open/close and delete confirmation
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef(null);

  // Effect to close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
        setConfirmDelete(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Renders the menu button and dropdown with edit/delete actions.
  return (
    <div
      ref={menuRef}
      style={{ position: "relative", display: "inline-block" }}>
      {/* Button to open/close the menu */}
      <button
        className={`button menu-button${variant ? ` ${variant}` : ""}`}
        title="Show options"
        onClick={() => {
          setOpen((prev) => !prev);
          setConfirmDelete(false);
        }}
        aria-haspopup="true"
        aria-expanded={open}>
        &#x22EE;
      </button>
      {/* Dropdown menu for edit and delete actions */}
      <div
        className={`reply-dropdown${open ? " show" : ""}${
          variant ? ` ${variant}-dropdown` : ""
        }`}>
        {!confirmDelete ? (
          <>
            {/* Edit action button */}
            <button
              className="button"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}>
              Edit
            </button>
            {/* Delete action button, triggers confirmation */}
            <button
              className="button delete-button"
              onClick={() => setConfirmDelete(true)}>
              Delete
            </button>
          </>
        ) : (
          <div>
            <span>Are you sure?</span>
            {/* Confirm delete button */}
            <button
              className="button delete-button"
              onClick={() => {
                setOpen(false);
                setConfirmDelete(false);
                onDelete();
              }}>
              Yes, Delete
            </button>
            {/* Cancel delete button */}
            <button className="button" onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuButton;
