import React, { useEffect, useRef, useState } from "react";
import { useNotes } from "../context/NotesContext";

// PUBLIC_INTERFACE
export default function Sidebar() {
  /** Sidebar providing new note form and filtering controls. */
  const { actions, state } = useNotes();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const titleRef = useRef(null);

  useEffect(() => {
    // autofocus title when component mounts or when creating intentionally
    if (titleRef.current) titleRef.current.focus();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;
    await actions.createNote({ title: title.trim(), content });
    setTitle("");
    setContent("");
    // refocus for rapid entry
    setTimeout(() => titleRef.current?.focus(), 0);
  };

  const onFilter = (e) => actions.setFilter(e.target.value);

  return (
    <aside className="sidebar">
      <section className="card section" aria-labelledby="new-note-title">
        <h2 id="new-note-title" style={{ marginTop: 0 }}>New Note</h2>
        <form onSubmit={onSubmit}>
          <label htmlFor="note-title" className="small">Title</label>
          <input
            id="note-title"
            ref={titleRef}
            className="input"
            placeholder="Note title"
            aria-label="New note title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <div style={{ height: 8 }} />
          <label htmlFor="note-content" className="small">Content</label>
          <textarea
            id="note-content"
            className="textarea"
            placeholder="Write something..."
            aria-label="New note content"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <div style={{ height: 12 }} />
          <button type="submit" className="btn" aria-label="Create note">
            Create
          </button>
        </form>
      </section>

      <section className="card section" aria-labelledby="filter-title">
        <h2 id="filter-title" style={{ marginTop: 0 }}>Search & Filter</h2>
        <input
          type="search"
          className="input"
          placeholder="Search notes..."
          aria-label="Search notes"
          value={state.filter}
          onChange={onFilter}
        />
        <div style={{ height: 10 }} />
        <button
          className="btn ghost"
          onClick={() => setSortDesc(!sortDesc)}
          aria-pressed={sortDesc}
          aria-label="Toggle sort order"
        >
          Sort: {sortDesc ? "Newest" : "Oldest"}
        </button>
      </section>
    </aside>
  );
}
