const NOTES_KEY = "notes_app.notes";
const META_KEY = "notes_app.meta";
const QUEUE_KEY = "notes_app.queue"; // pending ops for offline sync

function safeParse(json, fallback) {
  try { return JSON.parse(json); } catch { return fallback; }
}

// PUBLIC_INTERFACE
export function loadNotesFromStorage() {
  /** Load notes array from localStorage. */
  const raw = localStorage.getItem(NOTES_KEY);
  const notes = safeParse(raw, []);
  return Array.isArray(notes) ? notes : [];
}

// PUBLIC_INTERFACE
export function saveNotesToStorage(notes) {
  /** Save notes array to localStorage and update meta timestamp. */
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  const meta = { updatedAt: Date.now() };
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

// PUBLIC_INTERFACE
export function getMeta() {
  /** Retrieve meta info like updatedAt from storage. */
  return safeParse(localStorage.getItem(META_KEY), { updatedAt: 0 });
}

// PUBLIC_INTERFACE
export function enqueueOperation(op) {
  /** Enqueue a pending operation for later sync: {type, payload}. */
  const q = safeParse(localStorage.getItem(QUEUE_KEY), []);
  q.push({ ...op, ts: Date.now() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

// PUBLIC_INTERFACE
export function dequeueOperations() {
  /** Clear and return operations queue. */
  const q = safeParse(localStorage.getItem(QUEUE_KEY), []);
  localStorage.removeItem(QUEUE_KEY);
  return q;
}

// PUBLIC_INTERFACE
export function peekOperations() {
  /** Return current operations queue without clearing. */
  return safeParse(localStorage.getItem(QUEUE_KEY), []);
}
