import { createSlice } from "@reduxjs/toolkit";

type InitialState = {
    searchType: 'user'|'post'
}

const initialState: InitialState = {
    searchType: 'user'
}

const searchSlice = createSlice({
  name: "search",
  initialState ,
  reducers: {
    setSearchType: (state, action) => {
        state.searchType = action.payload
    },  
  },
});

export const { setSearchType } = searchSlice.actions;
export default searchSlice.reducer;