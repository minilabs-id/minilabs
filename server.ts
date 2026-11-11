// Server dev: build sekali, sajikan `site/`, lalu rebuild otomatis saat sumber berubah.
// Zero-dependency (Bun.serve + node:fs). Jalankan: `bun dev` atau `bun server.ts`.

import { watch } from "node:fs"
import { join, sep } from "node:path"

const root = import.meta.dir
const site = join(root, "site")
const port = Number(process.env.PORT ?? 4321)

async function build(): Promise<number> {
  const proc = Bun.spawn(["bun", join(root, "build.ts")], {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  })
  return proc.exited
}

if ((await build()) !== 0) {
  console.error("[dev] build awal gagal — server tetap jalan dengan output terakhir.")
}

const sitePrefix = site.endsWith(sep) ? site : site + sep

const server = Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url)
    const rel = decodeURIComponent(url.pathname)
    const candidates = rel.endsWith("/")
      ? [`${rel}index.html`]
      : [rel, `${rel}/index.html`]

    for (const candidate of candidates) {
      const file = join(site, candidate)
      if (!file.startsWith(sitePrefix)) return new Response("Forbidden", { status: 403 })
      const f = Bun.file(file)
      if (await f.exists()) return new Response(f)
    }

    const notFound = Bun.file(join(site, "404.html"))
    if (await notFound.exists()) {
      return new Response(notFound, {
        status: 404,
        headers: { "content-type": "text/html; charset=utf-8" },
      })
    }
    return new Response("Not found", { status: 404 })
  },
})

console.log(`[dev] http://localhost:${server.port}`)

let timer: ReturnType<typeof setTimeout> | null = null
const rebuild = () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    void build().then((code) => console.log(`[dev] rebuild ${code === 0 ? "ok" : "GAGAL"}`))
  }, 150)
}

watch(root, { recursive: true }, (_event, name) => {
  if (!name) return
  if (/^(site|\.docs-cache|node_modules|\.git)([\\/]|$)/.test(name)) return
  rebuild()
})
