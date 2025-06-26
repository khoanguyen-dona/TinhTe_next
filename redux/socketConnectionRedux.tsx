import { createSlice, PayloadAction } from "@reduxjs/toolkit";
type InitialState = {
    isConnected: boolean,
    isReconnect: boolean,
    reconnectSuccess: boolean,
}

const initialState: InitialState = {
    isConnected: true,
    isReconnect: false,
    reconnectSuccess: false,
}

const socketConnectionSlice = createSlice({
  name: "socketConnection",
  initialState ,
  reducers: {
    setSocketConnection: (state, action: PayloadAction<boolean>) => {
        state.isConnected = action.payload
    },   
    setSocketReconnect: (state, action: PayloadAction<boolean>) => {
      state.isReconnect = action.payload
    },     
    setReconnectSuccess: (state, action: PayloadAction<boolean>) => {
      state.reconnectSuccess = action.payload
    }, 
  }
});


export const { setSocketConnection, setSocketReconnect, setReconnectSuccess } = socketConnectionSlice.actions;
export default socketConnectionSlice.reducer;