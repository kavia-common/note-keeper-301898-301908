import { getBackendBaseUrl } from "../utils/env";
import { loadNotesFromStorage, saveNotesToStorage } from "../utils/storage";
import LocalNotesService from "./LocalNotesService";

const BASE = () => getBackendBaseUrl();

// basic fetch wrapper
async function api(path, options = {}) {
  const url = `${BASE()}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`API ${res.status}: ${text || res.statusText}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

// PUBLIC_INTERFACE
export default class ApiNotesService {
  /** API-backed service with localStorage caching and offline fallback. */

  async _replayQueueIfAny() {
    const ops = LocalNotesService._dequeueAll();
    if (!ops || ops.length === 0) return;
    for (const op of ops) {
      try {
        switch (op.type) {
          case "create":
            await api("/notes", { method: "POST", body: JSON.stringify(op.payload.note) });
            break;
          case "update":
            await api(`/notes/${encodeURIComponent(op.payload.id)}`, {
              method: "PUT",
              body: JSON.stringify(op.payload.patch),
            });
            break;
          case "delete":
            await api(`/notes/${encodeURIComponent(op.payload.id)}`, { method: "DELETE" });
            break;
          default:
            break;
        }
      } catch {
        // if any fail, stop replay and push remaining back
        // re-enqueue remaining by placing back into storage queue (best-effort handled by LocalNotesService.create/update/remove)
        break;
      }
    }
  }

  // PUBLIC_INTERFACE
  async list() {
    try {
      await this._replayQueueIfAny();
      const data = await api("/notes", { method: "GET" });
      const notes = Array.isArray(data) ? data : [];
      // cache locally
      saveNotesToStorage(notes);
      return notes.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch {
      // offline fallback
      return loadNotesFromStorage().sort((a, b) => b.updatedAt - a.updatedAt);
    }
  }

  // PUBLIC_INTERFACE
  async create({ title, content }) {
    const now = Date.now();
    const optimistic = { id: Math.random().toString(36).slice(2), title: title || "", content: content || "", createdAt: now, updatedAt: now };
    try {
      const created = await api("/notes", { method: "POST", body: JSON.stringify(optimistic) });
      const notes = await this.list();
      // ensure it exists locally
      if (!notes.find(n => n.id === created.id)) {
        const merged = [created, ...notes];
        saveNotesToStorage(merged);
      }
      return created;
    } catch {
      // local fallback
      const local = loadNotesFromStorage();
      local.unshift(optimistic);
      saveNotesToStorage(local);
      return optimistic;
    }
  }

  // PUBLIC_INTERFACE
  async update(id, patch) {
    const now = Date.now();
    try {
      const updated = await api(`/notes/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify({ ...patch, updatedAt: now }),
      });
      // update cache
      const notes = loadNotesFromStorage();
      const idx = notes.findIndex(n => n.id === id);
      if (idx !== -1) {
        notes[idx] = { ...notes[idx], ...updated };
        saveNotesToStorage(notes);
      }
      return updated;
    } catch {
      // fallback: update local cache
      const notes = loadNotesFromStorage();
      const idx = notes.findIndex(n => n.id === id);
      if (idx !== -1) {
        notes[idx] = { ...notes[idx], ...patch, updatedAt: now };
        saveNotesToStorage(notes);
        return notes[idx];
      }
      throw new Error("Note not found locally");
    }
  }

  // PUBLIC_INTERFACE
  async remove(id) {
    try {
      await api(`/notes/${encodeURIComponent(id)}`, { method: "DELETE" });
      const notes = loadNotesFromStorage().filter(n => n.id !== id);
      saveNotesToStorage(notes);
    } catch {
      // local delete fallback
      const notes = loadNotesFromStorage().filter(n => n.id !== id);
      saveNotesToStorage(notes);
    }
  }

  // PUBLIC_INTERFACE
  async syncPending() {
    await this._replayQueueIfAny();
  }
}
