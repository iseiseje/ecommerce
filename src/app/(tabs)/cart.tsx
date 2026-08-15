import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { EmptyState } from '../../components/EmptyState';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../utils/supabase';

export default function CartScreen() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const router = useRouter();

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Masukkan kode voucher terlebih dahulu');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', promoCode.trim().toUpperCase())
        .single();

      if (error || !data) {
        Alert.alert('Voucher Tidak Valid', 'Kode voucher tidak ditemukan atau sudah tidak berlaku.');
        setDiscountAmount(0);
        return;
      }

      // Validations
      const now = new Date().toISOString();
      if (data.valid_from && data.valid_from > now) {
        Alert.alert('Voucher Belum Aktif', 'Kupon ini belum bisa digunakan.');
        return;
      }
      if (data.valid_until && data.valid_until < now) {
        Alert.alert('Voucher Kedaluwarsa', 'Masa berlaku kupon ini sudah habis.');
        return;
      }
      if (data.usage_limit !== null && data.used_count >= data.usage_limit) {
        Alert.alert('Voucher Habis', 'Kuota penggunaan kupon ini sudah habis.');
        return;
      }
      if (data.min_purchase && cartTotal < Number(data.min_purchase)) {
        Alert.alert('Gagal', `Minimal pembelian untuk menggunakan kupon ini adalah Rp ${Number(data.min_purchase).toLocaleString('id-ID')}`);
        return;
      }

      let disc = 0;
      if (data.discount_type === 'percentage') {
        disc = cartTotal * (Number(data.discount_value) / 100);
        if (data.max_discount && disc > Number(data.max_discount)) {
          disc = Number(data.max_discount);
        }
      } else {
        disc = Number(data.discount_value);
      }

      setDiscountAmount(disc);
      Alert.alert('Sukses!', 'Voucher berhasil dipasang!');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const shippingCost = cart.length > 0 ? 12 : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount + shippingCost);

  const renderCartItem = ({ item }: { item: any }) => {
    const itemKey = item.cartKey || item.id;
    return (
      <View style={styles.cartCard}>
        <Image source={{ uri: item.image_url }} style={styles.itemImage} />
        
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          
          <View style={styles.optionsRow}>
            {item.selectedColor && (
              <View style={styles.optionTag}>
                <Text style={styles.optionText}>{item.selectedColor}</Text>
              </View>
            )}
            {item.selectedSize && (
              <View style={styles.optionTag}>
                <Text style={styles.optionText}>Size {item.selectedSize}</Text>
              </View>
            )}
          </View>

          <Text style={styles.itemPrice}>Rp {Number(item.price).toLocaleString('id-ID')}</Text>
        </View>

        {/* Quantity Controls & Delete */}
        <View style={styles.rightColumn}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => removeFromCart(itemKey)}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>

          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => updateQuantity(itemKey, -1)}
            >
              <Ionicons name="remove" size={14} color="#0F172A" />
            </TouchableOpacity>

            <Text style={styles.qtyText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => updateQuantity(itemKey, 1)}
            >
              <Ionicons name="add" size={14} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState
          icon="cart-outline"
          title="Keranjang Belanja Kosong"
          subtitle="Sepertinya kamu belum memasukkan barang apapun ke dalam keranjang."
          buttonText="Mulai Belanja"
          onButtonPress={() => router.push('/(tabs)')}
        />
      </SafeAreaView>
    );
  }

  const renderFooter = () => (
    <View style={styles.summaryContainer}>
      {/* Promo Code Box */}
      <Text style={styles.summaryTitle}>Voucher & Kupon Diskon</Text>
      <View style={styles.promoRow}>
        <TextInput
          style={styles.promoInput}
          placeholder="Masukkan kode promo (ex: DISCOUNT10)"
          value={promoCode}
          onChangeText={setPromoCode}
          placeholderTextColor="#94A3B8"
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.applyBtn} onPress={handleApplyPromo}>
          <Text style={styles.applyBtnText}>Gunakan</Text>
        </TouchableOpacity>
      </View>

      {/* Cost Details */}
      <View style={styles.breakdownCard}>
        <View style={styles.breakdownRow}>
          <Text style={styles.label}>Subtotal Produk</Text>
          <Text style={styles.value}>Rp {Number(cartTotal).toLocaleString('id-ID')}</Text>
        </View>

        {discountAmount > 0 && (
          <View style={styles.breakdownRow}>
            <Text style={styles.labelDiscount}>Diskon Voucher</Text>
            <Text style={styles.valueDiscount}>-Rp {Number(discountAmount).toLocaleString('id-ID')}</Text>
          </View>
        )}

        <View style={styles.breakdownRow}>
          <Text style={styles.label}>Estimasi Pengiriman</Text>
          <Text style={styles.value}>Rp {Number(shippingCost).toLocaleString('id-ID')}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.breakdownRow}>
          <Text style={styles.totalLabel}>Total Pembayaran</Text>
          <Text style={styles.totalValue}>Rp {Number(finalTotal).toLocaleString('id-ID')}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={cart}
          keyExtractor={(item) => item.cartKey || String(item.id)}
          renderItem={renderCartItem}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
        />

        {/* Sticky Checkout Bar */}
        <View style={styles.stickyFooter}>
          <View>
            <Text style={styles.footerTotalLabel}>Total Harga</Text>
            <Text style={styles.footerTotalVal}>Rp {Number(finalTotal).toLocaleString('id-ID')}</Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => router.push('/checkout')}
            activeOpacity={0.85}
          >
            <Text style={styles.checkoutBtnText}>Proses Pembayaran</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
  listPadding: {
    padding: 16,
    paddingBottom: 110,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  itemImage: {
    width: 75,
    height: 75,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  optionTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  optionText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 75,
  },
  deleteButton: {
    padding: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
    gap: 8,
  },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 16,
    textAlign: 'center',
  },
  summaryContainer: {
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  promoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#0F172A',
  },
  applyBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: '#64748B',
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  labelDiscount: {
    fontSize: 13,
    color: '#10B981',
  },
  valueDiscount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
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
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4F46E5',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  footerTotalLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  footerTotalVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  checkoutBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
