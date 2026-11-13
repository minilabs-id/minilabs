// Salinan chrome antarmuka (non-konten proyek) per bahasa.
// `<html lang>`, navigasi, hero, section, footer, label seksi detail, dan meta.
// konten proyek (tagline/overview/dst) terlokalisasi terpisah di projects.ts.
// Semua nilai di sini adalah TEKS BIASA (tanpa HTML) — build.ts meng-escape-nya.
//
// Posisi MiniLabs: laboratorium eksperimen independen yang membuat dan menguji
// hal-hal kecil. Sengaja digeneralkan — TIDAK mengklaim "open source" sebagai
// identitas, dan TIDAK mengklaim semua proyeknya soal AI.

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
  /** Kicker kecil di atas judul hero. */
  heroKicker: string
  heroSub: string
  /** CTA utama; `{name}` diganti nama proyek unggulan di build.ts. */
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
    heroKicker: "Laboratorium eksperimen · independen",
    heroSub:
      "Kotak pasir tempat ide-ide liar diuji lewat baris kode.",
    heroCtaPrimary: "Lihat {name} →",
    heroCtaSecondary: "Semua proyek",
    projectsLabel: "Proyek",
    projectsTitle: "Dibangun di sini.",
    aboutLabel: "Tentang",
    aboutTitle: "Tentang MiniLabs",
    aboutP1:
      "MiniLabs adalah laboratorium eksperimen independen — tempat membuat, menguji, dan sesekali merilis hal-hal kecil, satu ide per proyek. Tidak semua proyek open source, dan tidak semua soal AI; sebagian hanyalah eksperimen yang layak dicoba.",
    aboutP2:
      "Dari alat dan agen sampai CMS dan eksperimen iseng — yang menyatukan bukan kategori, melainkan cara kerja: sederhana, jujur soal batas dan kegagalan, dan antarmuka yang mereda agar karyanya yang bicara.",
    aboutPrinciples: [
      "Sederhana & ringan — minim dependensi; permukaan yang kecil, mudah dipahami dan diaudit.",
      "Jujur & terukur — batas dan kegagalan dilaporkan apa adanya, bukan klaim.",
      "Dokumentasi hidup — catatan ditulis bersama kode, dirender otomatis di sini saat berubah.",
      "Minimalis monokrom — hitam di atas krem; desain yang mereda agar karyanya yang bicara.",
    ],
    aboutMeta: "{total} proyek & eksperimen — {live} aktif, {planned} dalam perencanaan.",
    aboutCta: "GitHub ↗",
    projectEyebrow: "Proyek",
    installTitle: "Instalasi",
    installIntro: "Dari nol sampai bisa dipakai dalam beberapa langkah.",
    capabilitiesTitle: "Kemampuan",
    roadmapTitle: "Rencana",
    statusTitle: "Status",
    sourceTitle: "Kode & dokumentasi",
    sourceIntro: "Repo, rilis, dan dokumentasi lengkap satu klik dari sini.",
    githubCta: "GitHub ↗",
    docsCta: "Dokumentasi →",
    docsCtaNote: "",
    backToLabs: "← MiniLabs",
    docsIndexTitle: "Dokumentasi",
    docsBack: "← Dokumentasi",
    homeTitle: "MiniLabs — laboratorium eksperimen independen",
    homeDesc:
      "MiniLabs adalah kotak pasir untuk menguji ide-ide liar lewat baris kode — alat, agen, CMS, sampai eksperimen iseng. Tidak semuanya open source, dan tidak semuanya soal AI.",
    ogImageAlt: "MiniLabs — laboratorium eksperimen independen",
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
    heroKicker: "Independent lab · build & experiment",
    heroSub:
      "A sandbox where wild ideas are tested through lines of code.",
    heroCtaPrimary: "See {name} →",
    heroCtaSecondary: "All projects",
    projectsLabel: "Projects",
    projectsTitle: "Built here.",
    aboutLabel: "About",
    aboutTitle: "About MiniLabs",
    aboutP1:
      "MiniLabs is an independent laboratory — a place to make, test, and occasionally ship small things, one idea per project. Not everything is open source, and not everything is about AI; some are just experiments worth trying.",
    aboutP2:
      "From tools and agents to a CMS and idle experiments — what ties them together isn't the category, but the way of working: simple, honest about limits and failures, and an interface that steps back so the work can speak.",
    aboutPrinciples: [
      "Simple & light — as few dependencies as possible; a small surface, easy to understand and audit.",
      "Honest & measured — limits and failures reported as they are, not claims.",
      "Living documentation — notes written alongside the code, rendered here automatically as it changes.",
      "Monochromatic minimalism — black on cream; a design that recedes so the work can speak.",
    ],
    aboutMeta: "{total} projects & experiments — {live} live, {planned} planned.",
    aboutCta: "GitHub ↗",
    projectEyebrow: "Project",
    installTitle: "Install",
    installIntro: "From zero to usable in a few steps.",
    capabilitiesTitle: "Capabilities",
    roadmapTitle: "Roadmap",
    statusTitle: "Status",
    sourceTitle: "Code & documentation",
    sourceIntro: "Repo, releases, and full documentation one click away.",
    githubCta: "GitHub ↗",
    docsCta: "Documentation →",
    docsCtaNote: " (Bahasa Indonesia)",
    backToLabs: "← MiniLabs",
    docsIndexTitle: "Documentation",
    docsBack: "← Documentation",
    homeTitle: "MiniLabs — an independent laboratory",
    homeDesc:
      "MiniLabs is a sandbox for testing wild ideas through lines of code — tools, agents, a CMS, and idle experiments. Not everything is open source, and not everything is about AI.",
    ogImageAlt: "MiniLabs — an independent laboratory",
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
