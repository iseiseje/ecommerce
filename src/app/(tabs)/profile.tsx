import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { supabase } from '../../utils/supabase';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    if (session?.user) {
      fetchTryonHistory(session.user.id);
    } else {
      setLoading(false);
    }
  };

  const fetchTryonHistory = async (userId) => {
    const { data, error } = await supabase
      .from('tryons')
      .select('*, products(name, price)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (!error) {
      setHistory(data || []);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setHistory([]);
  };

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyCard}>
      <Image source={{ uri: item.result_image_url }} style={styles.historyImage} />
      <View style={styles.historyInfo}>
        <Text style={styles.historyProductName}>{item.products?.name || 'Product'}</Text>
        <Text style={styles.historyDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Sign in to view your Try-On history and manage your profile.</Text>
        <TouchableOpacity style={styles.authButton} onPress={() => router.push('/login')}>
          <Text style={styles.authButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emailText}>{user.email}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>My Try-On History</Text>
      
      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No virtual try-ons yet.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContainer}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  authButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  authButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#ff3b30',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 15,
    marginTop: 25,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    width: '48%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  historyImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#eaeaea',
  },
  historyInfo: {
    padding: 10,
  },
  historyProductName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
  },
  historyDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  }
});
