import { useEffect, useRef, useState } from "react";
import anime from "animejs";
import { SmilePlus, Pencil, Trash2, Check, X } from "lucide-react";
import Avatar from "./Avatar";
import { useAuth } from "../context/use-auth";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "🙏"];

export default function MessageBubble({ message, onReact, onEdit, onDelete }) {
  const { user } = useAuth();
  const isOwn = message.sender?._id === user.id;
  const [showPicker, setShowPicker] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.text);
  const rootRef = useRef(null);

  useEffect(() => {
    anime({
      targets: rootRef.current,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 350,
      easing: "easeOutQuad",
    });
  }, []);

  const grouped = {};
  (message.reactions || []).forEach((r) => {
    grouped[r.emoji] = (grouped[r.emoji] || 0) + 1;
  });

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const submitEdit = () => {
    if (draft.trim() && draft !== message.text) onEdit(message._id, draft.trim());
    setEditing(false);
  };

  return (
    <div ref={rootRef} className={`flex gap-2 px-4 py-1 group ${isOwn ? "flex-row-reverse" : ""}`}>
      {!isOwn && (
        <Avatar username={message.sender?.username} color={message.sender?.avatarColor} size={30} />
      )}
      <div className={`max-w-[65%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {!isOwn && (
          <span className="text-xs font-medium text-ink-500 px-1 mb-0.5">
            {message.sender?.username}
          </span>
        )}

        <div className="relative">
          {editing ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitEdit()}
                className="rounded-xl px-3 py-2 text-sm bg-white dark:bg-ink-800 border border-signal focus:outline-none"
              />
              <button onClick={submitEdit} className="text-emerald-500">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setEditing(false)} className="text-ink-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className={`rounded-2xl px-3.5 py-2 text-sm shadow-bubble ${
                message.deleted
                  ? "italic text-ink-400 bg-ink-100 dark:bg-ink-800"
                  : isOwn
                  ? "bg-signal text-white rounded-tr-sm"
                  : "bg-ink-50 dark:bg-ink-800 rounded-tl-sm"
              }`}
            >
              {message.text}
              {message.edited && !message.deleted && (
                <span className="text-[10px] opacity-60 ml-1">(edited)</span>
              )}
            </div>
          )}

          {/* hover actions */}
          {!message.deleted && !editing && (
            <div
              className={`absolute top-0 ${
                isOwn ? "-left-24" : "-right-24"
              } flex items-center gap-1 opacity-0 group-hover:opacity-100 transition`}
            >
              <button
                onClick={() => setShowPicker((p) => !p)}
                className="w-7 h-7 rounded-full bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 flex items-center justify-center hover:bg-ink-50"
              >
                <SmilePlus className="w-3.5 h-3.5" />
              </button>
              {isOwn && (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="w-7 h-7 rounded-full bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 flex items-center justify-center hover:bg-ink-50"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(message._id)}
                    className="w-7 h-7 rounded-full bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 flex items-center justify-center hover:bg-red-50 text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          )}

          {showPicker && (
            <div className="absolute z-10 top-8 flex gap-1 bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-full px-2 py-1 shadow-bubble">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(message._id, emoji);
                    setShowPicker(false);
                  }}
                  className="hover:scale-125 transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {Object.keys(grouped).length > 0 && (
          <div className="flex gap-1 mt-1 px-1">
            {Object.entries(grouped).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => onReact(message._id, emoji)}
                className="text-xs bg-ink-50 dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-full px-1.5 py-0.5 hover:border-signal"
              >
                {emoji} {count}
              </button>
            ))}
          </div>
        )}

        <span className="text-[10px] text-ink-400 px-1 mt-0.5">{time}</span>
      </div>
    </div>
  );
}
