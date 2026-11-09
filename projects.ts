// Manifest proyek MiniLabs — SATU sumber kebenaran untuk hub + halaman detail.
// Tambah proyek = tambah satu entri di sini; build auto-generate grid + halaman.
// `status`: "live" (aktif) · "beta" (uji) · "planned" (rencana).

export type ProjectStatus = "live" | "beta" | "planned"

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
}

export const PROJECTS: Project[] = [
  {
    slug: "minicode",
    name: "MiniCode",
    status: "live",
    tagline: "Coding agent CLI open-source untuk terminal — setiap langkah terlihat, setiap aksi sensitif lewat izin Anda.",
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
  },
  {
    slug: "minibug",
    name: "MiniBug",
    status: "planned",
    tagline: "Agent bug bounty — menemukan kerentanan sebelum orang lain melakukannya.",
    overview:
      "MiniBug adalah agent khusus bug bounty: menjelajah target, memetakan permukaan serangan, dan melaporkan temuan dengan bukti. Berbasis MiniCore, dengan pagar scope yang ketat.",
    highlights: [],
  },
  {
    slug: "minibot",
    name: "MiniBot",
    status: "planned",
    tagline: "Agent general-purpose untuk tugas harian — dari riset hingga otomasi.",
    overview:
      "MiniBot adalah agent serba-guna: eksplorasi, riset, dan otomasi tugas berulang. Ringan, cepat, dan bisa diarahkan lewat prompt sederhana.",
    highlights: [],
  },
  {
    slug: "miniword",
    name: "MiniWord",
    status: "planned",
    tagline: "CMS ringan di Cloudflare — gratis, cepat, tanpa server yang harus diurus.",
    overview:
      "MiniWord adalah CMS statis berbasis Cloudflare (Pages/Workers) — tulis konten, terbitkan, tanpa biaya dan tanpa mengelola server.",
    highlights: [],
  },
]