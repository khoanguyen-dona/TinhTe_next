import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatType, NotificationType } from "@/dataTypes";

type InitialState = {
    currentNotifications: NotificationType[],
    notificationCount : number,
    hasNext: boolean,
}

const initialState: InitialState = {
    currentNotifications: [],
    notificationCount: 0,
    hasNext: false

}

const notificationSlice = createSlice({
  name: "notification",
  initialState ,
  reducers: {
    // use this when refresh the page
    setNotifications: (state, action: PayloadAction<NotificationType[]>) => {
        state.currentNotifications = action.payload
    },

    // use this when user click on a notification to update isReceiverSeen = true
    updateNotifications: (state, action: PayloadAction<{ notifyId: string; newData: Partial<NotificationType> }>) => {
      if(state.currentNotifications.length>0){

        state.currentNotifications  = state?.currentNotifications?.map(notification =>
            notification._id === action.payload.notifyId ? {...notification,...action.payload.newData} : notification
        )
      }
    },
    
    setNotificationCount: (state, action: PayloadAction<number>) => {
      state.notificationCount = action.payload
    },

    // use this when take it from socke.io
    addToNotifications: (state, action: PayloadAction<NotificationType> )=>{
      // state.currentChatList.push(action.payload)
      state.currentNotifications = [action.payload,...state.currentNotifications]
    },

     // use this when click seemore button
    addNotificationAtTail: (state, action: PayloadAction<NotificationType> )=>{
      // state.currentChatList.push(action.payload)
      state.currentNotifications = [...state.currentNotifications, action.payload]
    },


    setNotificationsHasNext: (state, action: PayloadAction<boolean>)=>{
      state.hasNext = action.payload
    }

  },
});

export const { setNotifications, updateNotifications, setNotificationCount, addToNotifications, addNotificationAtTail, setNotificationsHasNext }
 = notificationSlice.actions;
export default notificationSlice.reducer;