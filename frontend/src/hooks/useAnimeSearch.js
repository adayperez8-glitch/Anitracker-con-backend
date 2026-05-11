import { useAnime } from '../context/AnimeContext'

export function useAnimeSearch() {
  const { results, loading, error, pagination, search, fetchTopAnime, fetchById } = useAnime()
  return { results, loading, error, pagination, search, fetchTopAnime, fetchById }
}