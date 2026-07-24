import { createSlice } from "@reduxjs/toolkit";
import eventList from "../data/eventList";

// This slice is now the single source of truth for ALL events shown across
// the app (Home, Explore, Event details, My Events). It starts out seeded
// with the dummy data from src/data/eventList.js, and any event created via
// the Create Event form gets pushed into the same array with "addEvent".
// This way eventList.js and eventSlice no longer compete with each other -
// eventList.js is just the *initial seed data*, and eventSlice is the *live
// state* that the rest of the app should actually read from.
const initialState = {
    list: eventList,
}

const eventSlice = createSlice({
    name: "event",
    initialState,
    reducers: {
        addEvent: (state, action) => {
            state.list.push(action.payload);
        },
    }
})

export const { addEvent } = eventSlice.actions;
export default eventSlice.reducer;
