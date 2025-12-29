import { loadNotesFromStorage, saveNotesToStorage, enqueueOperation, dequeueOperations, peekOperations } from "../utils/storage";

// Simple unique id
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// PUBLIC_INTERFACE
export default class LocalNotesService {
  /** Local-only notes service with best-effort queued ops for future API sync by ApiNotesService. */
  async list() {
    return loadNotesFromStorage().sort((a, b) => b.updatedAt - a.updatedAt);
  }

  // PUBLIC_INTERFACE
  async create({ title, content }) {
    const now = Date.now();
    const note = { id: uid(), title: title || "", content: content || "", updatedAt: now, createdAt: now };
    const notes = await this.list();
    notes.unshift(note);
    saveNotesToStorage(notes);
    enqueueOperation({ type: "create", payload: { note } });
    return note;
  }

  // PUBLIC_INTERFACE
  async update(id, patch) {
    const notes = await this.list();
    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) throw new Error("Note not found");
    notes[idx] = { ...notes[idx], ...patch, updatedAt: Date.now() };
    saveNotesToStorage(notes);
    enqueueOperation({ type: "update", payload: { id, patch } });
    return notes[idx];
  }

  // PUBLIC_INTERFACE
  async remove(id) {
    const notes = await this.list();
    const next = notes.filter(n => n.id !== id);
    saveNotesToStorage(next);
    enqueueOperation({ type: "delete", payload: { id } });
  }

  // PUBLIC_INTERFACE
  async syncPending() {
    // Local service does not actually sync; returns pending list for info
    return peekOperations();
  }

  // helper for ApiNotesService to load queued ops then clear
  static _dequeueAll() {
    return dequeueOperations();
  }
}
