import { createSlice } from "@reduxjs/toolkit";

/**
 * Redux slice for authentication state.
 * Handles storing and clearing the access token.
 */
const initialState = { token: sessionStorage.getItem("token") || null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Sets credentials (access token) in state and sessionStorage.
     * Removes token from sessionStorage if persistent login is enabled.
     */
    setCredentials: (state, action) => {
      const { accessToken, persist } = action.payload;
      state.token = accessToken;
      // Only store in sessionStorage if NOT persistent login
      if (!persist) {
        sessionStorage.setItem("token", accessToken);
      } else {
        sessionStorage.removeItem("token");
      }
    },
    
     // Logs out the user and clears the token from state and sessionStorage.
    logOut: (state, action) => {
      state.token = null;
      sessionStorage.removeItem("token");
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;

 // Selector to get the current access token from state.
export const selectCurrentToken = (state) => state.auth.token;
