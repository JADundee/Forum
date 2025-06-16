import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExpand } from "@fortawesome/free-solid-svg-icons"
import { useNavigate } from 'react-router-dom'
import { useGetNotesQuery } from './notesApiSlice'
import { memo } from 'react'

const Note = ({ noteId }) => {

    const navigate = useNavigate()

    const { note } = useGetNotesQuery("notesList", {
        selectFromResult: ({ data }) => ({
            note: data?.entities[noteId]
        }),
    })

    if (note) {
        const created = new Date(note.createdAt).toLocaleString('en-US', { day: 'numeric', month: 'long' })

        const updated = new Date(note.updatedAt).toLocaleString('en-US', { day: 'numeric', month: 'long' })

      

        const handleView = () => navigate(`/dash/notes/${noteId}/expand`)

        return (
            <tr className="table__row">
                <td className="table__cell note__created">{created}</td>
                <td className="table__cell note__updated">{updated}</td>
                <td className="table__cell note__title">{note.title}</td>
                <td className="table__cell note__username">{note.username}</td>
                <td className="table__cell">
                <button
                    className="icon-button table__button"
                    onClick={handleView}
                >
                    <FontAwesomeIcon icon={faExpand} />
                </button>
                </td>
            </tr>
        )

    } else return null
}

const memoizedNote = memo(Note)

export default memoizedNote