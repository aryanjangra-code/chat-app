import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Chat() {
  const { user } = useAuth();
  const [groupRooms, setGroupRooms] = useState([]);
  const [dmRooms, setDmRooms] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);

  const loadRooms = async () => {
    const { data } = await api.get("/rooms");
    setGroupRooms(data.groupRooms);
    setDmRooms(data.dmRooms);
  };

  useEffect(() => {
    loadRooms();
    api.get("/auth/users").then(({ data }) => setAllUsers(data.users));
  }, []);

  const handleStartDm = async (otherUser) => {
    const { data } = await api.post(`/rooms/dm/${otherUser._id}`);
    setDmRooms((prev) => {
      const exists = prev.some((r) => r._id === data.room._id);
      return exists ? prev : [data.room, ...prev];
    });
    setActiveRoom(data.room);
  };

  const handleRoomCreated = (room) => {
    setGroupRooms((prev) => [room, ...prev]);
    setActiveRoom(room);
  };

  if (!user) return null;

  return (
    <div className="h-screen flex bg-paper-50 dark:bg-ink-950">
      <Sidebar
        groupRooms={groupRooms}
        dmRooms={dmRooms}
        allUsers={allUsers}
        activeRoom={activeRoom}
        onSelectRoom={setActiveRoom}
        onRoomCreated={handleRoomCreated}
        onStartDm={handleStartDm}
      />
      {activeRoom ? (
        <ChatWindow key={activeRoom._id} room={activeRoom} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-ink-400 gap-2">
          <MessageCircle className="w-10 h-10" />
          <p className="text-sm">Pick a room or a person to start chatting</p>
        </div>
      )}
    </div>
  );
}
