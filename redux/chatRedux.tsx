'use client'
import { createSlice } from "@reduxjs/toolkit";
import {  MessageType, User } from "@/dataTypes";
import { publicRequest } from "@/requestMethod";
import { useEffect } from "react";

type InitialState = {
    messages: MessageType[]|null,
    senderData: User|null
    isOpen: boolean,
    chatId: string|null,
    chatLoading: boolean,
    pageNumber: number ,
}

const initialState: InitialState = {
    messages: null,
    senderData: null,
    isOpen: false,
    chatId: null,
    chatLoading: false,
    pageNumber: 1,
}

const chatSlice = createSlice({
  name: "chat",
  initialState ,
  reducers: {
    setMessages: (state, action) => {
        state.messages = action.payload
    },
    setSenderData: (state, action) => {
        state.senderData = action.payload
    }  ,
    setChatState: (state, action) =>{
        state.isOpen = action.payload
    },
    setChatLoading: (state, action) => {
      state.chatLoading = action.payload
    },
    setChatId: (state, action) =>{
        state.chatId = action.payload
    },
    setChatPage: (state, action) => {
        state.pageNumber = action.payload
    },
   
  },
});



export const { setMessages, setSenderData, setChatState, setChatId, setChatLoading, setChatPage} = chatSlice.actions;
export default chatSlice.reducer;