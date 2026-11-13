// Salinan chrome antarmuka (non-konten proyek) per bahasa.
// `<html lang>`, navigasi, hero, section, footer, label seksi detail, dan meta.
// konten proyek (tagline/overview/dst) terlokalisasi terpisah di projects.ts.
// Semua nilai di sini adalah TEKS BIASA (tanpa HTML) — build.ts meng-escape-nya.
//
// Posisi MiniLabs: kotak pasir untuk menguji ide-ide liar lewat baris kode.
// Sengaja digeneralkan — TIDAK mengklaim "open source" sebagai identitas,
// dan TIDAK mengklaim semua proyeknya soal AI.

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
    heroKicker: "Kotak pasir · eksperimen independen",
    heroSub:
      "Kotak pasir tempat ide-ide liar diuji lewat baris kode.",
    heroCtaPrimary: "Lihat {name} →",
    heroCtaSecondary: "Semua proyek",
    projectsLabel: "Proyek",
    projectsTitle: "Dibangun di sini.",
    aboutLabel: "Tentang",
    aboutTitle: "Tentang MiniLabs",
    aboutP1:
      "MiniLabs berdiri sebagai wadah eksplorasi mandiri bagi gagasan-gagasan yang layak diuji. Fokus utamanya bukan mengejar skala atau menumpuk kerumitan, melainkan memahami inti dari sebuah persoalan lewat proses merancang dan membangun.",
    aboutP2:
      "Setiap eksperimen dimulai dari kanvas kosong tanpa terikat pada satu bidang tertentu. Prinsipnya sederhana: bangun dengan jernih, ukur hasilnya secara objektif, dan biarkan segalanya mereda agar substansinya tetap menjadi pusat perhatian.",
    aboutPrinciples: [
      "Fokus dan proporsional: Dibangun secukupnya untuk menguji satu konsep, ringan dipahami dari luar maupun dalam.",
      "Objektif dalam menguji: Menempatkan fakta hasil eksperimen di atas asumsi, termasuk saat menemui jalan buntu.",
      "Jejak yang hidup: Setiap perubahan dan temuan baru terdokumentasi langsung mengikuti ritme pengerjaan.",
      "Minimalis yang fungsional: Membiarkan ruang tetap bersih dan kontras agar perhatian tertuju penuh pada karya.",
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
    homeTitle: "MiniLabs — kotak pasir untuk menguji ide lewat baris kode",
    homeDesc:
      "MiniLabs adalah kotak pasir untuk menguji ide-ide liar lewat baris kode — alat, agen, CMS, sampai eksperimen iseng. Tidak semuanya open source, dan tidak semuanya soal AI.",
    ogImageAlt: "MiniLabs — Exploring ideas. Engineering possibilities.",
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
    heroKicker: "A sandbox · build & experiment",
    heroSub:
      "A sandbox where wild ideas are tested through lines of code.",
    heroCtaPrimary: "See {name} →",
    heroCtaSecondary: "All projects",
    projectsLabel: "Projects",
    projectsTitle: "Built here.",
    aboutLabel: "About",
    aboutTitle: "About MiniLabs",
    aboutP1:
      "MiniLabs exists as an independent space for exploring ideas worth testing. Its main focus isn't chasing scale or piling up complexity, but understanding the essence of a problem through the process of designing and building.",
    aboutP2:
      "Every experiment begins on a blank canvas, untethered to any single field. The principle is simple: build with clarity, measure the results objectively, and let everything recede so the substance itself stays at the center.",
    aboutPrinciples: [
      "Focused and proportionate: Built just enough to test a single concept, light to grasp from the inside and the outside.",
      "Objective in testing: Placing the facts of an experiment above assumptions, even when it hits a dead end.",
      "A living trail: Every change and new finding is recorded directly, following the rhythm of the work.",
      "Functional minimalism: Keeping the space clean and high-contrast so attention rests entirely on the work.",
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
    homeTitle: "MiniLabs — a sandbox for testing ideas through lines of code",
    homeDesc:
      "MiniLabs is a sandbox for testing wild ideas through lines of code — tools, agents, a CMS, and idle experiments. Not everything is open source, and not everything is about AI.",
    ogImageAlt: "MiniLabs — Exploring ideas. Engineering possibilities.",
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
