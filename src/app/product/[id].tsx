import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../utils/supabase';
import { useCart } from '../../context/CartContext';
import TryOnModal from '../../components/TryOnModal';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTryOnVisible, setTryOnVisible] = useState(false);
  
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) {
      console.error('Error fetching product:', error);
      Alert.alert('Error', 'Could not load product details.');
      router.back();
    } else {
      setProduct(data);
    }
    setLoading(false);
  };

  const handleAddToCart = () => {
    addToCart(product);
    Alert.alert('Success', 'Added to cart!', [
      { text: 'Keep Shopping', style: 'cancel' },
      { text: 'Go to Cart', onPress: () => router.push('/cart') }
    ]);
  };

  if (loading || !product) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: product.image_url }} style={styles.productImage} />
        
        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.tryOnButton} onPress={() => setTryOnVisible(true)}>
          <Text style={styles.tryOnButtonText}>✨ Virtual Try-On</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      <TryOnModal 
        visible={isTryOnVisible} 
        onClose={() => setTryOnVisible(false)} 
        product={product} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  productImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#eaeaea',
  },
  detailsContainer: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  productDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    paddingBottom: 30, // for safe area
  },
  tryOnButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  tryOnButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
