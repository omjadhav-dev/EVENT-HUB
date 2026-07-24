import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    list: [], // { ticketId, eventId, eventTitle, eventImage, eventDate, eventLocation, userEmail, userName, bookedAt, status }
}

const bookingsSlice = createSlice({
    name: "bookings",
    initialState,
    reducers: {
        addBooking: (state, action) => {
            state.list.push({ checkedIn: false, ...action.payload });
        },
        cancelBooking: (state, action) => {
            const booking = state.list.find(
                (b) => b.ticketId === action.payload,
            );
            if (booking) {
                booking.status = "Cancelled";
            }
        },
        checkInBooking: (state, action) => {
            const booking = state.list.find(
                (b) => b.ticketId === action.payload,
            );
            if (booking) {
                booking.checkedIn = true;
            }
        },
    }
})

export const { addBooking, cancelBooking, checkInBooking } = bookingsSlice.actions;
export default bookingsSlice.reducer;
