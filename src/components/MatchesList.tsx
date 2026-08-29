'use client'

import { useState, useMemo } from 'react'
import WatchlistButton from '@/components/WatchlistButton'
import RatingStars from '@/components/RatingStars'

const PRIORITY_LEAGUES = [
  'UEFA Champions League',
  'UEFA Europa League',
  'UEFA Europa Conference League',
  'Premier League',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'Ligue 1',
]

function leaguePriority(league: string) {
  const index = PRIORITY_LEAGUES.indexOf(league)
  return index === -1 ? PRIORITY_LEAGUES.length : index
}

function getDateTabs() {
  const tabs = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    tabs.push({
      key: d.toISOString().split('T')[0],
      label:
        i === 0
          ? "Aujourd'hui"
          : i === 1
          ? 'Demain'
          : d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
    })
  }
  return tabs
}

export default function MatchesList({ matches }: { matches: any[] }) {
  const dateTabs = useMemo(() => getDateTabs(), [])
  const [selectedDate, setSelectedDate] = useState(dateTabs[0].key)
  const [search, setSearch] = useState('')

  const sorted = useMemo(() => {
    return [...matches].sort((a, b) => {
      const prioDiff = leaguePriority(a.league) - leaguePriority(b.league)
      if (prioDiff !== 0) return prioDiff
      return new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
    })
  }, [matches])

  const byDate = useMemo(() => sorted.filter((m) => m.match_date.startsWith(selectedDate)), [sorted, selectedDate])

  const filtered = useMemo(() => {
    if (!search.trim()) return byDate
    const q = search.toLowerCase()
    return byDate.filter(
      (m) =>
        m.home_team.toLowerCase().includes(q) ||
        m.away_team.toLowerCase().includes(q) ||
        (m.league || '').toLowerCase().includes(q)
    )
  }, [byDate, search])

  const grouped = useMemo(() => {
    const map = new Map<string, any[]>()
    for (const m of filtered) {
      const key = m.league || 'Autres'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(m)
    }
    return Array.from(map.entries())
  }, [filtered])

  return (
    <div>
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {dateTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedDate(tab.key)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs uppercase tracking-wide font-[family-name:var(--font-oswald)] transition-colors ${
              selectedDate === tab.key
                ? 'bg-[#f5a623] text-[#0d1f17] font-semibold'
                : 'border border-[#f0ede4]/20 text-[#f0ede4]/70 hover:border-[#f5a623]/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Chercher une équipe ou une ligue..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-[#14291f] border border-[#f0ede4]/15 rounded px-3 py-2 mb-6 text-sm placeholder:text-[#7c9188] focus:outline-none focus:border-[#f5a623] transition-colors"
      />

      {grouped.length === 0 && <p className="text-sm text-[#7c9188]">Aucun match ce jour-là.</p>}

      <div className="space-y-8">
        {grouped.map(([league, leagueMatches]) => (
          <div key={league}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs uppercase tracking-widest text-[#7c9188] font-[family-name:var(--font-oswald)]">
                {league}
              </span>
              <span className="h-px flex-1 bg-[#f0ede4]/10" />
            </div>
            <div className="space-y-2">
              {leagueMatches.map((match) => (
                <div
                  key={match.id}
                  className="bg-[#14291f] border-l-2 border-[#f0ede4]/10 rounded-r p-4 hover:border-l-[#f5a623]/60 transition-colors"
                >
                  <div className="flex justify-between items-start gap-3">
                    <span className="font-[family-name:var(--font-oswald)] font-medium text-[15px]">
                      {match.home_team} <span className="text-[#7c9188]">vs</span> {match.away_team}
                    </span>
                    <span className="font-[family-name:var(--font-geist-mono)] text-sm text-[#f5a623] shrink-0">
                      {new Date(match.match_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <RatingStars matchId={match.id} />
                    <WatchlistButton matchId={match.id} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}