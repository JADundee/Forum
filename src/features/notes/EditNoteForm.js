import { useState, useEffect } from "react"
import { useUpdateNoteMutation, useDeleteNoteMutation } from "./notesApiSlice"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import useAuth from "../../hooks/useAuth"

// Helper for input validation class
const getInputClass = (value) => value ? '' : 'form__input--incomplete'

// Reusable action button
const ActionButton = ({ onClick, disabled, title, icon, className }) => (
    <button
        className={`button${className ? ' ' + className : ''}`}
        title={title}
        onClick={onClick}
        disabled={disabled}
    >
        {title} <FontAwesomeIcon icon={icon} />
    </button>
)

const EditNoteForm = ({ note }) => {
    const { isAdmin, userId: currentUserId } = useAuth()
    const [updateNote, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useUpdateNoteMutation()
    const [deleteNote, {
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delerror
    }] = useDeleteNoteMutation()
    const navigate = useNavigate()
    const [title, setTitle] = useState(note.title)
    const [text, setText] = useState(note.text)
    const [ownerId, setOwnerId] = useState(note.user)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (isSuccess || isDelSuccess) {
            setTitle('')
            setText('')
            setOwnerId('')
            navigate('/dash/notes')
        }
    }, [isSuccess, isDelSuccess, navigate])

    const onTitleChanged = e => setTitle(e.target.value)
    const onTextChanged = e => setText(e.target.value)
    const canSave = [title, text, ownerId].every(Boolean) && !isLoading
    const canEdit = isAdmin || currentUserId === String(note.user)

    const onSaveNoteClicked = async (e) => {
        if (canSave) {
            await updateNote({ id: note.id, user: ownerId, title, text})
        }
    }
    const onDeleteNoteClicked = async () => {
        await deleteNote({ id: note.id })
    }

    const created = new Date(note.createdAt).toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })
    const updated = new Date(note.updatedAt).toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })

    // Inline error logic
    const errClass = (isError || isDelError) ? "errmsg" : "offscreen"
    const errContent = (error?.data?.message || delerror?.data?.message) ?? ''

    const content = (
        <>
            <p className={errClass}>{errContent}</p>
            <form className="form" onSubmit={e => e.preventDefault()}>
                <div className="form__title-row">
                    <h2>Edit Thread: {note.title}</h2>
                </div>
                <label className="form__label" htmlFor="note-title">
                    Title:
                </label>
                <input
                    className={`form__input ${getInputClass(title)}`}
                    id="note-title"
                    name="title"
                    type="text"
                    autoComplete="off"
                    value={title}
                    onChange={onTitleChanged}
                />
                <label className="form__label" htmlFor="note-text">
                    Text:
                </label>
                <textarea
                    className={`form__input form__input--text ${getInputClass(text)}`}
                    id="note-text"
                    name="text"
                    value={text}
                    onChange={onTextChanged}
                />
                <div>
                    <p>Created:<br />{created}</p>
                    <p>Updated:<br />{updated}</p>
                </div>
                <div className="form__action-buttons" style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                    {canEdit && (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5em' }}>
                                {!showDeleteConfirm && (
                                    <>
                                        <ActionButton
                                            onClick={onSaveNoteClicked}
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
                                            onClick={() => navigate(-1)}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                            {showDeleteConfirm && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', marginTop: '0.5em' }}>
                                    <span style={{ padding: '0.5rem 0', color: 'var(--ERROR)', fontWeight: 'bold', textAlign: 'center' }}>Are you sure?</span>
                                    <ActionButton
                                        onClick={onDeleteNoteClicked}
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
    )
    return content
}

export default EditNoteForm