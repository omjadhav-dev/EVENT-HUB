import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    title: null,
    description: null,
    category: null,
    mode: null,
    image: null,
    tags: null,
    start: null,
    end: null,
    venue: null,
    city: null
}

const eventSlice =  createSlice({
    name: "event",
    initialState,
    reducers: {
        details: (state, action) => {
            state.title = action.payload.title,
            state.description = action.payload.description,
            state.category = action.payload.category,
            state.mode = action.payload.mode,
            state.image = action.payload.image,
            state.tags = action.payload.tags,
            state.start = action.payload.start,
            state.end = action.payload.end,
            state.venue = action.payload.venue,
            state.city = action.payload.city
            

        }
    }
})

export const {details} = eventSlice.actions;
export default eventSlice.reducer;