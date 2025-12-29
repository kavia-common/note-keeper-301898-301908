import React, { useEffect, useMemo, useState } from "react";
import { useNotes } from "../context/NotesContext";
import { debounce } from "../utils/debounce";

// PUBLIC_INTERFACE
export default function NoteEditor() {
  /** Inline note editor with debounced autosave. */
  const { state, actions } = useNotes();
  const active = useMemo(() => state.notes.find(n => n.id === state.activeId) || null, [state.notes, state.activeId]);

  const [title, setTitle] = useState(active?.title || "");
  const [content, setContent] = useState(active?.content || "");

  useEffect(() => {
    setTitle(active?.title || "");
    setContent(active?.content || "");
  }, [active?.id]); // reset when switching notes

  const save = useMemo(
    () =>
      debounce((patch) => {
        if (active?.id) {
          actions.updateNote(active.id, patch);
        }
      }, 600),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active?.id]
  );

  const onTitle = (e) => {
    setTitle(e.target.value);
    save({ title: e.target.value });
  };

  const onContent = (e) => {
    setContent(e.target.value);
    save({ content: e.target.value });
  };

  if (!active) {
    return (
      <div className="card section" aria-label="Editor">
        <div className="small" style={{ color: "#6b7280" }}>
          Select a note to start editing.
        </div>
      </div>
    );
  }

  return (
    <div className="card section note-editor" aria-label="Editor">
      <div>
        <label htmlFor="edit-title" className="small">Title</label>
        <input
          id="edit-title"
          className="input"
          placeholder="Title"
          aria-label="Note title"
          value={title}
          onChange={onTitle}
        />
      </div>
      <div>
        <label htmlFor="edit-content" className="small">Content</label>
        <textarea
          id="edit-content"
          className="textarea"
          placeholder="Start typing..."
          aria-label="Note content"
          value={content}
          onChange={onContent}
        />
      </div>
      <div className="editor-actions">
        <div className="small">Autosaving...</div>
        <div className="small">Updated {new Date(active.updatedAt).toLocaleString()}</div>
      </div>
    </div>
  );
}
