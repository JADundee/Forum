import React, { useState, useRef, useEffect } from 'react';

const MenuButton = ({ onEdit, onDelete, variant = "" }) => {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
        setConfirmDelete(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={menuRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        className={`button menu-button${variant ? ` ${variant}` : ""}`}
        title="Show options"
        onClick={() => { setOpen((prev) => !prev); setConfirmDelete(false); }}
        aria-haspopup="true"
        aria-expanded={open}
      >
        &#x22EE;
      </button>
      <div className={`reply-dropdown${open ? ' show' : ''}${variant ? ` ${variant}-dropdown` : ''}`}>
        {!confirmDelete ? (
          <>
            <button className="button" onClick={() => { setOpen(false); onEdit(); }}>Edit</button>
            <button className="button delete-button" onClick={() => setConfirmDelete(true)}>Delete</button>
          </>
        ) : (
          <div>
            <span>Are you sure?</span>
            <button className="button delete-button" onClick={() => { setOpen(false); setConfirmDelete(false); onDelete(); }}>Yes, Delete</button>
            <button className="button" onClick={() => setConfirmDelete(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuButton;
