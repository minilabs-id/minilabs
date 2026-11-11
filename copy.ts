// Salinan chrome antarmuka (non-konten proyek) per bahasa.
// `<html lang>`, navigasi, hero, section, footer, label seksi detail, dan meta.
// konten proyek (tagline/overview/dst) terlokalisasi terpisah di projects.ts.
// Semua nilai di sini adalah TEKS BIASA (tanpa HTML) — build.ts meng-escape-nya.

export type Lang = "id" | "en"

export interface LangMeta {
  code: Lang
  /** Prefix path: "" untuk id (root), "en" untuk en. */
  dir: string
  label: string
  htmlLang: string
}

export const LANGS: LangMeta[] = [
  { code: "id", dir: "", label: "ID", htmlLang: "id" },
  { code: "en", dir: "en", label: "EN", htmlLang: "en" },
]

export interface SiteCopy {
  navProjects: string
  navAbout: string
  /** aria-label tautan logo. */
  brandLabel: string
  /** aria-label navigasi utama. */
  navLabel: string
  /** aria-label pemilih bahasa. */
  langLabel: string
  /** Teks skip-link. */
  skipLink: string
  heroSub: string
  heroCtaPrimary: string
  heroCtaSecondary: string
  projectsLabel: string
  projectsTitle: string
  aboutLabel: string
  aboutTitle: string
  aboutP1: string
  aboutP2: string
  aboutPrinciples: string[]
  // {total}/{live}/{planned} diganti di build.ts
  aboutMeta: string
  aboutCta: string
  projectEyebrow: string
  installTitle: string
  installIntro: string
  capabilitiesTitle: string
  roadmapTitle: string
  statusTitle: string
  sourceTitle: string
  sourceIntro: string
  githubCta: string
  docsCta: string
  docsCtaNote: string
  backToLabs: string
  docsIndexTitle: string
  docsBack: string
  homeTitle: string
  homeDesc: string
  /** alt untuk og:image / twitter:image. */
  ogImageAlt: string
  // 404
  notFoundTitle: string
  notFoundHeading: string
  notFoundBody: string
  notFoundCta: string
  // Anchor id seksi halaman detail (dilokalisasi agar konsisten dengan <html lang>).
  anchorInstall: string
  anchorCapabilities: string
  anchorRoadmap: string
  anchorStatus: string
  anchorSource: string
}

export const CHROME: Record<Lang, SiteCopy> = {
  id: {
    navProjects: "Proyek",
    navAbout: "Tentang",
    brandLabel: "MiniLabs — beranda",
    navLabel: "Navigasi utama",
    langLabel: "Bahasa",
    skipLink: "Lewati ke konten",
    heroSub:
      "Studio independen yang membangun alat open source yang fokus — dari coding agent hingga CMS.",
    heroCtaPrimary: "Jelajahi MiniCode →",
    heroCtaSecondary: "Semua proyek",
    projectsLabel: "Proyek",
    projectsTitle: "Dibangun di sini.",
    aboutLabel: "Tentang",
    aboutTitle: "Tentang MiniLabs",
    aboutP1:
      "MiniLabs adalah studio open source yang membangun alat kecil yang fokus dan bisa diaudit — satu ide, satu proyek, tanpa menggembungkan fitur. Semua berbagi fondasi yang sama: kernel MiniCore.",
    aboutP2:
      "Coding agent, bug bounty, sampai CMS — yang menyatukannya bukan kategori, melainkan pendekatan: dependency seminim mungkin, dokumentasi yang jujur, dan antarmuka yang mereda.",
    aboutPrinciples: [
      "Zero-dependency — tanpa runtime pihak ketiga; permukaan audit kecil, install cepat.",
      "Jujur & terukur — batas dan kegagalan dilaporkan apa adanya, bukan klaim.",
      "Dokumentasi hidup — manual ditulis di repo, dirender otomatis di sini saat kode berubah.",
      "Minimalis monokrom — hitam di atas krem; desain yang mereda agar karyanya yang bicara.",
    ],
    aboutMeta: "{total} proyek — {live} aktif, {planned} dalam perencanaan.",
    aboutCta: "GitHub ↗",
    projectEyebrow: "Proyek",
    installTitle: "Instalasi",
    installIntro: "Dari nol ke prompt pertama dalam beberapa langkah.",
    capabilitiesTitle: "Kemampuan",
    roadmapTitle: "Rencana",
    statusTitle: "Status",
    sourceTitle: "Sumber & dokumentasi",
    sourceIntro: "Kode, rilis, dan manual lengkap satu klik dari sini.",
    githubCta: "GitHub ↗",
    docsCta: "Dokumentasi →",
    docsCtaNote: "",
    backToLabs: "← MiniLabs",
    docsIndexTitle: "Dokumentasi",
    docsBack: "← Dokumentasi",
    homeTitle: "MiniLabs — Exploring ideas. Engineering possibilities.",
    homeDesc:
      "MiniLabs adalah studio independen yang membangun alat open source yang fokus — MiniCode (coding agent), MiniBug, MiniBot, MiniWord.",
    ogImageAlt: "MiniLabs — studio open source independen",
    notFoundTitle: "404 — Halaman tidak ditemukan",
    notFoundHeading: "Halaman tidak ditemukan",
    notFoundBody: "Tautan yang Anda buka mungkin sudah dipindahkan atau tidak pernah ada.",
    notFoundCta: "Kembali ke beranda",
    anchorInstall: "instalasi",
    anchorCapabilities: "kemampuan",
    anchorRoadmap: "rencana",
    anchorStatus: "status",
    anchorSource: "sumber",
  },
  en: {
    navProjects: "Projects",
    navAbout: "About",
    brandLabel: "MiniLabs — home",
    navLabel: "Main navigation",
    langLabel: "Language",
    skipLink: "Skip to content",
    heroSub: "An independent studio building focused open-source tools — from coding agents to CMS.",
    heroCtaPrimary: "Explore MiniCode →",
    heroCtaSecondary: "All projects",
    projectsLabel: "Projects",
    projectsTitle: "Built here.",
    aboutLabel: "About",
    aboutTitle: "About MiniLabs",
    aboutP1:
      "MiniLabs is an open-source studio building small, focused, auditable tools — one idea, one project, no feature bloat. Everything shares one foundation: the MiniCore kernel.",
    aboutP2:
      "Coding agents, bug bounty, to CMS — what ties them together isn't the category, but the approach: minimal dependencies, honest documentation, and an interface that steps back.",
    aboutPrinciples: [
      "Zero-dependency — no third-party runtime; a small audit surface, fast installs.",
      "Honest & measured — limits and failures reported as they are, not claims.",
      "Living documentation — manuals are written in the repo, rendered here automatically when code changes.",
      "Monochromatic minimalism — black on cream; a design that recedes so the work can speak.",
    ],
    aboutMeta: "{total} projects — {live} live, {planned} planned.",
    aboutCta: "GitHub ↗",
    projectEyebrow: "Project",
    installTitle: "Install",
    installIntro: "From zero to your first prompt in a few steps.",
    capabilitiesTitle: "Capabilities",
    roadmapTitle: "Roadmap",
    statusTitle: "Status",
    sourceTitle: "Source & documentation",
    sourceIntro: "Code, releases, and the full manual one click away.",
    githubCta: "GitHub ↗",
    docsCta: "Documentation →",
    docsCtaNote: " (Bahasa Indonesia)",
    backToLabs: "← MiniLabs",
    docsIndexTitle: "Documentation",
    docsBack: "← Documentation",
    homeTitle: "MiniLabs — Exploring ideas. Engineering possibilities.",
    homeDesc:
      "MiniLabs is an independent studio building focused open-source tools — MiniCode (coding agent), MiniBug, MiniBot, MiniWord.",
    ogImageAlt: "MiniLabs — an independent open-source studio",
    notFoundTitle: "404 — Page not found",
    notFoundHeading: "Page not found",
    notFoundBody: "The link you followed may have moved, or may never have existed.",
    notFoundCta: "Back to home",
    anchorInstall: "install",
    anchorCapabilities: "capabilities",
    anchorRoadmap: "roadmap",
    anchorStatus: "status",
    anchorSource: "source",
  },
}
