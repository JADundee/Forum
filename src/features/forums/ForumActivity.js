import { useState } from "react";
import { useGetForumsQuery } from "./forumsApiSlice";
import DataTable from "../../components/DataTable";
import Forum from "./Forum";
import useSort from "../../hooks/useSort";
import filterAndSort from "../../hooks/useSearch";

/**
 * Component to display a user's forum activity.
 * Handles searching, sorting, and rendering forums owned by the user.
 */
const ForumActivity = ({ username, show }) => {
  const {
    data: forumsData,
    isLoading: forumsLoading,
    isError: forumsError,
    error: forumsErrorObj,
    isSuccess: forumsSuccess,
  } = useGetForumsQuery("forumsList", {
    pollingInterval: 15000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const [forumsSearch, setForumsSearch] = useState("");
  const { sortConfig, handleSort } = useSort("updatedAt", "desc");

  let sortedAndFilteredForumIds = [];
  if (forumsSuccess && forumsData) {
    sortedAndFilteredForumIds = filterAndSort.run(
      forumsData.ids,
      forumsData.entities,
      forumsSearch,
      sortConfig,
      username
    );
  }

  const forumsColumns = [
    { key: "title", label: "Title", className: "table__title", sortable: true },
    {
      key: "username",
      label: "Owner",
      className: "table__username",
      sortable: true,
    },
    {
      key: "createdAt",
      label: "Created",
      className: "forum__created",
      sortable: true,
    },
    {
      key: "updatedAt",
      label: "Updated",
      className: "forum__updated",
      sortable: true,
    },
    { key: "settings", label: "Settings" },
  ];

  // Don't render if not shown
  if (!show) return null;

  // Render forum activity content
  return (
    <>
      <div className="all-notifications__header">
        <h1>My Forums</h1>
      </div>
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search by title or owner..."
          value={forumsSearch}
          onChange={(e) => setForumsSearch(e.target.value)}
        />
      </div>
      {forumsLoading && <p>Loading...</p>}
      {forumsError && (
        <p className="errmsg">
          {forumsErrorObj?.data?.message || "Error loading forums"}
        </p>
      )}
      {forumsSuccess && forumsData && (
          <DataTable
            columns={forumsColumns}
            data={sortedAndFilteredForumIds}
            emptyMsg="No forums found"
            renderRow={(forumId) => (
              <Forum key={forumId} forumId={forumId} showSettingsMenu />
            )}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
      )}
    </>
  );
};

export default ForumActivity;
