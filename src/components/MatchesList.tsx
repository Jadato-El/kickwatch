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

  const byDate = useMemo(() => {
    return sorted.filter((m) => m.match_date.startsWith(selectedDate))
  }, [sorted, selectedDate])

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

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {dateTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedDate(tab.key)}
            className={`px-3 py-1 rounded whitespace-nowrap text-sm ${
              selectedDate === tab.key ? 'bg-black text-white' : 'border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Rechercher une équipe ou une ligue..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded p-2 mb-4"
      />

      <div className="space-y-3">
        {filtered.map((match) => (
          <div key={match.id} className="border rounded p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {match.home_team} vs {match.away_team}
              </span>
              <span className="text-sm text-gray-500">{match.league}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1 flex justify-between items-center">
              <span>
                {new Date(match.match_date).toLocaleString('fr-FR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <WatchlistButton matchId={match.id} />
            </div>
            <div className="mt-2">
              <RatingStars matchId={match.id} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-gray-500">Aucun match ce jour-là.</p>}
      </div>
    </div>
  )
}