// MiniLabs — SSG minim: hub + halaman detail proyek + dokumen, bilingual (id/en).
// Zero-dependency (node:fs/path). Baca projects.ts + copy.ts → generate site/.
// Konten proyek (docs) = single source bahasa sumber (Indonesia), dirender sekali
// di namespace id; chrome situs (hub + halaman proyek) dibuat untuk id dan en.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { createHash } from "node:crypto"
import { dirname, join } from "node:path"
import { PROJECTS, type Project } from "./projects.ts"
import { type DocPage, fetchProjectDocs } from "./docs.ts"
import { CHROME, LANGS, type Lang } from "./copy.ts"
import {
  AI_CATALOG_PATH,
  ARD_PATH,
  SITE_BASE as base,
  buildAiCatalogManifest,
  buildArdManifest,
  entryCount,
} from "./catalog.ts"

const root = import.meta.dir
const site = join(root, "site")

// CSS di-inline ke <head> tiap halaman: menghapus permintaan stylesheet yang
// render-blocking sekaligus satu RTT pada jalur kritis pertama. Berkasnya kecil
// (dan mengompres baik), jadi menukar cache lintas-halaman dengan FCP lebih cepat
// adalah trade-off yang tepat untuk skor mobile.

// Aset yang disajikan dengan `Cache-Control: immutable` (lihat `_headers`) perlu
// sidik jari di URL supaya perubahan berkas langsung terpakai. Versi = hash isi.
const version = (rel: string): string =>
  createHash("sha256").update(readFileSync(join(root, rel))).digest("hex").slice(0, 10)
const assetUrl = (rel: string): string => `/${rel}?v=${version(rel)}`
const fontUrl = (file: string): string => assetUrl(`fonts/${file}`)
const appJsUrl = assetUrl("app.js")
const logoUrl = assetUrl("logo.svg")
// Dimensi intrinsik logo (dari viewBox) untuk atribut width/height pada <img>:
// memberi rasio aspek yang benar sebelum gambar dimuat (mencegah CLS), dan tetap
// sinkron otomatis bila logo.svg berubah.
const logoSize = (() => {
  const m = /viewBox="\s*-?[\d.]+ -?[\d.]+ ([\d.]+) ([\d.]+)"/.exec(
    readFileSync(join(root, "logo.svg"), "utf8"),
  )
  if (!m) return null
  const w = Math.round(Number(m[1]))
  const h = Math.round(Number(m[2]))
  return Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0 ? { w, h } : null
})()

const stylesCss = readFileSync(join(root, "styles.css"), "utf8").replace(
  /\/fonts\/([\w.-]+\.woff2)/g,
  (_, file: string) => fontUrl(file),
)

// Identitas brand (Bahasa Inggris, sama di semua locale). Kicker hero
// dilokalisasi lewat copy.ts (`heroKicker`).
const HERO_TITLE = `Ideas are meant<br />to be built.`
const FOOTER_TAGLINE = "Exploring ideas. Engineering possibilities."
const statusLabel = { live: "Live", beta: "Beta", planned: "Planned" } as const
const ORG = "https://github.com/minilabs-id"

// og:image butuh raster (banyak platform mengabaikan SVG). Pakai `og.*` bila ada,
// jika tidak jatuh balik ke logo SVG.
const OG_CANDIDATES = ["og.png", "og.jpg", "og.jpeg", "og.webp"]
const ogFile = OG_CANDIDATES.find((f) => existsSync(join(root, f)))
const ogImage = ogFile ? `${base}/${ogFile}?v=${version(ogFile)}` : `${base}${logoUrl}`

rmSync(site, { recursive: true, force: true })
mkdirSync(site, { recursive: true })

function write(rel: string, content: string): void {
  const dest = join(site, rel)
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, content, "utf8")
}

/** Escape untuk simpul teks (konten/copy dianggap teks biasa, bukan HTML). */
const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
/** Escape untuk nilai atribut. */
const escAttr = (s: string): string => esc(s).replace(/"/g, "&quot;")

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
  /** true → jangan indeks (mis. 404) + tanpa canonical. */
  noindex?: boolean
}): string {
  const { lang, rel, title, desc, body, isSite = false, noindex = false } = opts
  const canon = `${base}${href(lang, rel)}`
  const alts = isSite
    ? LANGS.map(
        (L) =>
          `<link rel="alternate" hreflang="${L.code}" href="${base}${href(L.code, rel)}" />`,
      ).join("\n") + `\n<link rel="alternate" hreflang="x-default" href="${base}${href("id", rel)}" />`
    : ""
  const htmlLang = LANGS.find((L) => L.code === lang)?.htmlLang ?? "id"
  const t = CHROME[lang]
  return `<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escAttr(title)}</title>
<meta name="description" content="${escAttr(desc)}" />
${noindex ? `<meta name="robots" content="noindex" />\n` : ""}<link rel="canonical" href="${canon}" />
${alts}
<link rel="ard" href="${ARD_PATH}" />
<link rel="ai-catalog" href="${AI_CATALOG_PATH}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="MiniLabs" />
<meta property="og:locale" content="${htmlLang === "en" ? "en_US" : "id_ID"}" />
<meta property="og:title" content="${escAttr(title)}" />
<meta property="og:description" content="${escAttr(desc)}" />
<meta property="og:url" content="${canon}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:image:alt" content="${escAttr(t.ogImageAlt)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escAttr(title)}" />
<meta name="twitter:description" content="${escAttr(desc)}" />
<meta name="twitter:image" content="${ogImage}" />
<meta name="theme-color" content="#f6f5f0" />
<link rel="icon" type="image/svg+xml" href="${logoUrl}" />
<link rel="preload" href="${fontUrl("space-grotesk-var.woff2")}" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="${fontUrl("ibm-plex-mono-500.woff2")}" as="font" type="font/woff2" crossorigin />
<style>${stylesCss}</style>
<script>document.documentElement.classList.add("js")</script>
</head>
<body>
<a class="skip-link" href="#main">${esc(t.skipLink)}</a>
<div class="page">
${header(lang, rel, isSite)}
<main id="main">${body}</main>
${footer()}
</div>
<script src="${appJsUrl}" defer></script>
</body>
</html>`
}

function header(lang: Lang, rel: string, showLang: boolean): string {
  const t = CHROME[lang]
  const switcher = showLang
    ? `<nav class="lang-switch" aria-label="${escAttr(t.langLabel)}">
        ${LANGS.map((L) => {
          const active = L.code === lang
          return `<a class="lang${active ? " is-active" : ""}" href="${href(L.code, rel)}" hreflang="${L.code}"${active ? ' aria-current="page"' : ""}>${L.label}</a>`
        }).join("")}
      </nav>`
    : ""
  return `<header class="site-header">
  <a class="brand" href="${homeUrl(lang)}" aria-label="${escAttr(t.brandLabel)}">
    <img src="${logoUrl}" alt="MiniLabs" class="logo"${logoSize ? ` width="${logoSize.w}" height="${logoSize.h}"` : ""} />
  </a>
  <nav class="nav" aria-label="${escAttr(t.navLabel)}">
    <a href="${homeUrl(lang)}#proyek">${esc(t.navProjects)}</a>
    <a href="${homeUrl(lang)}#tentang">${esc(t.navAbout)}</a>
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
          <span class="step__label">${esc(s.label)}</span>
          ${s.command ? `<pre class="step__code"><code>${esc(s.command)}</code></pre>` : ""}
        </li>`,
      )
      .join("")
    const note = c.installNote ? `<p class="step__note">${esc(c.installNote)}</p>` : ""
    sections.push({
      id: t.anchorInstall,
      title: t.installTitle,
      body: `<p class="pblock__intro">${esc(t.installIntro)}</p><ol class="steps">${steps}</ol>${note}`,
    })
  } else if (c.plannedNote) {
    sections.push({
      id: t.anchorStatus,
      title: t.statusTitle,
      body: `<p class="planned-note">${esc(c.plannedNote)}</p>`,
    })
  }

  if (c.highlights && c.highlights.length) {
    const isLive = p.status === "live"
    sections.push({
      id: isLive ? t.anchorCapabilities : t.anchorRoadmap,
      title: isLive ? t.capabilitiesTitle : t.roadmapTitle,
      body: `<ul class="highlights">${c.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>`,
    })
  }

  if (p.repo) {
    const docsHref = `${href("id", `projects/${p.slug}/docs/`)}` // docs = single source (id)
    sections.push({
      id: t.anchorSource,
      title: t.sourceTitle,
      body: `<p class="pblock__intro">${esc(t.sourceIntro)}</p>
        <p class="project__links">
          <a class="btn" href="https://github.com/${p.repo}" rel="noopener">${esc(t.githubCta)}</a>
          <a class="btn btn--ghost" href="${docsHref}">${esc(t.docsCta)}${esc(t.docsCtaNote)}</a>
        </p>`,
    })
  }

  return sections
    .map(
      (s, i) => `
    <section class="pblock" id="${escAttr(s.id)}">
      <h2 class="pblock__title"><span class="pblock__index">${String(i + 1).padStart(2, "0")}</span>${esc(s.title)}</h2>
      ${s.body}
    </section>`,
    )
    .join("")
}

const urls: string[] = []
/** Tautan dokumentasi bertajuk (untuk llms.txt) — judul lebih berguna daripada URL telanjang. */
const docLinks: string[] = []

// ── Hub + halaman detail (id + en) ──────────────────────────────────────
const liveCount = PROJECTS.filter((p) => p.status === "live").length
const plannedCount = PROJECTS.length - liveCount
const featured = PROJECTS.find((p) => p.status === "live" && p.repo) ?? PROJECTS[0]!

for (const L of LANGS) {
  const lang = L.code
  const t = CHROME[lang]
  const home = homeUrl(lang)

  // Hub
  const cards = PROJECTS.map(
    (p) => `
  <a class="card" href="${href(lang, `projects/${p.slug}/`)}">
    <div class="card__head">
      <span class="card__name">${esc(p.name)}</span>
      <span class="status status--${p.status}">${statusLabel[p.status]}</span>
    </div>
    <p class="card__tagline">${esc(p.content[lang].tagline)}</p>
  </a>`,
  ).join("\n")

  const aboutMeta = esc(
    t.aboutMeta
      .replace("{total}", String(PROJECTS.length))
      .replace("{live}", String(liveCount))
      .replace("{planned}", String(plannedCount)),
  )

  const hubBody = `
  <section class="hero" id="top">
    <p class="hero__kicker" data-reveal>${esc(t.heroKicker)}</p>
    <h1 class="hero-title">${HERO_TITLE}</h1>
    <p class="hero-sub" data-reveal>${esc(t.heroSub)}</p>
    <div class="hero__cta" data-reveal>
      <a class="btn" href="${href(lang, `projects/${featured.slug}/`)}">${esc(t.heroCtaPrimary.replace("{name}", featured.name))}</a>
      <a class="btn btn--ghost" href="#proyek">${esc(t.heroCtaSecondary)}</a>
    </div>
  </section>
  <section class="section" id="proyek" aria-label="${escAttr(t.projectsLabel)}">
    <div class="section__aside">
      <span class="section__index">01</span>
      <span class="section__label">${esc(t.projectsLabel)}</span>
    </div>
    <div class="section__body">
      <h2 class="section__title">${esc(t.projectsTitle)}</h2>
      <div class="grid">${cards}</div>
    </div>
  </section>
  <section class="section" id="tentang" aria-label="${escAttr(t.aboutLabel)}">
    <div class="section__aside">
      <span class="section__index">02</span>
      <span class="section__label">${esc(t.aboutLabel)}</span>
    </div>
    <div class="section__body">
      <h2 class="section__title">${esc(t.aboutTitle)}</h2>
      <div class="editorial" data-reveal>
        <p>${esc(t.aboutP1)}</p>
        <p>${esc(t.aboutP2)}</p>
      </div>
      <ol class="principles" data-reveal>
        ${t.aboutPrinciples.map((pr) => `<li>${esc(pr)}</li>`).join("")}
      </ol>
      <p class="about__meta">${aboutMeta}</p>
      <p class="about__cta">
        <a class="btn" href="${ORG}" rel="noopener">${esc(t.aboutCta)}</a>
      </p>
    </div>
  </section>`

  write(
    `${prefix(lang)}index.html`,
    layout({ lang, rel: "", title: t.homeTitle, desc: t.homeDesc, body: hubBody, isSite: true }),
  )
  urls.push(`${base}${href(lang, "")}`)

  // Detail per proyek
  for (const [index, p] of PROJECTS.entries()) {
    const c = p.content[lang]
    const rel = `projects/${p.slug}/`
    const detailBody = `
    <article class="project">
      <a class="back" href="${home}">${esc(t.backToLabs)}</a>
      <header class="project__hero">
        <span class="project__eyebrow">${esc(t.projectEyebrow)} ${String(index + 1).padStart(2, "0")}</span>
        <div class="project__title-row">
          <h1 class="project__name">${esc(p.name)}</h1>
          <span class="status status--${p.status}">${statusLabel[p.status]}</span>
        </div>
        <p class="project__tagline">${esc(c.tagline)}</p>
      </header>
      <div class="project__lede" data-reveal>
        <p>${esc(c.overview)}</p>
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
    slug: p.slug,
    docsDir: "docs",
    cacheDir: join(root, ".docs-cache"),
  })
  if (pages.length === 0) continue

  const t = CHROME.id
  const docsRel = `projects/${p.slug}/docs/`
  const docsIndexBody = `
    <article class="project project--docs">
      <a class="back" href="${homeUrl("id")}">${esc(t.backToLabs)}</a>
      <h1 class="project__name project__name--doc">${esc(p.name)} — ${esc(t.docsIndexTitle)}</h1>
      <ul class="doclist">
        ${pages.map((d) => `<li><a href="${href("id", `${docsRel}${d.name}/`)}">${esc(d.title)}</a></li>`).join("\n")}
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
        <a class="back" href="${href("id", docsRel)}">${esc(t.docsBack)}</a>
        <h1 class="project__name project__name--doc">${esc(d.title)}</h1>
        <div class="docs">${d.html}</div>
      </article>`
    write(
      `${rel}index.html`,
      layout({ lang: "id", rel, title: `${d.title} — ${p.name}`, desc: `${t.docsIndexTitle} ${p.name}: ${d.title}.`, body: docBody }),
    )
    urls.push(`${base}${href("id", rel)}`)
    docLinks.push(`- [${p.name}: ${d.title}](${base}${href("id", rel)})`)
  }
}

// ── Manifest discovery ARD (Agentic Resource Discovery) ─────────────────
// Path kanonik + path pendahulu (lihat catalog.ts).
write(ARD_PATH.replace(/^\//, ""), buildArdManifest())
write(AI_CATALOG_PATH.replace(/^\//, ""), buildAiCatalogManifest())

// ── 404 ─────────────────────────────────────────────────────────────────
{
  const t = CHROME.id
  const body = `
    <article class="project project--docs">
      <h1 class="project__name project__name--doc">${esc(t.notFoundHeading)}</h1>
      <p class="planned-note">${esc(t.notFoundBody)}</p>
      <p class="project__links">
        <a class="btn" href="/">${esc(t.notFoundCta)}</a>
        <a class="btn btn--ghost" href="/en/">English</a>
      </p>
    </article>`
  write(
    "404.html",
    layout({ lang: "id", rel: "404.html", title: t.notFoundTitle, desc: t.notFoundBody, body, noindex: true }),
  )
}

// ── sitemap + robots + llms ─────────────────────────────────────────────
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map((u) => `<url><loc>${u}</loc></url>`).join("") +
    `</urlset>`,
)
write(
  "robots.txt",
  `User-agent: *\nAllow: /\n\n# ARD (Agentic Resource Discovery) manifest (referenced from each page's <link rel="ard">).\n# ${base}${ARD_PATH}\n\nSitemap: ${base}/sitemap.xml\n`,
)
write(
  "llms.txt",
  [
    "# MiniLabs",
    "",
    "> An independent laboratory for experiments in making things.",
    "",
    "## Projects",
    ...PROJECTS.map((p) => `- [${p.name}](${base}${href("id", `projects/${p.slug}/`)}): ${p.content.id.tagline}`),
    ...PROJECTS.map((p) => `- [${p.name} (EN)](${base}${href("en", `projects/${p.slug}/`)}): ${p.content.en.tagline}`),
    ...docLinks,
    "",
    "## Discovery",
    `- [ARD manifest](${base}${ARD_PATH})`,
    `- [AI catalog](${base}${AI_CATALOG_PATH})`,
    "",
  ].join("\n"),
)

// ── aset statis ─────────────────────────────────────────────────────────
for (const f of ["app.js", "logo.svg", "CNAME", ...(ogFile ? [ogFile] : [])]) {
  cpSync(join(root, f), join(site, f))
}
cpSync(join(root, "fonts"), join(site, "fonts"), { recursive: true })
write(".nojekyll", "")

console.log(
  `[minilabs-build] ${urls.length} halaman + ${entryCount()} entri ARD -> site/`,
)
