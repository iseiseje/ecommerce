import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  CategoryItem,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService';

interface CategoryAdminModalProps {
  visible: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  onRefresh: () => void;
}

export const CategoryAdminModal: React.FC<CategoryAdminModalProps> = ({
  visible,
  onClose,
  categories,
  onRefresh,
}) => {
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏷️');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEditingCategory(null);
    setName('');
    setIcon('🏷️');
  };

  const handleStartEdit = (item: CategoryItem) => {
    setEditingCategory(item);
    setName(item.name);
    setIcon(item.icon || '🏷️');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Form Belum Lengkap', 'Silakan masukkan nama kategori.');
      return;
    }

    setLoading(true);
    try {
      if (editingCategory) {
        // Edit existing category in Supabase
        await updateCategory(editingCategory.id, name.trim(), icon.trim());
        Alert.alert('Sukses 🎉', `Kategori "${name}" berhasil diperbarui!`);
      } else {
        // Add new category to Supabase
        await addCategory(name.trim(), icon.trim());
        Alert.alert('Sukses 🎉', `Kategori "${name}" berhasil ditambahkan!`);
      }
      resetForm();
      onRefresh();
    } catch (err: any) {
      Alert.alert('Gagal Menyimpan', err?.message || 'Terjadi kesalahan saat menyimpan ke Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (item: CategoryItem) => {
    Alert.alert(
      'Hapus Kategori',
      `Apakah Anda yakin ingin menghapus kategori "${item.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const success = await deleteCategory(item.id);
            if (success) {
              Alert.alert('Terhapus', `Kategori "${item.name}" telah dihapus.`);
              onRefresh();
            } else {
              Alert.alert('Gagal', 'Tidak dapat menghapus kategori dari Supabase.');
            }
            setLoading(false);
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="folder-open-outline" size={22} color="#0F172A" />
              <Text style={styles.headerTitle}>Kelola Kategori Produk</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
            {/* Add / Edit Form Card */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                {editingCategory ? '✏️ Edit Kategori' : '➕ Tambah Kategori Baru'}
              </Text>

              <View style={styles.inputRow}>
                <View style={styles.iconInputBox}>
                  <Text style={styles.label}>Ikon / Emoji</Text>
                  <TextInput
                    style={styles.iconInput}
                    value={icon}
                    onChangeText={setIcon}
                    placeholder="🏷️"
                    maxLength={4}
                  />
                </View>

                <View style={styles.nameInputBox}>
                  <Text style={styles.label}>Nama Kategori</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Contoh: Jaket, Sneaker, Topi"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              <View style={styles.formActionRow}>
                {editingCategory && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={resetForm} disabled={loading}>
                    <Text style={styles.cancelBtnText}>Batal</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.saveBtn, loading && styles.disabledBtn]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>
                      {editingCategory ? 'Simpan Perubahan' : 'Tambah Ke Supabase'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* List of Existing Categories */}
            <Text style={styles.listTitle}>Daftar Kategori Terdaftar ({categories.length})</Text>

            {categories.map((item) => (
              <View key={item.id} style={styles.categoryCard}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryEmoji}>{item.icon || '🏷️'}</Text>
                  <View>
                    <Text style={styles.categoryName}>{item.name}</Text>
                    <Text style={styles.categorySlug}>slug: {item.slug}</Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => handleStartEdit(item)}>
                    <Ionicons name="pencil" size={16} color="#4F46E5" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  scrollPadding: {
    padding: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  iconInputBox: {
    width: 70,
  },
  nameInputBox: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  iconInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 10,
    fontSize: 18,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 13,
  },
  saveBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  categoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  categorySlug: {
    fontSize: 11,
    color: '#94A3B8',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
