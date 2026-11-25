import { createContext, useContext, useEffect, useRef, useState } from 'react';

const storageKey = 'corekit.favorites';
const FavoritesContext = createContext(null);

function readFavorites() {
  try {
    const ids = JSON.parse(window.localStorage.getItem(storageKey));
    if (Array.isArray(ids)) return new Set(ids.filter((id) => typeof id === 'string'));
  } catch {
    // Keep the in-memory selection if storage is unavailable.
    return null;
  }
  return new Set();
}

export function FavoritesProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState(() => readFavorites() ?? new Set());
  const storageWritable = useRef(true);

  useEffect(() => {
    function syncFavorites() {
      const stored = readFavorites();
      if (storageWritable.current && stored) setFavoriteIds(stored);
    }
    function onStorage(event) {
      if (event.key === storageKey || event.key === null) syncFavorites();
    }
    window.addEventListener('storage', onStorage);
    window.addEventListener('pageshow', syncFavorites);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pageshow', syncFavorites);
    };
  }, []);

  function toggleFavorite(id) {
    const persisted = storageWritable.current ? readFavorites() : null;
    const next = persisted ?? new Set(favoriteIds);
    if (!next.delete(id)) next.add(id);
    setFavoriteIds(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify([...next]));
      storageWritable.current = true;
    } catch {
      storageWritable.current = false;
    }
  }

  return <FavoritesContext.Provider value={{ favoriteIds, toggleFavorite }}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  return useContext(FavoritesContext);
}

export function HeartIcon() {
  return (
    <svg className="heart-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.5 3.9 12.6a4.8 4.8 0 0 1 6.8-6.8L12 7.1l1.3-1.3a4.8 4.8 0 0 1 6.8 6.8Z" />
    </svg>
  );
}

export function FavoriteButton({ product }) {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const isFavorite = favoriteIds.has(product.id);
  return (
    <button className="favorite-toggle" type="button" aria-label={`Избранное: ${product.name}`}
      aria-pressed={isFavorite} title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
      onClick={() => toggleFavorite(product.id)}>
      <HeartIcon />
    </button>
  );
}
