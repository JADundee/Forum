import {
  useGetLikedForumsQuery,
  useGetLikedRepliesQuery,
} from "../users/usersApiSlice";
import Like from "./Like";
import { useNavigate } from "react-router-dom";

/**
 * Component to display a user's like activity.
 * Fetches liked forums and replies, and handles navigation on click.
 */
const LikeActivity = ({ userId, show }) => {
  const navigate = useNavigate();
  const {
    data: likedForums = [],
    isLoading: likedForumsLoading,
    isError: likedForumsError,
  } = useGetLikedForumsQuery(userId);
  const {
    data: likedReplies = [],
    isLoading: likedRepliesLoading,
    isError: likedRepliesError,
  } = useGetLikedRepliesQuery(userId);

  // Handles click on a like item to navigate to the relevant forum or reply.
  const handleLikeClick = (like) => {
    if (like._likeType === "forum") {
      navigate(`/dash/forums/${like._id}/expand`);
    } else if (like._likeType === "reply") {
      const forumId = like.forum?._id || like.forum;
      if (forumId) {
        navigate(`/dash/forums/${forumId}/expand`);
      }
    }
  };

  // Render like activity content
  return (
    <>
      {(likedForumsLoading || likedRepliesLoading) && <p>Loading likes...</p>}
      {(likedForumsError || likedRepliesError) && (
        <p className="error-message">Error loading likes</p>
      )}
      {!likedForumsLoading &&
        !likedRepliesLoading &&
        !likedForumsError &&
        !likedRepliesError &&
        likedForums.length === 0 &&
        likedReplies.length === 0 && <p>No likes found.</p>}
      {!likedForumsLoading &&
        !likedRepliesLoading &&
        !likedForumsError &&
        !likedRepliesError &&
        (likedForums.length > 0 || likedReplies.length > 0) && (
          <>
            <div className="notifications-page__header">
              <h1>My Likes</h1>
            </div>
            <div className="notifications-page__content">
              <ul>
                {[
                  ...likedForums.map((forum) => ({
                    ...forum,
                    _likeType: "forum",
                  })),
                  ...likedReplies.map((reply) => ({
                    ...reply,
                    _likeType: "reply",
                  })),
                ]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((like) => (
                    <li key={like._id} className="notifications-page__item">
                      <Like
                        like={like}
                        type={like._likeType}
                        onClick={() => handleLikeClick(like)}
                      />
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
