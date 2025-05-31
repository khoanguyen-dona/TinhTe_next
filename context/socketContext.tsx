// // socketContext.tsx
// import { RootState } from "@/redux/store";
// import { createContext, useContext, useEffect, useRef, useState } from "react";
// import { useSelector } from "react-redux";
// import { io, Socket } from "socket.io-client";


// const SocketContext = createContext<Socket | null>(null);
// type Props = {
//     children: React.ReactNode
// }

// export const SocketProvider = ({ children }:Props) => {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const user = useSelector((state:RootState)=>state.user.currentUser)

//   useEffect(() => {
//     const socketIo = io('http://localhost:8888', {
//       transports: ['websocket'],
//     });

//     setSocket(socketIo);
//     socketIo.emit('addUser', user?._id)

//     return () => {
//       socketIo.disconnect();
//     };
//   }, []);

//   return (
//     <SocketContext.Provider value={socket}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocket = () => useContext(SocketContext);
