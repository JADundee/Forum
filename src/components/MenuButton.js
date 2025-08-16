import { useState, useRef, useEffect } from "react";
import "../index.css"; // if your dropdown styles live there

const MenuButton = ({ onEdit, onDeleteClick }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="menu-button-container"
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      style={{ position: "relative" }}
    >
      <button
        className="menu-button"
        title="Show options"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        &#x22EE;
      </button>

      <div className={`reply__actions-popover${open ? " show" : ""}`}>
        <div
          className="reply__actions-item"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
            onEdit();
          }}
        >
         Edit
        </div>
        <div
          className="reply__actions-item--delete"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
            onDeleteClick();
          }}
        >
         Delete
        </div>
      </div>
    </div>
  );
};

export default MenuButton;
