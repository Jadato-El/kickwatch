import { supabase } from '@/lib/supabase'
import WatchlistButton from '@/components/WatchlistButton'
import RatingStars from '@/components/RatingStars'

export default async function HomePage() {
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true })

  if (error) return <div className="p-8">Erreur : {error.message}</div>

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Kickwatch</h1>
      <div className="space-y-3">
        {matches?.map((match) => (
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
      </div>
    </div>
  )
}