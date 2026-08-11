import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../utils/supabase';

export default function AddressScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Silakan Login', 'Anda harus login untuk melihat alamat.', [
          { text: 'Kembali', onPress: () => router.back() }
        ]);
        return;
      }

      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });

      if (error) {
        throw error;
      }

      setAddresses(data || []);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', 'Gagal memuat alamat.');
    } finally {
      setLoading(false);
    }
  };

  const handleMakePrimary = async (id: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Unset existing primary
      await supabase
        .from('user_addresses')
        .update({ is_primary: false })
        .eq('user_id', user.id);

      // Set new primary
      const { error } = await supabase
        .from('user_addresses')
        .update({ is_primary: true })
        .eq('id', id);

      if (error) throw error;
      
      fetchAddresses(); // Refresh list
    } catch (e: any) {
      Alert.alert('Error', 'Gagal mengubah alamat utama.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alamat Pengiriman</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={[styles.addressCard, item.is_primary && styles.addressCardPrimary]}>
              <View style={styles.cardHeader}>
                <View style={styles.labelRow}>
                  <Ionicons name={item.label?.toLowerCase() === 'rumah' ? 'home' : 'business'} size={16} color={item.is_primary ? '#4F46E5' : '#64748B'} />
                  <Text style={styles.addressLabel}>{item.label}</Text>
                  {item.is_primary && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>Utama</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity>
                  <Text style={styles.editBtn}>Ubah</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.addressText}>{item.full_address}</Text>

              {!item.is_primary && (
                <TouchableOpacity style={styles.makePrimaryBtn} onPress={() => handleMakePrimary(item.id)}>
                  <Text style={styles.makePrimaryText}>Jadikan Alamat Utama</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Belum ada alamat</Text>
              <Text style={styles.emptySub}>Tambahkan alamat pengiriman Anda</Text>
            </View>
          }
          ListFooterComponent={() => (
            <TouchableOpacity style={styles.addAddressBtn} onPress={() => Alert.alert('Segera Hadir', 'Form tambah alamat akan segera hadir.')}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addAddressText}>Tambah Alamat Baru</Text>
            </TouchableOpacity>
          )}
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
  addressCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  addressCardPrimary: { borderColor: '#4F46E5', backgroundColor: '#F8FAFF' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  primaryBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  primaryBadgeText: { fontSize: 10, fontWeight: '800', color: '#4F46E5' },
  editBtn: { fontSize: 13, fontWeight: '600', color: '#4F46E5' },
  addressText: { fontSize: 14, color: '#475569', lineHeight: 20 },
  makePrimaryBtn: { marginTop: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center' },
  makePrimaryText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  addAddressBtn: { flexDirection: 'row', backgroundColor: '#0F172A', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  addAddressText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#64748B', marginTop: 4 },
});
