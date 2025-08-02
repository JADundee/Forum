import {
  createSelector,
  createEntityAdapter,
  /**
   * API slice for forums endpoints.
   * Handles fetching, adding, updating, and deleting forums.
   * Uses entity adapter for normalized state.
   */
} from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const forumsAdapter = createEntityAdapter({
  sortComparer: (a, b) =>
    a.completed === b.completed ? 0 : a.completed ? 1 : -1,
});

const initialState = forumsAdapter.getInitialState();

export const forumsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getForums: builder.query({
      query: () => ({
        url: "/forums",
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError;
        },
      }),
      transformResponse: (responseData) => {
        const loadedForums = responseData.map((forum) => {
          forum.id = forum._id;
          return forum;
        });
        return forumsAdapter.setAll(initialState, loadedForums);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "Forum", id: "LIST" },
            ...result.ids.map((id) => ({ type: "Forum", id })),
          ];
        } else return [{ type: "Forum", id: "LIST" }];
      },
    }),
    addNewForum: builder.mutation({
      query: (initialForum) => ({
        url: "/forums",
        method: "POST",
        body: {
          ...initialForum,
        },
      }),
      invalidatesTags: [{ type: "Forum", id: "LIST" }],
    }),
    updateForum: builder.mutation({
      query: (initialForum) => ({
        url: "/forums",
        method: "PATCH",
        body: {
          ...initialForum,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Forum", id: arg.id }],
    }),
    deleteForum: builder.mutation({
      query: ({ id }) => ({
        url: `/forums`,
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Forum", id: arg.id },
        { type: "Notification", id: "LIST" },
      ],
    }),
    getReplies: builder.query({
      query: (forumId) => ({
        url: `/forums/${forumId}/replies`,
        method: "GET",
      }),
      providesTags: (result, error, forumId) => [
        { type: "Replies", id: forumId },
      ],
    }),
    addReply: builder.mutation({
      query: ({ forumId, userId, replyText, username }) => {
        return {
          url: `/forums/${forumId}/replies`,
          method: "POST",
          body: { userId, replyText, username },
        };
      },
    }),
    deleteReply: builder.mutation({
      query: ({ replyId }) => ({
        url: `/forums/replies/${replyId}`,
        method: "DELETE",
      }),
    }),
    editReply: builder.mutation({
      query: ({ replyId, replyText }) => ({
        url: `/forums/replies/${replyId}`,
        method: "PATCH",
        body: { replyText },
      }),
    }),
    getNotifications: builder.query({
      query: () => ({
        url: "/notifications",
        method: "GET",
      }),
      providesTags: [{ type: "Notification", id: "LIST" }],
    }),
    markNotificationRead: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: "PATCH",
        body: { read: true },
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),
    createNotification: builder.mutation({
      query: ({ userId, forumId, replyText, username }) => ({
        url: "/notifications",
        method: "POST",
        body: { userId, forumId, replyText, username },
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: "/notifications/mark-all-read",
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),
    toggleLikeForum: builder.mutation({
      query: (forumId) => ({
        url: `/forums/${forumId}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Forum", id: arg }],
    }),
    toggleLikeReply: builder.mutation({
      query: ({ replyId }) => ({
        url: `/forums/replies/${replyId}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Replies", id: arg.forumId },
      ],
    }),
    toggleLike: builder.mutation({
      query: ({ targetId, targetType }) => ({
        url: "/likes",
        method: "POST",
        body: { targetId, targetType },
      }),
    }),
    getLikeCount: builder.query({
      query: ({ targetId, targetType }) => ({
        url: `/likes/count?targetId=${targetId}&targetType=${targetType}`,
        method: "GET",
      }),
    }),
    getUserLike: builder.query({
      query: ({ targetId, targetType }) => ({
        url: `/likes/user?targetId=${targetId}&targetType=${targetType}`,
        method: "GET",
      }),
    }),
    getRepliesByUser: builder.query({
      query: (userId) => ({
        url: `/forums/replies-by-user?userId=${userId}`,
        method: "GET",
      }),
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
      providesTags: (result, error, userId) => [
        { type: "Replies", id: userId },
      ],
    }),
    getRepliesCountByUser: builder.query({
      query: (userId) => ({
        url: `/forums/replies-by-user?userId=${userId}`,
        method: "GET",
      }),
      transformResponse: (response) =>
        Array.isArray(response) ? response.length : 0,
      providesTags: (result, error, userId) => [
        { type: "Replies", id: userId },
      ],
    }),
  }),
});

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

export const selectForumsResult = forumsApiSlice.endpoints.getForums.select();

const selectForumsData = createSelector(
  selectForumsResult,
  (forumsResult) => forumsResult.data
);

export const {
  selectAll: selectAllForums,
  selectById: selectForumById,
  selectIds: selectForumIds,
} = forumsAdapter.getSelectors(
  (state) => selectForumsData(state) ?? initialState
);
