// TEMPORAL — se borra al terminar.
import { readFileSync } from "node:fs";
import { createServerClient } from "@supabase/ssr";

const S =
  "C:/Users/facul/AppData/Local/Temp/claude/C--Users-facul-espacio-cortinas-web/3e959b64-4397-41f9-9ac2-34da212420fb/scratchpad";

const crudo = readFileSync("./.env.local", "utf8").replace(/^\uFEFF/, "");
const env = Object.fromEntries(
  crudo
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.trimStart().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const URL_CRUDA = env.NEXT_PUBLIC_SUPABASE_URL;
console.log("URL en .env.local:", JSON.stringify(URL_CRUDA));
console.log("¿barra final?:", /\/$/.test(URL_CRUDA));

const BASE = URL_CRUDA.replace(/\/+$/, "");
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const jar = new Map();
const sb = createServerClient(BASE, ANON, {
  cookies: {
    getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
    setAll: (l) => l.forEach(({ name, value }) => jar.set(name, value)),
  },
});

const { data, error } = await sb.auth.signInWithPassword({
  email: "prueba-no-autorizado@example.com",
  password: readFileSync(`${S}/clave-prueba.txt`, "utf8").trim(),
});
if (error) { console.log("login err:", error.message); process.exit(1); }

const token = data.session.access_token;

// 1. Llamada directa al endpoint que usa getUser(), desde esta máquina.
console.log("\n=== GET /auth/v1/user directo ===");
const r1 = await fetch(`${BASE}/auth/v1/user`, {
  headers: { apikey: ANON, Authorization: `Bearer ${token}` },
});
const b1 = await r1.json().catch(() => ({}));
console.log("  HTTP", r1.status, "| user:", b1.email ?? JSON.stringify(b1).slice(0, 160));

// 2. La misma llamada pero con DOBLE BARRA, que es lo que produciría una URL
//    con barra final sin limpiar.
console.log("\n=== GET //auth/v1/user (simula barra final) ===");
const r2 = await fetch(`${BASE}//auth/v1/user`, {
  headers: { apikey: ANON, Authorization: `Bearer ${token}` },
});
const b2 = await r2.json().catch(() => ({}));
console.log("  HTTP", r2.status, "|", JSON.stringify(b2).slice(0, 160));

// 3. getUser() del cliente, desde esta máquina.
console.log("\n=== supabase.auth.getUser() desde esta máquina ===");
const g = await sb.auth.getUser();
console.log("  user:", g.data.user?.email ?? "null", "| error:", g.error?.message ?? "ninguno");
