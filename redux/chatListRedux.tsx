import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatType } from "@/dataTypes";

type InitialState = {
    currentChatList: ChatType[],
    notifyCount : number,
    hasNext: boolean,
}

const initialState: InitialState = {
    currentChatList: [],
    notifyCount: 0,
    hasNext: false

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
    },
    addChatToChatListAtTail: (state, action: PayloadAction<ChatType> )=>{
      // state.currentChatList.push(action.payload)
      state.currentChatList = [...state.currentChatList,action.payload]
    },
    setChatListHasNext: (state, action: PayloadAction<boolean>)=>{
      state.hasNext = action.payload
    }

  },
});

export const { setChatList, updateChatList, setNotifyCount, addChatToChatList, setChatListHasNext, addChatToChatListAtTail } = chatListSlice.actions;
export default chatListSlice.reducer;