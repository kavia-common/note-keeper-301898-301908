import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { backendEnabled } from "../utils/env";
import ApiNotesService from "../services/ApiNotesService";
import LocalNotesService from "../services/LocalNotesService";

// Shapes
const initialState = {
  notes: [],
  activeId: null,
  filter: "",
  loading: false,
  error: null,
  serviceType: backendEnabled() ? "api" : "local",
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_NOTES":
      return { ...state, notes: action.payload };
    case "SELECT":
      return { ...state, activeId: action.payload };
    case "SET_FILTER":
      return { ...state, filter: action.payload };
    case "SET_SERVICE":
      return { ...state, serviceType: action.payload };
    default:
      return state;
  }
}

const NotesContext = createContext(null);

// PUBLIC_INTERFACE
export function useNotes() {
  /** Access Notes context with state, actions, and service. */
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used within NotesProvider");
  return ctx;
}

// PUBLIC_INTERFACE
export function NotesProvider({ children, toast }) {
  /** Provider wiring state and CRUD actions to selected NotesService. */
  const [state, dispatch] = useReducer(reducer, initialState);
  const service = useMemo(
    () => (state.serviceType === "api" ? new ApiNotesService() : new LocalNotesService()),
    [state.serviceType]
  );

  useEffect(() => {
    // load on mount and when service changes
    (async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const notes = await service.list();
        dispatch({ type: "SET_NOTES", payload: notes });
        if (!state.activeId && notes[0]) dispatch({ type: "SELECT", payload: notes[0].id });
      } catch (e) {
        dispatch({ type: "SET_ERROR", payload: e.message || String(e) });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.serviceType]);

  const actions = useMemo(
    () => ({
      // PUBLIC_INTERFACE
      async loadNotes() {
        dispatch({ type: "SET_LOADING", payload: true });
        try {
          const notes = await service.list();
          dispatch({ type: "SET_NOTES", payload: notes });
          return notes;
        } catch (e) {
          dispatch({ type: "SET_ERROR", payload: e.message || String(e) });
          return [];
        } finally {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      },
      // PUBLIC_INTERFACE
      selectNote(id) {
        dispatch({ type: "SELECT", payload: id });
      },
      // PUBLIC_INTERFACE
      async createNote({ title, content }) {
        try {
          const created = await service.create({ title, content });
          const notes = await service.list();
          dispatch({ type: "SET_NOTES", payload: notes });
          dispatch({ type: "SELECT", payload: created.id });
          toast?.success?.("Note created");
          return created;
        } catch (e) {
          toast?.error?.("Failed to create note");
          dispatch({ type: "SET_ERROR", payload: e.message || String(e) });
        }
      },
      // PUBLIC_INTERFACE
      async updateNote(id, patch) {
        try {
          const updated = await service.update(id, patch);
          const notes = await service.list();
          dispatch({ type: "SET_NOTES", payload: notes });
          toast?.info?.("Saved");
          return updated;
        } catch (e) {
          toast?.error?.("Failed to save");
          dispatch({ type: "SET_ERROR", payload: e.message || String(e) });
        }
      },
      // PUBLIC_INTERFACE
      async deleteNote(id) {
        try {
          await service.remove(id);
          const notes = await service.list();
          dispatch({ type: "SET_NOTES", payload: notes });
          const nextActive = notes[0]?.id || null;
          dispatch({ type: "SELECT", payload: nextActive });
          toast?.success?.("Note deleted");
        } catch (e) {
          toast?.error?.("Failed to delete");
          dispatch({ type: "SET_ERROR", payload: e.message || String(e) });
        }
      },
      // PUBLIC_INTERFACE
      setFilter(q) {
        dispatch({ type: "SET_FILTER", payload: q });
      },
      // PUBLIC_INTERFACE
      useLocal() {
        dispatch({ type: "SET_SERVICE", payload: "local" });
      },
      // PUBLIC_INTERFACE
      useApi() {
        dispatch({ type: "SET_SERVICE", payload: "api" });
      },
    }),
    [service, toast]
  );

  const filteredNotes = useMemo(() => {
    const q = (state.filter || "").toLowerCase().trim();
    const list = state.notes.slice().sort((a, b) => b.updatedAt - a.updatedAt);
    if (!q) return list;
    return list.filter(n => (n.title || "").toLowerCase().includes(q) || (n.content || "").toLowerCase().includes(q));
  }, [state.notes, state.filter]);

  const value = useMemo(
    () => ({
      state: { ...state, notes: filteredNotes },
      actions,
      service,
    }),
    [state, filteredNotes, actions, service]
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}
