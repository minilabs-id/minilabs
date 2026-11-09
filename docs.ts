// Dokumentasi proyek — render markdown `docs/*.md` dari repo proyek lain menjadi
// halaman HTML di minilabs. Sumber docs = repo masing-masing (single source of
// truth). Workflow deploy dijadwalkan + dispatch agar halaman ikut ter-update.

import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

// ── Markdown → HTML (minimal, cukup untuk docs teknis) ────────────────────
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function inline(s: string): string {
  return esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, t: string, u: string) => {
      const href = /^\w+:|^#/.test(u) ? u : resolveDocLink(u)
      return `<a href="${href}">${t}</a>`
    })
}

function resolveDocLink(u: string): string {
  if (u.endsWith(".md")) {
    const base = u.replace(/\.md$/, "").replace(/^\.\//, "")
    return `/projects/minicode/docs/${base}/`
  }
  return u
}

export function mdToHtml(md: string): string {
  const lines = md.split(/\r?\n/)
  const out: string[] = []
  let inCode = false
  let codeLang = ""
  let code: string[] = []
  let list: "ul" | "ol" | null = null

  const closeList = () => {
    if (list) {
      out.push(`</${list}>`)
      list = null
    }
  }

  const flush = () => {
    if (inCode) {
      out.push(
        `<pre><code${codeLang ? ` class="language-${codeLang}"` : ""}>${esc(code.join("\n"))}</code></pre>`,
      )
      code = []
      codeLang = ""
      inCode = false
    }
  }

  for (const raw of lines) {
    const line = raw
    if (line.startsWith("```")) {
      if (inCode) {
        flush()
      } else {
        codeLang = line.slice(3).trim()
        inCode = true
        closeList()
      }
      continue
    }
    if (inCode) {
      code.push(line)
      continue
    }
    if (/^\s*$/.test(line)) {
      flush()
      closeList()
      continue
    }
    // heading
    const h = /^(#{1,6})\s+(.*)$/.exec(line)
    if (h) {
      closeList()
      const lvl = h[1]!.length
      out.push(`<h${lvl} id="${slugify(h[2]!)}">${inline(h[2]!)}</h${lvl}>`)
      continue
    }
    // unordered / ordered list
    const ul = /^\s*[-*+]\s+(.*)$/.exec(line)
    const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line)
    if (ul || ol) {
      const kind = ul ? "ul" : "ol"
      if (list !== kind) {
        closeList()
        out.push(`<${kind}>`)
        list = kind
      }
      out.push(`<li>${inline((ul ?? ol)![1]!)}</li>`)
      continue
    }
    // table (baris | a | b |) — header/divider dilewati, isi jadi <tr>
    if (/^\s*\|.*\|\s*$/.test(line)) {
      closeList()
      const cells = line
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c) => c.trim())
      if (!/^[\s:-]+$/.test(cells.join(""))) {
        out.push(`<p class="trow">${cells.map((c) => inline(c)).join(" · ")}</p>`)
      }
      continue
    }
    // blockquote
    if (/^>\s?/.test(line)) {
      closeList()
      out.push(`<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`)
      continue
    }
    // horizontal rule
    if (/^-{3,}$/.test(line.trim())) {
      closeList()
      out.push("<hr>")
      continue
    }
    // paragraph
    closeList()
    out.push(`<p>${inline(line)}</p>`)
  }
  flush()
  closeList()
  return out.join("\n")
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

// ── Ambil docs dari repo proyek (git clone shallow) ────────────────────────
export interface DocPage {
  /** Nama tanpa ekstensi ("architecture"). */
  name: string
  /** Judul (heading pertama) bila ada. */
  title: string
  html: string
}

export async function fetchProjectDocs(opts: {
  repo: string
  docsDir: string
  cacheDir: string
}): Promise<DocPage[]> {
  const { repo, docsDir, cacheDir } = opts
  const cloneDir = join(cacheDir, repo.replace("/", "--"))
  const docsPath = join(cloneDir, docsDir)

  // Klon/fetch dangkal repo (bila jaringan tak ada, pakai cache/kosong).
  if (!existsSync(join(cloneDir, ".git"))) {
    const res = Bun.spawnSync(
      ["git", "clone", "--depth", "1", "--quiet", `https://github.com/${repo}.git`, cloneDir],
      {},
    )
    if (res.exitCode !== 0) return []
  } else {
    Bun.spawnSync(["git", "-C", cloneDir, "pull", "--quiet"], {})
  }

  if (!existsSync(docsPath)) return []
  // Meta/navigation bukan konten — jangan dirender sebagai halaman docs.
  const META = new Set(["readme.md", "summary.md"])
  const files = readdirSync(docsPath)
    .filter((f) => f.endsWith(".md") && !META.has(f.toLowerCase()))
    .sort((a, b) => a.localeCompare(b))
  const pages: DocPage[] = []
  for (const f of files) {
    const name = f.replace(/\.md$/, "")
    const raw = readFileSync(join(docsPath, f), "utf8")
    // Judul = heading `# ` pertama; link/isolated heading dilewati.
    const titleLine = raw.match(/^#\s+(.*)$/m)
    const title = titleLine ? titleLine[1]!.replace(/[`*]/g, "").trim() : name
    pages.push({ name, title, html: mdToHtml(raw) })
  }
  return pages
}