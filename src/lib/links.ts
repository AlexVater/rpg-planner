import type { Note } from '../types'

const LINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

export interface ParsedLink {
  target: string
  alias?: string
}

export function normalizeTitle(title: string): string {
  return title.trim().toLowerCase()
}

/** Extracts `[[Title]]` and `[[Title|alias]]` links from markdown text. */
export function parseLinks(body: string): ParsedLink[] {
  const links: ParsedLink[] = []
  for (const m of body.matchAll(LINK_RE)) {
    const target = m[1].trim()
    if (!target) continue
    links.push(m[2] ? { target, alias: m[2].trim() } : { target })
  }
  return links
}

/** Case-insensitive title lookup; first match wins. */
export function findByTitle(notes: Note[], title: string): Note | undefined {
  const key = normalizeTitle(title)
  return notes.find((n) => normalizeTitle(n.title) === key)
}

/** Rewrites `[[oldTitle]]` (keeping any alias) to `[[newTitle]]` in a body. */
export function renameLinksInBody(body: string, oldTitle: string, newTitle: string): string {
  const key = normalizeTitle(oldTitle)
  return body.replace(LINK_RE, (full, target: string, alias?: string) => {
    if (normalizeTitle(target) !== key) return full
    return alias ? `[[${newTitle}|${alias}]]` : `[[${newTitle}]]`
  })
}

/** Turns wiki links into markdown links with a `#note:` href for the preview renderer. */
export function wikiToMarkdown(body: string): string {
  return body.replace(LINK_RE, (_full, target: string, alias?: string) => {
    const label = (alias ?? target).trim()
    return `[${label}](#note:${encodeURIComponent(target.trim())})`
  })
}
