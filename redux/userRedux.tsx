import { createSlice } from "@reduxjs/toolkit";
import { User } from "@/dataTypes";
type InitialState = {
    currentUser: User|null
}

const initialState: InitialState = {
    currentUser: null
}

const userSlice = createSlice({
  name: "user",
  initialState ,
  reducers: {
    setUser: (state, action) => {
        state.currentUser = action.payload
    },  
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;