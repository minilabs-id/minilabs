// MiniLabs — SSG minim: hub + halaman detail proyek + sitemap + robots.
// Zero-dependency (node:fs/path). Baca projects.ts → generate site/.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { PROJECTS } from "./projects.ts"
import { type DocPage, fetchProjectDocs } from "./docs.ts"

const root = import.meta.dir
const site = join(root, "site")
const base = "https://minilabs.id"

rmSync(site, { recursive: true, force: true })
mkdirSync(site, { recursive: true })

function write(rel: string, content: string): void {
  const dest = join(site, rel)
  mkdirSync(join(dest, ".."), { recursive: true })
  writeFileSync(dest, content, "utf8")
}

// ── Chrome halaman ──────────────────────────────────────────────────────
function layout(opts: {
  title: string
  desc: string
  canon: string
  ogTitle: string
  body: string
}): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${opts.title}</title>
<meta name="description" content="${opts.desc}" />
<link rel="canonical" href="${opts.canon}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="MiniLabs" />
<meta property="og:title" content="${opts.ogTitle}" />
<meta property="og:description" content="${opts.desc}" />
<meta property="og:url" content="${opts.canon}" />
<meta property="og:image" content="${base}/logo.svg" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="${opts.ogTitle}" />
<meta name="twitter:description" content="${opts.desc}" />
<meta name="theme-color" content="#f6f5f0" />
<link rel="icon" type="image/svg+xml" href="/logo.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/styles.css" />
</head>
<body>
<a class="skip-link" href="#main">Lewati ke konten</a>
<div class="page">
${header()}
<main id="main">${opts.body}</main>
${footer()}
</div>
<script src="/app.js" defer></script>
</body>
</html>`
}

function header(withNav = true): string {
  return `<header class="site-header">
  <a class="brand" href="/" aria-label="MiniLabs — beranda">
    <img src="/logo.svg" alt="MiniLabs" class="logo" width="1536" height="1024" />
  </a>
  ${withNav ? `<nav class="nav" aria-label="Navigasi utama">
    <a href="/#proyek">Proyek</a>
    <a href="/#tentang">Tentang</a>
  </nav>` : ""}
</header>`
}

function footer(): string {
  return `<footer class="site-footer">
  <span class="footer__brand">MINILABS&nbsp;©&nbsp;2026</span>
  <span class="footer__tagline">Exploring ideas. Engineering possibilities.</span>
</footer>`
}

const statusLabel: Record<string, string> = {
  live: "Live",
  beta: "Beta",
  planned: "Planned",
}

// ── Hub ─────────────────────────────────────────────────────────────────
const cards = PROJECTS.map(
  (p) => `
  <a class="card" href="/projects/${p.slug}/">
    <div class="card__head">
      <span class="card__name">${p.name}</span>
      <span class="status status--${p.status}">${statusLabel[p.status]}</span>
    </div>
    <p class="card__tagline">${p.tagline}</p>
  </a>`,
).join("\n")

const hub = layout({
  title: "MiniLabs — Exploring ideas. Engineering possibilities.",
  desc: "MiniLabs adalah studio untuk mengeksplorasi kemungkinan dan membangun produk teknologi: MiniCode, MiniBug, MiniBot, MiniWord.",
  canon: `${base}/`,
  ogTitle: "MiniLabs — Ideas are meant to be built.",
  body: `
  <section class="hero" id="top">
    <h1 class="hero-title">Ideas are meant<br />to be built.</h1>
    <p class="hero-sub" data-reveal>Studio untuk mengeksplorasi kemungkinan, meracik ide, dan membangun produk teknologi.</p>
  </section>
  <section class="section" id="proyek" aria-label="Proyek">
    <div class="section__aside">
      <span class="section__index">01</span>
      <span class="section__label">Proyek</span>
    </div>
    <div class="section__body">
      <h2 class="section__title">Dibangun di sini.</h2>
      <div class="grid">${cards}</div>
    </div>
  </section>
  <section class="section" id="tentang" aria-label="Tentang">
    <div class="section__aside">
      <span class="section__index">02</span>
      <span class="section__label">Tentang</span>
    </div>
    <div class="section__body">
      <h2 class="section__title">Tentang MiniLabs</h2>
      <div class="editorial" data-reveal>
        <p>MiniLabs adalah ruang untuk mengeksplorasi kemungkinan, meracik ide, bereksperimen dengan teknologi, dan membangun sesuatu yang sebelumnya hanya ada dalam pikiran.</p>
        <p>Dari coding agent hingga alat bug bounty — setiap proyek lahir di sini, dengan dokumentasi yang ikut ter-update setiap kali kodenya berubah.</p>
      </div>
    </div>
  </section>`,
})
write("index.html", hub)

// ── Halaman detail per proyek ───────────────────────────────────────────
for (const p of PROJECTS) {
  const highlights =
    p.highlights && p.highlights.length
      ? `<ul class="highlights">${p.highlights.map((h) => `<li>${h}</li>`).join("\n")}</ul>`
      : ""
  const detail = layout({
    title: `${p.name} — MiniLabs`,
    desc: p.tagline,
    canon: `${base}/projects/${p.slug}/`,
    ogTitle: `${p.name} — ${p.tagline}`,
    body: `
    <article class="project">
      <a class="back" href="/">← MiniLabs</a>
      <header class="project__head">
        <h1 class="project__name">${p.name}</h1>
        <span class="status status--${p.status}">${statusLabel[p.status]}</span>
      </header>
      <p class="project__tagline">${p.tagline}</p>
      <div class="project__overview">
        <p>${p.overview}</p>
      </div>
      ${highlights}
      ${p.repo ? `<p class="project__repo"><a href="https://github.com/${p.repo}" rel="noopener">github.com/${p.repo}</a> · <a href="/projects/${p.slug}/docs/">Dokumentasi</a></p>` : ""}
    </article>`,
  })
  write(`projects/${p.slug}/index.html`, detail)
}

// ── Dokumentasi per proyek (fetch + render dari repo sumber) ──────────────
// Sumber docs = repo proyek (`docs/`); build mengklon dangkal lalu merender.
// Gagal fetch (offline/build pertama) = degrade jujur: halaman detail tetap
// tampil tanpa dokumen.
const docUrls: string[] = []
for (const p of PROJECTS) {
  if (!p.repo) continue
  const pages = await fetchProjectDocs({
    repo: p.repo,
    docsDir: "docs",
    cacheDir: join(root, ".docs-cache"),
  })
  if (pages.length === 0) continue

  // Indeks docs
  const indexBody = `
    <article class="project project--docs">
      <a class="back" href="/projects/${p.slug}/">← ${p.name}</a>
      <h1 class="project__name">${p.name} — Dokumentasi</h1>
      <ul class="doclist">
        ${pages
          .map(
            (d) => `<li><a href="/projects/${p.slug}/docs/${d.name}/">${d.title}</a></li>`,
          )
          .join("\n")}
      </ul>
    </article>`
  write(
    `projects/${p.slug}/docs/index.html`,
    layout({
      title: `${p.name} — Dokumentasi`,
      desc: `Dokumentasi ${p.name}.`,
      canon: `${base}/projects/${p.slug}/docs/`,
      ogTitle: `${p.name} — Dokumentasi`,
      body: indexBody,
    }),
  )
  docUrls.push(`${base}/projects/${p.slug}/docs/`)

  // Tiap dokumen
  for (const d of pages) {
    const body = `
      <article class="project project--docs">
        <a class="back" href="/projects/${p.slug}/docs/">← Dokumentasi</a>
        <h1 class="project__name project__name--doc">${d.title}</h1>
        <div class="docs">${d.html}</div>
      </article>`
    write(
      `projects/${p.slug}/docs/${d.name}/index.html`,
      layout({
        title: `${d.title} — ${p.name}`,
        desc: `Dokumentasi ${p.name}: ${d.title}.`,
        canon: `${base}/projects/${p.slug}/docs/${d.name}/`,
        ogTitle: `${d.title} — ${p.name}`,
        body,
      }),
    )
    docUrls.push(`${base}/projects/${p.slug}/docs/${d.name}/`)
  }
}

// ── sitemap + robots ────────────────────────────────────────────────────
const now = new Date().toISOString().slice(0, 10)
const urls = [`${base}/`, ...PROJECTS.map((p) => `${base}/projects/${p.slug}/`), ...docUrls]
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map((u) => `<url><loc>${u}</loc><lastmod>${now}</lastmod></url>`).join("") +
    `</urlset>`,
)
write(
  "robots.txt",
  `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`,
)

// llms.txt — indeks untuk AI/agent yang browsing (konvensi llmstxt.org).
write(
  "llms.txt",
  [
    "# MiniLabs",
    "",
    "> Studio untuk mengeksplorasi kemungkinan dan membangun produk teknologi.",
    "",
    "## Proyek",
    ...PROJECTS.map((p) => `- [${p.name}](${base}/projects/${p.slug}/): ${p.tagline}`),
    ...docUrls.map((u) => `- [Dokumentasi](${u})`),
    "",
  ].join("\n"),
)

// ── aset statis ─────────────────────────────────────────────────────────
for (const f of ["styles.css", "app.js", "logo.svg", "CNAME"]) {
  cpSync(join(root, f), join(site, f))
}

console.log(`[minilabs-build] ${urls.length} halaman -> site/`)