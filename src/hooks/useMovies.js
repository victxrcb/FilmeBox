import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function dbToMovie(m) {
  return {
    id:         m.id,
    userId:     m.user_id,
    nome:       m.nome,
    genero:     m.genero     || '',
    sinopse:    m.sinopse    || '',
    observacao: m.observacao || '',
    imagem:     m.imagem     || '',
    favorito:   m.favorito   || false,
    status:     m.status     || null,
    avaliacao:  m.avaliacao  || null,
    tmdbID:     m.tmdb_id    || null,
    createdAt:  m.created_at,
  }
}

export function useMovies(userId) {
  const [movies, setMovies] = useState([])

  const refresh = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('movies')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (data) setMovies(data.map(dbToMovie))
  }, [userId])

  useEffect(() => { refresh() }, [refresh])

  async function addMovie(data) {
    const { data: row } = await supabase
      .from('movies')
      .insert({
        user_id:    userId,
        nome:       data.nome,
        genero:     data.genero     || '',
        sinopse:    data.sinopse    || '',
        observacao: data.observacao || '',
        imagem:     data.imagem     || '',
        favorito:   false,
        status:     data.status     || null,
        avaliacao:  data.avaliacao  || null,
        tmdb_id:    data.tmdbID     || null,
      })
      .select()
      .single()
    if (row) setMovies((prev) => [dbToMovie(row), ...prev])
  }

  async function updateMovie(id, data) {
    const dbData = {}
    if ('nome'       in data) dbData.nome       = data.nome
    if ('genero'     in data) dbData.genero     = data.genero
    if ('sinopse'    in data) dbData.sinopse    = data.sinopse
    if ('observacao' in data) dbData.observacao = data.observacao
    if ('imagem'     in data) dbData.imagem     = data.imagem
    if ('favorito'   in data) dbData.favorito   = data.favorito
    if ('status'     in data) dbData.status     = data.status
    if ('avaliacao'  in data) dbData.avaliacao  = data.avaliacao

    await supabase.from('movies').update(dbData).eq('id', id)
    setMovies((prev) => prev.map((m) => m.id === id ? { ...m, ...data } : m))
  }

  async function deleteMovie(id) {
    await supabase.from('movies').delete().eq('id', id)
    setMovies((prev) => prev.filter((m) => m.id !== id))
  }

  async function toggleFavorite(id) {
    const movie = movies.find((m) => m.id === id)
    if (!movie) return
    const newVal = !movie.favorito
    await supabase.from('movies').update({ favorito: newVal }).eq('id', id)
    setMovies((prev) => prev.map((m) => m.id === id ? { ...m, favorito: newVal } : m))
  }

  return { movies, addMovie, updateMovie, deleteMovie, toggleFavorite, refresh }
}
