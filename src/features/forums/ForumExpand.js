import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useGetForumsQuery, useGetRepliesQuery, useToggleLikeMutation, useGetLikeCountQuery, useGetUserLikeQuery } from './forumsApiSlice'
import useAuth from '../../hooks/useAuth'
import ReplyForm from '../replies/ReplyForm'
import RepliesList from '../replies/RepliesList'
import moment from 'moment'
import { useState, useEffect } from 'react'

const ForumExpand = () => {
    const { id } = useParams()
    const location = useLocation();
    const navigate = useNavigate();
    const { username, isAdmin} = useAuth()
    const [highlightReplyId, setHighlightReplyId] = useState(null);
    const [toggleLike] = useToggleLikeMutation();
    const { data: likeCountData, refetch: refetchLikeCount } = useGetLikeCountQuery({ targetId: id, targetType: 'forum' });
    const { data: userLikeData, refetch: refetchUserLike } = useGetUserLikeQuery({ targetId: id, targetType: 'forum' });
    const [likeLoading, setLikeLoading] = useState(false);

    const { forum } = useGetForumsQuery("forumsList", {
        selectFromResult: ({ data }) => ({
            forum: data?.entities[id]
        }),
    })
    const { data: replies, isLoading, isError, refetch } = useGetRepliesQuery(forum?.id);

    useEffect(() => {
        if (location.state?.replyId && replies && replies.length > 0) {
            setHighlightReplyId(location.state.replyId);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, replies, navigate, location.pathname]);

    if (!forum) {
        return <p>Loading forum...</p>;
    }

    if (!forum || !forum.id || (!isAdmin && forum.username !== username && window.location.pathname.includes('edit'))) {
        return <p className="errmsg">No access</p>
    }

    if (isLoading) {
        return <p>Loading replies...</p>;
    }
    if (isError) {
        return <p>Error loading replies</p>;
    }
    if (!replies) {
        return <p>No replies found</p>;
    }

    const created = moment(forum.createdAt).format('MMMM D, YYYY h:mm A');
    const updated = moment(forum.updatedAt).format('MMMM D, YYYY h:mm A');

    const handleReplySubmitted = (replyId) => {
        setHighlightReplyId(replyId);
    };

    const handleLike = async () => {
        setLikeLoading(true);
        try {
            await toggleLike({ targetId: id, targetType: 'forum' }).unwrap();
            refetchLikeCount();
            refetchUserLike();
        } finally {
            setLikeLoading(false);
        }
    };

    const hasLiked = userLikeData?.liked;
    const likeCount = likeCountData?.count || 0;

    const editReplyId = location.state?.editReply ? location.state.replyId : null;

    const content = (
        <article className="forum-post">
            <div className='forum-post__op'>
                <header className="forum-post__header">
                    <h1>{forum.title}</h1>
                </header>

                <section className="forum-post__content">
                    <p>{forum.text}</p>
                </section>

                <p className='forum-post__author'>Author:
                    <span className="username">
                        {forum.username}
                    </span>
                </p>

                {forum.editedBy && (
                    <p className="forum-post__edited-by">Edited by: <span className="username">{forum.editedBy}</span></p>
                )}

                <p className="forum-post__meta">
                        <span className="forum-post__created">Published: {created}</span> | 
                        <span className="forum-post__updated">Updated: {updated}</span>
                </p>
                <div className="like-button-container">
                    <button
                        className={`like-button${hasLiked ? ' liked' : ''}`}
                        onClick={handleLike}
                        disabled={likeLoading}
                        aria-pressed={hasLiked}
                        title={`${likeCount} like${likeCount !== 1 ? 's' : ''}`}
                    >
                        {hasLiked ? '♥' : '♡'}
                    </button>
                    <span className="like-count">{likeCount} like{likeCount !== 1 ? 's' : ''}</span>
                </div>
            </div>

            <section className="forum-post__form">
                <ReplyForm forumId={forum.id} userId={forum.user} refetchReplies={refetch} onReplySubmitted={handleReplySubmitted} />
            </section>
            
            <section className="forum-post__replies">
                    <h2>Replies</h2>
                    <RepliesList
                        replies={replies}
                        refetchReplies={refetch}
                        highlightReplyId={highlightReplyId}
                        editReplyId={editReplyId}
                    />
            </section>
        </article>
    );

    return content;

}
export default ForumExpand