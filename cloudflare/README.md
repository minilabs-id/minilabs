# Tutorial: CDN Cloudflare untuk GitHub Pages

Tutorial lengkap memasang **Cloudflare sebagai CDN** di depan situs
**GitHub Pages** `minilabs.id`. GitHub Pages tetap menjadi satu-satunya host —
deploy tidak dipindahkan. Cloudflare hanya berdiri di depannya sebagai CDN,
TLS, dan edge cache.

```
pengunjung ──► Cloudflare edge (cache aset 1 tahun)
                    │
                    ▼
          GitHub Pages (origin, selalu max-age=600)
```

## Prasyarat

- Akun Cloudflare (gratis) — sudah ada: `ngodingsendiri@gmail.com`.
- Akses DNS Hostinger (hPanel) — DNS `minilabs.id` saat ini di Hostinger.
- Akses repo `minilabs-id/minilabs` (sudah ada).
- CLI `curl` untuk verifikasi.

---

## Langkah 1 — Tambahkan situs di Cloudflare

1. Buka **https://dash.cloudflare.com** dan login.
2. Klik **Add a site** (di homepage).
3. Ketik `minilabs.id` → **Continue** → pilih paket **Free** → **Continue**.
4. Cloudflare memindai DNS lama (dari Hostinger) dan menampilkan daftar record.
   Biasanya 4 record `A` `@` → `185.199.108–111.153` ikut terdeteksi.
   - Centang semua record → **Continue**.
   - *Simpan dulu catatan rekaman ini, akan dicek di Langkah 3.*
5. Cloudflare menampilkan **dua nameserver** baru, misalnya:
   ```
   alice.ns.cloudflare.com
   bob.ns.cloudflare.com
   ```
   Salin keduanya — dipakai di Langkah 2.
   Jangan tutup halaman ini sebelum NS di Hostinger diganti dan zona berstatus
   **Active**.

## Langkah 2 — Ganti nameserver di Hostinger

1. Buka **https://hpanel.hostinger.com** → login.
2. Menu **Domains** → pilih `minilabs.id`.
3. Buka tab **DNS / Nameservers** (di bagian *DNS Management*).
4. Di seksi **Change nameservers**, pilih mode **Use custom nameservers**.
5. Ganti kedua nameserver:
   | Sebelum | Sesudah |
   | :-- | :-- |
   | `byte.dns-parking.com` | `alice.ns.cloudflare.com` (dari Langkah 1) |
   | `pixel.dns-parking.com` | `bob.ns.cloudflare.com` (dari Langkah 1) |
6. Simpan. Propagasi nameserver umumnya **< 1 jam** (kadang menit).
7. Kembali ke Cloudflare: halaman *Add a site* akan mendeteksi NS baru otomatis
   dan zona berubah menjadi **Active**.
   - Jika tidak otomatis, tunggu sebentar lalu klik **Check nameservers now**.

> ⛔ **Jangan lanjut sebelum zona berstatus Active.** Cache Rules dan proxy
> tidak akan berfungsi selama NS belum aktif.

## Langkah 3 — Pastikan record DNS + aktifkan proxy

1. Dashboard Cloudflare → pilih **minilabs.id** → menu **DNS → Records**.
2. Pastikan ada 4 record `A` berikut — **semuanya** di posisi **Proxied**
   (awan oranye, bukan abu-abu):
   | Type | Name | Content | Proxy | TTL |
   | :-- | :-- | :-- | :-- | :-- |
   | A | `@` | `185.199.108.153` | 🟠 Proxied | Auto |
   | A | `@` | `185.199.109.153` | 🟠 Proxied | Auto |
   | A | `@` | `185.199.110.153` | 🟠 Proxied | Auto |
   | A | `@` | `185.199.111.153` | 🟠 Proxied | Auto |
   - Jika hasil scan Cloudflare membawanya sebagai *DNS only* (awan abu-abu),
     klik tombol awan tersebut sampai berubah oranye.
   - Jika tidak ada sama sekali: **Add record** dan isi satu per satu.
3. *(Opsional)* Tambahkan `www`:
   | Type | Name | Content | Proxy |
   | :-- | :-- | :-- | :-- |
   | CNAME | `www` | `minilabs-id.github.io` | 🟠 Proxied |

   GitHub Pages otomatis me-redirect `www` → `minilabs.id`.

> ⚠️ **Jangan menghapus file `CNAME` di repo** (`minilabs.id`). GitHub Pages
> memakainya untuk tahu domain kustom; origin tetap valid selama ada di sana.

## Langkah 4 — SSL/TLS Full (strict)

1. Dashboard Cloudflare → **minilabs.id** → menu **SSL/TLS → Overview**.
2. Mode **Encryption mode**: pilih **Full (strict)**.
   - GitHub Pages menyajikan sertifikat valid untuk `minilabs.id`, jadi mode
     ketat aman.
   - Jangan pakai **Flexible** — GitHub selalu mengarahkan HTTP ke HTTPS dan
     hasilnya loop `ERR_TOO_MANY_REDIRECTS`.
3. Di halaman yang sama, nyalakan **Always Use HTTPS** (toggle ON).

## Langkah 5 — Cache Rules (aset 1 tahun)

GitHub Pages mengirim `Cache-Control: max-age=600` dan tidak mendukung header
kustom. Satu-satunya cara memperpanjang = **Cache Rules** di Cloudflare.

1. Dashboard Cloudflare → **minilabs.id** → menu **Rules → Cache Rules**.
2. Klik **Create rule**.
3. Isi:
   - **Rule name**: `MiniLabs aset immutable`
   - **If incoming requests match**: pilih **Custom filter expression**, lalu
     tempel (ganti *Edit expression*):
     ```
     (starts_with(http.request.uri.path, "/fonts/")) or (http.request.uri.path eq "/app.js") or (http.request.uri.path eq "/logo.svg")
     ```
     *(Tampilan builder: URI Path `starts with` `/fonts/` **OR** URI Path
     `equals` `/app.js` **OR** URI Path `equals` `/logo.svg`.)*
   - **Then**:
     | Setelan | Nilai |
     | :-- | :-- |
     | Cache eligibility | **Eligible for cache** |
     | Edge TTL | **Override origin** → **1 year** |
     | Browser TTL | **Override origin** → **1 year** |
4. **Deploy rule**.

> Kenapa aman 1 tahun? `build.ts` menambahkan `?v=<hash isi>` ke semua aset
> (`/app.js?v=…`, `/logo.svg?v=…`, font `?v=…`). Isi berubah ⇒ URL berubah ⇒
> cache lama otomatis tak terpakai. HTML tidak diberi `?v=` dan sengaja tidak
> di-cache (Cloudflare default), jadi konten baru langsung terlihat.

### Alternatif script (opsional)

Repo menyediakan `cloudflare/setup.ts` (idempoten, dengan `--dry-run`) yang
membuat Cache Rule di atas plus Brotli, HTTP/3, Always Use HTTPS, HSTS, Early
Hints, dan SSL strict. Butuh API token dengan scope *Zone → Cache Rules → Edit*:

```sh
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ZONE=minilabs.id bun cloudflare/setup.ts --dry-run
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ZONE=minilabs.id bun cloudflare/setup.ts
```

Rute dashboard di atas tidak memerlukan token tambahan.

---

## Verifikasi

Cek cache aset (jalankan dua kali — yang pertama boleh `MISS`, kedua harus
`HIT`):

```sh
curl -sI https://minilabs.id/fonts/space-grotesk-var.woff2 | grep -i "cf-cache-status\|cache-control"
# Harapan:
#   cache-control: public, max-age=31536000, immutable
#   cf-cache-status: HIT
```

Cek aset JS dan logo:

```sh
curl -sI https://minilabs.id/app.js   | grep -i "cf-cache-status\|cache-control"
curl -sI https://minilabs.id/logo.svg | grep -i "cf-cache-status\|cache-control"
```

Cek halaman utama — tetap `max-age=600` dan **tidak** boleh punya
`cf-cache-status`:

```sh
curl -sI https://minilabs.id/ | grep -i "cf-cache-status\|cache-control"
# Harapan: cache-control: max-age=600  (tanpa cf-cache-status)
```

Cek HTTPS + redirect `www`:

```sh
curl -sI https://minilabs.id/ | head -n 3          # HTTP/2 200, via cloudflare
curl -sI https://www.minilabs.id/ | grep -i "^location"  # 301 → https://minilabs.id/
```

Cek di PageSpeed/Lighthouse: audit **Serve static assets with an efficient
cache policy** harus lolos (tidak ada item `uses-long-cache-ttl`).

## Perubahan kode di repo (sudah diterapkan)

- `build.ts` — semua aset diberi `?v=<hash isi>`; tidak lagi membuat `_headers`
  (khusus Pages, tidak dipakai di GitHub Pages).
- `.github/workflows/deploy-pages.yml` — kembali murni deploy ke GitHub Pages.
- `cloudflare/setup.ts` — script idempoten untuk Cache Rule + setelan zona.
- `wrangler.toml`, Worker `minilabs-cdn`, dan Pages project `minilabs` — semua
  dihapus (pendekatan Pages/Worker tidak dipakai).

## Troubleshooting

| Gejala | Penyebab | Solusi |
| :-- | :-- | :-- |
| `ERR_TOO_MANY_REDIRECTS` | SSL mode masih **Flexible** | Ubah ke **Full (strict)** (Langkah 4) |
| Masih `max-age=600`, tanpa `cf-cache-status` | Record masih *DNS only* (awan abu-abu), atau zona belum Active | Pastikan awan oranye di semua record `A`; zona harus **Active** |
| Respons aset lama terus keluar | Cache Cloudflare/browser dari versi sebelumnya | Cloudflare → **Caching → Configuration → Purge Everything** |
| `cf-cache-status: MISS` untuk `?v=` baru | Normal — hash baru = entri cache baru | Biarkan; request berikutnya `HIT` |
| `minilabs.id` belum HTTPS setelah ganti NS | GitHub Pages butuh hingga 1 jam menerbitkan sertifikat | Tunggu; di repo **Settings → Pages**, hapus lalu tambah ulang custom domain untuk memicu |
| Ada record CAA | GitHub Pages butuh `letsencrypt.org` diizinkan | Pastikan CAA menyertakan `letsencrypt.org` |
| Zona stuck *Pending nameserver* | NS belum cocok persis (spasi/tambahan) | Salin persis 2 NS dari Cloudflare, tanpa karakter ekstra |

## Rollback (kembalikan seperti semula)

1. Hostinger → **DNS / Nameservers** → kembalikan ke
   `byte.dns-parking.com` dan `pixel.dns-parking.com`.
2. Cloudflare → hapus zona `minilabs.id` (*Overview → Remove site*).
3. Situs kembali melayani langsung dari GitHub Pages (tanpa CDN).