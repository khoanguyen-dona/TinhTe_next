import { createSlice } from "@reduxjs/toolkit";
import { Post } from "@/dataTypes";
type InitialState = {
    currentDraft: Post|null
}

const initialState: InitialState = {
    currentDraft: null
}

const draftSlice = createSlice({
  name: "draft",
  initialState ,
  reducers: {
    setDraft: (state, action) => {
        state.currentDraft = action.payload
    },  
  },
});

export const { setDraft } = draftSlice.actions;
export default draftSlice.reducer;