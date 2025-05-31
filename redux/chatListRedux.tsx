import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatType } from "@/dataTypes";

type InitialState = {
    currentChatList: ChatType[],
    notifyCount : number
}

const initialState: InitialState = {
    currentChatList: [],
    notifyCount: 0,

}

const chatListSlice = createSlice({
  name: "chatList",
  initialState ,
  reducers: {
    setChatList: (state, action) => {
        state.currentChatList = action.payload
    },

    updateChatList: (state, action: PayloadAction<{ chatId: string; newData: Partial<ChatType> }>) => {
      if(state.currentChatList.length>0){

        state.currentChatList  = state?.currentChatList?.map(chat =>
          chat._id === action.payload.chatId ? {...chat,...action.payload.newData} : chat
        )
      }
    },
    setNotifyCount: (state, action: PayloadAction<number>) => {
      state.notifyCount = action.payload
    },
    addChatToChatList: (state, action: PayloadAction<ChatType> )=>{
      // state.currentChatList.push(action.payload)
      state.currentChatList = [action.payload,...state.currentChatList]
    }

  },
});

export const { setChatList, updateChatList, setNotifyCount, addChatToChatList } = chatListSlice.actions;
export default chatListSlice.reducer;