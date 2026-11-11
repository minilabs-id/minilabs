# MiniLabs

Situs publik MiniLabs: hub statis (bilingual **id/en**) untuk proyek &
eksperimen MiniLabs — MiniCode, MiniBug, MiniBot, MiniWord — plus halaman
dokumentasi yang dirender otomatis dari repo tiap proyek.

Statis murni, **zero-dependency** (hanya `node:fs`/`node:path` + `Bun`), tanpa
bundler dan tanpa framework. Semua HTML, XML, dan JSON di bawah `site/` adalah
hasil generate dari [`build.ts`](./build.ts) — jangan edit `site/` secara manual.

## Kebutuhan

- [Bun](https://bun.sh) `>= 1.1.13` (lihat `engines` di `package.json`)
- `git` (dipakai untuk mengambil dokumentasi proyek saat build)

## Perintah

```sh
bun build.ts     # atau: bun run build  → generate situs ke ./site
bun server.ts    # atau: bun run dev    → dev server + rebuild otomatis (PORT, default 4321)
bun check.ts     # atau: bun run check  → build lalu validasi output (smoke test)
```

`bun check.ts` menjalankan build, lalu memeriksa file wajib, manifest
ARD/ai-catalog, struktur HTML (satu `<h1>`, `<html lang>`, hook no-JS),
konsistensi tautan internal, `sitemap.xml`, dan `robots.txt`. Jalankan ini
sebelum push — CI juga menjalankannya.

## Struktur

| Path | Peran |
| :-- | :-- |
| `build.ts` | Generator situs (entry point). Menulis seluruh `site/`. |
| `projects.ts` | **Satu sumber kebenaran** daftar proyek + metadata discovery ARD. |
| `copy.ts` | Salinan/teks antarmuka per bahasa (navigasi, hero, seksi, 404). |
| `catalog.ts` | Pembangun manifest ARD `ard.json` + `ai-catalog.json`. |
| `docs.ts` | Renderer markdown minimal + pengambil `docs/**` dari repo proyek. |
| `server.ts` | Dev server (sajikan `site/`, rebuild saat sumber berubah). |
| `check.ts` | Validator/smoke test output build. |
| `styles.css` | CSS sumber — di-*inline* ke `<head>` tiap halaman saat build (hapus render-blocking). |
| `fonts/` | Font self-hosted (woff2, subset latin) — disalin ke `site/fonts/`. |
| `app.js`, `logo.svg`, `CNAME` | Aset statis yang disalin ke `site/`. |
| `site/`, `.docs-cache/` | Hasil build & cache klon (gitignored). |

## Menambah / mengubah proyek

Edit hanya [`projects.ts`](./projects.ts): tambahkan objek `Project` ke array
`PROJECTS`. `content.id` dan `content.en` masing-masing berisi `tagline`,
`overview`, dan opsional `highlights`, `install` (dengan `command`), serta
`plannedNote`.

- `status`: `"live"`, `"beta"`, atau `"planned"`.
- `repo`: slug `owner/name` GitHub. Jika ada, halaman dokumentasi dibangun dari
  `docs/**.md` repo tersebut (ditampilkan dalam bahasa Indonesia — konten
  dokumen hanya dirender sekali di namespace `id`).

## Discovery untuk agen & registry (ARD)

Situs mempublikasikan **[Agentic Resource Discovery](https://github.com/ards-project/ard-spec)**
(ARD) manifest agar agen dan registry AI dapat menemukan resource MiniLabs:

- `/.well-known/ard.json` — path kanonik ARD (spesifikasi §5.1).
- `/.well-known/ai-catalog.json` — path pendahulu; isinya setara.
- Tiap halaman menyertakan `<link rel="ard" ...>` dan `<link rel="ai-catalog" ...>`.
- `robots.txt` mencantumkan URL manifest di komentar; tiap halaman juga
  menautkannya lewat `<link rel="ard" ...>`.

Manifest dibangun dari [`catalog.ts`](./catalog.ts) dengan sumber data
`discovery` di [`projects.ts`](./projects.ts). Hanya proyek berstatus `live`
yang punya blok `discovery` yang diiklankan — proyek `planned` sengaja
dikeluarkan agar registry tidak mengindeks resource yang belum ada.

Untuk mempublikasikan proyek sebagai resource yang bisa ditemukan agen, tambahkan blok
`discovery` (lihat tipe `ProjectDiscovery`): `namespace` (segmen URN, mis.
`agent`), `type` (IANA media type, mis. `application/agent-card+json`), `url`
kanonik dokumen artifact, `capabilities`, `tags`, dan `representativeQueries`
(2–5 contoh query natural-language — sinyal indeks semantik registry).

## Deploy

`.github/workflows/deploy-pages.yml` men-deploy ke GitHub Pages pada push ke
`main`, dispatch manual, `repository_dispatch` (`update-docs` dari repo proyek),
dan jadwal harian. Dokumentasi proyek di-cache via `actions/cache` agar tidak
selalu klon dari nol.

## Lisensi

[MIT](./LICENSE) © 2026 MiniLabs
