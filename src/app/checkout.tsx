import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useCart } from '../context/CartContext';
import { useRouter } from 'expo-router';
import { supabase } from '../utils/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

export default function CheckoutScreen() {
  const { cartTotal, clearCart } = useCart();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckout = async () => {
    if (!formData.name || !formData.email || !formData.address) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      // Supabase Edge Function to Create Payment
      const { data, error } = await supabase.functions.invoke('rainypay-create', {
        body: { 
          amount: cartTotal,
          redirect_url: Linking.createURL('/(tabs)') // redirect back to app
        },
      });

      if (error || !data?.checkout_url) {
        throw new Error(error?.message || 'Gagal membuat tagihan pembayaran');
      }

      // Open RainyPay Checkout WebBrowser
      const res = await WebBrowser.openBrowserAsync(data.checkout_url);
      
      // Clear cart once payment is initiated
      clearCart();
      Alert.alert('Pembayaran Diproses', 'Silakan periksa halaman pesanan untuk status terbaru.', [
        { text: 'Tutup', onPress: () => router.replace('/(tabs)') }
      ]);

    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Information</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Full Name" 
            value={formData.name}
            onChangeText={(v) => handleInputChange('name', v)}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Email Address" 
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(v) => handleInputChange('email', v)}
          />
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="Shipping Address" 
            multiline
            numberOfLines={3}
            value={formData.address}
            onChangeText={(v) => handleInputChange('address', v)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
          <View style={styles.qrisBox}>
            <Text style={styles.qrisText}>QRIS by RainyPay</Text>
            <Text style={styles.qrisDesc}>Bayar instan pakai GoPay, OVO, Dana, LinkAja, BCA, dll.</Text>
          </View>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.summaryText}>Order Total: <Text style={styles.totalAmount}>Rp {cartTotal.toLocaleString('id-ID')}</Text></Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.payButton, loading && styles.disabledButton]} 
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Bayar Rp {cartTotal.toLocaleString('id-ID')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eaeaea',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  summarySection: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 18,
    color: '#333',
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#000',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    paddingBottom: 40,
  },
  payButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  qrisBox: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#4285F4',
    backgroundColor: '#E8F0FE',
    borderRadius: 8,
  },
  qrisText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  qrisDesc: {
    fontSize: 14,
    color: '#555',
  }
});
