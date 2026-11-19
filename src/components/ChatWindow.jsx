import { useEffect, useRef, useState, useCallback } from "react";
import { Hash, Send } from "lucide-react";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { api } from "../utils/api";
import { useAuth } from "../context/use-auth";
import { useSocket } from "../context/use-socket";
import { mergeMessages } from "../utils/chatState";

export default function ChatWindow({ room }) {
  const { user } = useAuth();
  const { socket, onlineMap } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sendError, setSendError] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const otherMember = room.type === "dm" ? room.members.find((m) => m._id !== user.id) : null;

  useEffect(() => {
    let active = true;
    setHistoryLoading(true);
    api.get(`/rooms/${room._id}/messages`)
      .then(({ data }) => { if (active) setMessages((live) => mergeMessages(data.messages || [], live)); })
      .catch((err) => { if (active) setSendError(err.response?.data?.message || "Could not load message history."); })
      .finally(() => { if (active) setHistoryLoading(false); });

    const joinRoom = () => socket?.emit("room:join", room._id);
    if (socket?.connected) joinRoom();
    else socket?.once("connect", joinRoom);

    return () => {
      active = false;
      clearTimeout(typingTimeout.current);
      socket?.off("connect", joinRoom);
      socket?.emit("typing:stop", { roomId: room._id });
      socket?.emit("room:leave", room._id);
    };
  }, [room._id, socket]);

  useEffect(() => {
    if (!socket) return undefined;
    const onNew = (msg) => {
      const messageRoom = typeof msg.room === "string" ? msg.room : msg.room?._id;
      if (messageRoom !== room._id) return;
      setMessages((prev) => mergeMessages(prev, [msg]));
      if (msg.sender?._id !== user.id && document.hidden && typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification(msg.sender?.username || "New message", { body: msg.text });
      }
    };
    const onReaction = ({ messageId, reactions }) => setMessages((prev) => prev.map((m) => m._id === messageId ? { ...m, reactions } : m));
    const onEdited = ({ messageId, text: updatedText }) => setMessages((prev) => prev.map((m) => m._id === messageId ? { ...m, text: updatedText, edited: true } : m));
    const onDeleted = ({ messageId }) => setMessages((prev) => prev.map((m) => m._id === messageId ? { ...m, deleted: true, text: "This message was deleted" } : m));
    const onTyping = ({ roomId, userId, username, isTyping }) => {
      if (roomId !== room._id || userId === user.id) return;
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (isTyping) next[userId] = username;
        else delete next[userId];
        return next;
      });
    };

    socket.on("message:new", onNew);
    socket.on("message:reaction-updated", onReaction);
    socket.on("message:edited", onEdited);
    socket.on("message:deleted", onDeleted);
    socket.on("typing:update", onTyping);
    return () => {
      socket.off("message:new", onNew);
      socket.off("message:reaction-updated", onReaction);
      socket.off("message:edited", onEdited);
      socket.off("message:deleted", onDeleted);
      socket.off("typing:update", onTyping);
    };
  }, [socket, room._id, user.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typingUsers]);

  const handleTyping = useCallback((value) => {
    setText(value);
    if (!socket) return;
    socket.emit("typing:start", { roomId: room._id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket.emit("typing:stop", { roomId: room._id }), 1200);
  }, [socket, room._id]);

  const sendMessage = (event) => {
    event.preventDefault();
    const messageText = text.trim();
    if (!messageText || !socket || sending) return;
    setSending(true);
    setSendError("");
    socket.timeout(8000).emit("message:send", { roomId: room._id, text: messageText }, (timeoutError, response) => {
      setSending(false);
      if (timeoutError || !response?.ok) {
        setSendError(response?.error || "Message could not be sent. Your text is still here; please retry.");
        return;
      }
      setText((current) => current === messageText ? "" : current);
      socket.emit("typing:stop", { roomId: room._id });
    });
  };

  const handleReact = (messageId, emoji) => socket?.emit("message:react", { messageId, emoji });
  const handleEdit = (messageId, newText) => socket?.emit("message:edit", { messageId, text: newText });
  const handleDelete = (messageId) => socket?.emit("message:delete", { messageId });

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="h-16 px-5 flex items-center gap-2.5 border-b border-ink-100 dark:border-ink-700 shrink-0">
        {room.type === "dm" ? <>
          <Avatar username={otherMember?.username} color={otherMember?.avatarColor} isOnline={onlineMap[otherMember?._id] ?? otherMember?.isOnline} size={30} />
          <div><p className="font-medium text-sm">{otherMember?.username}</p><p className="text-xs text-ink-500">{onlineMap[otherMember?._id] ?? otherMember?.isOnline ? "Online" : "Offline"}</p></div>
        </> : <>
          <div className="w-8 h-8 rounded-lg bg-wire/15 flex items-center justify-center"><Hash className="w-4 h-4 text-wire" /></div>
          <p className="font-medium text-sm">{room.name}</p>
        </>}
      </div>
      <div className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        {historyLoading && <p className="text-center text-xs text-ink-400 py-3">Loading messages…</p>}
        {messages.map((message) => <MessageBubble key={message._id} message={message} onReact={handleReact} onEdit={handleEdit} onDelete={handleDelete} />)}
        <TypingIndicator names={Object.values(typingUsers)} />
        <div ref={bottomRef} />
      </div>
      {sendError && <p role="alert" className="px-4 py-2 text-xs text-red-600">{sendError}</p>}
      <form onSubmit={sendMessage} className="p-3 border-t border-ink-100 dark:border-ink-700 flex gap-2">
        <input value={text} onChange={(e) => handleTyping(e.target.value)} placeholder={`Message ${room.type === "dm" ? otherMember?.username : "#" + room.name}`} maxLength={2000} className="flex-1 rounded-full px-4 py-2.5 text-sm bg-ink-50 dark:bg-ink-800 border border-transparent focus:border-signal focus:outline-none" />
        <button type="submit" disabled={sending || !text.trim() || !socket?.connected} className="w-10 h-10 rounded-full bg-signal text-white flex items-center justify-center hover:opacity-90 transition shrink-0 disabled:opacity-50" aria-label="Send message"><Send className="w-4 h-4" /></button>
      </form>
    </div>
  );
}
