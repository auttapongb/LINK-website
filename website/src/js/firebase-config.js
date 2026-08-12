/**
 * Firebase client config from Vite env.
 * Copy `.env.example` → `.env` and fill VITE_FIREBASE_* to enable real Auth.
 * Without keys, `auth.js` uses the local demo fallback (no Google servers).
 */

const KEYS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
];

function readEnv(name) {
  const value = import.meta.env[name];
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("YOUR_") || trimmed === "REPLACE_ME") return "";
  return trimmed;
}

export function getFirebaseConfig() {
  const config = {
    apiKey: readEnv("VITE_FIREBASE_API_KEY"),
    authDomain: readEnv("VITE_FIREBASE_AUTH_DOMAIN"),
    projectId: readEnv("VITE_FIREBASE_PROJECT_ID"),
    appId: readEnv("VITE_FIREBASE_APP_ID"),
    storageBucket: readEnv("VITE_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: readEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  };
  return config;
}

export function isFirebaseConfigured() {
  const config = getFirebaseConfig();
  return KEYS.every((key) => {
    const field = key.replace("VITE_FIREBASE_", "");
    const camel =
      field === "API_KEY"
        ? "apiKey"
        : field === "AUTH_DOMAIN"
          ? "authDomain"
          : field === "PROJECT_ID"
            ? "projectId"
            : field === "APP_ID"
              ? "appId"
              : null;
    return camel ? Boolean(config[camel]) : true;
  });
}
