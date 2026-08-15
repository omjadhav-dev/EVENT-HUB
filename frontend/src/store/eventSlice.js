import { createSlice } from "@reduxjs/toolkit";

// Live cache of events fetched from the backend. Replaces the old
// eventList.js dummy-data seed - every event here now comes from
// GET /api/v1/events (or the my-events / single-event endpoints).
const initialState = {
    list: [],
}

const eventSlice = createSlice({
    name: "event",
    initialState,
    reducers: {
        setEvents: (state, action) => {
            state.list = action.payload;
        },
        addEvent: (state, action) => {
            state.list.push(action.payload);
        },
        updateEventInList: (state, action) => {
            const index = state.list.findIndex((e) => e._id === action.payload._id);
            if (index !== -1) state.list[index] = action.payload;
        },
        removeEventFromList: (state, action) => {
            state.list = state.list.filter((e) => e._id !== action.payload);
        },
    }
})

export const { setEvents, addEvent, updateEventInList, removeEventFromList } = eventSlice.actions;
export default eventSlice.reducer;
