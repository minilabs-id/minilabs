// Manifest proyek MiniLabs — SATU sumber kebenaran untuk hub + halaman detail.
// Tambah proyek = tambah satu entri di sini; build auto-generate grid + halaman.
// `status`: "live" (aktif) · "beta" (uji) · "planned" (rencana).

export type ProjectStatus = "live" | "beta" | "planned"

export interface InstallStep {
  /** Label langkah singkat. */
  label: string
  /** Perintah (opsional) — dirender sebagai blok kode. */
  command?: string
}

export interface Project {
  slug: string
  name: string
  status: ProjectStatus
  /** Satu kalimat tajam — tampil di kartu grid. */
  tagline: string
  /** 2–3 kalimat pendek — tampil di halaman detail sebelum dokumen. */
  overview: string
  repo?: string
  /** Daftar poin fitur ringkas (opsional). */
  highlights?: string[]
  /** Panduan instalasi singkat (hanya untuk proyek yang tersedia). */
  install?: InstallStep[]
  /** Catatan kaki opsional di bawah langkah instalasi. */
  installNote?: string
  /** Catatan status untuk proyek yang belum tersedia (`planned`). */
  plannedNote?: string
}

export const PROJECTS: Project[] = [
  {
    slug: "minicode",
    name: "MiniCode",
    status: "live",
    tagline:
      "Coding agent CLI open-source untuk terminal — setiap langkah terlihat, setiap aksi sensitif lewat izin Anda.",
    overview:
      "MiniCode adalah coding agent CLI open-source di atas kernel MiniCore yang beku, zero-dependency (Bun saja). Sesi interaktif berjalan sebagai TUI fullscreen; tugas sekali-jalan dan CI mengalir sebagai stream JSONL mesin. Perubahan file dijail ke workspace, perintah shell dijaga bash-guard, dan aksi sensitif selalu melewati izin Anda — dilengkapi checkpoint shadow-git dan jurnal mutasi agar resume tidak mengulang buta.",
    repo: "startupmini/minicode",
    highlights: [
      "Zero-dependency (Bun), kernel MiniCore ter-freeze",
      "Jail path + bash guard + sandbox (docker / OS)",
      "WorkMode (DISCUSS/PLAN/BUILD) + PermissionMode (AUTO/ASK)",
      "MCP, LSP, sub-agent (delegate_task), checkpoint shadow-git",
      "Jurnal mutasi durable + resume tanpa redo buta",
    ],
    install: [
      {
        label: "Prasyarat — pasang Bun (≥ 1.1.13). Ini runtime-nya; npm hanya dipakai untuk distribusi.",
        command: "curl -fsSL https://bun.sh/install | bash",
      },
      {
        label: "Pasang MiniCode dari npm.",
        command: "npm install -g minicode-ai",
      },
      {
        label: "Jalankan — wizard setup muncul bila belum ada provider, lalu TUI interaktif.",
        command: "minicode",
      },
      {
        label: "Atau sekali-jalan (headless).",
        command: 'minicode "review perubahan ini"',
      },
    ],
    installNote:
      "Di Windows, pasang Bun lewat PowerShell terlebih dahulu, lalu lanjut ke langkah berikutnya. Panduan lengkap (login OAuth, sandbox, update) ada di Dokumentasi → Instalasi.",
  },
  {
    slug: "minibug",
    name: "MiniBug",
    status: "planned",
    tagline: "Agent bug bounty — menemukan kerentanan sebelum orang lain melakukannya.",
    overview:
      "MiniBug adalah agent khusus bug bounty: menjelajah target, memetakan permukaan serangan, dan melaporkan temuan dengan bukti. Berbasis MiniCore, dengan pagar scope yang ketat.",
    highlights: [
      "Pemetaan permukaan serangan otomatis",
      "Pengujian terbungkus pagar scope yang ketat",
      "Laporan temuan dengan bukti langkah",
    ],
    plannedNote:
      "Masih dalam perencanaan. MiniBug akan berjalan di atas MiniCore dan mengadopsi batas keamanan yang sama — jail, gate, dan jurnal — untuk menguji target di dalam scope yang Anda tetapkan. Belum tersedia untuk diinstal.",
  },
  {
    slug: "minibot",
    name: "MiniBot",
    status: "planned",
    tagline: "Agent general-purpose untuk tugas harian — dari riset hingga otomasi.",
    overview:
      "MiniBot adalah agent serba-guna: eksplorasi, riset, dan otomasi tugas berulang. Ringan, cepat, dan bisa diarahkan lewat prompt sederhana.",
    highlights: [
      "Eksplorasi & riset multi-langkah",
      "Otomasi tugas berulang",
      "Ringan dan diarahkan lewat prompt sederhana",
    ],
    plannedNote:
      "Masih dalam perencanaan. MiniBot akan menjadi pintu masuk paling mudah ke ekosistem MiniLabs — agent harian untuk riset dan otomasi tanpa kurva belajar yang curam. Belum tersedia untuk diinstal.",
  },
  {
    slug: "miniword",
    name: "MiniWord",
    status: "planned",
    tagline: "CMS ringan di Cloudflare — gratis, cepat, tanpa server yang harus diurus.",
    overview:
      "MiniWord adalah CMS statis berbasis Cloudflare (Pages/Workers) — tulis konten, terbitkan, tanpa biaya dan tanpa mengelola server.",
    highlights: [
      "Layout statis di Cloudflare Pages/Workers",
      "Tulis konten, terbitkan sekali klik",
      "Gratis dan tanpa server yang diurus",
    ],
    plannedNote:
      "Masih dalam perencanaan. MiniWord mengusung filosofi MiniLabs yang sama: zero-dependency dan di-deploy ke Cloudflare, sehingga konten Anda berada di edge tanpa biaya dan tanpa infrastruktur sendiri. Belum tersedia untuk diinstal.",
  },
]