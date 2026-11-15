import { useState, useEffect, useRef } from "react";
import anime from "animejs";
import { X } from "lucide-react";
import { api } from "../utils/api";

export default function NewRoomModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const boxRef = useRef(null);

  useEffect(() => {
    anime({
      targets: boxRef.current,
      opacity: [0, 1],
      scale: [0.94, 1],
      duration: 250,
      easing: "easeOutQuad",
    });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const { data } = await api.post("/rooms/group", { name });
      onCreated(data.room);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create room");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div
        ref={boxRef}
        className="bg-white dark:bg-ink-900 rounded-2xl shadow-bubble p-6 w-full max-w-sm border border-ink-100 dark:border-ink-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">New room</h2>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Room name, e.g. design-team"
            className="w-full rounded-lg border border-ink-100 dark:border-ink-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-ink-950 dark:bg-signal text-white py-2.5 font-medium hover:opacity-90 transition"
          >
            Create room
          </button>
        </form>
      </div>
    </div>
  );
}
