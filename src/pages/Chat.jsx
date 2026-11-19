import { useCallback, useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { api } from "../utils/api";
import { useAuth } from "../context/use-auth";

export default function Chat() {
  const { user } = useAuth();
  const [groupRooms, setGroupRooms] = useState([]);
  const [dmRooms, setDmRooms] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [roomsResponse, usersResponse] = await Promise.all([
        api.get("/rooms"),
        api.get("/auth/users"),
      ]);
      setGroupRooms(roomsResponse.data.groupRooms || []);
      setDmRooms(roomsResponse.data.dmRooms || []);
      setAllUsers(usersResponse.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load chats. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleStartDm = async (otherUser) => {
    try {
      setError("");
      const { data } = await api.post(`/rooms/dm/${otherUser._id}`);
      setDmRooms((prev) => prev.some((room) => room._id === data.room._id) ? prev : [data.room, ...prev]);
      setActiveRoom(data.room);
    } catch (err) {
      setError(err.response?.data?.message || "Could not open this conversation.");
    }
  };

  const handleRoomCreated = (room) => {
    setGroupRooms((prev) => [room, ...prev.filter((item) => item._id !== room._id)]);
    setActiveRoom(room);
  };

  const handleSelectRoom = async (room) => {
    try {
      setError("");
      if (room.type === "group") {
        const { data } = await api.post(`/rooms/${room._id}/join`);
        setActiveRoom(data.room);
      } else {
        setActiveRoom(room);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not open this room.");
    }
  };

  if (!user) return null;

  return (
    <div className="h-screen flex bg-paper-50 dark:bg-ink-950">
      <Sidebar groupRooms={groupRooms} dmRooms={dmRooms} allUsers={allUsers} activeRoom={activeRoom} onSelectRoom={handleSelectRoom} onRoomCreated={handleRoomCreated} onStartDm={handleStartDm} />
      <main className="flex-1 min-w-0 flex flex-col">
        {error && <div role="alert" className="px-4 py-2 text-sm text-red-600 bg-red-50">{error} <button className="underline ml-2" onClick={loadData}>Retry</button></div>}
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-ink-500">Loading your chats…</div>
        ) : activeRoom ? (
          <ChatWindow key={activeRoom._id} room={activeRoom} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-ink-400 gap-2">
            <MessageCircle className="w-10 h-10" />
            <p className="text-sm">Pick a room or a person to start chatting</p>
          </div>
        )}
      </main>
    </div>
  );
}
