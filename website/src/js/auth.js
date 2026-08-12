/**
 * LINK auth: Firebase (email/password + Google) when configured,
 * otherwise a clearly labeled local demo auth in localStorage.
 */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from "firebase/auth";
import { getFirebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const SESSION_KEY = "LINK_AUTH_SESSION_V1";
const USERS_KEY = "LINK_DEMO_USERS_V1";
const AUTH_EVENT = "link:authchange";

/** Seeded course demo — no Register required. Separate from CDP session key. */
const SEEDED_DEMO = {
  ids: new Set(["kent", "kent@link.demo"]),
  email: "kent@link.demo",
  password: "2026",
  displayName: "Kent",
};

/** @typedef {{ uid: string, email: string, displayName: string, photoURL?: string|null, provider: 'password'|'google'|'demo-google', mode: 'firebase'|'demo' }} LinkUser */

let firebaseAuth = null;
let mode = "demo";
let currentUser = /** @type {LinkUser|null} */ (null);
let readyPromise = null;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => {
    try {
      fn(currentUser);
    } catch {
      /* ignore listener errors */
    }
  });
  window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { user: currentUser } }));
}

function setUser(user) {
  currentUser = user;
  if (user && mode === "demo") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else if (!user && mode === "demo") {
    localStorage.removeItem(SESSION_KEY);
  }
  notify();
}

function loadDemoUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDemoUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/** Lightweight non-crypto hash for demo passwords only — not security. */
async function hashDemoPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  if (crypto?.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback for rare environments without subtle crypto
  let h = 0;
  const s = `${salt}:${password}`;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return `fallback_${h}`;
}

function uidFromEmail(email) {
  return `demo_${btoa(unescape(encodeURIComponent(email.toLowerCase()))).replace(/=+/g, "")}`;
}

function mapFirebaseUser(user) {
  if (!user) return null;
  const provider =
    user.providerData?.[0]?.providerId === "google.com" ? "google" : "password";
  return {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || user.email?.split("@")[0] || "LINK member",
    photoURL: user.photoURL || null,
    provider,
    mode: "firebase",
  };
}

function readDemoSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (!user?.uid || !user?.email) return null;
    return { ...user, mode: "demo" };
  } catch {
    return null;
  }
}

export function getAuthMode() {
  return mode;
}

export function isAuthReady() {
  return readyPromise;
}

export function getCurrentUser() {
  return currentUser;
}

export function onAuthChange(fn) {
  listeners.add(fn);
  // Do not invoke immediately — mountChrome already renders the current user.
  // Immediate invoke races initInteractions and drops drawer/logout wiring.
  return () => listeners.delete(fn);
}

export async function initAuth() {
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    if (isFirebaseConfigured()) {
      mode = "firebase";
      const app = initializeApp(getFirebaseConfig());
      firebaseAuth = getAuth(app);
      await new Promise((resolve) => {
        const unsub = onAuthStateChanged(firebaseAuth, (user) => {
          setUser(mapFirebaseUser(user));
          unsub();
          resolve();
        });
      });
      onAuthStateChanged(firebaseAuth, (user) => setUser(mapFirebaseUser(user)));
    } else {
      mode = "demo";
      setUser(readDemoSession());
    }
    return currentUser;
  })();

  return readyPromise;
}

export async function registerWithEmail(email, password, displayName) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const name = String(displayName || "").trim() || cleanEmail.split("@")[0];
  if (!cleanEmail || !password || password.length < 6) {
    throw new Error("Enter a valid email and a password of at least 6 characters.");
  }

  if (mode === "firebase" && firebaseAuth) {
    const cred = await createUserWithEmailAndPassword(firebaseAuth, cleanEmail, password);
    if (name) await updateProfile(cred.user, { displayName: name });
    setUser(mapFirebaseUser({ ...cred.user, displayName: name }));
    return currentUser;
  }

  const users = loadDemoUsers();
  if (users[cleanEmail]) throw new Error("An account with this email already exists.");
  const salt = crypto.randomUUID?.() || String(Date.now());
  const passwordHash = await hashDemoPassword(password, salt);
  users[cleanEmail] = { salt, passwordHash, displayName: name, createdAt: Date.now() };
  saveDemoUsers(users);
  setUser({
    uid: uidFromEmail(cleanEmail),
    email: cleanEmail,
    displayName: name,
    photoURL: null,
    provider: "password",
    mode: "demo",
  });
  return currentUser;
}

function normalizeDemoLoginId(value) {
  const v = String(value || "").trim().toLowerCase();
  if (v === "kent") return SEEDED_DEMO.email;
  return v;
}

export async function loginWithEmail(email, password) {
  const raw = String(email || "").trim().toLowerCase();
  const cleanEmail = normalizeDemoLoginId(raw);
  if (!raw || !password) throw new Error("Enter your email and password.");

  if (mode === "firebase" && firebaseAuth) {
    const cred = await signInWithEmailAndPassword(firebaseAuth, cleanEmail, password);
    setUser(mapFirebaseUser(cred.user));
    return currentUser;
  }

  // Seeded course credentials (kent / 2026) — works without Register.
  if (SEEDED_DEMO.ids.has(raw) || SEEDED_DEMO.ids.has(cleanEmail)) {
    if (password !== SEEDED_DEMO.password) throw new Error("Incorrect password.");
    setUser({
      uid: uidFromEmail(SEEDED_DEMO.email),
      email: SEEDED_DEMO.email,
      displayName: SEEDED_DEMO.displayName,
      photoURL: null,
      provider: "password",
      mode: "demo",
    });
    return currentUser;
  }

  const users = loadDemoUsers();
  const record = users[cleanEmail];
  if (!record) throw new Error("No demo account found — try Register first.");
  const passwordHash = await hashDemoPassword(password, record.salt);
  if (passwordHash !== record.passwordHash) throw new Error("Incorrect password.");
  setUser({
    uid: uidFromEmail(cleanEmail),
    email: cleanEmail,
    displayName: record.displayName || cleanEmail.split("@")[0],
    photoURL: null,
    provider: "password",
    mode: "demo",
  });
  return currentUser;
}

/**
 * Google sign-in. With Firebase: real Google popup.
 * Without Firebase: does NOT call Google — either throws a configure message
 * or, when `allowDemo` is true, creates a labeled local demo Google session.
 */
export async function loginWithGoogle({ allowDemo = true } = {}) {
  if (mode === "firebase" && firebaseAuth) {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const cred = await signInWithPopup(firebaseAuth, provider);
    setUser(mapFirebaseUser(cred.user));
    return currentUser;
  }

  if (!allowDemo) {
    throw new Error("Configure Firebase to enable Google sign-in.");
  }

  const email = "demo.google@link.local";
  setUser({
    uid: "demo_google_somsri",
    email,
    displayName: "Demo Google · Somsri",
    photoURL: null,
    provider: "demo-google",
    mode: "demo",
  });
  return currentUser;
}

export async function logout() {
  if (mode === "firebase" && firebaseAuth) {
    await signOut(firebaseAuth);
  }
  setUser(null);
}

export function requireAuth(redirectTo = "/login.html") {
  return initAuth().then((user) => {
    if (!user) {
      const next = encodeURIComponent(
        `${window.location.pathname}${window.location.search}${window.location.hash}`
      );
      window.location.replace(`${redirectTo}?next=${next}`);
      return null;
    }
    return user;
  });
}

export function initialsFor(user) {
  const name = user?.displayName || user?.email || "?";
  const parts = name.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
