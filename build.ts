// MiniLabs — SSG minim: hub + halaman detail proyek + sitemap + robots.
// Zero-dependency (node:fs/path). Baca projects.ts → generate site/.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { PROJECTS, type Project } from "./projects.ts"
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
const liveCount = PROJECTS.filter((p) => p.status === "live").length
const plannedCount = PROJECTS.length - liveCount

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
        <p>MiniLabs adalah studio open source yang membangun alat kecil yang fokus dan bisa diaudit — satu ide, satu proyek, tanpa menggembungkan fitur. Semua berbagi fondasi yang sama: kernel MiniCore.</p>
        <p>Coding agent, bug bounty, sampai CMS — yang menyatukannya bukan kategori, melainkan pendekatan: dependency seminim mungkin, dokumentasi yang jujur, dan antarmuka yang mereda.</p>
      </div>
      <ol class="principles" data-reveal>
        <li><strong>Zero-dependency</strong> — tanpa runtime pihak ketiga; permukaan audit kecil, install cepat.</li>
        <li><strong>Jujur &amp; terukur</strong> — batas dan kegagalan dilaporkan apa adanya, bukan klaim.</li>
        <li><strong>Dokumentasi hidup</strong> — manual ditulis di repo, dirender otomatis di sini saat kode berubah.</li>
        <li><strong>Minimalis monokrom</strong> — hitam di atas krem; desain yang mereda agar karyanya yang bicara.</li>
      </ol>
      <p class="about__meta">${PROJECTS.length} proyek — ${liveCount} aktif, ${plannedCount} dalam perencanaan.</p>
      <p class="about__cta">
        <a class="btn" href="https://github.com/startupmini" rel="noopener">GitHub ↗</a>
      </p>
    </div>
  </section>`,
})
write("index.html", hub)

// ── Halaman detail per proyek ───────────────────────────────────────────
// Detail = hero (nama + status + tagline) → lede (overview) → seksi-seksi
// bernomor (instalasi / status, kemampuan/rencana, sumber & dokumentasi).
function detailSections(p: Project): string {
  const sections: Array<{ id: string; title: string; body: string }> = []

  if (p.install && p.install.length) {
    const steps = p.install
      .map(
        (s) => `
        <li class="step">
          <span class="step__label">${s.label}</span>
          ${s.command ? `<pre class="step__code"><code>${s.command}</code></pre>` : ""}
        </li>`,
      )
      .join("")
    const note = p.installNote ? `<p class="step__note">${p.installNote}</p>` : ""
    sections.push({
      id: "instalasi",
      title: "Instalasi",
      body: `<p class="pblock__intro">Dari nol ke prompt pertama dalam beberapa langkah.</p><ol class="steps">${steps}</ol>${note}`,
    })
  } else if (p.plannedNote) {
    sections.push({
      id: "status",
      title: "Status",
      body: `<p class="planned-note">${p.plannedNote}</p>`,
    })
  }

  if (p.highlights && p.highlights.length) {
    const live = p.status === "live"
    sections.push({
      id: live ? "kemampuan" : "rencana",
      title: live ? "Kemampuan" : "Rencana",
      body: `<ul class="highlights">${p.highlights.map((h) => `<li>${h}</li>`).join("")}</ul>`,
    })
  }

  if (p.repo) {
    sections.push({
      id: "sumber",
      title: "Sumber & dokumentasi",
      body: `<p class="pblock__intro">Kode, rilis, dan manual lengkap satu klik dari sini.</p>
        <p class="project__links">
          <a class="btn" href="https://github.com/${p.repo}" rel="noopener">GitHub ↗</a>
          <a class="btn btn--ghost" href="/projects/${p.slug}/docs/">Dokumentasi →</a>
        </p>`,
    })
  }

  return sections
    .map(
      (s, i) => `
    <section class="pblock" id="${s.id}">
      <h2 class="pblock__title"><span class="pblock__index">${String(i + 1).padStart(2, "0")}</span>${s.title}</h2>
      ${s.body}
    </section>`,
    )
    .join("")
}

for (const [index, p] of PROJECTS.entries()) {
  const num = String(index + 1).padStart(2, "0")
  const detail = layout({
    title: `${p.name} — MiniLabs`,
    desc: p.tagline,
    canon: `${base}/projects/${p.slug}/`,
    ogTitle: `${p.name} — ${p.tagline}`,
    body: `
    <article class="project">
      <a class="back" href="/">← MiniLabs</a>
      <header class="project__hero">
        <span class="project__eyebrow">Proyek ${num}</span>
        <div class="project__title-row">
          <h1 class="project__name">${p.name}</h1>
          <span class="status status--${p.status}">${statusLabel[p.status]}</span>
        </div>
        <p class="project__tagline">${p.tagline}</p>
      </header>
      <div class="project__lede" data-reveal>
        <p>${p.overview}</p>
      </div>
      ${detailSections(p)}
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