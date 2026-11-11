// Setup Cloudflare CDN untuk GitHub Pages — idempoten, aman dijalankan ulang.
//
//   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ZONE=minilabs.id bun cloudflare/setup.ts
//   ... bun cloudflare/setup.ts --dry-run    # cetak rencana, tanpa mengubah apa pun
//
// Token butuh izin:
//   Zone → Cache Rules → Edit
//   Zone → Zone Settings → Edit
//   Zone → Zone → Read            (resolusi ID zona)
//
// Yang diubah: Cache Rule aset (TTL 1 tahun) + setelan Brotli/HTTP3/HTTPS/HSTS/
// Early Hints. DNS dan nameserver TIDAK disentuh — itu langkah manual sekali
// jalan, lihat cloudflare/README.md.

const API = "https://api.cloudflare.com/client/v4"

const token = process.env.CLOUDFLARE_API_TOKEN
const zoneName = process.env.CLOUDFLARE_ZONE ?? "minilabs.id"
const dryRun = process.argv.includes("--dry-run")

if (!token) {
  console.error("[cdn] CLOUDFLARE_API_TOKEN belum diset. Lihat cloudflare/README.md.")
  process.exit(1)
}

const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }

class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
    readonly detail: string,
  ) {
    super(`${path} → ${status} ${detail}`)
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { ...init, headers })
  const body = (await res.json()) as {
    success: boolean
    result: T
    errors?: Array<{ message: string }>
  }
  if (!res.ok || !body.success) {
    throw new ApiError(res.status, path, JSON.stringify(body.errors ?? []))
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
  console.error(
    `[cdn] Zona ${zoneName} belum ada di akun ini.\n` +
      `      Pindahkan nameserver domain ke Cloudflare dulu — lihat cloudflare/README.md.`,
  )
  process.exit(1)
}
console.log(`[cdn] zona ${zone.name} (${zone.id}) status=${zone.status}`)

// ── Cache Rule untuk aset ───────────────────────────────────────────────
// Hanya aset yang punya `?v=<hash>` (atau semua isi /fonts/) yang boleh 1 tahun:
// URL-nya berubah bila isi berkas berubah, jadi tidak ada risiko basi.
// HTML dan berkas lain dibiarkan pada perilaku default (Cloudflare tidak
// meng-cache HTML; GitHub Pages sudah punya cache 600 detik sendiri).
const LONG = 31_536_000
const DESCRIPTION = "MiniLabs: aset immutable (fonts, app.js, logo, og)"
const EXPRESSION =
  `(starts_with(http.request.uri.path, "/fonts/")) or ` +
  `(http.request.uri.path eq "/app.js") or ` +
  `(http.request.uri.path eq "/logo.svg") or ` +
  `(http.request.uri.path matches "^/og\\.(png|jpe?g|webp)$")`

interface CacheRule {
  id?: string
  description?: string
  expression: string
  action: "set_cache_settings"
  action_parameters: {
    cache: boolean
    edge_ttl: { mode: "override_origin"; default: number }
    browser_ttl: { mode: "override_origin"; default: number }
  }
  enabled: boolean
}

const rule: CacheRule = {
  description: DESCRIPTION,
  expression: EXPRESSION,
  action: "set_cache_settings",
  action_parameters: {
    cache: true,
    edge_ttl: { mode: "override_origin", default: LONG },
    browser_ttl: { mode: "override_origin", default: LONG },
  },
  enabled: true,
}

const entrypoint = `/zones/${zone.id}/rulesets/phases/http_request_cache_settings/entrypoint`

interface Ruleset {
  id: string
  rules: CacheRule[]
}

let existing: CacheRule[] = []
try {
  existing = (await call<Ruleset>(entrypoint)).rules ?? []
} catch (err) {
  // 404 = fase ini belum punya ruleset; 403 = token tanpa izin Cache Rules.
  if (err instanceof ApiError && err.status === 403) {
    console.error(
      `[cdn] token tidak punya izin Cache Rules (403).\n` +
        `      Tambahkan scope "Zone → Cache Rules → Edit" pada token, atau setel\n` +
        `      Cache Rule manual di dashboard (lihat cloudflare/README.md).`,
    )
    process.exit(1)
  }
  if (!(err instanceof ApiError && err.status === 404)) throw err
}

const isOurs = (r: CacheRule) => r.description?.startsWith("MiniLabs:")
const mine = existing.find(isOurs)
const others = existing.filter((r) => !isOurs(r))
const merged = [...(mine ? [{ ...mine, ...rule, id: mine.id }] : [rule]), ...others]

if (dryRun) {
  console.log("[cdn] --dry-run, tidak ada perubahan. Cache rules yang akan dikirim:")
  console.log(JSON.stringify(merged, null, 2))
  process.exit(0)
}

await call(entrypoint, { method: "PUT", body: JSON.stringify({ rules: merged }) })
console.log(`[cdn] cache rule aset aktif (${merged.length} aturan total, ${others.length} lain dipertahankan)`)

// ── Setelan zona ────────────────────────────────────────────────────────
const settings: Array<[string, unknown]> = [
  ["brotli", "on"],
  ["http3", "on"],
  ["always_use_https", "on"],
  ["early_hints", "on"],
  [
    "security_header",
    {
      strict_transport_security: {
        enabled: true,
        max_age: 31_536_000,
        include_subdomains: true,
        preload: false,
        nosniff: true,
      },
    },
  ],
  // Origin GitHub menyajikan sertifikat valid untuk minilabs.id.
  ["ssl", "strict"],
]

for (const [id, value] of settings) {
  try {
    await call(`/zones/${zone.id}/settings/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ value }),
    })
    console.log(`[cdn] ${id} = ${typeof value === "string" ? value : "diperbarui"}`)
  } catch (err) {
    console.warn(`[cdn] lewati ${id}: ${(err as Error).message}`)
  }
}

console.log("[cdn] selesai. Verifikasi: curl -sI https://minilabs.id/app.js | grep -i cache")
