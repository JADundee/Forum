import { useNavigate } from "react-router-dom";
import { useGetForumsQuery } from "./forumsApiSlice";
import { memo } from "react";
import moment from "moment";

const Forum = ({ forumId, children }) => {
  const navigate = useNavigate();

  // Select a specific forum by ID from cached API results
  const { forum } = useGetForumsQuery("forumsList", {
    selectFromResult: ({ data }) => ({
      forum: data?.entities[forumId],
    }),
  });

  if (!forum) return null;

  const created = moment(forum.createdAt).format("MMMM D, YYYY h:mm A");
  const updated = moment(forum.updatedAt).format("MMMM D, YYYY h:mm A");

  const handleRowClick = () => navigate(`/dash/forums/${forumId}/expand`);

  return (
    <tr className="table__row" onClick={handleRowClick}>
      <td className="table__cell">{forum.title}</td>
      <td className="table__cell">{forum.username}</td>
      <td className="table__cell table__created">{created}</td>
      <td className="table__cell table__updated">{updated}</td>
      <td className="table__cell action-buttons">{children}</td> {/* Actions get passed in from parent */}
    </tr>
  );
};

// Memoize to avoid unnecessary re-renders when props don't change
export default memo(Forum);
