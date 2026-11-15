export default function Avatar({ username, color = "#F5A15D", isOnline, size = 36 }) {
  const initial = username?.[0]?.toUpperCase() || "?";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full flex items-center justify-center text-white font-medium"
        style={{ backgroundColor: color, fontSize: size * 0.4 }}
      >
        {initial}
      </div>
      {typeof isOnline === "boolean" && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-ink-900 ${
            isOnline ? "bg-emerald-400" : "bg-ink-300 dark:bg-ink-600"
          }`}
        />
      )}
    </div>
  );
}
