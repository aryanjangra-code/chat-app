import { useState } from "react";
import { Hash, Plus, LogOut, Users } from "lucide-react";
import Avatar from "./Avatar";
import ThemeToggle from "./ThemeToggle";
import NewRoomModal from "./NewRoomModal";
import { useAuth } from "../context/use-auth";
import { useSocket } from "../context/use-socket";

export default function Sidebar({ groupRooms, dmRooms, allUsers, activeRoom, onSelectRoom, onRoomCreated, onStartDm }) {
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState("rooms");
  const { user, logout } = useAuth();
  const { onlineMap, connected } = useSocket();

  return (
    <aside className="w-72 shrink-0 border-r border-ink-100 dark:border-ink-700 flex flex-col bg-white dark:bg-ink-900">
      <div className="p-4 flex items-center justify-between border-b border-ink-100 dark:border-ink-700">
        <div className="flex items-center gap-2">
          <Avatar username={user?.username} color={user?.avatarColor} size={32} />
          <div><p className="font-medium text-sm leading-tight">{user?.username}</p><p className="text-xs text-ink-500">{connected ? "online" : "connecting…"}</p></div>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button onClick={() => logout()} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-600 dark:text-paper-100/70 hover:bg-ink-100 dark:hover:bg-ink-800 transition" aria-label="Log out"><LogOut className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex text-sm font-medium border-b border-ink-100 dark:border-ink-700">
        <button onClick={() => setTab("rooms")} className={`flex-1 py-2.5 ${tab === "rooms" ? "text-signal border-b-2 border-signal" : "text-ink-500"}`}>Rooms</button>
        <button onClick={() => setTab("people")} className={`flex-1 py-2.5 ${tab === "people" ? "text-signal border-b-2 border-signal" : "text-ink-500"}`}>People</button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {tab === "rooms" && <div className="p-2">
          <div className="flex items-center justify-between px-2 pt-2 pb-1"><span className="text-xs font-semibold uppercase tracking-wide text-ink-400">Group rooms</span><button onClick={() => setShowModal(true)} className="text-ink-500 hover:text-signal" aria-label="Create room"><Plus className="w-4 h-4" /></button></div>
          {groupRooms.length === 0 && <p className="px-2 py-2 text-xs text-ink-400">No group rooms yet.</p>}
          {groupRooms.map((room) => <button key={room._id} onClick={() => onSelectRoom(room)} className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition ${activeRoom?._id === room._id ? "bg-signal/10 text-signal" : "hover:bg-ink-50 dark:hover:bg-ink-800"}`}><Hash className="w-4 h-4 shrink-0" /><span className="truncate">{room.name}</span></button>)}
          <div className="px-2 pt-4 pb-1"><span className="text-xs font-semibold uppercase tracking-wide text-ink-400">Direct messages</span></div>
          {dmRooms.map((room) => {
            const other = room.members.find((member) => member._id !== user.id);
            return <button key={room._id} onClick={() => onSelectRoom(room)} className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition ${activeRoom?._id === room._id ? "bg-signal/10 text-signal" : "hover:bg-ink-50 dark:hover:bg-ink-800"}`}><Avatar username={other?.username} color={other?.avatarColor} isOnline={onlineMap[other?._id] ?? other?.isOnline} size={22} /><span className="truncate">{other?.username}</span></button>;
          })}
        </div>}
        {tab === "people" && <div className="p-2">
          <div className="flex items-center gap-1 px-2 pt-2 pb-1"><Users className="w-3.5 h-3.5 text-ink-400" /><span className="text-xs font-semibold uppercase tracking-wide text-ink-400">Everyone</span></div>
          {allUsers.length === 0 && <p className="px-2 py-2 text-xs text-ink-400">No other users yet.</p>}
          {allUsers.map((person) => <button key={person._id} onClick={() => onStartDm(person)} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm hover:bg-ink-50 dark:hover:bg-ink-800 transition"><Avatar username={person.username} color={person.avatarColor} isOnline={onlineMap[person._id] ?? person.isOnline} size={26} /><span className="truncate">{person.username}</span></button>)}
        </div>}
      </div>
      {showModal && <NewRoomModal onClose={() => setShowModal(false)} onCreated={onRoomCreated} />}
    </aside>
  );
}
