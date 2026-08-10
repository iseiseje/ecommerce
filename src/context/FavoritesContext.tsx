import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesContextType {
  favorites: any[];
  toggleFavorite: (product: any) => void;
  isFavorite: (productId: string | number) => boolean;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  toggleFavorite: () => {},
  isFavorite: () => false,
  favoritesCount: 0,
});

export const useFavorites = () => useContext(FavoritesContext);

const STORAGE_KEY = '@ecommerce_favorites_v1';

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading favorites:', e);
    }
  };

  const saveFavorites = async (items: any[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving favorites:', e);
    }
  };

  const toggleFavorite = (product: any) => {
    setFavorites((prev) => {
      const exists = prev.some((item) => String(item.id) === String(product.id));
      let updated;
      if (exists) {
        updated = prev.filter((item) => String(item.id) !== String(product.id));
      } else {
        updated = [...prev, product];
      }
      saveFavorites(updated);
      return updated;
    });
  };

  const isFavorite = (productId: string | number) => {
    return favorites.some((item) => String(item.id) === String(productId));
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        favoritesCount: favorites.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
