import { useGetLikedNotesQuery, useGetLikedRepliesQuery } from '../users/usersApiSlice';
import Like from './Like';
import { useNavigate } from 'react-router-dom';

const LikeActivity = ({ userId, show }) => {
    const navigate = useNavigate();
    const { data: likedNotes = [], isLoading: likedNotesLoading, isError: likedNotesError } = useGetLikedNotesQuery(userId);
    const { data: likedReplies = [], isLoading: likedRepliesLoading, isError: likedRepliesError } = useGetLikedRepliesQuery(userId);

    const handleLikeClick = (like) => {
        if (like._likeType === 'note') {
            navigate(`/dash/notes/${like._id}/expand`);
        } else if (like._likeType === 'reply') {
            const noteId = like.note?._id || like.note;
            if (noteId) {
                navigate(`/dash/notes/${noteId}/expand`, { state: { replyId: like._id } });
            }
        }
    };

    return (
        <>
            {(likedNotesLoading || likedRepliesLoading) && <p>Loading likes...</p>}
            {(likedNotesError || likedRepliesError) && <p className="errmsg">Error loading likes</p>}
            {!likedNotesLoading && !likedRepliesLoading && !likedNotesError && !likedRepliesError && (likedNotes.length === 0 && likedReplies.length === 0) && <p>No likes found.</p>}
            {!likedNotesLoading && !likedRepliesLoading && !likedNotesError && !likedRepliesError && (likedNotes.length > 0 || likedReplies.length > 0) && (
                <div className="all-notifications__header">
                    <h1>My Likes</h1>
                    <div className="all-notifications__content">
                        <ul>
                            {[
                                ...likedNotes.map(note => ({ ...note, _likeType: 'note' })),
                                ...likedReplies.map(reply => ({ ...reply, _likeType: 'reply' }))
                            ]
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                            .map(like => (
                                <li key={like._id} className="all-notifications__item">
                                    <Like like={like} type={like._likeType} onClick={() => handleLikeClick(like)} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </>
    );
};

export default LikeActivity;
