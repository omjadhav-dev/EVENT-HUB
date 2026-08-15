import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import eventSlice from "./eventSlice";
import bookingsSlice from "./bookingsSlice";

const store = configureStore({
    reducer: {
        auth: authSlice,
        event: eventSlice,
        bookings: bookingsSlice,
    }
})

export default store;
