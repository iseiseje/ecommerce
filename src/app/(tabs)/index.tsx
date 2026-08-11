import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { supabase } from '../../utils/supabase';
import { useRouter } from 'expo-router';
import { SearchBar } from '../../components/SearchBar';
import { CategorySelector } from '../../components/CategorySelector';
import { BannerCarousel } from '../../components/BannerCarousel';
import { FlashSale } from '../../components/FlashSale';
import { ProductCard, ProductItem } from '../../components/ProductCard';
import {
  CategoryItem,
  getCategories,
  subscribeToCategoryChanges,
} from '../../services/categoryService';
import { useCart } from '../../context/CartContext';
import { Ionicons } from '@expo/vector-icons';

const MOCK_PRODUCTS: ProductItem[] = [
  {
    id: 'm1',
    name: 'Nike Air Max 270 React',
    price: 189.99,
    original_price: 240.0,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    category: 'Nike',
    rating: 4.9,
    reviews_count: 128,
  },
  {
    id: 'm2',
    name: 'Adidas Ultraboost Light',
    price: 159.5,
    original_price: 199.0,
    image_url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80',
    category: 'Adidas',
    rating: 4.8,
    reviews_count: 94,
  },
  {
    id: 'm3',
    name: 'Puma RS-X3 Puzzle Sneaker',
    price: 120.0,
    original_price: 150.0,
    image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80',
    category: 'Puma',
    rating: 4.7,
    reviews_count: 67,
  },
  {
    id: 'm4',
    name: 'Rolex Submariner Date Gold',
    price: 999.0,
    original_price: 1200.0,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    category: 'Rolex',
    rating: 5.0,
    reviews_count: 310,
  },
  {
    id: 'm5',
    name: 'Gucci Ophidia GG Mini Bag',
    price: 450.0,
    original_price: 550.0,
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
    category: 'Gucci',
    rating: 4.9,
    reviews_count: 82,
  },
  {
    id: 'm6',
    name: 'Classic White Air Force 1',
    price: 110.0,
    original_price: 135.0,
    image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
    category: 'Nike',
    rating: 4.8,
    reviews_count: 215,
  },
];

export default function ShopHomeScreen() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const router = useRouter();
  const { addToCart } = useCart();
  const { width } = useWindowDimensions();

  // Responsive columns based on screen width
  const numColumns = width >= 1024 ? 4 : width >= 768 ? 3 : 2;

  useEffect(() => {
    fetchProducts();
    loadCategories();

    // Subscribe to Supabase Realtime for instant category auto-update when Admin edits categories in VPS!
    const unsubscribe = subscribeToCategoryChanges(() => {
      console.log('Categories updated via Supabase Realtime from VPS Admin!');
      loadCategories();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    filterData();
  }, [searchQuery, selectedCategory, products]);

  const loadCategories = async () => {
    const list = await getCategories();
    setCategories(list);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setProducts(MOCK_PRODUCTS);
      } else {
        setProducts(data);
      }
    } catch (e) {
      setProducts(MOCK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let result = [...products];

    if (selectedCategory !== 'all') {
      result = result.filter(
        (p) =>
          p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          p.category?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.category && p.category.toLowerCase().includes(query))
      );
    }

    setFilteredProducts(result);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Top Welcome Bar */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greetingText}>Halo, Explorer 👋</Text>
          <Text style={styles.titleText}>Temukan Style Favoritmu</Text>
        </View>
        <TouchableOpacity style={styles.avatarButton} onPress={() => router.push('/profile')}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            }}
            style={styles.avatarImage}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Dynamic Supabase Categories (Read-Only Client) */}
      <CategorySelector
        categories={categories}
        selectedCategoryId={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Promo Banner Carousel */}
      <BannerCarousel
        onBannerPress={(banner) => {
          if (banner.id === '2') {
            router.push('/product/m1');
          }
        }}
      />

      {/* Flash Sale Component */}
      <FlashSale />

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Produk Populer</Text>
        <TouchableOpacity onPress={() => setSelectedCategory('all')}>
          <Text style={styles.seeAllText}>Lihat Semua</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        key={numColumns}
        data={filteredProducts}
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
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Produk tidak ditemukan</Text>
            <Text style={styles.emptySub}>Coba kata kunci atau kategori lainnya</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  listPadding: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  greetingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '700',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
});
