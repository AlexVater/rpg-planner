import { describe, expect, it } from 'vitest'
import { backlinks, buildGraph, isAncestor } from './graph'
import { createNote } from './campaign'

const taverna = createNote({ title: 'Taverna', type: 'local' })
const gandar = createNote({ title: 'Gandar', type: 'npc', body: 'Mora na [[Taverna]]. Tem a [[Espada Perdida]].' })
const quarto = createNote({ title: 'Quarto secreto', type: 'local', parentId: taverna.id, body: '[[taverna]]' })
const notes = [taverna, gandar, quarto]

describe('buildGraph', () => {
  it('creates link, parent and ghost edges', () => {
    const { nodes, links } = buildGraph(notes)
    expect(nodes.map((n) => n.title)).toEqual(['Taverna', 'Gandar', 'Quarto secreto', 'Espada Perdida'])
    expect(nodes[3].type).toBe('ghost')
    expect(links).toContainEqual({ source: gandar.id, target: taverna.id, kind: 'link' })
    expect(links).toContainEqual({ source: taverna.id, target: quarto.id, kind: 'parent' })
    expect(links).toContainEqual({ source: quarto.id, target: taverna.id, kind: 'link' })
  })

  it('hides filtered types and their edges', () => {
    const { nodes, links } = buildGraph(notes, new Set(['npc']))
    expect(nodes.map((n) => n.title)).toEqual(['Gandar', 'Espada Perdida'])
    expect(links).toHaveLength(1)
  })
})

describe('backlinks', () => {
  it('lists notes linking to a note', () => {
    expect(backlinks(notes, taverna).map((n) => n.title)).toEqual(['Gandar', 'Quarto secreto'])
  })
})

describe('isAncestor', () => {
  it('detects ancestry and self', () => {
    expect(isAncestor(notes, taverna.id, quarto.id)).toBe(true)
    expect(isAncestor(notes, quarto.id, taverna.id)).toBe(false)
    expect(isAncestor(notes, quarto.id, quarto.id)).toBe(true)
  })
})
