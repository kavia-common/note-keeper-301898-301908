const env = {
  API_BASE: process.env.REACT_APP_API_BASE,
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
  FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL,
  WS_URL: process.env.REACT_APP_WS_URL,
  NODE_ENV: process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV,
  NEXT_TELEMETRY_DISABLED: process.env.REACT_APP_NEXT_TELEMETRY_DISABLED,
  ENABLE_SOURCE_MAPS: process.env.REACT_APP_ENABLE_SOURCE_MAPS,
  PORT: process.env.REACT_APP_PORT,
  TRUST_PROXY: process.env.REACT_APP_TRUST_PROXY,
  LOG_LEVEL: process.env.REACT_APP_LOG_LEVEL || "info",
  HEALTHCHECK_PATH: process.env.REACT_APP_HEALTHCHECK_PATH || "/health",
  FEATURE_FLAGS: process.env.REACT_APP_FEATURE_FLAGS || "",
  EXPERIMENTS_ENABLED: process.env.REACT_APP_EXPERIMENTS_ENABLED || "false",
};

// PUBLIC_INTERFACE
export function getBackendBaseUrl() {
  /** Resolve backend base URL from multiple env vars, or null. */
  const base =
    env.API_BASE?.trim() ||
    env.BACKEND_URL?.trim() ||
    "";
  try {
    if (!base) return null;
    const u = new URL(base, window.location.href);
    return u.toString().replace(/\/+$/, "");
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function backendEnabled() {
  /** Determine whether to use API backend based on env and feature flags. */
  const base = getBackendBaseUrl();
  const flags = (env.FEATURE_FLAGS || "").toLowerCase();
  const allowApi = flags.includes("use_api") || !!base;
  return !!base && allowApi;
}

// PUBLIC_INTERFACE
export function getHealthcheckUrl() {
  /** Build healthcheck URL if backend present; otherwise null. */
  const base = getBackendBaseUrl();
  if (!base) return null;
  const path = (env.HEALTHCHECK_PATH || "/health").replace(/^\/?/, "");
  return `${base}/${path}`;
}

// PUBLIC_INTERFACE
export function telemetryDisabled() {
  /** Honor REACT_APP_NEXT_TELEMETRY_DISABLED to disable telemetry. */
  return String(env.NEXT_TELEMETRY_DISABLED || "1") !== "0";
}

export default env;
