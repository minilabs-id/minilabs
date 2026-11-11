// Manifest discovery ARD (Agentic Resource Discovery).
// Menghasilkan dua dokumen yang setara (spesifikasi ARD §5.1):
//   - .well-known/ard.json        → path kanonik ARD (RFC 8615 well-known).
//   - .well-known/ai-catalog.json → path pendahulu (predecessor), untuk konsumen lama.
// Keduanya divalidasi terhadap schema resmi:
//   https://github.com/ards-project/ard-spec/blob/main/spec/schemas/
// Sumber entri = projects.ts (single source of truth). Proyek `planned` tidak
// diikutsertakan karena belum bisa dipakai agent/registry.

import { PROJECTS } from "./projects.ts"

export const SITE_BASE = "https://minilabs.id"
/** Path kanonik manifest ARD (spesifikasi §5.1). */
export const ARD_PATH = "/.well-known/ard.json"
/** Path pendahulu yang masih dihormati konsumen lama (§5.1). */
export const AI_CATALOG_PATH = "/.well-known/ai-catalog.json"
/** Konteks dasar ARD (§4.1). */
export const ARD_CONTEXT = "https://agenticresourcediscovery.org/context/v1"

export interface CatalogEntry {
  "@context"?: string
  identifier: string
  displayName: string
  type: string
  url: string
  description: string
  capabilities?: string[]
  tags?: string[]
  representativeQueries?: string[]
  metadata?: Record<string, string | number | boolean | null>
}

export interface CatalogHost {
  displayName: string
  documentationUrl: string
  logoUrl: string
}

export function catalogHost(): CatalogHost {
  return {
    displayName: "MiniLabs",
    documentationUrl: `${SITE_BASE}/`,
    logoUrl: `${SITE_BASE}/logo.svg`,
  }
}

/** Semua entri yang boleh ditemukan registry. */
export function catalogEntries(): CatalogEntry[] {
  const entries: CatalogEntry[] = [
    {
      identifier: "urn:air:minilabs.id:catalog:labs",
      displayName: "MiniLabs Catalog",
      type: "application/ai-catalog+json",
      url: `${SITE_BASE}${ARD_PATH}`,
      description:
        "Federated entry source for MiniLabs, an independent studio building focused open-source agentic tools.",
      tags: ["minilabs", "open-source", "studio", "agentic", "catalog"],
      representativeQueries: [
        "what open-source agentic tools does MiniLabs build",
        "find a small auditable coding agent for the terminal",
      ],
    },
  ]

  for (const p of PROJECTS) {
    const d = p.discovery
    if (!d || p.status === "planned") continue
    entries.push({
      identifier: `urn:air:minilabs.id:${d.namespace}:${p.slug}`,
      displayName: p.name,
      type: d.type,
      url: d.url,
      description: p.content.en.tagline,
      capabilities: d.capabilities,
      tags: d.tags,
      representativeQueries: d.representativeQueries,
      metadata: d.metadata,
    })
  }

  return entries
}

function stableStringify(value: unknown): string {
  const json = JSON.stringify(value, null, 2)
  return json
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
}

/**
 * `.well-known/ard.json` — manifest ARD (§5.1).
 * `ArdManifest` hanya mewajibkan `entries`; anggota lain bersifat transport-defined
 * dan diabaikan ARD. Kita tetap sertakan `host`/`specVersion` agar dokumen ini
 * setara dengan path pendahulu (`ai-catalog.json`).
 */
export function buildArdManifest(): string {
  const doc = {
    "@context": ARD_CONTEXT,
    specVersion: "1.0",
    host: catalogHost(),
    entries: catalogEntries().map((e) => ({ "@context": ARD_CONTEXT, ...e })),
  }
  return stableStringify(doc) + "\n"
}

/**
 * `.well-known/ai-catalog.json` — manifest pendahulu (AICatalogManifest).
 * Wajib: `specVersion: "1.0"` + `entries`; tiap entri wajib punya
 * `identifier`/`displayName`/`type` dan tepat satu dari `url`/`data`.
 */
export function buildAiCatalogManifest(): string {
  const doc = {
    specVersion: "1.0",
    host: catalogHost(),
    entries: catalogEntries(),
  }
  return stableStringify(doc) + "\n"
}

/** Jumlah entri (untuk log build / llms.txt). */
export function entryCount(): number {
  return catalogEntries().length
}
