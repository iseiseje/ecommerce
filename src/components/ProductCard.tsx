import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';

export interface ProductItem {
  id: string | number;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  category?: string;
  rating?: number;
  reviews_count?: number;
  is_new?: boolean;
}

interface ProductCardProps {
  product: ProductItem;
  onPress: () => void;
  onAddToCart?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);

  const rating = product.rating || 4;
  const mockColors = ['#C8A287', '#565A6F', '#8FD1F4', '#D4B8F5'];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* Image Area */}
      <View style={styles.imageContainer}>
        {/* Top Header inside Image */}
        <View style={styles.imageTopNav}>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="arrow-back-outline" size={20} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="bag" size={20} color="#333" />
            <View style={styles.bagBadge}>
              <Text style={styles.bagBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Image
          source={{ uri: product.image_url || 'https://via.placeholder.com/300' }}
          style={styles.image}
        />
        
        {/* Carousel Dots */}
        <View style={styles.carouselDots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Floating Heart Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(product)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="heart"
            size={18}
            color={favorite ? '#FF4D4D' : '#D1D5DB'}
          />
        </TouchableOpacity>
      </View>

      {/* Product Details Area */}
      <View style={styles.detailsContainer}>
        <Text style={styles.brandText}>{product.category || 'Brand'}</Text>
        
        <View style={styles.titleRow}>
          <Text style={styles.titleText} numberOfLines={1}>
            {product.name}
          </Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= rating ? 'star' : 'star-outline'}
                size={12}
                color="#FFB300"
              />
            ))}
          </View>
        </View>

        {/* Color and Size Pickers */}
        <View style={styles.optionsContainer}>
          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>COLOR</Text>
            <View style={styles.colorsRow}>
              {mockColors.map((color, index) => (
                <View key={index} style={[styles.colorRing, index === 0 && styles.colorRingActive]}>
                  <View style={[styles.colorDot, { backgroundColor: color }]}>
                    {index === 0 && <Ionicons name="checkmark" size={10} color="#FFF" />}
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>SIZE</Text>
            <View style={styles.sizePicker}>
              <Text style={styles.sizeText}>Small</Text>
              <Ionicons name="chevron-down" size={12} color="#666" />
            </View>
          </View>
        </View>

        {/* Dummy Description */}
        <Text style={styles.descriptionText} numberOfLines={2}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
        </Text>

        {/* Price and Cart Button */}
        <View style={styles.actionRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>Rp {product.price.toLocaleString('id-ID')}</Text>
          </View>
          
          {onAddToCart && (
            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.addToCartText}>ADD TO CART +</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    height: 280,
    backgroundColor: '#F5F6F8',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  imageTopNav: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  navButton: {
    padding: 4,
    position: 'relative',
  },
  bagBadge: {
    position: 'absolute',
    top: 6,
    right: 2,
    backgroundColor: '#000',
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bagBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  carouselDots: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    backgroundColor: '#9CA3AF',
  },
  favoriteButton: {
    position: 'absolute',
    bottom: -20,
    right: 24,
    backgroundColor: '#FFFFFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 20,
  },
  detailsContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  brandText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  optionsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 40,
  },
  optionGroup: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  colorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorRingActive: {
    borderColor: '#C8A287',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignSelf: 'flex-start',
    minWidth: 80,
  },
  sizeText: {
    fontSize: 12,
    color: '#4B5563',
    marginRight: 8,
  },
  descriptionText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceContainer: {
    borderWidth: 1,
    borderColor: '#6B7280',
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: '#4FD1C5',
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
