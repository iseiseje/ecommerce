import React, { useEffect, useState, useRef } from 'react';
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
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../utils/supabase';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
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
    description: 'Nike Air Max 270 React memberikan kenyamanan ekstra sepanjang hari.',
    product_media: [],
    product_variants: [],
  }
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTryOnVisible, setTryOnVisible] = useState(false);
  const { width: screenWidth } = useWindowDimensions();

  // Selected variants
  const [selectedVariants, setSelectedVariants] = useState<Record<string, any>>({});

  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_media(*), product_variants(*)')
        .eq('id', id)
        .single();
        
      if (error || !data) {
        const fallbackKey = String(id);
        setProduct(MOCK_FALLBACK[fallbackKey] || MOCK_FALLBACK.m1);
      } else {
        setProduct(data);
        // Pre-select first variant of each attribute type
        if (data.product_variants && data.product_variants.length > 0) {
          const defaultSelection: Record<string, any> = {};
          const groups = groupVariants(data.product_variants);
          Object.keys(groups).forEach(attr => {
            defaultSelection[attr] = groups[attr][0]; // Select the first one
          });
          setSelectedVariants(defaultSelection);
        }
      }
    } catch (e) {
      setProduct(MOCK_FALLBACK.m1);
    } finally {
      setLoading(false);
    }
  };

  const groupVariants = (variants: any[]) => {
    return variants.reduce((acc: any, curr: any) => {
      const attr = curr.attribute_name;
      if (!acc[attr]) acc[attr] = [];
      acc[attr].push(curr);
      return acc;
    }, {});
  };

  const handleSelectVariant = (attrName: string, variant: any) => {
    setSelectedVariants(prev => ({
      ...prev,
      [attrName]: variant
    }));
  };

  const handleAddToCart = () => {
    // Collect selected options to string
    const color = selectedVariants['Color']?.attribute_value || selectedVariants['Warna']?.attribute_value || 'Default';
    const size = selectedVariants['Size']?.attribute_value || selectedVariants['Ukuran']?.attribute_value || 'Default';

    // The cart context currently accepts item, color, size, qty
    // Let's pass the adjusted price object
    const cartItem = {
      ...product,
      price: currentPrice
    };

    addToCart(cartItem, color, size, 1);
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
  
  // Calculate price with adjustments
  let priceAdjustment = 0;
  Object.values(selectedVariants).forEach((variant: any) => {
    if (variant && variant.price_adjustment) {
      priceAdjustment += Number(variant.price_adjustment);
    }
  });

  const currentPrice = Number(product.price) + priceAdjustment;
  const originalPrice = product.discount_price || (currentPrice * 1.25);
  
  // Prepare media array
  const mediaList = product.product_media && product.product_media.length > 0 
    ? product.product_media.map((m: any) => m.url)
    : [product.image_url];

  // Group variants
  const groupedVariants = groupVariants(product.product_variants || []);

  const renderMediaItem = ({ item }: { item: string }) => (
    <View style={{ width: screenWidth, height: 380 }}>
      <Image source={{ uri: item }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Image Header with Carousel */}
          <View style={styles.imageWrapper}>
            <FlatList
              data={mediaList}
              keyExtractor={(item, index) => String(index)}
              renderItem={renderMediaItem}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              bounces={false}
            />
            
            {/* Top Action Controls */}
            <TouchableOpacity style={styles.topBackBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.topFavBtn} onPress={() => toggleFavorite(product)}>
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={22}
                color={favorite ? '#FF4D4D' : '#0F172A'}
              />
            </TouchableOpacity>
          </View>

          {/* Details Content */}
          <View style={styles.detailsContainer}>
            <View style={styles.categoryRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {product.category?.name || product.category || 'Terbaru'}
                </Text>
              </View>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#FFB300" />
                <Text style={styles.ratingVal}>{product.rating || '4.8'}</Text>
              </View>
            </View>

            <Text style={styles.productName}>{product.name}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.priceText}>Rp {currentPrice.toLocaleString('id-ID')}</Text>
            </View>

            {/* Dynamic Variant Selectors */}
            {Object.keys(groupedVariants).map((attrName) => (
              <View key={attrName} style={styles.variantSection}>
                <Text style={styles.variantTitle}>Pilih {attrName}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.variantRow}>
                  {groupedVariants[attrName].map((variant: any) => {
                    const isSelected = selectedVariants[attrName]?.id === variant.id;
                    return (
                      <TouchableOpacity
                        key={variant.id}
                        style={[styles.variantChip, isSelected && styles.variantChipSelected]}
                        onPress={() => handleSelectVariant(attrName, variant)}
                      >
                        <Text style={[styles.variantText, isSelected && styles.variantTextSelected]}>
                          {variant.attribute_value}
                        </Text>
                        {Number(variant.price_adjustment) > 0 && (
                          <Text style={[styles.variantExtraPrice, isSelected && styles.variantTextSelected]}>
                            +Rp {Number(variant.price_adjustment).toLocaleString('id-ID')}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ))}

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
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 110 },
  imageWrapper: { position: 'relative', width: '100%', height: 380, backgroundColor: '#F5F6F8' },
  productImage: { height: '100%' },
  topBackBtn: { position: 'absolute', top: 16, left: 16, backgroundColor: '#FFFFFF', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  topFavBtn: { position: 'absolute', top: 16, right: 16, backgroundColor: '#FFFFFF', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  detailsContainer: { padding: 20, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 12, fontWeight: '700', color: '#4F46E5', textTransform: 'uppercase' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingVal: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  productName: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 16 },
  priceText: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  
  variantSection: { marginBottom: 16 },
  variantTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  variantRow: { gap: 8 },
  variantChip: { minWidth: 44, height: 40, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', gap: 4 },
  variantChipSelected: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  variantText: { fontSize: 14, fontWeight: '600', color: '#475569' },
  variantTextSelected: { color: '#FFFFFF' },
  variantExtraPrice: { fontSize: 10, color: '#64748B', fontWeight: '500' },
  
  descSection: { marginTop: 8 },
  descTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  descText: { fontSize: 14, color: '#64748B', lineHeight: 22 },
  floatingBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', gap: 12, shadowColor: '#0F172A', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 8 },
  tryOnButton: { flex: 1, backgroundColor: '#F1F5F9', paddingVertical: 14, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  tryOnButtonText: { color: '#0F172A', fontWeight: '700', fontSize: 14 },
  addToCartButton: { flex: 1.2, backgroundColor: '#0F172A', paddingVertical: 14, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  addToCartText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
