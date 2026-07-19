import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../utils/supabase';

export default function TryOnModal({ visible, onClose, product }) {
  const [personImage, setPersonImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true, // We might need base64 to send to edge function
    });

    if (!result.canceled) {
      setPersonImage(result.assets[0]);
      setResultImage(null);
    }
  };

  const handleTryOn = async () => {
    if (!personImage) {
      Alert.alert('Error', 'Please select a photo of yourself first.');
      return;
    }
    
    setLoading(true);
    setStatusText('Uploading your photo...');
    
    try {
      // 1. Call Supabase Edge Function to initiate Try-On
      const { data: tryOnData, error: tryOnError } = await supabase.functions.invoke('genlook-tryon', {
        body: { 
          product_external_id: product.genlook_external_id,
          product_name: product.name,
          product_image_url: product.image_url,
          image_base64: personImage.base64
        },
      });

      if (tryOnError || !tryOnData?.generationId) {
        throw new Error(tryOnError?.message || 'Failed to start Try-On process');
      }

      setStatusText('Generating your look...');
      const generationId = tryOnData.generationId;

      // 2. Poll the status Edge Function
      let isCompleted = false;
      let attempts = 0;
      
      while (!isCompleted && attempts < 20) { // Max 20 polls ~ 40 seconds
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
        attempts++;
        
        const { data: statusData, error: statusError } = await supabase.functions.invoke('genlook-status', {
          body: { generation_id: generationId },
        });
        
        if (statusError) throw new Error(statusError.message);
        
        if (statusData.status === 'COMPLETED') {
          setResultImage(statusData.resultImageUrl);
          isCompleted = true;
          
          // Optionally save to our `tryons` table if user is logged in
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user) {
             await supabase.from('tryons').insert({
                user_id: sessionData.session.user.id,
                product_id: product.id,
                result_image_url: statusData.resultImageUrl
             });
          }
          
        } else if (statusData.status === 'FAILED') {
          throw new Error('Try-on generation failed.');
        }
      }
      
      if (!isCompleted) {
        throw new Error('Generation timed out. Please try again.');
      }
      
    } catch (error) {
      console.error(error);
      Alert.alert('Try-On Error', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  const handleClose = () => {
    // Reset state on close
    if (!loading) {
      setPersonImage(null);
      setResultImage(null);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Virtual Try-On</Text>
          {!loading && (
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.content}>
          {!resultImage && (
            <>
              <Text style={styles.instruction}>
                Upload a full-body or half-body photo to see how the {product?.name} looks on you.
              </Text>

              <TouchableOpacity style={styles.imageSelector} onPress={pickImage} disabled={loading}>
                {personImage ? (
                  <Image source={{ uri: personImage.uri }} style={styles.previewImage} />
                ) : (
                  <Text style={styles.selectorText}>+ Select Photo</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {resultImage && (
            <View style={styles.resultContainer}>
              <Text style={styles.successText}>✨ Looking great! ✨</Text>
              <Image source={{ uri: resultImage }} style={styles.resultImage} />
            </View>
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000" />
              <Text style={styles.loadingText}>{statusText}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          {!resultImage ? (
            <TouchableOpacity 
              style={[styles.primaryButton, (!personImage || loading) && styles.disabledButton]} 
              onPress={handleTryOn}
              disabled={!personImage || loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Processing...' : 'Generate Try-On'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryButton} onPress={() => setResultImage(null)}>
              <Text style={styles.primaryButtonText}>Try Another Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeText: {
    fontSize: 16,
    color: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  instruction: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageSelector: {
    width: '80%',
    aspectRatio: 3 / 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  selectorText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  resultContainer: {
    alignItems: 'center',
    width: '100%',
    flex: 1,
  },
  successText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  resultImage: {
    width: '90%',
    flex: 1,
    borderRadius: 12,
    resizeMode: 'contain',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
