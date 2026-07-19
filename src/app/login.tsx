import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../utils/supabase';

// Necessary for Expo OAuth flow
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert('Sign In Failed', error.message);
    } else {
      router.back();
    }
    setLoading(false);
  };

  const handleEmailSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else {
      Alert.alert('Success', 'Check your email for the confirmation link.');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const redirectUrl = Linking.createURL('/');
      // Tambahkan baris ini sementara agar Anda bisa melihat URL yang dihasilkan:
      console.log('My Redirect URL:', redirectUrl);
      Alert.alert('Redirect URL', `Masukkan ini ke Supabase:\n\n${redirectUrl}**\n\nAtau ganti Site URL Anda jadi ini sementara.`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        
        if (res.type === 'success' && res.url) {
          // Parse the access token from the URL fragment (e.g. #access_token=...)
          const urlObj = new URL(res.url.replace('#', '?'));
          const access_token = urlObj.searchParams.get('access_token');
          const refresh_token = urlObj.searchParams.get('refresh_token');
          
          if (access_token && refresh_token) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (sessionError) throw sessionError;
            router.replace('/');
          }
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Google Sign In Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleEmailSignIn} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Sign In</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleEmailSignUp} disabled={loading}>
          <Text style={styles.secondaryButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.divider} />
      </View>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={loading}>
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      <Text style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'gray' }}>
        Redirect URL Anda: {Linking.createURL('/')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 40,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 20,
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
  primaryButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  secondaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#eaeaea',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#888',
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
