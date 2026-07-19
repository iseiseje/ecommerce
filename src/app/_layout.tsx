import { Stack } from 'expo-router';
import { CartProvider } from '../context/CartContext';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <CartProvider>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: '#000',
            headerTitleStyle: { fontWeight: 'bold' },
            contentStyle: { backgroundColor: '#f9f9f9' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="product/[id]" options={{ title: 'Product Details' }} />
          <Stack.Screen name="checkout" options={{ title: 'Checkout', presentation: 'modal' }} />
          <Stack.Screen name="login" options={{ title: 'Login', presentation: 'modal' }} />
        </Stack>
      </View>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
