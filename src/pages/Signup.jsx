import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import anime from "animejs";
import { useAuth } from "../context/use-auth";
import { MessageCircle } from "lucide-react";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  useEffect(() => {
    anime({ targets: cardRef.current, opacity: [0, 1], translateY: [24, 0], easing: "easeOutExpo", duration: 700 });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(username.trim(), password);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper-50 dark:bg-ink-950 px-4">
      <div ref={cardRef} className="w-full max-w-sm bg-white dark:bg-ink-900 rounded-2xl shadow-bubble p-8 border border-ink-100 dark:border-ink-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-signal flex items-center justify-center"><MessageCircle className="w-5 h-5 text-white" /></div>
          <span className="font-display font-semibold text-lg">GroupChat</span>
        </div>
        <h1 className="font-display text-2xl font-semibold mb-1">Create an account</h1>
        <p className="text-sm text-ink-600 dark:text-paper-100/60 mb-6">Pick a username and password to get started.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-ink-600 dark:text-paper-100/50">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full rounded-lg border border-ink-100 dark:border-ink-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal" placeholder="3-20 characters" required minLength={3} maxLength={20} autoComplete="username" />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-ink-600 dark:text-paper-100/50">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-ink-100 dark:border-ink-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-signal" placeholder="At least 8 characters" required minLength={8} maxLength={72} autoComplete="new-password" />
          </div>
          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-ink-950 dark:bg-signal text-white py-2.5 font-medium hover:opacity-90 transition disabled:opacity-50">{loading ? "Creating account…" : "Create account"}</button>
        </form>
        <p className="text-sm text-center mt-6 text-ink-600 dark:text-paper-100/60">Already have an account? <Link to="/login" className="text-signal font-medium">Sign in</Link></p>
      </div>
    </div>
  );
}
