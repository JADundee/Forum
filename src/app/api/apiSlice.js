import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials } from "../../features/auth/authSlice";

// Base query setup for all API requests, including attaching auth token if present
const baseQuery = fetchBaseQuery({
  baseUrl: "https://forum-backend-qlix.onrender.com",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Wrapper for baseQuery to handle 403 errors by attempting token refresh and retrying the request
const baseQueryWithReauth = async (args, api, extraOptions) => {
  // ...existing code...
  let result = await baseQuery(args, api, extraOptions);

  // If 403 error, try to refresh token and retry original request
  if (result?.error?.status === 403) {
    console.log("sending refresh token");

    // send refresh token to get new access token
    const refreshResult = await baseQuery("/auth/refresh", api, extraOptions);

    if (refreshResult?.data) {
      // store the new token
      api.dispatch(setCredentials({ ...refreshResult.data }));

      // retry original query with new access token
      result = await baseQuery(args, api, extraOptions);
    } else {
      if (refreshResult?.error?.status === 403) {
        refreshResult.error.data.message = "Your login has expired.";
      }
      return refreshResult;
    }
  }

  return result;
};

// Main API slice for RTK Query, defines endpoints and tag types
export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Forum", "User"],
  endpoints: (builder) => ({
    // Mutation endpoint for adding a reply to a forum
    addReply: builder.mutation({
      query: ({ forumId, userId, replyText }) => {
        return {
          url: `/forums/${forumId}/replies`,
          method: "POST",
          body: { userId, replyText },
        };
      },

      // Optional: custom query function for addReply (for logging or advanced logic)
      async queryFn({ forumId, userId, replyText }) {
        console.log("Add reply query function:", {
          forumId,
          userId,
          replyText,
        });
      },
    }),
    // ...add additional endpoints here...
  }),
});
