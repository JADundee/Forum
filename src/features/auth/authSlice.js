import { createSlice } from '@reduxjs/toolkit'

const initialState = { token: sessionStorage.getItem('token') || null }

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { accessToken, persist } = action.payload
            state.token = accessToken
            // Only store in sessionStorage if NOT persistent login
            if (!persist) {
                sessionStorage.setItem('token', accessToken)
            } else {
                sessionStorage.removeItem('token')
            }
        },
        logOut: (state, action) => {
            state.token = null
            sessionStorage.removeItem('token')
        },
    }
})

export const { setCredentials, logOut } = authSlice.actions

export default authSlice.reducer

export const selectCurrentToken = (state) => state.auth.token