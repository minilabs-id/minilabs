// MiniLabs — SSG minim: hub + halaman detail proyek + dokumen, bilingual (id/en).
// Zero-dependency (node:fs/path). Baca projects.ts + copy.ts → generate site/.
// Konten proyek (docs) = single source bahasa sumber (Indonesia), dirender sekali
// di namespace id; chrome situs (hub + halaman proyek) dibuat untuk id dan en.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { PROJECTS, type Project } from "./projects.ts"
import { type DocPage, fetchProjectDocs } from "./docs.ts"
import { CHROME, LANGS, type Lang } from "./copy.ts"

const root = import.meta.dir
const site = join(root, "site")
const base = "https://minilabs.id"

// Identitas brand (Bahasa Inggris, sama di semua locale).
const HERO_KICKER = "Independent studio · open source"
const HERO_TITLE = `Ideas are meant<br />to be built.`
const FOOTER_TAGLINE = "Exploring ideas. Engineering possibilities."
const statusLabel = { live: "Live", beta: "Beta", planned: "Planned" } as const
const ORG = "https://github.com/startupmini"

rmSync(site, { recursive: true, force: true })
mkdirSync(site, { recursive: true })

function write(rel: string, content: string): void {
  const dest = join(site, rel)
  mkdirSync(join(dest, ".."), { recursive: true })
  writeFileSync(dest, content, "utf8")
}

const prefix = (l: Lang): string => (l === "en" ? "en/" : "")
const href = (l: Lang, rel: string): string => `/${prefix(l)}${rel}`
const homeUrl = (l: Lang): string => `/${prefix(l)}`

// ── Chrome halaman ──────────────────────────────────────────────────────
function layout(opts: {
  lang: Lang
  rel: string
  title: string
  desc: string
  body: string
  /** true → tampilkan switcher bahasa + hreflang alternates (halaman situs). */
  isSite?: boolean
}): string {
  const { lang, rel, title, desc, body, isSite = false } = opts
  const canon = `${base}${href(lang, rel)}`
  const alts = isSite
    ? LANGS.map(
        (L) =>
          `<link rel="alternate" hreflang="${L.code}" href="${base}${href(L.code, rel)}" />`,
      ).join("\n") + `\n<link rel="alternate" hreflang="x-default" href="${base}${href("id", rel)}" />`
    : ""
  const htmlLang = LANGS.find((L) => L.code === lang)?.htmlLang ?? "id"
  return `<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<meta name="description" content="${desc}" />
<link rel="canonical" href="${canon}" />
${alts}
<meta property="og:type" content="website" />
<meta property="og:site_name" content="MiniLabs" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:url" content="${canon}" />
<meta property="og:image" content="${base}/logo.svg" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${desc}" />
<meta name="theme-color" content="#f6f5f0" />
<link rel="icon" type="image/svg+xml" href="/logo.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/styles.css" />
</head>
<body>
<a class="skip-link" href="#main">${lang === "en" ? "Skip to content" : "Lewati ke konten"}</a>
<div class="page">
${header(lang, rel, isSite)}
<main id="main">${body}</main>
${footer()}
</div>
<script src="/app.js" defer></script>
</body>
</html>`
}

function header(lang: Lang, rel: string, showLang: boolean): string {
  const t = CHROME[lang]
  const switcher = showLang
    ? `<span class="lang-switch" aria-label="Language">
        ${LANGS.map((L) => {
          const active = L.code === lang ? " is-active" : ""
          return `<a class="lang${active}" href="${href(L.code, rel)}" hreflang="${L.code}">${L.label}</a>`
        }).join("")}
      </span>`
    : ""
  return `<header class="site-header">
  <a class="brand" href="${homeUrl(lang)}" aria-label="MiniLabs — beranda">
    <img src="/logo.svg" alt="MiniLabs" class="logo" width="1536" height="1024" />
  </a>
  <nav class="nav" aria-label="Navigasi utama">
    <a href="${homeUrl(lang)}#proyek">${t.navProjects}</a>
    <a href="${homeUrl(lang)}#tentang">${t.navAbout}</a>
    ${switcher}
  </nav>
</header>`
}

function footer(): string {
  return `<footer class="site-footer">
  <span class="footer__brand">MINILABS&nbsp;©&nbsp;2026</span>
  <span class="footer__tagline">${FOOTER_TAGLINE}</span>
</footer>`
}

// ── Seksi halaman detail ────────────────────────────────────────────────
function detailSections(p: Project, lang: Lang): string {
  const t = CHROME[lang]
  const c = p.content[lang]
  const sections: Array<{ id: string; title: string; body: string }> = []

  if (c.install && c.install.length) {
    const steps = c.install
      .map(
        (s) => `
        <li class="step">
          <span class="step__label">${s.label}</span>
          ${s.command ? `<pre class="step__code"><code>${s.command}</code></pre>` : ""}
        </li>`,
      )
      .join("")
    const note = c.installNote ? `<p class="step__note">${c.installNote}</p>` : ""
    sections.push({
      id: "instalasi",
      title: t.installTitle,
      body: `<p class="pblock__intro">${t.installIntro}</p><ol class="steps">${steps}</ol>${note}`,
    })
  } else if (c.plannedNote) {
    sections.push({
      id: "status",
      title: t.statusTitle,
      body: `<p class="planned-note">${c.plannedNote}</p>`,
    })
  }

  if (c.highlights && c.highlights.length) {
    const isLive = p.status === "live"
    sections.push({
      id: isLive ? "kemampuan" : "rencana",
      title: isLive ? t.capabilitiesTitle : t.roadmapTitle,
      body: `<ul class="highlights">${c.highlights.map((h) => `<li>${h}</li>`).join("")}</ul>`,
    })
  }

  if (p.repo) {
    const docsHref = `${href("id", `projects/${p.slug}/docs/`)}` // docs = single source (id)
    sections.push({
      id: "sumber",
      title: t.sourceTitle,
      body: `<p class="pblock__intro">${t.sourceIntro}</p>
        <p class="project__links">
          <a class="btn" href="https://github.com/${p.repo}" rel="noopener">${t.githubCta}</a>
          <a class="btn btn--ghost" href="${docsHref}">${t.docsCta}${t.docsCtaNote}</a>
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

const urls: string[] = []

// ── Hub + halaman detail (id + en) ──────────────────────────────────────
const liveCount = PROJECTS.filter((p) => p.status === "live").length
const plannedCount = PROJECTS.length - liveCount

for (const L of LANGS) {
  const lang = L.code
  const t = CHROME[lang]
  const home = homeUrl(lang)

  // Hub
  const cards = PROJECTS.map(
    (p) => `
  <a class="card" href="${href(lang, `projects/${p.slug}/`)}">
    <div class="card__head">
      <span class="card__name">${p.name}</span>
      <span class="status status--${p.status}">${statusLabel[p.status]}</span>
    </div>
    <p class="card__tagline">${p.content[lang].tagline}</p>
  </a>`,
  ).join("\n")

  const aboutMeta = t.aboutMeta
    .replace("{total}", String(PROJECTS.length))
    .replace("{live}", String(liveCount))
    .replace("{planned}", String(plannedCount))

  const hubBody = `
  <section class="hero" id="top">
    <p class="hero__kicker" data-reveal>${HERO_KICKER}</p>
    <h1 class="hero-title">${HERO_TITLE}</h1>
    <p class="hero-sub" data-reveal>${t.heroSub}</p>
    <div class="hero__cta" data-reveal>
      <a class="btn" href="${href(lang, "projects/minicode/")}">${t.heroCtaPrimary}</a>
      <a class="btn btn--ghost" href="#proyek">${t.heroCtaSecondary}</a>
    </div>
  </section>
  <section class="section" id="proyek" aria-label="${t.projectsLabel}">
    <div class="section__aside">
      <span class="section__index">01</span>
      <span class="section__label">${t.projectsLabel}</span>
    </div>
    <div class="section__body">
      <h2 class="section__title">${t.projectsTitle}</h2>
      <div class="grid">${cards}</div>
    </div>
  </section>
  <section class="section" id="tentang" aria-label="${t.aboutLabel}">
    <div class="section__aside">
      <span class="section__index">02</span>
      <span class="section__label">${t.aboutLabel}</span>
    </div>
    <div class="section__body">
      <h2 class="section__title">${t.aboutTitle}</h2>
      <div class="editorial" data-reveal>
        <p>${t.aboutP1}</p>
        <p>${t.aboutP2}</p>
      </div>
      <ol class="principles" data-reveal>
        ${t.aboutPrinciples.map((pr) => `<li>${pr}</li>`).join("")}
      </ol>
      <p class="about__meta">${aboutMeta}</p>
      <p class="about__cta">
        <a class="btn" href="${ORG}" rel="noopener">${t.aboutCta}</a>
      </p>
    </div>
  </section>`

  write(`${prefix(lang)}index.html`, layout({ lang, rel: "", title: t.homeTitle, desc: t.homeDesc, body: hubBody, isSite: true }))
  urls.push(`${base}${href(lang, "")}`)

  // Detail per proyek
  for (const [index, p] of PROJECTS.entries()) {
    const c = p.content[lang]
    const rel = `projects/${p.slug}/`
    const detailBody = `
    <article class="project">
      <a class="back" href="${home}">${t.backToLabs}</a>
      <header class="project__hero">
        <span class="project__eyebrow">${t.projectEyebrow} ${String(index + 1).padStart(2, "0")}</span>
        <div class="project__title-row">
          <h1 class="project__name">${p.name}</h1>
          <span class="status status--${p.status}">${statusLabel[p.status]}</span>
        </div>
        <p class="project__tagline">${c.tagline}</p>
      </header>
      <div class="project__lede" data-reveal>
        <p>${c.overview}</p>
      </div>
      ${detailSections(p, lang)}
    </article>`
    write(
      `${prefix(lang)}${rel}index.html`,
      layout({ lang, rel, title: `${p.name} — MiniLabs`, desc: c.tagline, body: detailBody, isSite: true }),
    )
    urls.push(`${base}${href(lang, rel)}`)
  }
}

// ── Dokumentasi per proyek (id saja — konten bahasa sumber) ──────────────
for (const p of PROJECTS) {
  if (!p.repo) continue
  const pages = await fetchProjectDocs({
    repo: p.repo,
    docsDir: "docs",
    cacheDir: join(root, ".docs-cache"),
  })
  if (pages.length === 0) continue

  const t = CHROME.id
  const docsRel = `projects/${p.slug}/docs/`
  const docsIndexBody = `
    <article class="project project--docs">
      <a class="back" href="${homeUrl("id")}">← MiniLabs</a>
      <h1 class="project__name project__name--doc">${p.name} — ${t.docsIndexTitle}</h1>
      <ul class="doclist">
        ${pages.map((d) => `<li><a href="${href("id", `${docsRel}${d.name}/`)}">${d.title}</a></li>`).join("\n")}
      </ul>
    </article>`
  write(
    `${docsRel}index.html`,
    layout({ lang: "id", rel: docsRel, title: `${p.name} — ${t.docsIndexTitle}`, desc: `${t.docsIndexTitle} ${p.name}.`, body: docsIndexBody }),
  )
  urls.push(`${base}${href("id", docsRel)}`)

  for (const d of pages) {
    const rel = `${docsRel}${d.name}/`
    const docBody = `
      <article class="project project--docs">
        <a class="back" href="${href("id", docsRel)}">${t.docsBack}</a>
        <h1 class="project__name project__name--doc">${d.title}</h1>
        <div class="docs">${d.html}</div>
      </article>`
    write(
      `${rel}index.html`,
      layout({ lang: "id", rel, title: `${d.title} — ${p.name}`, desc: `${t.docsIndexTitle} ${p.name}: ${d.title}.`, body: docBody }),
    )
    urls.push(`${base}${href("id", rel)}`)
  }
}

// ── sitemap + robots + llms ─────────────────────────────────────────────
const now = new Date().toISOString().slice(0, 10)
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
write(
  "llms.txt",
  [
    "# MiniLabs",
    "",
    "> An independent studio building focused open-source tools.",
    "",
    "## Projects",
    ...PROJECTS.map((p) => `- [${p.name}](${base}${href("id", `projects/${p.slug}/`)}): ${p.content.id.tagline}`),
    ...PROJECTS.map((p) => `- [${p.name} (EN)](${base}${href("en", `projects/${p.slug}/`)}): ${p.content.en.tagline}`),
    ...urls.filter((u) => u.includes("/docs/")).map((u) => `- [Documentation](${u})`),
    "",
  ].join("\n"),
)

// ── aset statis ─────────────────────────────────────────────────────────
for (const f of ["styles.css", "app.js", "logo.svg", "CNAME"]) {
  cpSync(join(root, f), join(site, f))
}

console.log(`[minilabs-build] ${urls.length} halaman -> site/`)