import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { supabase } from '../utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export function FlashSale() {
  const [flashSale, setFlashSale] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<{ hours: string, minutes: string, seconds: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchActiveFlashSale();
  }, []);

  useEffect(() => {
    if (!flashSale || !flashSale.end_time) return;

    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(flashSale.end_time).getTime();
      const distance = endTime - now;

      if (distance < 0) {
        clearInterval(intervalId);
        setTimeLeft(null);
        // Maybe fetch again if there's a new one
      } else {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0'),
        });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [flashSale]);

  const fetchActiveFlashSale = async () => {
    // Get the active flash sale that hasn't ended yet
    const { data: fsData, error: fsError } = await supabase
      .from('flash_sales')
      .select('*')
      .eq('is_active', true)
      .gt('end_time', new Date().toISOString())
      .order('end_time', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (fsError || !fsData) {
      console.log('No active flash sale:', fsError?.message);
      return;
    }

    setFlashSale(fsData);

    // Get the items and the actual products
    const { data: itemsData, error: itemsError } = await supabase
      .from('flash_sale_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('flash_sale_id', fsData.id);

    if (!itemsError && itemsData) {
      setItems(itemsData);
    }
  };

  if (!flashSale || !timeLeft || items.length === 0) {
    return null;
  }

  const renderItem = ({ item }: { item: any }) => {
    const p = item.product;
    if (!p) return null;

    const discountPercentage = Math.round(((p.price - item.flash_sale_price) / p.price) * 100);

    return (
      <TouchableOpacity 
        style={styles.itemCard} 
        onPress={() => router.push(`/product/${p.id}`)}
      >
        <Image source={{ uri: p.image_url }} style={styles.itemImage} resizeMode="contain" />
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{discountPercentage}%</Text>
        </View>
        <Text style={styles.itemName} numberOfLines={1}>{p.name}</Text>
        <Text style={styles.flashPrice}>Rp {Number(item.flash_sale_price).toLocaleString('id-ID')}</Text>
        <Text style={styles.originalPrice}>Rp {Number(p.price).toLocaleString('id-ID')}</Text>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${Math.min(100, (item.stock_sold / item.stock_allocated) * 100)}%` }
            ]} 
          />
        </View>
        <Text style={styles.stockText}>Terjual {item.stock_sold}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="flash" size={24} color="#EF4444" />
          <Text style={styles.title}>{flashSale.title}</Text>
        </View>
        
        <View style={styles.timerRow}>
          <View style={styles.timeBox}><Text style={styles.timeText}>{timeLeft.hours}</Text></View>
          <Text style={styles.colon}>:</Text>
          <View style={styles.timeBox}><Text style={styles.timeText}>{timeLeft.minutes}</Text></View>
          <Text style={styles.colon}>:</Text>
          <View style={styles.timeBox}><Text style={styles.timeText}>{timeLeft.seconds}</Text></View>
        </View>
      </View>

      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF1F2', // Light red background
    borderRadius: 16,
    marginVertical: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E11D48',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBox: {
    backgroundColor: '#E11D48',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  timeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  colon: {
    color: '#E11D48',
    fontWeight: '800',
    marginHorizontal: 4,
  },
  listContainer: {
    paddingHorizontal: 12,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 4,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
  },
  discountBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  flashPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EF4444',
  },
  originalPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginBottom: 8,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#EF4444',
  },
  stockText: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
  },
});
