import type { Campaign } from '../types'
import { emptyCampaign, parseCampaign } from './campaign'

const KEY = 'rpg-planner:campaign'

export function loadLocal(): Campaign | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? parseCampaign(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function saveLocal(campaign: Campaign): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(campaign))
  } catch {
    // Storage full or blocked: nothing else we can do without a back-end.
  }
}

/** Loads the static seed shipped in `public/campaign.json`. */
export async function loadSeed(): Promise<Campaign> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}campaign.json`)
    if (!res.ok) return emptyCampaign()
    return parseCampaign(await res.json())
  } catch {
    return emptyCampaign()
  }
}

export function downloadCampaign(campaign: Campaign): void {
  const blob = new Blob([JSON.stringify(campaign, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${campaign.name.replace(/[^\w-]+/g, '_') || 'campanha'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function readCampaignFile(file: File): Promise<Campaign> {
  let data: unknown
  try {
    data = JSON.parse(await file.text())
  } catch {
    throw new Error('Arquivo não é um JSON válido.')
  }
  return parseCampaign(data)
}
