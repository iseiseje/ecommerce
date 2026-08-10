import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <CartProvider>
          <View style={styles.container}>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: '#FFFFFF' },
                headerTintColor: '#0F172A',
                headerTitleStyle: { fontWeight: '700', fontSize: 18 },
                contentStyle: { backgroundColor: '#F8FAFC' },
                headerShadowVisible: false,
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="product/[id]" options={{ title: 'Detail Produk', headerBackTitle: 'Kembali' }} />
              <Stack.Screen name="checkout" options={{ title: 'Pembayaran & QRIS', presentation: 'modal' }} />
              <Stack.Screen name="login" options={{ title: 'Masuk Akun', presentation: 'modal' }} />
            </Stack>
          </View>
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
