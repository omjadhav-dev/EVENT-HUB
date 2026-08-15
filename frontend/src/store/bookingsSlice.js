import { createSlice } from "@reduxjs/toolkit";

// Live cache of the logged-in user's registrations, fetched from
// GET /api/v1/registrations/my-bookings. Each entry is a Registration
// document from the backend: { _id, eventId (populated Event), userId,
// qrCode, checkedIn, status, createdAt, ... }
const initialState = {
    list: [],
}

const bookingsSlice = createSlice({
    name: "bookings",
    initialState,
    reducers: {
        setBookings: (state, action) => {
            state.list = action.payload;
        },
        addBooking: (state, action) => {
            state.list.unshift(action.payload);
        },
        // Merge partial updates (e.g. { status: "Cancelled" } or
        // { checkedIn: true }) into the booking with this _id - used after
        // a successful cancel/check-in API call.
        updateBooking: (state, action) => {
            const { _id, updates } = action.payload;
            const booking = state.list.find((b) => b._id === _id);
            if (booking) Object.assign(booking, updates);
        },
    }
})

export const { setBookings, addBooking, updateBooking } = bookingsSlice.actions;
export default bookingsSlice.reducer;
