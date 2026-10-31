import { describe, expect, it } from 'vitest'
import { findByTitle, parseLinks, renameLinksInBody, wikiToMarkdown } from './links'
import { createNote } from './campaign'

describe('parseLinks', () => {
  it('finds plain and aliased links', () => {
    expect(parseLinks('Vai até [[Taverna]] e fala com [[Gandar|o velho]].')).toEqual([
      { target: 'Taverna' },
      { target: 'Gandar', alias: 'o velho' },
    ])
  })

  it('ignores empty links', () => {
    expect(parseLinks('[[ ]] nada')).toEqual([])
  })
})

describe('findByTitle', () => {
  it('matches case-insensitively and trimmed', () => {
    const n = createNote({ title: 'Taverna do Javali' })
    expect(findByTitle([n], '  taverna DO javali ')).toBe(n)
  })
})

describe('renameLinksInBody', () => {
  it('rewrites matching links and keeps aliases', () => {
    const body = '[[Gandar]] e [[gandar|o velho]] e [[Outro]]'
    expect(renameLinksInBody(body, 'Gandar', 'Gandar, o Cinzento')).toBe(
      '[[Gandar, o Cinzento]] e [[Gandar, o Cinzento|o velho]] e [[Outro]]',
    )
  })
})

describe('wikiToMarkdown', () => {
  it('converts to markdown links with note hrefs', () => {
    expect(wikiToMarkdown('[[A B|alias]]')).toBe('[alias](#note:A%20B)')
  })
})
