import { createSlice } from "@reduxjs/toolkit";

// Holds every account created via SignUp so Login can verify credentials
// and figure out whether someone is an Attendee or Organizer on its own,
// instead of asking them to pick. This is an in-memory stand-in for a real
// backend/database - it resets on page refresh, same as the rest of the
// app's state.
const initialState = {
    list: [], // { name, email, password, userType }
}

const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        registerUser: (state, action) => {
            state.list.push(action.payload);
        },
        updateUserRecord: (state, action) => {
            const { email, updates } = action.payload;
            const user = state.list.find((u) => u.email === email);
            if (user) {
                Object.assign(user, updates);
            }
        },
    }
})

export const { registerUser, updateUserRecord } = usersSlice.actions;
export default usersSlice.reducer;
