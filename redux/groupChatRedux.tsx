import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatType } from "@/dataTypes";


import { MessageType } from "@/dataTypes";

type InitialState = {
    messages: MessageType[],
    loading: boolean,
    sound: boolean,
}

const initialState: InitialState = {
    messages: [],
    loading: false,
    sound: false,
}

const groupChatSlice = createSlice({
  name: "groupChat",
  initialState ,
  reducers: {
    setGroupChatMessages: ( state, action: PayloadAction<MessageType[]> ) => {
        state.messages = action.payload
    },
    setGroupChatSound: ( state, action: PayloadAction<boolean>) => {
        state.sound = action.payload
    },
    setGroupChatLoading: ( state, action: PayloadAction<boolean>) => {
        state.loading = action.payload
    }
  },
});

export const { setGroupChatMessages, setGroupChatSound, setGroupChatLoading } = groupChatSlice.actions;
export default groupChatSlice.reducer;