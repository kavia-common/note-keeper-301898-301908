import React, { useEffect, useState } from "react";
import { checkHealth } from "../services/HealthService";

// PUBLIC_INTERFACE
export default function Header() {
  /** App header with title and backend health indicator. */
  const [health, setHealth] = useState({ status: "unknown" });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const h = await checkHealth();
      if (mounted) setHealth(h);
    })();
    const id = setInterval(async () => {
      const h = await checkHealth();
      setHealth(h);
    }, 15000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const statusClass = {
    ok: "ok",
    degraded: "degraded",
    down: "down",
    unknown: "unknown",
  }[health.status || "unknown"];

  return (
    <div className="header">
      <div className="header-inner">
        <div className="brand" aria-label="Notes application">
          <div className="brand-mark" aria-hidden="true" />
          <div>
            <div>Ocean Notes</div>
            <div className="small">Create, organize, and edit your notes</div>
          </div>
        </div>
        <div className="health" aria-label={`Backend status: ${health.status}`}>
          <span className={`dot ${statusClass}`} aria-hidden="true" />
          <span>Backend: {health.status}</span>
        </div>
      </div>
    </div>
  );
}
