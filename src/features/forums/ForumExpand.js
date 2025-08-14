import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  useGetForumsQuery,
  useGetRepliesQuery,
  useToggleLikeMutation,
  useGetLikeCountQuery,
  useGetUserLikeQuery,
} from "./forumsApiSlice";
import useAuth from "../../hooks/useAuth";
import ReplyForm from "../replies/ReplyForm";
import RepliesList from "../replies/RepliesList";
import moment from "moment";
import { useState, useEffect } from "react";

/**
 * Page for expanding a forum to show details and replies.
 * Handles fetching forum, replies, likes, and reply submission.
 */
const ForumExpand = () => {
  // Get forum ID from URL params
  const { id } = useParams();
  // Get location and navigation hooks
  const location = useLocation();
  const navigate = useNavigate();
  // Get current user's username and admin status
  const { username, isAdmin } = useAuth();
  // State for highlighting a specific reply
  const [highlightReplyId, setHighlightReplyId] = useState(null);
  // RTK Query mutation for toggling forum like
  const [toggleLike] = useToggleLikeMutation();
  // Query for like count and user like status
  const { data: likeCountData, refetch: refetchLikeCount } = useGetLikeCountQuery({ targetId: id, targetType: "forum" });
  const { data: userLikeData, refetch: refetchUserLike } = useGetUserLikeQuery({
    targetId: id,
    targetType: "forum",
  });
  // State for like button loading
  const [likeLoading, setLikeLoading] = useState(false);

  // Get the forum object from the normalized forums list
  const { forum } = useGetForumsQuery("forumsList", {
    selectFromResult: ({ data }) => ({
      forum: data?.entities[id],
    }),
  });
  // Query for replies to this forum
  const {
    data: replies,
    isLoading,
    isError,
    refetch,
  } = useGetRepliesQuery(forum?.id);

  // Effect: highlight a reply if replyId is present in location state
  useEffect(() => {
    if (location.state?.replyId && replies && replies.length > 0) {
      setHighlightReplyId(location.state.replyId);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, replies, navigate, location.pathname]);

  // Show loading message if forum is not yet loaded
  if (!forum) {
    return <p>Loading forum...</p>;
  }

  if (
    !forum ||
    !forum.id ||
    (!isAdmin &&
      forum.username !== username &&
      window.location.pathname.includes("edit"))
  ) {
    return <p className="errmsg">No access</p>;
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

  const created = moment(forum.createdAt).format("MMMM D, YYYY h:mm A");
  const updated = moment(forum.updatedAt).format("MMMM D, YYYY h:mm A");

  // Handler for when a reply is submitted, highlights the new reply.
  const handleReplySubmitted = (replyId) => {
    setHighlightReplyId(replyId);
  };

  // Handles liking the forum, updates like count.
  const handleLike = async () => {
    setLikeLoading(true);
    try {
      await toggleLike({ targetId: id, targetType: "forum" }).unwrap();
      refetchLikeCount();
      refetchUserLike();
    } finally {
      setLikeLoading(false);
    }
  };

  const hasLiked = userLikeData?.liked;
  const likeCount = likeCountData?.count || 0;

  const editReplyId = location.state?.editReply ? location.state.replyId : null;

  // Main content for the expanded forum post, including forum details, like button, reply form, and replies list
  const content = (
    <article className="forum-post">
      {/* Forum original post section */}
      <div className="forum-post__op">
        {/* Forum title header */}
        <header className="forum-post__header">
          <h1>{forum.title}</h1>
        </header>

        {/* Forum main text content */}
        <section className="forum-post__content">
          <p>"{forum.text}"</p>
        </section>

        {/* Forum author display */}
        <p className="forum-post__author">
          Author:
          <span className="username">{forum.username}</span>
        </p>

        {/* If the forum was edited, show who edited it */}
        {forum.editedBy && (
          <p className="forum-post__edited-by">
            Edited by: <span className="username">{forum.editedBy}</span>
          </p>
        )}

        {/* Forum creation and last update timestamps */}
        <p className="forum-post__meta">
          <span className="forum-post__created">Published: {created}</span> |
          <span className="forum-post__updated">Updated: {updated}</span>
        </p>

        {/* Like button and like count display */}
        <div className="like-button-container">
          {/*
            Like button:
            - Shows filled heart if user has liked, outline otherwise
            - Disabled while like mutation is loading
            - aria-pressed for accessibility
            - Title shows like count
          */}
          <button
            className={`like-button${hasLiked ? " liked" : ""}`}
            onClick={handleLike}
            disabled={likeLoading}
            aria-pressed={hasLiked}
            title={`${likeCount} like${likeCount !== 1 ? "s" : ""}`}>
            {hasLiked ? "♥" : "♡"}
          </button>
          {/* Like count text */}
          <span className="like-count">
            {likeCount} like{likeCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Reply form for submitting a new reply to this forum */}
      <section className="forum-post__form">
        <ReplyForm
          forumId={forum.id}
          userId={forum.user}
          refetchReplies={refetch}
          onReplySubmitted={handleReplySubmitted}
        />
      </section>

      {/* Replies list section, shows all replies to this forum */}
      <section className="forum-post__replies">
        <h2>Replies</h2>
        <RepliesList
          replies={Array.isArray(replies) ? replies : replies?.replies || []}
          refetchReplies={refetch}
          highlightReplyId={highlightReplyId}
          editReplyId={editReplyId}
        />
      </section>
    </article>
  );

  return content;
};
export default ForumExpand;
