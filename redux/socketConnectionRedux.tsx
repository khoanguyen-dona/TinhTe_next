import { createSlice, PayloadAction } from "@reduxjs/toolkit";
type InitialState = {
    isConnected: boolean,
    reconnectSuccess: boolean,
}

const initialState: InitialState = {
    isConnected: true,
    reconnectSuccess: false,
}

const socketConnectionSlice = createSlice({
  name: "socketConnection",
  initialState ,
  reducers: {
    setSocketConnection: (state, action: PayloadAction<boolean>) => {
        state.isConnected = action.payload
    },       
    setReconnectSuccess: (state, action: PayloadAction<boolean>) => {
      state.reconnectSuccess = action.payload
    }, 
  }
});


export const { setSocketConnection, setReconnectSuccess } = socketConnectionSlice.actions;
export default socketConnectionSlice.reducer;