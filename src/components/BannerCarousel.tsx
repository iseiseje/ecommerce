import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;

export interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  buttonText: string;
  bgColor?: string;
}

const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: '1',
    title: 'Diskon Spesial 50%',
    subtitle: 'Koleksi Sepatu & Fashion Terbaru 2026',
    tag: 'LIMITED OFFER',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    buttonText: 'Belanja Sekarang',
  },
  {
    id: '2',
    title: 'Virtual Try-On AI ✨',
    subtitle: 'Coba Baju Secara Instan di Badanku!',
    tag: 'FITUR BARU',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80',
    buttonText: 'Coba Sekarang',
  },
  {
    id: '3',
    title: 'Beli 1 Gratis 1',
    subtitle: 'Khusus Produk Pilihan Nike & Adidas',
    tag: 'PROMO HARI INI',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
    buttonText: 'Lihat Promo',
  },
];

interface BannerCarouselProps {
  banners?: BannerItem[];
  onBannerPress?: (banner: BannerItem) => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners = DEFAULT_BANNERS,
  onBannerPress,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (banners.length > 1) {
        const nextIndex = (activeIndex + 1) % banners.length;
        setActiveIndex(nextIndex);
        scrollViewRef.current?.scrollTo({
          x: nextIndex * BANNER_WIDTH,
          animated: true,
        });
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [activeIndex, banners.length]);

  const handleScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / BANNER_WIDTH);
    if (slide !== activeIndex) {
      setActiveIndex(slide);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={BANNER_WIDTH}
        decelerationRate="fast"
      >
        {banners.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.bannerCard}
            activeOpacity={0.9}
            onPress={() => onBannerPress && onBannerPress(item)}
          >
            <Image source={{ uri: item.image }} style={styles.bannerImage} resizeMode="cover" />
            <View style={styles.overlay} />
            <View style={styles.content}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{item.tag}</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
              <View style={styles.ctaButton}>
                <Text style={styles.ctaText}>{item.buttonText}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {banners.length > 1 && (
        <View style={styles.pagination}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: 170,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  content: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    top: 16,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tagBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  subtitle: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 6,
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ctaText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  activeDot: {
    width: 18,
    backgroundColor: '#0F172A',
  },
});
