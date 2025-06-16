import {
    createSelector,
    createEntityAdapter
} from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice"

const notesAdapter = createEntityAdapter({
    sortComparer: (a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1
})

const initialState = notesAdapter.getInitialState()

export const notesApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getNotes: builder.query({
            query: () => ({
                url: '/notes',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            transformResponse: responseData => {
                const loadedNotes = responseData.map(note => {
                    note.id = note._id
                    return note
                });
                return notesAdapter.setAll(initialState, loadedNotes)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Note', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'Note', id }))
                    ]
                } else return [{ type: 'Note', id: 'LIST' }]
            }
        }),
        addNewNote: builder.mutation({
            query: initialNote => ({
                url: '/notes',
                method: 'POST',
                body: {
                    ...initialNote,
                }
            }),
            invalidatesTags: [
                { type: 'Note', id: "LIST" }
            ]
        }),
        updateNote: builder.mutation({
            query: initialNote => ({
                url: '/notes',
                method: 'PATCH',
                body: {
                    ...initialNote,
                }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Note', id: arg.id }
            ]
        }),
        deleteNote: builder.mutation({
            query: ({ id }) => ({
                url: `/notes`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Note', id: arg.id }
            ]
        }),
        getReplies: builder.query({
            query: (noteId) => ({
                url: `/notes/${noteId}/replies`,
                method: 'GET',
            }),
        }),
        addReply: builder.mutation({
            query: ({ noteId, userId, replyText, username }) => {
                return {
                url: `/notes/${noteId}/replies`,
                method: 'POST',
                body: { userId, replyText, username },
                };
            },
            async queryFn({ noteId, userId, replyText, username }) {
                // Create a new notification object
                const notification = {
                userId,
                noteId,
                replyText,
                username,
                createdAt: new Date().toISOString(),
                };

                // Add the notification to the database
                await fetch('/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notification),
                });

                // Return the result of the original query
                return await fetch(`/notes/${noteId}/replies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, replyText }),
                });
            },
        }),
        deleteReply: builder.mutation({
            query: ({ replyId }) => ({
                url: `/notes/replies/${replyId}`,
                method: 'DELETE',
            }),
        }),
    }),
})

export const {
    useGetNotesQuery,
    useAddNewNoteMutation,
    useUpdateNoteMutation,
    useDeleteNoteMutation,
    useAddReplyMutation,
    useGetRepliesQuery,
    useDeleteReplyMutation
} = notesApiSlice

// returns the query result object
export const selectNotesResult = notesApiSlice.endpoints.getNotes.select()

// creates memoized selector
const selectNotesData = createSelector(
    selectNotesResult,
    notesResult => notesResult.data // normalized state object with ids & entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllNotes,
    selectById: selectNoteById,
    selectIds: selectNoteIds
    // Pass in a selector that returns the notes slice of state
} = notesAdapter.getSelectors(state => selectNotesData(state) ?? initialState)