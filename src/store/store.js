import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import eventSlice from "./eventSlice";
import bookingsSlice from "./bookingsSlice";
import usersSlice from "./usersSlice";

const store = configureStore({
    reducer: {
        auth: authSlice,
        event: eventSlice,
        bookings: bookingsSlice,
        users: usersSlice,
    }
})

export default store;
