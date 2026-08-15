import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: false,
    userData: null,
    // Whether we've finished trying to restore a session from the
    // httpOnly cookie on app load (see App.jsx). Used to avoid flashing
    // "logged out" UI before that check has resolved.
    authChecked: false,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.status = true;
            state.userData = action.payload.userData;
            state.authChecked = true;
        },
        logout: (state) => {
            state.status = false;
            state.userData = null;
            state.authChecked = true;
        },
        updateUser: (state, action) => {
            state.userData = { ...state.userData, ...action.payload };
        },
        authCheckFinished: (state) => {
            state.authChecked = true;
        },
    }
})

export const { login, logout, updateUser, authCheckFinished } = authSlice.actions;

export default authSlice.reducer;
