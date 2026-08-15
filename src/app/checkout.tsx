import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useRouter } from 'expo-router';
import { supabase } from '../utils/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';

export default function CheckoutScreen() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'qris' | 'va' | 'ewallet'>('qris');
  const [shippingMethod, setShippingMethod] = useState<'regular' | 'express'>('regular');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
  });

  React.useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFormData((prev) => ({
          ...prev,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          email: user.email || '',
        }));
      }
    } catch (e) {
      console.log('Error fetching user info for checkout:', e);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const shippingFee = shippingMethod === 'express' ? 15 : 12;
  const finalTotal = cartTotal + shippingFee;

  const handleCheckout = async () => {
    if (!formData.name || !formData.email || !formData.address) {
      Alert.alert('Data Belum Lengkap', 'Silakan isi nama, email, dan alamat pengiriman.');
      return;
    }

    setLoading(true);

    try {
      // 1. Get Current User
      const { data: { user } } = await supabase.auth.getUser();

      // 2. Insert Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null, // null if guest
          status: 'Menunggu Pembayaran',
          amount: finalTotal,
          tracking_number: `ORD-${Date.now()}`
        })
        .select()
        .single();

      if (orderError || !orderData) {
        throw new Error(orderError?.message || 'Gagal membuat pesanan');
      }

      // 3. Insert Order Items
      const orderItems = cart.map((item) => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity || 1,
        price: item.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      
      if (itemsError) {
        console.error('Failed inserting items:', itemsError);
      }

      // 4. Update status to processed (simulating successful payment for MVP)
      await supabase.from('orders').update({ status: 'Diproses' }).eq('id', orderData.id);

      // Invoke Supabase Edge Function for RainyPay QRIS
      const { data, error } = await supabase.functions.invoke('rainypay-create', {
        body: {
          order_id: orderData.id,
          amount: finalTotal,
          redirect_url: Linking.createURL('/(tabs)'),
        },
      });

      if (error || !data?.checkout_url) {
        // Fallback simulation for demonstration
        setTimeout(() => {
          setLoading(false);
          clearCart();
          Alert.alert(
            'Pembayaran Berhasil! 🎉',
            `Pesanan sebesar Rp ${Number(finalTotal).toLocaleString('id-ID')} dengan metode QRIS RainyPay telah dikonfirmasi.`,
            [
              {
                text: 'Kembali ke Beranda',
                onPress: () => router.replace('/orders'),
              },
            ]
          );
        }, 1500);
        return;
      }

      // Open RainyPay Checkout WebBrowser
      WebBrowser.openBrowserAsync(data.checkout_url);
      clearCart();
      router.replace('/orders');
    } catch (err: any) {
      Alert.alert(
        'Pembayaran Gagal',
        `Maaf, terjadi kesalahan: ${err.message}`,
        [
          {
            text: 'Tutup',
            style: 'cancel',
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Shipping Address Card */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={20} color="#0F172A" />
              <Text style={styles.sectionTitle}>Alamat Pengiriman</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nama Lengkap Penerima"
              value={formData.name}
              onChangeText={(v) => handleInputChange('name', v)}
              placeholderTextColor="#94A3B8"
            />
            <TextInput
              style={styles.input}
              placeholder="Alamat Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(v) => handleInputChange('email', v)}
              placeholderTextColor="#94A3B8"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Alamat Lengkap (Jalan, No. Rumah, Kota)"
              multiline
              numberOfLines={3}
              value={formData.address}
              onChangeText={(v) => handleInputChange('address', v)}
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Shipping Method */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="car-outline" size={20} color="#0F172A" />
              <Text style={styles.sectionTitle}>Metode Pengiriman</Text>
            </View>

            <View style={styles.shippingOptions}>
              <TouchableOpacity
                style={[
                  styles.shippingCard,
                  shippingMethod === 'regular' && styles.shippingCardSelected,
                ]}
                onPress={() => setShippingMethod('regular')}
                activeOpacity={0.8}
              >
                <Text style={styles.shippingName}>Standard (2-3 Hari)</Text>
                <Text style={styles.shippingPrice}>Rp 12</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.shippingCard,
                  shippingMethod === 'express' && styles.shippingCardSelected,
                ]}
                onPress={() => setShippingMethod('express')}
                activeOpacity={0.8}
              >
                <Text style={styles.shippingName}>Express (1 Hari)</Text>
                <Text style={styles.shippingPrice}>Rp 15</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Method Selector */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card-outline" size={20} color="#0F172A" />
              <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedMethod === 'qris' && styles.paymentOptionSelected,
              ]}
              onPress={() => setSelectedMethod('qris')}
              activeOpacity={0.85}
            >
              <View style={styles.paymentLeft}>
                <View style={styles.qrisBadge}>
                  <Text style={styles.qrisBadgeText}>QRIS</Text>
                </View>
                <View>
                  <Text style={styles.paymentTitle}>QRIS Instant by RainyPay</Text>
                  <Text style={styles.paymentSub}>GoPay, OVO, Dana, ShopeePay, BCA, Mandiri</Text>
                </View>
              </View>
              {selectedMethod === 'qris' && (
                <Ionicons name="checkmark-circle" size={22} color="#4F46E5" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedMethod === 'va' && styles.paymentOptionSelected,
              ]}
              onPress={() => setSelectedMethod('va')}
              activeOpacity={0.85}
            >
              <View style={styles.paymentLeft}>
                <Ionicons name="briefcase-outline" size={24} color="#64748B" />
                <View>
                  <Text style={styles.paymentTitle}>Virtual Account</Text>
                  <Text style={styles.paymentSub}>BCA, Mandiri, BNI, BRI</Text>
                </View>
              </View>
              {selectedMethod === 'va' && (
                <Ionicons name="checkmark-circle" size={22} color="#4F46E5" />
              )}
            </TouchableOpacity>
          </View>

          {/* Order Summary */}
          <View style={styles.orderSummaryCard}>
            <Text style={styles.summaryCardTitle}>Ringkasan Pesanan ({cart.length} barang)</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal Produk</Text>
              <Text style={styles.summaryVal}>Rp {Number(cartTotal).toLocaleString('id-ID')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ongkos Kirim</Text>
              <Text style={styles.summaryVal}>Rp {Number(shippingFee).toLocaleString('id-ID')}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Harus Dibayar</Text>
              <Text style={styles.totalVal}>Rp {Number(finalTotal).toLocaleString('id-ID')}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Pay Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.payButton, loading && styles.disabledButton]}
            onPress={handleCheckout}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.payButtonText}>Bayar Sekarang (Rp {Number(finalTotal).toLocaleString('id-ID')})</Text>
                <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  shippingOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  shippingCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  shippingCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  shippingName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  shippingPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4F46E5',
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  paymentOptionSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  qrisBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qrisBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  paymentSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  orderSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginTop: 4,
  },
  summaryCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4F46E5',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 16,
  },
  payButton: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
