// ────────────────────────────────────────────────
// 影视大全 - 收藏 & 历史 React Hook
// ────────────────────────────────────────────────

import { useState, useCallback } from 'react'
import * as storage from '../services/storage'
import type { FavoriteItem, HistoryItem } from '../services/storage'
import type { MovieItem } from '../types'

export type { FavoriteItem, HistoryItem }

export function useMovieStorage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => storage.getFavorites())
  const [history, setHistory] = useState<HistoryItem[]>(() => storage.getHistory())

  // ── 收藏 ──

  const toggleFavorite = useCallback((movie: MovieItem) => {
    if (storage.isFavorite(movie.id)) {
      setFavorites(storage.removeFavorite(movie.id))
    } else {
      setFavorites(storage.addFavorite(movie))
    }
  }, [])

  const checkFavorite = useCallback(
    (movieId: string) => favorites.some(f => f.id === movieId),
    [favorites],
  )

  const removeFromFavorites = useCallback((movieId: string) => {
    setFavorites(storage.removeFavorite(movieId))
  }, [])

  const clearAllFavorites = useCallback(() => {
    storage.clearFavorites()
    setFavorites([])
  }, [])

  // ── 历史 ──

  const addToHistory = useCallback(
    (movie: MovieItem, episodeId?: string, episodeName?: string) => {
      setHistory(storage.addHistory(movie, episodeId, episodeName))
    },
    [],
  )

  const removeFromHistory = useCallback((movieId: string, episodeId?: string) => {
    setHistory(storage.removeHistory(movieId, episodeId))
  }, [])

  const clearAllHistory = useCallback(() => {
    storage.clearHistory()
    setHistory([])
  }, [])

  return {
    favorites,
    history,
    toggleFavorite,
    checkFavorite,
    addToHistory,
    removeFromFavorites,
    removeFromHistory,
    clearAllFavorites,
    clearAllHistory,
    getStorageSize: storage.getStorageSize,
  }
}
