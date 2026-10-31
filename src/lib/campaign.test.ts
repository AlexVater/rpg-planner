import { describe, expect, it } from 'vitest'
import { createNote, parseCampaign } from './campaign'

describe('parseCampaign', () => {
  it('round-trips a valid campaign', () => {
    const a = createNote({ title: 'A', type: 'npc', tags: ['vilão'] })
    const b = createNote({ title: 'B', parentId: a.id })
    const campaign = { version: 1 as const, name: 'X', notes: [a, b] }
    expect(parseCampaign(JSON.parse(JSON.stringify(campaign)))).toEqual(campaign)
  })

  it('rejects wrong shapes', () => {
    expect(() => parseCampaign(null)).toThrow()
    expect(() => parseCampaign({ version: 2, notes: [] })).toThrow()
    expect(() => parseCampaign({ version: 1 })).toThrow()
    expect(() => parseCampaign({ version: 1, notes: [{ id: 'a' }, { id: 'a' }] })).toThrow(/duplicado/)
  })

  it('fixes unknown types, missing parents and cycles', () => {
    const result = parseCampaign({
      version: 1,
      notes: [
        { id: 'a', type: 'dragão', parentId: 'b' },
        { id: 'b', parentId: 'a' },
        { id: 'c', parentId: 'zzz' },
      ],
    })
    expect(result.notes[0].type).toBe('outro')
    expect(result.notes[2].parentId).toBeUndefined()
    const parents = result.notes.slice(0, 2).map((n) => n.parentId)
    expect(parents.filter(Boolean)).toHaveLength(1)
  })
})
