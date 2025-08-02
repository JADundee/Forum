import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

// Create an entity adapter for users to manage normalized user data in the Redux store
const usersAdapter = createEntityAdapter({});

// Define the initial state for the users slice using the adapter
const initialState = usersAdapter.getInitialState();

// Inject user-related endpoints into the main API slice for RTK Query
export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoint for fetching all users from the backend
    getUsers: builder.query({
      // API endpoint for fetching users
      query: () => "/users",
      // Validate the response status and ensure no error is present
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError;
      },
      // Transform the response to normalize user data for the Redux store
      transformResponse: (responseData) => {
        // Map backend _id to id for entity adapter compatibility
        const loadedUsers = responseData.map((user) => {
          user.id = user._id;
          return user;
        });
        // Set all users in the normalized state
        return usersAdapter.setAll(initialState, loadedUsers);
      },
      // Provide tags for cache invalidation and refetching
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          // Tag each user and the user list for cache management
          return [
            { type: "User", id: "LIST" },
            ...result.ids.map((id) => ({ type: "User", id })),
          ];
        } else return [{ type: "User", id: "LIST" }];
      },
    }),
    // Endpoint for registering a new user
    addNewUser: builder.mutation({
      // API endpoint for user registration
      query: (initialUserData) => ({
        url: "/register",
        method: "POST",
        body: {
          ...initialUserData,
        },
      }),
      // Invalidate the user list cache after adding a new user
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    // Endpoint for updating an existing user
    updateUser: builder.mutation({
      // API endpoint for updating user data
      query: (initialUserData) => ({
        url: "/users",
        method: "PATCH",
        body: {
          ...initialUserData,
        },
      }),
      // Invalidate cache for the updated user so UI stays in sync
      invalidatesTags: (result, error, arg) => [{ type: "User", id: arg.id }],
    }),
    // Endpoint for deleting a user
    deleteUser: builder.mutation({
      // API endpoint for deleting a user by ID
      query: ({ id }) => ({
        url: `/users`,
        method: "DELETE",
        body: { id },
      }),
      // Invalidate cache for the deleted user
      invalidatesTags: (result, error, arg) => [{ type: "User", id: arg.id }],
    }),
    // Endpoint for fetching forums liked by a user
    getLikedForums: builder.query({
      // API endpoint for liked forums by user ID
      query: (userId) => `/users/${userId}/liked-forums`,
    }),
    // Endpoint for fetching replies liked by a user
    getLikedReplies: builder.query({
      // API endpoint for liked replies by user ID
      query: (userId) => `/users/${userId}/liked-replies`,
    }),
  }),
});

// Export hooks for each endpoint for use in components
export const {
  useGetUsersQuery,
  useAddNewUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetLikedForumsQuery,
  useGetLikedRepliesQuery,
} = usersApiSlice;

// Selector for the raw query result of getUsers
export const selectUsersResult = usersApiSlice.endpoints.getUsers.select();

// Memoized selector to get the normalized users data from the query result
const selectUsersData = createSelector(
  selectUsersResult,
  (usersResult) => usersResult.data
);

// Export entity adapter selectors for all users, by ID, and IDs array
export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
  selectIds: selectUserIds,
} = usersAdapter.getSelectors(
  (state) => selectUsersData(state) ?? initialState
);
