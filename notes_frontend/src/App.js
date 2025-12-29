import React from "react";
import "./index.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import NotesList from "./components/NotesList";
import NoteEditor from "./components/NoteEditor";
import { ToastProvider, useToast } from "./components/Toast";
import { NotesProvider } from "./context/NotesContext";

// Wrapper to inject toast into NotesProvider
function Providers({ children }) {
  const toast = useToast();
  return <NotesProvider toast={toast}>{children}</NotesProvider>;
}

// PUBLIC_INTERFACE
function App() {
  /** Root app layout: header, sidebar, list, editor with Ocean Professional theme. */
  return (
    <div className="app-shell">
      <Header />
      <div className="app-main">
        <Sidebar />
        <div className="card section" style={{ display: "grid", gap: 16 }}>
          <NotesList />
          <NoteEditor />
        </div>
      </div>
    </div>
  );
}

export default function AppWithProviders() {
  return (
    <ToastProvider>
      <Providers>
        <App />
      </Providers>
    </ToastProvider>
  );
}
