import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../utils/supabase';

export default function PromosScreen() {
  const router = useRouter();
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromos();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promos' }, () => {
        fetchPromos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('promos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching promos:', error);
      } else {
        setPromos(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderPromo = ({ item }: { item: any }) => {
    const isExpired = item.valid_until && new Date(item.valid_until) < new Date();

    return (
      <View style={[styles.promoCard, isExpired && styles.promoCardExpired]}>
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={styles.promoImage} />
        )}
        <View style={styles.promoContent}>
          <View style={styles.promoHeader}>
            <Text style={styles.promoTitle}>{item.title}</Text>
            {item.discount_percent ? (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{item.discount_percent}% OFF</Text>
              </View>
            ) : null}
          </View>

          {item.description ? (
            <Text style={styles.promoDesc}>{item.description}</Text>
          ) : null}

          <View style={styles.promoFooter}>
            {item.discount_code ? (
              <View style={styles.codeBox}>
                <Ionicons name="ticket-outline" size={14} color="#4F46E5" />
                <Text style={styles.codeText}>{item.discount_code}</Text>
              </View>
            ) : <View />}
            
            {item.valid_until ? (
              <Text style={[styles.validUntil, isExpired && { color: '#EF4444' }]}>
                {isExpired ? 'Kedaluwarsa' : `S/d ${new Date(item.valid_until).toLocaleDateString('id-ID')}`}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promo Menarik</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && promos.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      ) : promos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="pricetags-outline" size={64} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>Belum Ada Promo</Text>
          <Text style={styles.emptyDesc}>Saat ini belum ada promo yang tersedia. Cek lagi nanti ya!</Text>
        </View>
      ) : (
        <FlatList
          data={promos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={renderPromo}
          refreshing={loading}
          onRefresh={fetchPromos}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  listContainer: {
    padding: 16,
  },
  promoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  promoCardExpired: {
    opacity: 0.6,
  },
  promoImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#F1F5F9',
  },
  promoContent: {
    padding: 16,
  },
  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  promoTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  promoDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  promoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
  },
  codeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    letterSpacing: 0.5,
  },
  validUntil: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  }
});
