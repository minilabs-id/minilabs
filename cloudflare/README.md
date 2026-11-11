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
4. **Setel cache panjang.** Dua pilihan:

   **A. Dashboard (tanpa token tambahan)** — Rules → Cache Rules → *Create rule*:
   - Name: `MiniLabs aset immutable`
   - If: `URI Path` `starts with` `/fonts/`
     **OR** `URI Path` `equals` `/app.js`
     **OR** `URI Path` `equals` `/logo.svg`

   Then: *Eligible for cache*, *Edge TTL* → **Override origin** `1 year`,
   *Browser TTL* → **Override origin** `1 year`.

   **B. Script idempoten** — butuh token dengan *Zone → Cache Rules → Edit*:
   ```sh
   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ZONE=minilabs.id bun cloudflare/setup.ts --dry-run
   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ZONE=minilabs.id bun cloudflare/setup.ts
   ```
   Script juga menyalakan Brotli, HTTP/3, Always Use HTTPS, HSTS, Early Hints,
   dan SSL *Full (strict)*.

   HTML sengaja dibiarkan mengikuti perilaku default: Cloudflare tidak
   meng-cache HTML, dan GitHub Pages sudah mengirim `max-age=600` sendiri —
   sehingga perubahan konten tetap cepat terlihat.

## Verifikasi

```sh
curl -sI https://minilabs.id/fonts/space-grotesk-var.woff2 | grep -i "cf-cache-status\|cache-control"
# harapan: cf-cache-status: HIT, cache-control: public, max-age=31536000, immutable
```

`cf-cache-status` hanya muncul setelah DNS proxied (awan oranye) aktif.

## Catatan aset

`build.ts` menambahkan `?v=<hash isi>` pada `app.js`, `logo.svg`, dan font.
Dengan TTL setahun, perubahan berkas tetap langsung terpakai karena URL-nya
berubah. HTML tidak diberi `?v=` dan selalu revalidasi.
