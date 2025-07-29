import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetNotesQuery, useDeleteNoteMutation, useDeleteReplyMutation } from './notesApiSlice'
import { memo } from 'react'
import moment from 'moment'
import MenuButton from '../../components/MenuButton';

const Note = ({ noteId, showSettingsMenu }) => {

    const navigate = useNavigate()
    const [deleteNote] = useDeleteNoteMutation();
    const [deleteReply] = useDeleteReplyMutation();

    const { note } = useGetNotesQuery("notesList", {
        selectFromResult: ({ data }) => ({
            note: data?.entities[noteId]
        }),
    })

    if (note) {
        const created = moment(note.createdAt).format('MMMM D, YYYY h:mm A');
        const updated = moment(note.updatedAt).format('MMMM D, YYYY h:mm A');

      

        const handleRowClick = () => navigate(`/dash/notes/${noteId}/expand`)
        const handleEdit = () => navigate(`/dash/notes/${noteId}/edit`); // <-- Edit page

        // Delete handler
        const handleDelete = async () => {
            await deleteNote({ id: noteId });
        };

        return (
            <tr className="table__row" onClick={handleRowClick}>
                <td className="table__cell">{note.title}</td>
                <td className="table__cell">{note.username}</td>
                <td className="table__cell">{created}</td>
                <td className="table__cell">{updated}</td>
                {showSettingsMenu && (
                  <td
                    className="table__cell"
                    onClick={e => e.stopPropagation()} // <-- Prevents row click when clicking menu
                  >
                    <MenuButton
                      onEdit={handleEdit} // <-- Navigates to edit page
                      onDelete={handleDelete} // <-- Use the same logic as edit page
                    />
                  </td>
                )}
            </tr>
        )

    } else return null
}

const memoizedNote = memo(Note)

export default memoizedNote