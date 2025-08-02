import {
  createSelector,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

// Create an entity adapter for forums to manage normalized forum data in the Redux store
const forumsAdapter = createEntityAdapter({
  // Optional: sort forums by completion status (customize as needed)
  sortComparer: (a, b) =>
    a.completed === b.completed ? 0 : a.completed ? 1 : -1,
});

// Define the initial state for the forums slice using the adapter
const initialState = forumsAdapter.getInitialState();

// Inject forum-related endpoints into the main API slice for RTK Query
export const forumsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoint for fetching all forums
    getForums: builder.query({
      // API endpoint for fetching forums
      query: () => ({
        url: "/forums",
        // Validate the response status and ensure no error is present
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError;
        },
      }),
      // Transform the response to normalize forum data for the Redux store
      transformResponse: (responseData) => {
        // Map backend _id to id for entity adapter compatibility
        const loadedForums = responseData.map((forum) => {
          forum.id = forum._id;
          return forum;
        });
        // Set all forums in the normalized state
        return forumsAdapter.setAll(initialState, loadedForums);
      },
      // Provide tags for cache invalidation and refetching
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          // Tag each forum and the forum list for cache management
          return [
            { type: "Forum", id: "LIST" },
            ...result.ids.map((id) => ({ type: "Forum", id })),
          ];
        } else return [{ type: "Forum", id: "LIST" }];
      },
    }),
    // Endpoint for adding a new forum
    addNewForum: builder.mutation({
      // API endpoint for creating a new forum
      query: (initialForum) => ({
        url: "/forums",
        method: "POST",
        body: {
          ...initialForum,
        },
      }),
      // Invalidate the forum list cache after adding a new forum
      invalidatesTags: [{ type: "Forum", id: "LIST" }],
    }),
    // Endpoint for updating an existing forum
    updateForum: builder.mutation({
      // API endpoint for updating forum data
      query: (initialForum) => ({
        url: "/forums",
        method: "PATCH",
        body: {
          ...initialForum,
        },
      }),
      // Invalidate cache for the updated forum so UI stays in sync
      invalidatesTags: (result, error, arg) => [{ type: "Forum", id: arg.id }],
    }),
    // Endpoint for deleting a forum
    deleteForum: builder.mutation({
      // API endpoint for deleting a forum by ID
      query: ({ id }) => ({
        url: `/forums`,
        method: "DELETE",
        body: { id },
      }),
      // Invalidate cache for the deleted forum and notifications
      invalidatesTags: (result, error, arg) => [
        { type: "Forum", id: arg.id },
        { type: "Notification", id: "LIST" },
      ],
    }),
    // Endpoint for fetching all replies for a forum
    getReplies: builder.query({
      // API endpoint for fetching replies by forum ID
      query: (forumId) => ({
        url: `/forums/${forumId}/replies`,
        method: "GET",
      }),
      // Provide tags for cache management
      providesTags: (result, error, forumId) => [
        { type: "Replies", id: forumId },
      ],
    }),
    // Endpoint for adding a reply to a forum
    addReply: builder.mutation({
      // API endpoint for posting a reply
      query: ({ forumId, userId, replyText, username }) => {
        return {
          url: `/forums/${forumId}/replies`,
          method: "POST",
          body: { userId, replyText, username },
        };
      },
    }),
    // Endpoint for deleting a reply by reply ID
    deleteReply: builder.mutation({
      query: ({ replyId }) => ({
        url: `/forums/replies/${replyId}`,
        method: "DELETE",
      }),
    }),
    // Endpoint for editing a reply by reply ID
    editReply: builder.mutation({
      query: ({ replyId, replyText }) => ({
        url: `/forums/replies/${replyId}`,
        method: "PATCH",
        body: { replyText },
      }),
    }),
    // Endpoint for fetching all notifications
    getNotifications: builder.query({
      query: () => ({
        url: "/notifications",
        method: "GET",
      }),
      // Provide tags for cache management
      providesTags: [{ type: "Notification", id: "LIST" }],
    }),
    // Endpoint for marking a notification as read
    markNotificationRead: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: "PATCH",
        body: { read: true },
      }),
      // Invalidate notification list cache after marking as read
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),
    // Endpoint for creating a new notification
    createNotification: builder.mutation({
      query: ({ userId, forumId, replyText, username }) => ({
        url: "/notifications",
        method: "POST",
        body: { userId, forumId, replyText, username },
      }),
      // Invalidate notification list cache after creating
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),
    // Endpoint for marking all notifications as read
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: "/notifications/mark-all-read",
        method: "PATCH",
      }),
      // Invalidate notification list cache after marking all as read
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),
    // Endpoint for deleting a notification by ID
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      // Invalidate notification list cache after deletion
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),
    // Endpoint for toggling like status on a forum
    toggleLikeForum: builder.mutation({
      query: (forumId) => ({
        url: `/forums/${forumId}/like`,
        method: "POST",
      }),
      // Invalidate cache for the liked forum
      invalidatesTags: (result, error, arg) => [{ type: "Forum", id: arg }],
    }),
    // Endpoint for toggling like status on a reply
    toggleLikeReply: builder.mutation({
      query: ({ replyId }) => ({
        url: `/forums/replies/${replyId}/like`,
        method: "POST",
      }),
      // Invalidate cache for the replies of the forum
      invalidatesTags: (result, error, arg) => [
        { type: "Replies", id: arg.forumId },
      ],
    }),
    // Endpoint for toggling like status on any target (forum or reply)
    toggleLike: builder.mutation({
      query: ({ targetId, targetType }) => ({
        url: "/likes",
        method: "POST",
        body: { targetId, targetType },
      }),
    }),
    // Endpoint for fetching like count for a target (forum or reply)
    getLikeCount: builder.query({
      query: ({ targetId, targetType }) => ({
        url: `/likes/count?targetId=${targetId}&targetType=${targetType}`,
        method: "GET",
      }),
    }),
    // Endpoint for fetching whether the current user liked a target
    getUserLike: builder.query({
      query: ({ targetId, targetType }) => ({
        url: `/likes/user?targetId=${targetId}&targetType=${targetType}`,
        method: "GET",
      }),
    }),
    // Endpoint for fetching all replies by a user
    getRepliesByUser: builder.query({
      query: (userId) => ({
        url: `/forums/replies-by-user?userId=${userId}`,
        method: "GET",
      }),
      // Transform the response to normalized structure (ids/entities)
      transformResponse: (response) => {
        if (Array.isArray(response)) {
          const ids = response.map((r) => r._id);
          const entities = {};
          response.forEach((r) => {
            entities[r._id] = r;
          });
          return { ids, entities };
        }
        return response;
      },
      // Provide tags for cache management
      providesTags: (result, error, userId) => [
        { type: "Replies", id: userId },
      ],
    }),
    // Endpoint for fetching the count of replies by a user
    getRepliesCountByUser: builder.query({
      query: (userId) => ({
        url: `/forums/replies-by-user?userId=${userId}`,
        method: "GET",
      }),
      // Transform the response to just the count
      transformResponse: (response) =>
        Array.isArray(response) ? response.length : 0,
      // Provide tags for cache management
      providesTags: (result, error, userId) => [
        { type: "Replies", id: userId },
      ],
    }),
  }),
});

// Export hooks for each endpoint for use in components
export const {
  useGetForumsQuery,
  useAddNewForumMutation,
  useUpdateForumMutation,
  useDeleteForumMutation,
  useAddReplyMutation,
  useGetRepliesQuery,
  useDeleteReplyMutation,
  useEditReplyMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useCreateNotificationMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useToggleLikeForumMutation,
  useToggleLikeReplyMutation,
  useToggleLikeMutation,
  useGetLikeCountQuery,
  useGetUserLikeQuery,
  useGetRepliesByUserQuery,
  useGetRepliesCountByUserQuery,
} = forumsApiSlice;

// Selector for the raw query result of getForums
export const selectForumsResult = forumsApiSlice.endpoints.getForums.select();

// Memoized selector to get the normalized forums data from the query result
const selectForumsData = createSelector(
  selectForumsResult,
  (forumsResult) => forumsResult.data
);

// Export entity adapter selectors for all forums, by ID, and IDs array
export const {
  selectAll: selectAllForums,
  selectById: selectForumById,
  selectIds: selectForumIds,
} = forumsAdapter.getSelectors(
  (state) => selectForumsData(state) ?? initialState
);
