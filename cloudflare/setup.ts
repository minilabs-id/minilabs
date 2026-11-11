// Setup Cloudflare CDN untuk GitHub Pages — idempoten, aman dijalankan ulang.
//
//   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ZONE=minilabs.id bun cloudflare/setup.ts
//
// Token butuh: Zone → Cache Rules → Edit, Zone → Zone Settings → Edit.
// (Zone → Read juga, untuk resolusi ID zona.)
//
// Yang diatur: Cache Rules (aset immutable, HTML ikut origin), Brotli, HTTP/3,
// Always Use HTTPS, HSTS, Early Hints, dan redirect www → apex.
// DNS/nameserver TIDAK disentuh — itu langkah manual sekali jalan (lihat README).

const API = "https://api.cloudflare.com/client/v4"

const token = process.env.CLOUDFLARE_API_TOKEN
const zoneName = process.env.CLOUDFLARE_ZONE ?? "minilabs.id"

if (!token) {
  console.error("CLOUDFLARE_API_TOKEN belum diset. Lihat cloudflare/README.md.")
  process.exit(1)
}

const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { ...init, headers })
  const body = (await res.json()) as { success: boolean; result: T; errors?: Array<{ message: string }> }
  if (!res.ok || !body.success) {
    throw new Error(`${init?.method ?? "GET"} ${path} → ${res.status} ${JSON.stringify(body.errors)}`)
  }
  return body.result
}

// ── Zona ────────────────────────────────────────────────────────────────
interface Zone {
  id: string
  name: string
  status: string
}
const zones = await call<Zone[]>(`/zones?name=${encodeURIComponent(zoneName)}`)
const zone = zones[0]
if (!zone) {
  console.error(`Zona ${zoneName} tidak ada di akun ini. Pindahkan DNS ke Cloudflare dulu (cloudflare/README.md).`)
  process.exit(1)
}
console.log(`[cdn] zona ${zone.name} (${zone.id}) status=${zone.status}`)

// ── Cache Rules ─────────────────────────────────────────────────────────
interface CacheRule {
  id?: string
  description?: string
  expression: string
  action: "set_cache_settings"
  action_parameters: {
    cache: boolean
    edge_ttl: { mode: "override_origin" | "respect_origin"; default: number }
    browser_ttl?: { mode: "override_origin"; default: number }
  }
  enabled: boolean
}

const LONG = 31_536_000 // 1 tahun
const HTML_TTL = 600 // sama dengan origin GitHub Pages

// Urutan penting: aturan aset lebih spesifik, jadi didaftarkan lebih dulu.
const wanted: CacheRule[] = [
  {
    description: "MiniLabs: aset immutable (fonts, app.js, logo, og)",
    // `?v=<hash>` menjamin perubahan berkas = URL baru, jadi aman 1 tahun.
    expression:
      `(starts_with(http.request.uri.path, "/fonts/")) or ` +
      `(http.request.uri.path eq "/app.js") or ` +
      `(http.request.uri.path eq "/logo.svg") or ` +
      `(http.request.uri.path matches "^/og\\.(png|jpe?g|webp)$")`,
    action: "set_cache_settings",
    action_parameters: {
      cache: true,
      edge_ttl: { mode: "override_origin", default: LONG },
      browser_ttl: { mode: "override_origin", default: LONG },
    },
    enabled: true,
  },
  {
    description: "MiniLabs: HTML revalidasi (edge ikut origin)",
    expression:
      `(http.request.uri.path eq "/") or ` +
      `(ends_with(http.request.uri.path, "/")) or ` +
      `(http.request.uri.path matches "^/(.*\\.html)$")`,
    action: "set_cache_settings",
    action_parameters: {
      cache: true,
      edge_ttl: { mode: "override_origin", default: HTML_TTL },
      browser_ttl: { mode: "override_origin", default: 0 },
    },
    enabled: true,
  },
]

const entrypoint = `/zones/${zone.id}/rulesets/phases/http_request_cache_settings/entrypoint`
interface Ruleset {
  id: string
  rules: CacheRule[]
}

let current: Ruleset | null = null
try {
  current = await call<Ruleset>(entrypoint)
} catch (err) {
  // 404 = belum ada ruleset fase ini; buat baru lewat PUT.
  if (!String(err).includes("404")) throw err
}

const existing = current?.rules ?? []
const byDescription = new Map(existing.map((r) => [r.description, r]))
// Pertahankan aturan yang bukan milik script ini.
const foreign = existing.filter((r) => !r.description?.startsWith("MiniLabs:"))
const merged = [...wanted, ...foreign].map((r) => {
  const prev = byDescription.get(r.description)
  return prev ? { ...prev, ...r, id: prev.id } : r
})

await call(entrypoint, {
  method: "PUT",
  body: JSON.stringify({ rules: merged }),
})
console.log(`[cdn] cache rules: ${wanted.length} diatur, ${foreign.length} aturan lain dipertahankan`)

// ── Setelan zona ────────────────────────────────────────────────────────
const settings: Array<[string, string | number]> = [
  ["brotli", "on"],
  ["http3", "on"],
  ["always_use_https", "on"],
  ["early_hints", "on"],
  ["security_header", JSON.stringify({ strict_transport_security: { enabled: true, max_age: 31_536_000, include_subdomains: true, preload: true, nosniff: true } })],
  // SSL ketat: origin GitHub menyajikan sertifikat valid untuk minilabs.id.
  ["ssl", "strict"],
]

for (const [id, value] of settings) {
  try {
    await call(`/zones/${zone.id}/settings/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ value }),
    })
    console.log(`[cdn] setelan ${id} = ${value}`)
  } catch (err) {
    console.warn(`[cdn] lewati ${id}: ${(err as Error).message}`)
  }
}

// ── Redirect www → apex ─────────────────────────────────────────────────
// Satu-satunya Record dengan pola redirect (Dynamic Redirect / Bulk) butuh
// akun-level config; gunakan Redirect Rule zona bila tersedia.
try {
  const redirects = await call<{ rules: unknown[] }>(
    `/zones/${zone.id}/rulesets/phases/http_request_dynamic_redirect/entrypoint`,
  ).catch(() => ({ rules: [] }))
  const others = (redirects.rules ?? []).filter(
    (r) => !(r as { description?: string }).description?.startsWith("MiniLabs:"),
  )
  await call(`/zones/${zone.id}/rulesets/phases/http_request_dynamic_redirect/entrypoint`, {
    method: "PUT",
    body: JSON.stringify({
      rules: [
        {
          description: "MiniLabs: www → apex",
          expression: `(http.host eq "www.${zone.name}")`,
          action: "redirect",
          action_parameters: {
            from_value: { status_code: 301, target_url: { expression: `concat("https://${zone.name}", http.request.uri.path)` }, preserve_query_string: true },
          },
          enabled: true,
        },
        ...others,
      ],
    }),
  })
  console.log("[cdn] redirect www → apex aktif")
} catch (err) {
  console.warn(`[cdn] lewati redirect www: ${(err as Error).message}`)
}

console.log("[cdn] selesai. Verifikasi: curl -sI https://minilabs.id/app.js | grep -i cache")
