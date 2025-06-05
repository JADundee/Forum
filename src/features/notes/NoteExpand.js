import { useParams } from 'react-router-dom'
import { useGetNotesQuery } from './notesApiSlice'
import useAuth from '../../hooks/useAuth'


const NoteExpand = () => {

    const { id } = useParams()
    const { username, isAdmin } = useAuth()

    const { note } = useGetNotesQuery("notesList", {
        selectFromResult: ({ data }) => ({
            note: data?.entities[id]
        }),
    })

    if (!note) {
      return <p className="errmsg">No access</p>
    }

    if (!isAdmin && note.username !== username) {
        if (window.location.pathname.includes('edit')) {
            return <p className="errmsg">No access</p>
        }
    }

    const created = new Date(note.createdAt).toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })
    const updated = new Date(note.updatedAt).toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })

    const content = (
        <article className="blog-post">
            <header className="blog-post__header">
                <h1>{note.title}</h1>
            </header>

            <section className="blog-post__content">
                <p>{note.text}</p>
            </section>
            <footer>
               <p className="blog-post__meta">
                    <span className="blog-post__created">Published: {created}</span> | 
                    <span className="blog-post__updated">Updated: {updated}</span>
                </p>
            </footer>
        </article>
    );

    return content;

}
export default NoteExpand