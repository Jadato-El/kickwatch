import { supabase } from '@/lib/supabase'
import MatchesList from '@/components/MatchesList'

export default async function HomePage() {
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true })

  if (error) return <div className="max-w-2xl mx-auto px-4 py-8">Erreur : {error.message}</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-[family-name:var(--font-oswald)] uppercase tracking-wide text-2xl font-semibold mb-6">
        Matchday
      </h1>
      <MatchesList matches={matches || []} />
    </div>
  )
}