import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "../features/auth/authSlice";

// Configure the Redux store with reducers and middleware
export const store = configureStore({
  reducer: {
    // Add the API slice reducer under its own key
    [apiSlice.reducerPath]: apiSlice.reducer,
    // Add the authentication reducer
    auth: authReducer,
  },
  // Add API middleware for RTK Query to enable caching, invalidation, polling, etc.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  // Disable Redux DevTools in production for security/performance
  devTools: false,
});

// Set up listeners to enable features like refetchOnFocus/refetchOnReconnect for RTK Query
setupListeners(store.dispatch);
