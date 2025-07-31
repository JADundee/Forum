import { useGetLikedForumsQuery, useGetLikedRepliesQuery } from '../users/usersApiSlice';
import Like from './Like';
import { useNavigate } from 'react-router-dom';

const LikeActivity = ({ userId, show }) => {
    const navigate = useNavigate();
    const { data: likedForums = [], isLoading: likedForumsLoading, isError: likedForumsError } = useGetLikedForumsQuery(userId);
    const { data: likedReplies = [], isLoading: likedRepliesLoading, isError: likedRepliesError } = useGetLikedRepliesQuery(userId);

    const handleLikeClick = (like) => {
        if (like._likeType === 'forum') {
            navigate(`/dash/forums/${like._id}/expand`);
        } else if (like._likeType === 'reply') {
            const forumId = like.forum?._id || like.forum;
            if (forumId) {
                navigate(`/dash/forums/${forumId}/expand`, { state: { replyId: like._id } });
            }
        }
    };

    return (
        <>
            {(likedForumsLoading || likedRepliesLoading) && <p>Loading likes...</p>}
            {(likedForumsError || likedRepliesError) && <p className="errmsg">Error loading likes</p>}
            {!likedForumsLoading && !likedRepliesLoading && !likedForumsError && !likedRepliesError && (likedForums.length === 0 && likedReplies.length === 0) && <p>No likes found.</p>}
            {!likedForumsLoading && !likedRepliesLoading && !likedForumsError && !likedRepliesError && (likedForums.length > 0 || likedReplies.length > 0) && (
                <>
                    <div className="all-notifications__header">
                        <h1>My Likes</h1>
                    </div>
                    <div className="all-notifications__content">
                        <ul>
                            {[
                                ...likedForums.map(forum => ({ ...forum, _likeType: 'forum' })),
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
                </>
            )}
        </>
    );
};

export default LikeActivity;