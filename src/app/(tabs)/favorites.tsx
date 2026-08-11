import React from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, useWindowDimensions } from 'react-native';
import { useFavorites } from '../../context/FavoritesContext';
import { ProductCard } from '../../components/ProductCard';
import { EmptyState } from '../../components/EmptyState';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'expo-router';

export default function FavoritesScreen() {
  const { favorites } = useFavorites();
  const { addToCart } = useCart();
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Responsive columns based on screen width
  const numColumns = width >= 1024 ? 4 : width >= 768 ? 3 : 2;

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
        key={numColumns}
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={{ flex: 1, padding: 8, maxWidth: `${100 / numColumns}%` }}>
            <ProductCard
              product={item}
              onPress={() => router.push(`/product/${item.id}`)}
              onAddToCart={() => addToCart(item)}
            />
          </View>
        )}
        numColumns={numColumns}
        contentContainerStyle={styles.listPadding}
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
