// Smoke test + validator output build — zero-dependency (`bun check.ts`).
// Menjalankan build, lalu memeriksa: file wajib, manifest ARD/ai-catalog,
// struktur HTML (lang, satu <h1>, hook no-JS), link internal, dan sitemap.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

const root = import.meta.dir
const site = join(root, "site")

const failures: string[] = []
const fail = (msg: string) => failures.push(msg)

// ── 1. Build ─────────────────────────────────────────────────────────────
const build = Bun.spawnSync(["bun", join(root, "build.ts")], { cwd: root, stdout: "pipe", stderr: "pipe" })
if (build.exitCode !== 0) {
  console.error(build.stdout?.toString())
  console.error(build.stderr?.toString())
  console.error("[check] build GAGAL")
  process.exit(1)
}

// ── 2. File wajib ────────────────────────────────────────────────────────
const required = [
  "index.html",
  "en/index.html",
  "404.html",
  "sitemap.xml",
  "robots.txt",
  "llms.txt",
  ".nojekyll",
  "app.js",
  "logo.svg",
  "fonts/space-grotesk-var.woff2",
  "fonts/ibm-plex-mono-400.woff2",
  "fonts/ibm-plex-mono-500.woff2",
  "CNAME",
  ".well-known/ard.json",
  ".well-known/ai-catalog.json",
]
for (const f of required) {
  if (!existsSync(join(site, f))) fail(`file wajib hilang: site/${f}`)
}

// ── 3. Manifest ARD + ai-catalog ─────────────────────────────────────────
const URN = /^urn:air:[a-zA-Z0-9.-]+(:[a-zA-Z0-9._-]+)+$/

function checkEntries(label: string, entries: unknown): void {
  if (!Array.isArray(entries) || entries.length === 0) {
    fail(`${label}: "entries" harus array tidak kosong`)
    return
  }
  entries.forEach((raw, i) => {
    if (typeof raw !== "object" || raw === null) return fail(`${label}: entri[${i}] bukan objek`)
    const e = raw as Record<string, unknown>
    if (typeof e.identifier !== "string" || !URN.test(e.identifier)) {
      fail(`${label}: entri[${i}].identifier tidak cocok pola urn:air (: ${String(e.identifier)})`)
    }
    for (const req of ["displayName", "type"]) {
      if (typeof e[req] !== "string" || !(e[req] as string).length) {
        fail(`${label}: entri[${i}].${req} wajib string non-kosong`)
      }
    }
    const hasUrl = typeof e.url === "string"
    const hasData = typeof e.data === "object" && e.data !== null
    if (hasUrl === hasData) fail(`${label}: entri[${i}] harus punya tepat satu dari url/data`)
    if (hasUrl && !/^https?:\/\//.test(e.url as string)) {
      fail(`${label}: entri[${i}].url bukan URL http(s)`)
    }
    if (Array.isArray(e.representativeQueries)) {
      const n = (e.representativeQueries as unknown[]).length
      if (n < 2 || n > 5) fail(`${label}: entri[${i}].representativeQueries harus 2–5 (ada ${n})`)
    } else {
      fail(`${label}: entri[${i}].representativeQueries disarankan (min 2)`)
    }
  })
}

function readJson(p: string): any {
  try {
    return JSON.parse(readFileSync(join(site, p), "utf8"))
  } catch (err) {
    fail(`${p}: JSON tidak valid (${(err as Error).message})`)
    return null
  }
}

// ard.json
{
  const ard = readJson(".well-known/ard.json")
  if (ard) {
    checkEntries("ard.json", ard.entries)
    if (!ard["@context"]) fail("ard.json: @context disarankan (§4.1)")
  }
}
// ai-catalog.json — schema: additionalProperties=false, wajib specVersion "1.0".
{
  const cat = readJson(".well-known/ai-catalog.json")
  if (cat) {
    if (cat.specVersion !== "1.0") fail(`ai-catalog.json: specVersion harus "1.0" (ada ${cat.specVersion})`)
    const allowed = new Set(["specVersion", "host", "entries"])
    for (const k of Object.keys(cat)) {
      if (!allowed.has(k)) fail(`ai-catalog.json: properti "${k}" tidak diizinkan (additionalProperties: false)`)
    }
    if (cat.host && typeof cat.host.displayName !== "string") fail("ai-catalog.json: host.displayName wajib")
    checkEntries("ai-catalog.json", cat.entries)
  }
}

// ── 4. HTML: lang, satu <h1>, hook no-JS, rel=ard, link internal ─────────
function* htmlFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) yield* htmlFiles(full)
    else if (entry.name.endsWith(".html")) yield full
  }
}

function targetExists(urlPath: string): boolean {
  const clean = urlPath.replace(/^\//, "")
  const candidates = clean === "" || clean.endsWith("/") ? [`${clean}index.html`] : [clean, `${clean}/index.html`]
  return candidates.some((c) => existsSync(join(site, c)))
}

let htmlCount = 0
const seenLinks = new Set<string>()
for (const file of htmlFiles(site)) {
  htmlCount++
  const rel = file.slice(site.length + 1).replace(/\\/g, "/")
  const html = readFileSync(file, "utf8")

  if (!/<html lang="[a-z-]+"/.test(html)) fail(`${rel}: <html lang> hilang`)
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length
  if (h1 !== 1) fail(`${rel}: harus tepat satu <h1> (ada ${h1})`)
  if (!html.includes('classList.add("js")')) fail(`${rel}: hook no-JS (html.js) hilang`)
  if (!html.includes('rel="ard"')) fail(`${rel}: <link rel="ard"> hilang`)
  if (!html.includes("<title>") || !html.includes('name="description"')) {
    fail(`${rel}: <title>/description hilang`)
  }

  for (const m of html.matchAll(/(?:href|src)="([^"]*)"/g)) {
    const link = m[1]!
    if (!link.startsWith("/") || link.startsWith("//")) continue
    const path = link.split("#")[0]!.split("?")[0]!
    seenLinks.add(path)
    if (!targetExists(path)) fail(`${rel}: link internal rusak → ${link}`)
  }
}

// ── 5. sitemap + robots ──────────────────────────────────────────────────
{
  const xml = readFileSync(join(site, "sitemap.xml"), "utf8")
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!)
  if (locs.length === 0) fail("sitemap.xml: tidak ada <loc>")
  if (/<lastmod>/.test(xml)) fail("sitemap.xml: <lastmod> build-date membingungkan crawler")
  for (const loc of locs) {
    const p = loc.replace("https://minilabs.id", "")
    if (!targetExists(p || "/")) fail(`sitemap.xml: ${loc} tidak punya halaman`)
  }
}
{
  const robots = readFileSync(join(site, "robots.txt"), "utf8")
  if (!robots.includes("Sitemap: https://minilabs.id/sitemap.xml")) fail("robots.txt: Sitemap hilang")
  // Directive tak dikenal (mis. "Agentmap:") membuat validator menolak file.
  // Hanya directive standar yang boleh aktif; sisanya harus jadi komentar.
  for (const line of robots.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    if (!/^(User-agent|Allow|Disallow|Sitemap|Crawl-delay):/i.test(trimmed)) {
      fail(`robots.txt: directive tidak dikenal → ${trimmed}`)
    }
  }
}

// ── Ringkasan ────────────────────────────────────────────────────────────
if (failures.length) {
  console.error(`\n[check] ${failures.length} masalah:`)
  for (const f of failures) console.error("  ✗ " + f)
  process.exit(1)
}
console.log(
  `[check] ok — ${htmlCount} halaman HTML, ${seenLinks.size} link internal unik, manifest ARD valid.`,
)
