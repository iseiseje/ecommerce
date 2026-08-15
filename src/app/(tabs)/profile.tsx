import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { supabase } from '../../utils/supabase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';
import { Linking } from 'react-native';



export default function ProfileScreen() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  const { favoritesCount } = useFavorites();
  const { cartItemCount } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (user?.id) {
      fetchUserOrders(user.id);
      fetchTryonHistory(user.id);
    } else {
      setOrdersCount(0);
      setActiveOrdersCount(0);
      setHistory([]);
    }
  }, [user]);

  const fetchUserOrders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, status')
        .eq('user_id', userId);

      if (!error && data) {
        setOrdersCount(data.length);
        const active = data.filter(
          (o) => o.status !== 'Selesai' && o.status !== 'Dibatalkan'
        ).length;
        setActiveOrdersCount(active);
      }
    } catch (e) {
      console.error('Error fetching user orders:', e);
    }
  };

  const fetchTryonHistory = async (userId: string) => {
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('tryons')
        .select('*, products(name, price)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error) {
        setHistory(data || []);
      }
    } catch (e) {
      console.error('Error fetching tryon history:', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const getVipBadgeText = () => {
    if (ordersCount >= 5) return 'VIP GOLD';
    if (ordersCount >= 2) return 'GOLD MEMBER';
    if (ordersCount >= 1) return 'SILVER MEMBER';
    return 'MEMBER';
  };

  const menuItems = [
    {
      id: 'orders',
      title: 'Pesanan Saya',
      icon: 'cube-outline',
      route: '/orders',
      badge: activeOrdersCount > 0 ? `${activeOrdersCount} Aktif` : undefined,
    },
    { id: 'address', title: 'Alamat Pengiriman', icon: 'location-outline', route: '/address' },
    { id: 'payment', title: 'Metode Pembayaran', icon: 'card-outline' },
    { id: 'tryon', title: 'Galeri Virtual Try-On', icon: 'sparkles-outline', route: '/tryon-gallery' },
    { id: 'promos', title: 'Promo', icon: 'pricetag-outline', route: '/promos' },
    { id: 'help', title: 'Hubungi CS (WhatsApp)', icon: 'logo-whatsapp', isExternal: true },
  ];

  const handleMenuPress = (item: any) => {
    if (item.isExternal && item.id === 'help') {
      Linking.openURL('whatsapp://send?phone=+6285805449214');
    } else if (item.route) {
      router.push(item.route);
    } else {
      alert(`Fitur ${item.title} belum tersedia.`);
    }
  };

  if (authLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.profileHeaderCard}>
          <Image
            source={{
              uri: user?.user_metadata?.avatar_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            }}
            style={styles.avatarImage}
          />

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>
                {user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Guest User')}
              </Text>
              {user && (
                <View style={styles.vipBadge}>
                  <Text style={styles.vipText}>{getVipBadgeText()}</Text>
                </View>
              )}
            </View>
            <Text style={styles.userEmail}>{user ? user.email : 'Belum masuk akun'}</Text>
          </View>

          {user ? (
            <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/login')}>
              <Text style={styles.signInBtnText}>Masuk</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Row */}
        <TouchableOpacity style={styles.statsRow} onPress={() => router.push('/orders')}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{ordersCount}</Text>
            <Text style={styles.statLabel}>Pesanan</Text>
          </View>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statBox} onPress={() => router.push('/(tabs)/favorites' as any)}>
            <Text style={styles.statVal}>{favoritesCount}</Text>
            <Text style={styles.statLabel}>Wishlist</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statBox} onPress={() => router.push('/cart')}>
            <Text style={styles.statVal}>{cartItemCount}</Text>
            <Text style={styles.statLabel}>Keranjang</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Pengaturan Akun</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconCircle}>
                  <Ionicons name={item.icon as any} size={20} color="#0F172A" />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>

              <View style={styles.menuRight}>
                {item.badge ? (
                  <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeText}>{item.badge}</Text>
                  </View>
                ) : null}
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Virtual Try-On History Section */}
        {user && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Riwayat Virtual Try-On ✨</Text>

            {historyLoading ? (
              <ActivityIndicator color="#0F172A" style={{ marginVertical: 20 }} />
            ) : history.length === 0 ? (
              <View style={styles.emptyHistoryBox}>
                <Ionicons name="sparkles-outline" size={32} color="#94A3B8" />
                <Text style={styles.emptyHistoryText}>Belum ada sampel Virtual Try-On.</Text>
                <Text style={styles.emptyHistorySub}>Buka detail produk dan coba pakaianmu secara virtual!</Text>
              </View>
            ) : (
              <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
                renderItem={({ item }) => (
                  <View style={styles.historyCard}>
                    <Image source={{ uri: item.result_image_url }} style={styles.historyImage} />
                    <View style={styles.historyMeta}>
                      <Text style={styles.historyName} numberOfLines={1}>
                        {item.products?.name || 'Produk'}
                      </Text>
                      <Text style={styles.historyDate}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        )}
      </ScrollView>
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
  },
  scrollPadding: {
    padding: 16,
    paddingBottom: 40,
  },
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  vipBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vipText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  signOutBtn: {
    padding: 8,
  },
  signInBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  signInBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  menuContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  menuBadgeText: {
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '700',
  },
  historySection: {
    marginTop: 8,
  },
  emptyHistoryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyHistoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
  },
  emptyHistorySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  historyCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#F1F5F9',
  },
  historyMeta: {
    padding: 8,
  },
  historyName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  historyDate: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
});
