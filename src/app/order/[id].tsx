import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../utils/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Manually fetch products for order_items if no foreign key exists
      if (data && data.order_items) {
        for (let item of data.order_items) {
          if (item.product_id) {
            const { data: productData } = await supabase
              .from('products')
              .select('name, image_url')
              .eq('id', item.product_id)
              .single();
            if (productData) {
              item.product = productData;
            }
          }
        }
      }

      setOrder(data);
    } catch (err) {
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBg = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'diproses': return '#DBEAFE'; // blue
      case 'dikirim': return '#FEF9C3'; // yellow
      case 'selesai': return '#DCFCE7'; // green
      case 'dibatalkan': return '#FEE2E2'; // red
      default: return '#F1F5F9'; // gray
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'diproses': return '#1D4ED8';
      case 'dikirim': return '#A16207';
      case 'selesai': return '#15803D';
      case 'dibatalkan': return '#B91C1C';
      default: return '#475569';
    }
  };

  const formatStatus = (status: string) => {
    if (status?.toLowerCase() === 'paid') return 'Diproses';
    return status;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Pesanan</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
          <Text style={{ marginTop: 12, color: '#64748B' }}>Pesanan tidak ditemukan.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pesanan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.orderIdText}>{order.tracking_number || `ORD-${order.id}`}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusBg(order.status) }]}>
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {formatStatus(order.status)}
              </Text>
            </View>
          </View>
          <Text style={styles.dateText}>Dipesan pada {formatDate(order.created_at)}</Text>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color="#0F172A" />
            <Text style={styles.sectionTitle}>Alamat Pengiriman</Text>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addressName}>{order.shipping_address?.split('\\n')[0] || 'Pembeli'}</Text>
            <Text style={styles.addressDetail}>{order.shipping_address}</Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cube-outline" size={20} color="#0F172A" />
            <Text style={styles.sectionTitle}>Daftar Produk</Text>
          </View>
          
          {order.order_items?.map((item: any) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.imageBox}>
                {item.product?.image_url ? (
                  <Image source={{ uri: item.product.image_url }} style={styles.itemImage} resizeMode="cover" />
                ) : (
                  <Ionicons name="image-outline" size={24} color="#94A3B8" />
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product?.name || 'Produk tidak tersedia'}
                </Text>
                <View style={styles.itemPriceRow}>
                  <Text style={styles.itemPrice}>Rp {Number(item.price).toLocaleString('id-ID')}</Text>
                  <Text style={styles.itemQty}>x{item.quantity}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={20} color="#0F172A" />
            <Text style={styles.sectionTitle}>Rincian Pembayaran</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Belanja</Text>
            <Text style={styles.summaryValue}>Rp {Number(order.amount).toLocaleString('id-ID')}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  scrollContent: { padding: 16 },
  
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderIdText: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  dateText: { fontSize: 13, color: '#64748B' },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },

  addressBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 },
  addressName: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  addressDetail: { fontSize: 13, color: '#475569', lineHeight: 20 },

  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
  },
  imageBox: {
    width: 60,
    height: 60,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  itemImage: { width: '100%', height: '100%' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
  itemPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#4F46E5' },
  itemQty: { fontSize: 12, color: '#64748B', fontWeight: '600' },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: { fontSize: 14, color: '#64748B' },
  summaryValue: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
});
