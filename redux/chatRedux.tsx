'use client'
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {  MessageType, User } from "@/dataTypes";
import { publicRequest } from "@/requestMethod";
import { useEffect } from "react";

type InitialState = {
    messages: MessageType[]|MessageType|null,
    senderData: User|null
    isOpen: boolean,
    chatId: string|null,
    chatLoading: boolean,
    pageNumber: number ,
    sound: boolean,
    userStatus: 'online'|'offline',
    lastAccess: string|''
}   

const initialState: InitialState = {
    messages: null,
    senderData: null,
    isOpen: false,
    chatId: null,
    chatLoading: false,
    pageNumber: 1,
    sound: true,
    userStatus: 'offline',
    lastAccess: ''
}

const chatSlice = createSlice({
  name: "chat",
  initialState ,
  reducers: {
    setMessages: (state, action: PayloadAction<MessageType[]|MessageType|null>) => {
        state.messages = action.payload
    },
    setSenderData: (state, action: PayloadAction<User|null>) => {
        state.senderData = action.payload
    }  ,
    setChatState: (state, action: PayloadAction<boolean>) =>{
        state.isOpen = action.payload
    },
    setChatLoading: (state, action: PayloadAction<boolean>) => {
      state.chatLoading = action.payload
    },
    setChatId: (state, action: PayloadAction<string|null>) =>{
        state.chatId = action.payload
    },
    setChatPage: (state, action: PayloadAction<number>) => {
        state.pageNumber = action.payload
    },
    setChatSound: (state, action: PayloadAction<boolean>) => {
        state.sound = action.payload
    },
    setUserStatus: (state, action: PayloadAction<'online'|'offline'>) => {
        state.userStatus = action.payload
    },
    setUserLastAccess: (state, action: PayloadAction<string|''>) => {
        state.lastAccess = action.payload
    },
  },
});



export const { setMessages, setSenderData, setChatState, setChatId, setChatLoading, setChatPage, setChatSound, setUserStatus, setUserLastAccess, } = chatSlice.actions;
export default chatSlice.reducer;