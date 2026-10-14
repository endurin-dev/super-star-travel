// src/app/admin/EventsTab.tsx
"use client";

import { useState, useEffect, useCallback } from "react";

interface AdminEvent {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  location?: string | null;
  country?: string | null;
  city?: string | null;
  startDate: string;
  endDate?: string | null;
  websiteUrl?: string | null;
  featured: boolean;
  source: string;
}

const EMPTY_FORM = {
  title: "",
  description: "",
  imageUrl: "",
  location: "",
  country: "",
  city: "",
  startDate: "",
  endDate: "",
  websiteUrl: "",
  featured: false,
};

// ── Shared style tokens (matches Dashboard.tsx) ───────────────────────────────
const IS: React.CSSProperties = {
  width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 8,
  padding: "10px 12px", fontSize: 13, color: "#111827",
  outline: "none", fontFamily: "inherit", background: "#fff",
  boxSizing: "border-box" as const,
};
const LS: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 4,
  display: "block", letterSpacing: "0.05em", textTransform: "uppercase" as const,
};

function toInputDate(iso: string) {
  return iso ? iso.slice(0, 10) : "";
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <label style={{ position: "relative", display: "inline-block", width: 40, height: 22, cursor: "pointer", flexShrink: 0 }}>
      <input type="checkbox" checked={on} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
      <span style={{ position: "absolute", inset: 0, background: on ? "#f97316" : "#d1d5db", borderRadius: 22, transition: ".2s" }}>
        <span style={{ position: "absolute", width: 16, height: 16, left: on ? 21 : 3, bottom: 3, background: "#fff", borderRadius: "50%", transition: ".2s" }} />
      </span>
    </label>
  );
}

export default function EventsTab() {
  const [events, setEvents]           = useState<AdminEvent[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [editing, setEditing]         = useState<AdminEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminEvent | null>(null);
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [formError, setFormError]     = useState("");
  const [form, setForm]               = useState(EMPTY_FORM);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/events");
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowForm(true);
  }

  function openEdit(event: AdminEvent) {
    setEditing(event);
    setForm({
      title:       event.title,
      description: event.description ?? "",
      imageUrl:    event.imageUrl    ?? "",
      location:    event.location    ?? "",
      country:     event.country     ?? "",
      city:        event.city        ?? "",
      startDate:   toInputDate(event.startDate),
      endDate:     event.endDate ? toInputDate(event.endDate) : "",
      websiteUrl:  event.websiteUrl  ?? "",
      featured:    event.featured,
    });
    setFormError("");
    setShowForm(true);
  }

  async function handleSubmit() {
    if (!form.title.trim()) { setFormError("Title is required."); return; }
    if (!form.startDate)    { setFormError("Start date is required."); return; }
    setFormError("");
    setSaving(true);
    try {
      const payload = editing ? { ...form, id: editing.id } : form;
      const res = await fetch("/api/events", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setShowForm(false);
      await fetchEvents();
    } catch {
      setFormError("Failed to save event. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/events?id=${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      await fetchEvents();
    } catch {
      // silent — add showToast prop if needed
    } finally {
      setDeleting(false);
    }
  }

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Events</span>
          {!loading && (
            <span style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", background: "#f3f4f6", padding: "2px 8px", borderRadius: 999 }}>
              {events.length}
            </span>
          )}
        </div>
        <button
          onClick={openAdd}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#111827", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#1f2937")}
          onMouseLeave={e => (e.currentTarget.style.background = "#111827")}
        >
          + Add Event
        </button>
      </div>

      {/* ── Table / Empty ── */}
      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
          Loading events…
        </div>
      ) : events.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", background: "#fff", borderRadius: 14, border: "1.5px dashed #e5e7eb" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🗓️</div>
          <div style={{ fontWeight: 600, color: "#374151", fontSize: 14 }}>No events yet</div>
          <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>Click "Add Event" to create your first event.</div>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Title", "Date", "Country", "Source", "Featured", ""].map(h => (
                    <th key={h} style={{ background: "#f8f9fb", padding: "9px 12px", textAlign: h === "Featured" ? "center" : "left", fontSize: 11, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "#9ca3af", borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id} style={{ borderBottom: "1px solid #f8f9fb" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "11px 12px", color: "#111827", fontWeight: 600, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {event.title}
                    </td>
                    <td style={{ padding: "11px 12px", color: "#374151", whiteSpace: "nowrap" }}>
                      {new Date(event.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "11px 12px", color: "#6b7280" }}>
                      {event.country || "—"}
                    </td>
                    <td style={{ padding: "11px 12px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6b7280" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: event.source === "ticketmaster" ? "#38bdf8" : "#d1d5db", flexShrink: 0 }} />
                        {event.source}
                      </span>
                    </td>
                    <td style={{ padding: "11px 12px", textAlign: "center" }}>
                      {event.featured
                        ? <span style={{ fontSize: 15 }}>⭐</span>
                        : <span style={{ color: "#d1d5db" }}>—</span>
                      }
                    </td>
                    <td style={{ padding: "11px 12px" }}>
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => openEdit(event)}
                          style={{ padding: "4px 9px", fontSize: 11, fontWeight: 600, background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#e5e7eb")}
                          onMouseLeave={e => (e.currentTarget.style.background = "#f3f4f6")}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(event)}
                          style={{ padding: "4px 9px", fontSize: 11, fontWeight: 600, background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#fecaca")}
                          onMouseLeave={e => (e.currentTarget.style.background = "#fee2e2")}
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)" }} onClick={() => setShowForm(false)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "92vh", overflow: "auto", boxShadow: "0 24px 80px rgba(0,0,0,.2)" }}>

            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f0f0f0", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>
                {editing ? "Edit Event" : "Add Event"}
              </h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9ca3af", lineHeight: 1 }}>×</button>
            </div>

            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Error */}
              {formError && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 12, fontWeight: 600 }}>
                  ⚠️ {formError}
                </div>
              )}

              {/* Title */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={LS}>Title <span style={{ color: "#ef4444" }}>*</span></label>
                <input style={IS} value={form.title} onChange={e => f("title", e.target.value)} placeholder="Event title" />
              </div>

              {/* Description */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={LS}>Description</label>
                <textarea
                  style={{ ...IS, resize: "none", lineHeight: 1.6 } as React.CSSProperties}
                  rows={3}
                  value={form.description}
                  onChange={e => f("description", e.target.value)}
                  placeholder="Event description"
                />
              </div>

              {/* Image URL */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={LS}>Image URL</label>
                <input style={IS} value={form.imageUrl} onChange={e => f("imageUrl", e.target.value)} placeholder="https://..." />
              </div>

              {/* Country + City */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={LS}>Country</label>
                  <input style={IS} value={form.country} onChange={e => f("country", e.target.value)} placeholder="France" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={LS}>City</label>
                  <input style={IS} value={form.city} onChange={e => f("city", e.target.value)} placeholder="Paris" />
                </div>
              </div>

              {/* Venue */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={LS}>Location / Venue</label>
                <input style={IS} value={form.location} onChange={e => f("location", e.target.value)} placeholder="Palais Royal, Louvre…" />
              </div>

              {/* Dates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={LS}>Start Date <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="date" style={IS} value={form.startDate} onChange={e => f("startDate", e.target.value)} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={LS}>End Date</label>
                  <input type="date" style={IS} value={form.endDate} onChange={e => f("endDate", e.target.value)} />
                </div>
              </div>

              {/* Website */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={LS}>Website URL</label>
                <input style={IS} value={form.websiteUrl} onChange={e => f("websiteUrl", e.target.value)} placeholder="https://..." />
              </div>

              {/* Featured toggle */}
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", paddingTop: 4 }}>
                <Toggle on={form.featured} onChange={() => f("featured", !form.featured)} />
                <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                  ⭐ Featured Event
                </span>
              </label>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: "10px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#e5e7eb")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#f3f4f6")}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  style={{ flex: 2, padding: "10px", background: saving ? "#9ca3af" : "#111827", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.background = "#1f2937"; }}
                  onMouseLeave={e => { if (!saving) e.currentTarget.style.background = "#111827"; }}
                >
                  {saving ? "Saving…" : editing ? "Save Changes" : "Create Event"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)" }} onClick={() => setDeleteTarget(null)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: 16, width: "100%", maxWidth: 400, padding: 28, boxShadow: "0 24px 80px rgba(0,0,0,.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>
                ⚠️
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Delete Event</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>This action cannot be undone.</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20, lineHeight: 1.6 }}>
              Are you sure you want to delete <strong style={{ color: "#111827" }}>"{deleteTarget.title}"</strong>?
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{ flex: 1, padding: "10px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#e5e7eb")}
                onMouseLeave={e => (e.currentTarget.style.background = "#f3f4f6")}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ flex: 1, padding: "10px", background: deleting ? "#9ca3af" : "#fee2e2", color: deleting ? "#fff" : "#dc2626", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                onMouseEnter={e => { if (!deleting) e.currentTarget.style.background = "#fecaca"; }}
                onMouseLeave={e => { if (!deleting) e.currentTarget.style.background = "#fee2e2"; }}
              >
                {deleting ? "Deleting…" : "🗑 Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}