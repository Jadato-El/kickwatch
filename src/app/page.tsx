import { supabase } from '@/lib/supabase'
import MatchesList from '@/components/MatchesList'

export default async function HomePage() {
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true })

  if (error) return <div className="p-8">Erreur : {error.message}</div>

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Kickwatch</h1>
      <MatchesList matches={matches || []} />
    </div>
  )
}