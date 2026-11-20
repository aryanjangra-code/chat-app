
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import { SOCKET_URL, getAccessToken, refreshAccessToken } from "../utils/api";
import { useAuth } from "./use-auth";
import { SocketContext } from "./socket-context";

export const SocketProvider = ({ children }) => {
  const { user, logout } = useAuth();

  const userId = user?.id;

  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineMap, setOnlineMap] = useState({});

  useEffect(() => {
    if (!userId) {
      setSocket(null);
      setConnected(false);
      return undefined;
    }

    const connection = io(SOCKET_URL, {
      auth: (callback) => {
        callback({
          token: getAccessToken(),
        });
      },
      withCredentials: false,
      transports: ["websocket", "polling"],
    });

    setSocket(connection);

    connection.on("connect", () => {
      setConnected(true);
    });

    connection.on("disconnect", async (reason) => {
      setConnected(false);

      // The server disconnects the socket when its access token expires.
      if (reason === "io server disconnect") {
        try {
          await refreshAccessToken();
          connection.connect();
        } catch {
          await logout();
        }
      }
    });

    connection.on("connect_error", (error) => {
      console.error(
        "Socket connection failed:",
        error.message
      );

      setConnected(false);
    });

    connection.on("presence:update", ({ userId, isOnline }) => {
      if (userId) {
        setOnlineMap((prev) => ({
          ...prev,
          [userId]: isOnline,
        }));
      }
    });

    return () => {
      connection.removeAllListeners();
      connection.disconnect();

      setSocket(null);
      setConnected(false);
    };
  }, [userId, logout]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        onlineMap,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
