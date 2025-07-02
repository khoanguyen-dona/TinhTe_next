import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/dataTypes";
type InitialState = {
    currentUser: User|null
    onlineUsers: string[]
    // accessToken: string|null
}

const initialState: InitialState = {
    currentUser: null,
    onlineUsers: [],
    // accessToken: null,
}

const userSlice = createSlice({
  name: "user",
  initialState ,
  reducers: {
    setUser: (state, action: PayloadAction<User|null>) => {
        state.currentUser = action.payload
    },   

    setOnlineUsers: (state, action: PayloadAction<string[]|[]>) => {
      state.onlineUsers = action.payload
    },

    addUserToOnlineUsers: (state, action: PayloadAction<string>) => {
      state.onlineUsers = [...state.onlineUsers, action.payload]
    },
    // setAccessToken: (state, action: PayloadAction<string|null>) => {
    //   state.accessToken = action.payload
    // }
  }
});


export const { setUser, setOnlineUsers, addUserToOnlineUsers } = userSlice.actions;
export default userSlice.reducer;