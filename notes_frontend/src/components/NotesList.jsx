import React, { useEffect, useMemo, useRef } from "react";
import { useNotes } from "../context/NotesContext";

// PUBLIC_INTERFACE
export default function NotesList() {
  /** List of notes with keyboard navigation and selection. */
  const { state, actions } = useNotes();
  const listRef = useRef(null);

  const notes = useMemo(() => state.notes.slice().sort((a, b) => b.updatedAt - a.updatedAt), [state.notes]);

  useEffect(() => {
    // ensure active is visible when changes
    const el = listRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
  }, [state.activeId]);

  const onKeyDown = (e) => {
    const idx = notes.findIndex(n => n.id === state.activeId);
    if (e.key === "ArrowDown") {
      const next = notes[Math.min(idx + 1, notes.length - 1)];
      if (next) actions.selectNote(next.id);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      const prev = notes[Math.max(idx - 1, 0)];
      if (prev) actions.selectNote(prev.id);
      e.preventDefault();
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      // focus search in sidebar if exists
      const search = document.querySelector('input[type="search"]');
      search?.focus();
      e.preventDefault();
    }
  };

  const confirmDelete = async (id) => {
    const ok = window.confirm("Delete this note?");
    if (!ok) return;
    await actions.deleteNote(id);
  };

  return (
    <div className="card section" aria-label="Notes list" onKeyDown={onKeyDown} tabIndex={0}>
      <div className="editor-actions">
        <div style={{ fontWeight: 600 }}>Notes</div>
        <div className="small">
          Navigate with ↑ ↓ • Search <span className="kbd">Ctrl/⌘+K</span>
        </div>
      </div>
      <div style={{ height: 8 }} />
      <div className="note-list" ref={listRef} role="list" aria-label="Notes">
        {notes.map((n) => (
          <div
            key={n.id}
            role="listitem"
            className={`note-item ${n.id === state.activeId ? "active" : ""}`}
            onClick={() => actions.selectNote(n.id)}
            data-active={n.id === state.activeId}
          >
            <div>
              <div className="note-title">{n.title || "Untitled"}</div>
              <div className="note-meta">Updated {new Date(n.updatedAt).toLocaleString()}</div>
            </div>
            <button
              className="btn danger"
              aria-label={`Delete note ${n.title || "Untitled"}`}
              onClick={(e) => { e.stopPropagation(); confirmDelete(n.id); }}
              title="Delete note"
            >
              Delete
            </button>
          </div>
        ))}
        {notes.length === 0 && (
          <div className="small" style={{ color: "#6b7280" }}>
            No notes yet. Create one from the sidebar.
          </div>
        )}
      </div>
    </div>
  );
}
