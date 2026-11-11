# Cloudflare CDN untuk GitHub Pages

Situs tetap di-deploy ke **GitHub Pages** (`.github/workflows/deploy-pages.yml`).
Cloudflare hanya lapisan CDN di depannya: TLS, HTTP/3, Brotli, edge cache, dan
header keamanan.

```
pengunjung → Cloudflare (edge cache) → GitHub Pages (origin)
```

GitHub Pages selalu mengirim `Cache-Control: max-age=600` dan tidak mendukung
header kustom, jadi satu-satunya cara memperpanjang cache adalah menaruh zona
`minilabs.id` di Cloudflare dan meng-override TTL lewat **Cache Rules**.

## Kenapa bukan Worker proxy

Karena repo punya `CNAME`, GitHub Pages me-301 **semua** URL
`minilabs-id.github.io/minilabs/*` ke `https://minilabs.id/*`. Proxy Worker yang
memanggil origin akan berputar balik ke domain sendiri (loop). CDN yang benar
adalah DNS *proxied*, bukan proxy aplikasi.

## Langkah sekali jalan

1. **Pindahkan DNS ke Cloudflare** (tidak bisa via API dengan token saat ini —
   butuh `zone:write`):
   - Dashboard Cloudflare → *Add a site* → `minilabs.id` → paket Free.
   - Cloudflare memberi dua nameserver, mis. `xxx.ns.cloudflare.com`.
   - Di Hostinger (hPanel → DNS / Nameservers) ganti kedua NS
     `byte.dns-parking.com` / `pixel.dns-parking.com` dengan pasangan itu.
   - Propagasi NS biasanya < 1 jam.
2. **Buat record DNS di Cloudflare** (proxied / awan oranye):
   | Type | Name | Content | Proxy |
   | :-- | :-- | :-- | :-- |
   | A | `@` | `185.199.108.153` | Proxied |
   | A | `@` | `185.199.109.153` | Proxied |
   | A | `@` | `185.199.110.153` | Proxied |
   | A | `@` | `185.199.111.153` | Proxied |
   | CNAME | `www` | `minilabs-id.github.io` | Proxied |
3. **SSL/TLS → Overview**: mode **Full (strict)** (sertifikat GitHub untuk
   `minilabs.id` sudah valid).
4. **Jalankan** `bun cloudflare/setup.ts` dengan token yang punya
   *Zone → Cache Rules → Edit* + *Zone → Settings → Edit*:

   ```sh
   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ZONE=minilabs.id bun cloudflare/setup.ts
   ```

   Script ini idempoten dan mengatur:
   - Cache Rule aset (`/fonts/*`, `/app.js`, `/logo.svg`, `og.*`) →
     edge + browser TTL 1 tahun.
   - Cache Rule HTML → TTL mengikuti origin (`max-age=600`).
   - Brotli, HTTP/3, Always Use HTTPS, HSTS, Early Hints.
   - Redirect `www.minilabs.id` → `minilabs.id`.

   Atau setel Cache Rules manual di dashboard (Rules → Cache Rules) dengan
   aturan yang sama bila tidak ingin memberi token tambahan.

## Verifikasi

```sh
curl -sI https://minilabs.id/fonts/space-grotesk-var.woff2 | grep -i 'cf-cache-status\|cache-control'
# harapan: cf-cache-status: HIT, cache-control: public, max-age=31536000, immutable
```

## Catatan aset

`build.ts` menambahkan `?v=<hash isi>` pada `app.js`, `logo.svg`, dan font.
Dengan TTL setahun, perubahan berkas tetap langsung terpakai karena URL-nya
berubah. HTML tidak diberi `?v=` dan selalu revalidasi.
