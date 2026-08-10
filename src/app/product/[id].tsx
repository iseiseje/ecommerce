import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../utils/supabase';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { SizeColorSelector } from '../../components/SizeColorSelector';
import TryOnModal from '../../components/TryOnModal';
import { Ionicons } from '@expo/vector-icons';

const MOCK_FALLBACK: Record<string, any> = {
  m1: {
    id: 'm1',
    name: 'Nike Air Max 270 React',
    price: 189.99,
    original_price: 240.0,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    category: 'Nike Footwear',
    rating: 4.9,
    reviews_count: 128,
    description:
      'Nike Air Max 270 React memberikan kenyamanan ekstra sepanjang hari dengan bantalan busa Max Air 270 yang responsif. Desain futuristik dengan material mesh breathable membuat gaya sehari-hari kamu semakin menonjol.',
  },
  m2: {
    id: 'm2',
    name: 'Adidas Ultraboost Light',
    price: 159.5,
    original_price: 199.0,
    image_url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
    category: 'Adidas Performance',
    rating: 4.8,
    reviews_count: 94,
    description:
      'Rasakan energi tak terbatas dengan Adidas Ultraboost Light. Dibuat dengan materi Light BOOST 30% lebih ringan untuk performa lari maksimal dan daya tahan tinggi.',
  },
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTryOnVisible, setTryOnVisible] = useState(false);

  const [selectedColor, setSelectedColor] = useState('black');
  const [selectedSize, setSelectedSize] = useState('M');

  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error || !data) {
        const fallbackKey = String(id);
        if (MOCK_FALLBACK[fallbackKey]) {
          setProduct(MOCK_FALLBACK[fallbackKey]);
        } else {
          setProduct({
            id,
            name: 'Produk Eksklusif Premium',
            price: 149.99,
            original_price: 199.0,
            image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
            category: 'Fashion Category',
            rating: 4.8,
            reviews_count: 56,
            description: 'Produk fashion berkualitas tinggi dengan desain elegan dan bahan terbaik.',
          });
        }
      } else {
        setProduct(data);
      }
    } catch (e) {
      setProduct(MOCK_FALLBACK.m1);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, selectedColor, selectedSize, 1);
    Alert.alert('Berhasil! 🛒', 'Produk ditambahkan ke keranjang belanja.', [
      { text: 'Lanjut Belanja', style: 'cancel' },
      { text: 'Lihat Keranjang', onPress: () => router.push('/cart') },
    ]);
  };

  if (loading || !product) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  const favorite = isFavorite(product.id);
  const originalPrice = product.original_price || product.price * 1.25;
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Image Header */}
          <View style={styles.imageWrapper}>
            <Image source={{ uri: product.image_url }} style={styles.productImage} />
            
            {/* Top Action Controls */}
            <TouchableOpacity style={styles.topBackBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.topFavBtn}
              onPress={() => toggleFavorite(product)}
            >
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={22}
                color={favorite ? '#FF6B6B' : '#0F172A'}
              />
            </TouchableOpacity>

            {discountPercent > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>HERO SALE -{discountPercent}%</Text>
              </View>
            )}
          </View>

          {/* Details Content */}
          <View style={styles.detailsContainer}>
            <View style={styles.categoryRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{product.category || 'Footwear'}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingVal}>{product.rating || 4.9}</Text>
                <Text style={styles.ratingCount}>({product.reviews_count || 128} ulasan)</Text>
              </View>
            </View>

            <Text style={styles.productName}>{product.name}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.priceText}>${product.price.toFixed(2)}</Text>
              {originalPrice > product.price && (
                <Text style={styles.originalPriceText}>${originalPrice.toFixed(2)}</Text>
              )}
            </View>

            {/* Interactive Color & Size Selector */}
            <SizeColorSelector
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              selectedSize={selectedSize}
              onSelectSize={setSelectedSize}
            />

            {/* Description Section */}
            <View style={styles.descSection}>
              <Text style={styles.descTitle}>Deskripsi Produk</Text>
              <Text style={styles.descText}>
                {product.description || 'Deskripsi tidak tersedia untuk produk ini.'}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Floating Bottom Action Bar */}
        <View style={styles.floatingBar}>
          <TouchableOpacity
            style={styles.tryOnButton}
            onPress={() => setTryOnVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={18} color="#0F172A" />
            <Text style={styles.tryOnButtonText}>Virtual Try-On</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
            activeOpacity={0.85}
          >
            <Ionicons name="cart" size={18} color="#FFFFFF" />
            <Text style={styles.addToCartText}>Beli Sekarang</Text>
          </TouchableOpacity>
        </View>

        {/* Virtual Try-On Modal Component */}
        <TryOnModal
          visible={isTryOnVisible}
          onClose={() => setTryOnVisible(false)}
          product={product}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 380,
    backgroundColor: '#F8FAFC',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topBackBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topFavBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  discountBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  ratingCount: {
    fontSize: 12,
    color: '#64748B',
  },
  productName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 12,
  },
  priceText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  originalPriceText: {
    fontSize: 16,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  descSection: {
    marginTop: 8,
  },
  descTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  descText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
  },
  floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
  },
  tryOnButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  tryOnButtonText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 14,
  },
  addToCartButton: {
    flex: 1.2,
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
