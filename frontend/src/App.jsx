import { useState, useEffect, useRef } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("access_token");
  return fetch(`${API}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
}

// ─── AURA SYSTEM ─────────────────────────────────────────────────────────────
const AURA_TITLES = [
  { min: 0,    label: "Void Lurker",    color: "#555577" },
  { min: 100,  label: "Glitch Ghost",   color: "#7c6aff" },
  { min: 300,  label: "Neon Phantom",   color: "#bc6aff" },
  { min: 600,  label: "Static Entity",  color: "#00f5ff" },
  { min: 1000, label: "Void Walker",    color: "#ff006e" },
  { min: 2000, label: "Glitch Lord",    color: "#ff6a00" },
  { min: 5000, label: "Nexus God",      color: "#ffd700" },
];
function getAuraTitle(aura = 0) {
  for (let i = AURA_TITLES.length - 1; i >= 0; i--) {
    if (aura >= AURA_TITLES[i].min) return AURA_TITLES[i];
  }
  return AURA_TITLES[0];
}

// ─── MOCK FEED DATA ───────────────────────────────────────────────────────────
const MOCK_POSTS = [
  { id: 1, type: "thought", content: "3am and I can't stop. this place knows me too well.", aura: 847, reactions: { "🔥": 142, "💀": 89, "👁": 234 }, author: { username: "neon_ghost", aura: 2341 }, created_at: new Date(Date.now() - 3600000).toISOString(), anonymous: false },
  { id: 2, type: "confession", content: "I deleted all my other social media. This void is the only thing that feels real anymore.", aura: 1203, reactions: { "💀": 445, "🔥": 201, "👁": 567 }, author: { username: "???", aura: 0 }, created_at: new Date(Date.now() - 7200000).toISOString(), anonymous: true },
  { id: 3, type: "hot_take", content: "We're all just NPCs in someone else's simulation and Nexus is the only place where NPCs are self-aware.", aura: 2891, reactions: { "🔥": 891, "💀": 123, "👁": 1204 }, author: { username: "glitch_lord_x", aura: 5102 }, created_at: new Date(Date.now() - 10800000).toISOString(), anonymous: false },
  { id: 4, type: "poll", content: "What time is it where you are right now?", options: ["Deep night (12am-4am)", "Late night (4am-8am)", "Day shift pretending", "Time is fake"], votes: [445, 234, 891, 1203], aura: 3421, reactions: { "👁": 2341 }, author: { username: "void_architect", aura: 1899 }, created_at: new Date(Date.now() - 14400000).toISOString(), anonymous: false },
  { id: 5, type: "thought", content: "scrolling at 4am is a form of meditation nobody talks about", aura: 621, reactions: { "🔥": 321, "💀": 45, "👁": 892 }, author: { username: "static_entity", aura: 611 }, created_at: new Date(Date.now() - 18000000).toISOString(), anonymous: false },
  { id: 6, type: "confession", content: "I said something here last week anonymously and it got 2000 reactions. I've never felt so seen in my life.", aura: 4102, reactions: { "💀": 1203, "🔥": 892, "👁": 2341 }, author: { username: "???", aura: 0 }, created_at: new Date(Date.now() - 21600000).toISOString(), anonymous: true },
  { id: 7, type: "hot_take", content: "The internet peaked in 2007. Everything since has been a slow-motion collapse dressed up as progress.", aura: 1823, reactions: { "🔥": 723, "💀": 234, "👁": 1102 }, author: { username: "phantom_wave", aura: 3421 }, created_at: new Date(Date.now() - 25200000).toISOString(), anonymous: false },
  { id: 8, type: "thought", content: "the void doesn't judge. the void just receives.", aura: 5621, reactions: { "👁": 4102, "💀": 891, "🔥": 1203 }, author: { username: "nexus_god_01", aura: 9234 }, created_at: new Date(Date.now() - 28800000).toISOString(), anonymous: false },
];

const POST_TYPES = {
  thought:    { label: "THOUGHT",    color: "#7c6aff", glow: "rgba(124,106,255,0.4)" },
  confession: { label: "CONFESSION", color: "#ff006e", glow: "rgba(255,0,110,0.4)" },
  hot_take:   { label: "HOT TAKE",   color: "#ff6a00", glow: "rgba(255,106,0,0.4)" },
  poll:       { label: "POLL",       color: "#00f5ff", glow: "rgba(0,245,255,0.4)" },
};

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;700;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --void: #050508; --void2: #0a0a12; --void3: #0f0f1a;
    --card: #0d0d18; --card-hover: #131325;
    --border: #1a1a2e; --border-bright: #2a2a4e;
    --np: #7c6aff; --npk: #ff006e; --nc: #00f5ff; --no: #ff6a00; --ng: #00ff88;
    --text: #e0e0ff; --text-dim: #6666aa; --text-bright: #ffffff;
    --mono: 'Share Tech Mono', monospace;
    --display: 'Orbitron', sans-serif;
    --body: 'Rajdhani', sans-serif;
  }
  html { scroll-behavior: smooth; }
  body { font-family: var(--body); background: var(--void); color: var(--text); min-height: 100vh; overflow-x: hidden; cursor: crosshair; }
  body::before { content: ''; position: fixed; inset: 0; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px); pointer-events: none; z-index: 9999; }
  input, textarea, select { font-family: var(--mono); background: var(--void3); border: 1px solid var(--border-bright); border-radius: 4px; color: var(--text); padding: 10px 14px; font-size: 13px; outline: none; width: 100%; transition: all 0.2s; }
  input:focus, textarea:focus { border-color: var(--np); box-shadow: 0 0 20px rgba(124,106,255,0.3), inset 0 0 10px rgba(124,106,255,0.05); }
  button { cursor: crosshair; font-family: var(--body); border: none; outline: none; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--void); }
  ::-webkit-scrollbar-thumb { background: var(--np); border-radius: 2px; box-shadow: 0 0 6px var(--np); }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
  @keyframes glitch1 { 0%,100% { clip-path: inset(0 0 100% 0); transform: none; } 20% { clip-path: inset(10% 0 60% 0); transform: translate(-3px,0); } 40% { clip-path: inset(50% 0 20% 0); transform: translate(3px,0); } 60% { clip-path: inset(20% 0 50% 0); transform: translate(-2px,0); } 80% { clip-path: inset(80% 0 5% 0); transform: translate(2px,0); } }
  @keyframes glitch2 { 0%,100% { clip-path: inset(0 0 100% 0); transform: none; } 20% { clip-path: inset(60% 0 10% 0); transform: translate(3px,0); } 40% { clip-path: inset(20% 0 50% 0); transform: translate(-3px,0); } 60% { clip-path: inset(50% 0 20% 0); transform: translate(2px,0); } 80% { clip-path: inset(5% 0 80% 0); transform: translate(-2px,0); } }
  @keyframes flicker { 0%,100% { opacity:1; } 92% { opacity:1; } 93% { opacity:0.3; } 94% { opacity:1; } 96% { opacity:0.6; } 97% { opacity:1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse-glow { 0%,100% { opacity:0.8; } 50% { opacity:1; filter: brightness(1.3); } }
  @keyframes particle { 0% { transform: translateY(100vh) translateX(0); opacity:0; } 10% { opacity:1; } 90% { opacity:1; } 100% { transform: translateY(-100px) translateX(var(--dx)); opacity:0; } }
  @keyframes neon-border { 0%,100% { border-color: var(--np); box-shadow: 0 0 15px rgba(124,106,255,0.2); } 33% { border-color: var(--npk); box-shadow: 0 0 15px rgba(255,0,110,0.2); } 66% { border-color: var(--nc); box-shadow: 0 0 15px rgba(0,245,255,0.2); } }
  @keyframes streak { 0% { width:0; opacity:0; } 50% { opacity:1; } 100% { width:100%; opacity:0; } }
  @keyframes boot-bar { from { width:0; } to { width:100%; } }
`;

// ─── PARTICLES ────────────────────────────────────────────────────────────────
function Particles() {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    color: ["var(--np)","var(--npk)","var(--nc)","var(--ng)"][i % 4],
    dur: `${Math.random() * 15 + 8}s`,
    delay: `${Math.random() * 10}s`,
    dx: `${(Math.random() - 0.5) * 150}px`,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {particles.map(p => (
        <div key={p.id} style={{ position: "absolute", left: p.left, bottom: "-10px", width: p.size, height: p.size, borderRadius: "50%", background: p.color, boxShadow: `0 0 6px ${p.color}`, "--dx": p.dx, animation: `particle ${p.dur} ${p.delay} linear infinite` }} />
      ))}
    </div>
  );
}

// ─── GLITCH TEXT ──────────────────────────────────────────────────────────────
function GlitchText({ children, color = "inherit", style = {} }) {
  return (
    <span style={{ position: "relative", display: "inline-block", color, ...style }}>
      {children}
      <span aria-hidden style={{ position: "absolute", inset: 0, color: "var(--npk)", animation: "glitch1 4s 1s infinite", opacity: 0.7 }}>{children}</span>
      <span aria-hidden style={{ position: "absolute", inset: 0, color: "var(--nc)", animation: "glitch2 4s 1.5s infinite", opacity: 0.5 }}>{children}</span>
    </span>
  );
}

// ─── AURA BADGE ───────────────────────────────────────────────────────────────
function AuraBadge({ aura = 0, size = "sm" }) {
  const t = getAuraTitle(aura);
  return (
    <span style={{ fontFamily: "var(--mono)", fontSize: size === "lg" ? "11px" : "9px", padding: size === "lg" ? "4px 10px" : "2px 7px", borderRadius: "2px", border: `1px solid ${t.color}`, color: t.color, background: `${t.color}18`, letterSpacing: "0.05em", textShadow: `0 0 8px ${t.color}`, whiteSpace: "nowrap" }}>
      ◈ {t.label}
    </span>
  );
}

// ─── REACTION BAR ─────────────────────────────────────────────────────────────
function ReactionBar({ reactions = {} }) {
  const [local, setLocal] = useState({ ...reactions });
  const [done, setDone] = useState({});
  const react = (e) => {
    if (done[e]) return;
    setLocal(r => ({ ...r, [e]: (r[e] || 0) + 1 }));
    setDone(d => ({ ...d, [e]: true }));
  };
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
      {Object.entries(local).map(([emoji, count]) => (
        <button key={emoji} onClick={() => react(emoji)} style={{ display: "flex", alignItems: "center", gap: "5px", background: done[emoji] ? "rgba(124,106,255,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${done[emoji] ? "var(--np)" : "var(--border-bright)"}`, borderRadius: "2px", padding: "4px 10px", color: done[emoji] ? "var(--np)" : "var(--text-dim)", fontSize: "12px", cursor: "crosshair", transition: "all 0.15s", fontFamily: "var(--mono)" }}>
          <span style={{ fontSize: "14px" }}>{emoji}</span>
          <span>{count.toLocaleString()}</span>
        </button>
      ))}
    </div>
  );
}

// ─── VOID CARD ────────────────────────────────────────────────────────────────
function VoidCard({ post, index }) {
  const [vis, setVis] = useState(false);
  const ref = useRef();
  const cfg = POST_TYPES[post.type] || POST_TYPES.thought;

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.05 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const ago = (iso) => {
    const s = (Date.now() - new Date(iso)) / 1000;
    if (s < 60) return `${~~s}s`;
    if (s < 3600) return `${~~(s/60)}m`;
    if (s < 86400) return `${~~(s/3600)}h`;
    return `${~~(s/86400)}d`;
  };

  const [voted, setVoted] = useState(null);
  const [pv, setPv] = useState(post.votes ? [...post.votes] : []);
  const totalV = pv.reduce((a,b) => a+b, 0);
  const vote = (i) => { if (voted !== null) return; const n = [...pv]; n[i]++; setPv(n); setVoted(i); };

  const [hov, setHov] = useState(false);

  return (
    <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(24px)", transition: `all 0.5s ease ${index * 0.04}s`, background: hov ? "var(--card-hover)" : "var(--card)", border: `1px solid ${hov ? cfg.color : "var(--border)"}`, borderLeft: `3px solid ${cfg.color}`, borderRadius: "4px", padding: "24px", position: "relative", overflow: "hidden", boxShadow: hov ? `0 0 30px ${cfg.glow}` : "none" }}>
      {/* Top scan */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`, opacity: hov ? 0.8 : 0.3, transition: "opacity 0.2s" }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.15em", color: cfg.color, border: `1px solid ${cfg.color}`, padding: "2px 8px", background: `${cfg.color}18`, textShadow: `0 0 8px ${cfg.color}` }}>{cfg.label}</span>
          {post.anonymous
            ? <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-dim)" }}>ANON://???</span>
            : <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-dim)" }}>@{post.author?.username}</span>
                <AuraBadge aura={post.author?.aura} />
              </div>
          }
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-dim)", whiteSpace: "nowrap", flexShrink: 0 }}>{ago(post.created_at)} ago</span>
      </div>

      {/* Body */}
      <p style={{ fontSize: "17px", fontWeight: 500, lineHeight: 1.65, color: "var(--text-bright)", marginBottom: "18px", fontFamily: "var(--body)" }}>{post.content}</p>

      {/* Poll */}
      {post.type === "poll" && post.options && (
        <div style={{ marginBottom: "18px", display: "flex", flexDirection: "column", gap: "7px" }}>
          {post.options.map((opt, i) => {
            const pct = totalV ? Math.round((pv[i] / totalV) * 100) : 0;
            return (
              <button key={i} onClick={() => vote(i)} style={{ position: "relative", background: voted === i ? `${cfg.color}20` : "rgba(255,255,255,0.03)", border: `1px solid ${voted === i ? cfg.color : "var(--border-bright)"}`, borderRadius: "3px", padding: "10px 14px", color: voted === i ? cfg.color : "var(--text)", textAlign: "left", cursor: "crosshair", overflow: "hidden", fontSize: "14px", fontFamily: "var(--body)", fontWeight: 500, transition: "all 0.2s" }}>
                {voted !== null && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: `${cfg.color}18`, transition: "width 0.6s ease" }} />}
                <span style={{ position: "relative" }}>{opt}</span>
                {voted !== null && <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontFamily: "var(--mono)", fontSize: "11px", color: cfg.color }}>{pct}%</span>}
              </button>
            );
          })}
          <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-dim)" }}>{totalV.toLocaleString()} VOICES</span>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <ReactionBar reactions={post.reactions} />
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.1em" }}>AURA</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: "14px", fontWeight: 700, color: cfg.color, textShadow: `0 0 10px ${cfg.color}` }}>+{post.aura.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// ─── COMPOSE ──────────────────────────────────────────────────────────────────
function ComposeBox({ onPost, user }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("thought");
  const [content, setContent] = useState("");
  const [anon, setAnon] = useState(false);
  const [opts, setOpts] = useState(["", ""]);
  const [posting, setPosting] = useState(false);
  const cfg = POST_TYPES[type];

  const transmit = async () => {
    if (!content.trim()) return;
    setPosting(true);
    await new Promise(r => setTimeout(r, 700));
    setPosting(false);
    if (onPost) onPost({ id: Date.now(), type, content, anonymous: anon, aura: 0, reactions: { "🔥": 0, "💀": 0, "👁": 0 }, author: anon ? { username: "???", aura: 0 } : user, created_at: new Date().toISOString(), ...(type === "poll" ? { options: opts.filter(Boolean), votes: opts.filter(Boolean).map(() => 0) } : {}) });
    setContent(""); setOpen(false); setAnon(false); setOpts(["",""]);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ width: "100%", padding: "16px 20px", background: "var(--card)", border: "1px solid var(--border-bright)", borderRadius: "4px", color: "var(--text-dim)", fontFamily: "var(--mono)", fontSize: "12px", textAlign: "left", cursor: "crosshair", letterSpacing: "0.05em", display: "flex", gap: "12px", alignItems: "center", transition: "all 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--np)"; e.currentTarget.style.color = "var(--np)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(124,106,255,0.2)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-bright)"; e.currentTarget.style.color = "var(--text-dim)"; e.currentTarget.style.boxShadow = "none"; }}>
      <span style={{ fontSize: "16px" }}>▸</span> TRANSMIT TO THE VOID...
    </button>
  );

  return (
    <div style={{ background: "var(--card)", border: `1px solid ${cfg.color}`, borderRadius: "4px", padding: "24px", boxShadow: `0 0 30px ${cfg.glow}`, animation: "fadeUp 0.25s ease" }}>
      <div style={{ display: "flex", gap: "6px", marginBottom: "18px", flexWrap: "wrap" }}>
        {Object.entries(POST_TYPES).map(([t, c]) => (
          <button key={t} onClick={() => setType(t)} style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "0.1em", padding: "5px 12px", border: `1px solid ${type === t ? c.color : "var(--border-bright)"}`, background: type === t ? `${c.color}20` : "transparent", color: type === t ? c.color : "var(--text-dim)", cursor: "crosshair", transition: "all 0.2s", textShadow: type === t ? `0 0 8px ${c.color}` : "none" }}>
            {c.label}
          </button>
        ))}
      </div>
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={{ thought: "What's in your head right now...", confession: "Confess to the void. It won't tell anyone.", hot_take: "Drop the take. No mercy.", poll: "Ask the void a question..." }[type]} rows={4} style={{ resize: "none", marginBottom: "14px", fontSize: "15px", fontFamily: "var(--body)", fontWeight: 500, lineHeight: 1.6 }} />
      {type === "poll" && (
        <div style={{ marginBottom: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {opts.map((o, i) => (
            <div key={i} style={{ display: "flex", gap: "8px" }}>
              <input value={o} onChange={e => { const n = [...opts]; n[i] = e.target.value; setOpts(n); }} placeholder={`Option ${i+1}`} style={{ flex: 1 }} />
              {opts.length > 2 && <button onClick={() => setOpts(opts.filter((_,j) => j !== i))} style={{ background: "none", color: "var(--npk)", fontSize: "18px", cursor: "crosshair", border: "none" }}>×</button>}
            </div>
          ))}
          {opts.length < 4 && <button onClick={() => setOpts([...opts, ""])} style={{ background: "none", border: "1px dashed var(--border-bright)", color: "var(--text-dim)", padding: "7px", cursor: "crosshair", fontFamily: "var(--mono)", fontSize: "10px" }}>+ ADD OPTION</button>}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "crosshair", fontFamily: "var(--mono)", fontSize: "10px", color: anon ? "var(--npk)" : "var(--text-dim)", userSelect: "none" }}>
          <input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)} style={{ width: "auto", accentColor: "var(--npk)" }} />
          TRANSMIT ANONYMOUSLY
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setOpen(false)} style={{ fontFamily: "var(--mono)", fontSize: "10px", padding: "8px 16px", background: "transparent", border: "1px solid var(--border-bright)", color: "var(--text-dim)", cursor: "crosshair" }}>ABORT</button>
          <button onClick={transmit} disabled={posting || !content.trim()} style={{ fontFamily: "var(--mono)", fontSize: "10px", padding: "8px 20px", background: `${cfg.color}20`, border: `1px solid ${cfg.color}`, color: cfg.color, cursor: "crosshair", textShadow: `0 0 8px ${cfg.color}`, opacity: !content.trim() ? 0.4 : 1 }}>
            {posting ? "TRANSMITTING..." : "▸ TRANSMIT"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function VoidSidebar({ page, setPage, user }) {
  const t = getAuraTitle(user?.aura || 0);
  const nav = [
    { id: "feed",     icon: "◈", label: "THE FEED"    },
    { id: "trending", icon: "▲", label: "TRENDING"    },
    { id: "confess",  icon: "◉", label: "CONFESSIONS" },
    { id: "messages", icon: "⟁", label: "MESSAGES"    },
    { id: "profile",  icon: "◎", label: "PROFILE"     },
    ...(user?.role === "admin" ? [{ id: "admin", icon: "⌬", label: "ADMIN" }] : []),
  ];
  return (
    <aside style={{ width: "220px", minHeight: "100vh", background: `linear-gradient(180deg, var(--void2), var(--void))`, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100 }}>
      <div style={{ padding: "28px 20px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontFamily: "var(--display)", fontWeight: 900, fontSize: "22px", letterSpacing: "0.1em", animation: "flicker 6s infinite" }}>
          <GlitchText style={{ background: "linear-gradient(135deg, var(--np), var(--npk))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NEXUS</GlitchText>
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.2em", marginTop: "4px" }}>THE VOID AWAITS</div>
      </div>

      {user && (
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: `${t.color}08` }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: "6px" }}>YOUR AURA</div>
          <div style={{ fontFamily: "var(--display)", fontSize: "22px", fontWeight: 700, color: t.color, textShadow: `0 0 15px ${t.color}`, marginBottom: "6px" }}>{(user.aura || 0).toLocaleString()}</div>
          <AuraBadge aura={user.aura || 0} size="lg" />
          <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>🔥</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--no)" }}>{user.streak || 1} DAY STREAK</span>
          </div>
        </div>
      )}

      <nav style={{ flex: 1, padding: "10px 8px" }}>
        {nav.map(item => (
          <button key={item.id} onClick={() => setPage(item.id)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "11px 12px", background: page === item.id ? "rgba(124,106,255,0.1)" : "transparent", border: "none", borderLeft: `2px solid ${page === item.id ? "var(--np)" : "transparent"}`, color: page === item.id ? "var(--np)" : "var(--text-dim)", cursor: "crosshair", fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "0.1em", textAlign: "left", transition: "all 0.15s", textShadow: page === item.id ? "0 0 10px var(--np)" : "none" }}
            onMouseEnter={e => { if (page !== item.id) { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderLeftColor = "var(--border-bright)"; }}}
            onMouseLeave={e => { if (page !== item.id) { e.currentTarget.style.color = "var(--text-dim)"; e.currentTarget.style.borderLeftColor = "transparent"; }}}>
            <span style={{ fontSize: "13px", width: "16px", textAlign: "center" }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: "12px 8px", borderTop: "1px solid var(--border)" }}>
        <button onClick={() => { localStorage.removeItem("access_token"); localStorage.removeItem("refresh_token"); window.location.reload(); }}
          style={{ width: "100%", padding: "10px 12px", background: "transparent", border: "none", color: "var(--text-dim)", fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "0.1em", textAlign: "left", cursor: "crosshair", display: "flex", gap: "10px", alignItems: "center", transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--npk)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}>
          ⏻ DISCONNECT
        </button>
      </div>
    </aside>
  );
}

// ─── FEED PAGE ────────────────────────────────────────────────────────────────
function FeedPage({ user }) {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? posts : posts.filter(p => p.type === filter);
  const addPost = (p) => setPosts(prev => [p, ...prev]);

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--ng)", letterSpacing: "0.1em", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ng)", boxShadow: "0 0 8px var(--ng)", animation: "pulse-glow 2s infinite", display: "inline-block" }} />
        VOID IS LIVE — {posts.length} TRANSMISSIONS IN THE ETHER
      </div>
      <ComposeBox onPost={addPost} user={user} />
      <div style={{ display: "flex", gap: "6px", margin: "20px 0", flexWrap: "wrap" }}>
        {[["all","ALL"], ...Object.entries(POST_TYPES).map(([k,v]) => [k, v.label])].map(([k,label]) => (
          <button key={k} onClick={() => setFilter(k)} style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "0.1em", padding: "5px 12px", border: `1px solid ${filter === k ? "var(--np)" : "var(--border-bright)"}`, background: filter === k ? "rgba(124,106,255,0.15)" : "transparent", color: filter === k ? "var(--np)" : "var(--text-dim)", cursor: "crosshair", transition: "all 0.15s" }}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map((post, i) => <VoidCard key={post.id} post={post} index={i} />)}
        <div style={{ textAlign: "center", padding: "48px", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-dim)", letterSpacing: "0.15em" }}>∞ THE VOID HAS NO BOTTOM ∞</div>
      </div>
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function ProfilePage({ user, onUpdate }) {
  const [form, setForm] = useState({ display_name: user?.display_name || "", bio: user?.bio || "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const t = getAuraTitle(user?.aura || 0);

  const save = async () => {
    setSaving(true);
    const r = await apiRequest("/users/profile", { method: "PUT", body: JSON.stringify(form) });
    setSaving(false);
    if (r.ok) { const d = await r.json(); onUpdate(d); setSaved(true); setTimeout(() => setSaved(false), 3000); }
  };

  return (
    <div style={{ maxWidth: "580px", margin: "0 auto" }}>
      <div style={{ background: `linear-gradient(135deg, ${t.color}15, transparent)`, border: `1px solid ${t.color}40`, borderRadius: "4px", padding: "36px", marginBottom: "20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at center, ${t.color}10, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.2em", marginBottom: "10px" }}>VOID IDENTITY</div>
        <div style={{ fontFamily: "var(--display)", fontSize: "28px", fontWeight: 900, color: "var(--text-bright)", marginBottom: "8px" }}>@{user?.username}</div>
        <div style={{ marginBottom: "20px" }}><AuraBadge aura={user?.aura || 0} size="lg" /></div>
        <div style={{ display: "flex", justifyContent: "center", gap: "40px" }}>
          {[{ label: "AURA", val: (user?.aura || 0).toLocaleString(), col: t.color }, { label: "STREAK", val: `${user?.streak || 1}🔥`, col: "var(--no)" }, { label: "POSTS", val: "0", col: "var(--nc)" }].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: "var(--display)", fontSize: "20px", fontWeight: 700, color: s.col, textShadow: `0 0 10px ${s.col}` }}>{s.val}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.1em", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "4px", padding: "24px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: "20px" }}>// EDIT IDENTITY</div>
        <div style={{ marginBottom: "14px" }}>
          <label style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.15em", display: "block", marginBottom: "6px" }}>DISPLAY_NAME</label>
          <input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} placeholder="How the void knows you..." />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.15em", display: "block", marginBottom: "6px" }}>BIO</label>
          <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Describe your existence..." style={{ resize: "none" }} />
        </div>
        <button onClick={save} disabled={saving} style={{ fontFamily: "var(--mono)", fontSize: "10px", padding: "10px 24px", background: saved ? "rgba(0,255,136,0.12)" : "rgba(124,106,255,0.12)", border: `1px solid ${saved ? "var(--ng)" : "var(--np)"}`, color: saved ? "var(--ng)" : "var(--np)", cursor: "crosshair", letterSpacing: "0.1em", textShadow: `0 0 8px ${saved ? "var(--ng)" : "var(--np)"}`, transition: "all 0.3s" }}>
          {saving ? "SAVING..." : saved ? "✓ IDENTITY SAVED" : "▸ UPDATE IDENTITY"}
        </button>
      </div>
    </div>
  );
}

// ─── COMING SOON ─────────────────────────────────────────────────────────────
function ComingSoon({ label }) {
  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center", padding: "100px 24px" }}>
      <div style={{ fontFamily: "var(--display)", fontSize: "36px", fontWeight: 900, letterSpacing: "0.1em", marginBottom: "16px", animation: "flicker 4s infinite" }}>
        <GlitchText style={{ background: "linear-gradient(135deg, var(--np), var(--npk))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{label}</GlitchText>
      </div>
      <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "0.2em" }}>// PHASE 2 — COMING TO THE VOID SOON</div>
    </div>
  );
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(null);

  const switchMode = (m) => { setMode(m); setError(""); setRegistered(null); setForm({ username: "", email: "", password: "" }); };

  const submit = async () => {
    setError(""); setLoading(true);
    const ep = mode === "login" ? "/auth/login" : "/auth/register";
    const body = mode === "login" ? { email: form.email, password: form.password } : { username: form.username, email: form.email, password: form.password };
    try {
      const r = await apiRequest(ep, { method: "POST", body: JSON.stringify(body) });
      const data = await r.json();
      setLoading(false);
      if (!r.ok) { setError(data.error || "Signal lost. Try again."); return; }
      if (mode === "login") { localStorage.setItem("access_token", data.access_token); localStorage.setItem("refresh_token", data.refresh_token); onLogin(data.user); }
      else { setRegistered({ username: form.username, email: form.email }); setForm({ username: "", email: "", password: "" }); }
    } catch { setLoading(false); setError("Connection to the void failed. Try again."); }
  };

  const pwChecks = [
    { label: "8+ CHARS",   ok: form.password.length >= 8 },
    { label: "UPPERCASE",  ok: /[A-Z]/.test(form.password) },
    { label: "LOWERCASE",  ok: /[a-z]/.test(form.password) },
    { label: "NUMBER",     ok: /\d/.test(form.password) },
  ];

  // SUCCESS SCREEN
  if (registered) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--void)", overflow: "hidden", position: "relative" }}>
      <Particles />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "480px", padding: "24px", animation: "fadeUp 0.5s ease" }}>
        <div style={{ width: 96, height: 96, margin: "0 auto 32px", borderRadius: "50%", border: "2px solid var(--ng)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 60px rgba(0,255,136,0.4)", animation: "pulse-glow 2s infinite", color: "var(--ng)" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <div style={{ fontFamily: "var(--display)", fontSize: "32px", fontWeight: 900, color: "var(--ng)", textShadow: "0 0 40px rgba(0,255,136,0.6)", letterSpacing: "0.08em", marginBottom: "8px" }}>YOU'RE IN.</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: "32px" }}>THE VOID WELCOMES @{registered.username}</div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "4px", padding: "20px", marginBottom: "24px", textAlign: "left" }}>
          {[{ l: "USERNAME", v: `@${registered.username}` }, { l: "EMAIL", v: registered.email }, { l: "AURA", v: "0 — VOID LURKER" }, { l: "STATUS", v: "ACTIVE ●" }].map(row => (
            <div key={row.l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "0.1em" }}>{row.l}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: row.l === "STATUS" ? "var(--ng)" : "var(--text)" }}>{row.v}</span>
            </div>
          ))}
        </div>
        <button onClick={() => switchMode("login")} style={{ width: "100%", padding: "14px", background: "rgba(0,255,136,0.1)", border: "1px solid var(--ng)", color: "var(--ng)", fontFamily: "var(--mono)", fontSize: "12px", letterSpacing: "0.2em", cursor: "crosshair", textShadow: "0 0 10px var(--ng)" }}>
          ▸ ENTER THE VOID
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--void)", overflow: "hidden", position: "relative" }}>
      <Particles />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "400px", padding: "24px", animation: "fadeUp 0.4s ease" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontFamily: "var(--display)", fontSize: "52px", fontWeight: 900, letterSpacing: "0.15em", animation: "flicker 6s infinite" }}>
            <GlitchText style={{ background: "linear-gradient(135deg, var(--np), var(--npk), var(--nc))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NEXUS</GlitchText>
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "0.25em", marginTop: "4px" }}>ENTER THE VOID</div>
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border-bright)", borderRadius: "4px", padding: "32px", animation: "neon-border 8s infinite" }}>
          <div style={{ display: "flex", marginBottom: "28px", border: "1px solid var(--border-bright)", borderRadius: "3px", overflow: "hidden" }}>
            {["login","register"].map(m => (
              <button key={m} onClick={() => switchMode(m)} style={{ flex: 1, padding: "10px", background: mode === m ? "rgba(124,106,255,0.2)" : "transparent", border: "none", borderRight: m === "login" ? "1px solid var(--border-bright)" : "none", color: mode === m ? "var(--np)" : "var(--text-dim)", fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "0.1em", cursor: "crosshair", textShadow: mode === m ? "0 0 8px var(--np)" : "none", transition: "all 0.2s", textTransform: "uppercase" }}>
                {m === "login" ? "[ CONNECT ]" : "[ JOIN VOID ]"}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: "rgba(255,0,110,0.1)", border: "1px solid rgba(255,0,110,0.4)", borderRadius: "3px", padding: "10px 14px", marginBottom: "16px", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--npk)", display: "flex", gap: "8px", alignItems: "center" }}>
              ⚠ {error}
            </div>
          )}

          {mode === "register" && (
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.2em", display: "block", marginBottom: "6px" }}>USERNAME</label>
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="your_alias" />
            </div>
          )}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.2em", display: "block", marginBottom: "6px" }}>EMAIL</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="signal@domain.void" />
          </div>
          <div style={{ marginBottom: mode === "register" ? "12px" : "24px" }}>
            <label style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.2em", display: "block", marginBottom: "6px" }}>PASSWORD</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === "Enter" && submit()} placeholder="••••••••" />
          </div>

          {mode === "register" && (
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "24px" }}>
              {pwChecks.map(c => (
                <span key={c.label} style={{ fontFamily: "var(--mono)", fontSize: "9px", padding: "3px 8px", letterSpacing: "0.08em", background: c.ok ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.03)", color: c.ok ? "var(--ng)" : "var(--text-dim)", border: `1px solid ${c.ok ? "rgba(0,255,136,0.4)" : "var(--border)"}`, transition: "all 0.2s" }}>
                  {c.ok ? "✓" : "○"} {c.label}
                </span>
              ))}
            </div>
          )}

          <button onClick={submit} disabled={loading} style={{ width: "100%", padding: "13px", background: loading ? "transparent" : "linear-gradient(135deg, rgba(124,106,255,0.25), rgba(255,0,110,0.15))", border: "1px solid var(--np)", color: loading ? "var(--text-dim)" : "var(--np)", fontFamily: "var(--mono)", fontSize: "12px", letterSpacing: "0.2em", cursor: "crosshair", textShadow: loading ? "none" : "0 0 10px var(--np)", transition: "all 0.2s" }}>
            {loading ? "CONNECTING..." : mode === "login" ? "▸ CONNECT TO VOID" : "▸ CLAIM YOUR VOID"}
          </button>

          <p style={{ textAlign: "center", marginTop: "20px", fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "0.05em" }}>
            {mode === "login" ? "no account? " : "already exist? "}
            <button onClick={() => switchMode(mode === "login" ? "register" : "login")} style={{ background: "none", border: "none", color: "var(--nc)", cursor: "crosshair", fontFamily: "var(--mono)", fontSize: "10px", textDecoration: "underline", textShadow: "0 0 6px var(--nc)" }}>
              {mode === "login" ? "join the void →" : "connect instead →"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("feed");
  const [booting, setBooting] = useState(true);
  const [bootPct, setBootPct] = useState(0);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      apiRequest("/auth/me").then(r => r.ok ? r.json() : null).then(u => {
        if (u) setUser({ ...u, aura: 847, streak: 7 });
        setBooting(false);
      }).catch(() => setBooting(false));
    } else { setTimeout(() => setBooting(false), 1200); }
    // Boot progress
    let p = 0;
    const t = setInterval(() => { p += Math.random() * 20; if (p >= 100) { clearInterval(t); setBootPct(100); } else setBootPct(Math.min(p, 99)); }, 100);
    return () => clearInterval(t);
  }, []);

  if (booting) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--void)", gap: "28px" }}>
      <style>{STYLES}</style>
      <Particles />
      <div style={{ fontFamily: "var(--display)", fontSize: "40px", fontWeight: 900, letterSpacing: "0.15em", animation: "flicker 2s infinite" }}>
        <GlitchText style={{ background: "linear-gradient(135deg, var(--np), var(--npk))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NEXUS</GlitchText>
      </div>
      <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "0.2em" }}>INITIALIZING THE VOID...</div>
      <div style={{ width: "240px" }}>
        <div style={{ height: "2px", background: "var(--border)", borderRadius: "1px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${bootPct}%`, background: "linear-gradient(90deg, var(--np), var(--npk))", boxShadow: "0 0 10px var(--np)", transition: "width 0.1s ease" }} />
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text-dim)", marginTop: "8px", textAlign: "right" }}>{~~bootPct}%</div>
      </div>
    </div>
  );

  if (!user) return <AuthPage onLogin={u => setUser({ ...u, aura: 0, streak: 0 })} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--void)" }}>
      <Particles />
      <VoidSidebar user={user} page={page} setPage={setPage} />
      <main style={{ marginLeft: "220px", flex: 1, padding: "40px 32px", position: "relative", zIndex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "36px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "0.15em" }}>
            NEXUS<span style={{ color: "var(--np)" }}>://</span>VOID<span style={{ color: "var(--np)" }}>/</span>{page.toUpperCase()}
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: "10px", display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ color: "var(--ng)", textShadow: "0 0 6px var(--ng)" }}>● CONNECTED</span>
            <span style={{ color: "var(--text-dim)" }}>@{user.username}</span>
          </div>
        </div>
        {page === "feed"      && <FeedPage user={user} />}
        {page === "trending"  && <ComingSoon label="TRENDING" />}
        {page === "confess"   && <ComingSoon label="CONFESSIONS" />}
        {page === "messages"  && <ComingSoon label="MESSAGES" />}
        {page === "profile"   && <ProfilePage user={user} onUpdate={u => setUser({ ...user, ...u })} />}
        {page === "admin"     && <ComingSoon label="ADMIN" />}
      </main>
    </div>
  );
}
