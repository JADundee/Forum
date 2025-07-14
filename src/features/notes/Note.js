import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetNotesQuery } from './notesApiSlice'
import { memo } from 'react'
import moment from 'moment'

const Note = ({ noteId }) => {

    const navigate = useNavigate()

    const { note } = useGetNotesQuery("notesList", {
        selectFromResult: ({ data }) => ({
            note: data?.entities[noteId]
        }),
    })

    if (note) {
        const created = moment(note.createdAt).format('MMMM D, YYYY h:mm A');
        const updated = moment(note.updatedAt).format('MMMM D, YYYY h:mm A');

      

        const handleRowClick = () => navigate(`/dash/notes/${noteId}/expand`)

        return (
            <tr className="table__row" onClick={handleRowClick}>
                <td className="table__cell">{note.title}</td>
                <td className="table__cell">{note.username}</td>
                <td className="table__cell">{created}</td>
                <td className="table__cell">{updated}</td>
            </tr>
        )

    } else return null
}

const memoizedNote = memo(Note)

export default memoizedNote