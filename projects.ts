// Manifest proyek MiniLabs — SATU sumber kebenaran untuk hub + halaman detail.
// Konten lokal (tagline/overview/highlights/install/plannedNote) terlokalisasi
// per bahasa (`content.id` / `content.en`); `name` proper noun sama di semua bahasa.
// `status`: "live" (aktif) · "beta" (uji) · "planned" (rencana).

import type { Lang } from "./copy.ts"

export type { Lang }
export type ProjectStatus = "live" | "beta" | "planned"

export interface InstallStep {
  label: string
  command?: string
}

export interface ProjectL10n {
  tagline: string
  overview: string
  highlights?: string[]
  install?: InstallStep[]
  installNote?: string
  plannedNote?: string
}

export interface Project {
  slug: string
  name: string
  status: ProjectStatus
  repo?: string
  content: Record<Lang, ProjectL10n>
}

export const PROJECTS: Project[] = [
  {
    slug: "minicode",
    name: "MiniCode",
    status: "live",
    repo: "startupmini/minicode",
    content: {
      id: {
        tagline:
          "Coding agent CLI open-source untuk terminal — setiap langkah terlihat, setiap aksi sensitif lewat izin Anda.",
        overview:
          "MiniCode adalah coding agent CLI open-source di atas kernel MiniCore yang beku, zero-dependency (Bun saja). Sesi interaktif berjalan sebagai TUI fullscreen; tugas sekali-jalan dan CI mengalir sebagai stream JSONL mesin. Perubahan file dijail ke workspace, perintah shell dijaga bash-guard, dan aksi sensitif selalu melewati izin Anda — dilengkapi checkpoint shadow-git dan jurnal mutasi agar resume tidak mengulang buta.",
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
          { label: "Pasang MiniCode dari npm.", command: "npm install -g minicode-ai" },
          {
            label: "Jalankan — wizard setup muncul bila belum ada provider, lalu TUI interaktif.",
            command: "minicode",
          },
          { label: "Atau sekali-jalan (headless).", command: 'minicode "review perubahan ini"' },
        ],
        installNote:
          "Di Windows, pasang Bun lewat PowerShell terlebih dahulu, lalu lanjut ke langkah berikutnya. Panduan lengkap (login OAuth, sandbox, update) ada di Dokumentasi → Instalasi.",
      },
      en: {
        tagline:
          "An open-source coding agent CLI for the terminal — every step visible, every sensitive action gated behind your permission.",
        overview:
          "MiniCode is an open-source coding agent CLI on the frozen MiniCore kernel — zero-dependency (Bun only). Interactive sessions run as a fullscreen TUI; one-shot and CI runs flow as a machine-readable JSONL stream. File changes are jailed to the workspace, shell commands are guarded by a bash-guard, and sensitive actions always pass through your permission — with shadow-git checkpoints and a mutation journal so resume never re-does work blindly.",
        highlights: [
          "Zero-dependency (Bun), frozen MiniCore kernel",
          "Path jail + bash guard + sandbox (Docker / OS)",
          "WorkMode (DISCUSS/PLAN/BUILD) + PermissionMode (AUTO/ASK)",
          "MCP, LSP, sub-agents (delegate_task), shadow-git checkpoints",
          "Durable mutation journal + resume without blind redo",
        ],
        install: [
          {
            label: "Prerequisite — install Bun (≥ 1.1.13). This is the runtime; npm is only for distribution.",
            command: "curl -fsSL https://bun.sh/install | bash",
          },
          { label: "Install MiniCode from npm.", command: "npm install -g minicode-ai" },
          {
            label: "Run it — a setup wizard appears if no provider is configured, then the interactive TUI.",
            command: "minicode",
          },
          { label: "Or one-shot (headless).", command: 'minicode "review this change"' },
        ],
        installNote:
          "On Windows, install Bun via PowerShell first, then continue. The full guide (OAuth login, sandbox, updates) is under Documentation → Installation.",
      },
    },
  },
  {
    slug: "minibug",
    name: "MiniBug",
    status: "planned",
    content: {
      id: {
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
      en: {
        tagline: "A bug-bounty agent — finding vulnerabilities before someone else does.",
        overview:
          "MiniBug is a dedicated bug-bounty agent: it explores targets, maps the attack surface, and reports findings with evidence. Built on MiniCore, with strict scope guardrails.",
        highlights: [
          "Automated attack-surface mapping",
          "Testing wrapped in strict scope guardrails",
          "Findings reported with step-by-step evidence",
        ],
        plannedNote:
          "Still in planning. MiniBug will run on MiniCore and inherit the same security boundaries — jail, gates, and journal — to test targets within a scope you define. Not yet available to install.",
      },
    },
  },
  {
    slug: "minibot",
    name: "MiniBot",
    status: "planned",
    content: {
      id: {
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
      en: {
        tagline: "A general-purpose agent for everyday tasks — from research to automation.",
        overview:
          "MiniBot is an all-purpose agent: exploration, research, and automation of repetitive tasks. Lightweight, fast, and steerable with a simple prompt.",
        highlights: [
          "Multi-step exploration & research",
          "Automation of repetitive tasks",
          "Lightweight and steerable with a simple prompt",
        ],
        plannedNote:
          "Still in planning. MiniBot will be the easiest entry point into the MiniLabs ecosystem — an everyday agent for research and automation without a steep learning curve. Not yet available to install.",
      },
    },
  },
  {
    slug: "miniword",
    name: "MiniWord",
    status: "planned",
    content: {
      id: {
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
      en: {
        tagline: "A lightweight CMS on Cloudflare — free, fast, no server to manage.",
        overview:
          "MiniWord is a static CMS on Cloudflare (Pages/Workers) — write content, publish, with no cost and no server to manage.",
        highlights: [
          "Static output on Cloudflare Pages/Workers",
          "Write content, publish in one click",
          "Free, with no server to manage",
        ],
        plannedNote:
          "Still in planning. MiniWord follows the same MiniLabs philosophy — zero-dependency, deployed to Cloudflare, so your content lives on the edge with no cost and no infrastructure of your own. Not yet available to install.",
      },
    },
  },
]