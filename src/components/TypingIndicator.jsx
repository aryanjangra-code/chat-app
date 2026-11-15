import { useEffect, useRef } from "react";
import anime from "animejs";

export default function TypingIndicator({ names }) {
  const dotsRef = useRef([]);

  useEffect(() => {
    const anim = anime({
      targets: dotsRef.current,
      translateY: [0, -4, 0],
      delay: anime.stagger(120),
      loop: true,
      easing: "easeInOutSine",
      duration: 600,
    });
    return () => anim.pause();
  }, []);

  if (!names.length) return null;

  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : `${names.slice(0, 2).join(", ")}${names.length > 2 ? " and others" : ""} are typing`;

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-ink-500">
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            ref={(el) => (dotsRef.current[i] = el)}
            className="w-1.5 h-1.5 rounded-full bg-ink-400 inline-block"
          />
        ))}
      </div>
      <span>{label}</span>
    </div>
  );
}
