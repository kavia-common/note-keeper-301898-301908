Ocean Notes Frontend

Features:
- CRUD notes with inline editor and debounced autosave
- Search/filter and sort by updated time
- API backend if REACT_APP_API_BASE or REACT_APP_BACKEND_URL is set and feature flags allow; otherwise localStorage
- Offline-friendly: on API failure, operates on local cache and retries later
- Healthcheck indicator if REACT_APP_HEALTHCHECK_PATH is set
- Ocean Professional theme: primary #2563EB, secondary #F59E0B, error #EF4444, background #f9fafb, surface #ffffff, text #111827

Environment variables:
- REACT_APP_API_BASE, REACT_APP_BACKEND_URL, REACT_APP_FRONTEND_URL, REACT_APP_WS_URL, REACT_APP_NODE_ENV, REACT_APP_NEXT_TELEMETRY_DISABLED, REACT_APP_ENABLE_SOURCE_MAPS, REACT_APP_PORT, REACT_APP_TRUST_PROXY, REACT_APP_LOG_LEVEL, REACT_APP_HEALTHCHECK_PATH, REACT_APP_FEATURE_FLAGS, REACT_APP_EXPERIMENTS_ENABLED

Notes:
- To enable backend usage, set REACT_APP_API_BASE to your REST endpoint, e.g., https://api.example.com
- To force local only, clear REACT_APP_API_BASE and REACT_APP_BACKEND_URL or remove 'use_api' from REACT_APP_FEATURE_FLAGS
