import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useGetNotesQuery, useGetRepliesQuery } from './notesApiSlice'
import useAuth from '../../hooks/useAuth'
import ReplyForm from './ReplyForm'
import RepliesList from './RepliesList'
import moment from 'moment'
import { useState, useEffect } from 'react'

const NoteExpand = () => {
    const { id } = useParams()
    const location = useLocation();
    const navigate = useNavigate();
    const { username, isAdmin } = useAuth()
    const [highlightReplyId, setHighlightReplyId] = useState(null);

    const { note } = useGetNotesQuery("notesList", {
        selectFromResult: ({ data }) => ({
            note: data?.entities[id]
        }),
    })

    const { data: replies, isLoading, isError, refetch } = useGetRepliesQuery(note?.id);

    // Inline navigation state handling in useEffect
    useEffect(() => {
        if (location.state?.replyId && replies && replies.length > 0) {
            setHighlightReplyId(location.state.replyId);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, replies, navigate, location.pathname]);

    // Combined access checks
    if (!note || !note.id || (!isAdmin && note.username !== username && window.location.pathname.includes('edit'))) {
        return <p className="errmsg">No access</p>
    }

    // Grouped reply loading/error/empty checks
    if (isLoading) {
        return <p>Loading replies...</p>;
    }
    if (isError) {
        return <p>Error loading replies</p>;
    }
    if (!replies) {
        return <p>No replies found</p>;
    }

    const created = moment(note.createdAt).format('MMMM D, YYYY h:mm A');
    const updated = moment(note.updatedAt).format('MMMM D, YYYY h:mm A');

    const handleReplySubmitted = (replyId) => {
        setHighlightReplyId(replyId);
    };

    const content = (
        <article className="blog-post">
            <div className='blog-post__op'>
                <header className="blog-post__header">
                    <h1>{note.title}</h1>
                </header>

                <section className="blog-post__content">
                    <p>{note.text}</p>
                </section>

                <p className='blog-post__author'>Author:
                    <span className="username">
                        {note.username}
                    </span>
                </p>

                {note.editedBy && (
                    <p className="blog-post__edited-by">Edited by: <span className="username">{note.editedBy}</span></p>
                )}

                <p className="blog-post__meta">
                        <span className="blog-post__created">Published: {created}</span> | 
                        <span className="blog-post__updated">Updated: {updated}</span>
                </p>
            </div>

            <section className="blog-post__form">
                <ReplyForm noteId={note.id} userId={note.user} refetchReplies={refetch} onReplySubmitted={handleReplySubmitted} />
            </section>
            
            <section className="blog-post__replies">
                <div>
                    <h2>Replies</h2>
                    <RepliesList replies={replies} refetchReplies={refetch} highlightReplyId={highlightReplyId} />
                </div>
            </section>
        </article>
    );

    return content;

}
export default NoteExpand