import { useRef} from "react";
import DataTable from "../../components/DataTable";
import { useGetForumsQuery, useDeleteForumMutation } from "./forumsApiSlice";
import Forum from "./Forum";
import Modal from "../../components/Modal";
import MenuButton from "../../components/MenuButton";
import { useNavigate } from "react-router-dom";

const ForumActivity = () => {
   // Fetch all forums data
  const {
    data: forums = { ids: [], entities: {} },
    isLoading,
    isError,
    refetch,
  } = useGetForumsQuery("forumsList");

  const modalRef = useRef(); // Ref to control the confirmation modal
  const [deleteForum] = useDeleteForumMutation(); // Mutation hook for deleting a forum
  const navigate = useNavigate();

  const handleEditForum = (forumId) => {
    navigate(`/dash/forums/${forumId}/edit`);
  };

  // Table column definitions
  const columns = [
    { key: "title", label: "Title", sortable: true },
    { key: "username", label: "Username", sortable: true },
    { key: "createdAt", label: "Created", sortable: true },
    { key: "updatedAt", label: "Updated", sortable: true },
    { key: "settings", label: "Settings" },
  ];

  return (
    <>
      <div className="notifications-page__header">
        <h1>My Forums</h1>
      </div>
      {isLoading && <p>Loading...</p>}
      {isError && <p className="error-message">Error loading forums</p>}

      {!isLoading && !isError && (
        <DataTable
          columns={columns}
          data={forums.ids}
          renderRow={(forumId) => (
            <Forum key={forumId} forumId={forumId}>
              <MenuButton
                onEdit={() => handleEditForum(forumId)}
                onDeleteClick={() => modalRef.current.open(forumId)}
              />
            </Forum>
          )}
        />
      )}

      {/* Single reusable confirmation modal for deleting forums */}
      <Modal
        ref={modalRef}
        message="Are you sure you want to delete this forum?"
        deleteAction={(id) => deleteForum({ id })}
        afterDelete={refetch}
      />
    </>
  );
};

export default ForumActivity;
