import { getHealthcheckUrl } from "../utils/env";

// PUBLIC_INTERFACE
export async function checkHealth() {
  /** Perform basic health check and return {status: 'ok'|'degraded'|'down'|'unknown', details?} */
  const url = getHealthcheckUrl();
  if (!url) return { status: "unknown" };
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) return { status: "ok" };
    if (res.status >= 500) return { status: "down" };
    return { status: "degraded" };
  } catch {
    return { status: "down" };
  }
}
