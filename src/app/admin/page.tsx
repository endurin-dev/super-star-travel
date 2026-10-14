"use client";
// app/admin/page.tsx
import { useState, useEffect } from "react";
import Dashboard from "./Dashboard";

// ── Change these to your own credentials ─────────────────────
const ADMIN_USER = "admin";
const ADMIN_PASS = "123";
// ─────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed,  setAuthed]  = useState(false);
  const [checked, setChecked] = useState(false);
  const [user,    setUser]    = useState("");
  const [pass,    setPass]    = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [show,    setShow]    = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("pem_admin") === "1") setAuthed(true);
    setChecked(true);
  }, []);

  const login = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem("pem_admin", "1");
      setAuthed(true);
    } else {
      setError("Incorrect username or password");
    }
    setLoading(false);
  };

  const logout = () => {
    sessionStorage.removeItem("pem_admin");
    setAuthed(false);
    setUser(""); setPass("");
  };

  if (!checked) return null;
  if (authed)   return <Dashboard onLogout={logout} />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Sora',sans-serif}
        .lg{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:28px;background:#f5f7fa;position:relative;overflow:hidden}
        .lg-bg{position:absolute;inset:0;background:radial-gradient(ellipse 50% 55% at 12% 18%,rgba(53,107,154,.10),transparent 70%),radial-gradient(ellipse 45% 60% at 90% 90%,rgba(249,115,22,.10),transparent 70%)}
        .lg-grid{position:absolute;inset:0;background-image:radial-gradient(#cbd5e1 0.7px,transparent 0.7px);background-size:22px 22px;opacity:.24}
        .lg-card{position:relative;z-index:1;width:100%;max-width:880px;min-height:500px;display:grid;grid-template-columns: .9fr 1.1fr;background:#fff;border:1px solid #e7edf3;border-radius:26px;overflow:hidden;box-shadow:0 30px 90px rgba(24,50,75,.12)}
        .lg-logo{position:relative;display:flex;flex-direction:column;justify-content:flex-end;gap:15px;margin:0;padding:42px;background:linear-gradient(155deg,#18324b,#14283c);overflow:hidden}
        .lg-logo::before,.lg-logo::after{content:"";position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,.12);pointer-events:none}
        .lg-logo::before{width:340px;height:340px;right:-170px;top:-135px}
        .lg-logo::after{width:250px;height:250px;right:-95px;top:-90px}
        .lg-icon{position:absolute;top:42px;left:42px;width:46px;height:46px;border-radius:14px;background:#f97316;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 26px rgba(249,115,22,.27)}
        .lg-icon svg{width:21px;height:21px;color:#18324b}
        .lg-brand{position:relative;z-index:1;font-size:20px;font-weight:700;color:#fff}
        .lg-brand-sub{position:relative;z-index:1;font-size:10px;color:rgba(255,255,255,.58);letter-spacing:.13em;text-transform:uppercase;margin-top:5px}
        .lg-form{padding:58px 54px;display:flex;flex-direction:column;justify-content:center}
        .lg-kicker{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#f97316;margin-bottom:12px}
        .lg-h1{font-size:29px;letter-spacing:-.04em;font-weight:750;color:#18324b;margin-bottom:7px}
        .lg-p{font-size:12px;line-height:1.6;color:#64748b;margin-bottom:28px}
        .lg-err{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);
          color:#b91c1c;font-size:12px;padding:10px 13px;border-radius:9px;margin-bottom:14px}
        .lg-field{display:flex;flex-direction:column;gap:7px;margin-bottom:15px}
        .lg-label{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#475569}
        .lg-wrap{display:flex;align-items:center;background:#f8fafc;border:1px solid #dbe3ec;border-radius:10px;overflow:hidden;transition:border-color .2s,box-shadow .2s}
        .lg-wrap:focus-within{border-color:#f97316;box-shadow:0 0 0 3px rgba(249,115,22,.12)}
        .lg-input{flex:1;background:transparent;border:none;outline:none;padding:12px 13px;font-size:13px;color:#18324b;font-family:'Sora',sans-serif}
        .lg-input::placeholder{color:#94a3b8}
        .lg-eye{padding:0 12px;background:none;border:none;cursor:pointer;color:#64748b;font-size:15px}
        .lg-btn{width:100%;padding:13px;background:#f97316;color:#18324b;border:none;
          border-radius:10px;font-family:'Sora',sans-serif;font-size:13px;font-weight:700;
          cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;
          margin-top:6px;transition:background .2s,transform .15s}
        .lg-btn:hover:not(:disabled){background:#fb923c;transform:translateY(-1px)}
        .lg-btn:disabled{opacity:.55;cursor:not-allowed}
        .lg-hint{text-align:center;font-size:11px;color:#94a3b8;margin-top:17px}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spin{width:15px;height:15px;border:2px solid rgba(24,50,75,.25);border-top-color:#18324b;border-radius:50%;animation:spin .7s linear infinite}
        @media(max-width:680px){.lg{padding:16px}.lg-card{max-width:440px;min-height:0;grid-template-columns:1fr;border-radius:20px}.lg-logo{min-height:150px;padding:25px 28px;justify-content:flex-end}.lg-icon{top:24px;left:28px;width:40px;height:40px}.lg-brand{font-size:17px}.lg-form{padding:32px 28px 30px}.lg-h1{font-size:25px}}
      `}</style>

      <div className="lg">
        <div className="lg-bg" /><div className="lg-grid" />
        <div className="lg-card">

          <div className="lg-logo">
            <div className="lg-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0
                     002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <div>
              <div className="lg-brand">Super Star Travel</div>
              <div className="lg-brand-sub">Admin Dashboard</div>
            </div>
          </div>
          <div className="lg-form">
          <div className="lg-kicker">Operations console</div>
          <h1 className="lg-h1">Welcome back</h1>
          <p className="lg-p">Sign in to manage bookings, routes, rates and your travel operations.</p>

          {error && <div className="lg-err">⚠ {error}</div>}

          <div className="lg-field">
            <label className="lg-label" htmlFor="admin-username">Username</label>
            <div className="lg-wrap">
              <input id="admin-username" className="lg-input" autoComplete="username" placeholder="Enter username" value={user}
                onChange={e => { setUser(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && login()} />
            </div>
          </div>

          <div className="lg-field">
            <label className="lg-label" htmlFor="admin-password">Password</label>
            <div className="lg-wrap">
              <input id="admin-password" className="lg-input" type={show ? "text" : "password"} autoComplete="current-password"
                placeholder="Enter password" value={pass}
                onChange={e => { setPass(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && login()} />
              <button type="button" className="lg-eye" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(s => !s)}>
                {show ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button type="button" className="lg-btn" onClick={login}
            disabled={loading || !user || !pass}>
            {loading ? <div className="spin" /> : "Sign In"}
          </button>

          </div>
        </div>
      </div>
    </>
  );
}