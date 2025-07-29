const filterAndSort = {
    run(ids, entities, search, sortConfig, username) {
        let filtered = ids.filter(id => entities[id].username);
        if (username) {
            filtered = filtered.filter(id => entities[id].username === username);
        }
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(id => {
            const note = entities[id];
            return (
                note.title.toLowerCase().includes(searchLower) ||
                note.username.toLowerCase().includes(searchLower)
            );
        });
        filtered.sort((a, b) => {
            const noteA = entities[a];
            const noteB = entities[b];
            let valA, valB;
            if (sortConfig.key === 'createdAt') {
                valA = new Date(noteA.createdAt);
                valB = new Date(noteB.createdAt);
            } else if (sortConfig.key === 'updatedAt') {
                valA = new Date(noteA.updatedAt);
                valB = new Date(noteB.updatedAt);
            } else if (sortConfig.key === 'title') {
                valA = noteA.title.toLowerCase();
                valB = noteB.title.toLowerCase();
            } else if (sortConfig.key === 'username') {
                valA = noteA.username.toLowerCase();
                valB = noteB.username.toLowerCase();
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
                reply.noteTitle.toLowerCase().includes(searchLower) ||
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
            } else if (sortConfig.key === 'noteTitle') {
                valA = replyA.noteTitle.toLowerCase();
                valB = replyB.noteTitle.toLowerCase();
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