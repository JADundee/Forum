const filterAndSort = {
    run(ids, entities, search, sortConfig, username) {
        let filtered = ids.filter(id => entities[id].username);
        if (username) {
            filtered = filtered.filter(id => entities[id].username === username);
        }
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(id => {
            const forum = entities[id];
            return (
                forum.title.toLowerCase().includes(searchLower) ||
                forum.username.toLowerCase().includes(searchLower)
            );
        });
        filtered.sort((a, b) => {
            const forumA = entities[a];
            const forumB = entities[b];
            let valA, valB;
            if (sortConfig.key === 'createdAt') {
                valA = new Date(forumA.createdAt);
                valB = new Date(forumB.createdAt);
            } else if (sortConfig.key === 'updatedAt') {
                valA = new Date(forumA.updatedAt);
                valB = new Date(forumB.updatedAt);
            } else if (sortConfig.key === 'title') {
                valA = forumA.title.toLowerCase();
                valB = forumB.title.toLowerCase();
            } else if (sortConfig.key === 'username') {
                valA = forumA.username.toLowerCase();
                valB = forumB.username.toLowerCase();
            }
            if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
                return sortConfig.direction === 'desc' ? valB - valA : valA - valB;
            } else {
                return sortConfig.direction === 'desc'
                    ? valB.localeCompare(valA)
                    : valA.localeCompare(valB);
            }
        });
        return filtered;
    },
    runRepliesById(ids, entities, search, sortConfig) {
        const searchLower = search.toLowerCase();
        let filtered = ids.filter(id => {
            const reply = entities[id];
            return (
                reply.forumTitle.toLowerCase().includes(searchLower) ||
                reply.text.toLowerCase().includes(searchLower)
            );
        });
        filtered.sort((a, b) => {
            const replyA = entities[a];
            const replyB = entities[b];
            let valA, valB;
            if (sortConfig.key === 'createdAt') {
                valA = new Date(replyA.createdAt);
                valB = new Date(replyB.createdAt);
            } else if (sortConfig.key === 'forumTitle') {
                valA = replyA.forumTitle.toLowerCase();
                valB = replyB.forumTitle.toLowerCase();
            } else if (sortConfig.key === 'text') {
                valA = replyA.text.toLowerCase();
                valB = replyB.text.toLowerCase();
            }
            if (sortConfig.key === 'createdAt') {
                return sortConfig.direction === 'desc' ? valB - valA : valA - valB;
            } else {
                return sortConfig.direction === 'desc'
                    ? valB.localeCompare(valA)
                    : valA.localeCompare(valB);
            }
        });
        return filtered;
    }
};

export default filterAndSort;