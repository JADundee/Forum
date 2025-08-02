const filterAndSort = {
  // Filter and sort forums by search, sort config, and username (if provided)
  run(ids, entities, search, sortConfig, username) {
    // Filter out items without a username
    let filtered = ids.filter((id) => entities[id].username);
    // If a username is provided, filter to only that user's items
    if (username) {
      filtered = filtered.filter((id) => entities[id].username === username);
    }
    // Convert search string to lowercase for case-insensitive matching
    const searchLower = search.toLowerCase();
    // Filter by search string in title or username
    filtered = filtered.filter((id) => {
      const forum = entities[id];
      return (
        forum.title.toLowerCase().includes(searchLower) ||
        forum.username.toLowerCase().includes(searchLower)
      );
    });
    // Sort the filtered results by the provided sort config
    filtered.sort((a, b) => {
      const forumA = entities[a];
      const forumB = entities[b];
      let valA, valB;
      if (sortConfig.key === "createdAt") {
        valA = new Date(forumA.createdAt);
        valB = new Date(forumB.createdAt);
      } else if (sortConfig.key === "updatedAt") {
        valA = new Date(forumA.updatedAt);
        valB = new Date(forumB.updatedAt);
      } else if (sortConfig.key === "title") {
        valA = forumA.title.toLowerCase();
        valB = forumB.title.toLowerCase();
      } else if (sortConfig.key === "username") {
        valA = forumA.username.toLowerCase();
        valB = forumB.username.toLowerCase();
      }
      // Sort by date or string as appropriate
      if (sortConfig.key === "createdAt" || sortConfig.key === "updatedAt") {
        return sortConfig.direction === "desc" ? valB - valA : valA - valB;
      } else {
        return sortConfig.direction === "desc"
          ? valB.localeCompare(valA)
          : valA.localeCompare(valB);
      }
    });
    return filtered;
  },
  // Filter and sort replies by search and sort config
  runRepliesById(ids, entities, search, sortConfig) {
    // Convert search string to lowercase for case-insensitive matching
    const searchLower = search.toLowerCase();
    // Filter replies by search string in forum title or reply text
    let filtered = ids.filter((id) => {
      const reply = entities[id];
      return (
        reply.forumTitle.toLowerCase().includes(searchLower) ||
        reply.text.toLowerCase().includes(searchLower)
      );
    });
    // Sort the filtered replies by the provided sort config
    filtered.sort((a, b) => {
      const replyA = entities[a];
      const replyB = entities[b];
      let valA, valB;
      if (sortConfig.key === "createdAt") {
        valA = new Date(replyA.createdAt);
        valB = new Date(replyB.createdAt);
      } else if (sortConfig.key === "forumTitle") {
        valA = replyA.forumTitle.toLowerCase();
        valB = replyB.forumTitle.toLowerCase();
      } else if (sortConfig.key === "text") {
        valA = replyA.text.toLowerCase();
        valB = replyB.text.toLowerCase();
      }
      if (sortConfig.key === "createdAt") {
        return sortConfig.direction === "desc" ? valB - valA : valA - valB;
      } else {
        return sortConfig.direction === "desc"
          ? valB.localeCompare(valA)
          : valA.localeCompare(valB);
      }
    });
    return filtered;
  },
};

export default filterAndSort;
