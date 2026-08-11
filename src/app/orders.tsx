import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../utils/supabase';

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Silakan Login', 'Anda harus login untuk melihat riwayat pesanan.', [
          { text: 'Kembali', onPress: () => router.back() }
        ]);
        return;
      }

      // Fetch orders with their items
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setOrders(data || []);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', 'Gagal memuat pesanan.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Dikirim': return '#3B82F6';
      case 'Selesai': return '#10B981';
      case 'Diproses': return '#F59E0B';
      case 'Menunggu Pembayaran': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Dikirim': return '#EFF6FF';
      case 'Selesai': return '#ECFDF5';
      case 'Diproses': return '#FFFBEB';
      case 'Menunggu Pembayaran': return '#FEF2F2';
      default: return '#F1F5F9';
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pesanan Saya</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const itemCount = item.order_items ? item.order_items.reduce((acc: number, curr: any) => acc + curr.quantity, 0) : 0;
            return (
              <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>{item.tracking_number || `ORD-${item.id}`}</Text>
                    <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusBg(item.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                  </View>
                </View>

                <View style={styles.orderDivider} />

                <View style={styles.orderDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Total Harga</Text>
                    <Text style={styles.detailValue}>${Number(item.total_amount).toFixed(2)}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Jumlah Barang</Text>
                    <Text style={styles.detailValue}>{itemCount} Produk</Text>
                  </View>
                </View>

                {item.tracking_number && item.status === 'Dikirim' && (
                  <View style={styles.trackingBox}>
                    <Ionicons name="bus-outline" size={16} color="#64748B" />
                    <Text style={styles.trackingText}>Resi: {item.tracking_number}</Text>
                  </View>
                )}

                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>Lihat Detail</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Belum ada pesanan</Text>
              <Text style={styles.emptySub}>Ayo mulai belanja sekarang!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  listContainer: { padding: 16 },
  orderCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  orderDate: { fontSize: 12, color: '#64748B', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  orderDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 14 },
  orderDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 11, color: '#64748B' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginTop: 2 },
  trackingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginTop: 14, gap: 8 },
  trackingText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  actionBtn: { marginTop: 16, backgroundColor: '#0F172A', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  actionBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#64748B', marginTop: 4 },
});
