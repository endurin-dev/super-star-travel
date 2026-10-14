"use client";

import { useState } from "react";

type BackupStatus = "idle" | "loading" | "success" | "error";

export default function DatabaseBackup() {
  const [status, setStatus] = useState<BackupStatus>("idle");
  const [message, setMessage] = useState("");
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const triggerBackup = async () => {
    setStatus("loading");
    setMessage("");

    try {
      // Pass your secret from an env var exposed to the client (NEXT_PUBLIC_)
      // or handle auth differently (session cookie, etc.)
      const secret = process.env.NEXT_PUBLIC_BACKUP_SECRET ?? "";
      const url = `/api/db-backup${secret ? `?secret=${secret}` : ""}`;

      const response = await fetch(url);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.details || err.error || "Backup request failed");
      }

      // Extract filename from Content-Disposition header
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? "backup.sql";

      // Trigger browser download
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);

      const now = new Date().toLocaleString();
      setLastBackup(`${filename} — ${now}`);
      setStatus("success");
      setMessage(`Backup downloaded successfully`);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message ?? "An unexpected error occurred");
    }
  };

  const reset = () => {
    setStatus("idle");
    setMessage("");
  };

  return (
    <div className="backup-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500&display=swap');

        .backup-container {
          font-family: 'IBM Plex Sans', sans-serif;
          background: #0d0d0d;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .backup-card {
          background: #141414;
          border: 1px solid #2a2a2a;
          border-radius: 2px;
          width: 100%;
          max-width: 520px;
          overflow: hidden;
        }

        .card-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #2a2a2a;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .db-icon {
          width: 36px;
          height: 36px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .card-title {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.8rem;
          font-weight: 600;
          color: #e0e0e0;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0;
        }

        .card-subtitle {
          font-size: 0.72rem;
          color: #555;
          margin: 0.15rem 0 0;
          font-family: 'IBM Plex Mono', monospace;
        }

        .card-body {
          padding: 2rem;
        }

        .info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 0;
          border-bottom: 1px solid #1e1e1e;
          font-size: 0.78rem;
        }

        .info-row:last-of-type {
          border-bottom: none;
          margin-bottom: 1.5rem;
        }

        .info-label {
          color: #555;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.05em;
        }

        .info-value {
          color: #999;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.72rem;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #0d1f0d;
          border: 1px solid #14283c;
          color: #4ade80;
          padding: 0.2rem 0.5rem;
          border-radius: 2px;
          font-size: 0.65rem;
          font-family: 'IBM Plex Mono', monospace;
          letter-spacing: 0.05em;
        }

        .badge-dot {
          width: 5px;
          height: 5px;
          background: #4ade80;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .backup-btn {
          width: 100%;
          background: #e0e0e0;
          color: #0d0d0d;
          border: none;
          padding: 0.9rem 1.5rem;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 2px;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
        }

        .backup-btn:hover:not(:disabled) {
          background: #fff;
          transform: translateY(-1px);
        }

        .backup-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .backup-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .backup-btn.loading {
          background: #1e1e1e;
          color: #666;
          border: 1px solid #2a2a2a;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid #333;
          border-top-color: #666;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .status-bar {
          margin-top: 1rem;
          padding: 0.75rem 1rem;
          border-radius: 2px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.72rem;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .status-bar.success {
          background: #0a1f0a;
          border: 1px solid #14283c;
          color: #4ade80;
        }

        .status-bar.error {
          background: #1f0a0a;
          border: 1px solid #3a1a1a;
          color: #f87171;
        }

        .last-backup {
          margin-top: 1.25rem;
          padding-top: 1.25rem;
          border-top: 1px solid #1e1e1e;
        }

        .last-backup-label {
          font-size: 0.65rem;
          color: #444;
          font-family: 'IBM Plex Mono', monospace;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 0.3rem;
        }

        .last-backup-value {
          font-size: 0.72rem;
          color: #666;
          font-family: 'IBM Plex Mono', monospace;
          word-break: break-all;
        }

        .format-note {
          font-size: 0.68rem;
          color: #3a3a3a;
          font-family: 'IBM Plex Mono', monospace;
          margin-top: 0.6rem;
          line-height: 1.5;
        }
      `}</style>

      <div className="backup-card">
        <div className="card-header">
          <div className="db-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
              <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
            </svg>
          </div>
          <div>
            <h2 className="card-title">Database Backup</h2>
            <p className="card-subtitle">PostgreSQL → .sql dump</p>
          </div>
        </div>

        <div className="card-body">
          <div className="info-row">
            <span className="info-label">STATUS</span>
            <span className="badge">
              <span className="badge-dot" />
              CONNECTED
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">FORMAT</span>
            <span className="info-value">Plain SQL (.sql)</span>
          </div>
          <div className="info-row">
            <span className="info-label">INCLUDES</span>
            <span className="info-value">Schema + Data</span>
          </div>

          {status === "loading" ? (
            <button className="backup-btn loading" disabled>
              <span className="spinner" />
              Generating backup…
            </button>
          ) : (
            <button
              className="backup-btn"
              onClick={triggerBackup}
              onKeyDown={(e) => e.key === "Enter" && triggerBackup()}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Backup
            </button>
          )}

          {(status === "success" || status === "error") && (
            <div
              className={`status-bar ${status}`}
              onClick={reset}
              style={{ cursor: "pointer" }}
              title="Click to dismiss"
            >
              {status === "success" ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{flexShrink:0, marginTop:"1px"}}>
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{flexShrink:0, marginTop:"1px"}}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
              {message}
            </div>
          )}

          {lastBackup && (
            <div className="last-backup">
              <div className="last-backup-label">Last backup</div>
              <div className="last-backup-value">{lastBackup}</div>
            </div>
          )}

          <p className="format-note">
            Backup runs pg_dump on the server and streams the file directly to your browser. No files are stored on the server.
          </p>
        </div>
      </div>
    </div>
  );
}