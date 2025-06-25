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
        }),
        deleteReply: builder.mutation({
            query: ({ replyId }) => ({
                url: `/notes/replies/${replyId}`,
                method: 'DELETE',
            }),
        }),
         getNotifications: builder.query({
            query: () => ({
                url: '/notifications',
                method: 'GET',
            }),
            providesTags: [{ type: 'Notification', id: 'LIST' }],
        }),
        markNotificationRead: builder.mutation({
            query: (notificationId) => ({
                url: `/notifications/${notificationId}`,
                method: 'PATCH',
                body: { read: true },
            }),
            invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
        }),
        createNotification: builder.mutation({
            query: ({ userId, noteId, replyText, username }) => ({
                url: '/notifications',
                method: 'POST',
                body: { userId, noteId, replyText, username },
            }),
            invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
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
    useDeleteReplyMutation,
    useGetNotificationsQuery,
    useMarkNotificationReadMutation,
    useCreateNotificationMutation
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