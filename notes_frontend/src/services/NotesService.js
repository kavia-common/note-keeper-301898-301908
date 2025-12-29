/**
 * PUBLIC_INTERFACE
 * NotesService defines a minimal CRUD interface for notes with optional sync.
 *
 * Methods:
 * - list(): Promise<Note[]>
 * - create({title, content}): Promise<Note>
 * - update(id, {title?, content?}): Promise<Note>
 * - remove(id): Promise<void>
 * - syncPending?(): Promise<void>
 *
 * Note shape:
 * { id: string, title: string, content: string, updatedAt: number, createdAt: number }
 */
export default class NotesService {
  // These are documentation stubs; concrete classes implement them.
}
