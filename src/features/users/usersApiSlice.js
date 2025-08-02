import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

// Adapter for managing normalized user data in the Redux store
const usersAdapter = createEntityAdapter({});

// Initial state for the users slice
const initialState = usersAdapter.getInitialState();

// Inject user-related endpoints into the main API slice
export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoint for fetching all users
    getUsers: builder.query({
      query: () => "/users",
      // Validate the response status and error
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError;
      },
      // Transform the response to normalize user data
      transformResponse: (responseData) => {
        const loadedUsers = responseData.map((user) => {
          user.id = user._id;
          return user;
        });
        return usersAdapter.setAll(initialState, loadedUsers);
      },
      // Provide tags for cache invalidation
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "User", id: "LIST" },
            ...result.ids.map((id) => ({ type: "User", id })),
          ];
        } else return [{ type: "User", id: "LIST" }];
      },
    }),
    // Endpoint for registering a new user
    addNewUser: builder.mutation({
      query: (initialUserData) => ({
        url: "/register",
        method: "POST",
        body: {
          ...initialUserData,
        },
      }),
      // Invalidate user list cache after adding
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    // Endpoint for updating an existing user
    updateUser: builder.mutation({
      query: (initialUserData) => ({
        url: "/users",
        method: "PATCH",
        body: {
          ...initialUserData,
        },
      }),
      // Invalidate cache for the updated user
      invalidatesTags: (result, error, arg) => [{ type: "User", id: arg.id }],
    }),
    // Endpoint for deleting a user
    deleteUser: builder.mutation({
      query: ({ id }) => ({
        url: `/users`,
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "User", id: arg.id }],
    }),
    getLikedForums: builder.query({
      query: (userId) => `/users/${userId}/liked-forums`,
    }),
    getLikedReplies: builder.query({
      query: (userId) => `/users/${userId}/liked-replies`,
    }),
  }),
});

export const {
  useGetUsersQuery,
  useAddNewUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetLikedForumsQuery,
  useGetLikedRepliesQuery,
} = usersApiSlice;

export const selectUsersResult = usersApiSlice.endpoints.getUsers.select();

const selectUsersData = createSelector(
  selectUsersResult,
  (usersResult) => usersResult.data
);

export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
  selectIds: selectUserIds,
} = usersAdapter.getSelectors(
  (state) => selectUsersData(state) ?? initialState
);
