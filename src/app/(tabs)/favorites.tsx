import React from 'react';
import { View, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useFavorites } from '../../context/FavoritesContext';
import { ProductCard } from '../../components/ProductCard';
import { EmptyState } from '../../components/EmptyState';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'expo-router';

export default function FavoritesScreen() {
  const { favorites } = useFavorites();
  const { addToCart } = useCart();
  const router = useRouter();

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState
          icon="heart-outline"
          title="Wishlist Masih Kosong"
          subtitle="Belum ada produk favorit yang kamu simpan. Tekan ikon hati pada produk untuk menyimpannya di sini!"
          buttonText="Jelajahi Produk"
          onButtonPress={() => router.push('/(tabs)')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => router.push(`/product/${item.id}`)}
            onAddToCart={() => addToCart(item)}
          />
        )}
        numColumns={2}
        contentContainerStyle={styles.listPadding}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listPadding: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});
