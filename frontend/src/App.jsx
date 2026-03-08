import { useState, useEffect, createContext, useContext } from "react";

// ─── AUTH CONTEXT ────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

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

// ─── ICONS ──────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20 }) => {
  const icons = {
    home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
    bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
    search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
    settings: "M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
    logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
    plus: "M12 5v14M5 12h14",
    edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
    trash: "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
    check: "M20 6L9 17l-5-5",
    x: "M18 6L6 18M6 6l12 12",
    menu: "M3 12h18M3 6h18M3 18h18",
    arrow_left: "M19 12H5M12 19l-7-7 7-7",
    eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    chart: "M18 20V10M12 20V4M6 20v-6",
    chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    sun: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 6a6 6 0 1 0 0 12A6 6 0 0 0 12 6z",
    moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
    upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6",
    grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
    send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  };
  const d = icons[name] || icons.star;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {d.split(" M").map((seg, i) => <path key={i} d={(i === 0 ? "" : "M") + seg} />)}
    </svg>
  );
};

// ─── STYLES ──────────────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --bg-elevated: #12121a;
    --bg-card: #1a1a26;
    --bg-hover: #22222f;
    --border: #2a2a3a;
    --border-light: #353548;
    --text: #e8e8f0;
    --text-muted: #8888aa;
    --text-dim: #5555770;
    --accent: #7c6aff;
    --accent-glow: rgba(124, 106, 255, 0.3);
    --accent2: #ff6b9d;
    --accent3: #00d9aa;
    --accent4: #ffd166;
    --danger: #ff4560;
    --success: #00d9aa;
    --warning: #ffd166;
    --radius: 12px;
    --radius-sm: 8px;
    --radius-lg: 20px;
    --shadow: 0 4px 24px rgba(0,0,0,0.4);
    --shadow-lg: 0 8px 48px rgba(0,0,0,0.6);
    --transition: 0.2s cubic-bezier(0.4,0,0.2,1);
    --font-display: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
  }

  [data-theme="light"] {
    --bg: #f0f0f8;
    --bg-elevated: #fafafa;
    --bg-card: #ffffff;
    --bg-hover: #f0f0f8;
    --border: #e0e0ee;
    --border-light: #d8d8ea;
    --text: #1a1a2e;
    --text-muted: #6666880;
    --accent-glow: rgba(124, 106, 255, 0.15);
    --shadow: 0 4px 24px rgba(100,100,160,0.1);
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: var(--font-body);
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  a { color: inherit; text-decoration: none; }

  input, textarea, select {
    font-family: var(--font-body);
    background: var(--bg-elevated);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    padding: 10px 14px;
    font-size: 14px;
    transition: border-color var(--transition), box-shadow var(--transition);
    outline: none;
    width: 100%;
  }

  input:focus, textarea:focus, select:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-glow);
  }

  button { cursor: pointer; font-family: var(--font-body); border: none; outline: none; }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--accent); }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
  @keyframes slideIn { from { transform: translateX(-20px); opacity: 0; } to { transform: none; opacity: 1; } }
  @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
  @keyframes glow { 0%,100% { box-shadow: 0 0 20px var(--accent-glow); } 50% { box-shadow: 0 0 40px var(--accent-glow), 0 0 60px var(--accent-glow); } }
`;

// ─── COMPONENTS ─────────────────────────────────────────────────────────────────
function Button({ children, variant = "primary", size = "md", onClick, type = "button", disabled, loading, icon, fullWidth }) {
  const styles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    borderRadius: "var(--radius-sm)",
    fontWeight: 600,
    fontFamily: "var(--font-body)",
    transition: "all var(--transition)",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? "100%" : "auto",
    border: "none",
    ...(size === "sm" ? { padding: "6px 14px", fontSize: "13px" } :
       size === "lg" ? { padding: "14px 28px", fontSize: "16px" } :
       { padding: "10px 20px", fontSize: "14px" }),
    ...(variant === "primary" ? {
      background: "linear-gradient(135deg, var(--accent), #9c6aff)",
      color: "#fff",
      boxShadow: "0 4px 15px var(--accent-glow)",
    } : variant === "secondary" ? {
      background: "var(--bg-card)",
      color: "var(--text)",
      border: "1.5px solid var(--border)",
    } : variant === "ghost" ? {
      background: "transparent",
      color: "var(--text-muted)",
    } : variant === "danger" ? {
      background: "linear-gradient(135deg, #ff4560, #ff6b9d)",
      color: "#fff",
    } : variant === "success" ? {
      background: "linear-gradient(135deg, #00d9aa, #00bcd4)",
      color: "#fff",
    } : {}),
  };

  return (
    <button type={type} style={styles} onClick={onClick} disabled={disabled || loading}>
      {loading ? <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} /> : null}
      {icon && !loading ? <Icon name={icon} size={size === "sm" ? 14 : 16} /> : null}
      {children}
    </button>
  );
}

function Card({ children, style, glow }) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: `1.5px solid ${glow ? "var(--accent)" : "var(--border)"}`,
      borderRadius: "var(--radius)",
      padding: "24px",
      boxShadow: glow ? "0 0 30px var(--accent-glow)" : "var(--shadow)",
      animation: "fadeIn 0.3s ease",
      ...style,
    }}>
      {children}
    </div>
  );
}

function Avatar({ user, size = 40 }) {
  if (user?.avatar_url) {
    return <img src={user.avatar_url} alt={user.username} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  }
  const initials = (user?.display_name || user?.username || "?")[0].toUpperCase();
  const colors = ["#7c6aff", "#ff6b9d", "#00d9aa", "#ffd166", "#ff4560"];
  const color = colors[(user?.id || 0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}, ${color}88)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 700, fontSize: size * 0.4,
      fontFamily: "var(--font-display)",
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function Badge({ children, color = "accent" }) {
  const colors = { accent: "var(--accent)", success: "var(--success)", danger: "var(--danger)", warning: "var(--warning)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: `${colors[color]}22`,
      color: colors[color],
      border: `1px solid ${colors[color]}44`,
      padding: "2px 10px",
      borderRadius: "100px",
      fontSize: "12px",
      fontWeight: 600,
    }}>
      {children}
    </span>
  );
}

function Input({ label, type = "text", value, onChange, placeholder, error, required, icon }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      {label && <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>{label}{required && <span style={{ color: "var(--danger)" }}> *</span>}</label>}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}><Icon name={icon} size={16} /></span>}
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
          style={{ paddingLeft: icon ? "40px" : "14px" }}
        />
      </div>
      {error && <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>{error}</p>}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px" }}>
      <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );
}

function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, []);

  const colors = { success: "var(--success)", error: "var(--danger)", info: "var(--accent)" };
  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
      background: "var(--bg-card)",
      border: `1.5px solid ${colors[type]}`,
      borderRadius: "var(--radius)",
      padding: "14px 20px",
      display: "flex", alignItems: "center", gap: "12px",
      boxShadow: "var(--shadow-lg)",
      animation: "fadeIn 0.3s ease",
      maxWidth: "360px",
    }}>
      <span style={{ color: colors[type] }}>
        <Icon name={type === "success" ? "check" : type === "error" ? "x" : "bell"} size={18} />
      </span>
      <span style={{ flex: 1, fontSize: "14px" }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", color: "var(--text-muted)", display: "flex" }}>
        <Icon name="x" size={16} />
      </button>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, user, onLogout, collapsed, setCollapsed }) {
  const navItems = [
    { id: "home", icon: "home", label: "Home" },
    { id: "posts", icon: "file", label: "Posts" },
    { id: "messages", icon: "chat", label: "Messages" },
    { id: "profile", icon: "user", label: "Profile" },
    { id: "search", icon: "search", label: "Search" },
    ...(user?.role === "admin" ? [{ id: "admin", icon: "shield", label: "Admin", divider: true }] : []),
  ];

  return (
    <aside style={{
      width: collapsed ? "64px" : "220px",
      minHeight: "100vh",
      background: "var(--bg-elevated)",
      borderRight: "1.5px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
      overflow: "hidden",
      position: "fixed",
      left: 0, top: 0, bottom: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1.5px solid var(--border)" }}>
        <div style={{
          width: 32, height: 32, borderRadius: "8px",
          background: "linear-gradient(135deg, var(--accent), var(--accent2))",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          animation: "glow 3s ease-in-out infinite",
        }}>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: "16px", fontFamily: "var(--font-display)" }}>N</span>
        </div>
        {!collapsed && <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "18px", background: "linear-gradient(135deg, var(--accent), var(--accent2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Nexus</span>}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {navItems.map(item => (
          <div key={item.id}>
            {item.divider && <div style={{ height: "1px", background: "var(--border)", margin: "8px 4px" }} />}
            <button
              onClick={() => setPage(item.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 12px", borderRadius: "var(--radius-sm)",
                background: page === item.id ? "linear-gradient(135deg, var(--accent)22, var(--accent)11)" : "transparent",
                color: page === item.id ? "var(--accent)" : "var(--text-muted)",
                border: page === item.id ? "1px solid var(--accent)44" : "1px solid transparent",
                transition: "all var(--transition)",
                cursor: "pointer",
                fontWeight: page === item.id ? 600 : 400,
                fontSize: "14px",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ flexShrink: 0, display: "flex" }}><Icon name={item.icon} size={18} /></span>
              {!collapsed && item.label}
            </button>
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: "12px 8px", borderTop: "1.5px solid var(--border)", display: "flex", flexDirection: "column", gap: "4px" }}>
        {user && (
          <button
            onClick={() => setPage("profile")}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: "10px",
              padding: "8px 12px", borderRadius: "var(--radius-sm)",
              background: "transparent", color: "var(--text)",
              cursor: "pointer", border: "none",
              overflow: "hidden",
            }}
          >
            <Avatar user={user} size={28} />
            {!collapsed && (
              <div style={{ textAlign: "left", overflow: "hidden" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.display_name}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{user.role}</div>
              </div>
            )}
          </button>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: "12px",
            padding: "8px 12px", borderRadius: "var(--radius-sm)",
            background: "transparent", color: "var(--text-muted)",
            cursor: "pointer", border: "none", fontSize: "13px",
          }}
        >
          <Icon name={collapsed ? "menu" : "arrow_left"} size={16} />
          {!collapsed && "Collapse"}
        </button>
        <button
          onClick={onLogout}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: "12px",
            padding: "8px 12px", borderRadius: "var(--radius-sm)",
            background: "transparent", color: "var(--danger)",
            cursor: "pointer", border: "none", fontSize: "13px", fontWeight: 500,
          }}
        >
          <Icon name="logout" size={16} />
          {!collapsed && "Sign out"}
        </button>
      </div>
    </aside>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────────
function Topbar({ user, page, setPage, darkMode, setDarkMode, notifications, markNotifRead }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <header style={{
      height: "64px",
      background: "var(--bg-elevated)",
      borderBottom: "1.5px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px",
      position: "sticky", top: 0, zIndex: 90,
    }}>
      <h1 style={{
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "18px",
        background: "linear-gradient(135deg, var(--text), var(--text-muted))",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        textTransform: "capitalize",
      }}>
        {page}
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          onClick={() => setPage("search")}
          style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "8px 16px", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}
        >
          <Icon name="search" size={14} /> Search
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "8px", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}
        >
          <Icon name={darkMode ? "sun" : "moon"} size={16} />
        </button>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            style={{
              background: "var(--bg-card)", border: "1.5px solid var(--border)",
              borderRadius: "var(--radius-sm)", padding: "8px", color: "var(--text-muted)",
              cursor: "pointer", display: "flex", position: "relative",
            }}
          >
            <Icon name="bell" size={16} />
            {unread > 0 && (
              <span style={{
                position: "absolute", top: "-4px", right: "-4px",
                background: "var(--danger)", color: "#fff", borderRadius: "50%",
                width: "16px", height: "16px", fontSize: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700,
              }}>{unread}</span>
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              width: "320px", background: "var(--bg-card)",
              border: "1.5px solid var(--border)", borderRadius: "var(--radius)",
              boxShadow: "var(--shadow-lg)", zIndex: 200,
              animation: "fadeIn 0.2s ease",
            }}>
              <div style={{ padding: "16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, fontSize: "14px" }}>Notifications</span>
                <button onClick={markNotifRead} style={{ background: "none", color: "var(--accent)", fontSize: "12px", cursor: "pointer", border: "none" }}>Mark all read</button>
              </div>
              <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <p style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>No notifications</p>
                ) : notifications.slice(0, 10).map(n => (
                  <div key={n.id} style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border)",
                    background: n.is_read ? "transparent" : "var(--accent)08",
                    cursor: "pointer",
                  }}>
                    <div style={{ fontSize: "13px", fontWeight: n.is_read ? 400 : 600 }}>{n.title}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{n.message}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {user && <Avatar user={user} size={34} />}
      </div>
    </header>
  );
}

// ─── PAGES ───────────────────────────────────────────────────────────────────────

function HomePage({ user, setPage }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats] = useState({ users: 1024, posts: 348, messages: 5890 });

  useEffect(() => {
    apiRequest("/content/posts?per_page=6")
      .then(r => r.json())
      .then(d => { setPosts(d.posts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, var(--accent)22 0%, var(--accent2)11 50%, transparent 100%)",
        border: "1.5px solid var(--accent)33",
        borderRadius: "var(--radius-lg)",
        padding: "48px",
        marginBottom: "32px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-100px", right: "-100px",
          width: "400px", height: "400px",
          background: "radial-gradient(circle, var(--accent)22, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }} />
        <Badge color="accent">Welcome back</Badge>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, marginTop: "12px", lineHeight: 1.1 }}>
          Hello, {user?.display_name || "Explorer"} 👋
        </h2>
        <p style={{ color: "var(--text-muted)", marginTop: "12px", fontSize: "16px", maxWidth: "500px" }}>
          Your unified platform for content, conversations, and community.
        </p>
        <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Button icon="plus" onClick={() => setPage("posts")}>New Post</Button>
          <Button variant="secondary" icon="chat" onClick={() => setPage("messages")}>Messages</Button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Members", value: stats.users.toLocaleString(), icon: "users", color: "var(--accent)" },
          { label: "Posts", value: stats.posts.toLocaleString(), icon: "file", color: "var(--accent2)" },
          { label: "Messages", value: stats.messages.toLocaleString(), icon: "chat", color: "var(--accent3)" },
        ].map(s => (
          <Card key={s.label} style={{ textAlign: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: "10px", background: `${s.color}22`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: s.color }}>
              <Icon name={s.icon} size={20} />
            </div>
            <div style={{ fontSize: "28px", fontFamily: "var(--font-display)", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Recent Posts */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700 }}>Recent Posts</h3>
        <Button variant="ghost" size="sm" onClick={() => setPage("posts")}>View all →</Button>
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {posts.length === 0 ? (
            <Card style={{ textAlign: "center", padding: "40px", gridColumn: "1/-1" }}>
              <p style={{ color: "var(--text-muted)" }}>No posts yet. Be the first!</p>
              <div style={{ marginTop: "16px" }}>
                <Button icon="plus" onClick={() => setPage("posts")}>Create Post</Button>
              </div>
            </Card>
          ) : posts.map(p => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </div>
  );
}

function PostCard({ post }) {
  return (
    <Card style={{ padding: "20px", cursor: "pointer", transition: "all var(--transition)", ":hover": { borderColor: "var(--accent)" } }}>
      {post.cover_image && (
        <img src={post.cover_image} alt={post.title} style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "var(--radius-sm)", marginBottom: "16px" }} />
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        {post.category && <Badge>{post.category}</Badge>}
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          {post.published_at ? new Date(post.published_at).toLocaleDateString() : "Draft"}
        </span>
      </div>
      <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", marginBottom: "8px", lineHeight: 1.3 }}>{post.title}</h4>
      {post.excerpt && <p style={{ color: "var(--text-muted)", fontSize: "13px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.excerpt}</p>}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "16px" }}>
        {post.author && <Avatar user={post.author} size={24} />}
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{post.author?.display_name}</span>
        <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--text-muted)" }}>
          <Icon name="eye" size={12} /> {post.view_count}
        </span>
      </div>
    </Card>
  );
}

function PostsPage({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", excerpt: "", category: "", status: "draft" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const load = () => {
    setLoading(true);
    apiRequest("/content/posts?per_page=20")
      .then(r => r.json())
      .then(d => { setPosts(d.posts || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setSaving(true);
    const r = await apiRequest("/content/posts", { method: "POST", body: JSON.stringify(form) });
    setSaving(false);
    if (r.ok) {
      setToast({ type: "success", message: "Post created!" });
      setShowCreate(false);
      setForm({ title: "", content: "", excerpt: "", category: "", status: "draft" });
      load();
    }
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 800 }}>Posts</h2>
        <Button icon="plus" onClick={() => setShowCreate(true)}>New Post</Button>
      </div>

      {showCreate && (
        <Card style={{ marginBottom: "24px" }} glow>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "20px" }}>Create Post</h3>
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Post title..." required />
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>Content *</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write your content..." rows={6} style={{ resize: "vertical" }} />
          </div>
          <Input label="Excerpt" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="Short description..." />
          <Input label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Technology, Design..." />
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Button loading={saving} onClick={create}>Create Post</Button>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading ? <Spinner /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {posts.length === 0 ? (
            <p style={{ color: "var(--text-muted)", gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>No posts yet.</p>
          ) : posts.map(p => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </div>
  );
}

function MessagesPage({ user }) {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = { current: null };

  useEffect(() => {
    apiRequest("/messages/")
      .then(r => r.json())
      .then(d => { setConversations(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const loadMessages = (partnerId) => {
    setSelected(partnerId);
    apiRequest(`/messages/${partnerId}`)
      .then(r => r.json())
      .then(d => setMessages(d.messages || []));
  };

  const send = async () => {
    if (!input.trim() || !selected) return;
    const r = await apiRequest(`/messages/${selected}`, { method: "POST", body: JSON.stringify({ content: input }) });
    if (r.ok) {
      const msg = await r.json();
      setMessages(m => [...m, msg]);
      setInput("");
    }
  };

  const selectedConvo = conversations.find(c => c.partner.id === selected);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 128px)", gap: "16px" }}>
      {/* Conversations list */}
      <Card style={{ width: "280px", flexShrink: 0, padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>Messages</h3>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? <Spinner /> : conversations.length === 0 ? (
            <p style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>No conversations yet</p>
          ) : conversations.map(c => (
            <button
              key={c.partner.id}
              onClick={() => loadMessages(c.partner.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "12px",
                padding: "14px 16px",
                background: selected === c.partner.id ? "var(--accent)11" : "transparent",
                border: "none", borderBottom: "1px solid var(--border)",
                color: "var(--text)", cursor: "pointer", textAlign: "left",
                borderLeft: selected === c.partner.id ? "3px solid var(--accent)" : "3px solid transparent",
              }}
            >
              <Avatar user={c.partner} size={36} />
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: "14px", fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
                  <span>{c.partner.display_name}</span>
                  {c.unread_count > 0 && <Badge color="accent">{c.unread_count}</Badge>}
                </div>
                {c.last_message && <div style={{ fontSize: "12px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>{c.last_message.content}</div>}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Chat area */}
      <Card style={{ flex: 1, padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {!selected ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: "12px", opacity: 0.4 }}><Icon name="chat" size={48} /></div>
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: "16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
              {selectedConvo && <><Avatar user={selectedConvo.partner} size={36} /><span style={{ fontWeight: 600 }}>{selectedConvo.partner.display_name}</span></>}
              <div style={{ marginLeft: "auto" }}><Badge color="success">Online</Badge></div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {messages.map(m => {
                const isMe = m.sender_id === user.id;
                return (
                  <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", gap: "8px", alignItems: "flex-end" }}>
                    {!isMe && <Avatar user={m.sender} size={28} />}
                    <div style={{
                      maxWidth: "70%", padding: "10px 14px",
                      borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      background: isMe ? "linear-gradient(135deg, var(--accent), #9c6aff)" : "var(--bg-elevated)",
                      color: isMe ? "#fff" : "var(--text)",
                      fontSize: "14px", lineHeight: 1.5,
                    }}>
                      {m.content}
                      <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "4px", textAlign: "right" }}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    {isMe && <Avatar user={user} size={28} />}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "16px", borderTop: "1px solid var(--border)", display: "flex", gap: "8px" }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Type a message..."
                style={{ flex: 1 }}
              />
              <Button icon="send" onClick={send} disabled={!input.trim()}>Send</Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function ProfilePage({ user, onUpdate }) {
  const [form, setForm] = useState({ display_name: user?.display_name || "", bio: user?.bio || "", avatar_url: user?.avatar_url || "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "" });
  const [savingPw, setSavingPw] = useState(false);

  const save = async () => {
    setSaving(true);
    const r = await apiRequest("/users/profile", { method: "PUT", body: JSON.stringify(form) });
    setSaving(false);
    if (r.ok) {
      const data = await r.json();
      onUpdate(data);
      setToast({ type: "success", message: "Profile updated!" });
    }
  };

  const changePw = async () => {
    setSavingPw(true);
    const r = await apiRequest("/users/change-password", { method: "POST", body: JSON.stringify(pwForm) });
    setSavingPw(false);
    const data = await r.json();
    if (r.ok) {
      setToast({ type: "success", message: "Password changed!" });
      setPwForm({ current_password: "", new_password: "" });
    } else {
      setToast({ type: "error", message: data.error });
    }
  };

  return (
    <div style={{ maxWidth: "640px" }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
        <Avatar user={user} size={72} />
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "24px" }}>{user?.display_name}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>@{user?.username}</p>
          <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
            <Badge color={user?.role === "admin" ? "danger" : "accent"}>{user?.role}</Badge>
            {user?.is_verified && <Badge color="success">Verified</Badge>}
          </div>
        </div>
      </div>

      <Card style={{ marginBottom: "16px" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "20px" }}>Edit Profile</h3>
        <Input label="Display Name" value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} />
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>Bio</label>
          <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Tell us about yourself..." />
        </div>
        <Input label="Avatar URL" value={form.avatar_url} onChange={e => setForm({ ...form, avatar_url: e.target.value })} icon="user" />
        <Button loading={saving} onClick={save} icon="check">Save Changes</Button>
      </Card>

      <Card>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "20px" }}>Change Password</h3>
        <Input label="Current Password" type="password" value={pwForm.current_password} onChange={e => setPwForm({ ...pwForm, current_password: e.target.value })} icon="lock" />
        <Input label="New Password" type="password" value={pwForm.new_password} onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })} icon="lock" />
        <Button loading={savingPw} onClick={changePw} variant="secondary" icon="lock">Update Password</Button>
      </Card>
    </div>
  );
}

function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async (q) => {
    if (!q || q.length < 2) { setResults(null); return; }
    setLoading(true);
    const r = await apiRequest(`/search/?q=${encodeURIComponent(q)}`);
    const data = await r.json();
    setResults(data);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(() => search(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div style={{ maxWidth: "720px" }}>
      <div style={{ position: "relative", marginBottom: "32px" }}>
        <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
          <Icon name="search" size={20} />
        </span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search posts, users..."
          autoFocus
          style={{ paddingLeft: "48px", height: "52px", fontSize: "16px", borderRadius: "var(--radius)" }}
        />
      </div>

      {loading && <Spinner />}

      {results && (
        <div>
          {results.posts?.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "16px" }}>Posts</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {results.posts.map(p => (
                  <Card key={p.id} style={{ padding: "16px", cursor: "pointer" }}>
                    <h4 style={{ fontWeight: 600, marginBottom: "4px" }}>{p.title}</h4>
                    <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>{p.excerpt}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {results.users?.length > 0 && (
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "16px" }}>Users</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {results.users.map(u => (
                  <Card key={u.id} style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <Avatar user={u} size={40} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{u.display_name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>@{u.username}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {results.posts?.length === 0 && results.users?.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
              <div style={{ marginBottom: "12px", opacity: 0.4 }}><Icon name="search" size={48} /></div>
              No results for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AdminPage({ user }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "admin") return;
    Promise.all([
      apiRequest("/admin/dashboard").then(r => r.json()),
      apiRequest("/admin/users?per_page=10").then(r => r.json()),
      apiRequest("/admin/logs?page=1").then(r => r.json()),
    ]).then(([s, u, l]) => {
      setStats(s);
      setUsers(u.users || []);
      setLogs(l.logs || []);
      setLoading(false);
    });
  }, []);

  if (user?.role !== "admin") {
    return <Card style={{ textAlign: "center", padding: "60px" }}><p style={{ color: "var(--danger)" }}>Admin access required</p></Card>;
  }

  const tabs = ["overview", "users", "logs"];

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {tabs.map(t => (
          <Button key={t} variant={tab === t ? "primary" : "secondary"} size="sm" onClick={() => setTab(t)} style={{ textTransform: "capitalize" }}>{t}</Button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <>
          {tab === "overview" && stats && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                {[
                  { label: "Total Users", value: stats.stats.total_users, icon: "users", color: "var(--accent)" },
                  { label: "New This Week", value: stats.stats.new_users_week, icon: "user", color: "var(--success)" },
                  { label: "Total Posts", value: stats.stats.total_posts, icon: "file", color: "var(--accent2)" },
                  { label: "Published", value: stats.stats.active_posts, icon: "check", color: "var(--accent3)" },
                ].map(s => (
                  <Card key={s.label} style={{ textAlign: "center" }}>
                    <div style={{ color: s.color, marginBottom: "8px" }}><Icon name={s.icon} size={24} /></div>
                    <div style={{ fontSize: "32px", fontFamily: "var(--font-display)", fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{s.label}</div>
                  </Card>
                ))}
              </div>

              <Card>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "16px" }}>Daily Signups (7 days)</h3>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "100px" }}>
                  {stats.daily_signups.map(d => {
                    const max = Math.max(...stats.daily_signups.map(x => x.count), 1);
                    const h = Math.max((d.count / max) * 80, 4);
                    return (
                      <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "11px", color: "var(--accent)", fontWeight: 600 }}>{d.count}</span>
                        <div style={{ width: "100%", height: `${h}px`, background: "linear-gradient(to top, var(--accent), var(--accent2))", borderRadius: "4px 4px 0 0" }} />
                        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{d.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {tab === "users" && (
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>Users</h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-elevated)" }}>
                      {["User", "Email", "Role", "Status", "Joined"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: "1px solid var(--border)", transition: "background var(--transition)" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Avatar user={u} size={32} />
                            <span style={{ fontWeight: 500, fontSize: "14px" }}>{u.display_name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--text-muted)" }}>{u.email}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <Badge color={u.role === "admin" ? "danger" : u.role === "moderator" ? "warning" : "accent"}>{u.role}</Badge>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <Badge color={u.is_active ? "success" : "danger"}>{u.is_active ? "Active" : "Inactive"}</Badge>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--text-muted)" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === "logs" && (
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>Activity Logs</h3>
              </div>
              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                {logs.map(l => (
                  <div key={l.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 500, fontSize: "14px" }}>{l.user?.username || "Unknown"}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "13px" }}> — {l.action}</span>
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{l.ip_address}</span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", flexShrink: 0 }}>{new Date(l.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ─── AUTH PAGES ──────────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async () => {
    setError(""); setSuccess(""); setLoading(true);

    const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
    const body = mode === "login"
      ? { email: form.email, password: form.password }
      : { username: form.username, email: form.email, password: form.password };

    const r = await apiRequest(endpoint, { method: "POST", body: JSON.stringify(body) });
    const data = await r.json();
    setLoading(false);

    if (!r.ok) { setError(data.error || "Something went wrong"); return; }

    if (mode === "login") {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      onLogin(data.user);
    } else {
      setSuccess("Registration successful! Please check your email to verify.");
      setMode("login");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background decoration */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, var(--accent)15, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, var(--accent2)12, transparent 70%)", borderRadius: "50%" }} />
      </div>

      <div style={{ width: "100%", maxWidth: "440px", position: "relative", animation: "fadeIn 0.5s ease" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "16px",
            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 30px var(--accent-glow)",
            animation: "glow 3s ease-in-out infinite",
          }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: "24px", fontFamily: "var(--font-display)" }}>N</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "32px", background: "linear-gradient(135deg, var(--text), var(--text-muted))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Nexus</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>Your unified platform</p>
        </div>

        <Card glow style={{ padding: "36px" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: "4px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", padding: "4px", marginBottom: "28px" }}>
            {["login", "register"].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                style={{
                  flex: 1, padding: "8px",
                  borderRadius: "6px",
                  background: mode === m ? "var(--bg-card)" : "transparent",
                  color: mode === m ? "var(--text)" : "var(--text-muted)",
                  border: mode === m ? "1px solid var(--border)" : "none",
                  cursor: "pointer",
                  fontWeight: mode === m ? 600 : 400,
                  fontSize: "14px",
                  fontFamily: "var(--font-body)",
                  transition: "all var(--transition)",
                  textTransform: "capitalize",
                }}
              >{m}</button>
            ))}
          </div>

          {error && <div style={{ background: "var(--danger)15", border: "1px solid var(--danger)44", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginBottom: "16px", color: "var(--danger)", fontSize: "14px" }}>{error}</div>}
          {success && <div style={{ background: "var(--success)15", border: "1px solid var(--success)44", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginBottom: "16px", color: "var(--success)", fontSize: "14px" }}>{success}</div>}

          {mode === "register" && (
            <Input label="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="your_username" icon="user" required />
          )}
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" icon="mail" required />
          <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" icon="lock" required />

          <Button fullWidth loading={loading} onClick={submit} size="lg">
            {mode === "login" ? "Sign In" : "Create Account"}
          </Button>

          <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "var(--text-muted)" }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              style={{ color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      apiRequest("/auth/me")
        .then(r => r.ok ? r.json() : null)
        .then(u => { if (u) setUser(u); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      apiRequest("/notifications/")
        .then(r => r.json())
        .then(d => setNotifications(d.notifications || []));
    }
  }, [user]);

  const logout = async () => {
    await apiRequest("/auth/logout", { method: "POST" });
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    setPage("home");
  };

  const markNotifRead = async () => {
    await apiRequest("/notifications/read-all", { method: "PUT" });
    setNotifications(n => n.map(x => ({ ...x, is_read: true })));
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: 600 }}>Loading Nexus...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage onLogin={setUser} />;

  const ml = sidebarCollapsed ? "64px" : "220px";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        page={page}
        setPage={setPage}
        user={user}
        onLogout={logout}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <main style={{ marginLeft: ml, flex: 1, transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)", minWidth: 0 }}>
        <Topbar
          user={user}
          page={page}
          setPage={setPage}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          notifications={notifications}
          markNotifRead={markNotifRead}
        />

        <div style={{ padding: "24px", animation: "fadeIn 0.3s ease" }}>
          {page === "home" && <HomePage user={user} setPage={setPage} />}
          {page === "posts" && <PostsPage user={user} />}
          {page === "messages" && <MessagesPage user={user} />}
          {page === "profile" && <ProfilePage user={user} onUpdate={setUser} />}
          {page === "search" && <SearchPage />}
          {page === "admin" && <AdminPage user={user} />}
        </div>
      </main>
    </div>
  );
}
