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
    tagline: "Coding agent CLI untuk terminal — tiap langkah terlihat, tiap aksi sensitif lewat izin Anda.",
    overview:
      "MiniCode adalah coding agent CLI open source. Berjalan di atas MiniCore yang beku, zero-dependency (Bun). Tiap aksi tool tampil di scrollback, perubahan file dijail ke workspace, dan perintah sensitif lewat izin Anda.",
    repo: "startupmini/minicode",
    highlights: [
      "Zero-dependency (Bun), tokenizer diunduh on-demand",
      "Jail path + bash-guard + sandbox (docker/OS)",
      "WorkMode (DISCUSS/PLAN/BUILD) + PermissionMode (AUTO/ASK)",
      "MCP, LSP, sub-agent (delegate_task), checkpoint shadow-git",
      "Mutation journal durable + resume tanpa redo buta",
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