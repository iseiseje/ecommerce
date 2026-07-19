import { Tabs } from 'expo-router';
import { useCart } from '../../context/CartContext';
import { View, Text, StyleSheet } from 'react-native';

export default function TabLayout() {
  const { cart } = useCart();
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: styles.tabBar,
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Shop',
          tabBarLabel: 'Shop',
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarLabel: 'Cart',
          tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    elevation: 0,
    shadowOpacity: 0,
  },
});
