// Dokumentasi proyek — render markdown `docs/**/*.md` dari repo proyek lain menjadi
// halaman HTML di minilabs. Sumber docs = repo masing-masing (single source of
// truth). Workflow deploy dijadwalkan + dispatch agar halaman ikut ter-update.
//
// Renderer ini sengaja minimal (zero-dependency) tetapi menutup celah yang dulu
// ada: escape atribut, gambar, paragraf multi-baris, link relatif, subfolder,
// dan heading unicode.

import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs"
import { dirname, join, posix } from "node:path"

const META = new Set(["readme.md", "summary.md"])

// ── Escape ───────────────────────────────────────────────────────────────
/** Escape untuk simpul teks. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

/** Escape untuk nilai atribut (termasuk tanda kutip). */
function escAttr(s: string): string {
  return esc(s).replace(/"/g, "&quot;")
}

// ── Markdown → HTML ──────────────────────────────────────────────────────
/** Konteks tautan: proyek + direktori dokumen saat ini (relatif, POSIX). */
export interface DocLinkContext {
  slug: string
  repo: string
  /** Direktori dokumen relatif terhadap akar `docs/`; "" untuk level atas. */
  dir: string
}

const hasScheme = (u: string): boolean => /^[a-z][a-z0-9+.-]*:/i.test(u)

function splitHash(u: string): [string, string] {
  const i = u.indexOf("#")
  return i === -1 ? [u, ""] : [u.slice(0, i), u.slice(i)]
}

/**
 * Ubah tautan markdown relatif menjadi URL yang benar-benar ada di situs:
 * - `.md` → halaman docs (slug-aware) agar tidak hardcode ke satu proyek.
 * - aset relatif (gambar, dsb.) → `raw` di repo, karena tidak ikut dibangun.
 * - skema/`#`/`/` absolut → dibiarkan.
 */
export function resolveDocLink(u: string, ctx: DocLinkContext): string {
  if (hasScheme(u) || u.startsWith("#") || u.startsWith("//") || u.startsWith("/")) return u
  const [pathPart, hash] = splitHash(u)
  if (!pathPart) return u

  if (/\.md$/i.test(pathPart)) {
    const base = posix
      .normalize(posix.join(ctx.dir, pathPart.replace(/\.md$/i, "")))
      .replace(/^\.\//, "")
    return `/projects/${ctx.slug}/docs/${base}/${hash}`
  }

  const repoPath = posix.normalize(posix.join("docs", ctx.dir, pathPart))
  return `https://github.com/${ctx.repo}/raw/HEAD/${repoPath}${hash}`
}

function inline(s: string, ctx: DocLinkContext): string {
  // Code span dilindungi lebih dulu agar `*`/`_` di dalamnya tidak jadi markup.
  const codes: string[] = []
  let t = esc(s).replace(/`([^`]+)`/g, (_m, c: string) => {
    codes.push(c)
    return `\u0000${codes.length - 1}\u0000`
  })

  t = t
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g, (_m, alt: string, u: string) => {
      return `<img src="${escAttr(resolveDocLink(u, ctx))}" alt="${escAttr(alt)}" loading="lazy" decoding="async" />`
    })
    .replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g, (_m, label: string, u: string) => {
      return `<a href="${escAttr(resolveDocLink(u, ctx))}">${label}</a>`
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\b_([^_\n]+)_\b/g, "<em>$1</em>")

  return t.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => `<code>${codes[Number(i)]!}</code>`)
}

/** Slug heading unicode-aware + anti-tabrakan. */
function makeSlugger(): (s: string) => string {
  const seen = new Map<string, number>()
  return (s: string) => {
    const base =
      s
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .trim()
        .replace(/\s+/g, "-") || "section"
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    return n === 1 ? base : `${base}-${n}`
  }
}

export function mdToHtml(md: string, ctx: DocLinkContext): string {
  const lines = md.split(/\r?\n/)
  const out: string[] = []
  const slug = makeSlugger()
  let inCode = false
  let codeLang = ""
  let code: string[] = []
  let list: "ul" | "ol" | null = null
  let para: string[] = []

  const closeList = () => {
    if (list) {
      out.push(`</${list}>`)
      list = null
    }
  }

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(" "), ctx)}</p>`)
      para = []
    }
  }

  const flushCode = () => {
    if (inCode) {
      out.push(
        `<pre><code${codeLang ? ` class="language-${escAttr(codeLang)}"` : ""}>${esc(code.join("\n"))}</code></pre>`,
      )
      code = []
      codeLang = ""
      inCode = false
    }
  }

  const flushBlock = () => {
    flushCode()
    flushPara()
    closeList()
  }

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) {
        flushCode()
      } else {
        flushBlock()
        codeLang = line.slice(3).trim()
        inCode = true
      }
      continue
    }
    if (inCode) {
      code.push(line)
      continue
    }
    if (/^\s*$/.test(line)) {
      flushBlock()
      continue
    }
    // heading
    const h = /^(#{1,6})\s+(.*)$/.exec(line)
    if (h) {
      flushBlock()
      const lvl = h[1]!.length
      out.push(`<h${lvl} id="${slug(h[2]!)}">${inline(h[2]!, ctx)}</h${lvl}>`)
      continue
    }
    // unordered / ordered list
    const ul = /^\s*[-*+]\s+(.*)$/.exec(line)
    const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line)
    if (ul || ol) {
      flushPara()
      const kind = ul ? "ul" : "ol"
      if (list !== kind) {
        closeList()
        out.push(`<${kind}>`)
        list = kind
      }
      out.push(`<li>${inline((ul ?? ol)![1]!, ctx)}</li>`)
      continue
    }
    // table (baris | a | b |) — divider dilewati, isi jadi <p class="trow">
    if (/^\s*\|.*\|\s*$/.test(line)) {
      flushBlock()
      const cells = line
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c) => c.trim())
      if (!/^[\s:-]+$/.test(cells.join(""))) {
        out.push(`<p class="trow">${cells.map((c) => inline(c, ctx)).join(" · ")}</p>`)
      }
      continue
    }
    // blockquote
    if (/^>\s?/.test(line)) {
      flushBlock()
      out.push(`<blockquote>${inline(line.replace(/^>\s?/, ""), ctx)}</blockquote>`)
      continue
    }
    // horizontal rule
    if (/^-{3,}$/.test(line.trim())) {
      flushBlock()
      out.push("<hr>")
      continue
    }
    // paragraf (baris berurutan digabung)
    closeList()
    para.push(line.trim())
  }
  flushBlock()
  return out.join("\n")
}

// ── Ambil docs dari repo proyek (git clone shallow) ────────────────────────
export interface DocPage {
  /** Path relatif tanpa ekstensi ("architecture", "guides/setup"). */
  name: string
  /** Judul (heading pertama) bila ada. */
  title: string
  html: string
}

/** Kumpulkan semua file .md secara rekursif (lewati meta + direktori tersembunyi). */
function collectDocFiles(dir: string, prefix: string, acc: string[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith(".")) continue
      collectDocFiles(join(dir, entry.name), prefix ? `${prefix}/${entry.name}` : entry.name, acc)
    } else if (/\.md$/i.test(entry.name) && !META.has(entry.name.toLowerCase())) {
      acc.push(prefix ? `${prefix}/${entry.name}` : entry.name)
    }
  }
}

function pull(cloneDir: string, repo: string): boolean {
  const res = Bun.spawnSync(["git", "-C", cloneDir, "pull", "--quiet"], {
    stderr: "pipe",
    timeout: 90_000,
  })
  if (res.exitCode !== 0) {
    const detail = res.stderr?.toString().trim() || `exit ${res.exitCode}`
    console.warn(`[docs] git pull gagal untuk ${repo}; memakai cache apa adanya (${detail})`)
  }
  return res.exitCode === 0
}

export async function fetchProjectDocs(opts: {
  repo: string
  slug: string
  docsDir: string
  cacheDir: string
}): Promise<DocPage[]> {
  const { repo, slug, docsDir, cacheDir } = opts
  const cloneDir = join(cacheDir, repo.replace("/", "--"))
  const docsPath = join(cloneDir, docsDir)

  // Klon/fetch dangkal repo (bila jaringan tak ada, pakai cache/kosong).
  if (!existsSync(join(cloneDir, ".git"))) {
    mkdirSync(cacheDir, { recursive: true })
    const res = Bun.spawnSync(
      ["git", "clone", "--depth", "1", "--quiet", `https://github.com/${repo}.git`, cloneDir],
      { stderr: "pipe", timeout: 180_000 },
    )
    if (res.exitCode !== 0) {
      const detail = res.stderr?.toString().trim() || `exit ${res.exitCode}`
      console.warn(`[docs] git clone gagal untuk ${repo}; docs dilewati (${detail})`)
      return []
    }
  } else {
    pull(cloneDir, repo)
  }

  if (!existsSync(docsPath)) {
    console.warn(`[docs] ${repo} tidak punya direktori ${docsDir}/; docs dilewati`)
    return []
  }

  // Meta/navigation bukan konten — jangan dirender sebagai halaman docs.
  const rels: string[] = []
  collectDocFiles(docsPath, "", rels)
  rels.sort((a, b) => a.localeCompare(b))

  const pages: DocPage[] = []
  for (const rel of rels) {
    const name = rel.replace(/\.md$/i, "")
    const dir = name.includes("/") ? name.slice(0, name.lastIndexOf("/")) : ""
    const raw = readFileSync(join(docsPath, rel), "utf8")

    // Judul = heading `# ` pertama; heading itu dibuang dari body agar tidak ada
    // dua <h1> di satu halaman.
    const titleLine = /^#\s+(.*)$/m.exec(raw)
    const title = titleLine ? titleLine[1]!.replace(/[`*]/g, "").trim() : name
    const body = titleLine ? raw.replace(/^#\s+.*(?:\r?\n)?/m, "") : raw

    pages.push({ name, title, html: mdToHtml(body, { slug, repo, dir }) })
  }
  return pages
}
