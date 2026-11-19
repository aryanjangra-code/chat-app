import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../utils/api";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineMap, setOnlineMap] = useState({});

  useEffect(() => {
    if (!user) {
      setSocket(null);
      setConnected(false);
      return undefined;
    }

    const connection = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    setSocket(connection);
    connection.on("connect", () => setConnected(true));
    connection.on("disconnect", () => setConnected(false));
    connection.on("connect_error", (error) => {
      console.error("Socket connection failed:", error.message);
      setConnected(false);
    });
    connection.on("presence:update", ({ userId, isOnline }) => {
      if (userId) setOnlineMap((prev) => ({ ...prev, [userId]: isOnline }));
    });

    return () => {
      connection.removeAllListeners();
      connection.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, connected, onlineMap }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
